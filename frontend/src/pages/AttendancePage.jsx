import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Clock, Play, Square, CheckCircle, AlertCircle } from 'lucide-react';

export const AttendancePage = () => {
  const { user } = useAuth();
  const [myAttendance, setMyAttendance] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('MY'); // MY or TEAM
  const [message, setMessage] = useState('');

  const fetchAttendance = async () => {
    try {
      const [myRes, todayRes] = await Promise.all([
        axiosInstance.get('/attendance/my'),
        axiosInstance.get('/attendance/today')
      ]);
      setMyAttendance(myRes.data);
      setTodayRecord(todayRes.data);

      if (user?.role === 'ROLE_MANAGER' || user?.role === 'ROLE_ADMIN') {
        const teamRes = await axiosInstance.get('/attendance/team');
        setTeamAttendance(teamRes.data);
      }
    } catch (err) {
      console.error('Failed to load attendance logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      await axiosInstance.post('/attendance/check-in');
      setMessage('Checked in successfully!');
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await axiosInstance.post('/attendance/check-out');
      setMessage('Checked out successfully!');
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    }
  };

  if (loading) return <div style={{ padding: '30px' }}>Loading attendance records...</div>;

  return (
    <div className="page-container">
      {message && (
        <div className="toast-banner toast-success">
          <span>{message}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Attendance Tracker</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Log daily working hours and view attendance history</p>
        </div>

        {(user?.role === 'ROLE_MANAGER' || user?.role === 'ROLE_ADMIN') && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('MY')}
              className={`btn btn-sm ${activeTab === 'MY' ? 'btn-primary' : 'btn-secondary'}`}
            >
              My Attendance
            </button>
            <button
              onClick={() => setActiveTab('TEAM')}
              className={`btn btn-sm ${activeTab === 'TEAM' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Team Attendance Logs
            </button>
          </div>
        )}
      </div>

      {/* Clock In/Out Banner Widget */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem' }}>Today's Clock-in</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {todayRecord ? (
                <>
                  Date: {todayRecord.date} • Status: <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{todayRecord.status}</span>
                  {todayRecord.checkInTime && ` • In: ${todayRecord.checkInTime}`}
                  {todayRecord.checkOutTime && ` • Out: ${todayRecord.checkOutTime}`}
                </>
              ) : (
                'No check-in record for today yet.'
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {!todayRecord?.checkInTime && (
            <button className="btn btn-success" onClick={handleCheckIn}>
              <Play size={16} />
              <span>Check In Now</span>
            </button>
          )}

          {todayRecord?.checkInTime && !todayRecord?.checkOutTime && (
            <button className="btn btn-danger" onClick={handleCheckOut}>
              <Square size={16} />
              <span>Check Out Now</span>
            </button>
          )}

          {todayRecord?.checkOutTime && (
            <span className="status-badge status-approved" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Checked Out
            </span>
          )}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="card-table">
        <div className="card-table-header">
          <h3>{activeTab === 'MY' ? 'My Attendance History' : 'Organization / Team Attendance'}</h3>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              {activeTab === 'TEAM' && <th>Employee</th>}
              {activeTab === 'TEAM' && <th>Department</th>}
              <th>Date</th>
              <th>Check-in Time</th>
              <th>Check-out Time</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'MY' ? myAttendance : teamAttendance).length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No attendance records found.
                </td>
              </tr>
            ) : (
              (activeTab === 'MY' ? myAttendance : teamAttendance).map(att => (
                <tr key={att.id}>
                  {activeTab === 'TEAM' && <td style={{ fontWeight: 600 }}>{att.employeeName}</td>}
                  {activeTab === 'TEAM' && <td>{att.departmentName || '-'}</td>}
                  <td>{att.date}</td>
                  <td>{att.checkInTime || '-'}</td>
                  <td>{att.checkOutTime || '-'}</td>
                  <td>
                    <span className={`status-badge status-${att.status.toLowerCase()}`}>
                      {att.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{att.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendancePage;
