import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LottiePlayer from '../components/LottiePlayer';
import authAnimation from '../assets/auth-animation.json';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../utils/tokenStorage';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const response = await authApi.login(formData);
      
      tokenStorage.setAuth(response.token, {
        userId: response.userId,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
      });

      setSuccessMessage(`✓ Welcome back, ${response.fullName}! Redirecting...`);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);

      const errorMsg = error.response?.data?.message 
                    || 'Invalid email or password.';
      
      setErrors({ general: errorMsg });
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
                <span className="text-sm font-semibold text-slate-700">Welcome Back!</span>
              </div>
              
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-slate-900">
                Login To Continue
                <br />
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">
                  Your Journey
                </span>
              </h1>
              
              <p className="text-slate-600 text-lg">
                Access your dashboard, manage bookings, and connect with trusted service providers.
              </p>

              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">10K+</div>
                  <div className="text-sm text-slate-600 font-medium">Happy Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">24/7</div>
                  <div className="text-sm text-slate-600 font-medium">Support</div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">100%</div>
                  <div className="text-sm text-slate-600 font-medium">Secure</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — Form */}
          <div className="animate-slide-up">
            <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl shadow-violet-200/50 p-8 lg:p-12">
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                <p className="text-slate-600 text-sm">Sign in to access your account</p>
              </div>

              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800 text-sm">{successMessage}</p>
                </div>
              )}

              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} autoComplete="on" className="space-y-5">
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-slate-700 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3.5 bg-white border ${
                        errors.email ? 'border-red-400' : 'border-slate-200'
                      } rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-red-600 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="password" className="block text-slate-700 text-sm font-medium">
                      Password
                    </label>
                    <a href="#" className="text-violet-600 hover:text-violet-700 text-xs font-medium transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-3.5 bg-white border ${
                        errors.password ? 'border-red-400' : 'border-slate-200'
                      } rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-red-600 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 bg-white text-violet-600 focus:ring-violet-400 focus:ring-2 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-slate-600 text-sm cursor-pointer select-none">
                    Remember me for 30 days
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-slate-400">or</span>
                  </div>
                </div>

                <p className="text-center text-slate-500 text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors">
                    Create one now
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;