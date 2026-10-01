import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  X,
  HeartHandshake,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { dataProvider } from '../../core/provider';
import { Parent, Student, ClassInfo } from '../../core/types';
import { useApp } from '../../core/AppContext';

export const AdminParents: React.FC = () => {
  const navigate = useNavigate();
  const { refreshData, refreshKey, activeClassId } = useApp();

  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedRelationshipFilter, setSelectedRelationshipFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [parentToDelete, setParentToDelete] = useState<Parent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields: {id, fullName, phone, email, relationship, studentId}
  const [formFullName, setFormFullName] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formRelationship, setFormRelationship] = useState<'Bố' | 'Mẹ' | 'Người giám hộ'>('Bố');
  const [formStudentId, setFormStudentId] = useState<string>('');
  const [formOccupation, setFormOccupation] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch data using dataProvider only
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [loadedParents, loadedStudents, loadedClasses] = await Promise.all([
          dataProvider.getParents(),
          dataProvider.getStudents(),
          dataProvider.getClasses(),
        ]);
        if (isMounted) {
          setParents(loadedParents);
          setStudents(loadedStudents);
          setClasses(loadedClasses);
        }
      } catch (err) {
        console.error('Error loading parents data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper map: studentId -> Student & Class
  const studentMap = useMemo(() => {
    const map = new Map<string, { student: Student; className: string }>();
    students.forEach((st) => {
      const cls = classes.find((c) => c.id === st.classId);
      map.set(st.id, {
        student: st,
        className: cls ? cls.className || cls.name || cls.id : 'Chưa xếp lớp',
      });
    });
    return map;
  }, [students, classes]);

  // Filtered Parents
  const filteredParents = useMemo(() => {
    return parents.filter((p) => {
      // 1. Text Search: Full Name, Phone, Email, Student Name
      const targetStudentId = p.studentId || (p.studentIds && p.studentIds[0]);
      const studentInfo = targetStudentId ? studentMap.get(targetStudentId) : null;
      const studentName = studentInfo?.student.fullName || '';

      const nameMatch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const phoneMatch = p.phone.includes(searchTerm);
      const emailMatch = (p.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const studentMatch = studentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || phoneMatch || emailMatch || studentMatch;

      // 2. Class Filter
      let matchesClass = true;
      if (selectedClassFilter !== 'all') {
        if (!studentInfo) {
          matchesClass = false;
        } else {
          matchesClass = studentInfo.student.classId === selectedClassFilter;
        }
      }

      // 3. Relationship Filter
      let matchesRel = true;
      if (selectedRelationshipFilter !== 'all') {
        matchesRel = p.relationship === selectedRelationshipFilter;
      }

      return matchesSearch && matchesClass && matchesRel;
    });
  }, [parents, searchTerm, selectedClassFilter, selectedRelationshipFilter, studentMap]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingParent(null);
    setFormFullName('');
    setFormPhone('');
    setFormEmail('');
    setFormRelationship('Bố');
    setFormOccupation('');
    // Default to first student if available
    setFormStudentId(students.length > 0 ? students[0].id : '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (p: Parent) => {
    setEditingParent(p);
    setFormFullName(p.fullName);
    setFormPhone(p.phone);
    setFormEmail(p.email || '');
    setFormRelationship(p.relationship);
    setFormOccupation(p.occupation || '');
    setFormStudentId(p.studentId || (p.studentIds && p.studentIds[0]) || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submit Form (Add or Update) via dataProvider
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim()) {
      setFormError('Vui lòng nhập họ và tên phụ huynh');
      return;
    }
    if (!formPhone.trim()) {
      setFormError('Vui lòng nhập số điện thoại');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const parentPayload = {
        fullName: formFullName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim() || undefined,
        relationship: formRelationship,
        studentId: formStudentId || undefined,
        studentIds: formStudentId ? [formStudentId] : [],
        occupation: formOccupation.trim() || undefined,
      };

      if (editingParent) {
        // Update via provider
        await dataProvider.update<Parent>('parents', editingParent.id, parentPayload);
        showToast(`Đã cập nhật phụ huynh ${formFullName} thành công!`);
      } else {
        // Add via provider
        await dataProvider.add<Parent>('parents', parentPayload as any);
        showToast(`Đã thêm phụ huynh ${formFullName} vào danh sách!`);
      }

      setIsModalOpen(false);
      refreshData();
    } catch (err: any) {
      console.error('Error saving parent:', err);
      setFormError(err?.message || 'Có lỗi xảy ra khi lưu phụ huynh. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete via dataProvider
  const handleConfirmDelete = async () => {
    if (!parentToDelete) return;
    try {
      setIsSubmitting(true);
      await dataProvider.remove('parents', parentToDelete.id);
      showToast(`Đã xóa phụ huynh ${parentToDelete.fullName}`);
      setIsDeleteModalOpen(false);
      setParentToDelete(null);
      refreshData();
    } catch (err) {
      console.error('Error deleting parent:', err);
      showToast('Không thể xóa phụ huynh. Vui lòng thử lại sau.');
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
              <UserCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Quản lý Phụ huynh (Parents)</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Danh sách phụ huynh, thông tin liên lạc, mối quan hệ và học sinh phụ thuộc theo từng lớp qua DataProvider.
          </p>
        </div>

        <button
          id="btn-add-parent"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm phụ huynh mới</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng số phụ huynh</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{parents.length}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Học sinh đã gắn kết</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {students.filter((s) => s.parentId).length} / {students.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kênh liên lạc trực tuyến</p>
            <p className="text-xl font-bold text-slate-800 mt-1">SMS / Sổ liên lạc</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-parents-input"
            type="text"
            placeholder="Tìm theo họ tên, SĐT, con em..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Lọc theo lớp:</span>
            <select
              id="filter-parents-class"
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="all">Tất cả các lớp</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className || cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Relationship Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Quan hệ:</span>
            <select
              id="filter-parents-relationship"
              value={selectedRelationshipFilter}
              onChange={(e) => setSelectedRelationshipFilter(e.target.value)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="Bố">Bố</option>
              <option value="Mẹ">Mẹ</option>
              <option value="Người giám hộ">Người giám hộ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parents Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Mã PH</th>
                <th className="py-3 px-4">Họ và tên Phụ huynh</th>
                <th className="py-3 px-4">Quan hệ</th>
                <th className="py-3 px-4">Số điện thoại</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Học sinh liên kết</th>
                <th className="py-3 px-4">Nghề nghiệp</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Đang tải dữ liệu phụ huynh...
                  </td>
                </tr>
              ) : filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Không tìm thấy phụ huynh nào</p>
                    <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc thêm phụ huynh mới</p>
                  </td>
                </tr>
              ) : (
                filteredParents.map((parent) => {
                  const targetStudentId = parent.studentId || (parent.studentIds && parent.studentIds[0]);
                  const studentInfo = targetStudentId ? studentMap.get(targetStudentId) : null;

                  return (
                    <tr key={parent.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-700 font-medium">
                        <span className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{parent.id}</span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {parent.fullName}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            parent.relationship === 'Bố'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : parent.relationship === 'Mẹ'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {parent.relationship}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <a
                          href={`tel:${parent.phone}`}
                          className="inline-flex items-center gap-1.5 text-slate-800 hover:text-indigo-600 font-medium"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{parent.phone}</span>
                        </a>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {parent.email ? (
                          <a
                            href={`mailto:${parent.email}`}
                            className="inline-flex items-center gap-1 hover:text-indigo-600"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{parent.email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Chưa có</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {studentInfo ? (
                          <div>
                            <div className="font-medium text-slate-900 flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{studentInfo.student.fullName}</span>
                            </div>
                            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              {studentInfo.className}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa liên kết</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {parent.occupation || 'Chưa cập nhật'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate('/admin/messages')}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Nhắn tin với phụ huynh"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-edit-parent-${parent.id}`}
                            onClick={() => handleOpenEditModal(parent)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-parent-${parent.id}`}
                            onClick={() => {
                              setParentToDelete(parent);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa phụ huynh"
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

      {/* FORM MODAL: Create / Edit Parent */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">
                  {editingParent ? 'Chỉnh sửa Phụ huynh' : 'Thêm Phụ huynh mới'}
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

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên Phụ huynh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn Hùng"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Relationship & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mối quan hệ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRelationship}
                    onChange={(e) => setFormRelationship(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Bố">Bố</option>
                    <option value="Mẹ">Mẹ</option>
                    <option value="Người giám hộ">Người giám hộ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ Email
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="phuhuynh@gmail.com"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Linked Student (studentId) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Học sinh liên kết (Con em)
                </label>
                <select
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Chưa liên kết học sinh --</option>
                  {students.map((st) => {
                    const cls = classes.find((c) => c.id === st.classId);
                    const classLabel = cls ? cls.className || cls.name : 'Lớp chưa xếp';
                    return (
                      <option key={st.id} value={st.id}>
                        {st.fullName} ({classLabel})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nghề nghiệp / Đơn vị công tác
                </label>
                <input
                  type="text"
                  value={formOccupation}
                  onChange={(e) => setFormOccupation(e.target.value)}
                  placeholder="VD: Kỹ sư xây dựng, Bác sĩ..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  {isSubmitting ? 'Đang lưu...' : editingParent ? 'Lưu thay đổi' : 'Thêm phụ huynh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isDeleteModalOpen && parentToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa phụ huynh</h3>
              <p className="text-sm text-slate-500 mt-1">
                Bạn có chắc chắn muốn xóa thông tin phụ huynh{' '}
                <strong className="text-slate-800">{parentToDelete.fullName}</strong> (SĐT: {parentToDelete.phone})?
                Hành động sẽ được ghi nhận qua DataProvider.
              </p>
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
