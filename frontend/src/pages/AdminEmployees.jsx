import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Modal from '../components/Modal';
import { PlusCircle, Edit, Trash2, UserCheck, ShieldAlert } from 'lucide-react';

export const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'ROLE_EMPLOYEE',
    jobTitle: '',
    departmentId: '',
    managerId: ''
  });

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        axiosInstance.get('/employees'),
        axiosInstance.get('/departments')
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
      setManagers(empRes.data.filter(e => e.role === 'ROLE_MANAGER' || e.role === 'ROLE_ADMIN'));
    } catch (err) {
      console.error('Failed to load employee directory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'ROLE_EMPLOYEE',
      jobTitle: '',
      departmentId: '',
      managerId: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingId(emp.id);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      password: '', // Leave blank to keep existing
      role: emp.role,
      jobTitle: emp.jobTitle || '',
      departmentId: emp.departmentId || '',
      managerId: emp.managerId || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...formData,
      departmentId: formData.departmentId ? Number(formData.departmentId) : null,
      managerId: formData.managerId ? Number(formData.managerId) : null
    };

    try {
      if (editingId) {
        await axiosInstance.put(`/admin/employees/${editingId}`, payload);
      } else {
        await axiosInstance.post('/admin/employees', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this employee account?')) return;
    try {
      await axiosInstance.delete(`/admin/employees/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Deactivation failed');
    }
  };

  if (loading) return <div style={{ padding: '30px' }}>Loading employees directory...</div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Employee Directory & Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Admin panel for managing company users, roles, and assignments</p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <PlusCircle size={18} />
          <span>Add New Employee</span>
        </button>
      </div>

      <div className="card-table">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td>#{emp.id}</td>
                <td style={{ fontWeight: 600 }}>
                  {emp.firstName} {emp.lastName}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.jobTitle}</div>
                </td>
                <td>{emp.email}</td>
                <td>
                  <span className={`role-badge ${emp.role === 'ROLE_ADMIN' ? 'role-admin' : emp.role === 'ROLE_MANAGER' ? 'role-manager' : 'role-employee'}`}>
                    {emp.role.replace('ROLE_', '')}
                  </span>
                </td>
                <td>{emp.departmentName || '-'}</td>
                <td>{emp.managerName || '-'}</td>
                <td>
                  <span className={`status-badge ${emp.active ? 'status-approved' : 'status-cancelled'}`}>
                    {emp.active ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEditModal(emp)} className="btn btn-secondary btn-sm" title="Edit">
                      <Edit size={14} />
                    </button>
                    {emp.active && (
                      <button onClick={() => handleDeactivate(emp.id)} className="btn btn-danger btn-sm" title="Deactivate">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Employee Profile' : 'Add New Employee'}>
        {error && (
          <div className="toast-banner toast-error">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>{editingId ? 'New Password (Leave blank to retain current)' : 'Password'}</label>
            <input
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingId}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>System Role</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="ROLE_EMPLOYEE">EMPLOYEE</option>
                <option value="ROLE_MANAGER">MANAGER</option>
                <option value="ROLE_ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Senior Developer"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <select
                className="form-select"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                <option value="">No Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Assigned Manager</label>
              <select
                className="form-select"
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              >
                <option value="">No Manager</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Save Changes' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminEmployees;
