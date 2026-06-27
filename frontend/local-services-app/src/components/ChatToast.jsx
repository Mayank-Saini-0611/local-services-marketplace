import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { MessageSquare, X } from 'lucide-react';

function ChatToast() {
  const navigate = useNavigate();
  const { latestMessage, clearLatestMessage } = useChat();

  if (!latestMessage) return null;

  const handleClick = () => {
    navigate('/dashboard/messages');
    clearLatestMessage();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
            <p className="font-bold text-slate-900 text-sm">New message from {latestMessage.senderName}</p>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{latestMessage.content}</p>
            <p className="text-xs text-violet-600 mt-1 font-medium">Click to reply →</p>
          </div>
          <button
            onClick={clearLatestMessage}
            className="p-1 hover:bg-slate-100 rounded-lg flex-shrink-0"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatToast;