export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT';

export type EnquiryStatus = 'NEW' | 'IN_PROGRESS' | 'CLOSED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface Enquiry {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  message: string;
  status: EnquiryStatus;
  assignedTo?: User | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
