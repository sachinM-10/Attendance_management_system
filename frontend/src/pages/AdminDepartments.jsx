import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Modal from '../components/Modal';
import { PlusCircle, Edit, Trash2, Building2, ShieldAlert } from 'lucide-react';

export const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    managerId: ''
  });

  const fetchData = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        axiosInstance.get('/departments'),
        axiosInstance.get('/employees')
      ]);
      setDepartments(deptRes.data);
      setManagers(empRes.data.filter(e => e.role === 'ROLE_MANAGER' || e.role === 'ROLE_ADMIN'));
    } catch (err) {
      console.error('Failed to load departments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', code: '', description: '', managerId: '' });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingId(dept.id);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      managerId: dept.managerId || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...formData,
      managerId: formData.managerId ? Number(formData.managerId) : null
    };

    try {
      if (editingId) {
        await axiosInstance.put(`/departments/${editingId}`, payload);
      } else {
        await axiosInstance.post('/departments', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await axiosInstance.delete(`/departments/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Deletion failed');
    }
  };

  if (loading) return <div style={{ padding: '30px' }}>Loading departments...</div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Department Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Define company organizational departments and lead managers</p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <PlusCircle size={18} />
          <span>Add Department</span>
        </button>
      </div>

      <div className="card-table">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Department Name</th>
              <th>Code</th>
              <th>Department Lead Manager</th>
              <th>Employee Count</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept.id}>
                <td>#{dept.id}</td>
                <td style={{ fontWeight: 600 }}>{dept.name}</td>
                <td>
                  <span className="status-badge status-pending" style={{ color: 'var(--accent-purple)' }}>
                    {dept.code}
                  </span>
                </td>
                <td>{dept.managerName || 'Unassigned'}</td>
                <td style={{ fontWeight: 700 }}>{dept.employeeCount} Members</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{dept.description || '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEditModal(dept)} className="btn btn-secondary btn-sm">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(dept.id)} className="btn btn-danger btn-sm">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Department' : 'Add New Department'}>
        {error && (
          <div className="toast-banner toast-error">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Department Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Quality Assurance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. QA"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Department Head / Manager</label>
            <select
              className="form-select"
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
            >
              <option value="">No Lead Assigned</option>
              {managers.map(m => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.email})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Department purpose and scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDepartments;
