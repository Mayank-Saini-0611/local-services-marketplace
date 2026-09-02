import axiosClient from './axiosClient';

export const bookingApi = {
  // Create new booking (customer)
  create: async (bookingData) => {
    const response = await axiosClient.post('/bookings', bookingData);
    return response.data;
  },

  // Get my bookings (customer's bookings)
  getMyBookings: async () => {
    const response = await axiosClient.get('/bookings/my-bookings');
    return response.data;
  },

  // Get received bookings (provider's incoming requests)
  getReceivedBookings: async () => {
    const response = await axiosClient.get('/bookings/received');
    return response.data;
  },

  // Get single booking by ID
  getById: async (id) => {
    const response = await axiosClient.get(`/bookings/${id}`);
    return response.data;
  },

  // Update booking status (provider)
  updateStatus: async (id, status) => {
    const response = await axiosClient.put(`/bookings/${id}/status`, { status });
    return response.data;
  },

  // Cancel booking (customer)
  cancel: async (id) => {
    const response = await axiosClient.delete(`/bookings/${id}`);
    return response.data;
  },

  // Download booking invoice PDF
  downloadInvoice: async (bookingId) => {
    const response = await axiosClient.get(`/bookings/${bookingId}/invoice`, {
      responseType: 'blob', // Required for binary PDF downloading
    });
    
    // Create blob link and trigger automatic browser download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoice-Booking-${bookingId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};