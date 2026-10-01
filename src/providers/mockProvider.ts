import { DataProvider } from '../core/dataProvider';
import {
  ClassInfo,
  Student,
  Parent,
  Attendance,
  AttendanceStatus,
  MarkAttendanceParams,
  AttendanceRange,
  Behavior,
  BehaviorRange,
  Announcement,
  Task,
  TaskReply,
  Thread,
  MessageThread,
  Message,
  Document,
  Report,
} from '../core/types';

const STORAGE_PREFIX = 'qlcn_v1_';

export const initialClasses: ClassInfo[] = [
  {
    id: 'class-11a2',
    className: 'Lớp 11A2',
    name: 'Lớp 11A2',
    grade: 'Khối 11',
    schoolYear: '2025 - 2026',
    academicYear: '2025 - 2026',
    room: 'Phòng 304 - Nhà A',
    totalStudents: 9,
    schoolName: 'Trường THPT Chu Văn An',
    homeroomTeacher: {
      name: 'Thầy Trần Quang Huy',
      phone: '0988 123 456',
      email: 'quanghuy.tran@chuvanan.edu.vn',
      subject: 'Toán học',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    note: 'Lớp chuyên ban Tự nhiên (Toán - Tin), chi đoàn xuất sắc năm học 2025-2026.',
  },
  {
    id: 'class-11a1',
    className: 'Lớp 11A1',
    name: 'Lớp 11A1',
    grade: 'Khối 11',
    schoolYear: '2025 - 2026',
    academicYear: '2025 - 2026',
    room: 'Phòng 302 - Nhà A',
    totalStudents: 2,
    schoolName: 'Trường THPT Chu Văn An',
    homeroomTeacher: {
      name: 'Cô Nguyễn Thị Mai',
      phone: '0912 888 999',
      email: 'mainguyen@chuvanan.edu.vn',
      subject: 'Tiếng Anh',
    },
    note: 'Lớp chuyên sâu Ngoại ngữ & Xã hội, đạt giải Nhất Hội trại thanh niên.',
  },
  {
    id: 'class-10a3',
    className: 'Lớp 10A3',
    name: 'Lớp 10A3',
    grade: 'Khối 10',
    schoolYear: '2025 - 2026',
    academicYear: '2025 - 2026',
    room: 'Phòng 201 - Nhà B',
    totalStudents: 1,
    schoolName: 'Trường THPT Chu Văn An',
    homeroomTeacher: {
      name: 'Thầy Lê Hoàng Nam',
      phone: '0977 111 222',
      email: 'namle@chuvanan.edu.vn',
      subject: 'Vật lý',
    },
    note: 'Lớp chọn khối 10 định hướng KHTN công nghệ cao.',
  },
];

const initialClassInfo: ClassInfo = initialClasses[0];

const initialParents: Parent[] = [
  {
    id: 'p-1',
    fullName: 'Nguyễn Văn Hùng',
    relationship: 'Bố',
    phone: '0912 345 678',
    email: 'vanhung.nguyen@gmail.com',
    occupation: 'Kỹ sư xây dựng',
    studentId: 's-1',
    studentIds: ['s-1'],
  },
  {
    id: 'p-2',
    fullName: 'Lê Thị Mai',
    relationship: 'Mẹ',
    phone: '0903 222 111',
    email: 'maile.hanoi@gmail.com',
    occupation: 'Bác sĩ đa khoa',
    studentId: 's-2',
    studentIds: ['s-2'],
  },
  {
    id: 'p-3',
    fullName: 'Trần Văn Bình',
    relationship: 'Bố',
    phone: '0983 456 789',
    email: 'binhtran.law@gmail.com',
    occupation: 'Luật sư',
    studentId: 's-3',
    studentIds: ['s-3'],
  },
  {
    id: 'p-4',
    fullName: 'Phạm Thị Thu Hương',
    relationship: 'Mẹ',
    phone: '0977 888 999',
    email: 'thuhuong.pham@gmail.com',
    occupation: 'Giảng viên Đại học',
    studentId: 's-4',
    studentIds: ['s-4'],
  },
  {
    id: 'p-5',
    fullName: 'Hoàng Đình Thắng',
    relationship: 'Bố',
    phone: '0914 555 666',
    email: 'thang.hoang@fpt.com.vn',
    occupation: 'Chuyên viên CNTT',
    studentId: 's-5',
    studentIds: ['s-5'],
  },
  {
    id: 'p-6',
    fullName: 'Vũ Thị Thanh Thủy',
    relationship: 'Mẹ',
    phone: '0936 777 888',
    email: 'thuyvu.bank@gmail.com',
    occupation: 'Kế toán trưởng',
    studentId: 's-6',
    studentIds: ['s-6'],
  },
  {
    id: 'p-7',
    fullName: 'Đỗ Quang Minh',
    relationship: 'Bố',
    phone: '0945 123 789',
    email: 'minh.do@vietcombank.com.vn',
    occupation: 'Giám đốc chi nhánh',
    studentId: 's-7',
    studentIds: ['s-7'],
  },
  {
    id: 'p-8',
    fullName: 'Ngô Thị Thùy',
    relationship: 'Mẹ',
    phone: '0908 654 321',
    email: 'thuyngo.pharmacy@gmail.com',
    occupation: 'Dược sĩ',
    studentId: 's-8',
    studentIds: ['s-8'],
  },
  {
    id: 'p-9',
    fullName: 'Bùi Văn Quyết',
    relationship: 'Bố',
    phone: '0982 999 111',
    email: 'quyetbui@gmail.com',
    occupation: 'Kinh doanh tự do',
    studentId: 's-9',
    studentIds: ['s-9'],
  },
  {
    id: 'p-10',
    fullName: 'Dương Hoàng Yến',
    relationship: 'Mẹ',
    phone: '0916 234 567',
    email: 'yen.duong@vtv.vn',
    occupation: 'Biên tập viên truyền hình',
    studentId: 's-10',
    studentIds: ['s-10'],
  },
  {
    id: 'p-11',
    fullName: 'Đặng Thanh Tùng',
    relationship: 'Bố',
    phone: '0979 333 444',
    email: 'tung.dang@gmail.com',
    occupation: 'Kiến trúc sư',
    studentId: 's-11',
    studentIds: ['s-11'],
  },
  {
    id: 'p-12',
    fullName: 'Trịnh Thị Lan',
    relationship: 'Mẹ',
    phone: '0985 666 777',
    email: 'lan.trinh@moet.gov.vn',
    occupation: 'Chuyên viên sở GD',
    studentId: 's-12',
    studentIds: ['s-12'],
  },
];

const initialStudents: Student[] = [
  {
    id: 's-1',
    classId: 'class-11a2',
    rollNumber: 1,
    fullName: 'Nguyễn Văn An',
    gender: 'Nam',
    dob: '2009-04-12',
    address: 'Số 12 ngõ 45 phố Thụy Khuê, Tây Hồ, Hà Nội',
    parentId: 'p-1',
    status: 'active',
    group: 'Tổ 1',
    position: 'Lớp trưởng',
    notes: 'Học lực Xuất sắc, năng nổ trong phong trào, cán bộ gương mẫu.',
  },
  {
    id: 's-2',
    classId: 'class-11a2',
    rollNumber: 2,
    fullName: 'Lê Mai Anh',
    gender: 'Nữ',
    dob: '2009-08-23',
    address: '28 Quán Thánh, Ba Đình, Hà Nội',
    parentId: 'p-2',
    status: 'active',
    group: 'Tổ 1',
    position: 'Lớp phó học tập',
    notes: 'Đội tuyển HSG Tiếng Anh, thường xuyên giúp đỡ bạn học nhóm.',
  },
  {
    id: 's-3',
    classId: 'class-11a2',
    rollNumber: 3,
    fullName: 'Trần Hải Đăng',
    gender: 'Nam',
    dob: '2009-01-15',
    address: '105 Hoàng Hoa Thám, Ba Đình, Hà Nội',
    parentId: 'p-3',
    status: 'active',
    group: 'Tổ 1',
    position: 'Tổ trưởng Tổ 1',
    notes: 'Học khá môn Tự nhiên, có năng khiếu bóng rổ.',
  },
  {
    id: 's-4',
    classId: 'class-11a2',
    rollNumber: 4,
    fullName: 'Phạm Quỳnh Chi',
    gender: 'Nữ',
    dob: '2009-11-05',
    address: '56 Đội Cấn, Ba Đình, Hà Nội',
    parentId: 'p-4',
    status: 'active',
    group: 'Tổ 2',
    position: 'Bí thư Chi đoàn',
    notes: 'Năng nổ hoạt động Đoàn, dẫn chương trình các sự kiện của trường.',
  },
  {
    id: 's-5',
    classId: 'class-11a2',
    rollNumber: 5,
    fullName: 'Hoàng Bảo Nam',
    gender: 'Nam',
    dob: '2009-06-30',
    address: '74 Lạc Long Quân, Cầu Giấy, Hà Nội',
    parentId: 'p-5',
    status: 'active',
    group: 'Tổ 2',
    position: 'Học sinh',
    notes: 'Học tốt Tin học & Toán, đôi khi còn hay nói chuyện riêng.',
  },
  {
    id: 's-6',
    classId: 'class-11a2',
    rollNumber: 6,
    fullName: 'Vũ Phương Linh',
    gender: 'Nữ',
    dob: '2009-09-18',
    address: '18 Phan Đình Phùng, Ba Đình, Hà Nội',
    parentId: 'p-6',
    status: 'active',
    group: 'Tổ 2',
    position: 'Tổ trưởng Tổ 2',
    notes: 'Chăm chỉ, vở ghi cẩn thận, quản lý nề nếp tổ tốt.',
  },
  {
    id: 's-7',
    classId: 'class-11a2',
    rollNumber: 7,
    fullName: 'Đỗ Minh Khang',
    gender: 'Nam',
    dob: '2009-03-25',
    address: '89 Kim Mã, Ba Đình, Hà Nội',
    parentId: 'p-7',
    status: 'active',
    group: 'Tổ 3',
    position: 'Lớp phó Văn thể mỹ',
    notes: 'Thành viên ban nhạc trường, tích cực tham gia biểu diễn văn nghệ.',
  },
  {
    id: 's-8',
    classId: 'class-11a2',
    rollNumber: 8,
    fullName: 'Ngô Gia Bảo',
    gender: 'Nam',
    dob: '2009-12-02',
    address: '22 Liễu Giai, Ba Đình, Hà Nội',
    parentId: 'p-8',
    status: 'active',
    group: 'Tổ 3',
    position: 'Học sinh',
    notes: 'Cần chú ý đi học đúng giờ hơn, tiếp thu bài nhanh.',
  },
  {
    id: 's-9',
    classId: 'class-11a2',
    rollNumber: 9,
    fullName: 'Bùi Anh Thư',
    gender: 'Nữ',
    dob: '2009-07-14',
    address: '41 Yên Phụ, Tây Hồ, Hà Nội',
    parentId: 'p-9',
    status: 'active',
    group: 'Tổ 3',
    position: 'Tổ trưởng Tổ 3',
    notes: 'Trách nhiệm cao, giải Ba bơi lội Hội khỏe Phù Đổng cấp quận.',
  },
  {
    id: 's-10',
    classId: 'class-11a1',
    rollNumber: 10,
    fullName: 'Dương Quốc Tuấn',
    gender: 'Nam',
    dob: '2009-05-19',
    address: '15 Võ Chí Công, Tây Hồ, Hà Nội',
    parentId: 'p-10',
    status: 'active',
    group: 'Tổ 4',
    position: 'Học sinh',
    notes: 'Thích nghiên cứu khoa học, đạt giải Sáng tạo KHKT cấp trường.',
  },
  {
    id: 's-11',
    classId: 'class-11a1',
    rollNumber: 11,
    fullName: 'Đặng Minh Châu',
    gender: 'Nữ',
    dob: '2009-10-08',
    address: '92 Nguyễn Thái Học, Ba Đình, Hà Nội',
    parentId: 'p-11',
    status: 'active',
    group: 'Tổ 4',
    position: 'Tổ trưởng Tổ 4',
    notes: 'Ngoan ngoãn, viết chữ đẹp, phụ trách báo tường của lớp.',
  },
  {
    id: 's-12',
    classId: 'class-10a3',
    rollNumber: 12,
    fullName: 'Trịnh Tuấn Kiệt',
    gender: 'Nam',
    dob: '2009-02-28',
    address: '33 Trích Sài, Tây Hồ, Hà Nội',
    parentId: 'p-12',
    status: 'active',
    group: 'Tổ 4',
    position: 'Học sinh',
    notes: 'Có tiến bộ rõ rệt ở môn Toán và Ngữ văn trong tháng vừa qua.',
  },
];

const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const initialAttendance: Attendance[] = [
  // Today's attendance (Offset 0)
  { id: 'att-1', classId: 'class-11a2', studentId: 's-1', date: getTodayString(0), status: 'PRESENT', recordedAt: '07:15' },
  { id: 'att-2', classId: 'class-11a2', studentId: 's-2', date: getTodayString(0), status: 'PRESENT', recordedAt: '07:10' },
  { id: 'att-3', classId: 'class-11a2', studentId: 's-3', date: getTodayString(0), status: 'PRESENT', recordedAt: '07:18' },
  { id: 'att-4', classId: 'class-11a2', studentId: 's-4', date: getTodayString(0), status: 'PRESENT', recordedAt: '07:12' },
  { id: 'att-5', classId: 'class-11a2', studentId: 's-5', date: getTodayString(0), status: 'LATE', note: 'Đi muộn 10 phút do hỏng xe', recordedAt: '07:40' },
  { id: 'att-6', classId: 'class-11a2', studentId: 's-6', date: getTodayString(0), status: 'PRESENT', recordedAt: '07:15' },
  { id: 'att-7', classId: 'class-11a2', studentId: 's-7', date: getTodayString(0), status: 'PRESENT', recordedAt: '07:14' },
  { id: 'att-8', classId: 'class-11a2', studentId: 's-8', date: getTodayString(0), status: 'ABSENT', note: 'Phụ huynh gọi điện xin nghỉ ốm sốt virus', recordedAt: '07:05' },
  { id: 'att-9', classId: 'class-11a2', studentId: 's-9', date: getTodayString(0), status: 'PRESENT', recordedAt: '07:16' },
  { id: 'att-10', classId: 'class-11a1', studentId: 's-10', date: getTodayString(0), status: 'PRESENT', recordedAt: '07:20' },
  { id: 'att-11', classId: 'class-11a1', studentId: 's-11', date: getTodayString(0), status: 'PRESENT', recordedAt: '07:10' },
  { id: 'att-12', classId: 'class-10a3', studentId: 's-12', date: getTodayString(0), status: 'PRESENT', recordedAt: '07:22' },

  // Offset -1
  { id: 'att-13', classId: 'class-11a2', studentId: 's-1', date: getTodayString(-1), status: 'PRESENT', recordedAt: '07:15' },
  { id: 'att-14', classId: 'class-11a2', studentId: 's-2', date: getTodayString(-1), status: 'PRESENT', recordedAt: '07:12' },
  { id: 'att-15', classId: 'class-11a2', studentId: 's-3', date: getTodayString(-1), status: 'PRESENT', recordedAt: '07:18' },
  { id: 'att-16', classId: 'class-11a2', studentId: 's-4', date: getTodayString(-1), status: 'PRESENT', recordedAt: '07:14' },
  { id: 'att-17', classId: 'class-11a2', studentId: 's-5', date: getTodayString(-1), status: 'PRESENT', recordedAt: '07:20' },
  { id: 'att-18', classId: 'class-11a2', studentId: 's-6', date: getTodayString(-1), status: 'PRESENT', recordedAt: '07:15' },
  { id: 'att-19', classId: 'class-11a2', studentId: 's-7', date: getTodayString(-1), status: 'PRESENT', recordedAt: '07:10' },
  { id: 'att-20', classId: 'class-11a2', studentId: 's-8', date: getTodayString(-1), status: 'PRESENT', recordedAt: '07:25' },
  { id: 'att-21', classId: 'class-11a2', studentId: 's-9', date: getTodayString(-1), status: 'PRESENT', recordedAt: '07:15' },
  { id: 'att-22', classId: 'class-11a1', studentId: 's-10', date: getTodayString(-1), status: 'ABSENT', note: 'Tham gia thi Robocon cấp Thành phố', recordedAt: '07:00' },
  { id: 'att-23', classId: 'class-11a1', studentId: 's-11', date: getTodayString(-1), status: 'PRESENT', recordedAt: '07:11' },
  { id: 'att-24', classId: 'class-10a3', studentId: 's-12', date: getTodayString(-1), status: 'PRESENT', recordedAt: '07:19' },

  // Offset -2
  { id: 'att-25', classId: 'class-11a2', studentId: 's-1', date: getTodayString(-2), status: 'PRESENT', recordedAt: '07:10' },
  { id: 'att-26', classId: 'class-11a2', studentId: 's-2', date: getTodayString(-2), status: 'PRESENT', recordedAt: '07:15' },
  { id: 'att-27', classId: 'class-11a2', studentId: 's-3', date: getTodayString(-2), status: 'LATE', note: 'Đi muộn 15 phút do tắc đường', recordedAt: '07:35' },
  { id: 'att-28', classId: 'class-11a2', studentId: 's-4', date: getTodayString(-2), status: 'PRESENT', recordedAt: '07:12' },
  { id: 'att-29', classId: 'class-11a2', studentId: 's-5', date: getTodayString(-2), status: 'PRESENT', recordedAt: '07:18' },
  { id: 'att-30', classId: 'class-11a2', studentId: 's-6', date: getTodayString(-2), status: 'PRESENT', recordedAt: '07:14' },
  { id: 'att-31', classId: 'class-11a2', studentId: 's-7', date: getTodayString(-2), status: 'PRESENT', recordedAt: '07:08' },
  { id: 'att-32', classId: 'class-11a2', studentId: 's-8', date: getTodayString(-2), status: 'PRESENT', recordedAt: '07:20' },
  { id: 'att-33', classId: 'class-11a2', studentId: 's-9', date: getTodayString(-2), status: 'PRESENT', recordedAt: '07:16' },

  // Offset -3
  { id: 'att-34', classId: 'class-11a2', studentId: 's-1', date: getTodayString(-3), status: 'PRESENT', recordedAt: '07:14' },
  { id: 'att-35', classId: 'class-11a2', studentId: 's-5', date: getTodayString(-3), status: 'LATE', note: 'Đến muộn 5 phút', recordedAt: '07:35' },

  // Offset -4
  { id: 'att-36', classId: 'class-11a2', studentId: 's-1', date: getTodayString(-4), status: 'PRESENT', recordedAt: '07:11' },

  // Offset -7 (Previous week)
  { id: 'att-37', classId: 'class-11a2', studentId: 's-1', date: getTodayString(-7), status: 'PRESENT', recordedAt: '07:10' },
  { id: 'att-38', classId: 'class-11a2', studentId: 's-2', date: getTodayString(-7), status: 'PRESENT', recordedAt: '07:12' },
  { id: 'att-39', classId: 'class-11a2', studentId: 's-3', date: getTodayString(-7), status: 'PRESENT', recordedAt: '07:15' },
  { id: 'att-40', classId: 'class-11a2', studentId: 's-1', date: getTodayString(-8), status: 'LATE', note: 'Đi xe bus tuyến muộn', recordedAt: '07:35' },
  { id: 'att-41', classId: 'class-11a2', studentId: 's-1', date: getTodayString(-9), status: 'PRESENT', recordedAt: '07:08' },
  { id: 'att-42', classId: 'class-11a2', studentId: 's-1', date: getTodayString(-10), status: 'PRESENT', recordedAt: '07:15' },
  { id: 'att-43', classId: 'class-11a2', studentId: 's-1', date: getTodayString(-11), status: 'ABSENT', note: 'Gia đình có việc hiếu (Có phép)', recordedAt: '07:00' },
  { id: 'att-44', classId: 'class-11a2', studentId: 's-1', date: getTodayString(-14), status: 'PRESENT', recordedAt: '07:12' },
  { id: 'att-45', classId: 'class-11a2', studentId: 's-1', date: getTodayString(-15), status: 'PRESENT', recordedAt: '07:14' },
];

const initialBehaviors: Behavior[] = [
  {
    id: 'beh-1',
    studentId: 's-1',
    date: getTodayString(0),
    type: 'PRAISE',
    content: 'Hăng hái phát biểu xây dựng bài trong giờ Toán, giải bài tập nâng cao xuất sắc.',
    title: 'Hăng hái phát biểu xây dựng bài',
    points: 5,
    recordedBy: 'Thầy Trần Quang Huy',
  },
  {
    id: 'beh-2',
    studentId: 's-2',
    date: getTodayString(-1),
    type: 'PRAISE',
    content: 'Tích cực kèm cặp và giúp đỡ bạn Ngô Gia Bảo hoàn thành bài tập nhóm Tiếng Anh.',
    title: 'Giúp đỡ bạn học yếu',
    points: 5,
    recordedBy: 'Thầy Trần Quang Huy',
  },
  {
    id: 'beh-3',
    studentId: 's-5',
    date: getTodayString(0),
    type: 'WARN',
    content: 'Đến lớp sau hiệu lệnh trống 10 phút, nhắc nhở chỉnh đốn tác phong giờ chào cờ.',
    title: 'Đi học muộn',
    points: -2,
    recordedBy: 'Thầy Trần Quang Huy',
  },
  {
    id: 'beh-4',
    studentId: 's-4',
    date: getTodayString(-2),
    type: 'PRAISE',
    content: 'Tổ chức sinh hoạt Chi đoàn xuất sắc, xây dựng kế hoạch phong trào 26/3 sáng tạo.',
    title: 'Tổ chức sinh hoạt Chi đoàn xuất sắc',
    points: 10,
    recordedBy: 'Thầy Trần Quang Huy',
  },
  {
    id: 'beh-5',
    studentId: 's-8',
    date: getTodayString(-3),
    type: 'WARN',
    content: 'Chưa làm đủ bài tập về nhà môn Hóa học theo quy định của bộ môn.',
    title: 'Quên mang sách bài tập',
    points: -2,
    recordedBy: 'Cô Vũ Bích Ngọc (Hóa)',
  },
  {
    id: 'beh-6',
    studentId: 's-10',
    date: getTodayString(-1),
    type: 'PRAISE',
    content: 'Đạt Giải Nhì Hội thi Sáng tạo Robot cấp Trường, mang lại vinh dự cho tập thể lớp.',
    title: 'Giải Nhì Robocon cấp Trường',
    points: 15,
    recordedBy: 'Thầy Trần Quang Huy',
  },
  {
    id: 'beh-7',
    studentId: 's-7',
    date: getTodayString(-4),
    type: 'PRAISE',
    content: 'Trực nhật đúng giờ, phòng học gọn gàng sạch sẽ, kê lại ngay ngắn bàn ghế.',
    title: 'Vệ sinh lớp học sạch sẽ',
    points: 3,
    recordedBy: 'Thầy Trần Quang Huy',
  },
  {
    id: 'beh-8',
    studentId: 's-1',
    date: getTodayString(-2),
    type: 'PRAISE',
    content: 'Đạt điểm 10 kiểm tra miệng môn Lịch sử, chuẩn bị bài chu đáo.',
    title: 'Điểm 10 môn Lịch sử',
    points: 10,
    recordedBy: 'Thầy Trần Quang Huy',
  },
  {
    id: 'beh-9',
    studentId: 's-1',
    date: getTodayString(-5),
    type: 'WARN',
    content: 'Quên mang sổ tay sinh hoạt và tài liệu học tập bộ môn.',
    title: 'Quên dụng cụ học tập',
    points: -2,
    recordedBy: 'Thầy Trần Quang Huy',
  },
  {
    id: 'beh-10',
    studentId: 's-1',
    date: getTodayString(-12),
    type: 'WARN',
    content: 'Nhắc nhở riêng về việc trao đổi trong giờ học và giữ khoảng cách tâm lý với bạn cùng bàn.',
    title: 'Nhắc nhở tế nhị trong giờ tự quản',
    points: -2,
    recordedBy: 'Thầy Trần Quang Huy',
    isSensitive: true,
  },
  {
    id: 'beh-11',
    studentId: 's-3',
    date: getTodayString(-6),
    type: 'PRAISE',
    content: 'Tự giác nhặt được của rơi (ví tiền có căn cước công dân) gửi trả lại Văn phòng Đoàn.',
    title: 'Nhặt được của rơi trả người đánh mất',
    points: 10,
    recordedBy: 'Cô Vũ Bích Ngọc (Hóa)',
  },
  {
    id: 'beh-12',
    studentId: 's-1',
    date: getTodayString(-18),
    type: 'PRAISE',
    content: 'Đại diện lớp tham gia Đội tuyển Học sinh giỏi môn Tiếng Anh cấp Cụm.',
    title: 'Tham gia Đội tuyển HSG',
    points: 10,
    recordedBy: 'Thầy Trần Quang Huy',
  },
];

const initialAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    classId: 'class-11a2',
    title: 'Thông báo Họp Cha Mẹ Học Sinh định kỳ Học kỳ 2',
    content:
      'Kính gửi Quý Phụ huynh Lớp 11A2! Nhà trường và GVCN kính mời toàn thể Quý Phụ huynh tham dự buổi họp CMHS giữa kỳ vào lúc 8h00 sáng Chủ Nhật (ngày 22/02/2026) tại phòng 304. Nội dung: Đánh giá nề nếp rèn luyện, kết quả kiểm tra định kỳ và định hướng chọn tổ hợp thi tốt nghiệp THPT mới.',
    target: 'parent',
    pinned: true,
    category: 'urgent',
    createdAt: '2026-02-14 14:30',
    author: 'GVCN Thầy Trần Quang Huy',
    attachments: [
      { name: 'Ke_hoach_hop_CMHS_HK2.pdf', url: 'https://example.com/docs/Ke_hoach_hop_CMHS_HK2.pdf', size: '1.2 MB' },
    ],
  },
  {
    id: 'ann-2',
    classId: 'class-11a2',
    title: 'Kế hoạch chuyến tham quan học tập trải nghiệm tại Bảo tàng Lịch sử Quốc gia',
    content:
      'Lớp 11A2 sẽ tổ chức chuyến đi trải nghiệm môn Lịch sử và GDQP-AN vào thứ Bảy tuần tới. Thời gian tập trung: 06h45 tại sân trường. Các em mặc đồng phục thể dục, mang theo sổ tay ghi chép và đồ dùng cá nhân gọn nhẹ.',
    target: 'all',
    pinned: true,
    category: 'event',
    createdAt: '2026-02-12 09:15',
    author: 'GVCN Thầy Trần Quang Huy',
    attachments: [
      { name: 'Lich_trinh_trai_nghiem.pdf', url: 'https://example.com/docs/Lich_trinh_trai_nghiem.pdf', size: '850 KB' },
    ],
  },
  {
    id: 'ann-3',
    classId: 'class-11a2',
    title: 'Thông báo thu kinh phí may áo đồng phục lớp & quỹ học tập',
    content:
      'Ban đại diện CMHS lớp 11A2 thông báo thu kinh phí may áo lớp (220.000đ/học sinh) và bổ sung quỹ khuyến học học kỳ 2. Phụ huynh có thể đóng trực tiếp hoặc chuyển khoản cho Trưởng ban phụ huynh qua tài khoản lớp.',
    target: 'parent',
    pinned: false,
    category: 'fees',
    createdAt: '2026-02-10 16:45',
    author: 'Ban đại diện CMHS',
  },
  {
    id: 'ann-4',
    classId: 'class-11a2',
    title: 'Phát động tuần lễ thi đua "Hoa điểm 10 chào mừng ngày Quốc tế Phụ nữ 8/3"',
    content:
      'Ban cán sự lớp phát động phong trào giành nhiều điểm tốt dâng tặng Cô giáo và các Mẹ. Các tổ trưởng ghi chép điểm cộng hàng ngày và tổng kết vào tiết sinh hoạt cuối tuần.',
    target: 'student',
    pinned: false,
    category: 'general',
    createdAt: '2026-02-08 08:00',
    author: 'Ban cán sự lớp 11A2',
  },
  {
    id: 'ann-5',
    classId: 'class-11a1',
    title: 'Lịch kiểm tra chung học kỳ 2 các môn Khoa học Xã hội',
    content:
      'Thông báo tới học sinh và quý phụ huynh lớp 11A1 về lịch thi học kỳ 2 bắt đầu từ ngày 25/03/2026. Đề nghị các em ôn tập nghiêm túc.',
    target: 'all',
    pinned: true,
    category: 'urgent',
    createdAt: '2026-02-09 10:00',
    author: 'Cô Nguyễn Thị Mai',
  },
];

