import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Calendar,
  UserCheck,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Phone,
  Mail,
  BookOpen,
} from 'lucide-react';
import { dataProvider } from '../../core/provider';
import { ClassInfo, Student } from '../../core/types';
import { useApp } from '../../core/AppContext';

export const AdminClasses: React.FC = () => {
  const navigate = useNavigate();
  const { refreshData, refreshKey, setActiveClassId } = useApp();

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [classToDelete, setClassToDelete] = useState<ClassInfo | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields: {id, className, schoolYear, homeroomTeacher, note}
  const [formId, setFormId] = useState<string>('');
  const [formClassName, setFormClassName] = useState<string>('');
  const [formSchoolYear, setFormSchoolYear] = useState<string>('2025 - 2026');
  const [formTeacherName, setFormTeacherName] = useState<string>('');
  const [formTeacherPhone, setFormTeacherPhone] = useState<string>('');
  const [formTeacherEmail, setFormTeacherEmail] = useState<string>('');
  const [formTeacherSubject, setFormTeacherSubject] = useState<string>('Toán học');
  const [formRoom, setFormRoom] = useState<string>('');
  const [formNote, setFormNote] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch classes and students using dataProvider
  useEffect(() => {
    let isMounted = true;
    const loadClasses = async () => {
      try {
        setIsLoading(true);
        const [loadedClasses, loadedStudents] = await Promise.all([
          dataProvider.getClasses(),
          dataProvider.getStudents(),
        ]);
        if (isMounted) {
          setClasses(loadedClasses);
          setStudents(loadedStudents);
        }
      } catch (err) {
        console.error('Error loading classes:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadClasses();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to extract teacher name
  const getTeacherDisplay = (teacher: ClassInfo['homeroomTeacher']) => {
    if (!teacher) return { name: 'Chưa phân công', phone: '', email: '', subject: '' };
    if (typeof teacher === 'string') {
      return { name: teacher, phone: '', email: '', subject: '' };
    }
    return {
      name: teacher.name || 'Chưa phân công',
      phone: teacher.phone || '',
      email: teacher.email || '',
      subject: teacher.subject || '',
    };
  };

  // Unique school years for filtering
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => {
      const yr = c.schoolYear || c.academicYear;
      if (yr) set.add(yr);
    });
    return Array.from(set);
  }, [classes]);

  // Filtered classes list
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const nameMatch = (cls.className || cls.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const teacherInfo = getTeacherDisplay(cls.homeroomTeacher);
      const teacherMatch = teacherInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
      const noteMatch = (cls.note || '').toLowerCase().includes(searchTerm.toLowerCase());
      const idMatch = cls.id.toLowerCase().includes(searchTerm.toLowerCase());

      const year = cls.schoolYear || cls.academicYear;
      const yearMatch = filterYear === 'all' || year === filterYear;

      return (nameMatch || teacherMatch || noteMatch || idMatch) && yearMatch;
    });
  }, [classes, searchTerm, filterYear]);

  // Handle open modal for creating
  const handleOpenCreateModal = () => {
    setEditingClass(null);
    setFormId(`class-${Date.now().toString().slice(-4)}`);
    setFormClassName('');
    setFormSchoolYear('2025 - 2026');
    setFormTeacherName('');
    setFormTeacherPhone('');
    setFormTeacherEmail('');
    setFormTeacherSubject('Toán học');
    setFormRoom('Phòng 301 - Nhà A');
    setFormNote('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle open modal for editing
  const handleOpenEditModal = (cls: ClassInfo) => {
    setEditingClass(cls);
    const teacher = getTeacherDisplay(cls.homeroomTeacher);
    setFormId(cls.id);
    setFormClassName(cls.className || cls.name || '');
    setFormSchoolYear(cls.schoolYear || cls.academicYear || '2025 - 2026');
    setFormTeacherName(teacher.name);
    setFormTeacherPhone(teacher.phone);
    setFormTeacherEmail(teacher.email);
    setFormTeacherSubject(teacher.subject || 'Chủ nhiệm');
    setFormRoom(cls.room || '');
    setFormNote(cls.note || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle submit form (Add or Update) via dataProvider
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClassName.trim()) {
      setFormError('Vui lòng nhập tên lớp học');
      return;
    }
    if (!formTeacherName.trim()) {
      setFormError('Vui lòng nhập họ và tên Giáo viên chủ nhiệm');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const teacherData = {
        name: formTeacherName.trim(),
        phone: formTeacherPhone.trim(),
        email: formTeacherEmail.trim(),
        subject: formTeacherSubject.trim(),
      };

      if (editingClass) {
        // Update existing class via provider
        await dataProvider.update<ClassInfo>('classes', editingClass.id, {
          className: formClassName.trim(),
          name: formClassName.trim(),
          schoolYear: formSchoolYear.trim(),
          academicYear: formSchoolYear.trim(),
          homeroomTeacher: teacherData,
          room: formRoom.trim(),
          note: formNote.trim(),
        });
        showToast(`Đã cập nhật thông tin ${formClassName} thành công!`);
      } else {
        // Add new class via provider
        await dataProvider.add<ClassInfo>('classes', {
          id: formId.trim() || `class-${Date.now().toString().slice(-4)}`,
          className: formClassName.trim(),
          name: formClassName.trim(),
          schoolYear: formSchoolYear.trim(),
          academicYear: formSchoolYear.trim(),
          homeroomTeacher: teacherData,
          room: formRoom.trim(),
          note: formNote.trim(),
          grade: formClassName.includes('10') ? 'Khối 10' : formClassName.includes('11') ? 'Khối 11' : 'Khối 12',
        } as any);
        showToast(`Đã thêm lớp học ${formClassName} vào hệ thống!`);
      }

      setIsModalOpen(false);
      refreshData();
    } catch (err: any) {
      console.error('Error saving class:', err);
      setFormError(err?.message || 'Có lỗi xảy ra khi lưu lớp học. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    try {
      setIsSubmitting(true);
      await dataProvider.remove('classes', classToDelete.id);
      showToast(`Đã xóa lớp học ${classToDelete.className || classToDelete.name}`);
      setIsDeleteModalOpen(false);
      setClassToDelete(null);
      refreshData();
    } catch (err) {
      console.error('Error deleting class:', err);
      showToast('Không thể xóa lớp học. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Quản lý Lớp học (ClassInfo)</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý danh sách lớp học, niên khóa, giáo viên chủ nhiệm và phòng học qua dữ liệu DataProvider chuẩn.
          </p>
        </div>

        <button
          id="btn-add-class"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm lớp học mới</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng số lớp học</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{classes.length}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng học sinh các lớp</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{students.length}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Niên khóa hoạt động</p>
            <p className="text-xl font-bold text-slate-800 mt-1">2025 - 2026</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-class-input"
            type="text"
            placeholder="Tìm theo tên lớp, GVCN, ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Lọc niên khóa:</span>
          <select
            id="filter-school-year"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          >
            <option value="all">Tất cả niên khóa</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Mã lớp (ID)</th>
                <th className="py-3 px-4">Tên lớp học</th>
                <th className="py-3 px-4">Niên khóa</th>
                <th className="py-3 px-4">Giáo viên chủ nhiệm</th>
                <th className="py-3 px-4 text-center">Sĩ số</th>
                <th className="py-3 px-4">Phòng học & Ghi chú</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Đang tải danh sách lớp học từ hệ thống...
                  </td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Không tìm thấy lớp học nào</p>
                    <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Thêm lớp học mới"</p>
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => {
                  const teacher = getTeacherDisplay(cls.homeroomTeacher);
                  const classStudentCount = students.filter((s) => s.classId === cls.id).length;

                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-700 font-medium">
                        <span className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{cls.id}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-base">{cls.className || cls.name}</div>
                        {cls.grade && <span className="text-xs text-slate-500">{cls.grade}</span>}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{cls.schoolYear || cls.academicYear || '2025 - 2026'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{teacher.name}</div>
                        <div className="text-xs text-slate-500 flex flex-wrap gap-2 mt-0.5">
                          {teacher.subject && <span>Môn: {teacher.subject}</span>}
                          {teacher.phone && (
                            <span className="flex items-center gap-1 text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400" /> {teacher.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setActiveClassId(cls.id);
                            navigate(`/admin/students?classId=${cls.id}`);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors"
                          title="Bấm để xem danh sách học sinh lớp này"
                        >
                          <Users className="w-3 h-3" />
                          <span>{classStudentCount} HS</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {cls.room && (
                          <div className="text-xs font-medium text-slate-800 flex items-center gap-1">
                            <span className="text-slate-400">Phòng:</span> {cls.room}
                          </div>
                        )}
                        <p className="text-xs text-slate-500 truncate" title={cls.note}>
                          {cls.note || 'Chưa có ghi chú'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-view-students-${cls.id}`}
                            onClick={() => {
                              setActiveClassId(cls.id);
                              navigate(`/admin/students?classId=${cls.id}`);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Xem học sinh lớp này"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-edit-class-${cls.id}`}
                            onClick={() => handleOpenEditModal(cls)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Sửa thông tin lớp"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-class-${cls.id}`}
                            onClick={() => {
                              setClassToDelete(cls);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa lớp học"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL: Create / Edit Class */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">
                  {editingClass ? 'Chỉnh sửa thông tin Lớp học' : 'Thêm Lớp học mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã lớp (ID)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingClass}
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="VD: class-11a3"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono disabled:opacity-60"
                  />
                </div>

                {/* Class Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên lớp học <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formClassName}
                    onChange={(e) => setFormClassName(e.target.value)}
                    placeholder="VD: Lớp 11A3"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* School Year & Room */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Niên khóa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formSchoolYear}
                    onChange={(e) => setFormSchoolYear(e.target.value)}
                    placeholder="2025 - 2026"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phòng học
                  </label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="VD: Phòng 303 - Nhà B"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Homeroom Teacher Details */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Giáo viên chủ nhiệm (homeroomTeacher)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Họ và tên GVCN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formTeacherName}
                      onChange={(e) => setFormTeacherName(e.target.value)}
                      placeholder="VD: Thầy Vũ Tuấn Anh"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Môn giảng dạy
                    </label>
                    <input
                      type="text"
                      value={formTeacherSubject}
                      onChange={(e) => setFormTeacherSubject(e.target.value)}
                      placeholder="VD: Hóa học"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Số điện thoại GVCN
                    </label>
                    <input
                      type="text"
                      value={formTeacherPhone}
                      onChange={(e) => setFormTeacherPhone(e.target.value)}
                      placeholder="09xx xxx xxx"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Email liên lạc
                    </label>
                    <input
                      type="email"
                      value={formTeacherEmail}
                      onChange={(e) => setFormTeacherEmail(e.target.value)}
                      placeholder="gvcn@chuvanan.edu.vn"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú lớp học
                </label>
                <textarea
                  rows={2}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Ghi chú đặc điểm của lớp, chi đoàn, ban đại diện..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : editingClass ? 'Lưu thay đổi' : 'Thêm lớp học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isDeleteModalOpen && classToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa lớp học</h3>
              <p className="text-sm text-slate-500 mt-1">
                Bạn có chắc chắn muốn xóa{' '}
                <strong className="text-slate-800">{classToDelete.className || classToDelete.name}</strong>{' '}
                (ID: {classToDelete.id})? Hành động này sẽ được thực hiện qua DataProvider.
              </p>
              {students.filter((s) => s.classId === classToDelete.id).length > 0 && (
                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg text-left">
                  ⚠️ Lưu ý: Lớp học này hiện có{' '}
                  <strong>{students.filter((s) => s.classId === classToDelete.id).length} học sinh</strong>.
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Đang xóa...' : 'Đồng ý xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
