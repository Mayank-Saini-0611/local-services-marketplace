import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  
  // Guard against React StrictMode double-execution
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage('No verification token was provided in the link.');
      return;
    }

    if (verificationAttempted.current) return;
    verificationAttempted.current = true;

    authApi.verifyEmail(token)
      .then((res) => {
        setSuccess(true);
        setMessage(res.message || 'Email verified successfully! You can now use all features.');
      })
      .catch((err) => {
        setSuccess(false);
        setMessage(err.response?.data?.message || 'This verification link has already been used or has expired.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-violet-100 dark:bg-slate-950 flex items-center justify-center p-4">
      {/* Decorative Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-violet-300 dark:bg-violet-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-300 dark:bg-pink-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-slate-800 shadow-2xl p-8 text-center">
        {loading ? (
          <div className="py-8 space-y-4">
            <Loader2 className="w-16 h-16 text-violet-600 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verifying Account...</h2>
            <p className="text-slate-500 text-sm">Validating your email verification token.</p>
          </div>
        ) : success ? (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Email Verified
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account Activated! 🎉</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{message}</p>
            </div>
            <Link
              to="/login"
              className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-300 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account Status</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Your email has already been verified, or this link was already used.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                className="block w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Proceed to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;