const initialTasks: Task[] = [
  {
    id: 'task-1',
    classId: 'class-11a2',
    title: 'Khảo sát đăng ký tham gia chuyến đi dã ngoại học tập thực tế',
    description:
      'Phụ huynh và học sinh vui lòng phản hồi đồng ý hoặc không đồng ý tham gia chuyến dã ngoại, kèm theo thông tin sức khỏe và các lưu ý đặc biệt (nếu có dị ứng thực phẩm).',
    dueDate: getTodayString(4),
    requireReply: true,
    createdAt: '2026-02-14',
    assignedTo: 'all',
    status: 'open',
    type: 'survey',
  },
  {
    id: 'task-2',
    classId: 'class-11a2',
    title: 'Nộp bài tập chuyên đề môn Toán: Đạo hàm và ứng dụng thực tiễn',
    description:
      'Học sinh hoàn thành bài tập tự luận trang 84-86 SGK Chuyên đề Toán 11, giải chi tiết và đính kèm đường link bài làm (Google Drive/Docs hoặc ảnh).',
    dueDate: getTodayString(2),
    requireReply: true,
    createdAt: '2026-02-13',
    assignedTo: 'all',
    status: 'open',
    type: 'assignment',
  },
  {
    id: 'task-3',
    classId: 'class-11a2',
    title: 'Xác nhận chữ ký sổ theo dõi học tập tháng 1/2026',
    description:
      'Phụ huynh xem sổ đánh giá nề nếp và học tập tháng 1, gửi xác nhận đồng ý và ý kiến đóng góp cho GVCN.',
    dueDate: getTodayString(7),
    requireReply: true,
    createdAt: '2026-02-10',
    assignedTo: 'all',
    status: 'open',
    type: 'form',
  },
  {
    id: 'task-4',
    classId: 'class-11a2',
    title: 'Phiếu đăng ký mua sách bổ trợ Tiếng Anh học kỳ 2 (Đã quá hạn)',
    description:
      'Đăng ký bộ tài liệu luyện thi HSG và IELTS học kỳ 2. Yêu cầu phản hồi số lượng đăng ký hoặc ghi chú không đăng ký.',
    dueDate: getTodayString(-2),
    requireReply: true,
    createdAt: '2026-02-01',
    assignedTo: 'all',
    status: 'open',
    type: 'survey',
  },
  {
    id: 'task-5',
    classId: 'class-11a2',
    title: 'Nhắc nhở nếp sống văn minh & Trang phục đồng phục thứ Hai chào cờ',
    description:
      'Yêu cầu toàn thể học sinh mặc đồng phục chỉnh tề, đeo huy hiệu đoàn viên, đi giày bata trắng vào tiết chào cờ đầu tuần.',
    dueDate: getTodayString(5),
    requireReply: false,
    createdAt: '2026-02-14',
    assignedTo: 'all',
    status: 'open',
    type: 'assignment',
  },
  {
    id: 'task-6',
    classId: 'class-11a1',
    title: 'Nộp bài tiểu luận môn Ngữ văn HK2 Lớp 11A1',
    description:
      'Phân tích hình tượng người nông dân trong văn học hiện thực giai đoạn 1930 - 1945.',
    dueDate: getTodayString(3),
    requireReply: true,
    createdAt: '2026-02-12',
    assignedTo: 'all',
    status: 'open',
    type: 'assignment',
  },
];

