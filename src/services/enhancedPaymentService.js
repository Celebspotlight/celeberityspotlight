import emailService from './emailService';

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';
const API_KEY = process.env.REACT_APP_NOWPAYMENTS_API_KEY;

// Enhanced logging for debugging
const logPaymentDebug = (message, data = null) => {
  console.log(`[PaymentService] ${message}`, data);
  
  // Store debug logs in localStorage for troubleshooting
  const logs = JSON.parse(localStorage.getItem('paymentDebugLogs') || '[]');
  logs.push({
    timestamp: new Date().toISOString(),
    message,
    data: data ? JSON.stringify(data, null, 2) : null,
    environment: process.env.REACT_APP_ENVIRONMENT || 'unknown'
  });
  
  // Keep only last 50 logs
  if (logs.length > 50) {
    logs.splice(0, logs.length - 50);
  }
  
  localStorage.setItem('paymentDebugLogs', JSON.stringify(logs));
};

// Check API connectivity
export const checkAPIConnectivity = async () => {
  try {
    logPaymentDebug('Checking API connectivity...');
    
    if (!API_KEY) {
      logPaymentDebug('API key not found in environment variables');
      return { connected: false, error: 'API key not configured' };
    }
    
    const response = await fetch(`${NOWPAYMENTS_API_URL}/status`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    logPaymentDebug('API status response:', { status: response.status, ok: response.ok });
    
    if (response.ok) {
      const data = await response.json();
      logPaymentDebug('API connectivity successful', data);
      return { connected: true, data };
    } else {
      const errorText = await response.text();
      logPaymentDebug('API connectivity failed', { status: response.status, error: errorText });
      return { connected: false, error: `API returned ${response.status}: ${errorText}` };
    }
  } catch (error) {
    logPaymentDebug('API connectivity error', error.message);
    return { connected: false, error: error.message };
  }
};

export const createPayment = async (bookingData) => {
  logPaymentDebug('Creating payment...', {
    bookingId: bookingData.bookingId,
    amount: bookingData.totalAmount,
    celebrity: bookingData.celebrityName,
    hasApiKey: !!API_KEY,
    environment: process.env.REACT_APP_ENVIRONMENT
  });

  // Check API connectivity first
  const connectivity = await checkAPIConnectivity();
  if (!connectivity.connected) {
    logPaymentDebug('API connectivity check failed, using mock payment', connectivity.error);
    return {
      payment_id: 'mock_' + Date.now(),
      payment_url: `${window.location.origin}/booking-success?id=${bookingData.bookingId}&mock=true`,
      mock: true,
      error: connectivity.error
    };
  }

  try {
    // Step 1: Create an invoice
    const invoiceData = {
      price_amount: parseFloat(bookingData.totalAmount),
      price_currency: 'usd',
      order_id: bookingData.bookingId,
      order_description: `Celebrity Experience with ${bookingData.celebrityName}`,
      success_url: `${window.location.origin}/booking-success?id=${bookingData.bookingId}`,
      cancel_url: `${window.location.origin}/booking-cancelled?id=${bookingData.bookingId}`,
      ipn_callback_url: `${window.location.origin}/.netlify/functions/payment-webhook` // Netlify function
    };

    logPaymentDebug('Creating invoice...', invoiceData);
    
    const invoiceResponse = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoiceData)
    });

    logPaymentDebug('Invoice response received', { status: invoiceResponse.status, ok: invoiceResponse.ok });
    
    if (!invoiceResponse.ok) {
      const errorText = await invoiceResponse.text();
      logPaymentDebug('Invoice creation failed', { status: invoiceResponse.status, error: errorText });
      throw new Error(`Invoice creation failed: ${invoiceResponse.status} - ${errorText}`);
    }

    const invoice = await invoiceResponse.json();
    logPaymentDebug('Invoice created successfully', invoice);

    // Step 2: Create payment from the invoice
    const paymentData = {
      iid: invoice.id,
      pay_currency: bookingData.selectedCrypto || 'btc',
      order_description: `Celebrity Experience with ${bookingData.celebrityName}`,
      customer_email: bookingData.email || 'customer@example.com'
    };

    logPaymentDebug('Creating payment...', paymentData);
    
    const paymentResponse = await fetch(`${NOWPAYMENTS_API_URL}/invoice-payment`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    logPaymentDebug('Payment response received', { status: paymentResponse.status, ok: paymentResponse.ok });
    
    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      logPaymentDebug('Payment creation failed', { status: paymentResponse.status, error: errorText });
      throw new Error(`Payment creation failed: ${paymentResponse.status} - ${errorText}`);
    }

    const payment = await paymentResponse.json();
    logPaymentDebug('Payment created successfully', payment);

    // Store payment info for tracking
    const paymentInfo = {
      payment_id: payment.payment_id,
      invoice_id: invoice.id,
      booking_id: bookingData.bookingId,
      amount: bookingData.totalAmount,
      currency: paymentData.pay_currency,
      created_at: new Date().toISOString(),
      status: 'pending'
    };
    
    // Store in localStorage for tracking
    const storedPayments = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
    storedPayments.push(paymentInfo);
    localStorage.setItem('paymentHistory', JSON.stringify(storedPayments));

    const result = {
      payment_id: payment.payment_id,
      payment_url: invoice.invoice_url,
      invoice_id: invoice.id,
      pay_address: payment.pay_address,
      pay_amount: payment.pay_amount,
      pay_currency: payment.pay_currency,
      qr_code: payment.qr_code || null
    };
    
    logPaymentDebug('Payment result prepared', result);
    return result;
    
  } catch (error) {
    logPaymentDebug('Payment creation error', error.message);
    
    // Enhanced error handling for common issues
    if (error.message.includes('401')) {
      throw new Error('Payment service authentication failed. Please contact support.');
    } else if (error.message.includes('403')) {
      throw new Error('Payment service access denied. Please contact support.');
    } else if (error.message.includes('429')) {
      throw new Error('Too many payment requests. Please wait a moment and try again.');
    } else if (error.message.includes('500')) {
      throw new Error('Payment service temporarily unavailable. Please try again later.');
    } else {
      throw new Error(`Payment failed: ${error.message}`);
    }
  }
};

