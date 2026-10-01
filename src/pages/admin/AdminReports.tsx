import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Sparkles,
  Printer,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  Award,
  Users,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { Report } from '../../core/types';

export const AdminReports: React.FC = () => {
  const { classInfo, refreshData } = useApp();
  const [reports, setReports] = useState<Report[]>([]);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [weekInput, setWeekInput] = useState<number>(26);
  const [monthInput, setMonthInput] = useState<number>(2);
  const [yearInput, setYearInput] = useState<number>(2026);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadReports = async () => {
    const list = await dataProvider.getReports();
    setReports(list);
    if (list.length > 0 && !activeReport) {
      setActiveReport(list[0]);
    }
  };

  useEffect(() => {
    loadReports();
  }, [refreshData]);

  const handleGenerateWeekly = async () => {
    try {
      setIsGenerating(true);
      const rep = await dataProvider.reportsWeekly(weekInput, yearInput);
      await loadReports();
      setActiveReport(rep);
      setIsGenerating(false);
      alert(`Đã tạo báo cáo tổng kết Tuần ${weekInput}/${yearInput}!`);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };

  const handleGenerateMonthly = async () => {
    try {
      setIsGenerating(true);
      const rep = await dataProvider.reportsMonthly(monthInput, yearInput);
      await loadReports();
      setActiveReport(rep);
      setIsGenerating(false);
      alert(`Đã tạo báo cáo đánh giá Tháng ${monthInput}/${yearInput}!`);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Báo cáo Tổng hợp Tuần & Tháng</h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Tự động tổng hợp dữ liệu chuyên cần, nề nếp và tiến độ nhiệm vụ phục vụ công tác chủ nhiệm.
          </p>
        </div>

        {activeReport && (
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>In / Xuất văn bản</span>
          </button>
        )}
      </div>

      {/* Report Generator Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Generator */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <Calendar className="w-4 h-4" />
              <span>Tạo Báo cáo Tuần (Weekly Report)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tính toán tỉ lệ chuyên cần, thống kê việc tốt/vi phạm và tổng hợp hoạt động trong tuần học.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Số tuần</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={weekInput}
                  onChange={(e) => setWeekInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl mt-1 font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Năm học</label>
                <input
                  type="number"
                  value={yearInput}
                  onChange={(e) => setYearInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl mt-1 font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateWeekly}
            className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tạo báo cáo Tuần {weekInput}</span>
          </button>
        </div>

        {/* Monthly Generator */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>Tạo Báo cáo Tháng (Monthly Report)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Đánh giá toàn diện nếp sống, xếp loại thi đua tháng và chuẩn bị hồ sơ họp sơ kết định kỳ.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Tháng</label>
                <select
                  value={monthInput}
                  onChange={(e) => setMonthInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl mt-1 font-medium"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Năm</label>
                <input
                  type="number"
                  value={yearInput}
                  onChange={(e) => setYearInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl mt-1 font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateMonthly}
            className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tạo báo cáo Tháng {monthInput}/{yearInput}</span>
          </button>
        </div>
      </div>

      {/* Reports List & Active Report Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved reports sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col h-[520px]">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
            Lịch sử Báo cáo đã lập ({reports.length})
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {reports.map((r) => {
              const isSelected = activeReport?.id === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveReport(r)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-200 text-blue-900 shadow-xs'
                      : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        r.type === 'weekly'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {r.type === 'weekly' ? 'Báo cáo tuần' : 'Báo cáo tháng'}
                    </span>
                    <span className="text-[10px] text-slate-400">{r.period}</span>
                  </div>
                  <h2 className="font-bold text-xs mt-1.5 line-clamp-1">{r.title}</h2>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                    <span>Chuyên cần: {r.summary.attendanceRate}%</span>
                    <span>•</span>
                    <span>+{r.summary.totalBehaviorsPositive} việc tốt</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Report Document Sheet */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col">
          {activeReport ? (
            <div className="space-y-5">
              {/* Report Header */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{classInfo?.schoolName}</span>
                  <span>Thời gian lập: {activeReport.generatedAt}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  {activeReport.title}
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Tập thể: <strong className="text-slate-800">{classInfo?.name}</strong> • GVCN: {classInfo?.homeroomTeacher.name}
                </div>
              </div>

              {/* Key Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <div className="text-xs text-slate-500">Tỉ lệ chuyên cần</div>
                  <div className="text-xl font-bold text-blue-600 mt-0.5">
                    {activeReport.summary.attendanceRate}%
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <div className="text-xs text-slate-500">Việc tốt / Khen</div>
                  <div className="text-xl font-bold text-emerald-600 mt-0.5">
                    +{activeReport.summary.totalBehaviorsPositive}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <div className="text-xs text-slate-500">Nhắc nhở nề nếp</div>
                  <div className="text-xl font-bold text-rose-600 mt-0.5">
                    {activeReport.summary.totalBehaviorsNegative}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <div className="text-xs text-slate-500">Hoàn thành nhiệm vụ</div>
                  <div className="text-xl font-bold text-purple-600 mt-0.5">
                    {activeReport.summary.completedTasksRate}%
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Các điểm sáng & Thành tích nổi bật
                </h3>
                <ul className="space-y-1.5">
                  {activeReport.highlights.map((hl, idx) => (
                    <li
                      key={idx}
                      className="text-xs sm:text-sm text-slate-700 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              {activeReport.recommendations && activeReport.recommendations.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    Định hướng & Kế hoạch tuần kế tiếp
                  </h3>
                  <ul className="space-y-1.5">
                    {activeReport.recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="text-xs sm:text-sm text-slate-700 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Signature block */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
                <div>
                  <div className="font-semibold text-slate-700">BAN CÁN SỰ LỚP</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Lớp trưởng xác nhận</div>
                  <div className="mt-8 font-medium text-slate-800">Nguyễn Văn An</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-700">GIÁO VIÊN CHỦ NHIỆM</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Ký và ghi rõ họ tên</div>
                  <div className="mt-8 font-medium text-slate-800">
                    {classInfo?.homeroomTeacher.name}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Chọn một báo cáo ở danh sách bên trái để xem nội dung.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
