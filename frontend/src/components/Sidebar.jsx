import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Users,
  Building2,
  UserCheck,
  User,
  LogOut
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const role = user?.role || 'ROLE_EMPLOYEE';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">LM</div>
        <div>
          <h2 className="sidebar-title">Leave & Attendance</h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Enterprise Suite</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/leaves" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CalendarDays size={18} />
          <span>Leave Requests</span>
        </NavLink>

        <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Clock size={18} />
          <span>Attendance Tracker</span>
        </NavLink>

        {(role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN') && (
          <NavLink to="/approvals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <UserCheck size={18} />
            <span>Team Approvals</span>
          </NavLink>
        )}

        {role === 'ROLE_ADMIN' && (
          <>
            <div style={{ padding: '12px 16px 4px', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
              Administration
            </div>

            <NavLink to="/admin/employees" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>Manage Employees</span>
            </NavLink>

            <NavLink to="/admin/departments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Building2 size={18} />
              <span>Manage Departments</span>
            </NavLink>
          </>
        )}

        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={18} />
          <span>My Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="nav-item" style={{ width: '100%', color: 'var(--accent-rose)' }}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
