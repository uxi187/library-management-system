'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, BookWithBorrows, BorrowRecord } from '@/lib/api';
import { 
  BookOpenIcon, 
  UserIcon, 
  CalendarIcon, 
  TagIcon,
  ClockIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const BookDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [book, setBook] = useState<BookWithBorrows | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle case where params.id might be an array
  const bookId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!bookId || typeof bookId !== 'string') {
      setError('Invalid book ID');
      setLoading(false);
      return;
    }

    fetchBookDetails();
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const bookData = await api.books.getById(bookId);
      setBook(bookData);
    } catch (err: any) {
      console.error('Error fetching book details:', err);
      setError('Failed to load book details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!user || !book) {
      router.push('/login');
      return;
    }

    try {
      setBorrowing(true);
      setError('');
      setSuccessMessage('');

      await api.borrowing.borrow(book.id, user.userId.toString());
      
      setSuccessMessage('Book borrowed successfully! Check your borrowing history to manage your loans.');
      
      // Refresh book details to update available copies
      await fetchBookDetails();
    } catch (err: any) {
      console.error('Error borrowing book:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to borrow book. Please try again.');
      }
    } finally {
      setBorrowing(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-8 w-8 bg-gray-300 rounded"></div>
            <div className="h-6 bg-gray-300 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-20 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Book</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Books
        </Link>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <BookOpenIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Book Not Found</h3>
        <p className="text-gray-500 mb-4">The book you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Books
        </Link>
      </div>
    );
  }

  const userHasBorrowed = book.borrowings?.some(
    record => {
      // Handle both string and number comparisons
      const recordUserId = String(record.userId);
      const currentUserId = String(user?.userId);
      return recordUserId === currentUserId && record.status === 'ACTIVE';
    }
  );

  const hasActiveBorrowers = book.borrowings?.some(
    record => record.status === 'ACTIVE' || record.status === 'OVERDUE'
  );

  const canBorrow = user && book.available && !userHasBorrowed && !hasActiveBorrowers;





  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center">
        <Link
          href="/"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Books
        </Link>
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

      {/* Book Details */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="aspect-w-3 aspect-h-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
              <BookOpenIcon className="h-24 w-24 text-primary-400" />
            </div>
            
            {/* Availability Status */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Availability</h4>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  user && book.borrowings?.some(record => {
                    const recordUserId = String(record.userId);
                    const currentUserId = String(user?.userId);
                    return recordUserId === currentUserId && record.status === 'ACTIVE';
                  }) ? 'text-blue-600' : 
                  book.borrowings?.some(record => record.status === 'ACTIVE' || record.status === 'OVERDUE') ? 'text-yellow-600' : 
                  book.available ? 'text-green-600' : 'text-red-600'
                }`}>
                  {user && book.borrowings?.some(record => {
                    const recordUserId = String(record.userId);
                    const currentUserId = String(user?.userId);
                    return recordUserId === currentUserId && record.status === 'ACTIVE';
                  }) ? 'Borrowed by you' : 
                   book.borrowings?.some(record => record.status === 'ACTIVE' || record.status === 'OVERDUE') ? 'Borrowed' : 
                   book.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              {/* Borrow Button */}
              {user ? (
                <div className="mt-4">
                  {userHasBorrowed ? (
                    <div className="text-center p-3 bg-blue-50 text-blue-700 rounded-md">
                      You have already borrowed this book
                    </div>
                  ) : hasActiveBorrowers ? (
                    <div className="text-center p-3 bg-yellow-50 text-yellow-700 rounded-md">
                      This book is currently borrowed by another user
                    </div>
                  ) : canBorrow ? (
                    <button
                      onClick={handleBorrow}
                      disabled={borrowing}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {borrowing ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Borrowing...
                        </div>
                      ) : (
                        'Borrow Book'
                      )}
                    </button>
                  ) : (
                    <div className="text-center p-3 bg-red-50 text-red-700 rounded-md">
                      Not available for borrowing
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <Link
                    href="/login"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Login to Borrow
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Book Information */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{book.title}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Author</span>
                    <p className="font-medium text-gray-900">{book.author?.name || 'Unknown Author'}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <TagIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Category</span>
                    <p className="font-medium text-gray-900">{book.category?.name || 'Uncategorized'}</p>
                  </div>
                </div>
                
                {book.publishedYear && (
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Published</span>
                      <p className="font-medium text-gray-900">{book.publishedYear}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center text-gray-600">
                  <BookOpenIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">ISBN</span>
                    <p className="font-medium text-gray-900">{book.isbn}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{book.description}</p>
              </div>
            )}

            {/* Current Borrowers (Active/Overdue only) */}
            {book.borrowings && book.borrowings.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Borrowers</h3>
                <div className="space-y-3">
                  {book.borrowings.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {record.user ? `${record.user.firstName} ${record.user.lastName}` : 'Unknown User'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Borrowed: {formatDate(record.borrowedAt)}</span>
                            <span>Due: {formatDate(record.dueDate)}</span>
                            {record.returnedAt && (
                              <span>Returned: {formatDate(record.returnedAt)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                  ))}
                  {book.borrowings.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      And {book.borrowings.length - 5} more borrowing records...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsPage;
