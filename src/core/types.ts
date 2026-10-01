export interface HomeroomTeacherDetails {
  name: string;
  phone?: string;
  email?: string;
  subject?: string;
  avatar?: string;
}

export interface ClassInfo {
  id: string;
  className: string;
  name?: string; // alias for backward compatibility
  schoolYear: string;
  academicYear?: string; // alias for backward compatibility
  homeroomTeacher: HomeroomTeacherDetails;
  note?: string;
  grade?: string;
  room?: string;
  totalStudents?: number;
  schoolName?: string;
}

export interface Student {
  id: string;
  classId?: string;
  rollNumber?: number;
  fullName: string;
  gender: 'Nam' | 'Nữ';
  dob: string; // YYYY-MM-DD
  address: string;
  parentId: string;
  status: 'active' | 'transferred' | 'leave';
  avatar?: string;
  notes?: string;
  group?: string; // Tổ 1, Tổ 2, Tổ 3, Tổ 4
  position?: string; // Lớp trưởng, Lớp phó, Tổ trưởng, Bí thư, Học sinh
}

export interface Parent {
  id: string;
  fullName: string;
  relationship: 'Bố' | 'Mẹ' | 'Người giám hộ';
  phone: string;
  email?: string;
  occupation?: string;
  studentId?: string;
  studentIds?: string[];
}

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'present'
  | 'absent_excused'
  | 'absent_unexcused'
  | 'late';

export interface Attendance {
  id: string;
  classId?: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
  recordedAt?: string;
}

export interface MarkAttendanceParams {
  classId: string;
  date: string;
  items: {
    studentId: string;
    status: AttendanceStatus;
    note?: string;
  }[];
}

export type AttendanceRange =
  | {
      from?: string; // YYYY-MM-DD
      to?: string;   // YYYY-MM-DD
      month?: string; // YYYY-MM
      week?: number;
      year?: number;
      type?: 'week' | 'month' | 'all';
    }
  | string;

export type BehaviorType = 'PRAISE' | 'WARN' | 'positive' | 'negative' | 'neutral';

export type BehaviorRange =
  | 'week'
  | 'month'
  | 'all'
  | { from?: string; to?: string; month?: string; week?: boolean };

export interface Behavior {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  type: BehaviorType; // PRAISE | WARN
  content: string;
  points: number; // e.g. +5, -2
  title?: string;
  description?: string;
  recordedBy?: string;
  isSensitive?: boolean;
  classId?: string;
}

export type AnnouncementTarget = 'parent' | 'student' | 'all';
export type AnnouncementCategory = 'urgent' | 'general' | 'event' | 'fees';

export interface AnnouncementAttachment {
  name: string;
  url: string;
  size?: string;
}

export interface Announcement {
  id: string;
  classId?: string; // class identifier e.g. 'class-11a2' or 'all'
  title: string;
  content: string;
  target?: AnnouncementTarget; // 'parent' | 'student' | 'all'
  pinned?: boolean;
  createdAt: string; // ISO date or formatted
  category?: AnnouncementCategory;
  author?: string;
  attachments?: AnnouncementAttachment[];
}

export type TaskType = 'assignment' | 'survey' | 'form' | 'fee';
export type TaskStatus = 'open' | 'closed';

export interface Task {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD or datetime
  requireReply: boolean; // boolean
  createdAt: string;
  assignedTo?: 'all' | string[]; // backwards compatibility
  status?: TaskStatus; // backwards compatibility
  type?: TaskType; // backwards compatibility
}

export type TaskReplyStatus = 'completed' | 'pending' | 'rejected';

export interface TaskReply {
  id: string;
  taskId: string;
  studentId: string;
  parentId?: string;
  replyText: string;
  attachmentsJson?: string;
  createdAt: string;
  // backwards compatibility
  content?: string;
  submittedAt?: string;
  status?: TaskReplyStatus;
  attachments?: string[];
  feedback?: string;
}

export type MessageFromRole = 'TEACHER' | 'PARENT' | 'STUDENT';

export interface Thread {
  id: string;
  threadKey: string; // classId hoặc studentId
  participantsJson: string; // JSON chứa danh sách vai trò hoặc ID thành viên, ví dụ '["TEACHER","PARENT","STUDENT"]'
  lastMessageAt: string;
  // Các trường bổ trợ hiển thị & tương thích
  title?: string;
  lastMessage?: string;
  unreadCountAdmin?: number;
  unreadCountUser?: number;
  participantType?: 'parent' | 'student' | 'group';
  studentId?: string;
  parentId?: string;
  classId?: string;
}

export type MessageThread = Thread;

export interface Message {
  id: string;
  threadId: string;
  fromRole: 'TEACHER' | 'PARENT' | 'STUDENT' | string;
  content: string;
  createdAt: string;
  // Các trường bổ trợ hiển thị & tương thích
  senderId?: string;
  senderName?: string;
  senderRole?: 'admin' | 'parent' | 'student' | string;
  sentAt?: string;
  attachments?: string[];
}

export type DocumentCategory =
  | 'rules'
  | 'plan'
  | 'forms'
  | 'schedule'
  | 'syllabus'
  | 'other'
  | string;

export interface Document {
  id: string;
  classId?: string;
  title: string;
  url: string;
  category: DocumentCategory;
  createdAt: string;
  fileUrl?: string; // backwards compatibility
  fileSize?: string;
  uploadedAt?: string; // backwards compatibility
  description?: string;
}

export interface Report {
  id: string;
  type: 'weekly' | 'monthly' | 'custom';
  period: string; // e.g. "Tuần 25 (09/02 - 14/02/2026)" or "Tháng 02/2026"
  title: string;
  summary: {
    attendanceRate: number; // percentage, e.g. 98.5
    totalBehaviorsPositive: number;
    totalBehaviorsNegative: number;
    totalAnnouncements: number;
    completedTasksRate: number; // percentage
  };
  highlights: string[];
  recommendations?: string[];
  generatedAt: string;
}
