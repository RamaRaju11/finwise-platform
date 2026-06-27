/* BizScale Auth — Supabase wrapper loaded by every page */
(function(){
  var SUPA_URL = 'https://ugtfdtdbegdjqrdtplkg.supabase.co';
  var SUPA_KEY = 'sb_publishable_MT6Yw204o8Ho5nY-82IvkA_Ys_00yGO';
  var STRIPE_PK = 'pk_test_51TOB9eKNBOdyPhkYhqJOMRpx2fctlIgIkQJNidp1VzBrq7TvPC1G7YjT5nBX9Hu70JqFKl9UA5c94tSQ1SA0ouVD000z5nqG6g';

  /* Keys that belong to one user — must be wiped when user changes */
  var USER_KEYS = [
    'fw_profile','fw_profiles','fw_active_idx',
    'fw_recent','fw_onboarded','fw_biz_profile',
    'fw_starter','fw_pro','fw_advisor','fw_ref',
    'fw_checkup','fw_score_history','fw_tax_payments_'+new Date().getFullYear(),
    'fw_grant_tracker','fw_bills','fw_savings_goals','fw_invoices',
    /* Tool-specific saved inputs — stale entries from a previous user
       must NOT bleed into the next user's session */
    'fw_ldse','fw_cash_runway','fw_breakeven','fw_emi_calc','fw_whatif',
    'fw_monthly_snapshots','fw_last_checkup','fw_loan_refinance','fw_debt_center'
  ];
  function _clearUserData(){
    USER_KEYS.forEach(function(k){ localStorage.removeItem(k); });
  }

  /* ── Public API ── */
  window.fwAuth = {
    client     : null,
    user       : null,
    profile    : null,
    plan       : 'free',
    onTrial    : false,
    trialEndsAt: null,
    ready      : false,
    _cbs       : [],

    /* call once per page — fires cb when session is known */
    init: function(cb){
      if(this.ready){ if(cb) cb(); return; }
      if(cb) this._cbs.push(cb);
      if(this.client) return; /* already initialising */
      var self = this;
      if(window.supabase && window.supabase.createClient){
        self._setup();
      } else {
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        s.onload = function(){ self._setup(); };
        s.onerror = function(){ self._done(); };
        document.head.appendChild(s);
      }
    },

    _setup: function(){
      var self = this;
      this.client = window.supabase.createClient(SUPA_URL, SUPA_KEY);
      this.client.auth.getSession().then(function(r){
        var session = r.data && r.data.session;
        if(session){
          self.user = session.user;
          self._loadProfile();
        } else {
          self._done();
        }
      }).catch(function(){ self._done(); });

      /* keep plan in sync across tab changes */
      this.client.auth.onAuthStateChange(function(event, session){
        if(event === 'SIGNED_OUT'){ self.user=null; self.plan='free'; self.profile=null; self.onTrial=false; }
        if(event === 'SIGNED_IN' && session){ self.user=session.user; self._loadProfile(); }
      });
    },

    _loadProfile: function(){
      var self = this;
      this.client.from('profiles').select('*').eq('id', this.user.id).single()
        .then(function(r){
          if(r.data){
            self.profile = r.data;
            var plan = r.data.plan || 'free';
            /* Check active trial — grants starter access to free users */
            self.onTrial = false;
            self.trialEndsAt = null;
            if(plan === 'free' && r.data.trial_ends_at){
              var trialEnd = new Date(r.data.trial_ends_at);
              if(trialEnd > new Date()){
                plan = r.data.trial_plan || 'starter';
                self.onTrial = true;
                self.trialEndsAt = trialEnd;
              }
            }
            self.plan = plan;
            /* Auto-downgrade when trial expires mid-session */
            if(self.onTrial && self.trialEndsAt){
              var msLeft = self.trialEndsAt - new Date();
              if(msLeft > 0 && msLeft < 24 * 60 * 60 * 1000){
                setTimeout(function(){
                  self.plan = 'free';
                  self.onTrial = false;
                  try{ window.dispatchEvent(new CustomEvent('fw:trial-expired')); }catch(e){}
                }, msLeft + 500);
              }
            }
          }
          /* Supabase is the source of truth — overwrite localStorage on every
             login so stale cached values can't drift from the backend. */
          if(r.data && r.data.biz_profile){
            try{
              var bp = JSON.parse(r.data.biz_profile);
              localStorage.setItem('fw_profile', r.data.biz_profile);
              localStorage.setItem('fw_biz_profile', JSON.stringify({
                businessName: bp.bizName, state: bp.state, industry: bp.industry,
                employees: bp.employees, businessAge: parseFloat(bp.yearsInBusiness)||0,
                country: bp.country || 'USA', annualRevenue:(bp.rev||0)*12,
                specialCategories:(bp.ownerCategory||[]).map(function(c){return c.replace('-owned','');}),
                savedAt: new Date().toISOString()
              }));
              localStorage.setItem('fw_profiles', JSON.stringify([{
                id:'p1', name:bp.bizName||'My Business', bizName:bp.bizName,
                industry:bp.industry, rev:bp.rev, exp:bp.exp, emi:bp.emi,
                reserve:bp.reserve, loan:bp.loan, employees:bp.employees,
                state:bp.state, rate:10, tenure:36
              }]));
              localStorage.setItem('fw_active_idx','0');
              if(bp.country === 'India') localStorage.setItem('BizSco_currency','INR');
              else localStorage.setItem('BizSco_currency','USD');
              /* NOTE: do not touch fw_onboarded / fw_setup_done here — those
                 are user-flow flags. Edit-Profile links rely on being able
                 to clear them before navigating to onboarding.html. */
            }catch(e){}
          }

          /* Clear stale data only when a DIFFERENT user signs in */
          var storedUid = localStorage.getItem('fw_uid');
          if(storedUid && storedUid !== self.user.id){
            _clearUserData();
          }
          localStorage.setItem('fw_uid', self.user.id);

          /* V3: Debt Center is the source of truth for itemised debt.
             If the user has at least one ACTIVE loan tracked, fw_profile.emi
             becomes the sum of those active EMIs. If Debt Center is empty,
             the user-typed aggregate from onboarding remains authoritative.

             Sanity guard: exclude any loan whose minPay clearly cannot be
             a real monthly EMI. Bad data from earlier testing (e.g. balance
             pasted into the minPay field) used to inflate profile.emi by
             10-100x, which broke every downstream tool. Skipped loans are
             logged for the Debt Center UI to flag. */
          try {
            var loansArr = JSON.parse(localStorage.getItem('fw_loans') || '[]');
            var prof = JSON.parse(localStorage.getItem('fw_profile') || '{}');
            var revLimit = parseFloat(prof && prof.rev) || 0;
            var bad = [];
            var activeEmi = loansArr
              .filter(function(L){ return L.status === 'active' || !L.status; })
              .reduce(function(sum, L){
                var pay = parseFloat(L.minPay) || 0;
                var bal = parseFloat(L.balance) || 0;
                /* implausible cases: EMI > 50% of revenue, OR > 20% of balance */
                if ((revLimit > 0 && pay > revLimit * 0.5) ||
                    (bal > 0 && pay > bal * 0.2)) {
                  bad.push({id: L.id, name: L.name, minPay: pay, balance: bal});
                  return sum;
                }
                return sum + pay;
              }, 0);
            /* expose what got skipped so Debt Center can warn the user */
            localStorage.setItem('fw_emi_skipped', JSON.stringify(bad));
            if (activeEmi > 0) {
              if (prof && prof.bizName) {
                prof.emi = activeEmi;
                prof.emiSource = 'debt_center';
                localStorage.setItem('fw_profile', JSON.stringify(prof));
              }
            }
          } catch(_e){}

          /* Sync last 12 months of financial_data → fw_monthly_snapshots so
             the as-of-month picker auto-populates without re-running checkup.
             Replace, do not merge — Supabase is the source of truth, so old
             months left over from test-profiles.html etc. must not leak through. */
          self.client.from('financial_data')
            .select('snapshot_date, as_of_month, revenue, expenses, emi')
            .eq('user_id', self.user.id)
            .order('snapshot_date', { ascending: false })
            .limit(12)
            .then(function(res){
              try {
                var snaps = {};
                var prof  = {}; try { prof = JSON.parse(localStorage.getItem('fw_profile')||'{}') || {}; } catch(_e){}
                if(res && res.data){
                  res.data.forEach(function(row){
                    var ym = row.as_of_month || (row.snapshot_date ? String(row.snapshot_date).substring(0,7) : null);
                    if(!ym) return;
                    snaps[ym] = {
                      rev:       row.revenue,
                      exp:       row.expenses,
                      emi:       row.emi,
                      reserve:   (prof.reserve != null) ? prof.reserve : 0,
                      asOfMonth: ym,
                      savedAt:   row.snapshot_date
                    };
                  });
                }
                localStorage.setItem('fw_monthly_snapshots', JSON.stringify(snaps));
              } catch(_e){}
            });

          /* Sync last 12 monthly health_scores → fw_score_history so the
             dashboard sparkline and Score History page show backend data. */
          self.client.from('health_scores')
            .select('score_date, overall_score, dimension_data')
            .eq('user_id', self.user.id)
            .order('score_date', { ascending: false })
            .limit(12)
            .then(function(res){
              if(!res || !res.data || res.data.length === 0) return;
              try {
                var hist = res.data.map(function(row){
                  var dim = row.dimension_data || {};
                  return {
                    date:         row.score_date + 'T00:00:00.000Z',
                    asOfMonth:    String(row.score_date).substring(0,7),
                    loanScore:    dim.loan_score,
                    loanVerdict:  dim.verdict,
                    runway:       dim.runway_months,
                    runwayStatus: dim.runway_status,
                    grade:        dim.grade,
                    healthScore:  row.overall_score,
                    grantCount:   dim.grant_count || 5
                  };
                });
                localStorage.setItem('fw_score_history', JSON.stringify(hist));
                /* Mirror healthScore/grade onto snapshots that exist. We do
                   NOT add brand-new month keys here — financial_data is the
                   authoritative list of months a user has. */
                var snaps = JSON.parse(localStorage.getItem('fw_monthly_snapshots')||'{}') || {};
                res.data.forEach(function(row){
                  var ym = String(row.score_date).substring(0,7);
                  if(!snaps[ym]) return;
                  snaps[ym].healthScore = row.overall_score;
                  if(row.dimension_data && row.dimension_data.grade) snaps[ym].grade = row.dimension_data.grade;
                });
                localStorage.setItem('fw_monthly_snapshots', JSON.stringify(snaps));
              } catch(_e){}
            });

          self._done();
        }).catch(function(){ self._done(); });
    },

    _done: function(){
      this.ready = true;
      var cbs = this._cbs; this._cbs = [];
      cbs.forEach(function(fn){ try{ fn(); }catch(e){} });
    },

    /* ── Auth methods ── */
    signIn: function(email, password, cb){
      this.client.auth.signInWithPassword({email:email, password:password})
        .then(function(r){ cb(r.error, r.data); });
    },

    signUp: function(email, password, name, cb, referredBy){
      var self = this;
      this.client.auth.signUp({
        email:email, password:password,
        options:{ data:{ full_name: name } }
      }).then(function(r){
        if(!r.error && r.data.user){
          var trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          var updates = {
            full_name    : name,
            trial_ends_at: trialEndsAt,
            trial_plan   : 'starter'
          };
          if(referredBy) updates.referred_by = referredBy;
          self.client.from('profiles').upsert(
            Object.assign({ id: r.data.user.id, email: email }, updates)
          ).then(function(){});
        }
        cb(r.error, r.data);
      });
    },

    signOut: function(){
      /* Keep fw_uid so that the same user signing back in doesn't
         trigger _clearUserData — their profile stays intact.
         _clearUserData still fires if a DIFFERENT user signs in (uid mismatch in _loadProfile). */
      this.client.auth.signOut().then(function(){
        var base = window.location.pathname.includes('/modules/') ? '../' : '';
        window.location.href = base + 'auth.html';
      });
    },

    resetPassword: function(email, cb){
      var origin = window.location.origin || '';
      this.client.auth.resetPasswordForEmail(email,{
        redirectTo: origin + '/auth.html?mode=reset'
      }).then(function(r){ cb(r.error); });
    },

    /* ── Plan helpers ── */
    planLevel: function(){
      var p = this.plan;
      if(p==='advisor') return 4;
      if(p==='pro')     return 3;
      if(p==='starter') return 2;
      return 1;
    },

    canAccess: function(required){
      var req = required==='advisor'?4:required==='pro'?3:required==='starter'?2:1;
      return this.planLevel() >= req;
    },

    displayName: function(){
      if(!this.user) return '';
      return (this.profile && this.profile.full_name) ||
             this.user.email.split('@')[0];
    },

    trialDaysLeft: function(){
      if(!this.onTrial || !this.trialEndsAt) return 0;
      return Math.ceil((this.trialEndsAt - new Date()) / (1000 * 60 * 60 * 24));
    },

    stripeKey: function(){ return STRIPE_PK; }
  };
})();
