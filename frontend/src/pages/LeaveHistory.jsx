import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import LeaveApplyModal from './LeaveApplyModal';
import { PlusCircle, Trash2, CalendarDays } from 'lucide-react';

export const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [leavesRes, balancesRes] = await Promise.all([
        axiosInstance.get('/leaves/my'),
        axiosInstance.get('/leaves/balances')
      ]);
      setLeaves(leavesRes.data);
      setBalances(balancesRes.data);
    } catch (err) {
      console.error('Failed to load leave records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await axiosInstance.delete(`/leaves/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  if (loading) return <div style={{ padding: '30px' }}>Loading leave history...</div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Leave Request History</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track all your submitted leave applications</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsApplyModalOpen(true)}>
          <PlusCircle size={18} />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balances Header Summary */}
      <div className="dashboard-grid" style={{ marginBottom: '30px' }}>
        {balances.map(b => (
          <div key={b.id} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CalendarDays size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.leaveTypeName}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{b.remainingDays} Days Left</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Used: {b.usedDays} of {b.totalDays}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Leave History Table */}
      <div className="card-table">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Manager Comment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  You have not submitted any leave requests yet.
                </td>
              </tr>
            ) : (
              leaves.map(req => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 600 }}>{req.leaveTypeName}</td>
                  <td>{req.startDate}</td>
                  <td>{req.endDate}</td>
                  <td style={{ fontWeight: 700 }}>{req.totalDays}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(req.appliedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`status-badge status-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {req.managerComment || '-'}
                  </td>
                  <td>
                    {req.status === 'PENDING' && (
                      <button onClick={() => handleCancel(req.id)} className="btn btn-danger btn-sm">
                        <Trash2 size={14} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <LeaveApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          setIsApplyModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
};

export default LeaveHistory;
