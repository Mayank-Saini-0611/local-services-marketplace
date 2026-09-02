
import axiosClient from './axiosClient';

export const paymentApi = {
  createOrder: async (bookingId) => {
    const response = await axiosClient.post('/payments/create-order', { bookingId });
    return response.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await axiosClient.post('/payments/verify', paymentData);
    return response.data;
  },
};