import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Table from '../../components/admin/Table';
import FormModal from '../../components/admin/FormModal';
import adminApi from '../../services/adminApi';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: '',
    trackingNumber: '',
    notes: ''
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'gray' },
    { value: 'processing', label: 'Processing', color: 'yellow' },
    { value: 'shipped', label: 'Shipped', color: 'blue' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
    { value: 'refunded', label: 'Refunded', color: 'purple' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminApi.orders.getAllOrders();
      setOrders(response.orders || response || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setStatusForm({
      status: order.status || 'pending',
      trackingNumber: order.trackingNumber || '',
      notes: order.notes || ''
    });
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setFormLoading(true);
    try {
      await adminApi.orders.updateOrderStatus(selectedOrder._id, statusForm);
      setStatusModalOpen(false);
      setSelectedOrder(null);
      setStatusForm({ status: '', trackingNumber: '', notes: '' });
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleMarkDelivered = async (order) => {
    const trackingNumber = prompt('Enter tracking number (optional):');
    
    try {
      await adminApi.orders.markOrderDelivered(order._id, { trackingNumber });
      await fetchOrders();
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      alert('Error marking order as delivered. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : 'gray';
  };

  const columns = [
    {
      key: '_id',
      title: 'Order ID',
      render: (id) => (
        <span className="font-mono text-sm">
          #{id?.slice(-8) || 'N/A'}
        </span>
      )
    },
    {
      key: 'user',
      title: 'Customer',
      render: (user, order) => (
        <div>
          <div className="font-medium text-gray-900">
            {order?.shippingAddress?.firstName && order?.shippingAddress?.lastName 
              ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
              : user?.name || 'N/A'
            }
          </div>
          <div className="text-sm text-gray-500">
            {order?.shippingAddress?.email || user?.email || 'N/A'}
          </div>
          {order?.shippingAddress?.phone && (
            <div className="text-xs text-gray-400">
              {order.shippingAddress.phone}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'orderItems',
      title: 'Items',
      render: (items) => (
        <span className="text-sm">
          {items?.length || 0} item{(items?.length || 0) !== 1 ? 's' : ''}
        </span>
      ),
      sortable: false
    },
    {
      key: 'totalPrice',
      title: 'Total',
      type: 'currency'
    },
    {
      key: 'status',
      title: 'Status',
      render: (status) => {
        const color = getStatusColor(status);
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${color}-100 text-${color}-800`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
          </span>
        );
      }
    },
    {
      key: 'isPaid',
      title: 'Payment',
      render: (isPaid) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isPaid ? 'Paid' : 'Unpaid'}
        </span>
      )
    },
    {
      key: 'createdAt',
      title: 'Date',
      type: 'date'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage customer orders and track deliveries</p>
          </div>
          <div className="flex-shrink-0">
            <select className="input-field text-sm w-full sm:w-auto">
              <option value="">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <Table
          columns={columns}
          data={orders}
          loading={loading}
          searchable={true}
          sortable={true}
          onView={handleView}
          onEdit={handleUpdateStatus}
        />

        {/* Order Details Modal */}
        <FormModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedOrder(null);
          }}
          title={`Order Details - #${selectedOrder?._id?.slice(-8) || ''}`}
          submitText="Close"
          cancelText=""
          size="xl"
          onSubmit={(e) => {
            e.preventDefault();
            setModalOpen(false);
            setSelectedOrder(null);
          }}
        >
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order ID:</span>
                      <span className="font-mono">#{selectedOrder._id?.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getStatusColor(selectedOrder.status)}-100 text-${getStatusColor(selectedOrder.status)}-800`}>
                        {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedOrder.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tracking:</span>
                        <span className="font-mono">{selectedOrder.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span>
                        {selectedOrder.shippingAddress?.firstName && selectedOrder.shippingAddress?.lastName 
                          ? `${selectedOrder.shippingAddress.firstName} ${selectedOrder.shippingAddress.lastName}`
                          : selectedOrder.user?.name || 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span>{selectedOrder.shippingAddress?.email || selectedOrder.user?.email || 'N/A'}</span>
                    </div>
                    {selectedOrder.shippingAddress?.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span>{selectedOrder.shippingAddress.phone}</span>
                      </div>
                    )}
                    {selectedOrder.shippingAddress && (
                      <>
                        <div className="pt-2">
                          <span className="text-gray-500 text-xs uppercase tracking-wide">Shipping Address:</span>
                        </div>
                        <div className="text-gray-900">
                          {selectedOrder.shippingAddress.street}<br/>
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br/>
                          {selectedOrder.shippingAddress.country}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.orderItems?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded mr-3" />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                {(item.size || item.color) && (
                                  <div className="text-xs text-gray-500">
                                    {item.size && `Size: ${item.size}`}
                                    {item.size && item.color && ' • '}
                                    {item.color && `Color: ${item.color}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">₵{item.price?.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            ₵{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </td>
                        </tr>
                      )) || []}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>₵{(selectedOrder.itemsPrice || 0).toFixed(2)}</span>
                    </div>
                    {selectedOrder.shippingPrice > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Shipping:</span>
                        <span>₵{selectedOrder.shippingPrice.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-medium border-t pt-2">
                      <span>Total:</span>
                      <span>₵{(selectedOrder.totalPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setModalOpen(false);
                    handleUpdateStatus(selectedOrder);
                  }}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                >
                  Update Status
                </button>
                {selectedOrder.status !== 'delivered' && (
                  <button
                    onClick={() => handleMarkDelivered(selectedOrder)}
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          )}
        </FormModal>

        {/* Status Update Modal */}
        <FormModal
          isOpen={statusModalOpen}
          onClose={() => {
            setStatusModalOpen(false);
            setSelectedOrder(null);
            setStatusForm({ status: '', trackingNumber: '', notes: '' });
          }}
          title="Update Order Status"
          onSubmit={handleStatusSubmit}
          loading={formLoading}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={statusForm.status}
                onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                required
                className="input-field"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                value={statusForm.trackingNumber}
                onChange={(e) => setStatusForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                className="input-field"
                placeholder="Enter tracking number (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={statusForm.notes}
                onChange={(e) => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="input-field"
                placeholder="Add any additional notes (optional)"
              />
            </div>
          </div>
        </FormModal>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
