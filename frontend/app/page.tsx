'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  author: {
    name: string
  }
  category: {
    name: string
  }
  available: boolean
}

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/books`)
      if (!response.ok) {
        throw new Error('Failed to fetch books')
      }
      const data = await response.json()
      setBooks(data.slice(0, 6)) // Show only first 6 books on homepage
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Library Management System
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover, borrow, and manage your favorite books with our modern library management platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-primary-600 mb-2">10,000+</h3>
          <p className="text-gray-600">Books Available</p>
        </div>
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-primary-600 mb-2">500+</h3>
          <p className="text-gray-600">Authors</p>
        </div>
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-primary-600 mb-2">50+</h3>
          <p className="text-gray-600">Categories</p>
        </div>
      </div>

      {/* Featured Books Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Books</h2>
          <Link href="/books" className="btn-primary">
            View All Books
          </Link>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading books...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={fetchBooks}
              className="btn-secondary mt-4"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div key={book.id} className="card hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {book.title}
                </h3>
                <p className="text-gray-600 mb-2">
                  by {book.author.name}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Category: {book.category.name}
                </p>
                <div className="flex justify-between items-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    book.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {book.available ? 'Available' : 'Borrowed'}
                  </span>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && books.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No books found. Add some books to get started!</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/books" className="btn-secondary text-center">
            Browse Books
          </Link>
          <Link href="/authors" className="btn-secondary text-center">
            View Authors
          </Link>
          <button className="btn-secondary">
            Search Catalog
          </button>
        </div>
      </div>
    </div>
  )
}