import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Users,
  Search,
  Phone,
  Sparkles,
  PlusCircle,
  GraduationCap,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { Thread, Message } from '../../core/types';

export const AdminMessages: React.FC = () => {
  const { students, parents, classes, activeClassId, classInfo, refreshData } = useApp();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [threadTypeFilter, setThreadTypeFilter] = useState<'all' | 'class' | 'student'>('all');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load threads
  const loadThreads = async () => {
    try {
      const list = await dataProvider.getMessageThreads();
      setThreads(list);
      if (list.length > 0 && !activeThreadId) {
        setActiveThreadId(list[0].id);
      }
    } catch (err) {
      console.error('Error loading threads:', err);
    }
  };

  // Load messages for the active thread
  const loadMessages = async (threadId: string) => {
    if (!threadId) return;
    try {
      // Use listMessages as required by prompt
      const msgs = await dataProvider.listMessages(threadId);
      setMessages(msgs);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [refreshData]);

  useEffect(() => {
    if (activeThreadId) {
      loadMessages(activeThreadId);
    }
  }, [activeThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const activeStudent = students.find((s) => s.id === activeThread?.studentId || s.id === activeThread?.threadKey);
  const activeParent = parents.find((p) => p.id === activeThread?.parentId || p.studentId === activeStudent?.id);

  // Quick switch or create thread for a student or class
  const handleSelectOrCreateThread = async (key: string, title?: string) => {
    const thread = await dataProvider.getOrCreateThread(key, title);
    await loadThreads();
    setActiveThreadId(thread.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThreadId || isSending) return;

    const content = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await dataProvider.sendMessage(activeThreadId, {
        content,
        fromRole: 'TEACHER',
        senderName: classInfo?.homeroomTeacher.name || 'Thầy Trần Quang Huy (GVCN)',
        senderRole: 'admin',
      });

      await loadMessages(activeThreadId);
      await loadThreads();
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi gửi tin nhắn.');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInputText(text);
  };

  // Filtered threads
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      if (threadTypeFilter === 'class' && !t.threadKey?.startsWith('class-')) return false;
      if (threadTypeFilter === 'student' && t.threadKey?.startsWith('class-')) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = t.title?.toLowerCase().includes(q);
        const matchesKey = t.threadKey?.toLowerCase().includes(q);
        const matchesMsg = t.lastMessage?.toLowerCase().includes(q);
        return matchesTitle || matchesKey || matchesMsg;
      }
      return true;
    });
  }, [threads, threadTypeFilter, searchTerm]);

  // Role badge helper
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'TEACHER':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            Giáo viên (GVCN)
          </span>
        );
      case 'STUDENT':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            Học sinh
          </span>
        );
      case 'PARENT':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Phụ huynh
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Tin nhắn & Hộp thư trao đổi</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Kênh liên lạc chính thống theo từng học sinh (1-1) hoặc trao đổi chung cả lớp
              </p>
            </div>
          </div>
        </div>

        {/* Quick action: Open Class Thread */}
        <button
          type="button"
          onClick={() => handleSelectOrCreateThread(activeClassId || 'class-11a2', `Kênh chung Lớp ${classInfo?.name || '11A2'}`)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Mở Kênh chung Lớp {classInfo?.name || '11A2'}</span>
        </button>
      </div>

      {/* 2-Column Chat Interface (Inbox Style) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row h-[660px]">
        {/* Left Column: Threads List */}
        <div className="w-full md:w-84 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-slate-200 bg-white space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm hội thoại theo tên, mã HS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setThreadTypeFilter('all')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  threadTypeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({threads.length})
              </button>
              <button
                type="button"
                onClick={() => setThreadTypeFilter('class')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  threadTypeFilter === 'class'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Cả lớp
              </button>
              <button
                type="button"
                onClick={() => setThreadTypeFilter('student')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  threadTypeFilter === 'student'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Từng HS
              </button>
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Không tìm thấy cuộc trò chuyện nào.
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = t.id === activeThreadId;
                const isClassThread = t.threadKey?.startsWith('class-');

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveThreadId(t.id)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                      isSelected ? 'bg-blue-50/90 border-l-4 border-l-blue-600' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isClassThread
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isClassThread ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {t.title || `Hội thoại ${t.threadKey}`}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {t.lastMessageAt ? t.lastMessageAt.split(' ')[1] || t.lastMessageAt : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-slate-200/70 text-slate-600 font-mono">
                          {t.threadKey}
                        </span>
                        <p className="text-xs text-slate-500 truncate">
                          {t.lastMessage || 'Chưa có tin nhắn'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Start with Student Footer */}
          <div className="p-2.5 bg-white border-t border-slate-200">
            <details className="group">
              <summary className="cursor-pointer text-xs font-semibold text-blue-600 flex items-center justify-between p-1 rounded-lg hover:bg-blue-50">
                <span className="flex items-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" /> Tạo hội thoại với học sinh khác
                </span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
              </summary>
              <div className="mt-2 max-h-36 overflow-y-auto divide-y divide-slate-100 bg-slate-50 rounded-xl border border-slate-200 p-1">
                {students.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectOrCreateThread(st.id, `Học sinh ${st.fullName}`)}
                    className="w-full text-left px-2 py-1.5 hover:bg-blue-100 rounded-lg text-[11px] flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-700">{st.fullName} ({st.group || 'Tổ 1'})</span>
                    <span className="text-slate-400 font-mono text-[10px]">{st.id}</span>
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>

        {/* Right Column: Chat Window (Inbox Style) */}
        <div className="flex-1 flex flex-col bg-white">
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                      activeThread.threadKey?.startsWith('class-')
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {activeThread.threadKey?.startsWith('class-') ? (
                      <Users className="w-5 h-5" />
                    ) : (
                      activeStudent?.fullName?.charAt(0) || <User className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-sm text-slate-900">
                        {activeThread.title || `Hội thoại ${activeThread.threadKey}`}
                      </h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        Key: {activeThread.threadKey}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      {activeThread.threadKey?.startsWith('class-') ? (
                        <span>Kênh trao đổi nhóm Lớp {classInfo?.name || '11A2'} (Toàn bộ PH & HS)</span>
                      ) : (
                        <>
                          <span>Học sinh: {activeStudent?.fullName || activeThread.threadKey}</span>
                          {activeParent && (
                            <>
                              <span>•</span>
                              <span>PH: {activeParent.fullName}</span>
                              {activeParent.phone && (
                                <a
                                  href={`tel:${activeParent.phone}`}
                                  className="text-blue-600 hover:underline flex items-center gap-0.5"
                                >
                                  <Phone className="w-3 h-3" />
                                  {activeParent.phone}
                                </a>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                  <span>Participants:</span>
                  <span className="font-semibold text-slate-700">TEACHER, PARENT, STUDENT</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                    <span>Chưa có tin nhắn trong cuộc trò chuyện này.</span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      Nhập tin nhắn bên dưới để bắt đầu trao đổi.
                    </span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.fromRole === 'TEACHER' || msg.senderRole === 'admin';
                    const role = msg.fromRole || (msg.senderRole === 'student' ? 'STUDENT' : 'PARENT');

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 mb-1">
                          {renderRoleBadge(role)}
                          <span className="font-semibold text-slate-600">{msg.senderName || role}</span>
                          <span>•</span>
                          <span>{msg.createdAt || msg.sentAt}</span>
                        </div>
                        <div
                          className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                              : role === 'STUDENT'
                              ? 'bg-amber-50 text-slate-800 border border-amber-200 rounded-bl-xs shadow-xs'
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-xs'
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

              {/* Quick Replies Bar */}
              <div className="px-3 pt-2 bg-white flex items-center gap-1.5 overflow-x-auto text-xs border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Trả lời nhanh:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickReply('Thầy đã nhận được thông tin, cảm ơn gia đình đã phối hợp ạ!')
                  }
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] whitespace-nowrap transition-colors"
                >
                  Đã nhận thông tin
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickReply('Thầy xác nhận cho em nghỉ học có phép hôm nay ạ. Chúc em sớm khỏe!')
                  }
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] whitespace-nowrap transition-colors"
                >
                  Xác nhận nghỉ có phép
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickReply('Em tuần này có nhiều tiến bộ trong học tập và nề nếp lớp!')
                  }
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] whitespace-nowrap transition-colors"
                >
                  Khen ngợi tiến bộ
                </button>
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn phản hồi tới phụ huynh / học sinh..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{isSending ? 'Đang gửi...' : 'Gửi'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm p-8">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
              <span>Chọn một cuộc trò chuyện ở cột bên trái để bắt đầu trao đổi.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
