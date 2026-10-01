import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Plus,
  ThumbsUp,
  AlertTriangle,
  Search,
  Filter,
  Trash2,
  Edit3,
  X,
  User,
  Sparkles,
  Calendar,
  ShieldAlert,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { Behavior, BehaviorType, Student } from '../../core/types';

export const AdminBehavior: React.FC = () => {
  const { students, classInfo, refreshData } = useApp();
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');
  const [typeFilter, setTypeFilter] = useState<'all' | 'PRAISE' | 'WARN'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal: Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBehavior, setEditingBehavior] = useState<Behavior | null>(null);

  // Form states
  const [formStudentId, setFormStudentId] = useState<string>('');
  const [formType, setFormType] = useState<'PRAISE' | 'WARN'>('PRAISE');
  const [formPoints, setFormPoints] = useState<number>(5);
  const [formContent, setFormContent] = useState('');
  const [formDate, setFormDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [formRecordedBy, setFormRecordedBy] = useState<string>('');
  const [formIsSensitive, setFormIsSensitive] = useState<boolean>(false);

  // Quick suggestion tags
  const praiseSuggestions = [
    'Hăng hái phát biểu xây dựng bài trong giờ học',
    'Đạt điểm 10 kiểm tra miệng / 15 phút',
    'Giúp đỡ bạn học tập tiến bộ trong nhóm',
    'Trực nhật vệ sinh lớp học sạch sẽ, đúng giờ',
    'Tham gia tích cực phong trào Đoàn và văn nghệ',
    'Nhặt được của rơi trả người đánh mất',
  ];

  const warnSuggestions = [
    'Đi học muộn sau hiệu lệnh trống',
    'Không thuộc bài / thiếu bài tập về nhà',
    'Nói chuyện riêng, mất trật tự trong giờ học',
    'Quên mang sách giáo khoa và dụng cụ học tập',
    'Chưa đúng quy định đồng phục / tác phong',
    'Sử dụng điện thoại di động khi chưa được phép',
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dataProvider.getBehaviors();
      setBehaviors(data);
    } catch (err) {
      console.error('Error loading behaviors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshData]);

  // Set default form values
  useEffect(() => {
    if (students.length > 0 && !formStudentId) {
      setFormStudentId(students[0].id);
    }
  }, [students, formStudentId]);

  useEffect(() => {
    if (!formRecordedBy) {
      setFormRecordedBy(classInfo?.homeroomTeacher?.name || 'Thầy Trần Quang Huy (GVCN)');
    }
  }, [classInfo, formRecordedBy]);

  // Open modal for Adding
  const handleOpenAdd = (type: 'PRAISE' | 'WARN' = 'PRAISE', studentId?: string) => {
    setEditingBehavior(null);
    setFormType(type);
    setFormPoints(type === 'PRAISE' ? 5 : -2);
    setFormContent('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormRecordedBy(classInfo?.homeroomTeacher?.name || 'Thầy Trần Quang Huy (GVCN)');
    setFormIsSensitive(false);
    if (studentId && studentId !== 'all') {
      setFormStudentId(studentId);
    } else if (selectedStudentId !== 'all') {
      setFormStudentId(selectedStudentId);
    } else if (students.length > 0) {
      setFormStudentId(students[0].id);
    }
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (b: Behavior) => {
    setEditingBehavior(b);
    setFormStudentId(b.studentId);
    const normalizedType = b.type === 'WARN' || b.type === 'negative' ? 'WARN' : 'PRAISE';
    setFormType(normalizedType);
    setFormPoints(b.points);
    setFormContent(b.content || b.description || b.title || '');
    setFormDate(b.date);
    setFormRecordedBy(b.recordedBy || classInfo?.homeroomTeacher?.name || 'GVCN');
    setFormIsSensitive(Boolean(b.isSensitive));
    setIsModalOpen(true);
  };

  // Submit Add or Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId) {
      alert('Vui lòng chọn học sinh!');
      return;
    }
    if (!formContent.trim()) {
      alert('Vui lòng nhập nội dung ghi nhận nề nếp!');
      return;
    }

    try {
      if (editingBehavior) {
        // Update existing
        await dataProvider.updateBehavior(editingBehavior.id, {
          studentId: formStudentId,
          date: formDate,
          type: formType,
          content: formContent.trim(),
          title: formContent.trim().slice(0, 40),
          points: Number(formPoints),
          recordedBy: formRecordedBy,
          isSensitive: formIsSensitive,
        });
        alert('Đã cập nhật ghi nhận nề nếp thành công!');
      } else {
        // Create new
        await dataProvider.addBehavior({
          studentId: formStudentId,
          date: formDate,
          type: formType,
          content: formContent.trim(),
          title: formContent.trim().slice(0, 40),
          points: Number(formPoints),
          recordedBy: formRecordedBy,
          isSensitive: formIsSensitive,
        });
        alert('Đã thêm ghi nhận nề nếp thành công!');
      }

      setIsModalOpen(false);
      refreshData();
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi lưu ghi nhận.');
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi nề nếp này không?')) {
      try {
        await dataProvider.deleteBehavior(id);
        setBehaviors((prev) => prev.filter((b) => b.id !== id));
        refreshData();
      } catch (err) {
        console.error(err);
        alert('Không thể xóa bản ghi.');
      }
    }
  };

  // Filter calculations
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffMon = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diffMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const monStr = monday.toISOString().split('T')[0];
  const sunStr = sunday.toISOString().split('T')[0];
  const curMonthStr = now.toISOString().substring(0, 7);

  const filteredBehaviors = useMemo(() => {
    return behaviors.filter((b) => {
      // Time filter
      if (timeFilter === 'week') {
        if (b.date < monStr || b.date > sunStr) return false;
      } else if (timeFilter === 'month') {
        if (!b.date.startsWith(curMonthStr)) return false;
      }

      // Type filter
      const isPraise = b.type === 'PRAISE' || b.type === 'positive';
      const isWarn = b.type === 'WARN' || b.type === 'negative';
      if (typeFilter === 'PRAISE' && !isPraise) return false;
      if (typeFilter === 'WARN' && !isWarn) return false;

      // Student filter
      if (selectedStudentId !== 'all' && b.studentId !== selectedStudentId) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const student = students.find((s) => s.id === b.studentId);
        const matchContent = (b.content || '').toLowerCase().includes(q);
        const matchTitle = (b.title || '').toLowerCase().includes(q);
        const matchStudent = (student?.fullName || '').toLowerCase().includes(q);
        if (!matchContent && !matchTitle && !matchStudent) return false;
      }

      return true;
    });
  }, [behaviors, timeFilter, typeFilter, selectedStudentId, searchQuery, monStr, sunStr, curMonthStr, students]);

  // Overall Statistics according to timeFilter
  const statsInTimeRange = useMemo(() => {
    const list = behaviors.filter((b) => {
      if (timeFilter === 'week') {
        return b.date >= monStr && b.date <= sunStr;
      }
      if (timeFilter === 'month') {
        return b.date.startsWith(curMonthStr);
      }
      return true;
    });

    const praiseItems = list.filter((b) => b.type === 'PRAISE' || b.type === 'positive');
    const warnItems = list.filter((b) => b.type === 'WARN' || b.type === 'negative');
    const totalPraisePoints = praiseItems.reduce((acc, b) => acc + (b.points > 0 ? b.points : 0), 0);
    const totalWarnDeductions = warnItems.reduce((acc, b) => acc + Math.abs(b.points), 0);

    return {
      totalRecords: list.length,
      praiseCount: praiseItems.length,
      totalPraisePoints,
      warnCount: warnItems.length,
      totalWarnDeductions,
    };
  }, [behaviors, timeFilter, monStr, sunStr, curMonthStr]);

  // Student ranking / score calculation
  const studentScores = useMemo(() => {
    return students.map((st) => {
      const studentBehaviors = behaviors.filter((b) => b.studentId === st.id);
      const praiseItems = studentBehaviors.filter((b) => b.type === 'PRAISE' || b.type === 'positive');
      const warnItems = studentBehaviors.filter((b) => b.type === 'WARN' || b.type === 'negative');
      const praisePoints = praiseItems.reduce((sum, b) => sum + (b.points > 0 ? b.points : 0), 0);
      const warnPoints = warnItems.reduce((sum, b) => sum + (b.points < 0 ? Math.abs(b.points) : 0), 0);
      const totalPoints = 100 + praisePoints - warnPoints; // Baseline 100
      return {
        student: st,
        totalPoints,
        praisePoints,
        praiseCount: praiseItems.length,
        warnCount: warnItems.length,
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [students, behaviors]);

  const selectedStudent = useMemo(() => {
    if (selectedStudentId === 'all') return null;
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [selectedStudentId, students]);

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Sổ Nề Nếp & Hành Vi Học Sinh</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý điểm rèn luyện, khen thưởng việc tốt và nhắc nhở nề nếp tác phong lớp {classInfo?.className || '11A2'}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenAdd('PRAISE')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>+ Khen thưởng (Khen)</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAdd('WARN')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>- Nhắc nhở (Nhắc)</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards: tổng điểm khen, số lần nhắc trong tuần/tháng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Bộ chọn khoảng thời gian */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Thời gian thống kê
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-lg font-bold text-slate-900 capitalize">
              {timeFilter === 'week' ? 'Tuần này' : timeFilter === 'month' ? 'Tháng này' : 'Toàn bộ thời gian'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {timeFilter === 'week'
                ? `${monStr} → ${sunStr}`
                : timeFilter === 'month'
                ? `Tháng ${curMonthStr}`
                : 'Tất cả các học kỳ'}
            </div>
          </div>
          <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setTimeFilter('week')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                timeFilter === 'week' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tuần
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('month')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                timeFilter === 'month' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tháng
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('all')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                timeFilter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả
            </button>
          </div>
        </div>

        {/* Metric 2: Tổng điểm khen */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng điểm khen ({timeFilter === 'week' ? 'tuần' : timeFilter === 'month' ? 'tháng' : 'tất cả'})
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-emerald-600">
              +{statsInTimeRange.totalPraisePoints} <span className="text-xs font-normal text-slate-400">điểm</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Ghi nhận <strong>{statsInTimeRange.praiseCount}</strong> lượt khen ngợi việc tốt
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium pt-2 border-t border-slate-100">
            Khuyến khích học sinh phát huy tích cực
          </div>
        </div>

        {/* Metric 3: Số lần nhắc nhở */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Số lần nhắc ({timeFilter === 'week' ? 'tuần' : timeFilter === 'month' ? 'tháng' : 'tất cả'})
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-rose-600">
              {statsInTimeRange.warnCount} <span className="text-xs font-normal text-slate-400">lần nhắc</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Trừ tổng cộng <strong>-{statsInTimeRange.totalWarnDeductions}</strong> điểm rèn luyện
            </div>
          </div>
          <div className="text-[11px] text-rose-600 font-medium pt-2 border-t border-slate-100">
            Cần trao đổi, chấn chỉnh kịp thời
          </div>
        </div>

        {/* Metric 4: Tỉ lệ thi đua / Điểm trung bình */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Học sinh rèn luyện tốt
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-slate-900">
              {studentScores.filter((s) => s.totalPoints >= 100).length} / {students.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Học sinh giữ vững điểm trên mức chuẩn (100đ)
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Dẫn đầu: {studentScores[0]?.student.fullName || 'Đang cập nhật'} ({studentScores[0]?.totalPoints || 100}đ)
          </div>
        </div>
      </div>

      {/* Selected Student Banner (if a student is filtered) */}
      {selectedStudent && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-base shrink-0">
              {selectedStudent.rollNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{selectedStudent.fullName}</h3>
                <span className="text-xs bg-white text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-medium">
                  {selectedStudent.group || 'Tổ 1'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Mã học sinh: {selectedStudent.id} • GVCN: {classInfo?.homeroomTeacher?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenAdd('PRAISE', selectedStudent.id)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
            >
              + Khen thưởng em này
            </button>
            <button
              type="button"
              onClick={() => handleOpenAdd('WARN', selectedStudent.id)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
            >
              - Nhắc nhở em này
            </button>
            <button
              type="button"
              onClick={() => setSelectedStudentId('all')}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg"
              title="Bỏ chọn học sinh"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Toolbar & Behavior Records List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Filter Type & Time tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  typeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                Tất cả loại ({behaviors.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('PRAISE')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  typeFilter === 'PRAISE'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                Khen thưởng
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('WARN')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  typeFilter === 'WARN'
                    ? 'bg-rose-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                Nhắc nhở
              </button>
            </div>

            {/* Time Filter buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTimeFilter('week')}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  timeFilter === 'week'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                Tuần này
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('month')}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  timeFilter === 'month'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                Tháng này
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  timeFilter === 'all'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                Tất cả ngày
              </button>
            </div>
          </div>

          {/* Student Selector & Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Student Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="text-xs bg-transparent text-slate-700 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="all">Tất cả học sinh ({students.length})</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.rollNumber}. {st.fullName} ({st.group || 'Tổ 1'})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nội dung, tên HS..."
                className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-indigo-500 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Behavior Records Table / List */}
        <div className="divide-y divide-slate-100 mt-2">
          {filteredBehaviors.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Chưa có ghi nhận nào phù hợp</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Không tìm thấy ghi nhận nề nếp với bộ lọc hiện tại. Nhấn nút Thêm mới ở trên để bắt đầu ghi nhận.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAdd('PRAISE')}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  + Khen thưởng
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAdd('WARN')}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100"
                >
                  - Nhắc nhở
                </button>
              </div>
            </div>
          ) : (
            filteredBehaviors.map((b) => {
              const student = students.find((s) => s.id === b.studentId);
              const isPraise = b.type === 'PRAISE' || b.type === 'positive';

              return (
                <div
                  key={b.id}
                  className="py-3.5 px-2 hover:bg-slate-50/70 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left: Score Badge + Details */}
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs ${
                        isPraise
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.points > 0 ? `+${b.points}` : b.points}
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentId(b.studentId)}
                          className="font-bold text-sm text-slate-900 hover:text-indigo-600 text-left transition-colors"
                        >
                          {student?.fullName || 'Học sinh'}
                        </button>
                        <span className="text-xs text-slate-400">
                          (Số: {student?.rollNumber} • {student?.group || 'Tổ 1'})
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                            isPraise
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPraise ? 'Khen thưởng (+Điểm)' : 'Nhắc nhở (-Điểm)'}
                        </span>

                        {b.isSensitive && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            <span>Thông tin nhạy cảm</span>
                          </span>
                        )}
                      </div>

                      {/* Content / Note */}
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {b.content || b.description || b.title}
                      </p>
                    </div>
                  </div>

                  {/* Right: Date, Recorder & Actions (Edit / Delete) */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs shrink-0 pl-13 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <div className="font-semibold text-slate-700">{b.date}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {b.recordedBy || 'GVCN'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Sửa (Edit) */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Sửa ghi nhận"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Xóa (Delete) */}
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa ghi nhận"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: Thêm / Sửa Ghi Nhận Nề Nếp */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                    formType === 'PRAISE' ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {formType === 'PRAISE' ? <ThumbsUp className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingBehavior ? 'Sửa Ghi Nhận Nề Nếp' : formType === 'PRAISE' ? 'Ghi Nhận Khen Thưởng' : 'Ghi Nhận Nhắc Nhở Nề Nếp'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Chọn học sinh */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn học sinh *
                </label>
                <select
                  required
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.rollNumber}. {st.fullName} ({st.group || 'Tổ 1'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Loại & Điểm */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hình thức ghi nhận *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      const t = e.target.value as 'PRAISE' | 'WARN';
                      setFormType(t);
                      if (t === 'PRAISE') {
                        setFormPoints(5);
                      } else {
                        setFormPoints(-2);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="PRAISE">Khen thưởng (Cộng điểm)</option>
                    <option value="WARN">Nhắc nhở (Trừ điểm)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điểm ({formType === 'PRAISE' ? 'Cộng > 0' : 'Trừ < 0'}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-slate-400 mr-1">Mức điểm nhanh:</span>
                {formType === 'PRAISE' ? (
                  <>
                    {[+2, +3, +5, +10, +15].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => setFormPoints(pts)}
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                          formPoints === pts ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        +{pts}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {[-1, -2, -3, -5, -10].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => setFormPoints(pts)}
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                          formPoints === pts ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {pts}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Nội dung ghi nhận (content) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung ghi chú khen / nhắc *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder={
                    formType === 'PRAISE'
                      ? 'VD: Hăng hái phát biểu, đạt điểm 10 môn Toán, giúp đỡ bạn học...'
                      : 'VD: Đi học muộn 15 phút, chưa làm bài tập về nhà môn Hóa...'
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
                />

                {/* Quick suggestion tags */}
                <div className="mt-2">
                  <span className="text-[11px] text-slate-400 block mb-1">Gợi ý mẫu nhanh:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(formType === 'PRAISE' ? praiseSuggestions : warnSuggestions).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setFormContent(sug)}
                        className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-left"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ngày & Người ghi nhận */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày ghi nhận *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Người ghi nhận
                  </label>
                  <input
                    type="text"
                    value={formRecordedBy}
                    onChange={(e) => setFormRecordedBy(e.target.value)}
                    placeholder="VD: GVCN, Thầy cô bộ môn..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Option: Thông tin nhạy cảm */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsSensitive}
                    onChange={(e) => setFormIsSensitive(e.target.checked)}
                    className="mt-0.5 rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Đánh dấu là thông tin tế nhị / nhạy cảm
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Khi bật tùy chọn này, học sinh và phụ huynh xem trên ứng dụng có thể chọn ẩn chi tiết hoặc nhận thông điệp bảo mật cá nhân.
                    </span>
                  </div>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
                >
                  {editingBehavior ? 'Lưu cập nhật' : 'Thêm vào sổ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
