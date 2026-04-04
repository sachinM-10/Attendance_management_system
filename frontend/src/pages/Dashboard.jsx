import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import StatCard from '../components/StatCard';
import LeaveApplyModal from './LeaveApplyModal';
import {
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Building2,
  UserCheck,
  PlusCircle,
  Check,
  X,
  Play,
  Square
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [commentInput, setCommentInput] = useState({});

  const fetchDashboard = async () => {
    try {
      const res = await axiosInstance.get('/attendance/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    try {
      await axiosInstance.post('/attendance/check-in');
      setActionMessage('Checked in successfully!');
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await axiosInstance.post('/attendance/check-out');
      setActionMessage('Checked out successfully!');
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    }
  };

  const handleApprove = async (id) => {
    try {
      await axiosInstance.put(`/leaves/${id}/approve`, { comment: commentInput[id] || 'Approved' });
      setActionMessage('Leave request approved!');
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.put(`/leaves/${id}/reject`, { comment: commentInput[id] || 'Rejected' });
      setActionMessage('Leave request rejected');
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard metrics...</div>;
  }

  const role = user?.role || 'ROLE_EMPLOYEE';

  return (
    <div className="page-container">
      {actionMessage && (
        <div className="toast-banner toast-success">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} style={{ background: 'transparent', color: 'currentColor' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem' }}>
            {role === 'ROLE_ADMIN' ? 'Admin Overview' : role === 'ROLE_MANAGER' ? 'Manager Dashboard' : 'Employee Portal'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time balance, attendance, and request metrics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => setIsApplyModalOpen(true)}>
            <PlusCircle size={18} />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="dashboard-grid">
        {role === 'ROLE_ADMIN' ? (
          <>
            <StatCard title="Total Employees" value={data?.totalEmployees || 0} icon={Users} color="var(--accent-cyan)" bg="rgba(6, 182, 212, 0.15)" />
            <StatCard title="Departments" value={data?.totalDepartments || 0} icon={Building2} color="var(--accent-purple)" bg="rgba(139, 92, 246, 0.15)" />
            <StatCard title="Pending Approvals" value={data?.pendingLeavesCount || 0} icon={AlertCircle} color="var(--accent-amber)" bg="rgba(245, 158, 11, 0.15)" />
            <StatCard title="Present Today" value={data?.presentTodayCount || 0} icon={UserCheck} color="var(--accent-emerald)" bg="rgba(16, 185, 129, 0.15)" />
          </>
        ) : role === 'ROLE_MANAGER' ? (
          <>
            <StatCard title="Pending Approvals" value={data?.pendingLeavesCount || 0} icon={AlertCircle} color="var(--accent-amber)" bg="rgba(245, 158, 11, 0.15)" />
            <StatCard title="Approved Leaves" value={data?.approvedLeavesCount || 0} icon={CheckCircle} color="var(--accent-emerald)" bg="rgba(16, 185, 129, 0.15)" />
            <StatCard title="Present Today" value={data?.presentTodayCount || 0} icon={UserCheck} color="var(--accent-cyan)" bg="rgba(6, 182, 212, 0.15)" />
            <StatCard title="On Leave Today" value={data?.onLeaveTodayCount || 0} icon={CalendarDays} color="var(--accent-rose)" bg="rgba(244, 63, 94, 0.15)" />
          </>
        ) : (
          <>
            {data?.leaveBalances?.map((b) => (
              <StatCard
                key={b.id}
                title={b.leaveTypeName}
                value={`${b.remainingDays} / ${b.totalDays} Days`}
                label={`${b.usedDays} days used`}
                icon={CalendarDays}
                color="var(--primary)"
                bg="rgba(99, 102, 241, 0.15)"
              />
            ))}
          </>
        )}
      </div>

      {/* Attendance Quick Punch Panel */}
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
            background: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem' }}>Today's Attendance Status</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {data?.todayAttendance ? (
                <>
                  Status: <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{data.todayAttendance.status}</span>
                  {data.todayAttendance.checkInTime && ` • Checked in at ${data.todayAttendance.checkInTime}`}
                  {data.todayAttendance.checkOutTime && ` • Checked out at ${data.todayAttendance.checkOutTime}`}
                </>
              ) : (
                'You have not checked in today yet.'
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {!data?.todayAttendance?.checkInTime && (
            <button className="btn btn-success" onClick={handleCheckIn}>
              <Play size={16} />
              <span>Check In</span>
            </button>
          )}

          {data?.todayAttendance?.checkInTime && !data?.todayAttendance?.checkOutTime && (
            <button className="btn btn-danger" onClick={handleCheckOut}>
              <Square size={16} />
              <span>Check Out</span>
            </button>
          )}

          {data?.todayAttendance?.checkOutTime && (
            <span className="status-badge status-approved" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Shift Completed
            </span>
          )}
        </div>
      </div>

      {/* Recent Leave Requests / Pending Approvals */}
      <div className="card-table">
        <div className="card-table-header">
          <h3>{role === 'ROLE_EMPLOYEE' ? 'My Recent Leave Applications' : 'Team Leave Requests'}</h3>
        </div>

        {data?.recentLeaveRequests?.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No leave requests found.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Status</th>
                <th>Reason</th>
                {(role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN') && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {data?.recentLeaveRequests?.map((req) => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 600 }}>{req.employeeName}</td>
                  <td>{req.leaveTypeName}</td>
                  <td>{req.startDate} to {req.endDate}</td>
                  <td style={{ fontWeight: 700 }}>{req.totalDays}</td>
                  <td>
                    <span className={`status-badge status-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{req.reason}</td>
                  {(role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN') && (
                    <td>
                      {req.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Comment"
                            className="form-input"
                            style={{ padding: '4px 8px', fontSize: '0.8rem', width: '110px' }}
                            value={commentInput[req.id] || ''}
                            onChange={(e) => setCommentInput({ ...commentInput, [req.id]: e.target.value })}
                          />
                          <button onClick={() => handleApprove(req.id)} className="btn btn-success btn-sm" title="Approve">
                            <Check size={14} />
                          </button>
                          <button onClick={() => handleReject(req.id)} className="btn btn-danger btn-sm" title="Reject">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          {req.managerComment || 'Reviewed'}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <LeaveApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          setIsApplyModalOpen(false);
          setActionMessage('Leave application submitted successfully!');
          fetchDashboard();
        }}
      />
    </div>
  );
};

export default Dashboard;
