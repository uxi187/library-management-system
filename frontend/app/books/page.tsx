'use client'

import { useState, useEffect } from 'react'

interface Book {
  id: string
  title: string
  isbn?: string
  publishedYear?: number
  description?: string
  available: boolean
  coverImageUrl?: string
  author: {
    id: string
    name: string
  }
  category: {
    id: string
    name: string
  }
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/books`)
      if (!response.ok) {
        throw new Error('Failed to fetch books')
      }
      const data = await response.json()
      setBooks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Books Collection
        </h1>
        
        {/* Search Bar */}
        <div className="max-w-md">
          <label htmlFor="search" className="sr-only">Search books</label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search books, authors, or categories..."
              className="input-field pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading books...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-red-800 font-medium mb-2">Error Loading Books</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchBooks}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-6 text-sm text-gray-600">
            Showing {filteredBooks.length} of {books.length} books
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms.' : 'No books have been added yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredBooks.map((book) => (
                <div key={book.id} className="group block hover:shadow-lg transition-shadow duration-200">
                  {/* Book Cover Container */}
                                      <div className="aspect-[2/3] bg-gray-100 relative overflow-hidden rounded-md shadow-sm mb-2 h-54">
                    {/* Book cover image - when available */}
                    {book.coverImageUrl ? (
                      <img
                        src={book.coverImageUrl}
                        alt={`Cover of ${book.title}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Placeholder icon when no cover image */}
                    <div className={`fallback-icon absolute inset-0 flex items-center justify-center ${book.coverImageUrl ? 'hidden' : ''}`}>
                      <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${
                        book.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.available ? 'Available' : 'Borrowed'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Book Details */}
                  <div className="space-y-1">
                    {/* Title */}
                    <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                    
                    {/* Author */}
                    <p className="text-gray-600 text-xs leading-tight truncate">
                      {book.author.name}
                    </p>
                    
                    {/* Category & Year - Compact */}
                    <div className="text-gray-500 text-xs">
                      <span className="truncate">
                        {book.category.name}
                        {book.publishedYear && ` • ${book.publishedYear}`}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - Show on Hover */}
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex gap-1">
                      <button className="btn-primary flex-1 text-xs py-1 px-2">
                        View
                      </button>
                      {book.available && (
                        <button className="btn-secondary text-xs py-1 px-2">
                          Borrow
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}