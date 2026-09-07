import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Briefcase, 
  UserCheck, 
  Wrench, 
  Building2, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Bot, 
  TrendingUp, 
  AlertCircle,
  KeyRound,
  Check
} from 'lucide-react';
import { User, Organization } from '../types';
import { demoUsers, initialOrganizations } from '../mockData';
import { API_BASE_URL } from '../config';

interface AuthViewProps {
  onLoginSuccess: (user: User, organization: Organization, token?: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('admin@opsmind.ai');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOrgName, setRegOrgName] = useState('');
  const [regPlan, setRegPlan] = useState<'Starter' | 'Pro' | 'Enterprise'>('Enterprise');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);

  // Quick Persona selection
  const handleSelectPersona = (user: User) => {
    setLoginEmail(user.email);
    setLoginPassword('password123');
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Try real Laravel API login
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        const matchedOrg = initialOrganizations.find(o => o.id === data.organization?.id) || {
          id: data.organization?.id || 1,
          name: data.organization?.name || 'Apex Dynamics Ltd',
          slug: data.organization?.slug || 'apex-dynamics',
          plan: data.organization?.plan || 'Enterprise',
          status: 'active'
        };
        const loggedInUser: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          current_organization_id: matchedOrg.id,
        };
        onLoginSuccess(loggedInUser, matchedOrg, data.token);
        return;
      }
    } catch {
      // Fallback to local demo matching if backend is unreachable
    }

    // Local demo authentication fallback
    const matchedUser = demoUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (matchedUser) {
      const org = initialOrganizations.find(o => o.id === matchedUser.current_organization_id) || initialOrganizations[0];
      onLoginSuccess(matchedUser, org, 'demo-token-' + Date.now());
    } else {
      setErrorMessage('Invalid credentials. Please verify your email & password or choose a quick demo persona.');
    }
    setLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regOrgName) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      // Try real Laravel API registration
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          company_name: regOrgName,
          plan: regPlan
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newOrg: Organization = {
          id: data.organization.id,
          name: data.organization.name,
          slug: data.organization.slug,
          plan: data.organization.plan,
          status: 'active'
        };
        const newUser: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar,
          current_organization_id: newOrg.id
        };
        onLoginSuccess(newUser, newOrg, data.token);
        return;
      }
    } catch {
      // Fallback local registration
    }

    // Demo fallback registration
    const newOrgId = Date.now();
    const createdOrg: Organization = {
      id: newOrgId,
      name: regOrgName,
      slug: regOrgName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      plan: regPlan,
      status: 'active'
    };
    const createdUser: User = {
      id: newOrgId + 1,
      name: regName,
      email: regEmail,
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      current_organization_id: newOrgId
    };
    onLoginSuccess(createdUser, createdOrg, 'demo-reg-token-' + newOrgId);
    setLoading(false);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
    } catch {
      // Continue
    }

    setForgotSuccessMessage(`Password reset instructions have been dispatched to ${forgotEmail}`);
    setTimeout(() => {
      setForgotSuccessMessage(null);
      setIsForgotModalOpen(false);
      setForgotEmail('');
    }, 2500);
  };

  const personaMeta = [
    {
      user: demoUsers[0], // Alexander Vance
      title: 'Super Admin',
      sub: 'Multi-Tenant Master Control',
      icon: ShieldCheck,
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300'
    },
    {
      user: demoUsers[1], // Elena Rostova
      title: 'Org Owner',
      sub: 'Apex Dynamics Executive',
      icon: Briefcase,
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-300'
    },
    {
      user: demoUsers[2], // Marcus Chen
      title: 'Ops Manager',
      sub: 'Inventory & POS Operations',
      icon: UserCheck,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300'
    },
    {
      user: demoUsers[3], // Sarah Jenkins
      title: 'Support Staff',
      sub: 'Helpdesk & AI Triage',
      icon: Wrench,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>
      <div className="absolute top-1/2 right-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Column: Brand & Feature Highlights */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  OpsMind<span className="text-indigo-400">.AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Autonomous Business Operations SaaS</p>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Intelligent multi-tenant operations at scale.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Integrated Python AI forecasting, customer churn prediction, and automated ticket classification backed by Laravel 11 API security.
            </p>
          </div>

          {/* Value Props */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">AI Nervous System</h4>
                <p className="text-[11px] text-slate-400">Automated RFM health scoring & intelligent ticket routing.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Inventory & Demand Forecast</h4>
                <p className="text-[11px] text-slate-400">Walk-forward validation with MAE, RMSE & MAPE algorithms.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Multi-Tenant Isolation</h4>
                <p className="text-[11px] text-slate-400">Global tenant scoping with Role-Based Access Control (RBAC).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Auth Card */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            
            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-slate-950/80 rounded-2xl border border-white/5 mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In to Workspace
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register New Organization
              </button>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {mode === 'login' ? (
              <div>
                {/* One-Click Demo Personas Bar */}
                <div className="mb-6 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      One-Click Demo Personas
                    </span>
                    <span className="text-[10px] text-slate-500">Auto-fills credentials</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {personaMeta.map((p) => {
                      const Icon = p.icon;
                      const isSelected = loginEmail.toLowerCase() === p.user.email.toLowerCase();
                      return (
                        <button
                          key={p.user.id}
                          type="button"
                          onClick={() => handleSelectPersona(p.user)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md'
                              : 'bg-slate-950/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>}
                          </div>
                          <div className="font-semibold text-xs text-white truncate">{p.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{p.user.name.split(' ')[0]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Or Sign In with Credentials</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4 mt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => setIsForgotModalOpen(true)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                      />
                      <span>Remember this workstation</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Authenticating Sanctum Session...
                      </span>
                    ) : (
                      <>
                        <span>Enter OpsMind Command Center</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Register New Tenant Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization Name</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        required
                        value={regOrgName}
                        onChange={(e) => setRegOrgName(e.target.value)}
                        placeholder="e.g. Apex Global Systems"
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="admin@company.com"
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Master Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="•••••••• (min 6 chars)"
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Plan Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Subscription Tier</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Starter', label: 'Starter', desc: 'Up to 5 Users' },
                      { id: 'Pro', label: 'Pro Tier', desc: 'Full AI Suite' },
                      { id: 'Enterprise', label: 'Enterprise', desc: 'Dedicated Nodes' },
                    ].map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setRegPlan(plan.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          regPlan === plan.id
                            ? 'bg-indigo-600/30 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-semibold text-xs text-white">{plan.label}</div>
                        <div className="text-[10px] text-slate-400">{plan.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Includes automatic 14-day Enterprise trial with simulated live telemetry & Python AI backend.</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Provisioning Tenant Database...
                    </span>
                  ) : (
                    <>
                      <span>Provision Tenant & Launch Platform</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Reset Account Password</h3>
                <p className="text-xs text-slate-400">Enter your registered email to receive recovery instructions</p>
              </div>
            </div>

            {forgotSuccessMessage ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 mb-4">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{forgotSuccessMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Account Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. admin@opsmind.ai"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors"
                  >
                    Send Recovery Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
