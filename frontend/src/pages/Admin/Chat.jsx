import React, { useState, useEffect, useRef } from 'react';
import { ChatBubbleLeftIcon, PaperAirplaneIcon, UserIcon, XMarkIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import chatService from '../../services/chatService';

const AdminChat = () => {
  const currentUser = useSelector(selectUser);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const [showConversationList, setShowConversationList] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user_id);
      // Mark messages as read
      chatService.markAsRead(selectedConversation.user_id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations();
      console.log('Conversations data:', data);
      setConversations(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('فشل في جلب المحادثات: ' + err.message);
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const data = await chatService.getMessages(userId);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageData = await chatService.sendMessage(
        selectedConversation.user_id,
        newMessage
      );
      setMessages([...messages, messageData]);
      setNewMessage('');
      
      // Refresh conversations to update last message
      fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('فشل في إرسال الرسالة');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'اليوم';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'أمس';
    } else {
      return date.toLocaleDateString('ar-SA', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <ChatBubbleLeftIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                الدردشة مع العملاء
              </h1>
              {/* Mobile toggle button */}
              <button
                onClick={() => setShowConversationList(!showConversationList)}
                className="lg:hidden p-2 text-white hover:bg-white/20 rounded-lg"
              >
                {showConversationList ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <ChatBubbleLeftIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] min-h-[500px] lg:min-h-[600px]">
            {/* Conversations List */}
            <div className={`${showConversationList ? 'flex' : 'hidden'} lg:flex lg:w-1/3 w-full border-l border-gray-200 bg-gray-50 overflow-y-auto`}>
              <div className="p-4 border-b border-gray-200 bg-white">
                <h2 className="font-semibold text-gray-900">المحادثات</h2>
              </div>

              {loading ? (
                <div className="p-4 text-center text-gray-500">جاري التحميل...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">لا توجد محادثات</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.user_id}
                    onClick={() => {
                      console.log('Selected conversation:', conv);
                      console.log('Conversation details:', JSON.stringify(conv, null, 2));
                      setSelectedConversation(conv);
                      setShowConversationList(false);
                    }}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                      selectedConversation?.user_id === conv.user_id
                        ? 'bg-amber-50 border-l-4 border-l-amber-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                            {conv.name || 'غير معروف'}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatDate(conv.last_message_time)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conv.last_message}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {conv.email || 'لا يوجد بريد'}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full mt-1">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowConversationList(true)}
                        className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <ChevronLeftIcon className="h-6 w-6" />
                      </button>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {selectedConversation.name || 'غير معروف'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">{selectedConversation.email || 'لا يوجد بريد'}</p>
                        <p className="text-xs text-gray-400">
                          <span className="font-medium">الهاتف:</span> {selectedConversation.phone || 'غير متوفر'}
                        </p>
                        <p className="text-xs text-gray-400">
                          <span className="font-medium">المدينة:</span> {selectedConversation.city || 'غير متوفر'}
                        </p>
                        <p className="text-xs text-gray-400">
                          <span className="font-medium">العنوان:</span> {selectedConversation.address || 'غير متوفر'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUser?.id;
            return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 ${
                              isCurrentUser
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isCurrentUser ? 'text-amber-100' : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="اكتب رسالتك هنا..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors flex items-center gap-2 text-sm"
                      >
                        <PaperAirplaneIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">إرسال</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <ChatBubbleLeftIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">اختر محادثة للبدء</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