export const checkPaymentStatus = async (paymentId) => {
  if (!API_KEY) {
    logPaymentDebug('Cannot check payment status - no API key');
    return { status: 'unknown', error: 'API key not configured' };
  }

  try {
    logPaymentDebug('Checking payment status...', { paymentId });
    
    const response = await fetch(`${NOWPAYMENTS_API_URL}/payment/${paymentId}`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      logPaymentDebug('Payment status check failed', { status: response.status, error: errorText });
      throw new Error(`Status check failed: ${response.status} - ${errorText}`);
    }

    const payment = await response.json();
    logPaymentDebug('Payment status retrieved', payment);
    
    // Update stored payment info
    const storedPayments = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
    const paymentIndex = storedPayments.findIndex(p => p.payment_id === paymentId);
    if (paymentIndex !== -1) {
      storedPayments[paymentIndex].status = payment.payment_status;
      storedPayments[paymentIndex].updated_at = new Date().toISOString();
      localStorage.setItem('paymentHistory', JSON.stringify(storedPayments));
    }
    
    return payment;
  } catch (error) {
    logPaymentDebug('Payment status check error', error.message);
    return { status: 'error', error: error.message };
  }
};

export const getAvailableCurrencies = async () => {
  if (!API_KEY) {
    logPaymentDebug('Cannot get currencies - no API key');
    return ['btc', 'eth', 'ltc']; // Default fallback
  }

  try {
    logPaymentDebug('Fetching available currencies...');
    
    const response = await fetch(`${NOWPAYMENTS_API_URL}/currencies`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch currencies: ${response.status}`);
    }

    const data = await response.json();
    logPaymentDebug('Currencies fetched successfully', { count: data.currencies?.length });
    
    return data.currencies || ['btc', 'eth', 'ltc'];
  } catch (error) {
    logPaymentDebug('Currency fetch error', error.message);
    return ['btc', 'eth', 'ltc']; // Fallback currencies
  }
};

// Get payment debug logs for troubleshooting
export const getPaymentDebugLogs = () => {
  return JSON.parse(localStorage.getItem('paymentDebugLogs') || '[]');
};

// Clear payment debug logs
export const clearPaymentDebugLogs = () => {
  localStorage.removeItem('paymentDebugLogs');
  logPaymentDebug('Debug logs cleared');
};

// Get payment history
export const getPaymentHistory = () => {
  return JSON.parse(localStorage.getItem('paymentHistory') || '[]');
};

export default {
  createPayment,
  checkPaymentStatus,
  getAvailableCurrencies,
  checkAPIConnectivity,
  getPaymentDebugLogs,
  clearPaymentDebugLogs,
  getPaymentHistory
};