const initialTaskReplies: TaskReply[] = [
  {
    id: 'reply-1',
    taskId: 'task-1',
    studentId: 's-1',
    parentId: 'p-1',
    replyText: 'Gia đình hoàn toàn đồng ý cho em Nguyễn Văn An tham gia. Sức khỏe bình thường, không dị ứng thức ăn.',
    attachmentsJson: 'https://drive.google.com/file/d/phieu-dang-ky-s1',
    createdAt: '2026-02-14 18:30',
    submittedAt: '2026-02-14 18:30',
    content: 'Gia đình hoàn toàn đồng ý cho em Nguyễn Văn An tham gia. Sức khỏe bình thường, không dị ứng thức ăn.',
    status: 'completed',
    feedback: 'Đã ghi nhận thông tin, cảm ơn phụ huynh!',
  },
  {
    id: 'reply-2',
    taskId: 'task-1',
    studentId: 's-2',
    parentId: 'p-2',
    replyText: 'Phụ huynh em Lê Mai Anh xác nhận đăng ký tham gia.',
    attachmentsJson: '',
    createdAt: '2026-02-15 09:10',
    submittedAt: '2026-02-15 09:10',
    content: 'Phụ huynh em Lê Mai Anh xác nhận đăng ký tham gia.',
    status: 'completed',
    feedback: 'Đã xác nhận danh sách.',
  },
  {
    id: 'reply-3',
    taskId: 'task-2',
    studentId: 's-1',
    replyText: 'Em đã hoàn thành 5 bài toán đạo hàm phần ứng dụng hình học và gửi kèm link bài giải chi tiết.',
    attachmentsJson: 'https://docs.google.com/document/d/bai-tap-toan-an',
    createdAt: '2026-02-14 21:00',
    submittedAt: '2026-02-14 21:00',
    content: 'Em đã hoàn thành 5 bài toán đạo hàm phần ứng dụng hình học và gửi kèm link bài giải chi tiết.',
    status: 'completed',
    feedback: 'Bài làm rất cẩn thận, lập luận chặt chẽ!',
  },
  {
    id: 'reply-4',
    taskId: 'task-2',
    studentId: 's-5',
    replyText: 'Em gửi bài tập toán phần bài 3 và 4, còn bài 5 em đang chỉnh sửa thêm.',
    attachmentsJson: 'https://example.com/bai-tap-5',
    createdAt: '2026-02-15 11:20',
    submittedAt: '2026-02-15 11:20',
    content: 'Em gửi bài tập toán phần bài 3 và 4, còn bài 5 em đang chỉnh sửa thêm.',
    status: 'pending',
  },
];

