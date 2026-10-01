import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck,
  Check,
  Clock,
  AlertCircle,
  Save,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  School,
  UserCheck,
  UserX,
  Users,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { Attendance, AttendanceStatus, ClassInfo, Student } from '../../core/types';

export const AdminAttendance: React.FC = () => {
  const { classes: contextClasses, activeClassId, refreshData } = useApp();

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(activeClassId || 'class-11a2');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'ABSENT'>('ALL');

  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: 'PRESENT' | 'LATE' | 'ABSENT'; note: string }>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Load classes
  useEffect(() => {
    const fetchClasses = async () => {
      const cls = await dataProvider.getClasses();
      setClasses(cls);
      if (cls.length > 0 && !selectedClassId) {
        setSelectedClassId(cls[0].id);
      }
    };
    fetchClasses();
  }, [contextClasses]);

  // Load students of selected class
  useEffect(() => {
    const fetchStudentsOfClass = async () => {
      if (!selectedClassId) return;
      try {
        setIsLoadingStudents(true);
        const stList = await dataProvider.getStudents(selectedClassId);
        // Sort by rollNumber
        stList.sort((a, b) => (a.rollNumber || 0) - (b.rollNumber || 0));
        setStudents(stList);
      } catch (err) {
        console.error('Failed to load students for class', err);
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchStudentsOfClass();
  }, [selectedClassId]);

  // Load attendance records for selected class & date
  useEffect(() => {
    const loadAttendance = async () => {
      const records = await dataProvider.getAttendance(selectedDate);
      const map: Record<string, { status: 'PRESENT' | 'LATE' | 'ABSENT'; note: string }> = {};

      for (const st of students) {
        const found = records.find((r) => r.studentId === st.id);
        if (found) {
          let normalizedStatus: 'PRESENT' | 'LATE' | 'ABSENT' = 'PRESENT';
          if (found.status === 'LATE' || found.status === 'late') {
            normalizedStatus = 'LATE';
          } else if (
            found.status === 'ABSENT' ||
            found.status === 'absent_excused' ||
            found.status === 'absent_unexcused'
          ) {
            normalizedStatus = 'ABSENT';
          } else {
            normalizedStatus = 'PRESENT';
          }
          map[st.id] = { status: normalizedStatus, note: found.note || '' };
        } else {
          // Default to PRESENT for easy workflow
          map[st.id] = { status: 'PRESENT', note: '' };
        }
      }
      setAttendanceMap(map);
      setSaveSuccess(false);
    };

    if (students.length > 0) {
      loadAttendance();
    }
  }, [selectedDate, students]);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) || classes[0],
    [classes, selectedClassId]
  );

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'LATE' | 'ABSENT') => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
    setSaveSuccess(false);
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
    setSaveSuccess(false);
  };

  const handleQuickNote = (studentId: string, tag: string) => {
    setAttendanceMap((prev) => {
      const currentNote = prev[studentId]?.note || '';
      const newNote = currentNote ? `${currentNote}; ${tag}` : tag;
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          note: newNote,
        },
      };
    });
    setSaveSuccess(false);
  };

  const handleMarkAllPresent = () => {
    setAttendanceMap((prev) => {
      const next = { ...prev };
      for (const st of students) {
        next[st.id] = { ...next[st.id], status: 'PRESENT' };
      }
      return next;
    });
    setSaveSuccess(false);
  };

  const handleDateOffset = (offsetDays: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offsetDays);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Bulk save attendance using markAttendance({ classId, date, items })
  const handleSaveAttendance = async () => {
    if (!selectedClassId) return;
    try {
      setIsSaving(true);
      const itemsToSave = students.map((st) => ({
        studentId: st.id,
        status: attendanceMap[st.id]?.status || ('PRESENT' as AttendanceStatus),
        note: attendanceMap[st.id]?.note || '',
      }));

      await dataProvider.markAttendance({
        classId: selectedClassId,
        date: selectedDate,
        items: itemsToSave,
      });

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setLastSavedTime(timeStr);

      setIsSaving(false);
      setSaveSuccess(true);
      refreshData();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi lưu điểm danh.');
      setIsSaving(false);
    }
  };

  // Metrics computation
  const totalStudents = students.length || 0;
  const presentCount = Object.values(attendanceMap).filter((a) => a.status === 'PRESENT').length;
  const lateCount = Object.values(attendanceMap).filter((a) => a.status === 'LATE').length;
  const absentCount = Object.values(attendanceMap).filter((a) => a.status === 'ABSENT').length;
  const attendanceRate =
    totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 100;

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const matchesSearch =
        !searchTerm.trim() ||
        st.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (st.rollNumber && String(st.rollNumber) === searchTerm.trim());

      const currentStatus = attendanceMap[st.id]?.status || 'PRESENT';
      const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter, attendanceMap]);

  // Formatted date string in Vietnamese
  const formattedDate = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = daysOfWeek[d.getDay()];
      return `${dayName}, ngày ${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Điểm danh Chuyên cần Lớp</h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý điểm danh hàng ngày theo lớp, theo dõi học sinh có mặt, đi muộn, vắng mặt và lưu hàng loạt.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="btn-mark-all-present"
            onClick={handleMarkAllPresent}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tất cả có mặt</span>
          </button>

          <button
            type="button"
            id="btn-bulk-save-attendance"
            onClick={handleSaveAttendance}
            disabled={isSaving || students.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu hàng loạt...' : 'Lưu hàng loạt (Bulk save)'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-emerald-800 text-sm font-medium animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Đã lưu hàng loạt bảng điểm danh {selectedClass?.className} ngày {selectedDate} thành công!
            </span>
          </div>
          {lastSavedTime && (
            <span className="text-xs text-emerald-600/80 font-normal">Ghi nhận lúc: {lastSavedTime}</span>
          )}
        </div>
      )}

      {/* Control Bar: Class Picker + Date Picker */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Class Selector Card */}
        <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <School className="w-4 h-4 text-blue-600" />
              Chọn lớp học *
            </label>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
              {totalStudents} học sinh
            </span>
          </div>
          <select
            id="select-admin-attendance-class"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500 transition-colors"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.className} {c.room ? `(${c.room})` : ''} - Niên khóa: {c.schoolYear}
              </option>
            ))}
          </select>
          {selectedClass && (
            <div className="text-xs text-slate-500 mt-2 truncate">
              GVCN: <strong className="text-slate-700">{selectedClass.homeroomTeacher?.name}</strong> •{' '}
              {selectedClass.homeroomTeacher?.subject || 'Chủ nhiệm'}
            </div>
          )}
        </div>

        {/* Date Selector Card */}
        <div className="md:col-span-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              Chọn ngày điểm danh
            </label>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {formattedDate}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleDateOffset(-1)}
                title="Ngày trước"
                className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                id="input-admin-attendance-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => handleDateOffset(1)}
                title="Ngày sau"
                className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSetToday}
                className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => handleDateOffset(-1)}
                className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Hôm qua
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Attendance Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center relative overflow-hidden">
          <div className="text-xs font-medium text-slate-500">Tỉ lệ chuyên cần</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{attendanceRate}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sĩ số: {totalStudents} học sinh</div>
          <div
            className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300"
            style={{ width: `${attendanceRate}%` }}
          />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <div className="text-xs font-medium text-emerald-600 flex items-center justify-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Có mặt (PRESENT)
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{presentCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Đúng giờ</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <div className="text-xs font-medium text-amber-600 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Đi muộn (LATE)
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{lateCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sau 07:15</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <div className="text-xs font-medium text-rose-600 flex items-center justify-center gap-1">
            <UserX className="w-3.5 h-3.5" /> Vắng mặt (ABSENT)
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{absentCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Nghỉ học</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, STT hoặc mã HS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({totalStudents})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PRESENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'PRESENT'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Có mặt ({presentCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('LATE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'LATE'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Đi muộn ({lateCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ABSENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'ABSENT'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Vắng mặt ({absentCount})
          </button>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs text-slate-500 uppercase font-bold tracking-wider">
                <th className="py-3.5 px-4 w-14 text-center">STT</th>
                <th className="py-3.5 px-4 min-w-[200px]">Học sinh</th>
                <th className="py-3.5 px-4 min-w-[340px]">Trạng thái điểm danh (Tick chọn)</th>
                <th className="py-3.5 px-4 min-w-[240px]">Ghi chú / Lý do vắng - muộn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingStudents ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    Đang tải danh sách học sinh của {selectedClass?.className}...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">
                    {students.length === 0
                      ? 'Lớp này hiện chưa có học sinh nào trong cơ sở dữ liệu.'
                      : 'Không có học sinh nào khớp với bộ lọc tìm kiếm.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const current = attendanceMap[st.id] || { status: 'PRESENT', note: '' };
                  const isPresent = current.status === 'PRESENT';
                  const isLate = current.status === 'LATE';
                  const isAbsent = current.status === 'ABSENT';

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isAbsent ? 'bg-rose-50/20' : isLate ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                        {st.rollNumber || idx + 1}
                      </td>

                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                              isPresent
                                ? 'bg-emerald-100 text-emerald-800'
                                : isLate
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {st.fullName.slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{st.fullName}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5">
                              <span>Mã: {st.id}</span>
                              <span>•</span>
                              <span>{st.gender}</span>
                              {st.group && (
                                <>
                                  <span>•</span>
                                  <span>{st.group}</span>
                                </>
                              )}
                              {st.position && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600 font-medium">{st.position}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Attendance Status Picker */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex p-1 bg-slate-100/90 rounded-xl gap-1">
                          {/* PRESENT Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'PRESENT')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Có mặt</span>
                          </button>

                          {/* LATE Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'LATE')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isLate
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Đi muộn</span>
                          </button>

                          {/* ABSENT Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'ABSENT')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isAbsent
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Vắng mặt</span>
                          </button>
                        </div>
                      </td>

                      {/* Note & Quick Tags */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Nhập lý do hoặc ghi chú (VD: Sốt, hỏng xe, việc gia đình)..."
                            value={current.note}
                            onChange={(e) => handleNoteChange(st.id, e.target.value)}
                            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
                          />
                          {(isAbsent || isLate) && (
                            <div className="flex items-center gap-1 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleQuickNote(st.id, 'Có phép')}
                                className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                              >
                                + Có phép
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickNote(st.id, 'Không phép')}
                                className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md transition-colors"
                              >
                                + Không phép
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickNote(st.id, 'Muộn 10p')}
                                className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md transition-colors"
                              >
                                + Muộn 10p
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickNote(st.id, 'Sốt ốm')}
                                className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
                              >
                                + Sốt ốm
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Bulk Save Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Hiển thị <strong>{filteredStudents.length}</strong> / <strong>{students.length}</strong> học sinh của{' '}
            <strong className="text-slate-800">{selectedClass?.className}</strong>.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Đánh dấu tất cả có mặt
            </button>
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={isSaving || students.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu hàng loạt...' : 'Lưu hàng loạt (Bulk save)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
