import axios, { AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  membershipType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  isbn?: string;
  publishedYear?: number;
  description?: string;
  coverImageUrl?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  categoryId: string;
  author?: {
    id: string;
    name: string;
    bio?: string;
    birthYear?: number;
  };
  category?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface BookWithBorrows extends Book {
  borrowings: BorrowRecord[];
}

export interface BorrowRecord {
  id: string;
  userId: number;
  bookId: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  user?: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  book?: {
    title: string;
    coverImageUrl?: string;
    author: {
      id: string;
      name: string;
      bio?: string;
      birthYear?: number;
      createdAt: string;
      updatedAt: string;
    };
    isbn: string;
    category: {
      id: string;
      name: string;
      description?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  address?: string;
  membershipType?: 'STANDARD' | 'PREMIUM' | 'STUDENT' | 'STAFF';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  books?: T[];
  borrowRecords?: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API functions
export const api = {
  // Authentication
  auth: {
    register: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/register', data);
      return response.data;
    },
    
    login: async (data: LoginData): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/login', data);
      return response.data;
    },
    
    getProfile: async (): Promise<{ user: User }> => {
      const response = await apiClient.get<{ user: User }>('/profile');
      return response.data;
    },
  },

  // Books
  books: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      category?: string;
      author?: string;
      search?: string;
    }): Promise<PaginatedResponse<Book>> => {
      const response = await apiClient.get<PaginatedResponse<Book>>('/books', { params });
      return response.data;
    },
    
    getById: async (id: string): Promise<BookWithBorrows> => {
      const response = await apiClient.get<BookWithBorrows>(`/books/${id}`);
      return response.data;
    },
  },

  // Borrowing
  borrowing: {
    borrow: async (bookId: string, userId: string): Promise<{ message: string; borrowRecord: BorrowRecord }> => {
      const response = await apiClient.post<{ message: string; borrowRecord: BorrowRecord }>('/borrow', {
        bookId,
        userId,
      });
      return response.data;
    },
    
    return: async (borrowId: string): Promise<{ message: string; borrowRecord: BorrowRecord }> => {
      const response = await apiClient.post<{ message: string; borrowRecord: BorrowRecord }>('/return', {
        borrowId,
      });
      return response.data;
    },
    
    getUserBorrows: async (
      userId: string,
      params?: {
        status?: 'all' | 'ACTIVE' | 'RETURNED' | 'OVERDUE';
        page?: number;
        limit?: number;
      }
    ): Promise<PaginatedResponse<BorrowRecord>> => {
      const response = await apiClient.get<PaginatedResponse<BorrowRecord>>(
        `/my-borrows/${userId}`,
        { params }
      );
      return response.data;
    },
  },

  // Health check
  health: async (): Promise<{ status: string; message: string; timestamp: string }> => {
    const response = await apiClient.get<{ status: string; message: string; timestamp: string }>('/health');
    return response.data;
  },
};

export default apiClient;