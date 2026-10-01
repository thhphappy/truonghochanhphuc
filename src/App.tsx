import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './core/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminClasses } from './pages/admin/AdminClasses';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminParents } from './pages/admin/AdminParents';
import { AdminAttendance } from './pages/admin/AdminAttendance';
import { AdminBehavior } from './pages/admin/AdminBehavior';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminTasks } from './pages/admin/AdminTasks';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminDocuments } from './pages/admin/AdminDocuments';
import { AdminReports } from './pages/admin/AdminReports';

// Parent / Student Pages
import { AppDashboard } from './pages/app/AppDashboard';
import { AppAttendance } from './pages/app/AppAttendance';
import { AppBehavior } from './pages/app/AppBehavior';
import { AppAnnouncements } from './pages/app/AppAnnouncements';
import { AppTasks } from './pages/app/AppTasks';
import { AppMessages } from './pages/app/AppMessages';
import { AppDocuments } from './pages/app/AppDocuments';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Default entry redirect */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Admin Routes (Giáo viên chủ nhiệm) */}
          <Route
            path="/admin"
            element={
              <AppLayout>
                <Navigate to="/admin/dashboard" replace />
              </AppLayout>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            }
          />
          <Route
            path="/admin/classes"
            element={
              <AppLayout>
                <AdminClasses />
              </AppLayout>
            }
          />
          <Route
            path="/admin/students"
            element={
              <AppLayout>
                <AdminStudents />
              </AppLayout>
            }
          />
          <Route
            path="/admin/parents"
            element={
              <AppLayout>
                <AdminParents />
              </AppLayout>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <AppLayout>
                <AdminAttendance />
              </AppLayout>
            }
          />
          <Route
            path="/admin/behavior"
            element={
              <AppLayout>
                <AdminBehavior />
              </AppLayout>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <AppLayout>
                <AdminAnnouncements />
              </AppLayout>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <AppLayout>
                <AdminTasks />
              </AppLayout>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <AppLayout>
                <AdminMessages />
              </AppLayout>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <AppLayout>
                <AdminDocuments />
              </AppLayout>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AppLayout>
                <AdminReports />
              </AppLayout>
            }
          />

          {/* App Routes (Phụ huynh & Học sinh) */}
          <Route
            path="/app"
            element={
              <AppLayout>
                <Navigate to="/app/dashboard" replace />
              </AppLayout>
            }
          />
          <Route
            path="/app/dashboard"
            element={
              <AppLayout>
                <AppDashboard />
              </AppLayout>
            }
          />
          <Route
            path="/app/attendance"
            element={
              <AppLayout>
                <AppAttendance />
              </AppLayout>
            }
          />
          <Route
            path="/app/behavior"
            element={
              <AppLayout>
                <AppBehavior />
              </AppLayout>
            }
          />
          <Route
            path="/app/announcements"
            element={
              <AppLayout>
                <AppAnnouncements />
              </AppLayout>
            }
          />
          <Route
            path="/app/tasks"
            element={
              <AppLayout>
                <AppTasks />
              </AppLayout>
            }
          />
          <Route
            path="/app/messages"
            element={
              <AppLayout>
                <AppMessages />
              </AppLayout>
            }
          />
          <Route
            path="/app/documents"
            element={
              <AppLayout>
                <AppDocuments />
              </AppLayout>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
