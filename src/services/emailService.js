class EmailService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }

  async sendBookingConfirmation(bookingData) {
    try {
      const response = await fetch(`${this.apiUrl}/emails/booking-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: bookingData.email,
          customerName: `${bookingData.firstName} ${bookingData.lastName}`,
          celebrityName: bookingData.celebrity.name,
          bookingId: bookingData.id,
          sessionDetails: {
            date: bookingData.date,
            time: bookingData.time,
            duration: bookingData.duration,
            package: bookingData.package
          },
          amount: bookingData.amount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send booking confirmation email');
      }

      return await response.json();
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  async sendPaymentConfirmation(paymentData) {
    try {
      const response = await fetch(`${this.apiUrl}/emails/payment-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error('Failed to send payment confirmation email');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment confirmation email error:', error);
      throw error;
    }
  }
}

const emailService = new EmailService();
export default emailService;