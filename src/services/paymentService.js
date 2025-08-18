import emailService from './emailService';

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1'; // ✅ Production URL
const API_KEY = process.env.REACT_APP_NOWPAYMENTS_API_KEY; // ✅ Your live API key

export const createPayment = async (bookingData) => {
  // Check if API key is available
  if (!API_KEY) {
    console.warn('NOWPayments API key not found, using mock payment');
    return {
      payment_id: 'mock_' + Date.now(),
      payment_url: 'https://sandbox.nowpayments.io/payment/mock-payment-url',
      mock: true
    };
  }

  try {
    // Step 1: Create an invoice first
    const invoiceData = {
      price_amount: parseFloat(bookingData.totalAmount),
      price_currency: 'usd',
      order_id: bookingData.bookingId,
      order_description: `Celebrity Experience with ${bookingData.celebrityName}`,
      success_url: `${window.location.origin}/booking-success?id=${bookingData.bookingId}`,
      cancel_url: `${window.location.origin}/booking-cancelled`
    };

    console.log('Creating invoice with data:', invoiceData);
    console.log('Using API key:', API_KEY ? 'API key present' : 'No API key');
    
    const invoiceResponse = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoiceData)
    });

    console.log('Invoice response status:', invoiceResponse.status);
    
    if (!invoiceResponse.ok) {
      const errorText = await invoiceResponse.text();
      console.error('Invoice creation error response:', errorText);
      throw new Error(`Invoice creation failed: ${invoiceResponse.status} ${errorText}`);
    }

    const invoice = await invoiceResponse.json();
    console.log('Invoice created successfully:', invoice);

    // Step 2: Create payment from the invoice
    const paymentData = {
      iid: invoice.id,
      pay_currency: bookingData.selectedCrypto || 'btc',
      order_description: `Celebrity Experience with ${bookingData.celebrityName}`,
      customer_email: bookingData.email || 'customer@example.com'
    };

    console.log('Creating payment with data:', paymentData);
    
    const paymentResponse = await fetch(`${NOWPAYMENTS_API_URL}/invoice-payment`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    console.log('Payment response status:', paymentResponse.status);
    
    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('Payment creation error response:', errorText);
      throw new Error(`Payment creation failed: ${paymentResponse.status} ${errorText}`);
    }

    const payment = await paymentResponse.json();
    console.log('Payment created successfully:', payment);

    // Return the payment with the correct invoice URL
    const result = {
      payment_id: payment.payment_id,
      payment_url: invoice.invoice_url, // This is the correct URL for redirection
      invoice_id: invoice.id,
      pay_address: payment.pay_address,
      pay_amount: payment.pay_amount,
      pay_currency: payment.pay_currency
    };
    
    console.log('Returning payment result:', result);
    return result;
  } catch (error) {
    console.error('Payment creation failed:', error);
    throw new Error(`Payment failed: ${error.message}`);
  }
};

export const checkPaymentStatus = async (paymentId) => {
  if (!API_KEY) {
    console.warn('API key not available for status check');
    return { payment_status: 'mock_pending' };
  }

  try {
    const response = await fetch(`${NOWPAYMENTS_API_URL}/payment/${paymentId}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Payment status check failed:', error);
    throw error;
  }
};

// Additional helper functions for better integration
export const getAvailableCurrencies = async () => {
  if (!API_KEY) {
    return ['btc', 'eth', 'usdt', 'ltc']; // Default currencies
  }

  try {
    const response = await fetch(`${NOWPAYMENTS_API_URL}/currencies`, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.currencies || ['btc', 'eth', 'usdt', 'ltc'];
    }
  } catch (error) {
    console.error('Failed to fetch currencies:', error);
  }
  
  return ['btc', 'eth', 'usdt', 'ltc']; // Fallback
};

export const getEstimatedPrice = async (amount, fromCurrency, toCurrency) => {
  if (!API_KEY) {
    return { estimated_amount: amount }; // Mock response
  }

  try {
    const response = await fetch(
      `${NOWPAYMENTS_API_URL}/estimate?amount=${amount}&currency_from=${fromCurrency}&currency_to=${toCurrency}`,
      {
        headers: {
          'x-api-key': API_KEY
        }
      }
    );
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Price estimation failed:', error);
  }
  
  return { estimated_amount: amount };
};

export const processPayment = async (paymentData) => {
  try {
    // This function processes the payment after it's completed
    // You can add additional business logic here
    console.log('Processing payment:', paymentData);
    
    // Update booking status
    const bookingId = paymentData.bookingId || paymentData.order_id;
    if (bookingId) {
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const updatedBookings = existingBookings.map(booking => {
        if (booking.id === bookingId || booking.bookingId === bookingId) {
          return {
            ...booking,
            status: 'confirmed',
            paymentStatus: 'completed',
            paymentData: paymentData,
            confirmedAt: new Date().toISOString()
          };
        }
        return booking;
      });
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    }
    
    return {
      success: true,
      message: 'Payment processed successfully',
      paymentData
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    throw new Error(`Payment processing failed: ${error.message}`);
  }
};

export const handlePaymentSuccess = async (paymentData, bookingData) => {
  try {
    // Process payment
    const paymentResult = await processPayment(paymentData);
    
    // Send confirmation emails
    await emailService.sendBookingConfirmation(bookingData);
    await emailService.sendPaymentConfirmation(paymentData);
    
    return paymentResult;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};