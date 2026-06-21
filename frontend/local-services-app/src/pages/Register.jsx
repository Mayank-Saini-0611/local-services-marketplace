import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LottiePlayer from '../components/LottiePlayer';
import authAnimation from '../assets/auth-animation.json';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../utils/tokenStorage';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer'
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Must be a 10-digit number';
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
      const response = await authApi.register(formData);
      
      tokenStorage.setAuth(response.token, {
        userId: response.userId,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
      });

      setSuccessMessage('✓ Account created successfully! Redirecting...');

setTimeout(() => {
  if (response.role === 'admin') {
    navigate('/admin');
  } else {
    navigate('/dashboard');
  }
}, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      
      const errorMsg = error.response?.data?.message 
                    || error.response?.data?.title
                    || 'Registration failed. Please try again.';
      
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
                <span className="text-sm font-semibold text-slate-700">Join 10,000+ users</span>
              </div>
              
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-slate-900">
                Your Local Services
                <br />
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">
                  Just a Click Away
                </span>
              </h1>
              
              <p className="text-slate-600 text-lg">
                Connect with trusted local professionals — plumbers, electricians, tutors, and more.
              </p>

              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">500+</div>
                  <div className="text-sm text-slate-600 font-medium">Providers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">15+</div>
                  <div className="text-sm text-slate-600 font-medium">Categories</div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">4.9★</div>
                  <div className="text-sm text-slate-600 font-medium">Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — Form */}
          <div className="animate-slide-up">
            <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl shadow-violet-200/50 p-8 lg:p-10">
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Your Account</h2>
                <p className="text-slate-600 text-sm">Get started with Local Services Marketplace</p>
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

              <form onSubmit={handleSubmit} autoComplete="on" className="space-y-4">
                
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-slate-700 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      autoComplete="name"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-white border ${
                        errors.fullName ? 'border-red-400' : 'border-slate-200'
                      } rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-red-600 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

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
                      className={`w-full pl-10 pr-4 py-3 bg-white border ${
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

                {/* Password + Confirm Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-slate-700 text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-10 py-3 bg-white border ${
                          errors.password ? 'border-red-400' : 'border-slate-200'
                        } rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all`}
                        placeholder="Min 6 chars"
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

                  <div>
                    <label htmlFor="confirmPassword" className="block text-slate-700 text-sm font-medium mb-2">
                      Confirm
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-10 py-3 bg-white border ${
                          errors.confirmPassword ? 'border-red-400' : 'border-slate-200'
                        } rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all`}
                        placeholder="Re-enter"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-red-600 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone with +91 Prefix */}
                <div>
                  <label htmlFor="phone" className="block text-slate-700 text-sm font-medium mb-2">
                    Phone <span className="text-slate-400">(Optional)</span>
                  </label>
                  <div className="relative flex">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 border-r-0 rounded-l-xl text-slate-700">
                      <span className="text-lg">🇮🇳</span>
                      <span className="font-medium">+91</span>
                    </div>
                    
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength="10"
                      className={`flex-1 px-4 py-3 bg-white border ${
                        errors.phone ? 'border-red-400' : 'border-slate-200'
                      } rounded-r-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all`}
                      placeholder="9876543210"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-red-600 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Role Selector */}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">
                    I am a...
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('customer')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.role === 'customer'
                          ? 'bg-gradient-to-br from-violet-500 to-purple-600 border-violet-500 shadow-lg shadow-violet-200'
                          : 'bg-white border-slate-200 hover:border-violet-300'
                      }`}
                    >
                      <UserCheck className={`w-6 h-6 mx-auto mb-2 ${formData.role === 'customer' ? 'text-white' : 'text-slate-500'}`} />
                      <div className={`text-sm font-semibold ${formData.role === 'customer' ? 'text-white' : 'text-slate-700'}`}>
                        Customer
                      </div>
                      <div className={`text-xs mt-1 ${formData.role === 'customer' ? 'text-white/80' : 'text-slate-500'}`}>
                        Find services
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('provider')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.role === 'provider'
                          ? 'bg-gradient-to-br from-violet-500 to-purple-600 border-violet-500 shadow-lg shadow-violet-200'
                          : 'bg-white border-slate-200 hover:border-violet-300'
                      }`}
                    >
                      <Briefcase className={`w-6 h-6 mx-auto mb-2 ${formData.role === 'provider' ? 'text-white' : 'text-slate-500'}`} />
                      <div className={`text-sm font-semibold ${formData.role === 'provider' ? 'text-white' : 'text-slate-700'}`}>
                        Provider
                      </div>
                      <div className={`text-xs mt-1 ${formData.role === 'provider' ? 'text-white/80' : 'text-slate-500'}`}>
                        Offer services
                      </div>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <p className="text-center text-slate-500 text-sm pt-2">
                  Already have an account?{' '}
                  <Link to="/login" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors">
                    Sign in
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

export default Register;