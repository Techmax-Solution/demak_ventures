import { Link } from 'react-router-dom';

const OrderCard = ({ order }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="card p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Order #{order._id?.slice(-8) || 'N/A'}
          </h3>
          <p className="text-gray-600 text-sm">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="mt-2 md:mt-0">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-3 mb-4">
        {order.items?.map((item, index) => (
          <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <img 
              src={item.product?.imageUrl || '/api/placeholder/60/60'} 
              alt={item.product?.name || 'Product'}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">
                {item.product?.name || 'Product Name'}
              </h4>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Qty: {item.quantity}</span>
                {item.size && <span>Size: {item.size}</span>}
                {item.color && <span>Color: {item.color}</span>}
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-800">${item.price}</p>
              <p className="text-sm text-gray-600">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        )) || (
          <div className="p-3 bg-gray-50 rounded-lg text-center text-gray-600">
            No items available
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Subtotal:</span>
          <span className="text-gray-800">${order.subtotal?.toFixed(2) || '0.00'}</span>
        </div>
        {order.shipping && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Shipping:</span>
            <span className="text-gray-800">${order.shipping.toFixed(2)}</span>
          </div>
        )}
        {order.tax && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Tax:</span>
            <span className="text-gray-800">${order.tax.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center font-semibold text-lg border-t border-gray-200 pt-2">
          <span className="text-gray-800">Total:</span>
          <span className="text-gray-800">${order.total?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-2">Shipping Address</h5>
          <div className="text-sm text-gray-600">
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link 
          to={`/order/${order._id}`}
          className="btn-primary text-center"
        >
          View Details
        </Link>
        
        {order.status === 'delivered' && (
          <button className="btn-secondary">
            Leave Review
          </button>
        )}
        
        {['pending', 'processing'].includes(order.status?.toLowerCase()) && (
          <button className="btn-secondary text-red-600 border-red-300 hover:bg-red-50">
            Cancel Order
          </button>
        )}
        
        {order.status === 'delivered' && (
          <button className="btn-secondary">
            Reorder
          </button>
        )}
      </div>

      {/* Tracking Information */}
      {order.trackingNumber && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-blue-800 mb-1">Tracking Information</h5>
          <p className="text-sm text-blue-700">
            Tracking Number: <span className="font-mono">{order.trackingNumber}</span>
          </p>
          {order.carrier && (
            <p className="text-sm text-blue-700">
              Carrier: {order.carrier}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
