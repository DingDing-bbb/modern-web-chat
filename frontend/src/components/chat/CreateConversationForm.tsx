import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { chatApi, usersApi } from '../../services/api';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface CreateConversationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateConversationForm({ onClose, onSuccess }: CreateConversationFormProps) {
  const [conversationType, setConversationType] = useState<'direct' | 'group'>('direct');
  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuthStore();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersApi.getUsers();
      setAllUsers(response.data.filter((u: any) => u.id !== user?.id));
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const filteredUsers = allUsers.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (conversationType === 'direct' && selectedUsers.length !== 1) {
        setError('请选择一个用户');
        return;
      }

      if (conversationType === 'group' && selectedUsers.length < 1) {
        setError('请至少选择一个用户');
        return;
      }

      if (conversationType === 'group' && !name.trim()) {
        setError('请输入群组名称');
        return;
      }

      await chatApi.createConversation({
        name: conversationType === 'group' ? name : undefined,
        type: conversationType,
        participantIds: selectedUsers,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || '创建对话失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          对话类型
        </label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={conversationType === 'direct' ? 'primary' : 'secondary'}
            className="flex-1"
            onClick={() => {
              setConversationType('direct');
              setSelectedUsers(selectedUsers.slice(0, 1));
            }}
          >
            私聊
          </Button>
          <Button
            type="button"
            variant={conversationType === 'group' ? 'primary' : 'secondary'}
            className="flex-1"
            onClick={() => setConversationType('group')}
          >
            群组
          </Button>
        </div>
      </div>

      {conversationType === 'group' && (
        <Input
          label="群组名称"
          type="text"
          placeholder="输入群组名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <Users size={16} className="inline mr-2" />
          选择成员 ({selectedUsers.length})
        </label>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="搜索用户..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-2">
          {filteredUsers.map((u) => {
            const isSelected = selectedUsers.includes(u.id);
            return (
              <motion.button
                key={u.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleUserSelection(u.id)}
                disabled={conversationType === 'direct' && selectedUsers.length >= 1 && !isSelected}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                } disabled:opacity-50`}
              >
                <Avatar src={u.avatar} fallback={u.username} size="md" status={u.status as any} />
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white">{u.username}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                </div>
                {isSelected && <X size={18} className="text-primary" />}
              </motion.button>
            );
          })}

          {filteredUsers.length === 0 && (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              没有找到用户
            </p>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          取消
        </Button>
        <Button type="submit" isLoading={isLoading} className="flex-1">
          创建
        </Button>
      </div>
    </form>
  );
}