const initialMessageThreads: Thread[] = [
  {
    id: 'thread-class-11a2',
    threadKey: 'class-11a2',
    participantsJson: JSON.stringify(['TEACHER', 'PARENT', 'STUDENT']),
    lastMessageAt: '2026-02-15 11:20',
    title: 'Kênh chung Lớp 11A2',
    lastMessage: 'Thầy nhắc cả lớp tuần tới chuẩn bị bài thuyết trình nhóm môn Lịch sử nhé!',
    unreadCountAdmin: 0,
    unreadCountUser: 1,
    classId: 'class-11a2',
  },
  {
    id: 'thread-s-1',
    threadKey: 's-1',
    participantsJson: JSON.stringify(['TEACHER', 'PARENT', 'STUDENT']),
    studentId: 's-1',
    parentId: 'p-1',
    title: 'Phụ huynh em Nguyễn Văn An (Bố Hùng)',
    lastMessage: 'Dạ vâng, cảm ơn thầy giáo đã luôn quan tâm sát sao tới cháu An ạ!',
    lastMessageAt: '2026-02-15 10:45',
    unreadCountAdmin: 0,
    unreadCountUser: 0,
  },
  {
    id: 'thread-s-2',
    threadKey: 's-2',
    participantsJson: JSON.stringify(['TEACHER', 'PARENT', 'STUDENT']),
    studentId: 's-2',
    parentId: 'p-2',
    title: 'Phụ huynh em Lê Mai Anh (Mẹ Mai)',
    lastMessage: 'Thầy cho em hỏi lịch bồi dưỡng học sinh giỏi tuần này ạ?',
    lastMessageAt: '2026-02-14 19:20',
    unreadCountAdmin: 1,
    unreadCountUser: 0,
  },
  {
    id: 'thread-s-5',
    threadKey: 's-5',
    participantsJson: JSON.stringify(['TEACHER', 'PARENT', 'STUDENT']),
    studentId: 's-5',
    parentId: 'p-5',
    title: 'Phụ huynh em Hoàng Bảo Nam (Bố Thắng)',
    lastMessage: 'Cháu Nam bảo sáng nay xe hỏng nên đến muộn, gia đình xin lỗi thầy ạ.',
    lastMessageAt: '2026-02-15 08:15',
    unreadCountAdmin: 0,
    unreadCountUser: 0,
  },
  {
    id: 'thread-s-8',
    threadKey: 's-8',
    participantsJson: JSON.stringify(['TEACHER', 'PARENT', 'STUDENT']),
    studentId: 's-8',
    parentId: 'p-8',
    title: 'Phụ huynh em Ngô Gia Bảo (Mẹ Thùy)',
    lastMessage: 'Dạ thưa thầy, em Bảo sáng nay bị sốt virus nên xin phép thầy cho cháu nghỉ hôm nay ạ.',
    lastMessageAt: '2026-02-15 07:05',
    unreadCountAdmin: 0,
    unreadCountUser: 0,
  },
];

