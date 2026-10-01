import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  Search,
  Copy,
  CheckCircle2,
  Calendar,
  Layers,
  ClipboardList,
  Briefcase,
  FileCheck,
  Clock,
  BookOpen,
  Paperclip,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { Document, DocumentCategory } from '../../core/types';

export const AppDocuments: React.FC = () => {
  const { classes, activeClassId, classInfo, refreshData } = useApp();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [currentClassFilter, setCurrentClassFilter] = useState<string>(activeClassId || 'class-11a2');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync active class
  useEffect(() => {
    if (activeClassId) {
      setCurrentClassFilter(activeClassId);
    }
  }, [activeClassId]);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        setIsLoading(true);
        // Using provider with class parameter
        const list = await dataProvider.getDocuments(currentClassFilter);
        setDocuments(list);
      } catch (err) {
        console.error('Error fetching documents from provider:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDocs();
  }, [currentClassFilter, refreshData]);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('Đã sao chép liên kết tài liệu vào bộ nhớ tạm!');
  };

  // Filtered list
  const filtered = useMemo(() => {
    return documents.filter((d) => {
      if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = d.title?.toLowerCase().includes(q);
        const matchesDesc = d.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [documents, selectedCategory, searchQuery]);

  const currentClassName =
    classes.find((c) => c.id === currentClassFilter)?.className ||
    classInfo?.className ||
    classInfo?.name ||
    'Lớp 11A2';

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
            Kế hoạch
          </span>
        );
      case 'forms':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
            <FileCheck className="w-3 h-3 text-emerald-600" />
            Biểu mẫu đơn từ
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
            Đề cương ôn tập
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

      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Kho Tài Liệu & Biểu Mẫu - {currentClassName}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem và tải về các văn bản nội quy, kế hoạch tuần, mẫu đơn xin phép và tài liệu học tập
              </p>
            </div>
          </div>
        </div>

        {/* Class Switcher */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 self-start sm:self-auto">
          <Layers className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">Lớp:</span>
          <select
            value={currentClassFilter}
            onChange={(e) => setCurrentClassFilter(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-emerald-700 focus:outline-hidden cursor-pointer"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.className || c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tài liệu, biểu mẫu theo từ khóa..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category Tabs: nội quy, kế hoạch, biểu mẫu... */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
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
            📝 Biểu mẫu đơn từ
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
            📚 Đề cương học tập
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-sm">
            Đang tải kho tài liệu...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 text-sm">
            Không tìm thấy tài liệu nào trong danh mục này.
          </div>
        ) : (
          filtered.map((doc) => {
            const effectiveUrl = doc.url || doc.fileUrl || '#';

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    {getCategoryBadge(doc.category)}
                    {doc.fileSize && (
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        {doc.fileSize}
                      </span>
                    )}
                  </div>

                  <h2 className="font-bold text-sm sm:text-base text-slate-900 mt-2.5 line-clamp-2 leading-snug">
                    {doc.title}
                  </h2>

                  {doc.description && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                </div>

                {/* Footer with Actions: Xem link, Tải về, Sao chép link */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    {doc.createdAt || doc.uploadedAt}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyLink(effectiveUrl)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Sao chép liên kết"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* View Link / Open Link Button */}
                    <a
                      href={effectiveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem link</span>
                    </a>

                    {/* Download Button */}
                    <a
                      href={effectiveUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải về</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
