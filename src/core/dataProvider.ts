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
} from './types';

export interface DataProvider {
  // Standard generic CRUD
  list<T = any>(resource: string, query?: Record<string, any>): Promise<T[]>;
  get<T = any>(resource: string, id: string): Promise<T | null>;
  add<T = any>(resource: string, item: Omit<T, 'id'>): Promise<T>;
  update<T = any>(resource: string, id: string, patch: Partial<T>): Promise<T>;
  remove(resource: string, id: string): Promise<boolean>;

  // Specific domain methods required by specification
  markAttendance(
    payload:
      | MarkAttendanceParams
      | { studentId: string; date: string; status: AttendanceStatus; note?: string; classId?: string }[]
  ): Promise<Attendance[]>;

  listAttendanceByStudent(
    studentId: string,
    range?: AttendanceRange
  ): Promise<Attendance[]>;

  addBehavior(behavior: Omit<Behavior, 'id'>): Promise<Behavior>;
  updateBehavior(id: string, updates: Partial<Behavior>): Promise<Behavior>;
  deleteBehavior(id: string): Promise<boolean>;

  sendMessage(
    threadId: string,
    message: Partial<Message> & { content: string; fromRole?: string; senderRole?: string; senderName?: string; senderId?: string }
  ): Promise<Message>;

  listMessages(threadId: string): Promise<Message[]>;
  getMessages(threadId: string): Promise<Message[]>;

  replyTask(
    taskIdOrPayload: string | (Partial<TaskReply> & { taskId: string; studentId: string }),
    payload?: Partial<TaskReply>
  ): Promise<TaskReply>;

  reportsWeekly(week: number, year: number): Promise<Report>;

  reportsMonthly(month: number, year: number): Promise<Report>;

  // Convenience entity helpers for UI binding
  getClasses(): Promise<ClassInfo[]>;
  getClassInfo(): Promise<ClassInfo>;
  updateClassInfo(info: Partial<ClassInfo>): Promise<ClassInfo>;
  getStudents(classId?: string): Promise<Student[]>;
  getParents(): Promise<Parent[]>;
  getAnnouncements(classId?: string): Promise<Announcement[]>;
  getTasks(classId?: string): Promise<Task[]>;
  getTaskReplies(taskId?: string): Promise<TaskReply[]>;
  getAttendance(date?: string): Promise<Attendance[]>;
  getBehaviors(studentId?: string, range?: BehaviorRange): Promise<Behavior[]>;
  getMessageThreads(): Promise<Thread[]>;
  getThreads(threadKey?: string): Promise<Thread[]>;
  getOrCreateThread(threadKey: string, title?: string): Promise<Thread>;
  getDocuments(classId?: string): Promise<Document[]>;
  getReports(): Promise<Report[]>;
  seedData(force?: boolean): Promise<void>;
}
