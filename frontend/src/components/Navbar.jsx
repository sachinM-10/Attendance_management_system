import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';

export const Navbar = () => {
  const { user } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <span className="role-badge role-admin">ADMIN</span>;
      case 'ROLE_MANAGER':
        return <span className="role-badge role-manager">MANAGER</span>;
      default:
        return <span className="role-badge role-employee">EMPLOYEE</span>;
    }
  };

  return (
    <header className="topbar">
      <div>
        <h3 style={{ fontSize: '1.1rem' }}>Welcome back, {user?.firstName} {user?.lastName} 👋</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {user?.jobTitle || 'Team Member'} {user?.departmentName ? `• ${user.departmentName}` : ''}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {getRoleBadge(user?.role)}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          border: '1px solid var(--border-color)'
        }}>
          <User size={18} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
