// Netlify function to handle NOWPayments webhooks
const crypto = require('crypto');

// Environment variables
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@celebrityspotlight.com';

// Helper function to verify webhook signature
function verifySignature(payload, signature, secret) {
  if (!secret || !signature) {
    return false;
  }
  
  const hmac = crypto.createHmac('sha512', secret);
  hmac.update(payload);
  const computedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(computedSignature, 'hex')
  );
}

// Helper function to send notification email
async function sendNotificationEmail(paymentData) {
  // This would integrate with your email service
  // For now, we'll log the notification
  console.log('Payment notification:', {
    orderId: paymentData.order_id,
    status: paymentData.payment_status,
    amount: paymentData.pay_amount,
    currency: paymentData.pay_currency,
    timestamp: new Date().toISOString()
  });
}

// Main webhook handler
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-nowpayments-sig',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get the signature from headers
    const signature = event.headers['x-nowpayments-sig'];
    const payload = event.body;

    // Log the webhook for debugging
    console.log('Webhook received:', {
      signature: signature ? 'present' : 'missing',
      payloadLength: payload ? payload.length : 0,
      headers: event.headers
    });

    // Verify the signature if secret is configured
    if (NOWPAYMENTS_IPN_SECRET) {
      if (!signature) {
        console.error('Missing signature in webhook');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing signature' })
        };
      }

      if (!verifySignature(payload, signature, NOWPAYMENTS_IPN_SECRET)) {
        console.error('Invalid signature in webhook');
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid signature' })
        };
      }
    } else {
      console.warn('No IPN secret configured - webhook signature not verified');
    }

    // Parse the payment data
    const paymentData = JSON.parse(payload);
    
    console.log('Payment webhook data:', {
      payment_id: paymentData.payment_id,
      order_id: paymentData.order_id,
      payment_status: paymentData.payment_status,
      pay_amount: paymentData.pay_amount,
      pay_currency: paymentData.pay_currency,
      price_amount: paymentData.price_amount,
      price_currency: paymentData.price_currency
    });

    // Process different payment statuses
    switch (paymentData.payment_status) {
      case 'finished':
        console.log(`Payment completed for order ${paymentData.order_id}`);
        await sendNotificationEmail(paymentData);
        break;
        
      case 'partially_paid':
        console.log(`Partial payment received for order ${paymentData.order_id}`);
        break;
        
      case 'failed':
        console.log(`Payment failed for order ${paymentData.order_id}`);
        break;
        
      case 'refunded':
        console.log(`Payment refunded for order ${paymentData.order_id}`);
        break;
        
      case 'expired':
        console.log(`Payment expired for order ${paymentData.order_id}`);
        break;
        
      default:
        console.log(`Payment status '${paymentData.payment_status}' for order ${paymentData.order_id}`);
    }

    // Store payment update in a simple log (in production, you'd use a database)
    const paymentUpdate = {
      timestamp: new Date().toISOString(),
      payment_id: paymentData.payment_id,
      order_id: paymentData.order_id,
      status: paymentData.payment_status,
      amount: paymentData.pay_amount,
      currency: paymentData.pay_currency,
      processed: true
    };

    // In a real application, you would:
    // 1. Update your database with the payment status
    // 2. Send confirmation emails to customers
    // 3. Update booking status
    // 4. Trigger any post-payment workflows

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        order_id: paymentData.order_id,
        status: paymentData.payment_status
      })
    };

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};