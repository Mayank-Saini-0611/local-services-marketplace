import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useTranslation } from 'react-i18next';
import { tokenStorage } from '../utils/tokenStorage';
import { 
  Bell,
  Mail,
  Globe,
  Lock,
  Trash2,
  Moon,
  Sun,
  Shield,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  ChevronRight,
  Smartphone,
  Eye
} from 'lucide-react';

function Settings() {
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    bookingUpdates: true,
    marketingEmails: false,
    profileVisibility: 'public',
    language: 'en'
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
    showToast('Settings updated');
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

      {/* NOTIFICATIONS */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
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

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                 <p className="font-semibold text-slate-900">{t('settings.marketingEmails')}</p>
                <p className="text-xs text-slate-500">{t('settings.marketingDesc')}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.marketingEmails}
                onChange={() => handleToggle('marketingEmails')}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 rounded-full peer peer-checked:bg-violet-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </div>

      {/* PRIVACY */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
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
                onClick={() => setSettings({ ...settings, profileVisibility: 'public' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  settings.profileVisibility === 'public' 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                                {t('settings.public')}
              </button>
              <button
                onClick={() => setSettings({ ...settings, profileVisibility: 'private' })}
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

      {/* PREFERENCES */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
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
                setSettings({ ...settings, language: e.target.value });
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

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200">
            <div className="flex-1">
                            <p className="font-semibold text-slate-900">{t('settings.deleteAccount')}</p>
              <p className="text-xs text-slate-500 mt-1">{t('settings.deleteAccountDesc')}</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg whitespace-nowrap flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Your Account?</h3>
              <p className="text-sm text-slate-600 mb-4">
                This will permanently delete your account, all your listings, bookings, and data. This action cannot be undone.
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
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE MY ACCOUNT' || isDeleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;