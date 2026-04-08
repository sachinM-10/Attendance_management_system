import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { User, Mail, Briefcase, Building, ShieldCheck, UserCheck } from 'lucide-react';

export const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/employees/me')
      .then(res => setProfile(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '30px' }}>Loading profile...</div>;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <h2>User Profile</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your personal account and organizational details</p>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px',
        maxWidth: '640px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 0 20px var(--primary-glow)'
          }}>
            <User size={36} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem' }}>{profile?.firstName} {profile?.lastName}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{profile?.jobTitle || 'Employee'}</p>
            <div style={{ marginTop: '8px' }}>
              <span className={`role-badge ${profile?.role === 'ROLE_ADMIN' ? 'role-admin' : profile?.role === 'ROLE_MANAGER' ? 'role-manager' : 'role-employee'}`}>
                {profile?.role?.replace('ROLE_', '')}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
              <Mail size={14} />
              <span>EMAIL ADDRESS</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{profile?.email}</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
              <Building size={14} />
              <span>DEPARTMENT</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{profile?.departmentName || 'General Staff'}</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
              <UserCheck size={14} />
              <span>REPORTING MANAGER</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{profile?.managerName || 'None'}</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
              <ShieldCheck size={14} />
              <span>ACCOUNT STATUS</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--accent-emerald)' }}>
              {profile?.active ? 'Active Employee' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