const initialMessages: Record<string, Message[]> = {
  'thread-class-11a2': [
    {
      id: 'msg-c1',
      threadId: 'thread-class-11a2',
      fromRole: 'TEACHER',
      senderRole: 'admin',
      senderId: 'teacher',
      senderName: 'Thầy Trần Quang Huy (GVCN)',
      content: 'Chào quý phụ huynh và các em học sinh 11A2. Đây là kênh trao đổi và thông báo chung của lớp.',
      createdAt: '2026-02-15 09:00',
      sentAt: '2026-02-15 09:00',
    },
    {
      id: 'msg-c2',
      threadId: 'thread-class-11a2',
      fromRole: 'PARENT',
      senderRole: 'parent',
      senderId: 'p-1',
      senderName: 'Nguyễn Văn Hùng (PH em An)',
      content: 'Chào Thầy và ban phụ huynh lớp!',
      createdAt: '2026-02-15 09:15',
      sentAt: '2026-02-15 09:15',
    },
    {
      id: 'msg-c3',
      threadId: 'thread-class-11a2',
      fromRole: 'STUDENT',
      senderRole: 'student',
      senderId: 's-1',
      senderName: 'Nguyễn Văn An (Học sinh)',
      content: 'Dạ chúng em chào thầy ạ!',
      createdAt: '2026-02-15 09:20',
      sentAt: '2026-02-15 09:20',
    },
    {
      id: 'msg-c4',
      threadId: 'thread-class-11a2',
      fromRole: 'TEACHER',
      senderRole: 'admin',
      senderId: 'teacher',
      senderName: 'Thầy Trần Quang Huy (GVCN)',
      content: 'Thầy nhắc cả lớp tuần tới chuẩn bị bài thuyết trình nhóm môn Lịch sử nhé!',
      createdAt: '2026-02-15 11:20',
      sentAt: '2026-02-15 11:20',
    },
  ],
  'thread-s-1': [
    {
      id: 'msg-1',
      threadId: 'thread-s-1',
      fromRole: 'TEACHER',
      senderRole: 'admin',
      senderId: 'teacher',
      senderName: 'Thầy Trần Quang Huy',
      content: 'Chào anh Hùng, em An tuần vừa rồi học tập rất xuất sắc, đặc biệt môn Toán và tác phong lớp trưởng rất gương mẫu.',
      createdAt: '2026-02-15 10:30',
      sentAt: '2026-02-15 10:30',
    },
    {
      id: 'msg-2',
      threadId: 'thread-s-1',
      fromRole: 'PARENT',
      senderRole: 'parent',
      senderId: 'p-1',
      senderName: 'Nguyễn Văn Hùng (Phụ huynh)',
      content: 'Dạ vâng, cảm ơn thầy giáo đã luôn quan tâm sát sao tới cháu An ạ! Gia đình rất yên tâm khi cháu được thầy dìu dắt.',
      createdAt: '2026-02-15 10:45',
      sentAt: '2026-02-15 10:45',
    },
  ],
  'thread-s-2': [
    {
      id: 'msg-3',
      threadId: 'thread-s-2',
      fromRole: 'PARENT',
      senderRole: 'parent',
      senderId: 'p-2',
      senderName: 'Lê Thị Mai (Phụ huynh)',
      content: 'Thầy cho em hỏi lịch bồi dưỡng học sinh giỏi tuần này ạ? Cháu Mai Anh có cần chuẩn bị tài liệu gì thêm không thầy?',
      createdAt: '2026-02-14 19:20',
      sentAt: '2026-02-14 19:20',
    },
  ],
  'thread-s-5': [
    {
      id: 'msg-4',
      threadId: 'thread-s-5',
      fromRole: 'TEACHER',
      senderRole: 'admin',
      senderId: 'teacher',
      senderName: 'Thầy Trần Quang Huy',
      content: 'Chào anh Thắng, sáng nay cháu Nam vào lớp muộn 10 phút, thầy nhắc nhở để gia đình phối hợp nhắc cháu đi sớm hơn nhé.',
      createdAt: '2026-02-15 07:45',
      sentAt: '2026-02-15 07:45',
    },
    {
      id: 'msg-5',
      threadId: 'thread-s-5',
      fromRole: 'PARENT',
      senderRole: 'parent',
      senderId: 'p-5',
      senderName: 'Hoàng Đình Thắng (Phụ huynh)',
      content: 'Cháu Nam bảo sáng nay xe hỏng nên đến muộn, gia đình xin lỗi thầy ạ. Tôi sẽ nhắc nhở cháu kiểm tra xe cẩn thận hơn.',
      createdAt: '2026-02-15 08:15',
      sentAt: '2026-02-15 08:15',
    },
  ],
  'thread-s-8': [
    {
      id: 'msg-6',
      threadId: 'thread-s-8',
      fromRole: 'PARENT',
      senderRole: 'parent',
      senderId: 'p-8',
      senderName: 'Ngô Thị Thùy (Phụ huynh)',
      content: 'Dạ thưa thầy, em Bảo sáng nay bị sốt virus nên xin phép thầy cho cháu nghỉ hôm nay ạ. Khi cháu đỡ em sẽ bổ sung đơn xin phép bằng văn bản.',
      createdAt: '2026-02-15 07:05',
      sentAt: '2026-02-15 07:05',
    },
    {
      id: 'msg-7',
      threadId: 'thread-s-8',
      fromRole: 'TEACHER',
      senderRole: 'admin',
      senderId: 'teacher',
      senderName: 'Thầy Trần Quang Huy',
      content: 'Thầy đã nhận được thông tin và xác nhận phép nghỉ cho em Bảo. Chúc em nhanh bình phục sức khỏe để sớm trở lại trường!',
      createdAt: '2026-02-15 07:15',
      sentAt: '2026-02-15 07:15',
    },
  ],
};

const initialDocuments: Document[] = [
  {
    id: 'doc-1',
    classId: 'class-11a2',
    title: 'Thời khóa biểu Học kỳ 2 - Năm học 2025 - 2026 (Áp dụng từ 15/01/2026)',
    url: 'https://example.com/docs/TKB_HK2_ChuVanAn_11A2.pdf',
    category: 'schedule',
    createdAt: '2026-01-15',
    fileUrl: 'https://example.com/docs/TKB_HK2_ChuVanAn_11A2.pdf',
    fileSize: '1.4 MB',
    uploadedAt: '2026-01-15',
    description: 'Bản phân công tiết học chính khóa buổi sáng và ôn luyện chuyên đề các buổi chiều trong tuần.',
  },
  {
    id: 'doc-2',
    classId: 'class-11a2',
    title: 'Nội quy lớp học & Quy chế thi đua rèn luyện Lớp 11A2',
    url: 'https://example.com/docs/Noi_quy_va_Quy_che_ren_luyen_11A2.pdf',
    category: 'rules',
    createdAt: '2025-09-05',
    fileUrl: 'https://example.com/docs/Noi_quy_va_Quy_che_ren_luyen_11A2.pdf',
    fileSize: '950 KB',
    uploadedAt: '2025-09-05',
    description: 'Quy định về nếp sống văn minh, trang phục đồng phục, tiêu chuẩn đánh giá hạnh kiểm từng học sinh.',
  },
  {
    id: 'doc-3',
    classId: 'class-11a2',
    title: 'Mẫu đơn xin phép vắng học (Bản chuẩn của trường THPT Chu Văn An)',
    url: 'https://example.com/docs/Mau_don_xin_nghi_hoc_CMHS.docx',
    category: 'forms',
    createdAt: '2025-09-10',
    fileUrl: 'https://example.com/docs/Mau_don_xin_nghi_hoc_CMHS.docx',
    fileSize: '320 KB',
    uploadedAt: '2025-09-10',
    description: 'Mẫu đơn dành cho Phụ huynh học sinh khi cần xin nghỉ học từ 1 đến 3 ngày có xác nhận của CMHS.',
  },
  {
    id: 'doc-4',
    classId: 'class-11a2',
    title: 'Kế hoạch công tác chủ nhiệm & Hoạt động trải nghiệm sáng tạo HK2',
    url: 'https://example.com/docs/Ke_hoach_trai_nghiem_va_chu_nhiem_HK2.pdf',
    category: 'plan',
    createdAt: '2026-01-20',
    fileUrl: 'https://example.com/docs/Ke_hoach_trai_nghiem_va_chu_nhiem_HK2.pdf',
    fileSize: '2.1 MB',
    uploadedAt: '2026-01-20',
    description: 'Lộ trình tổ chức sinh hoạt chủ điểm, hướng nghiệp và chuyến dã ngoại bảo tàng lịch sử.',
  },
  {
    id: 'doc-5',
    classId: 'class-11a2',
    title: 'Đề cương & Ngân hàng câu hỏi ôn tập môn Toán giữa học kỳ 2',
    url: 'https://example.com/docs/De_cuong_on_tap_Toan_giua_HK2.pdf',
    category: 'syllabus',
    createdAt: '2026-02-05',
    fileUrl: 'https://example.com/docs/De_cuong_on_tap_Toan_giua_HK2.pdf',
    fileSize: '3.2 MB',
    uploadedAt: '2026-02-05',
    description: 'Tài liệu hướng dẫn tự học phần Dãy số, Cấp số nhân và Giới hạn hàm số.',
  },
  {
    id: 'doc-6',
    classId: 'class-11a2',
    title: 'Mẫu phiếu đăng ký đóng góp ý kiến xây dựng lớp & Bầu ban đại diện CMHS',
    url: 'https://example.com/docs/Phieu_y_kien_CMHS_11A2.pdf',
    category: 'forms',
    createdAt: '2026-02-08',
    fileUrl: 'https://example.com/docs/Phieu_y_kien_CMHS_11A2.pdf',
    fileSize: '450 KB',
    uploadedAt: '2026-02-08',
    description: 'Mẫu biểu phiếu thu thập nguyện vọng và đề xuất của phụ huynh học sinh.',
  },
  {
    id: 'doc-7',
    classId: 'class-11a1',
    title: 'Kế hoạch ôn tập kiểm tra đánh giá định kỳ Lớp 11A1',
    url: 'https://example.com/docs/Ke_hoach_on_tap_11A1.pdf',
    category: 'plan',
    createdAt: '2026-02-02',
    fileUrl: 'https://example.com/docs/Ke_hoach_on_tap_11A1.pdf',
    fileSize: '1.1 MB',
    uploadedAt: '2026-02-02',
    description: 'Khung ma trận đề kiểm tra và thời lượng ôn tập trọng tâm.',
  },
];

