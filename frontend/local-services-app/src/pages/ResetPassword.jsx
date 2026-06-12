import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import LottiePlayer from '../components/LottiePlayer';
import authAnimation from '../assets/auth-animation.json';
import { authApi } from '../api/authApi';
import { 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  XCircle
} from 'lucide-react';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Must be at least 6 characters';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await authApi.resetPassword(token, formData.newPassword);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to reset password. The link may be expired.';
      setErrors({ general: errorMsg });
      
      // If token invalid, show appropriate state
      if (errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('expired')) {
        setTokenValid(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const p = formData.newPassword;
    if (!p) return { level: 0, text: '', color: '' };
    if (p.length < 6) return { level: 1, text: 'Too short', color: 'bg-red-500' };
    if (p.length < 10) return { level: 2, text: 'Weak', color: 'bg-amber-500' };
    if (p.length < 14 || !/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { level: 3, text: 'Good', color: 'bg-blue-500' };
    return { level: 4, text: 'Strong', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-violet-100">
      
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{animationDelay: '4s'}}></div>

      <div className="relative min-h-screen flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* LEFT SIDE */}
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
                <span className="text-sm font-semibold text-slate-700">Almost There!</span>
              </div>
              
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-slate-900">
                Create Your
                <br />
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">
                  New Password
                </span>
              </h1>
              
              <p className="text-slate-600 text-lg">
                Choose a strong password to keep your account secure.
              </p>

              <div className="pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  At least 6 characters
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Mix uppercase and numbers for extra security
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Don't reuse old passwords
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="animate-slide-up">
            <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl shadow-violet-200/50 p-8 lg:p-12">
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Set New Password</h2>
                <p className="text-slate-600 text-sm">Enter your new password below</p>
              </div>

              {!tokenValid ? (
                /* INVALID TOKEN STATE */
                <div className="space-y-6 text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Invalid or Expired Link</h3>
                    <p className="text-sm text-slate-600">
                      This password reset link is no longer valid. Reset links expire after 1 hour for your security.
                    </p>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="block w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg text-center"
                  >
                    Request New Reset Link
                  </Link>
                  <Link 
                    to="/login"
                    className="block text-sm text-slate-500 hover:text-violet-600 transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              ) : success ? (
                /* SUCCESS STATE */
                <div className="space-y-6 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Password Reset Successfully! 🎉</h3>
                    <p className="text-sm text-slate-600">
                      Your password has been updated. You can now log in with your new password.
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-700">
                      Redirecting to login page in 3 seconds...
                    </p>
                  </div>
                  <Link
                    to="/login"
                    className="block w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg text-center"
                  >
                    Go to Login Now
                  </Link>
                </div>
              ) : (
                /* FORM */
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {errors.general && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-sm">{errors.general}</p>
                    </div>
                  )}

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-slate-700 text-sm font-medium mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        className={`w-full pl-10 pr-10 py-3.5 bg-white border ${errors.newPassword ? 'border-red-400' : 'border-slate-200'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100`}
                        placeholder="Min 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.newPassword && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                level <= strength.level ? strength.color : 'bg-slate-200'
                              }`}
                            ></div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">
                          Password strength: <span className="font-semibold">{strength.text}</span>
                        </p>
                      </div>
                    )}

                    {errors.newPassword && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-slate-700 text-sm font-medium mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        className={`w-full pl-10 pr-10 py-3.5 bg-white border ${errors.confirmPassword ? 'border-red-400' : 'border-slate-200'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100`}
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.confirmPassword}
                      </p>
                    )}
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
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;