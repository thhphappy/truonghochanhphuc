import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  ThumbsUp,
  AlertTriangle,
  Sparkles,
  Calendar,
  CheckCircle2,
  ShieldAlert,
  Eye,
  EyeOff,
  Filter,
  Info,
  ChevronRight,
  TrendingUp,
  User,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { Behavior } from '../../core/types';

export const AppBehavior: React.FC = () => {
  const { activeStudent, classInfo, refreshData } = useApp();
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'PRAISE' | 'WARN'>('all');

  // Sensitive privacy toggle
  const [hideSensitive, setHideSensitive] = useState<boolean>(true);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      if (!activeStudent) return;
      setLoading(true);
      try {
        const list = await dataProvider.getBehaviors(activeStudent.id);
        setBehaviors(list);
      } catch (err) {
        console.error('Error loading student behaviors:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeStudent, refreshData]);

  if (!activeStudent) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-600">Vui lòng chọn học sinh để xem sổ nề nếp rèn luyện.</p>
      </div>
    );
  }

  // Time boundaries
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

  // Filtered behaviors
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

      return true;
    });
  }, [behaviors, timeFilter, typeFilter, monStr, sunStr, curMonthStr]);

  // Overall points & stats across all time
  const praiseAll = behaviors.filter((b) => b.type === 'PRAISE' || b.type === 'positive');
  const warnAll = behaviors.filter((b) => b.type === 'WARN' || b.type === 'negative');
  const totalPraisePoints = praiseAll.reduce((sum, b) => sum + (b.points > 0 ? b.points : 0), 0);
  const totalWarnDeductions = warnAll.reduce((sum, b) => sum + (b.points < 0 ? Math.abs(b.points) : 0), 0);
  const currentTotalScore = 100 + totalPraisePoints - totalWarnDeductions;

  // Stats for this week
  const weekBehaviors = behaviors.filter((b) => b.date >= monStr && b.date <= sunStr);
  const weekPraisePoints = weekBehaviors
    .filter((b) => b.type === 'PRAISE' || b.type === 'positive')
    .reduce((sum, b) => sum + (b.points > 0 ? b.points : 0), 0);
  const weekWarnCount = weekBehaviors.filter(
    (b) => b.type === 'WARN' || b.type === 'negative'
  ).length;

  // Stats for this month
  const monthBehaviors = behaviors.filter((b) => b.date.startsWith(curMonthStr));
  const monthPraisePoints = monthBehaviors
    .filter((b) => b.type === 'PRAISE' || b.type === 'positive')
    .reduce((sum, b) => sum + (b.points > 0 ? b.points : 0), 0);
  const monthWarnCount = monthBehaviors.filter(
    (b) => b.type === 'WARN' || b.type === 'negative'
  ).length;

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-extrabold flex items-center justify-center text-xl shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  Sổ Nề Nếp & Khen Thưởng
                </h1>
                <span className="text-xs font-semibold bg-white text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                  {activeStudent.fullName}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Lớp {classInfo?.className || '11A2'} • Niên khóa {classInfo?.schoolYear || '2025 - 2026'} • GVCN: {classInfo?.homeroomTeacher?.name}
              </p>
            </div>
          </div>

          {/* Privacy Toggle: Ẩn thông tin nhạy cảm */}
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setHideSensitive((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              {hideSensitive ? (
                <>
                  <EyeOff className="w-4 h-4 text-amber-600" />
                  <span>Chế độ riêng tư: Đang ẩn thông tin nhạy cảm</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span>Hiển thị tất cả chi tiết</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total rèn luyện points */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Điểm rèn luyện tích lũy
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-emerald-600">
              {currentTotalScore} <span className="text-xs font-normal text-slate-400">điểm</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Xếp loại hiện tại:{' '}
              <strong className="text-emerald-700">
                {currentTotalScore >= 110 ? 'Xuất sắc' : currentTotalScore >= 95 ? 'Tốt' : 'Khá'}
              </strong>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Điểm cơ bản ban đầu: 100 điểm
          </div>
        </div>

        {/* Praise stats */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Việc tốt & Khen thưởng
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-slate-900">
              +{totalPraisePoints} <span className="text-xs font-normal text-slate-400">điểm</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Được khen ngợi <strong>{praiseAll.length}</strong> lần
            </div>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Tuần này: +{weekPraisePoints} đ</span>
            <span>Tháng này: +{monthPraisePoints} đ</span>
          </div>
        </div>

        {/* Warning stats */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lưu ý & Nhắc nhở
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-slate-900">
              {warnAll.length} <span className="text-xs font-normal text-slate-400">lần nhắc</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Trừ điểm rèn luyện:{' '}
              <strong className="text-rose-600">-{totalWarnDeductions} điểm</strong>
            </div>
          </div>
          <div className="text-[11px] text-rose-600 font-semibold pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Tuần này: {weekWarnCount} lần</span>
            <span>Tháng này: {monthWarnCount} lần</span>
          </div>
        </div>
      </div>

      {/* Filter and Timeline List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        {/* Toolbar: Time Filter & Type Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-100">
          {/* Time Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setTimeFilter('week')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs transition-all ${
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
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs transition-all ${
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
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs transition-all ${
                timeFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Toàn bộ lịch sử ({behaviors.length})
            </button>
          </div>

          {/* Type Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Tất cả
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
              Khen (+Điểm)
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
              Nhắc (-Điểm)
            </button>
          </div>
        </div>

        {/* Behavior Timeline */}
        <div className="divide-y divide-slate-100 mt-2">
          {filteredBehaviors.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Award className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Chưa có ghi nhận nề nếp nào trong khoảng thời gian đã chọn.
            </div>
          ) : (
            filteredBehaviors.map((b) => {
              const isPraise = b.type === 'PRAISE' || b.type === 'positive';
              const isSensitiveRecord = Boolean(b.isSensitive);
              const isHidden = isSensitiveRecord && hideSensitive && !revealedIds[b.id];

              return (
                <div
                  key={b.id}
                  className="py-4 px-2 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-slate-50/60 rounded-xl transition-colors"
                >
                  {/* Left: Points & Content */}
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
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                            isPraise
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPraise ? 'Khen thưởng rèn luyện' : 'Lưu ý nhắc nhở nề nếp'}
                        </span>

                        {isSensitiveRecord && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            <span>Thông tin tế nhị</span>
                          </span>
                        )}
                      </div>

                      {/* Content details with sensitive handling */}
                      {isHidden ? (
                        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5 mt-1 max-w-md">
                          <p className="text-xs text-amber-900 italic font-medium">
                            [Nội dung được đánh dấu bảo mật riêng tư - Giáo viên đã liên hệ trao đổi riêng với CMHS]
                          </p>
                          <button
                            type="button"
                            onClick={() => toggleReveal(b.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-900 underline mt-1"
                          >
                            <Eye className="w-3 h-3" />
                            Bấm để mở xem chi tiết ghi chú
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-slate-800 font-medium leading-relaxed mt-0.5">
                            {b.content || b.description || b.title}
                          </p>

                          {isSensitiveRecord && (
                            <button
                              type="button"
                              onClick={() => toggleReveal(b.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 mt-1"
                            >
                              <EyeOff className="w-3 h-3" />
                              Ẩn lại nội dung này
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Date & Recorder */}
                  <div className="text-right text-xs text-slate-400 shrink-0 self-end sm:self-start">
                    <div className="font-semibold text-slate-700 flex items-center sm:justify-end gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{b.date}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Ghi nhận bởi: {b.recordedBy || 'GVCN'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