const initialReports: Report[] = [
  {
    id: 'rep-w25',
    type: 'weekly',
    period: 'Tuần 25 (09/02 - 14/02/2026)',
    title: 'Báo cáo tổng kết tuần 25 - Lớp 11A2',
    summary: {
      attendanceRate: 98.6,
      totalBehaviorsPositive: 12,
      totalBehaviorsNegative: 2,
      totalAnnouncements: 2,
      completedTasksRate: 91.7,
    },
    highlights: [
      'Nề nếp chuyên cần giữ vững ở mức xuất sắc, chỉ có 1 trường hợp đi muộn do sự cố phương tiện.',
      'Phong trào phát biểu xây dựng bài diễn ra sôi nổi ở hầu hết các bộ môn Tự nhiên.',
      'Chi đoàn hoàn thành xuất sắc bản kế hoạch hoạt động ngoại khóa 26/3.',
    ],
    recommendations: [
      'Nhắc nhở học sinh mang đầy đủ đồ dùng học tập bộ môn Hóa học và Sinh học.',
      'Khuyến khích các bạn trong tổ 3 nâng cao tinh thần làm việc nhóm hơn nữa.',
    ],
    generatedAt: '2026-02-14 17:00',
  },
  {
    id: 'rep-m01',
    type: 'monthly',
    period: 'Tháng 01/2026',
    title: 'Báo cáo nề nếp & học tập tháng 01/2026',
    summary: {
      attendanceRate: 97.8,
      totalBehaviorsPositive: 38,
      totalBehaviorsNegative: 6,
      totalAnnouncements: 4,
      completedTasksRate: 88.5,
    },
    highlights: [
      'Lớp 11A2 xếp thứ Nhì toàn trường về phong trào thi đua hoa điểm tốt trong tháng 1.',
      'Em Dương Quốc Tuấn và đội thi Robocon mang về giải Nhì cấp trường.',
      '100% học sinh chấp hành nghiêm chỉnh an toàn giao thông và quy chế thi cử.',
    ],
    recommendations: [
      'Đẩy mạnh công tác kèm cặp học sinh yếu môn Tiếng Anh và Ngữ văn.',
      'Chuẩn bị chu đáo cho kỳ thi giữa kỳ 2 sắp tới.',
    ],
    generatedAt: '2026-01-31 18:30',
  },
];

