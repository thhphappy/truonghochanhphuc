import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Phone,
  Edit2,
  Eye,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Building2,
  Calendar,
  MapPin,
  UserCheck,
  GraduationCap,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../../core/AppContext';
import { dataProvider } from '../../core/provider';
import { Student, Parent, ClassInfo } from '../../core/types';

export const AdminStudents: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshData, refreshKey } = useApp();

  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search: {id, classId, fullName, dob, gender, address, parentId, status}
  const [searchTerm, setSearchTerm] = useState<string>('');
  const classParam = searchParams.get('classId');
  const [selectedClassId, setSelectedClassId] = useState<string>(classParam || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');

  // Modals
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states matching {id, classId, fullName, dob, gender, address, parentId, status}
  const [formFullName, setFormFullName] = useState<string>('');
  const [formClassId, setFormClassId] = useState<string>('class-11a2');
  const [formDob, setFormDob] = useState<string>('2009-01-15');
  const [formGender, setFormGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'active' | 'transferred' | 'leave'>('active');

  // Parent selection / creation in modal
  const [parentMode, setParentMode] = useState<'existing' | 'new'>('existing');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formNewParentName, setFormNewParentName] = useState<string>('');
  const [formNewParentPhone, setFormNewParentPhone] = useState<string>('');
  const [formNewParentRel, setFormNewParentRel] = useState<'Bố' | 'Mẹ' | 'Người giám hộ'>('Bố');

  // Additional optional fields
  const [formGroup, setFormGroup] = useState<string>('Tổ 1');
  const [formPosition, setFormPosition] = useState<string>('Học sinh');
  const [formNotes, setFormNotes] = useState<string>('');

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync state if URL search params change
  useEffect(() => {
    if (classParam) {
      setSelectedClassId(classParam);
    }
  }, [classParam]);

  // Load data strictly from dataProvider
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [loadedStudents, loadedParents, loadedClasses] = await Promise.all([
          dataProvider.getStudents(),
          dataProvider.getParents(),
          dataProvider.getClasses(),
        ]);
        if (isMounted) {
          setStudents(loadedStudents);
          setParents(loadedParents);
          setClasses(loadedClasses);
        }
      } catch (err) {
        console.error('Error loading students data:', err);
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

  // Maps for fast lookups
  const classMap = useMemo(() => {
    const map = new Map<string, ClassInfo>();
    classes.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  const parentMap = useMemo(() => {
    const map = new Map<string, Parent>();
    parents.forEach((p) => map.set(p.id, p));
    return map;
  }, [parents]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      // 1. Text Search (Name, ID, Address, Phone of parent)
      const parent = parentMap.get(st.parentId);
      const search = searchTerm.toLowerCase();
      const nameMatch = st.fullName.toLowerCase().includes(search);
      const idMatch = st.id.toLowerCase().includes(search);
      const addressMatch = st.address.toLowerCase().includes(search);
      const parentNameMatch = parent?.fullName.toLowerCase().includes(search) || false;
      const parentPhoneMatch = parent?.phone.includes(search) || false;
      const matchesSearch = nameMatch || idMatch || addressMatch || parentNameMatch || parentPhoneMatch;

      // 2. Class Filter
      const matchesClass = selectedClassId === 'all' || st.classId === selectedClassId;

      // 3. Status Filter
      const matchesStatus = selectedStatus === 'all' || st.status === selectedStatus;

      // 4. Gender Filter
      const matchesGender = selectedGender === 'all' || st.gender === selectedGender;

      return matchesSearch && matchesClass && matchesStatus && matchesGender;
    });
  }, [students, searchTerm, selectedClassId, selectedStatus, selectedGender, parentMap]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    setFormFullName('');
    setFormClassId(selectedClassId !== 'all' ? selectedClassId : classes[0]?.id || 'class-11a2');
    setFormDob('2009-05-15');
    setFormGender('Nam');
    setFormAddress('Ba Đình, Hà Nội');
    setFormStatus('active');
    setFormGroup('Tổ 1');
    setFormPosition('Học sinh');
    setFormNotes('');

    // Parent setup
    if (parents.length > 0) {
      setParentMode('existing');
      setFormParentId(parents[0].id);
    } else {
      setParentMode('new');
      setFormParentId('');
    }
    setFormNewParentName('');
    setFormNewParentPhone('');
    setFormNewParentRel('Bố');

    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (st: Student) => {
    setEditingStudent(st);
    setFormFullName(st.fullName);
    setFormClassId(st.classId || classes[0]?.id || 'class-11a2');
    setFormDob(st.dob);
    setFormGender(st.gender);
    setFormAddress(st.address);
    setFormStatus(st.status);
    setFormGroup(st.group || 'Tổ 1');
    setFormPosition(st.position || 'Học sinh');
    setFormNotes(st.notes || '');

    setParentMode('existing');
    setFormParentId(st.parentId || (parents[0]?.id ?? ''));
    setFormNewParentName('');
    setFormNewParentPhone('');
    setFormNewParentRel('Bố');

    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Submit Add or Edit Form via dataProvider
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim()) {
      setFormError('Vui lòng nhập họ và tên học sinh');
      return;
    }
    if (!formAddress.trim()) {
      setFormError('Vui lòng nhập địa chỉ học sinh');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      let finalParentId = formParentId;

      // If creating new parent on the fly
      if (parentMode === 'new') {
        if (!formNewParentName.trim() || !formNewParentPhone.trim()) {
          setFormError('Vui lòng nhập họ tên và số điện thoại phụ huynh mới');
          setIsSubmitting(false);
          return;
        }

        const newParent = await dataProvider.add<Parent>('parents', {
          fullName: formNewParentName.trim(),
          phone: formNewParentPhone.trim(),
          relationship: formNewParentRel,
          studentIds: [],
        });
        finalParentId = newParent.id;
      }

      if (editingStudent) {
        // Update Student via dataProvider
        await dataProvider.update<Student>('students', editingStudent.id, {
          fullName: formFullName.trim(),
          classId: formClassId,
          dob: formDob,
          gender: formGender,
          address: formAddress.trim(),
          parentId: finalParentId,
          status: formStatus,
          group: formGroup,
          position: formPosition,
          notes: formNotes.trim(),
        });

        // Sync parent's studentIds
        if (finalParentId) {
          const p = parentMap.get(finalParentId);
          if (p && (!p.studentIds || !p.studentIds.includes(editingStudent.id))) {
            const updatedIds = Array.from(new Set([...(p.studentIds || []), editingStudent.id]));
            await dataProvider.update<Parent>('parents', finalParentId, {
              studentId: editingStudent.id,
              studentIds: updatedIds,
            });
          }
        }

        showToast(`Đã cập nhật thông tin học sinh ${formFullName}!`);
      } else {
        // Add new Student via dataProvider
        const maxRoll = students.length > 0 ? Math.max(...students.map((s) => s.rollNumber || 0)) : 0;
        const newStudent = await dataProvider.add<Student>('students', {
          fullName: formFullName.trim(),
          classId: formClassId,
          dob: formDob,
          gender: formGender,
          address: formAddress.trim(),
          parentId: finalParentId,
          status: formStatus,
          rollNumber: maxRoll + 1,
          group: formGroup,
          position: formPosition,
          notes: formNotes.trim(),
        });

        // Sync parent
        if (finalParentId) {
          const p = parentMap.get(finalParentId);
          if (p) {
            const updatedIds = Array.from(new Set([...(p.studentIds || []), newStudent.id]));
            await dataProvider.update<Parent>('parents', finalParentId, {
              studentId: newStudent.id,
              studentIds: updatedIds,
            });
          }
        }

        showToast(`Đã thêm học sinh ${formFullName} vào hệ thống!`);
      }

      setIsFormModalOpen(false);
      refreshData();
    } catch (err: any) {
      console.error('Error saving student:', err);
      setFormError(err?.message || 'Có lỗi xảy ra khi lưu thông tin học sinh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete via dataProvider
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      setIsSubmitting(true);
      await dataProvider.remove('students', studentToDelete.id);
      showToast(`Đã xóa học sinh ${studentToDelete.fullName}`);
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      refreshData();
    } catch (err) {
      console.error('Error deleting student:', err);
      showToast('Không thể xóa học sinh. Vui lòng thử lại sau.');
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
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Quản lý Học sinh (Students)</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            CRUD học sinh theo lớp với đầy đủ thông tin mã HS, lớp học, họ tên, ngày sinh, giới tính, địa chỉ, phụ huynh và trạng thái.
          </p>
        </div>

        <button
          id="btn-add-student"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm học sinh mới</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng học sinh</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{students.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Đang theo học</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {students.filter((s) => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Học sinh Nam / Nữ</p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {students.filter((s) => s.gender === 'Nam').length} Nam /{' '}
            {students.filter((s) => s.gender === 'Nữ').length} Nữ
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Tạm nghỉ / Chuyển trường</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">
            {students.filter((s) => s.status !== 'active').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-students-input"
              type="text"
              placeholder="Tìm theo họ tên, mã HS, địa chỉ..."
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
                id="filter-students-class"
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  if (e.target.value === 'all') {
                    searchParams.delete('classId');
                  } else {
                    searchParams.set('classId', e.target.value);
                  }
                  setSearchParams(searchParams);
                }}
                className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="all">Tất cả các lớp ({students.length} HS)</option>
                {classes.map((cls) => {
                  const count = students.filter((s) => s.classId === cls.id).length;
                  return (
                    <option key={cls.id} value={cls.id}>
                      {cls.className || cls.name} ({count} HS)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Trạng thái:</span>
              <select
                id="filter-students-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang theo học</option>
                <option value="leave">Tạm nghỉ học</option>
                <option value="transferred">Đã chuyển trường</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Giới tính:</span>
              <select
                id="filter-students-gender"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Mã HS (ID)</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Lớp học (classId)</th>
                <th className="py-3 px-4">Ngày sinh</th>
                <th className="py-3 px-4">Giới tính</th>
                <th className="py-3 px-4">Địa chỉ cư trú</th>
                <th className="py-3 px-4">Phụ huynh liên kết</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Đang tải danh sách học sinh từ DataProvider...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Không tìm thấy học sinh nào phù hợp</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử điều chỉnh bộ lọc lớp, trạng thái hoặc bấm "Thêm học sinh mới"
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const parent = parentMap.get(st.parentId);
                  const cls = st.classId ? classMap.get(st.classId) : null;
                  const className = cls ? cls.className || cls.name : 'Lớp 11A2';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-700 font-medium">
                        <span className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{st.id}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{st.fullName}</div>
                        {st.position && st.position !== 'Học sinh' && (
                          <span className="text-[11px] font-medium bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200 inline-block mt-0.5">
                            {st.position}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{className}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {st.dob}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            st.gender === 'Nam' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                          }`}
                        >
                          {st.gender}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs text-xs text-slate-600 truncate" title={st.address}>
                        {st.address}
                      </td>

                      <td className="py-3.5 px-4">
                        {parent ? (
                          <div>
                            <div className="font-medium text-slate-900 text-xs flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-emerald-600" />
                              <span>{parent.fullName}</span>
                              <span className="text-slate-400 font-normal">({parent.relationship})</span>
                            </div>
                            <a
                              href={`tel:${parent.phone}`}
                              className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>{parent.phone}</span>
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa liên kết</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            st.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : st.status === 'leave'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {st.status === 'active'
                            ? 'Đang học'
                            : st.status === 'leave'
                            ? 'Tạm nghỉ'
                            : 'Đã chuyển'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-view-student-${st.id}`}
                            onClick={() => setSelectedStudent(st)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-edit-student-${st.id}`}
                            onClick={() => handleOpenEditModal(st)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Sửa học sinh"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-student-${st.id}`}
                            onClick={() => {
                              setStudentToDelete(st);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa học sinh"
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

      {/* FORM MODAL: Create / Edit Student */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">
                  {editingStudent ? 'Chỉnh sửa thông tin Học sinh' : 'Thêm Học sinh mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Full Name & Class */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên học sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lớp học (classId) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.className || cls.name} ({cls.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày sinh (YYYY-MM-DD) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giới tính <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ cư trú <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Số nhà, phố, quận/huyện, tỉnh/thành phố"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status & Position */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trạng thái học tập <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="active">Đang theo học (active)</option>
                    <option value="leave">Tạm nghỉ học (leave)</option>
                    <option value="transferred">Đã chuyển trường (transferred)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chức vụ trong lớp
                  </label>
                  <input
                    type="text"
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    placeholder="Lớp trưởng, Lớp phó, Học sinh..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Parent Association Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Phụ huynh liên kết (parentId)</span>
                  </div>

                  {!editingStudent && (
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setParentMode('existing')}
                        className={`px-2 py-0.5 rounded font-medium ${
                          parentMode === 'existing'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        Chọn có sẵn
                      </button>
                      <button
                        type="button"
                        onClick={() => setParentMode('new')}
                        className={`px-2 py-0.5 rounded font-medium ${
                          parentMode === 'new'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        Tạo PH mới
                      </button>
                    </div>
                  )}
                </div>

                {parentMode === 'existing' ? (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Chọn phụ huynh từ danh sách
                    </label>
                    <select
                      value={formParentId}
                      onChange={(e) => setFormParentId(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Chưa liên kết phụ huynh --</option>
                      {parents.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.relationship}) - SĐT: {p.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="block text-xs text-slate-600 mb-1">Quan hệ</label>
                        <select
                          value={formNewParentRel}
                          onChange={(e) => setFormNewParentRel(e.target.value as any)}
                          className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg"
                        >
                          <option value="Bố">Bố</option>
                          <option value="Mẹ">Mẹ</option>
                          <option value="Người giám hộ">Giám hộ</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-slate-600 mb-1">Họ tên PH</label>
                        <input
                          type="text"
                          value={formNewParentName}
                          onChange={(e) => setFormNewParentName(e.target.value)}
                          placeholder="Họ và tên phụ huynh"
                          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Số điện thoại phụ huynh</label>
                      <input
                        type="tel"
                        value={formNewParentPhone}
                        onChange={(e) => setFormNewParentPhone(e.target.value)}
                        placeholder="09xx xxx xxx"
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú học sinh</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ghi chú về học lực, nề nếp, năng khiếu..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : editingStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center">
                  {selectedStudent.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedStudent.fullName}</h3>
                  <p className="text-xs text-slate-500">Mã định danh: {selectedStudent.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Lớp học:</span>
                <span className="font-semibold text-slate-900">
                  {classMap.get(selectedStudent.classId || '')?.className || 'Lớp 11A2'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Giới tính:</span>
                <span className="font-semibold text-slate-900">{selectedStudent.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Ngày sinh:</span>
                <span className="font-semibold text-slate-900">{selectedStudent.dob}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Trạng thái:</span>
                <span className="font-semibold text-emerald-600">
                  {selectedStudent.status === 'active' ? 'Đang theo học' : 'Nghỉ / Chuyển'}
                </span>
              </div>
              <div className="py-1 border-b border-slate-100">
                <span className="text-slate-500 block mb-0.5">Địa chỉ:</span>
                <span className="font-medium text-slate-900">{selectedStudent.address}</span>
              </div>

              {parentMap.get(selectedStudent.parentId) && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
                  <span className="text-xs font-bold text-slate-700 block mb-1">Phụ huynh liên hệ:</span>
                  <div className="flex items-center justify-between text-xs">
                    <span>
                      {parentMap.get(selectedStudent.parentId)?.fullName} (
                      {parentMap.get(selectedStudent.parentId)?.relationship})
                    </span>
                    <a
                      href={`tel:${parentMap.get(selectedStudent.parentId)?.phone}`}
                      className="text-indigo-600 font-semibold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {parentMap.get(selectedStudent.parentId)?.phone}
                    </a>
                  </div>
                </div>
              )}

              {selectedStudent.notes && (
                <div className="text-xs text-slate-500 italic mt-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  "{selectedStudent.notes}"
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isDeleteModalOpen && studentToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa học sinh</h3>
              <p className="text-sm text-slate-500 mt-1">
                Bạn có chắc chắn muốn xóa học sinh{' '}
                <strong className="text-slate-800">{studentToDelete.fullName}</strong> (ID: {studentToDelete.id}) khỏi
                hệ thống?
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
