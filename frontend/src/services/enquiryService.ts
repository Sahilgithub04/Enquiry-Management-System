import { api } from './api';
import { Enquiry, ApiResponse } from '../types';

export interface EnquiryQueryParams {
  search?: string;
  status?: string;
  assignee?: string;
  page?: number;
  limit?: number;
}

export const enquiryService = {
  getEnquiries: async (params?: EnquiryQueryParams): Promise<ApiResponse<Enquiry[]>> => {
    const response = await api.get<ApiResponse<Enquiry[]>>('/enquiries', { params });
    return response.data;
  },

  getEnquiryById: async (id: string): Promise<Enquiry> => {
    const response = await api.get<ApiResponse<Enquiry>>(`/enquiries/${id}`);
    return response.data.data;
  },

  createEnquiry: async (data: {
    customerName: string;
    email: string;
    phone: string;
    message: string;
    status?: string;
    assignedTo?: string | null;
  }): Promise<Enquiry> => {
    const response = await api.post<ApiResponse<Enquiry>>('/enquiries', data);
    return response.data.data;
  },

  updateEnquiry: async (
    id: string,
    data: {
      customerName?: string;
      email?: string;
      phone?: string;
      message?: string;
      status?: string;
      assignedTo?: string | null;
    }
  ): Promise<Enquiry> => {
    const response = await api.put<ApiResponse<Enquiry>>(`/enquiries/${id}`, data);
    return response.data.data;
  },

  deleteEnquiry: async (id: string): Promise<void> => {
    await api.delete(`/enquiries/${id}`);
  },
};