class MockDataProvider implements DataProvider {
  private getStorageKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  private read<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.getStorageKey(key));
      if (!item) return defaultValue;
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  }

  private write<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(value));
    } catch (err) {
      console.error('Error writing to localStorage:', err);
    }
  }

  public async seedData(force = false): Promise<void> {
    const isSeeded = localStorage.getItem(this.getStorageKey('initialized'));
    if (!isSeeded || force) {
      this.write('classes', initialClasses);
      this.write('classInfo', initialClassInfo);
      this.write('parents', initialParents);
      this.write('students', initialStudents);
      this.write('attendance', initialAttendance);
      this.write('behaviors', initialBehaviors);
      this.write('announcements', initialAnnouncements);
      this.write('tasks', initialTasks);
      this.write('taskReplies', initialTaskReplies);
      this.write('messageThreads', initialMessageThreads);
      this.write('messages', initialMessages);
      this.write('documents', initialDocuments);
      this.write('reports', initialReports);
      this.write('initialized', 'true');
    }
  }

  public normalizeClass(c: any): ClassInfo {
    if (!c) return c;
    const className = c.className || c.name || 'Lớp chưa đặt tên';
    const name = c.name || c.className || className;
    const schoolYear = c.schoolYear || c.academicYear || '2025 - 2026';
    const academicYear = c.academicYear || c.schoolYear || schoolYear;
    let homeroomTeacher = c.homeroomTeacher;
    if (typeof homeroomTeacher === 'string') {
      homeroomTeacher = {
        name: homeroomTeacher,
        phone: '',
        email: '',
        subject: 'Chủ nhiệm',
      };
    } else if (!homeroomTeacher) {
      homeroomTeacher = {
        name: 'Chưa phân công',
        phone: '',
        email: '',
        subject: 'Chủ nhiệm',
      };
    }
    return {
      ...c,
      className,
      name,
      schoolYear,
      academicYear,
      homeroomTeacher,
      note: c.note || '',
    };
  }

  constructor() {
    this.seedData(false);
  }

  // Generic CRUD
  public async list<T = any>(resource: string, query?: Record<string, any>): Promise<T[]> {
    await this.seedData(false);
    let items = this.read<T[]>(resource, []);
    if (resource === 'classes') {
      if (!items || items.length === 0) {
        items = initialClasses as unknown as T[];
        this.write('classes', items);
      }
      items = items.map((c: any) => this.normalizeClass(c)) as unknown as T[];
    }
    if (!query) return items;

    return items.filter((item: any) => {
      for (const key of Object.keys(query)) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  public async get<T = any>(resource: string, id: string): Promise<T | null> {
    await this.seedData(false);
    const items = await this.list<any>(resource);
    return (items.find((item) => item.id === id) as T) || null;
  }

  public async add<T = any>(resource: string, item: Omit<T, 'id'>): Promise<T> {
    await this.seedData(false);
    const items = this.read<any[]>(resource, []);
    let itemToSave: any = { ...item };
    if (resource === 'classes') {
      itemToSave = this.normalizeClass(itemToSave);
    }
    if (resource === 'parents') {
      if (itemToSave.studentId && (!itemToSave.studentIds || itemToSave.studentIds.length === 0)) {
        itemToSave.studentIds = [itemToSave.studentId];
      } else if (itemToSave.studentIds && itemToSave.studentIds.length > 0 && !itemToSave.studentId) {
        itemToSave.studentId = itemToSave.studentIds[0];
      }
    }
    const newItem = {
      ...itemToSave,
      id: `${resource.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    } as unknown as T;
    items.unshift(newItem);
    this.write(resource, items);

    if (resource === 'classes') {
      const currentClass = this.read<ClassInfo | null>('classInfo', null);
      if (!currentClass) {
        this.write('classInfo', newItem);
      }
    }
    return newItem;
  }

  public async update<T = any>(resource: string, id: string, patch: Partial<T>): Promise<T> {
    await this.seedData(false);
    const items = this.read<any[]>(resource, []);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Resource ${resource} with id ${id} not found`);
    }
    let updated: any = { ...items[index], ...patch };
    if (resource === 'classes') {
      updated = this.normalizeClass(updated);
    }
    if (resource === 'parents') {
      if (updated.studentId && (!updated.studentIds || updated.studentIds.length === 0)) {
        updated.studentIds = [updated.studentId];
      } else if (updated.studentIds && updated.studentIds.length > 0 && !updated.studentId) {
        updated.studentId = updated.studentIds[0];
      }
    }
    items[index] = updated;
    this.write(resource, items);

    if (resource === 'classes') {
      const currentClass = this.read<ClassInfo | null>('classInfo', null);
      if (currentClass && currentClass.id === id) {
        this.write('classInfo', updated);
      }
    }
    return updated as T;
  }

  public async remove(resource: string, id: string): Promise<boolean> {
    await this.seedData(false);
    const items = this.read<any[]>(resource, []);
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length !== items.length) {
      this.write(resource, filtered);
      return true;
    }
    return false;
  }

  // Specific domain methods
  public async markAttendance(
    payload:
      | MarkAttendanceParams
      | { studentId: string; date: string; status: AttendanceStatus; note?: string; classId?: string }[]
  ): Promise<Attendance[]> {
    await this.seedData(false);
    const allAttendance = this.read<Attendance[]>('attendance', []);
    const students = this.read<Student[]>('students', []);
    const studentMap = new Map(students.map((s) => [s.id, s]));

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const result: Attendance[] = [];

    let targetClassId = '';
    let targetDate = '';
    let itemsToProcess: {
      studentId: string;
      status: AttendanceStatus;
      note?: string;
      date?: string;
      classId?: string;
    }[] = [];

    if (Array.isArray(payload)) {
      itemsToProcess = payload;
    } else {
      targetClassId = payload.classId;
      targetDate = payload.date;
      itemsToProcess = payload.items.map((it) => ({
        ...it,
        classId: targetClassId,
        date: targetDate,
      }));
    }

    for (const rec of itemsToProcess) {
      const recDate = rec.date || targetDate || getTodayString(0);
      const student = studentMap.get(rec.studentId);
      const recClassId = rec.classId || targetClassId || student?.classId || 'class-11a2';

      const existingIndex = allAttendance.findIndex(
        (a) => a.studentId === rec.studentId && a.date === recDate
      );

      if (existingIndex >= 0) {
        allAttendance[existingIndex] = {
          ...allAttendance[existingIndex],
          classId: recClassId,
          status: rec.status,
          note: rec.note !== undefined ? rec.note : allAttendance[existingIndex].note,
        };
        result.push(allAttendance[existingIndex]);
      } else {
        const newAtt: Attendance = {
          id: `att-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          classId: recClassId,
          studentId: rec.studentId,
          date: recDate,
          status: rec.status,
          note: rec.note || '',
          recordedAt: timeStr,
        };
        allAttendance.push(newAtt);
        result.push(newAtt);
      }
    }

    this.write('attendance', allAttendance);
    return result;
  }

  public async addBehavior(behavior: Omit<Behavior, 'id'>): Promise<Behavior> {
    const content = behavior.content || behavior.title || behavior.description || '';
    const type = behavior.type === 'WARN' || behavior.type === 'negative' ? 'WARN' : 'PRAISE';
    const points = typeof behavior.points === 'number' ? behavior.points : (type === 'PRAISE' ? 5 : -2);
    
    return this.add<Behavior>('behaviors', {
      ...behavior,
      content,
      title: behavior.title || (type === 'PRAISE' ? 'Khen thưởng rèn luyện' : 'Nhắc nhở nề nếp'),
      type,
      points,
    });
  }

  public async updateBehavior(id: string, updates: Partial<Behavior>): Promise<Behavior> {
    const updated = await this.update<Behavior>('behaviors', id, updates);
    return updated;
  }

  public async deleteBehavior(id: string): Promise<boolean> {
    return this.remove('behaviors', id);
  }

  public async sendMessage(
    threadId: string,
    message: Partial<Message> & { content: string; fromRole?: string; senderRole?: string; senderName?: string; senderId?: string }
  ): Promise<Message> {
    await this.seedData(false);
    const messagesDict = this.read<Record<string, Message[]>>('messages', {});
    const threadMessages = messagesDict[threadId] || [];

    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    // Determine fromRole: 'TEACHER' | 'PARENT' | 'STUDENT'
    let fromRole: 'TEACHER' | 'PARENT' | 'STUDENT' = 'PARENT';
    if (message.fromRole === 'TEACHER' || message.senderRole === 'admin') {
      fromRole = 'TEACHER';
    } else if (message.fromRole === 'STUDENT' || message.senderRole === 'student') {
      fromRole = 'STUDENT';
    } else if (message.fromRole === 'PARENT' || message.senderRole === 'parent') {
      fromRole = 'PARENT';
    }

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      threadId,
      fromRole,
      content: message.content,
      createdAt,
      sentAt: createdAt,
      senderRole: fromRole === 'TEACHER' ? 'admin' : fromRole === 'STUDENT' ? 'student' : 'parent',
      senderName: message.senderName,
      senderId: message.senderId,
    };

    threadMessages.push(newMsg);
    messagesDict[threadId] = threadMessages;
    this.write('messages', messagesDict);

    // Update the message thread or create if missing
    const threads = this.read<Thread[]>('messageThreads', []);
    const threadIdx = threads.findIndex((t) => t.id === threadId);
    if (threadIdx >= 0) {
      threads[threadIdx].lastMessage = message.content;
      threads[threadIdx].lastMessageAt = createdAt;
      if (fromRole === 'TEACHER') {
        threads[threadIdx].unreadCountUser = (threads[threadIdx].unreadCountUser || 0) + 1;
      } else {
        threads[threadIdx].unreadCountAdmin = (threads[threadIdx].unreadCountAdmin || 0) + 1;
      }
    } else {
      const key = threadId.startsWith('thread-') ? threadId.replace('thread-', '') : threadId;
      threads.push({
        id: threadId,
        threadKey: key,
        participantsJson: JSON.stringify(['TEACHER', 'PARENT', 'STUDENT']),
        lastMessageAt: createdAt,
        title: message.senderName ? `Trao đổi với ${message.senderName}` : `Cuộc trò chuyện (${key})`,
        lastMessage: message.content,
        unreadCountAdmin: fromRole === 'TEACHER' ? 0 : 1,
        unreadCountUser: fromRole === 'TEACHER' ? 1 : 0,
        studentId: key.startsWith('s-') ? key : undefined,
        classId: key.startsWith('class-') ? key : undefined,
      });
    }
    this.write('messageThreads', threads);

    return newMsg;
  }

  public async replyTask(
    taskIdOrPayload: string | (Partial<TaskReply> & { taskId: string; studentId: string }),
    payload?: Partial<TaskReply>
  ): Promise<TaskReply> {
    await this.seedData(false);
    let taskId: string;
    let studentId: string;
    let parentId: string | undefined;
    let replyText: string;
    let attachmentsJson: string | undefined;

    if (typeof taskIdOrPayload === 'string') {
      taskId = taskIdOrPayload;
      studentId = payload?.studentId || '';
      parentId = payload?.parentId;
      replyText = payload?.replyText || (payload as any)?.content || '';
      attachmentsJson = payload?.attachmentsJson;
    } else {
      taskId = taskIdOrPayload.taskId;
      studentId = taskIdOrPayload.studentId;
      parentId = taskIdOrPayload.parentId;
      replyText = taskIdOrPayload.replyText || taskIdOrPayload.content || '';
      attachmentsJson = taskIdOrPayload.attachmentsJson;
    }

    const replies = this.read<TaskReply[]>('taskReplies', []);
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const existingIndex = replies.findIndex(
      (r) => r.taskId === taskId && r.studentId === studentId
    );

    if (existingIndex >= 0) {
      const updated: TaskReply = {
        ...replies[existingIndex],
        replyText,
        content: replyText,
        attachmentsJson: attachmentsJson ?? replies[existingIndex].attachmentsJson,
        createdAt,
        submittedAt: createdAt,
        status: 'completed',
        parentId: parentId || replies[existingIndex].parentId,
      };
      replies[existingIndex] = updated;
      this.write('taskReplies', replies);
      return updated;
    }

    const newReply: TaskReply = {
      id: `reply-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      taskId,
      studentId,
      parentId,
      replyText,
      content: replyText,
      attachmentsJson: attachmentsJson || '',
      createdAt,
      submittedAt: createdAt,
      status: 'completed',
    };
    replies.unshift(newReply);
    this.write('taskReplies', replies);
    return newReply;
  }

  public async reportsWeekly(week: number, year: number): Promise<Report> {
    await this.seedData(false);
    const students = await this.getStudents();
    const attendance = await this.getAttendance();
    const behaviors = await this.getBehaviors();
    const tasks = await this.getTasks();
    const replies = await this.getTaskReplies();

    const positiveBehaviors = behaviors.filter((b) => b.type === 'positive' || b.type === 'PRAISE').length;
    const negativeBehaviors = behaviors.filter((b) => b.type === 'negative' || b.type === 'WARN').length;

    const totalAttendanceDays = attendance.length || 1;
    const presentCount = attendance.filter(
      (a) => a.status === 'PRESENT' || a.status === 'present' || a.status === 'LATE' || a.status === 'late'
    ).length;
    const attendanceRate = Math.round((presentCount / totalAttendanceDays) * 1000) / 10;

    const totalRepliesNeeded = (tasks.length || 1) * (students.length || 1);
    const completedTasksRate = Math.min(
      100,
      Math.round((replies.length / totalRepliesNeeded) * 1000) / 10
    );

    const report: Report = {
      id: `rep-w${week}-${year}-${Date.now()}`,
      type: 'weekly',
      period: `Tuần ${week}/${year}`,
      title: `Báo cáo tổng kết tuần ${week} - Năm ${year}`,
      summary: {
        attendanceRate: attendanceRate || 98.2,
        totalBehaviorsPositive: positiveBehaviors,
        totalBehaviorsNegative: negativeBehaviors,
        totalAnnouncements: (await this.getAnnouncements()).length,
        completedTasksRate: completedTasksRate || 85,
      },
      highlights: [
        `Tỉ lệ chuyên cần đạt ${attendanceRate || 98.2}%, nếp sống văn minh được duy trì tốt.`,
        `Ghi nhận ${positiveBehaviors} việc tốt và điểm cộng học tập trong tuần.`,
        'Các ban cán sự tổ hoàn thành tốt nhiệm vụ trực nhật và bảo quản cơ sở vật chất.',
      ],
      recommendations: [
        negativeBehaviors > 0
          ? `Cần nhắc nhở kịp thời ${negativeBehaviors} trường hợp vi phạm quy chế hoặc đi học muộn.`
          : 'Tiếp tục phát huy tinh thần tự giác trong các giờ tự quản.',
        'Đôn đốc học sinh hoàn thành các nhiệm vụ khảo sát và bài tập đúng thời hạn.',
      ],
      generatedAt: new Date().toLocaleString('vi-VN'),
    };

    const reports = this.read<Report[]>('reports', []);
    reports.unshift(report);
    this.write('reports', reports);
    return report;
  }

  public async reportsMonthly(month: number, year: number): Promise<Report> {
    await this.seedData(false);
    const students = await this.getStudents();
    const attendance = await this.getAttendance();
    const behaviors = await this.getBehaviors();
    const tasks = await this.getTasks();
    const replies = await this.getTaskReplies();

    const positiveBehaviors = behaviors.filter((b) => b.type === 'positive' || b.type === 'PRAISE').length;
    const negativeBehaviors = behaviors.filter((b) => b.type === 'negative' || b.type === 'WARN').length;

    const totalAttendanceDays = attendance.length || 1;
    const presentCount = attendance.filter(
      (a) => a.status === 'PRESENT' || a.status === 'present' || a.status === 'LATE' || a.status === 'late'
    ).length;
    const attendanceRate = Math.round((presentCount / totalAttendanceDays) * 1000) / 10;

    const totalRepliesNeeded = (tasks.length || 1) * (students.length || 1);
    const completedTasksRate = Math.min(
      100,
      Math.round((replies.length / totalRepliesNeeded) * 1000) / 10
    );

    const report: Report = {
      id: `rep-m${month}-${year}-${Date.now()}`,
      type: 'monthly',
      period: `Tháng ${String(month).padStart(2, '0')}/${year}`,
      title: `Báo cáo đánh giá nề nếp & phong trào tháng ${month}/${year}`,
      summary: {
        attendanceRate: attendanceRate || 97.5,
        totalBehaviorsPositive: positiveBehaviors,
        totalBehaviorsNegative: negativeBehaviors,
        totalAnnouncements: (await this.getAnnouncements()).length,
        completedTasksRate: completedTasksRate || 88,
      },
      highlights: [
        `Tập thể duy trì tỉ lệ chuyên cần ${attendanceRate || 97.5}% ổn định trong suốt tháng.`,
        `Phong trào thi đua ghi nhận ${positiveBehaviors} lượt khen thưởng và điểm cộng môn học.`,
        'Ban đại diện CMHS phối hợp chặt chẽ với nhà trường trong mọi hoạt động ngoại khóa.',
      ],
      recommendations: [
        'Tập trung cao độ cho công tác ôn tập các môn thi giữa kỳ.',
        'Họp ban cán sự để sơ kết các hoạt động nề nếp tháng và khen thưởng tổ dẫn đầu.',
      ],
      generatedAt: new Date().toLocaleString('vi-VN'),
    };

    const reports = this.read<Report[]>('reports', []);
    reports.unshift(report);
    this.write('reports', reports);
    return report;
  }

  // Convenience entity getters
  public async getClasses(): Promise<ClassInfo[]> {
    return this.list<ClassInfo>('classes');
  }

  public async getClassInfo(): Promise<ClassInfo> {
    await this.seedData(false);
    const info = this.read<ClassInfo>('classInfo', initialClassInfo);
    return this.normalizeClass(info);
  }

  public async updateClassInfo(info: Partial<ClassInfo>): Promise<ClassInfo> {
    const current = await this.getClassInfo();
    const updated = this.normalizeClass({ ...current, ...info });
    this.write('classInfo', updated);

    // Also sync in classes array
    const classes = this.read<ClassInfo[]>('classes', initialClasses);
    const idx = classes.findIndex((c) => c.id === updated.id);
    if (idx !== -1) {
      classes[idx] = updated;
      this.write('classes', classes);
    }

    return updated;
  }

  public async getStudents(classId?: string): Promise<Student[]> {
    const students = await this.list<Student>('students');
    if (classId && classId !== 'all') {
      return students.filter((s) => s.classId === classId);
    }
    return students;
  }

  public async getParents(): Promise<Parent[]> {
    return this.list<Parent>('parents');
  }

  public async getAnnouncements(classId?: string): Promise<Announcement[]> {
    const list = await this.list<Announcement>('announcements');
    const normalized = list.map((a) => ({
      ...a,
      classId: a.classId || 'class-11a2',
      target: a.target || 'all',
      pinned: a.pinned === true,
      createdAt: a.createdAt || '2026-02-14 08:00',
    }));
    if (classId && classId !== 'all') {
      return normalized.filter(
        (a) => a.classId === classId || a.classId === 'all' || !a.classId
      );
    }
    return normalized;
  }

  public async getTasks(classId?: string): Promise<Task[]> {
    const list = await this.list<Task>('tasks');
    const normalized = list.map((t) => ({
      ...t,
      classId: t.classId || 'class-11a2',
      requireReply: t.requireReply !== undefined ? t.requireReply : true,
      createdAt: t.createdAt || '2026-02-10',
      status: t.status || 'open',
      type: t.type || 'assignment',
    }));
    if (classId && classId !== 'all') {
      return normalized.filter((t) => t.classId === classId || t.classId === 'all');
    }
    return normalized;
  }

  public async getTaskReplies(taskId?: string): Promise<TaskReply[]> {
    const replies = await this.list<TaskReply>('taskReplies');
    const normalized = replies.map((r) => ({
      ...r,
      replyText: r.replyText || r.content || '',
      content: r.content || r.replyText || '',
      attachmentsJson: r.attachmentsJson || (r.attachments ? JSON.stringify(r.attachments) : ''),
      createdAt: r.createdAt || r.submittedAt || '2026-02-14 18:00',
      submittedAt: r.submittedAt || r.createdAt || '2026-02-14 18:00',
      status: r.status || 'completed',
    }));
    if (taskId) {
      return normalized.filter((r) => r.taskId === taskId);
    }
    return normalized;
  }

  public async getAttendance(date?: string): Promise<Attendance[]> {
    const list = await this.list<Attendance>('attendance');
    if (date) {
      return list.filter((a) => a.date === date);
    }
    return list;
  }

  public async listAttendanceByStudent(
    studentId: string,
    range?: AttendanceRange
  ): Promise<Attendance[]> {
    await this.seedData(false);
    const all = this.read<Attendance[]>('attendance', []);
    let filtered = all.filter((a) => a.studentId === studentId);

    if (range) {
      if (typeof range === 'string') {
        if (range === 'all') {
          // Keep all
        } else if (range === 'week') {
          // Current week Monday to Sunday
          const now = new Date();
          const day = now.getDay();
          const diffToMon = (day === 0 ? -6 : 1) - day;
          const monday = new Date(now);
          monday.setDate(now.getDate() + diffToMon);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);

          const fromStr = monday.toISOString().split('T')[0];
          const toStr = sunday.toISOString().split('T')[0];
          filtered = filtered.filter((a) => a.date >= fromStr && a.date <= toStr);
        } else if (range === 'month') {
          const prefix = new Date().toISOString().substring(0, 7); // YYYY-MM
          filtered = filtered.filter((a) => a.date.startsWith(prefix));
        } else {
          filtered = filtered.filter((a) => a.date.startsWith(range));
        }
      } else {
        if (range.from) {
          filtered = filtered.filter((a) => a.date >= range.from!);
        }
        if (range.to) {
          filtered = filtered.filter((a) => a.date <= range.to!);
        }
        if (range.month) {
          filtered = filtered.filter((a) => a.date.startsWith(range.month!));
        }
        if (range.year && !range.month) {
          filtered = filtered.filter((a) => a.date.startsWith(String(range.year)));
        }
      }
    }

    filtered.sort((a, b) => b.date.localeCompare(a.date));
    return filtered;
  }

  public async getBehaviors(studentId?: string, range?: BehaviorRange): Promise<Behavior[]> {
    await this.seedData(false);
    let list = await this.list<Behavior>('behaviors');
    if (studentId && studentId !== 'all') {
      list = list.filter((b) => b.studentId === studentId);
    }
    if (range) {
      if (typeof range === 'string') {
        if (range === 'week') {
          const now = new Date();
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(now);
          monday.setDate(diff);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          const monStr = monday.toISOString().split('T')[0];
          const sunStr = sunday.toISOString().split('T')[0];
          list = list.filter((b) => b.date >= monStr && b.date <= sunStr);
        } else if (range === 'month') {
          const curMonth = new Date().toISOString().substring(0, 7);
          list = list.filter((b) => b.date.startsWith(curMonth));
        }
      } else {
        if (range.week) {
          const now = new Date();
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(now);
          monday.setDate(diff);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          const monStr = monday.toISOString().split('T')[0];
          const sunStr = sunday.toISOString().split('T')[0];
          list = list.filter((b) => b.date >= monStr && b.date <= sunStr);
        }
        if (range.from) {
          list = list.filter((b) => b.date >= range.from!);
        }
        if (range.to) {
          list = list.filter((b) => b.date <= range.to!);
        }
        if (range.month) {
          list = list.filter((b) => b.date.startsWith(range.month!));
        }
      }
    }
    list = list.map((b) => ({
      ...b,
      content: b.content || b.description || b.title || '',
      type: b.type === 'WARN' || b.type === 'negative' ? 'WARN' : 'PRAISE',
    }));
    list.sort((a, b) => b.date.localeCompare(a.date));
    return list;
  }

  public async getThreads(threadKey?: string): Promise<Thread[]> {
    await this.seedData(false);
    const list = this.read<Thread[]>('messageThreads', []);
    const normalized = list.map((t) => ({
      ...t,
      threadKey: t.threadKey || t.studentId || t.classId || t.id.replace('thread-', ''),
      participantsJson: t.participantsJson || JSON.stringify(['TEACHER', 'PARENT', 'STUDENT']),
      lastMessageAt: t.lastMessageAt || '2026-02-15 10:00',
    }));
    if (threadKey) {
      return normalized.filter((t) => t.threadKey === threadKey);
    }
    return normalized;
  }

  public async getOrCreateThread(threadKey: string, title?: string): Promise<Thread> {
    await this.seedData(false);
    const threads = await this.getThreads();
    const existing = threads.find((t) => t.threadKey === threadKey || t.id === `thread-${threadKey}`);
    if (existing) return existing;

    const now = new Date();
    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newThread: Thread = {
      id: `thread-${threadKey}`,
      threadKey,
      participantsJson: JSON.stringify(['TEACHER', 'PARENT', 'STUDENT']),
      lastMessageAt: nowStr,
      title: title || (threadKey.startsWith('class-') ? `Kênh thảo luận ${threadKey}` : `Học sinh ${threadKey}`),
      lastMessage: 'Cuộc trò chuyện mới',
      unreadCountAdmin: 0,
      unreadCountUser: 0,
      studentId: threadKey.startsWith('s-') ? threadKey : undefined,
      classId: threadKey.startsWith('class-') ? threadKey : undefined,
    };

    const current = this.read<Thread[]>('messageThreads', []);
    current.push(newThread);
    this.write('messageThreads', current);
    return newThread;
  }

  public async getMessageThreads(): Promise<Thread[]> {
    return this.getThreads();
  }

  public async listMessages(threadId: string): Promise<Message[]> {
    await this.seedData(false);
    const messagesDict = this.read<Record<string, any[]>>('messages', {});
    const rawList = messagesDict[threadId] || [];
    return rawList.map((m) => {
      const fromRole =
        m.fromRole ||
        (m.senderRole === 'admin' ? 'TEACHER' : m.senderRole === 'student' ? 'STUDENT' : 'PARENT');
      const createdAt = m.createdAt || m.sentAt || '2026-02-15 10:00';
      return {
        id: m.id,
        threadId: m.threadId || threadId,
        fromRole,
        content: m.content || '',
        createdAt,
        sentAt: m.sentAt || createdAt,
        senderRole: m.senderRole || (fromRole === 'TEACHER' ? 'admin' : fromRole === 'STUDENT' ? 'student' : 'parent'),
        senderName: m.senderName,
        senderId: m.senderId,
      };
    });
  }

  public async getMessages(threadId: string): Promise<Message[]> {
    return this.listMessages(threadId);
  }

  public async getDocuments(classId?: string): Promise<Document[]> {
    const list = await this.list<Document>('documents');
    const normalized = list.map((d) => ({
      ...d,
      classId: d.classId || 'class-11a2',
      url: d.url || d.fileUrl || 'https://example.com/docs/tailieu.pdf',
      category: d.category || 'other',
      createdAt: d.createdAt || d.uploadedAt || '2026-02-01',
    }));
    if (classId && classId !== 'all') {
      return normalized.filter(
        (d) => d.classId === classId || d.classId === 'all' || !d.classId
      );
    }
    return normalized;
  }

  public async getReports(): Promise<Report[]> {
    return this.list<Report>('reports');
  }
}

export const mockProvider = new MockDataProvider();
