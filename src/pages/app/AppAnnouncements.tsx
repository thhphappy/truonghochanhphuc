import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Pin,
  FileText,
  Calendar,
  Layers,
  Search,
  Users,
  UserCheck,
  GraduationCap,
  Download,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { Announcement, AnnouncementTarget } from '../../core/types';

export const AppAnnouncements: React.FC = () => {
  const { classes, activeClassId, classInfo, refreshData } = useApp();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [currentClassFilter, setCurrentClassFilter] = useState<string>(activeClassId || 'class-11a2');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Synchronize when activeClassId changes
  useEffect(() => {
    if (activeClassId) {
      setCurrentClassFilter(activeClassId);
    }
  }, [activeClassId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Using provider with class filtering
        const data = await dataProvider.getAnnouncements(currentClassFilter);
        setAnnouncements(data);
      } catch (err) {
        console.error('Error loading announcements:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [currentClassFilter, refreshData]);

  // Priority sorting: pinned items FIRST, then newest createdAt
  const sortedAndFiltered = useMemo(() => {
    return announcements
      .filter((a) => {
        // Category filter
        if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;

        // Target filter
        if (targetFilter !== 'all' && a.target !== targetFilter && a.target !== 'all') return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = a.title?.toLowerCase().includes(q);
          const matchesContent = a.content?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesContent) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Priority 1: Pinned announcements first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        // Priority 2: Newest first
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
  }, [announcements, categoryFilter, targetFilter, searchQuery]);

  const currentClassName =
    classes.find((c) => c.id === currentClassFilter)?.className ||
    classInfo?.className ||
    classInfo?.name ||
    'Lớp 11A2';

  const getTargetBadge = (target?: AnnouncementTarget) => {
    switch (target) {
      case 'parent':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <UserCheck className="w-3 h-3 text-amber-600" />
            Dành cho Phụ huynh
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <GraduationCap className="w-3 h-3 text-indigo-600" />
            Dành cho Học sinh
          </span>
        );
      case 'all':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Users className="w-3 h-3 text-emerald-600" />
            Toàn thể lớp
          </span>
        );
    }
  };

  const pinnedCount = sortedAndFiltered.filter((a) => a.pinned).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Bảng Tin & Thông Báo - {currentClassName}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Kênh thông tin chính thức từ Giáo viên chủ nhiệm và Nhà trường
              </p>
            </div>
          </div>
        </div>

        {/* Class switcher for viewing by class */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 self-start sm:self-auto">
          <Layers className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">Xem lớp:</span>
          <select
            value={currentClassFilter}
            onChange={(e) => setCurrentClassFilter(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-blue-600 focus:outline-hidden cursor-pointer"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.className || c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm thông báo theo từ khóa..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Target Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs shrink-0">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">Đối tượng:</span>
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-semibold focus:outline-hidden text-xs py-0.5"
            >
              <option value="all">Tất cả đối tượng</option>
              <option value="parent">Phụ huynh</option>
              <option value="student">Học sinh</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              categoryFilter === 'all'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất cả ({announcements.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('urgent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              categoryFilter === 'urgent'
                ? 'bg-rose-600 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🚨 Khẩn cấp & Quan trọng
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('event')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              categoryFilter === 'event'
                ? 'bg-purple-600 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🎉 Sự kiện & Dã ngoại
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('fees')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              categoryFilter === 'fees'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            💰 Kinh phí & Quỹ lớp
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('general')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              categoryFilter === 'general'
                ? 'bg-slate-700 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            📢 Thông báo chung
          </button>
        </div>

        {pinnedCount > 0 && (
          <div className="text-[11px] text-blue-700 bg-blue-50/70 border border-blue-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              Có <strong>{pinnedCount}</strong> thông báo quan trọng được ưu tiên ghim lên đầu bảng tin.
            </span>
          </div>
        )}
      </div>

      {/* Announcement List: Pinned on top */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-sm">
            Đang tải thông báo của lớp...
          </div>
        ) : sortedAndFiltered.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 text-sm">
            Chưa có thông báo nào trong danh mục này.
          </div>
        ) : (
          sortedAndFiltered.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs transition-all relative ${
                ann.pinned
                  ? 'border-blue-300 ring-2 ring-blue-100 bg-gradient-to-br from-blue-50/40 via-white to-white'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Pinned Tag: Prominent */}
                {ann.pinned && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                    <Pin className="w-3 h-3" /> Đã ghim ưu tiên
                  </span>
                )}

                {/* Target badge */}
                {getTargetBadge(ann.target)}

                {/* Category badge */}
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                    ann.category === 'urgent'
                      ? 'bg-rose-100 text-rose-700'
                      : ann.category === 'fees'
                      ? 'bg-amber-100 text-amber-700'
                      : ann.category === 'event'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {ann.category === 'urgent'
                    ? 'Khẩn cấp'
                    : ann.category === 'fees'
                    ? 'Kinh phí'
                    : ann.category === 'event'
                    ? 'Sự kiện'
                    : 'Chung'}
                </span>

                {/* Created At */}
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {ann.createdAt}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-2.5">
                {ann.title}
              </h2>

              {/* Content */}
              <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              {/* Attachments */}
              {ann.attachments && ann.attachments.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  {ann.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-blue-700 hover:bg-blue-50 font-medium transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>{file.name}</span>
                      {file.size && <span className="text-slate-400 text-[11px]">({file.size})</span>}
                      <Download className="w-3 h-3 text-slate-400 ml-0.5" />
                    </a>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Đăng bởi: <strong className="text-slate-700">{ann.author || 'GVCN Lớp'}</strong>
                </span>
                <span className="text-[11px] text-slate-400">ID: {ann.id}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
