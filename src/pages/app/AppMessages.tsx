import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Phone,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { MessageThread, Message } from '../../core/types';

export const AppMessages: React.FC = () => {
  const { activeStudent, activeParent, classInfo, refreshData } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threadId = activeStudent ? `thread-${activeStudent.id}` : '';

  const loadMessages = async () => {
    if (!threadId) return;
    const msgs = await dataProvider.getMessages(threadId);
    setMessages(msgs);
  };

  useEffect(() => {
    loadMessages();
  }, [threadId, refreshData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeStudent) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !threadId) return;

    const content = inputText.trim();
    setInputText('');

    try {
      await dataProvider.sendMessage(threadId, {
        senderId: activeParent?.id || 'parent',
        senderName: `${activeParent?.fullName || 'Phụ huynh'} (${activeParent?.relationship || 'PH'})`,
        senderRole: 'parent',
        content,
      });

      await loadMessages();
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi gửi tin nhắn.');
    }
  };

  const handleQuickSend = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900">
            Kênh Trao đổi với Thầy {classInfo?.homeroomTeacher.name} (GVCN)
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">
          Kênh liên lạc trực tiếp, bảo mật giữa gia đình em {activeStudent.fullName} và giáo viên chủ nhiệm.
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[580px]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              GV
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">
                Thầy {classInfo?.homeroomTeacher.name}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>GVCN Lớp {classInfo?.name}</span>
                <span>•</span>
                <a
                  href={`tel:${classInfo?.homeroomTeacher.phone}`}
                  className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <Phone className="w-3 h-3" />
                  {classInfo?.homeroomTeacher.phone}
                </a>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Kênh chính thức từ nhà trường</span>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
              <span>Chưa có tin nhắn trong cuộc trò chuyện này.</span>
              <span className="text-[11px] text-slate-400 mt-1">
                Gia đình có thể nhắn tin để hỏi thăm tình hình học tập hoặc báo cáo việc riêng.
              </span>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderRole === 'parent' || msg.senderRole === 'student';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-slate-400 px-1 mb-0.5">
                    {msg.senderName} • {msg.sentAt}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 pt-2 bg-white flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Gợi ý nhanh:
          </span>
          <button
            type="button"
            onClick={() =>
              handleQuickSend(
                'Kính gửi Thầy, gia đình xin cảm ơn Thầy đã luôn quan tâm và đồng hành cùng cháu ạ!'
              )
            }
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] whitespace-nowrap"
          >
            Cảm ơn thầy cô
          </button>
          <button
            type="button"
            onClick={() =>
              handleQuickSend(
                'Thầy cho gia đình hỏi tuần này cháu có bài tập hoặc hoạt động nào cần chuẩn bị thêm không ạ?'
              )
            }
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] whitespace-nowrap"
          >
            Hỏi bài tập về nhà
          </button>
          <button
            type="button"
            onClick={() =>
              handleQuickSend(
                'Nhờ Thầy nhắc nhở cháu tập trung hơn trong giờ tự học trên lớp giúp gia đình với ạ.'
              )
            }
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] whitespace-nowrap"
          >
            Nhờ thầy đôn đốc
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            placeholder="Nhập lời nhắn gửi tới Thầy Trần Quang Huy..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
};
