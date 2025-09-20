// Fix for Class Enrollments Section
// Replace the current logic in Dashboard.js around lines 1040-1100

// CHANGE 1: Current Enrollments -> Pending Payments (only pending_payment status)
/*
<div className="current-enrollments">
  <h3>Pending Payments</h3>
  {bookings.filter(b => (b.type === 'acting_class' || b.type === 'class_enrollment') && b.status === 'pending_payment').length === 0 ? (
    <div className="empty-state-small">
      <p>No pending class payments</p>
    </div>
  ) : (
    <div className="enrollments-grid">
      {bookings.filter(b => (b.type === 'acting_class' || b.type === 'class_enrollment') && b.status === 'pending_payment').map((booking) => (
        // ... existing enrollment card code ...
      ))}
    </div>
  )}
</div>
*/

// CHANGE 2: Completed Classes -> Active Enrollments (confirmed/active status)
/*
<div className="completed-classes">
  <h3>Active Enrollments</h3>
  {bookings.filter(b => (b.type === 'acting_class' || b.type === 'class_enrollment') && (b.status === 'confirmed' || b.status === 'active')).length === 0 ? (
    <div className="empty-state-small">
      <p>No active enrollments yet</p>
    </div>
  ) : (
    <div className="completed-list">
      {bookings.filter(b => (b.type === 'acting_class' || b.type === 'class_enrollment') && (b.status === 'confirmed' || b.status === 'active')).map((booking) => (
        <div key={booking.id || booking.bookingId || `active-class-${booking.className || booking.service}-${booking.createdAt}`} className="completed-item">
          <div className="completed-info">
            <h4>{booking.className || booking.service || 'Acting Class'}</h4>
            <p>Started: {booking.startDate ? formatDate(booking.startDate) : (booking.createdAt ? formatDate(booking.createdAt) : 'Date TBD')} • ${booking.pricing?.total || booking.total}</p>
            <p><strong>Coach:</strong> {booking.coach?.name || 'TBD'} • <strong>Duration:</strong> {booking.duration || booking.coach?.duration || 'TBD'}</p>
          </div>
          <span className="completed-badge" style={{backgroundColor: '#10b981'}}>ACTIVE</span>
        </div>
      ))}
    </div>
  )}
</div>
*/

// This fixes:
// 1. 'Current Enrollments' now only shows pending payments (pending_payment status)
// 2. 'Completed Classes' renamed to 'Active Enrollments' shows confirmed/active classes
// 3. Fixed invalid date by using startDate or createdAt with proper fallback
// 4. Added coach and duration info to active enrollments
// 5. Changed badge color to green for active status