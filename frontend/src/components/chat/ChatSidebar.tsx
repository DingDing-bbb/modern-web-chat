import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { chatApi } from '../../services/api';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import CreateConversationForm from './CreateConversationForm';

export default function ChatSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { conversations, currentConversation, setCurrentConversation, setConversations } = useChatStore();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    setIsDark(theme === 'dark');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const loadConversations = async () => {
    try {
      const response = await chatApi.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const filteredConversations = conversations.filter((conv) => {
    if (conv.type === 'direct' && conv.participants.length > 0) {
      const otherUser = conv.participants.find((p) => p.id !== user?.id);
      return otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return conv.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <>
      <div className="w-80 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar src={user?.avatar} fallback={user?.username || 'U'} size="lg" status={user?.status as any} />
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{user?.username}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.emailVerified === 'unverified' ? '邮箱未验证' : '已验证'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus size={18} />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索对话..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => {
              const isDirect = conversation.type === 'direct';
              const displayName = isDirect
                ? conversation.participants.find((p) => p.id !== user?.id)?.username || '未知用户'
                : conversation.name || '未命名群组';
              const avatar = isDirect
                ? conversation.participants.find((p) => p.id !== user?.id)?.avatar || null
                : conversation.avatar;

              return (
                <motion.button
                  key={conversation.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentConversation(conversation)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    currentConversation?.id === conversation.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  <Avatar src={avatar} fallback={displayName} size="md" />
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-medium truncate">{displayName}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {conversation.type === 'group' ? `${conversation.participants.length} 位成员` : '在线'}
                    </p>
                  </div>
                </motion.button>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-sm">没有找到对话</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={16} className="mr-2" />
                  创建对话
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={18} className="mr-2" />
            退出登录
          </Button>
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="创建新对话">
        <CreateConversationForm onClose={() => setShowCreateModal(false)} onSuccess={loadConversations} />
      </Modal>
    </>
  );
}
