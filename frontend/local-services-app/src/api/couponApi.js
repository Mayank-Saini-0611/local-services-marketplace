import axiosClient from './axiosClient';

export const couponApi = {
  apply: async (code, bookingAmount) => {
    const response = await axiosClient.post('/coupons/apply', {
      code,
      bookingAmount,
    });
    return response.data;
  },
};