import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { websocketService } from '../../services/websocket';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';

export default function ChatPage() {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    if (token) {
      websocketService.connect(token);
    }

    return () => {
      websocketService.disconnect();
    };
  }, [isAuthenticated, token, navigate]);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      <ChatSidebar />
      <ChatArea />
    </div>
  );
}
