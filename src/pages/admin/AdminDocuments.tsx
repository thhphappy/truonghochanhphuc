import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  ExternalLink,
  Trash2,
  Edit3,
  X,
  Search,
  Layers,
  Copy,
  CheckCircle2,
  Calendar,
  BookOpen,
  ClipboardList,
  FileCheck,
  Clock,
  Briefcase,
  Paperclip,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { Document, DocumentCategory } from '../../core/types';

export const AdminDocuments: React.FC = () => {
  const { classes, activeClassId, refreshData } = useApp();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal states for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formClassId, setFormClassId] = useState<string>('class-11a2');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formUrl, setFormUrl] = useState<string>('');
  const [formCategory, setFormCategory] = useState<DocumentCategory>('rules');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formFileSize, setFormFileSize] = useState<string>('1.2 MB');
  const [formCreatedAt, setFormCreatedAt] = useState<string>('');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const list = await dataProvider.getDocuments();
      setDocuments(list);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [refreshData]);

  // Sync default form class
  useEffect(() => {
    if (activeClassId && activeClassId !== 'all') {
      setFormClassId(activeClassId);
    }
  }, [activeClassId]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormClassId(activeClassId !== 'all' ? activeClassId : 'class-11a2');
    setFormTitle('');
    setFormUrl('https://example.com/docs/tailieu.pdf');
    setFormCategory('rules');
    setFormDescription('');
    setFormFileSize('1.2 MB');
    setFormCreatedAt(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (doc: Document) => {
    setEditingId(doc.id);
    setFormClassId(doc.classId || 'class-11a2');
    setFormTitle(doc.title);
    setFormUrl(doc.url || doc.fileUrl || '');
    setFormCategory(doc.category || 'other');
    setFormDescription(doc.description || '');
    setFormFileSize(doc.fileSize || '1.0 MB');
    setFormCreatedAt(doc.createdAt || doc.uploadedAt || new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  // Save Document (Create or Update)
  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Vui lòng nhập tiêu đề tài liệu!');
      return;
    }
    if (!formUrl.trim()) {
      alert('Vui lòng nhập đường dẫn liên kết (URL) của tài liệu!');
      return;
    }

    try {
      const createdAt = formCreatedAt.trim() || new Date().toISOString().split('T')[0];

      if (editingId) {
        await dataProvider.update<Document>('documents', editingId, {
          classId: formClassId,
          title: formTitle.trim(),
          url: formUrl.trim(),
          category: formCategory,
          createdAt,
          description: formDescription.trim(),
          fileSize: formFileSize.trim(),
          fileUrl: formUrl.trim(),
        });
        showToast('Cập nhật thông tin tài liệu thành công!');
      } else {
        await dataProvider.add<Document>('documents', {
          classId: formClassId,
          title: formTitle.trim(),
          url: formUrl.trim(),
          category: formCategory,
          createdAt,
          description: formDescription.trim(),
          fileSize: formFileSize.trim(),
          fileUrl: formUrl.trim(),
        });
        showToast('Thêm tài liệu mới thành công!');
      }

      setIsModalOpen(false);
      refreshData();
      await loadDocuments();
    } catch (err) {
      console.error('Error saving document:', err);
      alert('Có lỗi xảy ra khi lưu tài liệu.');
    }
  };

  // Delete Document
  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này khỏi kho dữ liệu?')) {
      try {
        await dataProvider.remove('documents', id);
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        showToast('Đã xóa tài liệu thành công.');
        refreshData();
      } catch (err) {
        console.error('Failed to delete document:', err);
        alert('Không thể xóa tài liệu.');
      }
    }
  };

  // Copy Link
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('Đã sao chép liên kết tài liệu vào bộ nhớ tạm!');
  };

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        // Class filter
        if (selectedClassFilter !== 'all') {
          if (doc.classId !== selectedClassFilter && doc.classId !== 'all') return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (doc.category !== selectedCategory) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = doc.title?.toLowerCase().includes(q);
          const matchesDesc = doc.description?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc) return false;
        }

        return true;
      })
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [documents, selectedClassFilter, selectedCategory, searchQuery]);

  const getCategoryBadge = (cat: DocumentCategory) => {
    switch (cat) {
      case 'rules':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
            <ClipboardList className="w-3 h-3 text-amber-600" />
            Nội quy & Quy chế
          </span>
        );
      case 'plan':
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
            <Briefcase className="w-3 h-3 text-indigo-600" />
            Kế hoạch & Chương trình
          </span>
        );
      case 'forms':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
            <FileCheck className="w-3 h-3 text-emerald-600" />
            Biểu mẫu & Đơn từ
          </span>
        );
      case 'schedule':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
            <Clock className="w-3 h-3 text-blue-600" />
            Thời khóa biểu
          </span>
        );
      case 'syllabus':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
            <BookOpen className="w-3 h-3 text-purple-600" />
            Đề cương & Tài liệu học
          </span>
        );
      case 'other':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
            <Paperclip className="w-3 h-3 text-slate-500" />
            Tài liệu khác
          </span>
        );
    }
  };

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
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản Lý Tài Liệu & Biểu Mẫu</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Kho lưu trữ nội quy, kế hoạch, biểu mẫu đơn từ và tài liệu học tập của lớp.
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
          <span>Thêm tài liệu mới</span>
        </button>
      </div>

      {/* Control Bar: Class, Search, Category Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tài liệu theo tên, mô tả..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-blue-500 transition-colors"
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

        {/* Category Tabs: nội quy, kế hoạch, biểu mẫu... */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất cả ({documents.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('rules')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'rules'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            📋 Nội quy & Quy chế
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('plan')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'plan'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            📅 Kế hoạch
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('forms')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'forms'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            📝 Biểu mẫu
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('schedule')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'schedule'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ⏰ Thời khóa biểu
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('syllabus')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'syllabus'
                ? 'bg-purple-600 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            📚 Đề cương ôn tập
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Tìm thấy <strong>{filteredDocuments.length}</strong> tài liệu
          </span>
          <span className="text-[11px] text-slate-400">
            Dữ liệu được lưu trữ an toàn trên hệ thống provider
          </span>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-sm">
            Đang tải danh sách tài liệu...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 text-sm">
            Không có tài liệu nào phù hợp với danh mục đang chọn.
          </div>
        ) : (
          filteredDocuments.map((doc) => {
            const classObj = classes.find((c) => c.id === doc.classId);
            const classNameDisplay =
              doc.classId === 'all'
                ? 'Toàn trường'
                : classObj?.className || classObj?.name || doc.classId || 'Lớp 11A2';

            const effectiveUrl = doc.url || doc.fileUrl || '#';

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Category, Class & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {getCategoryBadge(doc.category)}
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {classNameDisplay}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(doc)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Chỉnh sửa tài liệu"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa tài liệu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-3 leading-snug">
                    {doc.title}
                  </h2>

                  {/* Description */}
                  {doc.description && (
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                      {doc.description}
                    </p>
                  )}
                </div>

                {/* Metadata & Action Links */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {doc.createdAt || doc.uploadedAt}
                    </span>
                    {doc.fileSize && <span>• {doc.fileSize}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(effectiveUrl)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium text-xs px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Sao chép link tài liệu"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </button>

                    <a
                      href={effectiveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs px-3 py-1 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem link</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create & Edit Document */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingId ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}
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

            <form onSubmit={handleSaveDocument} className="space-y-4 mt-4">
              {/* Class & Category */}
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
                    Phân loại danh mục (category) *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="rules">📋 Nội quy & Quy chế</option>
                    <option value="plan">📅 Kế hoạch hoạt động</option>
                    <option value="forms">📝 Biểu mẫu & Đơn từ</option>
                    <option value="schedule">⏰ Thời khóa biểu</option>
                    <option value="syllabus">📚 Đề cương ôn tập</option>
                    <option value="other">📎 Tài liệu khác</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề tài liệu *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="VD: Nội quy lớp học 2025-2026, Kế hoạch tuần 26..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đường dẫn liên kết / Link tải (url) *
                </label>
                <input
                  type="url"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://drive.google.com/... hoặc https://example.com/file.pdf"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả / Hướng dẫn sử dụng tài liệu
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ghi chú thêm về nội dung tài liệu, cách nộp biểu mẫu..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* File size & Created At */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Kích thước tệp (ước lượng)
                  </label>
                  <input
                    type="text"
                    value={formFileSize}
                    onChange={(e) => setFormFileSize(e.target.value)}
                    placeholder="VD: 1.2 MB, 850 KB"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ngày ban hành / Ngày tải lên (createdAt)
                  </label>
                  <input
                    type="date"
                    value={formCreatedAt}
                    onChange={(e) => setFormCreatedAt(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Buttons */}
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
                  {editingId ? 'Lưu thay đổi' : 'Lưu tài liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
