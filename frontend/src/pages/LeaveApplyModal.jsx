import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import axiosInstance from '../api/axiosInstance';
import { AlertCircle } from 'lucide-react';

export const LeaveApplyModal = ({ isOpen, onClose, onSuccess }) => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState(0);

  useEffect(() => {
    if (isOpen) {
      axiosInstance.get('/leaves/balances').then(res => {
        setLeaveTypes(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, leaveTypeId: res.data[0].leaveTypeId }));
        }
      }).catch(err => console.error(err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setCalculatedDays(diffDays);
      } else {
        setCalculatedDays(0);
      }
    } else {
      setCalculatedDays(0);
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axiosInstance.post('/leaves', {
        leaveTypeId: Number(formData.leaveTypeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for Leave">
      {error && (
        <div className="toast-banner toast-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Leave Type</label>
          <select
            name="leaveTypeId"
            className="form-select"
            value={formData.leaveTypeId}
            onChange={handleChange}
            required
          >
            {leaveTypes.map(lt => (
              <option key={lt.leaveTypeId} value={lt.leaveTypeId}>
                {lt.leaveTypeName} (Remaining: {lt.remainingDays} days)
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              className="form-input"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              className="form-input"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {calculatedDays > 0 && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            color: 'white',
            fontWeight: 600
          }}>
            Total Duration: {calculatedDays} Day{calculatedDays > 1 ? 's' : ''}
          </div>
        )}

        <div className="form-group">
          <label>Reason for Leave</label>
          <textarea
            name="reason"
            className="form-textarea"
            rows={3}
            placeholder="Please detail why you are requesting leave..."
            value={formData.reason}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading || calculatedDays <= 0}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LeaveApplyModal;
