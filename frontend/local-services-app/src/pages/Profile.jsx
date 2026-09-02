import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { listingApi } from '../api/listingApi';
import { tokenStorage } from '../utils/tokenStorage';
import { useTranslation } from 'react-i18next';
import { 
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Briefcase,
  Crown,
  Edit2,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera
} from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = tokenStorage.getUser();

  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    role: user?.role || '',
    createdAt: null,
    avatarUrl: null
  });

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ fullName: '', phone: '' });
  const [editErrors, setEditErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authApi.getCurrentUser();
      setProfile({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || '',
        role: data.role,
        createdAt: data.createdAt,
        avatarUrl: data.avatarUrl || null
      });
      setEditData({ fullName: data.fullName, phone: data.phone || '' });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      // 1. Upload to Cloudinary
      const result = await listingApi.uploadImage(file);
      
      // 2. Persist to Database immediately
      await authApi.updateProfile({
        fullName: profile.fullName,
        phone: profile.phone,
        avatarUrl: result.url
      });

      // 3. Update State & LocalStorage
      setProfile(prev => ({ ...prev, avatarUrl: result.url }));
      const updatedUser = { ...user, avatarUrl: result.url };
      tokenStorage.setAuth(tokenStorage.getToken(), updatedUser);

      showToast('Profile photo updated successfully!');
    } catch (err) {
      console.error('Avatar upload error:', err);
      showToast(err.response?.data?.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleEditSave = async () => {
    const errors = {};
    if (!editData.fullName.trim() || editData.fullName.length < 3) {
      errors.fullName = 'Name must be at least 3 characters';
    }
    if (editData.phone && !/^\d{10}$/.test(editData.phone)) {
      errors.phone = 'Phone must be 10 digits';
    }
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const result = await authApi.updateProfile({
        fullName: editData.fullName,
        phone: editData.phone,
        avatarUrl: profile.avatarUrl
      });
      
      const updatedUser = { ...user, fullName: result.fullName, avatarUrl: result.avatarUrl };
      tokenStorage.setAuth(tokenStorage.getToken(), updatedUser);
      
      setProfile(prev => ({ ...prev, fullName: result.fullName, phone: result.phone }));
      setEditMode(false);
      setEditErrors({});
      showToast(t('profile.profileUpdated'));
    } catch (err) {
      console.error('Update error:', err);
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errors = {};
    
    if (!passwordData.currentPassword) errors.currentPassword = 'Current password required';
    if (!passwordData.newPassword) errors.newPassword = 'New password required';
    else if (passwordData.newPassword.length < 6) errors.newPassword = 'Min 6 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      showToast(t('profile.passwordChanged'));
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (err) {
      console.error('Change password error:', err);
      setPasswordErrors({ 
        general: err.response?.data?.message || 'Failed to change password'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleBadge = () => {
    const config = {
      admin: { bg: 'bg-orange-500', label: t('profile.administrator'), icon: Crown },
      provider: { bg: 'bg-blue-500', label: t('profile.serviceProvider'), icon: Briefcase },
      customer: { bg: 'bg-violet-500', label: t('auth.customer'), icon: User }
    };
    return config[profile.role] || config.customer;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
      </div>
    );
  }

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* TOAST */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
          toast.type === 'error' 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{t('profile.myProfile')}</h1>
        <p className="text-slate-500 mt-1">{t('profile.manageInfo')}</p>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        {/* Gradient Top Banner */}
        <div className="h-24 bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-700"></div>

        {/* Avatar + Info Section */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl shadow-xl ring-4 ring-white bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                {uploadingAvatar ? (
                  <div className="w-full h-full bg-violet-50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                  </div>
                ) : profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-9 h-9 bg-white hover:bg-slate-50 rounded-full shadow-lg border border-slate-200 flex items-center justify-center cursor-pointer transition-transform hover:scale-105">
                <Camera className="w-4 h-4 text-slate-700" />
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{profile.fullName}</h2>
              <p className="text-slate-500 text-sm mt-0.5">{profile.email}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${roleBadge.bg} text-white text-xs font-semibold rounded-full shadow-sm`}>
                  <RoleIcon className="w-3.5 h-3.5" />
                  {roleBadge.label}
                </span>
                {profile.createdAt && (
                  <span className="text-xs text-slate-400">
                    {t('profile.memberSince')} {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold rounded-xl transition-colors self-start sm:self-center"
              >
                <Edit2 className="w-4 h-4" />
                {t('profile.editProfile')}
              </button>
            )}
          </div>

          {/* FIELDS */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('profile.fullName')}</label>
              {editMode ? (
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={editData.fullName}
                      onChange={(e) => {
                        setEditData({ ...editData, fullName: e.target.value });
                        if (editErrors.fullName) setEditErrors({ ...editErrors, fullName: '' });
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-white border ${editErrors.fullName ? 'border-red-400' : 'border-slate-200'} rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100`}
                    />
                  </div>
                  {editErrors.fullName && <p className="text-xs text-red-600 mt-1">{editErrors.fullName}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <User className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-900 font-medium">{profile.fullName}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('profile.emailAddress')}</label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-slate-900 font-medium flex-1">{profile.email}</span>
                <span className="text-xs text-slate-400 bg-slate-200 px-2.5 py-0.5 rounded-full">{t('profile.cannotChange')}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('profile.phoneNumber')}</label>
              {editMode ? (
                <div>
                  <div className="relative flex">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 border-r-0 rounded-l-xl text-slate-700">
                      <span>🇮🇳</span>
                      <span className="font-medium">+91</span>
                    </div>
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => {
                        setEditData({ ...editData, phone: e.target.value });
                        if (editErrors.phone) setEditErrors({ ...editErrors, phone: '' });
                      }}
                      maxLength="10"
                      placeholder="9876543210"
                      className={`flex-1 px-4 py-3 bg-white border ${editErrors.phone ? 'border-red-400' : 'border-slate-200'} rounded-r-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100`}
                    />
                  </div>
                  {editErrors.phone && <p className="text-xs text-red-600 mt-1">{editErrors.phone}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-900 font-medium">
                    {profile.phone ? `+91 ${profile.phone}` : <span className="text-slate-400 italic">{t('profile.notSet')}</span>}
                  </span>
                </div>
              )}
            </div>

            {editMode && (
              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditData({ fullName: profile.fullName, phone: profile.phone });
                    setEditErrors({});
                  }}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t('profile.saveChanges')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECURITY */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('profile.security')}</h3>
            <p className="text-sm text-slate-500">{t('profile.managePassword')}</p>
          </div>
        </div>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{t('profile.changePassword')}</p>
              <p className="text-xs text-slate-500">{t('profile.updatePassword')}</p>
            </div>
          </div>
          <Edit2 className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{t('profile.changePassword')}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{t('profile.updatePassword')}</p>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {passwordErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{passwordErrors.general}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('profile.currentPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('profile.newPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showNew ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={isChangingPassword} className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
                  {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : t('profile.changePassword')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;