import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LeaveHistory from './pages/LeaveHistory';
import AttendancePage from './pages/AttendancePage';
import ManagerApprovals from './pages/ManagerApprovals';
import AdminEmployees from './pages/AdminEmployees';
import AdminDepartments from './pages/AdminDepartments';
import ProfilePage from './pages/ProfilePage';

const ProtectedLayout = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {children}
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          } />

          <Route path="/leaves" element={
            <ProtectedLayout>
              <LeaveHistory />
            </ProtectedLayout>
          } />

          <Route path="/attendance" element={
            <ProtectedLayout>
              <AttendancePage />
            </ProtectedLayout>
          } />

          <Route path="/approvals" element={
            <ProtectedLayout allowedRoles={['ROLE_MANAGER', 'ROLE_ADMIN']}>
              <ManagerApprovals />
            </ProtectedLayout>
          } />

          <Route path="/admin/employees" element={
            <ProtectedLayout allowedRoles={['ROLE_ADMIN']}>
              <AdminEmployees />
            </ProtectedLayout>
          } />

          <Route path="/admin/departments" element={
            <ProtectedLayout allowedRoles={['ROLE_ADMIN']}>
              <AdminDepartments />
            </ProtectedLayout>
          } />

          <Route path="/profile" element={
            <ProtectedLayout>
              <ProfilePage />
            </ProtectedLayout>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
