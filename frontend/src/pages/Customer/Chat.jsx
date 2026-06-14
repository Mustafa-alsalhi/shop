import React, { useState, useEffect, useRef } from 'react';
import { ChatBubbleLeftIcon, PaperAirplaneIcon, UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import chatService from '../../services/chatService';

const CustomerChat = () => {
  const { sellerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);
  const sellerName = location.state?.sellerName || 'البائع';

  const handleBack = () => {
    navigate(-1);
  };
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (sellerId) {
      fetchMessages(sellerId);
      // Mark messages as read
      chatService.markAsRead(sellerId);
    }
  }, [sellerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (userId) => {
    try {
      setLoading(true);
      const data = await chatService.getMessages(userId);
      setMessages(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('فشل في جلب الرسائل');
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !sellerId) return;

    try {
      const messageData = await chatService.sendMessage(sellerId, newMessage);
      setMessages([...messages, messageData]);
      setNewMessage('');
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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-white hover:text-amber-100 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{sellerName || 'البائع'}</h3>
              <p className="text-sm text-amber-100">دردشة مباشرة</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">جاري التحميل...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ChatBubbleLeftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ابدأ المحادثة مع البائع</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUser?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
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
          })
        )}
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors flex items-center gap-2"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            إرسال
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerChat;
