import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCircle,
  CalendarCheck,
  Award,
  Bell,
  CheckSquare,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Phone,
  Clock,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { Attendance, Behavior, Announcement, Task, TaskReply } from '../../core/types';

export const AppDashboard: React.FC = () => {
  const { activeStudent, activeParent, classInfo, refreshKey } = useApp();
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [studentBehaviors, setStudentBehaviors] = useState<Behavior[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [replies, setReplies] = useState<TaskReply[]>([]);
  const [behaviorPeriod, setBehaviorPeriod] = useState<'week' | 'month'>('week');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadStudentData = async () => {
      if (!activeStudent) return;
      const [attList, behList, annList, tskList, repList] = await Promise.all([
        dataProvider.getAttendance(todayStr),
        dataProvider.getBehaviors(activeStudent.id),
        dataProvider.getAnnouncements(),
        dataProvider.getTasks(),
        dataProvider.getTaskReplies(),
      ]);

      const myTodayAtt = attList.find((a) => a.studentId === activeStudent.id) || null;
      setTodayAttendance(myTodayAtt);
      setStudentBehaviors(behList);
      setAnnouncements(annList);
      setTasks(tskList);
      setReplies(repList.filter((r) => r.studentId === activeStudent.id));
    };

    loadStudentData();
  }, [activeStudent, refreshKey, todayStr]);

  if (!activeStudent) {
    return (
      <div className="p-12 text-center text-slate-400">
        Đang tải thông tin học sinh...
      </div>
    );
  }

  // Week and Month boundaries
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

  // Week stats
  const weekBehaviors = studentBehaviors.filter((b) => b.date >= monStr && b.date <= sunStr);
  const weekPraiseItems = weekBehaviors.filter((b) => b.type === 'PRAISE' || b.type === 'positive');
  const weekWarnItems = weekBehaviors.filter((b) => b.type === 'WARN' || b.type === 'negative');
  const weekPraisePoints = weekPraiseItems.reduce((sum, b) => sum + (b.points > 0 ? b.points : 0), 0);
  const weekWarnCount = weekWarnItems.length;

  // Month stats
  const monthBehaviors = studentBehaviors.filter((b) => b.date.startsWith(curMonthStr));
  const monthPraiseItems = monthBehaviors.filter((b) => b.type === 'PRAISE' || b.type === 'positive');
  const monthWarnItems = monthBehaviors.filter((b) => b.type === 'WARN' || b.type === 'negative');
  const monthPraisePoints = monthPraiseItems.reduce((sum, b) => sum + (b.points > 0 ? b.points : 0), 0);
  const monthWarnCount = monthWarnItems.length;

  // Overall stats
  const praiseAll = studentBehaviors.filter((b) => b.type === 'PRAISE' || b.type === 'positive');
  const warnAll = studentBehaviors.filter((b) => b.type === 'WARN' || b.type === 'negative');
  const totalPraisePoints = praiseAll.reduce((sum, b) => sum + (b.points > 0 ? b.points : 0), 0);
  const totalWarnDeduction = warnAll.reduce((sum, b) => sum + (b.points < 0 ? Math.abs(b.points) : 0), 0);
  const totalPoints = 100 + totalPraisePoints - totalWarnDeduction;

  const currentPraisePoints = behaviorPeriod === 'week' ? weekPraisePoints : monthPraisePoints;
  const currentWarnCount = behaviorPeriod === 'week' ? weekWarnCount : monthWarnCount;

  const pendingTasks = tasks.filter(
    (t) => t.status === 'open' && !replies.some((r) => r.taskId === t.id)
  );

  return (
    <div className="space-y-6">
      {/* Student Welcome Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
            {activeStudent.fullName.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Sổ Liên Lạc Điện Tử
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {activeStudent.fullName}
            </h1>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
              <span>SBD: #{activeStudent.rollNumber}</span>
              <span>•</span>
              <span>{activeStudent.group || 'Tổ 1'}</span>
              {activeStudent.position && (
                <>
                  <span>•</span>
                  <span className="text-blue-600 font-medium">{activeStudent.position}</span>
                </>
              )}
              <span>•</span>
              <span>GVCN: {classInfo?.homeroomTeacher.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            to="/app/messages"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-medium transition-colors shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Nhắn tin cho Thầy Huy</span>
          </Link>
          <Link
            to="/app/attendance"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-medium transition-colors"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Xin nghỉ phép</span>
          </Link>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today Attendance Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              todayAttendance?.status === 'present'
                ? 'bg-emerald-50 text-emerald-600'
                : todayAttendance?.status === 'late'
                ? 'bg-amber-50 text-amber-600'
                : todayAttendance?.status === 'absent_excused'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Chuyên cần hôm nay</div>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {todayAttendance?.status === 'present'
                ? 'Có mặt đúng giờ'
                : todayAttendance?.status === 'late'
                ? 'Đi học muộn'
                : todayAttendance?.status === 'absent_excused'
                ? 'Nghỉ học có phép'
                : todayAttendance?.status === 'absent_unexcused'
                ? 'Nghỉ không phép'
                : 'Đã điểm danh có mặt'}
            </div>
            {todayAttendance?.note && (
              <div className="text-xs text-slate-400 truncate max-w-[200px]">
                {todayAttendance.note}
              </div>
            )}
          </div>
        </div>

        {/* Behavior points */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Điểm rèn luyện tích lũy</span>
            </div>
            <Link
              to="/app/behavior"
              className="text-[11px] text-amber-600 font-semibold hover:underline"
            >
              Chi tiết →
            </Link>
          </div>

          <div className="my-2">
            <div className="text-2xl font-extrabold text-slate-900">
              {totalPoints} <span className="text-xs font-normal text-slate-400">điểm</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Xếp loại rèn luyện:{' '}
              <strong className="text-emerald-700">
                {totalPoints >= 110 ? 'Xuất sắc' : totalPoints >= 95 ? 'Tốt' : 'Khá'}
              </strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 font-semibold">
              Tuần: +{weekPraisePoints}đ ({weekWarnCount} nhắc)
            </span>
            <span className="text-indigo-600 font-medium">
              Tháng: +{monthPraisePoints}đ ({monthWarnCount} nhắc)
            </span>
          </div>
        </div>

        {/* Tasks Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Nhiệm vụ cần làm</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {pendingTasks.length}{' '}
              <span className="text-xs font-normal text-slate-400">việc chờ nộp</span>
            </div>
            <Link
              to="/app/tasks"
              className="text-xs text-purple-600 hover:underline font-medium mt-0.5 inline-block"
            >
              Xem chi tiết nộp bài →
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Announcements & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Announcements */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Thông báo mới từ GVCN</h2>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {announcements.slice(0, 3).map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900 line-clamp-1">{ann.title}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      ann.category === 'urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {ann.category === 'urgent' ? 'Khẩn' : 'Thông báo'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                  {ann.content}
                </p>
                <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
                  <span>{ann.author}</span>
                  <span>{ann.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Behavior and Feedback summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Ghi nhận nề nếp của con</h2>
                <p className="text-[11px] text-slate-400">
                  Thống kê thi đua và uốn nắn tác phong
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Tuần / Tháng */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setBehaviorPeriod('week')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    behaviorPeriod === 'week'
                      ? 'bg-white text-indigo-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tuần này
                </button>
                <button
                  type="button"
                  onClick={() => setBehaviorPeriod('month')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    behaviorPeriod === 'month'
                      ? 'bg-white text-indigo-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tháng này
                </button>
              </div>

              <Link
                to="/app/behavior"
                className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
              >
                Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick period summary metrics */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ThumbsUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-medium uppercase">
                  Điểm khen ({behaviorPeriod === 'week' ? 'tuần' : 'tháng'})
                </div>
                <div className="text-sm font-extrabold text-emerald-700">
                  +{currentPraisePoints} điểm
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-medium uppercase">
                  Số lần nhắc ({behaviorPeriod === 'week' ? 'tuần' : 'tháng'})
                </div>
                <div className="text-sm font-extrabold text-rose-700">
                  {currentWarnCount} lần nhắc
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {studentBehaviors.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Chưa có ghi nhận nề nếp đặc biệt nào.
              </div>
            ) : (
              studentBehaviors.slice(0, 4).map((b) => {
                const isPraise = b.type === 'PRAISE' || b.type === 'positive';
                return (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-slate-100 flex items-start gap-3 bg-slate-50/40"
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isPraise
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.points > 0 ? `+${b.points}` : b.points}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900">
                          {isPraise ? 'Khen thưởng' : 'Nhắc nhở nề nếp'}
                        </span>
                        <span className="text-[10px] text-slate-400">{b.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                        {b.isSensitive
                          ? '[Nội dung bảo mật riêng tư - Đã trao đổi cùng PH]'
                          : b.content || b.description || b.title}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
