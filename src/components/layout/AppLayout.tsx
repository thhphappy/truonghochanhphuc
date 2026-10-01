import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Award,
  Bell,
  CheckSquare,
  MessageSquare,
  FileText,
  BarChart3,
  Menu,
  X,
  GraduationCap,
  ArrowRightLeft,
  RotateCcw,
  School,
  UserCircle,
  ExternalLink,
  Building2,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';

interface AppLayoutProps {
  children: React.ReactNode;
  portal?: 'admin' | 'app';
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, portal }) => {
  const { classInfo, students, activeStudentId, setActiveStudentId, resetDemoData } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPortal = portal || (location.pathname.startsWith('/admin') ? 'admin' : 'app');

  const adminNavItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/classes', label: 'Lớp học (ClassInfo)', icon: Building2 },
    { to: '/admin/students', label: 'Học sinh (Students)', icon: Users },
    { to: '/admin/parents', label: 'Phụ huynh (Parents)', icon: UserCheck },
    { to: '/admin/attendance', label: 'Điểm danh chuyên cần', icon: CalendarCheck },
    { to: '/admin/behavior', label: 'Sổ nề nếp & Thi đua', icon: Award },
    { to: '/admin/announcements', label: 'Bảng tin thông báo', icon: Bell },
    { to: '/admin/tasks', label: 'Nhiệm vụ & Khảo sát', icon: CheckSquare },
    { to: '/admin/messages', label: 'Tin nhắn phụ huynh', icon: MessageSquare },
    { to: '/admin/documents', label: 'Tài liệu & Biểu mẫu', icon: FileText },
    { to: '/admin/reports', label: 'Báo cáo tuần / tháng', icon: BarChart3 },
  ];

  const parentNavItems = [
    { to: '/app', label: 'Trang chủ phụ huynh', icon: LayoutDashboard, exact: true },
    { to: '/app/attendance', label: 'Chuyên cần của con', icon: CalendarCheck },
    { to: '/app/behavior', label: 'Nề nếp & Khen thưởng', icon: Award },
    { to: '/app/tasks', label: 'Nhiệm vụ & Khảo sát', icon: CheckSquare },
    { to: '/app/messages', label: 'Nhắn tin với GVCN', icon: MessageSquare },
    { to: '/app/documents', label: 'Tài liệu & Thời khóa biểu', icon: FileText },
  ];

  const navItems = currentPortal === 'admin' ? adminNavItems : parentNavItems;

  const handleSwitchPortal = () => {
    if (currentPortal === 'admin') {
      navigate('/app');
    } else {
      navigate('/admin');
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Bạn có chắc muốn đặt lại dữ liệu mẫu ban đầu không? Mọi thay đổi thử nghiệm sẽ được khôi phục.')) {
      await resetDemoData();
      alert('Đã khôi phục dữ liệu mẫu thành công!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle Navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900">
                    {classInfo?.name || 'Lớp 11A2'}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      currentPortal === 'admin'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {currentPortal === 'admin' ? 'Kênh GVCN' : 'Cổng Phụ Huynh/Học Sinh'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                  <School className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{classInfo?.schoolName || 'THPT Chu Văn An'}</span>
                  <span>•</span>
                  <span>{classInfo?.academicYear || '2025-2026'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student selector for parent app */}
            {currentPortal === 'app' && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs sm:text-sm">
                <UserCircle className="w-4 h-4 text-slate-500 ml-1" />
                <span className="text-slate-600 hidden lg:inline font-medium">Học sinh:</span>
                <select
                  value={activeStudentId}
                  onChange={(e) => setActiveStudentId(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 border-none outline-hidden cursor-pointer pr-2 text-xs sm:text-sm max-w-[140px] sm:max-w-[190px] truncate"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.rollNumber}. {st.fullName} ({st.group || 'Lớp'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Portal Switcher Button */}
            <button
              type="button"
              onClick={handleSwitchPortal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs ${
                currentPortal === 'admin'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              }`}
              title="Chuyển đổi góc nhìn phân hệ"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {currentPortal === 'admin' ? 'Xem góc Phụ Huynh' : 'Xem góc GVCN'}
              </span>
              <span className="sm:hidden">
                {currentPortal === 'admin' ? 'Phụ Huynh' : 'GVCN'}
              </span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              type="button"
              onClick={handleResetData}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Khôi phục dữ liệu mẫu (localStorage)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-22 bg-white rounded-2xl border border-slate-200 shadow-xs p-3 flex flex-col gap-1">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {currentPortal === 'admin' ? 'Quản lí chủ nhiệm' : 'Sổ liên lạc điện tử'}
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? portal === 'admin'
                          ? 'bg-blue-600 text-white shadow-xs font-semibold'
                          : 'bg-emerald-600 text-white shadow-xs font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}

            {/* Teacher / Student Info Box */}
            <div className="mt-4 pt-4 border-t border-slate-100 px-3 pb-2 text-xs text-slate-500">
              {currentPortal === 'admin' ? (
                <div>
                  <div className="font-semibold text-slate-800">
                    {classInfo?.homeroomTeacher.name}
                  </div>
                  <div>GVCN • Môn {classInfo?.homeroomTeacher.subject}</div>
                  <div className="text-slate-400 mt-0.5">{classInfo?.homeroomTeacher.phone}</div>
                </div>
              ) : (
                <div>
                  <div className="font-semibold text-slate-800">
                    Phụ huynh & Học sinh
                  </div>
                  <div>Lớp {classInfo?.name} • Phòng {classInfo?.room}</div>
                  <div className="text-emerald-700 mt-0.5 font-medium">Hệ thống đồng bộ trực tuyến</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl p-4 flex flex-col z-10">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800">Menu chức năng</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.exact}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                          isActive
                            ? currentPortal === 'admin'
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'bg-emerald-600 text-white font-semibold'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleSwitchPortal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>{currentPortal === 'admin' ? 'Chuyển sang Phụ Huynh' : 'Chuyển sang GVCN'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};
