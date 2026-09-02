import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Calendar, Star, User, CheckCircle2, XCircle } from 'lucide-react';

function NotificationIcon({ type }) {
  const notificationType = type || '';
  const iconClassName = "w-5 h-5";

  if (notificationType.includes('booking')) return <Calendar className={iconClassName} />;
  if (notificationType.includes('review')) return <Star className={iconClassName} />;
  if (notificationType.includes('user')) return <User className={iconClassName} />;
  if (notificationType.includes('accepted') || notificationType.includes('completed')) {
    return <CheckCircle2 className={iconClassName} />;
  }
  if (notificationType.includes('rejected')) return <XCircle className={iconClassName} />;
  return <Bell className={iconClassName} />;
}

function getNotificationColor(type) {
  const notificationType = type || '';
  if (notificationType.includes('rejected')) return 'from-red-500 to-rose-600';
  if (notificationType.includes('accepted') || notificationType.includes('completed')) {
    return 'from-green-500 to-emerald-600';
  }
  if (notificationType.includes('review')) return 'from-yellow-500 to-amber-600';
  return 'from-violet-500 to-purple-600';
}

function NotificationToast() {
  const navigate = useNavigate();
  const { toastNotification } = useNotifications();

  if (!toastNotification) return null;

  const handleClick = () => {
    if (toastNotification.link) navigate(toastNotification.link);
  };

  return (
    <div className="fixed top-20 right-4 z-[100] animate-slide-up max-w-sm">
      <div
        onClick={handleClick}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 cursor-pointer hover:shadow-xl transition-all"
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getNotificationColor(toastNotification.type)} flex items-center justify-center text-white flex-shrink-0`}>
            <NotificationIcon type={toastNotification.type} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 text-sm">{toastNotification.title}</p>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{toastNotification.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationToast;
