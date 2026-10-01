import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Plus,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  X,
  Search,
  Users,
  UserCheck,
  GraduationCap,
  Paperclip,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { Announcement, AnnouncementCategory, AnnouncementTarget } from '../../core/types';

export const AdminAnnouncements: React.FC = () => {
  const { classes, activeClassId, classInfo, refreshData } = useApp();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [pinnedFilter, setPinnedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal states for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formClassId, setFormClassId] = useState<string>('class-11a2');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formTarget, setFormTarget] = useState<AnnouncementTarget>('all');
  const [formPinned, setFormPinned] = useState<boolean>(false);
  const [formCategory, setFormCategory] = useState<AnnouncementCategory>('general');
  const [formAttachmentName, setFormAttachmentName] = useState<string>('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState<string>('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      const data = await dataProvider.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error loading announcements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [refreshData]);

  // Sync default form class with active class
  useEffect(() => {
    if (activeClassId && activeClassId !== 'all') {
      setFormClassId(activeClassId);
    }
  }, [activeClassId]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormClassId(activeClassId !== 'all' ? activeClassId : 'class-11a2');
    setFormTitle('');
    setFormContent('');
    setFormTarget('all');
    setFormPinned(false);
    setFormCategory('general');
    setFormAttachmentName('');
    setFormAttachmentUrl('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (ann: Announcement) => {
    setEditingId(ann.id);
    setFormClassId(ann.classId || 'class-11a2');
    setFormTitle(ann.title);
    setFormContent(ann.content);
    setFormTarget(ann.target || 'all');
    setFormPinned(ann.pinned === true);
    setFormCategory(ann.category || 'general');
    if (ann.attachments && ann.attachments.length > 0) {
      setFormAttachmentName(ann.attachments[0].name);
      setFormAttachmentUrl(ann.attachments[0].url);
    } else {
      setFormAttachmentName('');
      setFormAttachmentUrl('');
    }
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung thông báo!');
      return;
    }

    try {
      const now = new Date();
      const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      const attachments = formAttachmentName.trim()
        ? [
            {
              name: formAttachmentName.trim(),
              url: formAttachmentUrl.trim() || 'https://example.com/tailieu.pdf',
              size: '1.2 MB',
            },
          ]
        : undefined;

      if (editingId) {
        // Update existing announcement
        await dataProvider.update<Announcement>('announcements', editingId, {
          classId: formClassId,
          title: formTitle.trim(),
          content: formContent.trim(),
          target: formTarget,
          pinned: formPinned,
          category: formCategory,
          attachments,
        });
        showToast('Cập nhật thông báo thành công!');
      } else {
        // Create new announcement
        await dataProvider.add<Announcement>('announcements', {
          classId: formClassId,
          title: formTitle.trim(),
          content: formContent.trim(),
          target: formTarget,
          pinned: formPinned,
          category: formCategory,
          createdAt,
          author: classInfo?.homeroomTeacher.name || 'GVCN Thầy Trần Quang Huy',
          attachments,
        });
        showToast('Đăng thông báo mới thành công!');
      }

      setIsModalOpen(false);
      refreshData();
      await loadAnnouncements();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi lưu thông báo.');
    }
  };

  // Toggle Pinned status (Nút ghim trực tiếp)
  const handleTogglePin = async (ann: Announcement) => {
    const newPinned = !ann.pinned;
    try {
      await dataProvider.update<Announcement>('announcements', ann.id, {
        pinned: newPinned,
      });
      setAnnouncements((prev) =>
        prev.map((item) => (item.id === ann.id ? { ...item, pinned: newPinned } : item))
      );
      showToast(newPinned ? 'Đã ghim thông báo lên đầu bảng tin!' : 'Đã bỏ ghim thông báo!');
      refreshData();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
      alert('Không thể thay đổi trạng thái ghim.');
    }
  };

  // Delete announcement
  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này khỏi hệ thống?')) {
      try {
        await dataProvider.remove('announcements', id);
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        showToast('Đã xóa thông báo thành công.');
        refreshData();
      } catch (err) {
        console.error('Failed to delete announcement:', err);
        alert('Không thể xóa thông báo.');
      }
    }
  };

  // Filter and Sort announcements: Pinned first, then sorted by createdAt descending
  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((a) => {
        // Class filter
        if (selectedClassFilter !== 'all') {
          if (a.classId !== selectedClassFilter && a.classId !== 'all') return false;
        }
        // Target filter
        if (targetFilter !== 'all') {
          if (a.target !== targetFilter && a.target !== 'all') return false;
        }
        // Pinned filter
        if (pinnedFilter === 'pinned' && !a.pinned) return false;
        if (pinnedFilter === 'unpinned' && a.pinned) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = a.title.toLowerCase().includes(q);
          const matchesContent = a.content.toLowerCase().includes(q);
          if (!matchesTitle && !matchesContent) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
  }, [announcements, selectedClassFilter, targetFilter, pinnedFilter, searchQuery]);

  const getTargetBadge = (target?: AnnouncementTarget) => {
    switch (target) {
      case 'parent':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200/70">
            <UserCheck className="w-3 h-3 text-amber-600" />
            Phụ huynh
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
            <GraduationCap className="w-3 h-3 text-indigo-600" />
            Học sinh
          </span>
        );
      case 'all':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            <Users className="w-3 h-3 text-emerald-600" />
            Toàn thể (PH & HS)
          </span>
        );
    }
  };

  const getCategoryBadge = (cat?: AnnouncementCategory) => {
    switch (cat) {
      case 'urgent':
        return <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-700">Khẩn cấp</span>;
      case 'fees':
        return <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700">Kinh phí</span>;
      case 'event':
        return <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-700">Sự kiện</span>;
      case 'general':
      default:
        return <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">Chung</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản Lý Thông Báo & Bảng Tin</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý các thông báo chính thức, phân quyền đối tượng nhận và ghim tin quan trọng.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo thông báo mới</span>
        </button>
      </div>

      {/* Control Bar: Class, Target, Pinned, Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm thông báo theo tiêu đề, nội dung..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Class filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-transparent border-none text-slate-700 font-medium focus:outline-hidden text-xs py-0.5"
              >
                <option value="all">Tất cả các lớp</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className || c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={targetFilter}
                onChange={(e) => setTargetFilter(e.target.value)}
                className="bg-transparent border-none text-slate-700 font-medium focus:outline-hidden text-xs py-0.5"
              >
                <option value="all">Mọi đối tượng</option>
                <option value="parent">Chỉ Phụ huynh</option>
                <option value="student">Chỉ Học sinh</option>
              </select>
            </div>

            {/* Pinned filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Pin className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={pinnedFilter}
                onChange={(e) => setPinnedFilter(e.target.value)}
                className="bg-transparent border-none text-slate-700 font-medium focus:outline-hidden text-xs py-0.5"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pinned">Đã ghim (📌)</option>
                <option value="unpinned">Không ghim</option>
              </select>
            </div>
          </div>
        </div>

        {/* Counter & quick status summary */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Hiển thị <strong>{filteredAnnouncements.length}</strong> / {announcements.length} thông báo
          </span>
          <span className="text-[11px] text-blue-600 font-medium">
            Có {announcements.filter((a) => a.pinned).length} thông báo đang được ghim
          </span>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-sm">
            Đang tải dữ liệu bảng tin...
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 text-sm">
            Không tìm thấy thông báo nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const classObj = classes.find((c) => c.id === ann.classId);
            const classNameDisplay = ann.classId === 'all' ? 'Toàn trường' : classObj?.className || classObj?.name || ann.classId || 'Lớp 11A2';

            return (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl p-5 border shadow-xs transition-all relative ${
                  ann.pinned
                    ? 'border-blue-300 ring-2 ring-blue-100 bg-gradient-to-r from-blue-50/30 via-white to-white'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Pinned Indicator */}
                    {ann.pinned && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                        <Pin className="w-3 h-3" /> Đã ghim lên đầu
                      </span>
                    )}

                    {/* Class badge */}
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      <Layers className="w-3 h-3 text-slate-500" />
                      {classNameDisplay}
                    </span>

                    {/* Target badge */}
                    {getTargetBadge(ann.target)}

                    {/* Category badge */}
                    {getCategoryBadge(ann.category)}

                    {/* Created Date */}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {ann.createdAt}
                    </span>
                  </div>

                  {/* Actions: Direct Pinned Button, Edit, Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* NÚT GHIM TRỰC TIẾP (CRITICAL USER REQUIREMENT) */}
                    <button
                      type="button"
                      onClick={() => handleTogglePin(ann)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        ann.pinned
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                      title={ann.pinned ? 'Bỏ ghim thông báo này' : 'Ghim thông báo này lên đầu bảng tin'}
                    >
                      {ann.pinned ? (
                        <>
                          <PinOff className="w-3.5 h-3.5 text-blue-600" />
                          <span>Bỏ ghim</span>
                        </>
                      ) : (
                        <>
                          <Pin className="w-3.5 h-3.5 text-slate-500" />
                          <span>Ghim</span>
                        </>
                      )}
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(ann)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Chỉnh sửa thông báo"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(ann.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Gỡ thông báo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-2.5">
                  {ann.title}
                </h2>

                {/* Content */}
                <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>

                {/* Attachments if any */}
                {ann.attachments && ann.attachments.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                    {ann.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-blue-700 hover:bg-blue-50 font-medium transition-colors"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                        <span>{file.name}</span>
                        {file.size && <span className="text-slate-400 text-[11px]">({file.size})</span>}
                      </a>
                    ))}
                  </div>
                )}

                {/* Author footer */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Người đăng: <strong className="text-slate-700">{ann.author || 'GVCN'}</strong>
                  </span>
                  <span className="text-[11px] text-slate-400">Mã ID: {ann.id}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create / Edit Announcement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingId ? 'Chỉnh sửa thông báo' : 'Đăng thông báo mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 mt-4">
              {/* Class & Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Áp dụng cho lớp *
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="all">Tất cả các lớp (Toàn trường)</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.className || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đối tượng nhận tin (target) *
                  </label>
                  <select
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value as AnnouncementTarget)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="all">Toàn thể (Phụ huynh & Học sinh)</option>
                    <option value="parent">Chỉ Phụ huynh</option>
                    <option value="student">Chỉ Học sinh</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề thông báo *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="VD: Lịch họp phụ huynh, Kế hoạch ngoại khóa..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Category & Pinned Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chuyên mục thông báo
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AnnouncementCategory)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="general">Thông báo chung</option>
                    <option value="urgent">Khẩn cấp & Quan trọng</option>
                    <option value="event">Sự kiện & Ngoại khóa</option>
                    <option value="fees">Kinh phí & Quỹ lớp</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formPinned}
                      onChange={(e) => setFormPinned(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span>📌 Ghim lên đầu bảng tin (pinned)</span>
                  </label>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung chi tiết *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Nhập nội dung chi tiết thông báo..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* Attachment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tên tệp đính kèm (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={formAttachmentName}
                    onChange={(e) => setFormAttachmentName(e.target.value)}
                    placeholder="VD: Ke_hoach_ngoai_khoa.pdf"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Liên kết tệp / URL tải về
                  </label>
                  <input
                    type="url"
                    value={formAttachmentUrl}
                    onChange={(e) => setFormAttachmentUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  {editingId ? 'Lưu thay đổi' : 'Phát hành thông báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
