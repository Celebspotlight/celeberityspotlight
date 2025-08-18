const ZOOM_API_URL = 'https://api.zoom.us/v2';
const ZOOM_JWT_TOKEN = process.env.REACT_APP_ZOOM_JWT_TOKEN;

export const createZoomMeeting = async (bookingData) => {
  try {
    const meetingData = {
      topic: `Celebrity Experience with ${bookingData.celebrity.name}`,
      type: 2, // Scheduled meeting
      start_time: `${bookingData.formData.date}T${bookingData.formData.time}:00`,
      duration: parseInt(bookingData.formData.duration),
      timezone: 'UTC',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true
      }
    };
    
    const response = await fetch(`${ZOOM_API_URL}/users/me/meetings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ZOOM_JWT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meetingData)
    });
    
    const meeting = await response.json();
    return meeting.join_url;
  } catch (error) {
    console.error('Zoom meeting creation failed:', error);
    return `Booking ID: ${bookingData.id} - Meeting link will be sent via email`;
  }
};