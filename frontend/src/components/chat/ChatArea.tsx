import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MoreVertical, Phone, Video, Smile, Paperclip } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { chatApi } from '../../services/api';
import { websocketService } from '../../services/websocket';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { formatMessageTime } from '../../utils/time';
import { Message } from '../../types';

export default function ChatArea() {
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { user } = useAuthStore();
  const { currentConversation, messages, addMessage, setMessages, onlineUsers, typingUsers } = useChatStore();

  useEffect(() => {
    if (currentConversation) {
      loadMessages();
      websocketService.joinConversation(currentConversation.id);

      return () => {
        websocketService.leaveConversation(currentConversation.id);
      };
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages[currentConversation?.id || '']]);

  const loadMessages = async () => {
    if (!currentConversation) return;

    try {
      setIsLoading(true);
      const response = await chatApi.getMessages(currentConversation.id);
      setMessages(currentConversation.id, response.data.reverse());
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentConversation) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      const response = await chatApi.sendMessage({
        content,
        conversationId: currentConversation.id,
      });

      addMessage(currentConversation.id, response.data);
      websocketService.stopTyping(currentConversation.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTypingStart = () => {
    if (!currentConversation) return;

    websocketService.startTyping(currentConversation.id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      websocketService.stopTyping(currentConversation.id);
    }, 1000);
  };

  const getConversationTitle = () => {
    if (!currentConversation) return '';

    if (currentConversation.type === 'direct') {
      return currentConversation.participants.find((p) => p.id !== user?.id)?.username || '未知用户';
    }

    return currentConversation.name || '未命名群组';
  };

  const getConversationAvatar = () => {
    if (!currentConversation) return null;

    if (currentConversation.type === 'direct') {
      return currentConversation.participants.find((p) => p.id !== user?.id)?.avatar || null;
    }

    return currentConversation.avatar;
  };

  const getTypingUsers = () => {
    if (!currentConversation) return [];

    return Object.values(typingUsers)
      .filter((t) => t.userId !== user?.id)
      .map((t) => currentConversation.participants.find((p) => p.id === t.userId)?.username)
      .filter(Boolean);
  };

  const typingUsernames = getTypingUsers();

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">💬</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            欢迎使用聊天应用
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            从左侧选择一个对话开始聊天
          </p>
        </div>
      </div>
    );
  }

  const currentMessages = messages[currentConversation.id] || [];

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            src={getConversationAvatar()}
            fallback={getConversationTitle()}
            size="md"
          />
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {getConversationTitle()}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentConversation.type === 'group'
                ? `${currentConversation.participants.length} 位成员`
                : onlineUsers.has(
                    currentConversation.participants.find((p) => p.id !== user?.id)?.id || ''
                  )
                ? '在线'
                : '离线'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Phone size={18} />
          </Button>
          <Button variant="ghost" size="sm">
            <Video size={18} />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical size={18} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : currentMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">还没有消息，开始对话吧！</p>
          </div>
        ) : (
          <>
            {currentMessages.map((message: Message, index: number) => {
              const isOwn = message.senderId === user?.id;
              const showAvatar = index === 0 || currentMessages[index - 1].senderId !== message.senderId;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  {showAvatar && (
                    <Avatar
                      src={message.sender?.avatar}
                      fallback={message.sender?.username || 'U'}
                      size="sm"
                      status={message.sender?.status as any}
                    />
                  )}
                  {!showAvatar && <div className="w-8" />}
                  <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`message-bubble ${
                        isOwn ? 'message-bubble-sent' : 'message-bubble-received'
                      }`}
                    >
                      {showAvatar && !isOwn && (
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1 block">
                          {message.sender?.username}
                        </span>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}

        {typingUsernames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
          >
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            {typingUsernames.join(', ')} {typingUsernames.length === 1 ? '正在输入' : '正在输入'}
          </motion.div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <Button type="button" variant="ghost" size="sm" className="shrink-0">
            <Paperclip size={20} />
          </Button>
          <div className="flex-1">
            <textarea
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                if (e.target.value) handleTypingStart();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="输入消息..."
              rows={1}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all max-h-32 scrollbar-thin"
            />
          </div>
          <Button type="button" variant="ghost" size="sm" className="shrink-0">
            <Smile size={20} />
          </Button>
          <Button type="submit" size="sm" className="shrink-0" disabled={!messageInput.trim()}>
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}
