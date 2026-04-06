import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Check, X, UserCheck } from 'lucide-react';

export const ManagerApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState({});
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED

  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get('/leaves/team');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load team requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axiosInstance.put(`/leaves/${id}/approve`, { comment: commentInput[id] || 'Approved by Manager' });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.put(`/leaves/${id}/reject`, { comment: commentInput[id] || 'Rejected by Manager' });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  if (loading) return <div style={{ padding: '30px' }}>Loading team requests...</div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Team Leave Approvals</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review and decide on leave requests submitted by your team</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card-table">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action / Comments</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No leave requests match the selected filter.
                </td>
              </tr>
            ) : (
              filteredRequests.map(req => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 600 }}>
                    {req.employeeName}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.employeeEmail}</div>
                  </td>
                  <td>{req.departmentName || '-'}</td>
                  <td>{req.leaveTypeName}</td>
                  <td>{req.startDate} to {req.endDate}</td>
                  <td style={{ fontWeight: 700 }}>{req.totalDays}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{req.reason}</td>
                  <td>
                    <span className={`status-badge status-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Optional comment"
                          className="form-input"
                          style={{ padding: '6px 10px', fontSize: '0.8rem', width: '130px' }}
                          value={commentInput[req.id] || ''}
                          onChange={(e) => setCommentInput({ ...commentInput, [req.id]: e.target.value })}
                        />
                        <button onClick={() => handleApprove(req.id)} className="btn btn-success btn-sm" title="Approve Leave">
                          <Check size={14} />
                          <span>Approve</span>
                        </button>
                        <button onClick={() => handleReject(req.id)} className="btn btn-danger btn-sm" title="Reject Leave">
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {req.managerComment || 'No comment provided'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerApprovals;
