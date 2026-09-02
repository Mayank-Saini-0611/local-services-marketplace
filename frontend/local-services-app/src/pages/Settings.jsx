import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { listingApi } from '../api/listingApi';
import { tokenStorage } from '../utils/tokenStorage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import {
  Bell,
  Mail,
  Globe,
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  Upload,
  Clock,
  Palette,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

function Settings() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const user = tokenStorage.getUser();

  // Theme (light / dark / system) — drives the Appearance card below
  const { theme, resolvedTheme, systemTheme } = useTheme();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    bookingUpdates: true,
    marketingEmails: false,
    profileVisibility: 'public',
    language: i18n.language || 'en'
  });

  const [kycStatus, setKycStatus] = useState('unverified');
  const [uploadingKyc, setUploadingKyc] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    authApi.getCurrentUser()
      .then(data => {
        if (data?.kycStatus) {
          setKycStatus(data.kycStatus);
        }
      })
      .catch(err => console.error('Failed to fetch user KYC status:', err));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    showToast('Settings updated');
  };

  const handleKycUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingKyc(true);
    try {
      const uploadResult = await listingApi.uploadImage(file);
      const submitResult = await authApi.submitKyc(uploadResult.url);
      setKycStatus(submitResult.status || 'pending');
      showToast('ID document submitted for verification!');
    } catch (err) {
      console.error('KYC upload error:', err);
      showToast(err.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setUploadingKyc(false);
      e.target.value = '';
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') return;
    
    setIsDeleting(true);
    try {
      await authApi.deleteAccount();
      tokenStorage.clearAuth();
      showToast('Account deleted. Goodbye!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete account', 'error');
      setIsDeleting(false);
    }
  };

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
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{t('settings.settings')}</h1>
        <p className="text-slate-500 mt-1">{t('settings.managePreferences')}</p>
      </div>

      {/* ================= APPEARANCE / THEME ================= */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <Palette className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Appearance</h3>
            <p className="text-xs text-slate-500">Choose how Local Services looks on this device</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Light / Dark / System picker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-start gap-3">
              {resolvedTheme === 'dark'
                ? <Moon className="w-5 h-5 text-slate-500 mt-0.5" />
                : <Sun className="w-5 h-5 text-slate-500 mt-0.5" />}
              <div>
                <p className="font-semibold text-slate-900">Colour theme</p>
                <p className="text-xs text-slate-500">
                  {theme === 'system'
                    ? `Following your system setting (${systemTheme})`
                    : `Manually set to ${theme}`}
                </p>
              </div>
            </div>
            <ThemeToggle variant="segmented" className="self-start sm:self-auto" />
          </div>

          {/* Quick switch, same control as the navbar */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-start gap-3">
              <Monitor className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Quick toggle</p>
                <p className="text-xs text-slate-500">
                  Instantly flip between light and dark — same switch as the top bar
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Live preview chips so the user can see the palette */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Surface', cls: 'bg-white' },
              { label: 'Sunken', cls: 'bg-slate-100' },
              { label: 'Border', cls: 'bg-slate-200' },
              { label: 'Accent', cls: 'bg-violet-600' },
            ].map((swatch) => (
              <div key={swatch.label} className="space-y-2">
                <div className={`h-14 rounded-xl border border-slate-200 ${swatch.cls}`} />
                <p className="text-xs font-medium text-slate-500 text-center">{swatch.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IDENTITY VERIFICATION (PROVIDERS ONLY) */}
      {user?.role === 'provider' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Identity Verification (KYC)</h3>
              <p className="text-xs text-slate-500">Get the blue "Verified" badge on your profile and listings</p>
            </div>
          </div>

          <div className="space-y-4">
            {kycStatus === 'verified' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-800">Account Verified</p>
                  <p className="text-sm text-green-700">Your identity is verified. Customers can see your verified badge.</p>
                </div>
              </div>
            )}

            {kycStatus === 'pending' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-amber-800">Verification Pending</p>
                  <p className="text-sm text-amber-700">Your ID has been submitted and is awaiting administrator review.</p>
                </div>
              </div>
            )}

            {(kycStatus === 'unverified' || kycStatus === 'rejected') && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                {kycStatus === 'rejected' && (
                  <p className="text-sm text-red-600 font-semibold mb-3">
                    Your previous ID was rejected. Please upload a clear Government ID (Aadhaar, PAN, Passport).
                  </p>
                )}
                <label className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleKycUpload}
                    disabled={uploadingKyc}
                  />
                  {uploadingKyc ? (
                    <>
                      <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-2" />
                      <p className="text-sm font-medium text-violet-600">Uploading Document to Cloudinary...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-700">Upload Government ID (Aadhaar / PAN)</p>
                      <p className="text-xs text-slate-500 mt-1">JPG, PNG, or WEBP up to 5MB</p>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NOTIFICATIONS */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{t('settings.notifications')}</h3>
            <p className="text-xs text-slate-500">{t('settings.notificationsDesc')}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">{t('settings.emailNotifications')}</p>
                <p className="text-xs text-slate-500">{t('settings.receiveViaEmail')}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 rounded-full peer peer-checked:bg-violet-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">{t('settings.bookingUpdates')}</p>
                <p className="text-xs text-slate-500">{t('settings.bookingUpdatesDesc')}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.bookingUpdates}
                onChange={() => handleToggle('bookingUpdates')}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 rounded-full peer peer-checked:bg-violet-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </div>

      {/* PRIVACY */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{t('settings.privacy')}</h3>
            <p className="text-xs text-slate-500">{t('settings.privacyDesc')}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              <Eye className="w-5 h-5 text-slate-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{t('settings.profileVisibility')}</p>
                <p className="text-xs text-slate-500">{t('settings.whoCanSee')}</p>
              </div>
            </div>
            <div className="flex gap-2 ml-8">
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, profileVisibility: 'public' }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  settings.profileVisibility === 'public' 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                {t('settings.public')}
              </button>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, profileVisibility: 'private' }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  settings.profileVisibility === 'private' 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                {t('settings.private')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PREFERENCES (LANGUAGE) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{t('settings.preferences')}</h3>
            <p className="text-xs text-slate-500">{t('settings.customizeExperience')}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">{t('settings.language')}</p>
                <p className="text-xs text-slate-500">{t('settings.interfaceLanguage')}</p>
              </div>
            </div>
            <select
              value={i18n.language}
              onChange={(e) => {
                i18n.changeLanguage(e.target.value);
                setSettings(prev => ({ ...prev, language: e.target.value }));
                showToast('Language changed successfully');
              }}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-red-900">{t('settings.dangerZone')}</h3>
            <p className="text-xs text-red-600">{t('settings.irreversibleActions')}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-red-200 flex items-center justify-between">
          <div className="flex-1">
            <p className="font-semibold text-slate-900">{t('settings.deleteAccount')}</p>
            <p className="text-xs text-slate-500 mt-1">{t('settings.deleteAccountDesc')}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg whitespace-nowrap flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {t('common.delete')}
          </button>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('settings.deleteAccountConfirm')}</h3>
              <p className="text-sm text-slate-600 mb-4">
                This action is permanent and cannot be undone.
              </p>
              <p className="text-sm text-slate-700 mb-3">
                Type <strong className="text-red-600">DELETE MY ACCOUNT</strong> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE MY ACCOUNT' || isDeleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {t('settings.deleteForever')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;