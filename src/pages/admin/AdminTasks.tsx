import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Edit3,
  X,
  Search,
  ExternalLink,
  Layers,
  Users,
  Send,
  Bell,
  Check,
  Filter,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { Task, TaskReply, Student } from '../../core/types';

export const AdminTasks: React.FC = () => {
  const { classes, activeClassId, students, refreshData } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [replies, setReplies] = useState<TaskReply[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all'); // all, open, overdue
  const [selectedReplyReqFilter, setSelectedReplyReqFilter] = useState<string>('all'); // all, require, no_require
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [selectedTaskForReplies, setSelectedTaskForReplies] = useState<Task | null>(null);
  const [isRepliesModalOpen, setIsRepliesModalOpen] = useState<boolean>(false);
  const [replyFilterTab, setReplyFilterTab] = useState<'all' | 'replied' | 'pending'>('all');
  const [replyStudentSearch, setReplyStudentSearch] = useState<string>('');

  // Form states
  const [formClassId, setFormClassId] = useState<string>('class-11a2');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formDueDate, setFormDueDate] = useState<string>('');
  const [formRequireReply, setFormRequireReply] = useState<boolean>(true);
  const [formCreatedAt, setFormCreatedAt] = useState<string>('');

  // Teacher feedback state
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tList, rList] = await Promise.all([
        dataProvider.getTasks(),
        dataProvider.getTaskReplies(),
      ]);
      setTasks(tList);
      setReplies(rList);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshData]);

  // Sync active class
  useEffect(() => {
    if (activeClassId && activeClassId !== 'all') {
      setFormClassId(activeClassId);
    }
  }, [activeClassId]);

  // Helper: check if task is overdue
  const isTaskOverdue = (dueDateStr: string): boolean => {
    if (!dueDateStr) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    return due < now;
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    setFormClassId(activeClassId !== 'all' ? activeClassId : 'class-11a2');
    setFormTitle('');
    setFormDescription('');

    // Default due date: 3 days from now
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setFormDueDate(d.toISOString().split('T')[0]);
    setFormRequireReply(true);
    setFormCreatedAt(new Date().toISOString().split('T')[0]);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setFormClassId(task.classId || 'class-11a2');
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormDueDate(task.dueDate);
    setFormRequireReply(task.requireReply ?? true);
    setFormCreatedAt(task.createdAt || new Date().toISOString().split('T')[0]);
    setIsFormModalOpen(true);
  };

  // Save Task (Create or Update)
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Vui lòng nhập tiêu đề nhiệm vụ/bài tập!');
      return;
    }
    if (!formDueDate) {
      alert('Vui lòng chọn hạn nộp!');
      return;
    }

    try {
      const createdAt = formCreatedAt.trim() || new Date().toISOString().split('T')[0];

      if (editingTaskId) {
        await dataProvider.update<Task>('tasks', editingTaskId, {
          classId: formClassId,
          title: formTitle.trim(),
          description: formDescription.trim(),
          dueDate: formDueDate,
          requireReply: formRequireReply,
          createdAt,
          assignedTo: 'all',
          status: 'open',
        });
        showToast('Cập nhật nhiệm vụ thành công!');
      } else {
        await dataProvider.add<Task>('tasks', {
          classId: formClassId,
          title: formTitle.trim(),
          description: formDescription.trim(),
          dueDate: formDueDate,
          requireReply: formRequireReply,
          createdAt,
          assignedTo: 'all',
          status: 'open',
          type: 'assignment',
        });
        showToast('Thêm nhiệm vụ mới thành công!');
      }

      setIsFormModalOpen(false);
      refreshData();
      await loadData();
    } catch (err) {
      console.error('Error saving task:', err);
      alert('Có lỗi xảy ra khi lưu nhiệm vụ.');
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này? Toàn bộ phản hồi của học sinh cũng sẽ bị gỡ bỏ.')) {
      try {
        await dataProvider.remove('tasks', id);
        showToast('Đã xóa nhiệm vụ thành công.');
        refreshData();
        await loadData();
      } catch (err) {
        console.error('Error deleting task:', err);
        alert('Không thể xóa nhiệm vụ.');
      }
    }
  };

  // Open Replies Modal
  const handleOpenReplies = (task: Task) => {
    setSelectedTaskForReplies(task);
    setReplyFilterTab('all');
    setReplyStudentSearch('');
    setIsRepliesModalOpen(true);
  };

  // Save Teacher Feedback
  const handleSaveFeedback = async (replyId: string) => {
    const feedback = feedbackMap[replyId];
    if (feedback === undefined) return;
    try {
      await dataProvider.update<TaskReply>('taskReplies', replyId, {
        feedback,
      });
      showToast('Đã lưu nhận xét phản hồi cho học sinh!');
      refreshData();
      await loadData();
    } catch (err) {
      console.error('Error saving feedback:', err);
      alert('Có lỗi khi lưu nhận xét.');
    }
  };

  // Remind Student
  const handleRemindStudent = (studentName: string) => {
    showToast(`Đã gửi thông báo nhắc nhở nộp bài đến phụ huynh em ${studentName}!`);
  };

  // Remind All Pending
  const handleRemindAllPending = (pendingCount: number) => {
    showToast(`Đã gửi tin nhắn nhắc nhở đồng loạt tới ${pendingCount} phụ huynh chưa nộp bài!`);
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Class filter
        if (selectedClassFilter !== 'all') {
          if (task.classId !== selectedClassFilter && task.classId !== 'all') return false;
        }

        // Require Reply filter
        if (selectedReplyReqFilter === 'require' && !task.requireReply) return false;
        if (selectedReplyReqFilter === 'no_require' && task.requireReply) return false;

        // Status filter
        const overdue = isTaskOverdue(task.dueDate);
        if (selectedStatusFilter === 'overdue' && !overdue) return false;
        if (selectedStatusFilter === 'open' && overdue) return false;

        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title?.toLowerCase().includes(q);
          const matchesDesc = task.description?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc) return false;
        }

        return true;
      })
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [tasks, selectedClassFilter, selectedStatusFilter, selectedReplyReqFilter, searchQuery]);

  // Calculations for selected task in replies modal
  const selectedTaskStudents = useMemo(() => {
    if (!selectedTaskForReplies) return [];
    if (selectedTaskForReplies.classId === 'all') {
      return students;
    }
    return students.filter((s) => s.classId === selectedTaskForReplies.classId);
  }, [selectedTaskForReplies, students]);

  const selectedTaskReplies = useMemo(() => {
    if (!selectedTaskForReplies) return [];
    return replies.filter((r) => r.taskId === selectedTaskForReplies.id);
  }, [selectedTaskForReplies, replies]);

  const repliedStudentsCount = useMemo(() => {
    if (!selectedTaskForReplies) return 0;
    const studentIds = new Set(selectedTaskReplies.map((r) => r.studentId));
    return selectedTaskStudents.filter((s) => studentIds.has(s.id)).length;
  }, [selectedTaskForReplies, selectedTaskReplies, selectedTaskStudents]);

  const pendingStudentsCount = selectedTaskStudents.length - repliedStudentsCount;

  const completionRate = selectedTaskStudents.length > 0
    ? Math.round((repliedStudentsCount / selectedTaskStudents.length) * 100)
    : 0;

  // Filtered student list in Replies Modal
  const modalStudentsList = useMemo(() => {
    return selectedTaskStudents.filter((st) => {
      const rep = selectedTaskReplies.find((r) => r.studentId === st.id);
      const isReplied = !!rep;

      if (replyFilterTab === 'replied' && !isReplied) return false;
      if (replyFilterTab === 'pending' && isReplied) return false;

      if (replyStudentSearch.trim()) {
        const q = replyStudentSearch.toLowerCase();
        const matchesName = st.fullName.toLowerCase().includes(q);
        const matchesRoll = st.rollNumber?.toString().includes(q);
        if (!matchesName && !matchesRoll) return false;
      }

      return true;
    });
  }, [selectedTaskStudents, selectedTaskReplies, replyFilterTab, replyStudentSearch]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản Lý Nhắc Việc & Bài Tập</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Giao nhiệm vụ, bài tập về nhà, khảo sát và theo dõi tình hình phản hồi của từng học sinh.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Giao nhiệm vụ mới</span>
        </button>
      </div>

      {/* Control Bar: Class, Search, Filter by Reply Required, Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bài tập, nội dung hướng dẫn..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shrink-0 text-xs">
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 font-medium">Lớp:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-transparent border-none text-slate-800 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả các lớp</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.className || c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Require reply filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Yêu cầu phản hồi:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedReplyReqFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedReplyReqFilter === 'all'
                    ? 'bg-purple-100 text-purple-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setSelectedReplyReqFilter('require')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedReplyReqFilter === 'require'
                    ? 'bg-purple-100 text-purple-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cần phản hồi
              </button>
              <button
                type="button"
                onClick={() => setSelectedReplyReqFilter('no_require')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedReplyReqFilter === 'no_require'
                    ? 'bg-purple-100 text-purple-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Chỉ nhắc nhở
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Thời hạn:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedStatusFilter === 'all'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatusFilter('open')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedStatusFilter === 'open'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Đang mở
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatusFilter('overdue')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedStatusFilter === 'overdue'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Đã quá hạn
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-sm">
            Đang tải danh sách bài tập & nhiệm vụ...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 text-sm">
            Không tìm thấy bài tập/nhắc việc nào phù hợp với bộ lọc.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const classObj = classes.find((c) => c.id === task.classId);
            const classNameDisplay =
              task.classId === 'all'
                ? 'Toàn trường'
                : classObj?.className || classObj?.name || task.classId || 'Lớp 11A2';

            const overdue = isTaskOverdue(task.dueDate);

            // Calculate response rate for this task
            const targetStudents =
              task.classId === 'all'
                ? students
                : students.filter((s) => s.classId === task.classId);

            const taskReplies = replies.filter((r) => r.taskId === task.id);
            const repliedCount = new Set(taskReplies.map((r) => r.studentId)).size;
            const totalCount = targetStudents.length || 1;
            const rate = Math.round((repliedCount / totalCount) * 100);

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border shadow-xs p-5 flex flex-col justify-between transition-all ${
                  overdue ? 'border-rose-200 hover:border-rose-300' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Badges & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {classNameDisplay}
                      </span>

                      {task.requireReply ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                          <CheckSquare className="w-3 h-3 text-purple-600" />
                          Cần phản hồi
                        </span>
                      ) : (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                          Chỉ nhắc nhở
                        </span>
                      )}

                      {overdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold animate-pulse">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          Quá hạn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          Đang mở
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(task)}
                        className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Chỉnh sửa nhiệm vụ"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa nhiệm vụ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-2.5 leading-snug">
                    {task.title}
                  </h2>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>

                  {/* Reply Status Progress Bar */}
                  {task.requireReply && (
                    <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Tình hình phản hồi:
                        </span>
                        <span className="font-bold text-purple-700">
                          {repliedCount}/{totalCount} học sinh ({rate}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            rate >= 80
                              ? 'bg-emerald-500'
                              : rate >= 50
                              ? 'bg-purple-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Metadata & View Replies Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Hạn: {task.dueDate}
                    </span>
                    <span>• Giao: {task.createdAt}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenReplies(task)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-xl transition-colors text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem phản hồi ({taskReplies.length})</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create & Edit Task */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingTaskId ? 'Chỉnh sửa nhiệm vụ' : 'Giao nhiệm vụ / Bài tập mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 mt-4">
              {/* Class & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giao cho lớp *
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-purple-500 bg-white"
                  >
                    <option value="all">Toàn trường (Tất cả các lớp)</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.className || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hạn chót hoàn thành (dueDate) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề nhiệm vụ / bài tập *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="VD: Bài tập Toán chuyên đề, Khảo sát đăng ký bảo hiểm..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung & Hướng dẫn học sinh / phụ huynh thực hiện *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Nêu rõ yêu cầu bài tập, cách thức giải quyết hoặc tài liệu cần tham khảo..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-purple-500 leading-relaxed"
                />
              </div>

              {/* Require Reply Toggle */}
              <div className="flex items-center justify-between p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Yêu cầu nộp phản hồi / bài tập (requireReply)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Bật tùy chọn này nếu học sinh cần gửi câu trả lời hoặc liên kết đính kèm bài làm
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formRequireReply}
                    onChange={(e) => setFormRequireReply(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Date Created */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ngày giao bài (createdAt)
                </label>
                <input
                  type="date"
                  value={formCreatedAt}
                  onChange={(e) => setFormCreatedAt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-purple-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  {editingTaskId ? 'Lưu thay đổi' : 'Giao bài tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xem Phản Hồi Theo Task & Trạng thái Đã / Chưa phản hồi */}
      {isRepliesModalOpen && selectedTaskForReplies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col my-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                    Chi tiết phản hồi
                  </span>
                  <span className="text-xs text-slate-400">
                    Hạn nộp: {selectedTaskForReplies.dueDate}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedTaskForReplies.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRepliesModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Statistics Banner: Đã phản hồi vs Chưa phản hồi */}
            <div className="grid grid-cols-3 gap-3 py-3 border-b border-slate-100 bg-slate-50/60 -mx-6 px-6">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="text-xs text-slate-500 block">Tổng số học sinh</span>
                <span className="text-lg font-bold text-slate-900">
                  {selectedTaskStudents.length} em
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200 bg-emerald-50/30">
                <span className="text-xs text-emerald-700 font-semibold block">Đã phản hồi</span>
                <span className="text-lg font-bold text-emerald-800">
                  {repliedStudentsCount} em ({completionRate}%)
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-rose-200 bg-rose-50/30">
                <span className="text-xs text-rose-700 font-semibold block">Chưa phản hồi</span>
                <span className="text-lg font-bold text-rose-800">
                  {pendingStudentsCount} em
                </span>
              </div>
            </div>

            {/* Search & Tabs: Tất cả, Đã phản hồi, Chưa phản hồi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-slate-100">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setReplyFilterTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    replyFilterTab === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({selectedTaskStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReplyFilterTab('replied')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    replyFilterTab === 'replied'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Đã phản hồi ({repliedStudentsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setReplyFilterTab('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    replyFilterTab === 'pending'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Chưa phản hồi ({pendingStudentsCount})
                </button>
              </div>

              {pendingStudentsCount > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemindAllPending(pendingStudentsCount)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Nhắc tất cả chưa nộp ({pendingStudentsCount})</span>
                </button>
              )}
            </div>

            {/* Student Search */}
            <div className="pt-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={replyStudentSearch}
                  onChange={(e) => setReplyStudentSearch(e.target.value)}
                  placeholder="Tìm học sinh theo tên hoặc số thứ tự..."
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-purple-500"
                />
              </div>
            </div>

            {/* Student Replies List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 divide-y divide-slate-100">
              {modalStudentsList.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Không có học sinh nào trong danh sách đang chọn.
                </div>
              ) : (
                modalStudentsList.map((st) => {
                  const rep = selectedTaskReplies.find((r) => r.studentId === st.id);
                  const isReplied = !!rep;

                  return (
                    <div key={st.id} className="pt-3 first:pt-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900">
                            {st.rollNumber}. {st.fullName}
                          </span>
                          <span className="text-xs text-slate-400">({st.group || 'Tổ 1'})</span>
                        </div>

                        {/* Status Badge: Đã phản hồi / Chưa phản hồi */}
                        <div className="flex items-center gap-2">
                          {isReplied ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Đã phản hồi
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-700">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                Chưa phản hồi
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemindStudent(st.fullName)}
                                className="text-[11px] font-medium text-slate-500 hover:text-purple-600 bg-slate-100 hover:bg-purple-50 px-2 py-0.5 rounded-md transition-colors"
                              >
                                Nhắc nhở
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reply Content & Attached Links */}
                      {rep ? (
                        <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-2">
                          <div>
                            <span className="text-slate-400 font-medium text-[11px] block">
                              Nội dung phản hồi (replyText):
                            </span>
                            <p className="text-slate-900 font-medium leading-relaxed mt-0.5 whitespace-pre-wrap">
                              {rep.replyText || rep.content}
                            </p>
                          </div>

                          {/* Link đính kèm attachmentsJson */}
                          {rep.attachmentsJson && (
                            <div className="pt-1.5 border-t border-slate-200/60 flex items-center gap-2">
                              <span className="text-[11px] text-slate-500 font-medium">
                                Liên kết đính kèm:
                              </span>
                              <a
                                href={rep.attachmentsJson}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:underline bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100 truncate max-w-sm"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{rep.attachmentsJson}</span>
                              </a>
                            </div>
                          )}

                          <div className="text-slate-400 text-[11px]">
                            Thời gian gửi: {rep.createdAt || rep.submittedAt}
                          </div>

                          {/* Existing feedback */}
                          {rep.feedback && (
                            <div className="text-purple-900 bg-purple-50/80 p-2 rounded-lg border border-purple-100">
                              <strong>Nhận xét của GVCN:</strong> {rep.feedback}
                            </div>
                          )}

                          {/* Teacher feedback input */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Nhập nhận xét / phê duyệt bài làm..."
                              value={feedbackMap[rep.id] ?? ''}
                              onChange={(e) =>
                                setFeedbackMap((prev) => ({ ...prev, [rep.id]: e.target.value }))
                              }
                              className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-purple-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveFeedback(rep.id)}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                            >
                              Lưu nhận xét
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic mt-1 pl-1">
                          Học sinh và phụ huynh chưa gửi phản hồi bài tập.
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsRepliesModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
