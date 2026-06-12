import { useState } from 'react';
import { Link } from 'react-router-dom';
import LottiePlayer from '../components/LottiePlayer';
import authAnimation from '../assets/auth-animation.json';
import { authApi } from '../api/authApi';
import { 
  Mail, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  Send
} from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-violet-100">
      
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{animationDelay: '4s'}}></div>

      <div className="relative min-h-screen flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* LEFT SIDE — Animation + Branding */}
          <div className="hidden lg:flex flex-col items-start justify-center text-slate-800 animate-fade-in pl-4 xl:pl-8">
            <div className="w-full max-w-lg -ml-8">
              <LottiePlayer 
                animationData={authAnimation}
                loop={true}
                autoplay={true}
                style={{ width: '100%', height: '520px' }}
              />
            </div>
            
            <div className="text-left mt-4 space-y-4 w-full max-w-md">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-violet-200 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-700">Secure Account Recovery</span>
              </div>
              
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-slate-900">
                Forgot Your
                <br />
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">
                  Password?
                </span>
              </h1>
              
              <p className="text-slate-600 text-lg">
                No worries! Enter your email and we'll send you a secure link to reset your password.
              </p>

              <div className="flex gap-6 pt-4">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Secure</p>
                    <p className="text-xs text-slate-500">Encrypted token</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Fast</p>
                    <p className="text-xs text-slate-500">1 minute</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — Form */}
          <div className="animate-slide-up">
            <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl shadow-violet-200/50 p-8 lg:p-12">
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h2>
                <p className="text-slate-600 text-sm">
                  {submitted 
                    ? "Check your inbox for the reset link" 
                    : "Enter your email to receive a reset link"}
                </p>
              </div>

              {submitted ? (
                /* SUCCESS STATE */
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Check Your Email!</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      We've sent a password reset link to:
                    </p>
                    <p className="font-semibold text-violet-600 text-sm bg-violet-50 py-2 px-4 rounded-lg inline-block">
                      {email}
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                      <strong>💡 Tips:</strong>
                    </p>
                    <ul className="text-xs text-amber-700 mt-2 space-y-1 list-disc list-inside">
                      <li>Check your spam folder if you don't see it</li>
                      <li>The link expires in 1 hour</li>
                      <li>You can only use this link once</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail('');
                    }}
                    className="w-full py-3 border-2 border-violet-200 text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-all"
                  >
                    Resend Email
                  </button>

                  <Link 
                    to="/login"
                    className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-violet-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              ) : (
                /* FORM */
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-slate-700 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                        }}
                        className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                        placeholder="you@example.com"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Reset Link
                      </>
                    )}
                  </button>

                  <Link 
                    to="/login"
                    className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-violet-600 transition-colors pt-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;