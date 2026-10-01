import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Send,
  X,
  ExternalLink,
  Layers,
  Search,
  MessageSquare,
  Check,
  Calendar,
  Link2,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { Task, TaskReply } from '../../core/types';

export const AppTasks: React.FC = () => {
  const { classes, activeClassId, classInfo, activeStudent, activeParent, refreshData } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [replies, setReplies] = useState<TaskReply[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [currentClassFilter, setCurrentClassFilter] = useState<string>(activeClassId || 'class-11a2');
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal for replying
  const [activeTaskToReply, setActiveTaskToReply] = useState<Task | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [attachmentsJson, setAttachmentsJson] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync active class
  useEffect(() => {
    if (activeClassId) {
      setCurrentClassFilter(activeClassId);
    }
  }, [activeClassId]);

  const loadData = async () => {
    if (!activeStudent) return;
    try {
      setIsLoading(true);
      const [tList, rList] = await Promise.all([
        dataProvider.getTasks(currentClassFilter),
        dataProvider.getTaskReplies(),
      ]);
      setTasks(tList);
      setReplies(rList.filter((r) => r.studentId === activeStudent.id));
    } catch (err) {
      console.error('Error loading tasks in App:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeStudent, currentClassFilter, refreshData]);

  if (!activeStudent) return null;

  // Check if a task is overdue
  const isTaskOverdue = (dueDateStr: string): boolean => {
    if (!dueDateStr) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    return due < now;
  };

  // Identify overdue tasks that require reply and have not been replied to yet
  const overduePendingTasks = useMemo(() => {
    return tasks.filter((t) => {
      const myReply = replies.find((r) => r.taskId === t.id);
      return t.requireReply && !myReply && isTaskOverdue(t.dueDate);
    });
  }, [tasks, replies]);

  // Open Reply Modal
  const handleOpenReplyModal = (task: Task) => {
    const existing = replies.find((r) => r.taskId === task.id);
    setReplyText(existing?.replyText || existing?.content || '');
    setAttachmentsJson(existing?.attachmentsJson || (existing?.attachments ? existing.attachments[0] : '') || '');
    setActiveTaskToReply(task);
  };

  // Submit Reply
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaskToReply) return;
    if (!replyText.trim()) {
      alert('Vui lòng nhập nội dung phản hồi / bài giải!');
      return;
    }

    try {
      setIsSubmitting(true);
      // Call provider method: replyTask(taskId, payload)
      await dataProvider.replyTask(activeTaskToReply.id, {
        studentId: activeStudent.id,
        parentId: activeParent?.id,
        replyText: replyText.trim(),
        attachmentsJson: attachmentsJson.trim(),
        status: 'completed',
      });

      setIsSubmitting(false);
      setActiveTaskToReply(null);
      setReplyText('');
      setAttachmentsJson('');
      showToast('Đã gửi phản hồi bài tập thành công!');
      refreshData();
      await loadData();
    } catch (err) {
      console.error('Error submitting reply:', err);
      setIsSubmitting(false);
      alert('Có lỗi xảy ra khi gửi phản hồi.');
    }
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const myReply = replies.find((r) => r.taskId === task.id);
      const isReplied = !!myReply;
      const overdue = isTaskOverdue(task.dueDate);

      if (selectedTab === 'pending') {
        if (!task.requireReply || isReplied) return false;
      } else if (selectedTab === 'completed') {
        if (!isReplied) return false;
      } else if (selectedTab === 'overdue') {
        if (!overdue || isReplied) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [tasks, replies, selectedTab, searchQuery]);

  const currentClassName =
    classes.find((c) => c.id === currentClassFilter)?.className ||
    classInfo?.className ||
    classInfo?.name ||
    'Lớp 11A2';

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Nhiệm Vụ & Bài Tập - {activeStudent.fullName}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi bài tập về nhà, khảo sát ý kiến và nộp bài trực tuyến kèm liên kết tài liệu
              </p>
            </div>
          </div>
        </div>

        {/* Class Switcher */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 self-start sm:self-auto">
          <Layers className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">Lớp:</span>
          <select
            value={currentClassFilter}
            onChange={(e) => setCurrentClassFilter(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-purple-700 focus:outline-hidden cursor-pointer"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.className || c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CẢNH BÁO QUÁ HẠN (Overdue Alert Banner) */}
      {overduePendingTasks.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-rose-900">
                  Cảnh báo quá hạn nộp bài tập & nhắc việc!
                </h3>
                <span className="text-[11px] font-extrabold px-2 py-0.5 bg-rose-600 text-white rounded-full">
                  {overduePendingTasks.length} nhiệm vụ
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                Em có {overduePendingTasks.length} bài tập đã quá hạn nộp. Vui lòng hoàn thành ngay và gửi phản hồi kèm link bài làm để thầy cô tổng hợp điểm.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedTab('overdue')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Xem các bài quá hạn</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTab === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tất cả ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTab === 'pending'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Chưa nộp
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTab === 'completed'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Đã nộp ({replies.length})
            </button>
            {overduePendingTasks.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTab('overdue')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTab === 'overdue'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                ⚠️ Quá hạn ({overduePendingTasks.length})
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bài tập theo tên..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-sm">
            Đang tải danh sách bài tập...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 text-sm">
            Không có nhiệm vụ nào trong danh mục này.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const myReply = replies.find((r) => r.taskId === task.id);
            const isDone = !!myReply;
            const overdue = isTaskOverdue(task.dueDate) && !isDone;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border shadow-xs p-5 flex flex-col justify-between transition-all ${
                  overdue
                    ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                    : isDone
                    ? 'border-emerald-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Đã gửi phản hồi
                        </span>
                      ) : overdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700 animate-pulse">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          Đã quá hạn nộp
                        </span>
                      ) : task.requireReply ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-800">
                          <Clock className="w-3 h-3 text-purple-600" />
                          Chờ nộp bài
                        </span>
                      ) : (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                          Chỉ xem thông tin
                        </span>
                      )}

                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                        Hạn: {task.dueDate}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="font-bold text-sm sm:text-base text-slate-900 mt-2.5 line-clamp-2 leading-snug">
                    {task.title}
                  </h2>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {task.description}
                  </p>

                  {/* Submitted Reply View (If already replied) */}
                  {isDone && myReply && (
                    <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-emerald-800 font-semibold text-[11px]">
                        <span>Nội dung đã gửi:</span>
                        <span className="text-slate-400 font-normal">{myReply.createdAt || myReply.submittedAt}</span>
                      </div>
                      <p className="text-slate-800 font-medium whitespace-pre-wrap">
                        {myReply.replyText || myReply.content}
                      </p>

                      {/* Attached link attachmentsJson */}
                      {myReply.attachmentsJson && (
                        <div className="pt-1.5 border-t border-emerald-200/60 flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-[11px] text-slate-500 font-medium">Đính kèm:</span>
                          <a
                            href={myReply.attachmentsJson}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1 truncate max-w-xs"
                          >
                            <span className="truncate">{myReply.attachmentsJson}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      )}

                      {/* Teacher Feedback */}
                      {myReply.feedback && (
                        <div className="mt-2 text-purple-900 bg-purple-50 p-2 rounded-lg border border-purple-100 text-[11px]">
                          <strong>Nhận xét của GVCN:</strong> {myReply.feedback}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    Giao: {task.createdAt}
                  </span>

                  {task.requireReply ? (
                    <button
                      type="button"
                      onClick={() => handleOpenReplyModal(task)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors shadow-xs ${
                        isDone
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : overdue
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isDone ? 'Cập nhật bài nộp' : overdue ? 'Nộp bài bổ sung' : 'Nộp phản hồi / bài làm'}</span>
                    </button>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">
                      Không yêu cầu gửi phản hồi
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Gửi phản hồi / Nộp bài tập + Đính kèm link attachmentsJson */}
      {activeTaskToReply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                  Nộp bài tập / Phản hồi
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {activeTaskToReply.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTaskToReply(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overdue alert in modal if overdue */}
            {isTaskOverdue(activeTaskToReply.dueDate) && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Lưu ý: Nhiệm vụ này đã quá hạn nộp ({activeTaskToReply.dueDate}). Thầy cô vẫn ghi nhận bài nộp bổ sung của em.
                </span>
              </div>
            )}

            {/* Task summary */}
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800 block mb-1">Yêu cầu từ giáo viên:</span>
              {activeTaskToReply.description}
            </div>

            <form onSubmit={handleSubmitReply} className="space-y-4 mt-4">
              {/* replyText */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung phản hồi / Bài giải / Ý kiến đóng góp *
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ghi rõ câu trả lời, cách giải tóm tắt hoặc phản hồi của học sinh và gia đình..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-purple-500 leading-relaxed"
                />
              </div>

              {/* attachmentsJson (link đính kèm) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đính kèm đường dẫn bài làm (attachmentsJson)
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={attachmentsJson}
                    onChange={(e) => setAttachmentsJson(e.target.value)}
                    placeholder="https://docs.google.com/... hoặc https://drive.google.com/... hoặc link ảnh/video"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-purple-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Dán đường link Google Drive, Google Docs, Canva, YouTube hoặc kho lưu trữ trực tuyến để giáo viên tiện chấm bài.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTaskToReply(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
