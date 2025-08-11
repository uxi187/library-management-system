'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, BorrowRecord } from '@/lib/api';
import { 
  BookOpenIcon, 
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const MyBorrowsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'RETURNED' | 'OVERDUE'>('all');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchBorrows();
  }, [user, filter]);

  const fetchBorrows = async (page = 1) => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');
      
      const response = await api.borrowing.getUserBorrows(user.userId.toString(), {
        status: filter,
        page,
        limit: 10,
      });
      
      setBorrows(response.borrowRecords || []);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Error fetching borrows:', err);
      setError('Failed to load your borrowing history. Please try again later.');
      setBorrows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId: string) => {
    if (!user) return;

    try {
      setReturning(borrowId);
      setError('');
      setSuccessMessage('');

      await api.borrowing.return(borrowId);
      
      setSuccessMessage('Book returned successfully!');
      
      // Refresh the list
      await fetchBorrows(pagination.page);
    } catch (err: any) {
      console.error('Error returning book:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to return book. Please try again.');
      }
    } finally {
      setReturning(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchBorrows(newPage);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'text-blue-600 bg-blue-100';
      case 'OVERDUE':
        return 'text-red-600 bg-red-100';
      case 'RETURNED':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const isOverdue = (dueDate: string, status: string): boolean => {
    return status === 'ACTIVE' && new Date(dueDate) < new Date();
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <BookOpenIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
        <p className="text-gray-500 mb-4">You need to be logged in to view your borrowing history.</p>
        <Link
          href="/login"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Borrowed Books</h1>
          <p className="mt-2 text-gray-600">
            Track your current and past book loans
          </p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'ACTIVE', 'RETURNED', 'OVERDUE'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Books' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            {pagination.total > 0 ? (
              <>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
              </>
            ) : (
              'No borrowing records found'
            )}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-12 bg-gray-300 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
                <div className="h-8 w-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Borrows List */}
      {!loading && borrows.length > 0 && (
        <div className="space-y-4">
          {borrows.map((borrow) => (
            <div key={borrow.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-16 w-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded flex items-center justify-center">
                        <BookOpenIcon className="h-8 w-8 text-primary-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Link
                          href={`/book/${borrow.bookId}`}
                          className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {borrow.book?.title}
                        </Link>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(borrow.status)}`}>
                          {isOverdue(borrow.dueDate, borrow.status) ? 'OVERDUE' : 
                            borrow.status === 'ACTIVE' ? 'BORROWED' : borrow.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">by {borrow.book?.author?.name || 'Unknown Author'}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Borrowed: {formatDate(borrow.borrowedAt)}
                        </div>
                        <div className={`flex items-center ${
                          isOverdue(borrow.dueDate, borrow.status) ? 'text-red-600' : ''
                        }`}>
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Due: {formatDate(borrow.dueDate)}
                        </div>
                        {borrow.returnedAt && (
                          <div className="flex items-center text-green-600">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Returned: {formatDate(borrow.returnedAt)}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {borrow.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleReturn(borrow.id)}
                        disabled={returning === borrow.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {returning === borrow.id ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Returning...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                            Return Book
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && borrows.length === 0 && (
        <div className="text-center py-12">
          <BookOpenIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No borrowing history' : `No ${filter.toLowerCase()} books`}
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? "You haven't borrowed any books yet. Start exploring our collection!"
              : `You don't have any ${filter.toLowerCase()} books.`
            }
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Browse Books
          </Link>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{pagination.page}</span> of{' '}
                <span className="font-medium">{pagination.totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                  const pageNum = Math.max(1, pagination.page - 2) + index;
                  if (pageNum > pagination.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNum === pagination.page
                          ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBorrowsPage;
