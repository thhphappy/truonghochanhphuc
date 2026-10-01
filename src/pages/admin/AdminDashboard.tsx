import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
  Bell,
  CheckSquare,
  CalendarCheck,
  ArrowRight,
  Plus,
  Phone,
  MessageSquare,
  Building2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Send,
  X,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import {
  Attendance,
  Behavior,
  Announcement,
  Task,
  Student,
  Parent,
  ClassInfo,
  TaskReply,
  MessageThread,
} from '../../core/types';

export const AdminDashboard: React.FC = () => {
  const { classInfo, classes, activeClassId, setActiveClassId, refreshKey, refreshData } = useApp();

  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [weekAttendance, setWeekAttendance] = useState<Attendance[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskReplies, setTaskReplies] = useState<TaskReply[]>([]);
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [behaviorPeriod, setBehaviorPeriod] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  // Quick announcement modal
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnCategory, setNewAnnCategory] = useState<'general' | 'urgent' | 'event' | 'fees'>('general');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [isSavingAnn, setIsSavingAnn] = useState(false);

  // Calculate dates for current week (Monday to Friday)
  const currentWeekDays = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Fetch all dashboard data using dataProvider only
  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [
          allStudents,
          allParents,
          allAnnouncements,
          allTasks,
          allReplies,
          allThreads,
          allBehaviors,
          ...weekAttResults
        ] = await Promise.all([
          dataProvider.getStudents(),
          dataProvider.getParents(),
          dataProvider.getAnnouncements(),
          dataProvider.getTasks(),
          dataProvider.list<TaskReply>('task_replies'),
          dataProvider.getMessageThreads(),
          dataProvider.getBehaviors(),
          ...currentWeekDays.map((date) => dataProvider.getAttendance(date)),
        ]);

        if (isMounted) {
          setStudents(allStudents);
          setParents(allParents);
          setAnnouncements(allAnnouncements);
          setTasks(allTasks);
          setTaskReplies(allReplies);
          setMessageThreads(allThreads);
          setBehaviors(allBehaviors);

          // Flatten week attendance
          const combinedAtt: Attendance[] = [];
          weekAttResults.forEach((arr) => {
            if (Array.isArray(arr)) combinedAtt.push(...arr);
          });
          setWeekAttendance(combinedAtt);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [refreshKey, currentWeekDays]);

  // Current selected class filter
  const currentClassStudents = useMemo(() => {
    if (activeClassId === 'all') return students;
    return students.filter((s) => s.classId === activeClassId);
  }, [students, activeClassId]);

  const activeStudentsCount = useMemo(() => {
    return currentClassStudents.filter((s) => s.status === 'active').length;
  }, [currentClassStudents]);

  const transferredCount = useMemo(() => {
    return currentClassStudents.filter((s) => s.status === 'transferred').length;
  }, [currentClassStudents]);

  const leaveCount = useMemo(() => {
    return currentClassStudents.filter((s) => s.status === 'leave').length;
  }, [currentClassStudents]);

  // Parent map for quick student lookup
  const parentMap = useMemo(() => {
    const map = new Map<string, Parent>();
    parents.forEach((p) => map.set(p.id, p));
    return map;
  }, [parents]);

  // Today's attendance for current class
  const todayClassAttendance = useMemo(() => {
    const todayRecords = weekAttendance.filter((a) => a.date === todayStr);
    if (activeClassId === 'all') return todayRecords;
    const studentIds = new Set(currentClassStudents.map((s) => s.id));
    return todayRecords.filter((a) => studentIds.has(a.studentId));
  }, [weekAttendance, todayStr, currentClassStudents, activeClassId]);

  // Weekly attendance stats
  const weeklyStats = useMemo(() => {
    const classStudentIds = new Set(currentClassStudents.map((s) => s.id));
    const relevantWeekAtt =
      activeClassId === 'all'
        ? weekAttendance
        : weekAttendance.filter((a) => classStudentIds.has(a.studentId));

    const totalExpected = (currentClassStudents.length || 1) * currentWeekDays.length;
    const presentCount = relevantWeekAtt.filter(
      (a) => a.status === 'present' || a.status === 'late'
    ).length;
    const unexcusedCount = relevantWeekAtt.filter((a) => a.status === 'absent_unexcused').length;
    const excusedCount = relevantWeekAtt.filter((a) => a.status === 'absent_excused').length;
    const lateCount = relevantWeekAtt.filter((a) => a.status === 'late').length;

    const rate = totalExpected > 0 ? Math.min(100, Math.round((presentCount / totalExpected) * 100)) : 98;

    return {
      rate,
      presentCount,
      unexcusedCount,
      excusedCount,
      lateCount,
      totalRecords: relevantWeekAtt.length,
    };
  }, [weekAttendance, currentClassStudents, activeClassId, currentWeekDays]);

  // VIỆC CẦN XỬ LÝ (Action Items / Pending Matters)
  const pendingActions = useMemo(() => {
    const actions: Array<{
      id: string;
      type: 'absence' | 'task_reply' | 'message' | 'task_due';
      title: string;
      desc: string;
      studentName?: string;
      parentPhone?: string;
      parentName?: string;
      link: string;
      severity: 'high' | 'medium' | 'low';
    }> = [];

    // 1. Unexcused Absences today requiring teacher contact
    const unexcusedToday = todayClassAttendance.filter((a) => a.status === 'absent_unexcused');
    unexcusedToday.forEach((att) => {
      const student = currentClassStudents.find((s) => s.id === att.studentId);
      const parent = student?.parentId ? parentMap.get(student.parentId) : undefined;
      actions.push({
        id: `att-${att.id}`,
        type: 'absence',
        title: `Học sinh vắng không phép: ${student?.fullName || 'Học sinh'}`,
        desc: `Cần gọi điện xác minh phụ huynh (${parent?.fullName || 'Chưa rõ'} - ${parent?.phone || 'Chưa có SĐT'})`,
        studentName: student?.fullName,
        parentPhone: parent?.phone,
        parentName: parent?.fullName,
        link: '/admin/attendance',
        severity: 'high',
      });
    });

    // 2. Unread or pending message threads
    const unreadThreads = messageThreads.filter((t) => t.unreadCountAdmin > 0);
    unreadThreads.forEach((th) => {
      actions.push({
        id: `msg-${th.id}`,
        type: 'message',
        title: `Tin nhắn chưa đọc: ${th.title}`,
        desc: th.lastMessage || 'Phụ huynh gửi tin nhắn mới cần trả lời',
        link: '/admin/messages',
        severity: 'medium',
      });
    });

    // 3. Pending task replies needing teacher review
    const pendingReplies = taskReplies.filter((r) => r.status === 'pending');
    if (pendingReplies.length > 0) {
      actions.push({
        id: 'replies-pending',
        type: 'task_reply',
        title: `Có ${pendingReplies.length} phản hồi nhiệm vụ/khảo sát mới`,
        desc: 'Học sinh và phụ huynh đã nộp minh chứng, đang chờ giáo viên duyệt',
        link: '/admin/tasks',
        severity: 'medium',
      });
    }

    // 4. Open tasks nearing due date
    const openTasks = tasks.filter((t) => t.status === 'open');
    openTasks.slice(0, 2).forEach((task) => {
      actions.push({
        id: `task-${task.id}`,
        type: 'task_due',
        title: `Nhiệm vụ đang mở: ${task.title}`,
        desc: `Hạn chót: ${task.dueDate} | Thể loại: ${
          task.type === 'assignment'
            ? 'Bài tập'
            : task.type === 'survey'
            ? 'Khảo sát'
            : task.type === 'fee'
            ? 'Khoản thu'
            : 'Biểu mẫu'
        }`,
        link: '/admin/tasks',
        severity: 'low',
      });
    });

    return actions;
  }, [todayClassAttendance, currentClassStudents, parentMap, messageThreads, taskReplies, tasks]);

  // Statistics for Behavior & Discipline: total praise points, warning count in week / month
  const behaviorStats = useMemo(() => {
    const studentIds = new Set(currentClassStudents.map((s) => s.id));
    const classBehaviors =
      activeClassId === 'all'
        ? behaviors
        : behaviors.filter((b) => studentIds.has(b.studentId));

    const curMonth = todayStr.substring(0, 7);
    const inWeek = classBehaviors.filter((b) => {
      return (
        b.date >= currentWeekDays[0] &&
        b.date <= currentWeekDays[currentWeekDays.length - 1]
      );
    });
    const inMonth = classBehaviors.filter((b) => b.date.startsWith(curMonth));

    const activeList = behaviorPeriod === 'week' ? inWeek : inMonth;
    const praiseList = activeList.filter(
      (b) => b.type === 'PRAISE' || b.type === 'positive'
    );
    const warnList = activeList.filter(
      (b) => b.type === 'WARN' || b.type === 'negative'
    );

    const totalPraisePoints = praiseList.reduce(
      (sum, b) => sum + (b.points > 0 ? b.points : 0),
      0
    );
    const warnCount = warnList.length;
    const totalWarnDeduction = warnList.reduce(
      (sum, b) => sum + (b.points < 0 ? Math.abs(b.points) : 0),
      0
    );

    return {
      period: behaviorPeriod,
      totalPraisePoints,
      praiseCount: praiseList.length,
      warnCount,
      totalWarnDeduction,
      totalRecords: activeList.length,
    };
  }, [behaviors, currentClassStudents, activeClassId, currentWeekDays, todayStr, behaviorPeriod]);

  // Quick submit announcement via dataProvider
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    try {
      setIsSavingAnn(true);
      await dataProvider.add<Announcement>('announcements', {
        classId: activeClassId || 'class-11a2',
        title: newAnnTitle.trim(),
        content: newAnnContent.trim(),
        target: 'all',
        pinned: false,
        category: newAnnCategory,
        author: classInfo?.homeroomTeacher.name || 'GVCN',
        createdAt: new Date().toISOString().split('T')[0],
      });
      setIsAnnounceModalOpen(false);
      setNewAnnTitle('');
      setNewAnnContent('');
      refreshData();
    } catch (err) {
      console.error('Error adding announcement:', err);
    } finally {
      setIsSavingAnn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Greeting + Class Selection */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Building2 className="w-3.5 h-3.5" />
            <span>
              {classes.find((c) => c.id === activeClassId)?.className || classInfo?.className || 'Lớp 11A2'} - Niên khóa {classInfo?.schoolYear || '2025 - 2026'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Bảng điều khiển Chủ nhiệm Lớp
          </h1>
          <p className="text-sm text-slate-500">
            GVCN: <strong>{classInfo?.homeroomTeacher.name}</strong> • Phòng học: {classInfo?.room || '301-A'}
          </p>
        </div>

        {/* Quick Actions & Class Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Chọn lớp:</span>
            <select
              value={activeClassId}
              onChange={(e) => setActiveClassId(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả các lớp</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className || cls.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAnnounceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Đăng thông báo</span>
          </button>

          <Link
            to="/admin/attendance"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>Điểm danh hôm nay</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Overview Cards: SỐ HỌC SINH + TỈ LỆ CHUYÊN CẦN TUẦN NÀY + THÔNG BÁO MỚI + VIỆC CẦN XỬ LÝ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. SỐ HỌC SINH */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              1. Số Học Sinh
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {currentClassStudents.length}{' '}
              <span className="text-sm font-normal text-slate-400">học sinh</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
              <span className="text-emerald-600 font-semibold">{activeStudentsCount} đang học</span>
              <span>•</span>
              <span className="text-amber-600">{leaveCount} tạm nghỉ</span>
              {transferredCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-slate-400">{transferredCount} chuyển trường</span>
                </>
              )}
            </div>
          </div>

          <Link
            to="/admin/students"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            Xem danh sách học sinh <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2. TỈ LỆ CHUYÊN CẦN TUẦN NÀY */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              2. Chuyên cần tuần này
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-extrabold text-emerald-600">
                {weeklyStats.rate}%
              </div>
              <span className="text-xs font-medium text-slate-500">Tỉ lệ có mặt</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${weeklyStats.rate}%` }}
              />
            </div>

            <div className="text-[11px] text-slate-500 mt-1.5 flex justify-between">
              <span>Muộn: {weeklyStats.lateCount}</span>
              <span>Phép: {weeklyStats.excusedCount}</span>
              <span className="text-rose-600 font-semibold">K.phép: {weeklyStats.unexcusedCount}</span>
            </div>
          </div>

          <Link
            to="/admin/attendance"
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            Sổ điểm danh tuần <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3. THÔNG BÁO MỚI */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              3. Thông báo mới
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {announcements.length}{' '}
              <span className="text-sm font-normal text-slate-400">bản tin</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              Mới nhất: {announcements[0]?.title || 'Chưa có thông báo'}
            </p>
          </div>

          <Link
            to="/admin/announcements"
            className="text-xs font-medium text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            Quản lý bảng tin <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4. VIỆC CẦN XỬ LÝ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              4. Việc cần xử lý
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-3xl font-extrabold text-amber-600">
              {pendingActions.length}{' '}
              <span className="text-sm font-normal text-slate-400">mục chờ</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {pendingActions.filter((p) => p.severity === 'high').length} việc ưu tiên cao
            </div>
          </div>

          <a
            href="#section-pending-actions"
            className="text-xs font-medium text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            Xem danh sách việc cần làm <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* SECTION: THỐNG KÊ NỀ NẾP / HÀNH VI: TỔNG ĐIỂM KHEN, SỐ LẦN NHẮC TRONG TUẦN/THÁNG */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Thống Kê Nề Nếp & Khen Thưởng ({behaviorPeriod === 'week' ? 'Tuần này' : 'Tháng này'})
              </h2>
              <p className="text-xs text-slate-400">
                Tổng hợp điểm thi đua, khen thưởng việc tốt và nhắc nhở nề nếp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Tuần / Tháng */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setBehaviorPeriod('week')}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${
                  behaviorPeriod === 'week'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                Tuần này
              </button>
              <button
                type="button"
                onClick={() => setBehaviorPeriod('month')}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${
                  behaviorPeriod === 'month'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                Tháng này
              </button>
            </div>

            <Link
              to="/admin/behavior"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-xl hover:bg-indigo-50 flex items-center gap-1"
            >
              Vào sổ nề nếp <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards: Tổng điểm khen, Số lần nhắc, Tổng ghi nhận, Thao tác */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Tổng điểm khen</div>
              <div className="text-xl font-extrabold text-emerald-700">
                +{behaviorStats.totalPraisePoints} <span className="text-xs font-normal text-slate-500">điểm</span>
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">
                {behaviorStats.praiseCount} lượt khen việc tốt
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Số lần nhắc</div>
              <div className="text-xl font-extrabold text-rose-700">
                {behaviorStats.warnCount} <span className="text-xs font-normal text-slate-500">lần nhắc</span>
              </div>
              <div className="text-[11px] text-rose-600 mt-0.5">
                Trừ -{behaviorStats.totalWarnDeduction} điểm rèn luyện
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Tổng bản ghi nề nếp</div>
              <div className="text-xl font-extrabold text-slate-800">
                {behaviorStats.totalRecords} <span className="text-xs font-normal text-slate-500">bản ghi</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {behaviorPeriod === 'week' ? 'Tính trong tuần hiện tại' : 'Tính trong tháng hiện tại'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
            <div>
              <div className="text-xs text-indigo-900 font-bold">Thao tác nề nếp</div>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                Ghi nhận khen ngợi hoặc nhắc nhở ngay
              </p>
            </div>
            <Link
              to="/admin/behavior"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0"
            >
              + Ghi nhận
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION: VIỆC CẦN XỬ LÝ (Action Items Panel) */}
      <div id="section-pending-actions" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Danh sách việc cần xử lý</h2>
              <p className="text-xs text-slate-500">
                Các sự vụ học sinh vắng, tin nhắn phụ huynh và khảo sát đang chờ giáo viên giải quyết
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
            {pendingActions.length} việc cần chú ý
          </span>
        </div>

        {pendingActions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tuyệt vời! Không có việc gì tồn đọng</p>
            <p className="text-xs text-slate-400 mt-0.5">Tất cả nề nếp, điểm danh và tin nhắn đều đã được xử lý xong.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingActions.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  item.severity === 'high'
                    ? 'bg-rose-50/60 border-rose-200'
                    : item.severity === 'medium'
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        item.severity === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : item.severity === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.type === 'absence'
                        ? 'Cảnh báo vắng'
                        : item.type === 'message'
                        ? 'Tin nhắn PH'
                        : item.type === 'task_reply'
                        ? 'Duyệt bài nộp'
                        : 'Hạn nhiệm vụ'}
                    </span>

                    {item.parentPhone && (
                      <a
                        href={`tel:${item.parentPhone}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Gọi ngay</span>
                      </a>
                    )}
                  </div>

                  <h4 className="font-semibold text-slate-900 text-sm mt-2">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Hôm nay</span>
                  <Link
                    to={item.link}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                  >
                    Xử lý ngay <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Thông báo mới & Chi tiết chuyên cần tuần */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thông báo mới */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Bảng tin & Thông báo mới</h2>
            </div>
            <Link
              to="/admin/announcements"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-sm text-slate-900 line-clamp-1">
                    {ann.title}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      ann.category === 'urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : ann.category === 'fees'
                        ? 'bg-amber-100 text-amber-700'
                        : ann.category === 'event'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {ann.category === 'urgent'
                      ? 'Khẩn'
                      : ann.category === 'fees'
                      ? 'Kinh phí'
                      : ann.category === 'event'
                      ? 'Sự kiện'
                      : 'Chung'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {ann.content}
                </p>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>{ann.author}</span>
                  <span>{ann.createdAt}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsAnnounceModalOpen(true)}
            className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm thông báo gửi phụ huynh & học sinh</span>
          </button>
        </div>

        {/* Điểm danh chuyên cần theo ngày trong tuần */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Chi tiết chuyên cần tuần này</h2>
            </div>
            <Link
              to="/admin/attendance"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              Vào sổ điểm danh <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Monday to Friday attendance bars */}
          <div className="space-y-2.5">
            {currentWeekDays.map((dateStr, idx) => {
              const dayRecords = weekAttendance.filter((a) => a.date === dateStr);
              const dayLabel = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu'][idx];
              const isToday = dateStr === todayStr;
              const presentDayCount = dayRecords.filter(
                (a) => a.status === 'present' || a.status === 'late'
              ).length;
              const absentDayCount = dayRecords.filter(
                (a) => a.status === 'absent_unexcused' || a.status === 'absent_excused'
              ).length;
              const dayRate =
                currentClassStudents.length > 0
                  ? Math.round((presentDayCount / currentClassStudents.length) * 100)
                  : 100;

              return (
                <div
                  key={dateStr}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isToday ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="min-w-[100px]">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{dayLabel}</span>
                      {isToday && (
                        <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded font-medium">
                          Hôm nay
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{dateStr}</div>
                  </div>

                  <div className="flex-1 px-4">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${
                          dayRate >= 95
                            ? 'bg-emerald-500'
                            : dayRate >= 90
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${dayRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <div className="text-xs font-bold text-slate-800">{dayRate}%</div>
                    <div className="text-[11px] text-slate-500">
                      {presentDayCount} có mặt • {absentDayCount} vắng
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>Dữ liệu tính toán từ DataProvider chuẩn</span>
            <span className="font-semibold text-indigo-700">Lớp {classInfo?.className || '11A2'}</span>
          </div>
        </div>
      </div>

      {/* QUICK ANNOUNCEMENT MODAL */}
      {isAnnounceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Đăng thông báo mới</h3>
              </div>
              <button
                onClick={() => setIsAnnounceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề thông báo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  placeholder="VD: Thông báo họp phụ huynh đầu kỳ 2..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phân loại thông báo
                </label>
                <select
                  value={newAnnCategory}
                  onChange={(e) => setNewAnnCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="general">Chung (general)</option>
                  <option value="urgent">Khẩn cấp (urgent)</option>
                  <option value="event">Sự kiện / Hoạt động (event)</option>
                  <option value="fees">Thu chi / Kinh phí (fees)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung chi tiết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  placeholder="Kính gửi toàn thể quý phụ huynh và các em học sinh..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAnnounceModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSavingAnn}
                  className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSavingAnn ? 'Đang gửi...' : 'Đăng thông báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
