import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles, KeyRound } from 'lucide-react';

export default function Login() {
  const { login, forgotPassword, isFirebaseConfigured } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      success('Welcome back to freakinDEX!');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      let msg = 'Failed to authenticate. Please check your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please try again later.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      error('Please enter your administrator email.');
      return;
    }

    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail.trim());
      success('Password reset instructions sent to your email.');
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (err) {
      error(err.message || 'Failed to send reset link.');
    } finally {
      setForgotLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@freakindex.com');
    setPassword('admin123');
    info('Loaded demo admin credentials.');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/4 w-[280px] h-[280px] bg-pink-600/15 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10">
        {/* Branding & Logo */}
        <div className="text-center mb-8">
          <div className="inline-block text-6xl filter drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] mb-2 animate-bounce-subtle">
            🍆💦
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">
            freakinDEX
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#92929E] font-bold mt-1">
           Track all of em
          </p>

          {!isFirebaseConfigured && (
            <div className="mt-4 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                Preview Mode Active
              </span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="underline hover:text-white font-bold text-pink-400"
              >
                Auto-fill Demo
              </button>
            </div>
          )}
        </div>

        {/* Login Card */}
        <div className="bg-[#17171F] border border-[#2A2A35] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Login</h2>
            <p className="text-xs text-[#92929E] mt-1">
              Only accessible by absolute baddies.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-[#92929E] mb-1.5 uppercase tracking-wider">
                Fake Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#92929E]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gooner69@gmail.com"
                  className="w-full bg-[#0B0B0F] border border-[#2A2A35] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#92929E] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#92929E]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0B0B0F] border border-[#2A2A35] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-gray-500 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#92929E] hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-pink-600/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Stroking it rn...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Enter freakinDEX</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#2A2A35]/60 text-center">
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="w-full max-w-sm bg-[#17171F] border border-[#2A2A35] rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Password</h3>
                <p className="text-xs text-[#92929E]">
                  Enter your email to receive a recovery link.
                </p>
              </div>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-3 pt-2">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="admin@freakindex.com"
                className="w-full bg-[#0B0B0F] border border-[#2A2A35] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#2A2A35] bg-[#20202A] text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

