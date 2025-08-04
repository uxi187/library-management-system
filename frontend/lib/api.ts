const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError('Network error or server unavailable', 0);
  }
}

// API functions
export const api = {
  // Books
  books: {
    getAll: () => fetchApi<any[]>('/api/books'),
    getById: (id: string) => fetchApi<any>(`/api/books/${id}`),
    create: (data: any) => fetchApi<any>('/api/books', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchApi<any>(`/api/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchApi<void>(`/api/books/${id}`, {
      method: 'DELETE',
    }),
  },

  // Authors
  authors: {
    getAll: () => fetchApi<any[]>('/api/authors'),
    getById: (id: string) => fetchApi<any>(`/api/authors/${id}`),
    create: (data: any) => fetchApi<any>('/api/authors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // Categories
  categories: {
    getAll: () => fetchApi<any[]>('/api/categories'),
    getById: (id: string) => fetchApi<any>(`/api/categories/${id}`),
    create: (data: any) => fetchApi<any>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // Health check
  health: () => fetchApi<{ status: string; message: string; timestamp: string }>('/health'),
};

export { ApiError };