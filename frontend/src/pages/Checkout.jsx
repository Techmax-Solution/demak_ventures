import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { createOrder, paystackAPI } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { isAuthenticated, loading, user } = useUser();
  
  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    
    // Payment Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // Order Notes
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'payment', 'success'

  // Calculate totals
  const subtotal = totalPrice;
  const tax = totalPrice * 0.08;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  // Paystack payment handlers
  const initializePaystackPayment = () => {
    if (!currentOrder) {
      console.error('No current order found');
      setPaymentStep('form');
      return;
    }
    
    // Check if Paystack script is loaded
    if (!window.PaystackPop) {
      console.error('PaystackPop not available');
      alert('Payment system is loading. Please try again in a moment.');
      setPaymentStep('form');
      return;
    }

    console.log('Initializing Paystack payment with:', {
      orderId: currentOrder._id,
      email: formData.email,
      amount: Math.round(total * 100),
      total: total
    });

    try {
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_c827720756c17a27051917f50a45e18e1cb423ae',
        email: formData.email || user?.email || '',
        amount: Math.round(total * 100), // Amount in kobo (smallest currency unit)
        currency: 'GHS', // Ghana Cedis
        ref: `order_${currentOrder._id}_${Date.now()}`,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
        metadata: {
          orderId: currentOrder._id,
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: currentOrder._id
            }
          ]
        },
        callback: async function(response) {
          console.log('Payment successful:', response);
          setIsSubmitting(true);
          
          try {
            // Verify payment with backend
            const verificationResult = await paystackAPI.verifyPayment(response.reference);
            
            if (verificationResult.success) {
              // Clear cart and show success
              clearCart();
              setOrderId(currentOrder._id);
              setOrderSuccess(true);
              setPaymentStep('success');
            } else {
              alert('Payment verification failed. Please contact support.');
              setPaymentStep('form');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
            setPaymentStep('form');
          } finally {
            setIsSubmitting(false);
          }
        },
        onClose: function() {
          console.log('Payment popup closed');
          setPaymentStep('form');
          setIsSubmitting(false);
        }
      });

      console.log('Opening Paystack popup...');
      handler.openIframe();
    } catch (error) {
      console.error('Error initializing Paystack:', error);
      alert('Failed to initialize payment. Please try again.');
      setPaymentStep('form');
      setIsSubmitting(false);
    }
  };

  // Initialize Paystack payment with order data (before creating order in database)
  const initializePaystackPaymentWithOrderData = (orderData) => {
    // Check if Paystack script is loaded
    if (!window.PaystackPop) {
      console.error('PaystackPop not available');
      alert('Payment system is loading. Please try again in a moment.');
      setPaymentStep('form');
      setIsSubmitting(false);
      return;
    }

    setPaymentStep('payment');

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_c827720756c17a27051917f50a45e18e1cb423ae';
    const paymentReference = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Initializing Paystack payment with order data:', {
      email: formData.email,
      amount: Math.round(total * 100),
      total: total,
      reference: paymentReference
    });

    try {
      const paymentConfig = {
        key: publicKey,
        email: formData.email || user?.email || '',
        amount: Math.round(total * 100),
        currency: 'GHS',
        ref: paymentReference,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
        metadata: {
          orderData: JSON.stringify(orderData),
          customerEmail: formData.email,
          custom_fields: [
            {
              display_name: "Customer Email",
              variable_name: "customer_email",
              value: formData.email
            }
          ]
        },
        onSuccess: async function(response) {
          console.log('Payment successful:', response);
          setIsSubmitting(true);
          
          try {
            console.log('Creating order after successful payment...');
            
            // Add payment information to order data
            const orderDataWithPayment = {
              ...orderData,
              paymentResult: {
                id: response.reference,
                status: 'success',
                update_time: new Date().toISOString(),
                email_address: formData.email,
                transaction_id: response.trans || response.transaction,
                reference: response.reference
              },
              isPaid: true,
              paidAt: new Date()
            };
            
            // Create the order in database with payment info
            const createdOrder = await createOrder(orderDataWithPayment);
            console.log('Order created successfully:', createdOrder);
            
            // Clear cart and show success (skip separate verification since payment is already confirmed by Paystack)
            clearCart();
            setOrderId(createdOrder._id);
            setOrderSuccess(true);
            setPaymentStep('success');
            
          } catch (error) {
            console.error('Order creation error:', error);
            console.error('Error details:', {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status
            });
            
            // Show more detailed error message
            const errorMessage = error.response?.data?.message || error.message || 'Order creation failed';
            alert('Payment successful but order creation failed. Please contact support with your payment reference: ' + response.reference + '. Error: ' + errorMessage);
            setPaymentStep('form');
          } finally {
            setIsSubmitting(false);
          }
        },
        onCancel: function() {
          console.log('Payment cancelled by user');
          setPaymentStep('form');
          setIsSubmitting(false);
        }
      };

      console.log('Opening Paystack popup...');
      
      if (window.PaystackPop && typeof window.PaystackPop.setup === 'function') {
        const handler = window.PaystackPop.setup(paymentConfig);
        handler.openIframe();
      } else if (window.Paystack && typeof window.Paystack.newTransaction === 'function') {
        window.Paystack.newTransaction(paymentConfig);
      } else {
        throw new Error('Paystack initialization method not found');
      }
    } catch (error) {
      console.error('Error initializing Paystack:', error);
      alert(`Failed to initialize payment: ${error.message}. Please try again.`);
      setPaymentStep('form');
      setIsSubmitting(false);
    }
  };

  // Initialize Paystack payment with specific order (legacy function - keeping for compatibility)
  const initializePaystackPaymentWithOrder = (order) => {
    if (!order) {
      console.error('No order provided');
      setPaymentStep('form');
      return;
    }
    
    // Check if Paystack script is loaded
    if (!window.PaystackPop) {
      console.error('PaystackPop not available');
      alert('Payment system is loading. Please try again in a moment.');
      setPaymentStep('form');
      return;
    }

    setPaymentStep('payment');

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_c827720756c17a27051917f50a45e18e1cb423ae';
    
    console.log('Initializing Paystack payment with order:', {
      orderId: order._id,
      email: formData.email,
      amount: Math.round(total * 100),
      total: total,
      publicKey: publicKey.substring(0, 10) + '...' // Show first 10 chars for debugging
    });

    if (publicKey === 'pk_test_your_public_key_here') {
      alert('Please set your VITE_PAYSTACK_PUBLIC_KEY in your .env file');
      setPaymentStep('form');
      return;
    }

    try {
      // Check if we have the right Paystack object
      console.log('Available Paystack objects:', {
        PaystackPop: !!window.PaystackPop,
        Paystack: !!window.Paystack
      });

      const paymentConfig = {
        key: publicKey,
        email: formData.email || user?.email || '',
        amount: Math.round(total * 100), // Amount in kobo (smallest currency unit)
        currency: 'GHS', // Ghana Cedis
        ref: `order_${order._id}_${Date.now()}`,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
        metadata: {
          orderId: order._id,
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: order._id
            }
          ]
        },
        onSuccess: async function(response) {
          console.log('Payment successful:', response);
          setIsSubmitting(true);
          
          try {
            // Verify payment with backend
            const verificationResult = await paystackAPI.verifyPayment(response.reference);
            
            if (verificationResult.success) {
              // Clear cart and show success
              clearCart();
              setOrderId(order._id);
              setOrderSuccess(true);
              setPaymentStep('success');
            } else {
              alert('Payment verification failed. Please contact support.');
              setPaymentStep('form');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
            setPaymentStep('form');
          } finally {
            setIsSubmitting(false);
          }
        },
        onCancel: function() {
          console.log('Payment popup closed');
          setPaymentStep('form');
          setIsSubmitting(false);
        }
      };

      console.log('Payment config:', paymentConfig);

      // Try different Paystack initialization methods
      if (window.PaystackPop && typeof window.PaystackPop.setup === 'function') {
        console.log('Using PaystackPop.setup');
        const handler = window.PaystackPop.setup(paymentConfig);
        console.log('Handler created:', handler);
        handler.openIframe();
      } else if (window.Paystack && typeof window.Paystack.newTransaction === 'function') {
        console.log('Using Paystack.newTransaction');
        window.Paystack.newTransaction(paymentConfig);
      } else {
        throw new Error('Paystack initialization method not found');
      }
    } catch (error) {
      console.error('Error initializing Paystack:', error);
      alert('Failed to initialize payment. Please try again.');
      setPaymentStep('form');
      setIsSubmitting(false);
    }
  };

  // Check if Paystack script is loaded
  useEffect(() => {
    console.log('Paystack availability check:', {
      PaystackPop: !!window.PaystackPop,
      publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ? 'Set' : 'Not set'
    });
  }, []);

  // Redirect if cart is empty or user is not authenticated
  useEffect(() => {
    if (cartItems.length === 0 && !orderSuccess) {
      navigate('/cart');
    }
  }, [cartItems, navigate, orderSuccess]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { 
        state: { from: location },
        replace: true 
      });
    }
  }, [isAuthenticated, loading, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Shipping validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    // Note: Payment validation removed since payment form is not present
    // In a real app, you would integrate with a payment processor

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission started...');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed');
    setIsSubmitting(true);

    try {
      // Prepare order data (but don't send to backend yet)
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product._id,
          name: item.product.name,
          image: item.product.images?.[0]?.url || '',
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: 'Paystack',
        notes: formData.notes
      };

      console.log('Order data prepared, initializing payment first...');
      
      // Store order data temporarily and initialize payment
      setCurrentOrder({ orderData }); // Store the order data, not a created order
      
      // Initialize Paystack payment directly
      initializePaystackPaymentWithOrderData(orderData);
      
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to initialize payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Success page
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
            
            {orderId && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">Order Number</p>
                <p className="text-xl font-mono font-semibold text-gray-800">#{orderId.slice(-8)}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <p className="text-gray-600">
                We'll send you a confirmation email with order details and tracking information.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary"
                >
                  View Order Status
                </button>
                <button
                  onClick={() => navigate('/shop')}
                  className="btn-secondary"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
        
        {/* Payment Step Indicator */}
        {paymentStep === 'payment' && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <h3 className="font-semibold text-blue-800">Payment in Progress</h3>
                <p className="text-blue-600">Complete your payment in the Paystack popup to finish your order.</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Information */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipping Information</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`input-field ${errors.address ? 'border-red-500' : ''}`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`input-field ${errors.state ? 'border-red-500' : ''}`}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={`input-field ${errors.zipCode ? 'border-red-500' : ''}`}
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>

       

              {/* Order Notes */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Notes (Optional)</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Special delivery instructions, gift message, etc."
                  rows={4}
                  className="input-field h-24"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || paymentStep === 'payment'}
                className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-colors duration-200 ${
                  isSubmitting || paymentStep === 'payment'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? 'Processing Order...' : 
                 paymentStep === 'payment' ? 'Payment in Progress...' : 
                 `Continue to Payment - ₵${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.key} className="flex items-center space-x-3">
                    <img
                      src={item.product.images?.[0]?.url || '/api/placeholder/50/50'}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm">{item.product.name}</h4>
                      {item.size && <p className="text-xs text-gray-600">Size: {item.size}</p>}
                      {item.color && <p className="text-xs text-gray-600">Color: {item.color}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">₵{(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₵{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span>₵{tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-800">
                    <span>Total:</span>
                    <span>₵{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-medium">Secure Checkout</span>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
