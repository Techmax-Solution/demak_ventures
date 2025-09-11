import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Table from '../../components/admin/Table';
import FormModal from '../../components/admin/FormModal';
import adminApi from '../../services/adminApi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.users.getAllUsers();
      setUsers(response.users || response || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      isActive: user.isActive !== undefined ? user.isActive : true
    });
    setEditModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to deactivate user "${user.name}"? This will prevent them from logging in.`)) {
      return;
    }

    try {
      await adminApi.users.deleteUser(user._id);
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deactivating user. Please try again.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFormLoading(true);
    try {
      await adminApi.users.updateUser(selectedUser._id, formData);
      setEditModalOpen(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', role: 'user', isActive: true });
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const columns = [
    {
      key: 'avatar',
      title: 'Avatar',
      render: (avatar, user) => (
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-white">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
      ),
      sortable: false
    },
    {
      key: 'name',
      title: 'Name',
      render: (name, user) => (
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      render: (role) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {role?.charAt(0).toUpperCase() + role?.slice(1) || 'User'}
        </span>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (isActive) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (phone) => phone || '-'
    },
    {
      key: 'createdAt',
      title: 'Joined',
      type: 'date'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>
          <div className="flex space-x-3">
            <select className="input-field">
              <option value="">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
            <select className="input-field">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <Table
          columns={columns}
          data={users}
          loading={loading}
          searchable={true}
          sortable={true}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* User Details Modal */}
        <FormModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedUser(null);
          }}
          title="User Details"
          submitText="Close"
          cancelText=""
          size="lg"
          onSubmit={(e) => {
            e.preventDefault();
            setModalOpen(false);
            setSelectedUser(null);
          }}
        >
          {selectedUser && (
            <div className="space-y-6">
              {/* User Profile */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  {selectedUser.avatar ? (
                    <img 
                      src={selectedUser.avatar} 
                      alt={selectedUser.name} 
                      className="w-16 h-16 rounded-full object-cover" 
                    />
                  ) : (
                    <span className="text-xl font-medium text-white">
                      {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.role?.charAt(0).toUpperCase() + selectedUser.role?.slice(1)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span>{selectedUser.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Joined:</span>
                      <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Address</h4>
                  <div className="text-sm text-gray-900">
                    {selectedUser.address ? (
                      <div>
                        {selectedUser.address.street}<br/>
                        {selectedUser.address.city}, {selectedUser.address.state} {selectedUser.address.zipCode}<br/>
                        {selectedUser.address.country}
                      </div>
                    ) : (
                      <span className="text-gray-500">No address provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Statistics */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Account Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Total Orders</div>
                    <div className="text-2xl font-bold text-blue-900">0</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Total Spent</div>
                    <div className="text-2xl font-bold text-green-900">$0.00</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Reviews</div>
                    <div className="text-2xl font-bold text-purple-900">0</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setModalOpen(false);
                    handleEdit(selectedUser);
                  }}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                >
                  Edit User
                </button>
                {selectedUser.isActive ? (
                  <button
                    onClick={() => handleDelete(selectedUser)}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setFormData({ ...selectedUser, isActive: true });
                      handleEditSubmit({ preventDefault: () => {} });
                    }}
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          )}
        </FormModal>

        {/* Edit User Modal */}
        <FormModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedUser(null);
            setFormData({ name: '', email: '', role: 'user', isActive: true });
          }}
          title="Edit User"
          onSubmit={handleEditSubmit}
          loading={formLoading}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="Enter user name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="input-field"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Active Account
              </label>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Warning:</strong> Changing a user's role to admin will give them full access to the admin panel. 
                    Deactivating a user will prevent them from logging in.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FormModal>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
