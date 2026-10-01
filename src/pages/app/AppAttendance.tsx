import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  X,
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Check,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { Attendance, AttendanceRange, AttendanceStatus } from '../../core/types';

export const AppAttendance: React.FC = () => {
  const { activeStudent, activeParent, classInfo, refreshData } = useApp();

  const [rangeMode, setRangeMode] = useState<'week' | 'month' | 'all'>('month');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // 'YYYY-MM'
  );
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [absenceDate, setAbsenceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [absenceReason, setAbsenceReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load attendance by student using dataProvider.listAttendanceByStudent
  const loadAttendance = async () => {
    if (!activeStudent) return;
    try {
      setIsLoading(true);
      let rangeParam: AttendanceRange = rangeMode;
      if (rangeMode === 'month' && selectedMonth) {
        rangeParam = { month: selectedMonth };
      }
      const records = await dataProvider.listAttendanceByStudent(activeStudent.id, rangeParam);
      setAttendanceRecords(records);
    } catch (err) {
      console.error('Failed to load student attendance', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [activeStudent?.id, rangeMode, selectedMonth, refreshData]);

  if (!activeStudent) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
        Vui lòng chọn học sinh để xem lịch sử chuyên cần.
      </div>
    );
  }

  // Normalize statuses for statistics
  const isPresent = (status: AttendanceStatus) => status === 'PRESENT' || status === 'present';
  const isLate = (status: AttendanceStatus) => status === 'LATE' || status === 'late';
  const isAbsent = (status: AttendanceStatus) =>
    status === 'ABSENT' || status === 'absent_excused' || status === 'absent_unexcused';

  const presentCount = attendanceRecords.filter((a) => isPresent(a.status)).length;
  const lateCount = attendanceRecords.filter((a) => isLate(a.status)).length;
  const absentCount = attendanceRecords.filter((a) => isAbsent(a.status)).length;
  const totalDays = attendanceRecords.length;

  const attendanceRate =
    totalDays > 0 ? Math.round(((presentCount + lateCount) / totalDays) * 100) : 100;

  // Month navigation
  const handleMonthChange = (offsetMonths: number) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + offsetMonths, 1);
    const nextMonthStr = d.toISOString().substring(0, 7);
    setSelectedMonth(nextMonthStr);
  };

  // Submit absence request
  const handleSendAbsenceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!absenceReason.trim()) {
      alert('Vui lòng nhập lý do xin nghỉ học!');
      return;
    }

    try {
      setIsSubmitting(true);
      const studentClassId = activeStudent.classId || classInfo?.id || 'class-11a2';

      // 1. Mark attendance using the new markAttendance({ classId, date, items }) format
      await dataProvider.markAttendance({
        classId: studentClassId,
        date: absenceDate,
        items: [
          {
            studentId: activeStudent.id,
            status: 'ABSENT',
            note: `Đơn xin phép của PH (${activeParent?.fullName || 'Phụ huynh'}): ${absenceReason.trim()}`,
          },
        ],
      });

      // 2. Send message to teacher thread
      const threadId = `thread-${activeStudent.id}`;
      await dataProvider.sendMessage(threadId, {
        senderId: activeParent?.id || 'parent',
        senderName: `${activeParent?.fullName || 'Phụ huynh'} (${activeParent?.relationship || 'PH'})`,
        senderRole: 'parent',
        content: `Kính gửi GVCN ${classInfo?.homeroomTeacher?.name || 'Thầy Cô'}, phụ huynh em ${activeStudent.fullName} xin phép cho cháu nghỉ học ngày ${absenceDate}. Lý do: ${absenceReason.trim()}. Kính mong Thầy/Cô tạo điều kiện giúp cháu!`,
      });

      setIsSubmitting(false);
      setIsModalOpen(false);
      setAbsenceReason('');
      await loadAttendance();
      refreshData();
      alert('Đã gửi đơn xin phép nghỉ học tới GVCN và cập nhật hệ thống thành công!');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('Có lỗi khi gửi đơn xin phép.');
    }
  };

  const formatVietnameseDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      return {
        dayName: days[d.getDay()],
        formatted: `${parts[2]}/${parts[1]}/${parts[0]}`,
      };
    } catch {
      return { dayName: '', formatted: dateStr };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Lịch sử Chuyên cần: {activeStudent.fullName}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Lớp {classInfo?.className || '11A2'} • Mã HS: {activeStudent.id} • Theo dõi nề nếp chuyên cần và gửi đơn nghỉ phép
          </p>
        </div>

        <button
          type="button"
          id="btn-open-absence-modal"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Gửi đơn xin phép nghỉ</span>
        </button>
      </div>

      {/* Filter Tabs: Tuần / Tháng / Tất cả */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Xem theo:
          </span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              id="tab-range-week"
              onClick={() => setRangeMode('week')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                rangeMode === 'week'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tuần này
            </button>
            <button
              type="button"
              id="tab-range-month"
              onClick={() => setRangeMode('month')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                rangeMode === 'month'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Theo tháng
            </button>
            <button
              type="button"
              id="tab-range-all"
              onClick={() => setRangeMode('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                rangeMode === 'all'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toàn bộ lịch sử
            </button>
          </div>
        </div>

        {/* Month Navigator (Visible when rangeMode === 'month') */}
        {rangeMode === 'month' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center relative overflow-hidden">
          <div className="text-xs text-slate-500 font-medium">Tỉ lệ chuyên cần</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{attendanceRate}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Tổng {totalDays} buổi học ghi nhận
          </div>
          <div
            className="absolute bottom-0 left-0 h-1 bg-emerald-500"
            style={{ width: `${attendanceRate}%` }}
          />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <div className="text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
            <Check className="w-3.5 h-3.5" /> Có mặt đúng giờ
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{presentCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">buổi học</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <div className="text-xs text-amber-600 font-medium flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Đi muộn
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{lateCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">lần sau giờ vào lớp</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <div className="text-xs text-rose-600 font-medium flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Vắng mặt
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{absentCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">buổi nghỉ học</div>
        </div>
      </div>

      {/* Attendance Log List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>
              Chi tiết nhật ký điểm danh{' '}
              {rangeMode === 'week'
                ? '(Tuần hiện tại)'
                : rangeMode === 'month'
                ? `(Tháng ${selectedMonth})`
                : '(Tất cả)'}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {attendanceRecords.length} lượt ghi nhận
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Đang tải nhật ký điểm danh...
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Không có dữ liệu điểm danh trong khoảng thời gian đã chọn.
            </div>
          ) : (
            attendanceRecords.map((r) => {
              const statusPresent = isPresent(r.status);
              const statusLate = isLate(r.status);
              const statusAbsent = isAbsent(r.status);
              const { dayName, formatted } = formatVietnameseDate(r.date);

              return (
                <div
                  key={r.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 text-xs font-bold ${
                        statusPresent
                          ? 'bg-emerald-100 text-emerald-800'
                          : statusLate
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      <span>{formatted.split('/')[0]}</span>
                      <span className="text-[10px] font-normal uppercase">T{formatted.split('/')[1]}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{dayName}, {formatted}</span>
                        {r.recordedAt && (
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            Ghi nhận: {r.recordedAt}
                          </span>
                        )}
                      </div>
                      {r.note ? (
                        <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                          <span className="font-medium text-slate-700">Ghi chú:</span>
                          <span className="italic text-slate-500">{r.note}</span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 mt-0.5">
                          Đến lớp đúng giờ quy định
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`text-xs px-3.5 py-1.5 rounded-full font-bold inline-flex items-center gap-1.5 ${
                        statusPresent
                          ? 'bg-emerald-100 text-emerald-800'
                          : statusLate
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {statusPresent && <Check className="w-3.5 h-3.5" />}
                      {statusLate && <Clock className="w-3.5 h-3.5" />}
                      {statusAbsent && <AlertCircle className="w-3.5 h-3.5" />}
                      <span>
                        {statusPresent
                          ? 'Có mặt'
                          : statusLate
                          ? 'Đi muộn'
                          : 'Vắng mặt'}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Gửi đơn xin phép nghỉ học */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Gửi đơn xin nghỉ học có phép</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendAbsenceRequest} className="space-y-4 mt-4">
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-950 leading-relaxed">
                Đơn xin nghỉ học sẽ được cập nhật trực tiếp vào hệ thống điểm danh và gửi tin nhắn thông báo tới GVCN{' '}
                <strong>{classInfo?.homeroomTeacher.name || 'chủ nhiệm'}</strong>.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Học sinh xin nghỉ
                </label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800">
                  {activeStudent.fullName} (Lớp {classInfo?.className || '11A2'})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày xin nghỉ học *
                </label>
                <input
                  type="date"
                  required
                  value={absenceDate}
                  onChange={(e) => setAbsenceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do xin nghỉ học chi tiết *
                </label>
                <textarea
                  rows={3}
                  required
                  value={absenceReason}
                  onChange={(e) => setAbsenceReason(e.target.value)}
                  placeholder="VD: Cháu bị sốt cao cần đi khám viện, gia đình có việc hiếu,..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-medium cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang gửi...' : 'Gửi đơn cho GVCN'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
