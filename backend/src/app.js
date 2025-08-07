const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const joi = require('joi');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Rate limiting
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 account creation requests per windowMs
  message: { error: 'Too many accounts created from this IP, please try again after an hour.' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes.' }
});

// Middleware - TEMPORARILY MINIMAL FOR DEBUGGING
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Debug logging
app.use((req, res, next) => {
  console.log('=== REQUEST DEBUG ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('IP:', req.ip);
  console.log('User-Agent:', req.get('User-Agent'));
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('========================');
  next();
});

// CORS - Very permissive for testing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Validation schemas
const registerSchema = joi.object({
  email: joi.string().email().required(),
  firstName: joi.string().min(2).max(50).required(),
  lastName: joi.string().min(2).max(50).required(),
  password: joi.string().min(6).required(),
  phone: joi.string().optional(),
  address: joi.string().optional(),
  membershipType: joi.string().valid('STANDARD', 'PREMIUM', 'STUDENT', 'STAFF').default('STANDARD')
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required()
});

const borrowSchema = joi.object({
  userId: joi.number().integer().positive().required(),
  bookId: joi.number().integer().positive().required(),
  dueDate: joi.date().optional()
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
      select: { userId: true, email: true, firstName: true, lastName: true, membershipType: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Library App Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Simple test endpoint with no middleware
app.all('/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint works',
    method: req.method,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Authentication Routes

// Register new user
app.post('/register', createAccountLimiter, async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, firstName, lastName, password, phone, address, membershipType } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        phone,
        address,
        membershipType
      },
      select: {
        userId: true,
        email: true,
        firstName: true,
        lastName: true,
        membershipType: true,
        membershipDate: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
app.post('/login', /* loginLimiter, */ async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        membershipType: user.membershipType
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Books Routes

// Get all books
app.get('/books', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, author, search } = req.query;
    const skip = (page - 1) * limit;

    let where = {};
    
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }
    
    if (author) {
      where.author = { contains: author, mode: 'insensitive' };
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { title: 'asc' }
      }),
      prisma.book.count({ where })
    ]);

    res.json({
      books,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get book by ID
app.get('/books/:id', async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }

    const book = await prisma.book.findUnique({
      where: { bookId },
      include: {
        borrowRecords: {
          where: { status: { in: ['BORROWED', 'OVERDUE'] } },
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);

  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Borrowing Routes

// Borrow a book
app.post('/borrow', authenticateToken, async (req, res) => {
  try {
    const { error, value } = borrowSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { userId, bookId, dueDate } = value;

    // Check if book exists and is available
    const book = await prisma.book.findUnique({
      where: { bookId }
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ error: 'Book is not available for borrowing' });
    }

    // Check if user already has this book borrowed
    const existingBorrow = await prisma.borrowRecord.findFirst({
      where: {
        userId,
        bookId,
        status: { in: ['BORROWED', 'OVERDUE'] }
      }
    });

    if (existingBorrow) {
      return res.status(400).json({ error: 'User already has this book borrowed' });
    }

    // Calculate due date (14 days from now if not provided)
    const calculatedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Create borrow record and update book availability in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const borrowRecord = await tx.borrowRecord.create({
        data: {
          userId,
          bookId,
          dueDate: calculatedDueDate,
          status: 'BORROWED'
        },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          },
          book: {
            select: { title: true, author: true, isbn: true }
          }
        }
      });

      await tx.book.update({
        where: { bookId },
        data: { availableCopies: { decrement: 1 } }
      });

      return borrowRecord;
    });

    res.status(201).json({
      message: 'Book borrowed successfully',
      borrowRecord: result
    });

  } catch (error) {
    console.error('Error borrowing book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Return a book
app.post('/return', authenticateToken, async (req, res) => {
  try {
    const { borrowId } = req.body;

    if (!borrowId) {
      return res.status(400).json({ error: 'Borrow ID is required' });
    }

    // Find the borrow record
    const borrowRecord = await prisma.borrowRecord.findUnique({
      where: { borrowId },
      include: {
        book: true,
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!borrowRecord) {
      return res.status(404).json({ error: 'Borrow record not found' });
    }

    if (borrowRecord.status === 'RETURNED') {
      return res.status(400).json({ error: 'Book already returned' });
    }

    // Calculate fine if overdue
    const today = new Date();
    const dueDate = new Date(borrowRecord.dueDate);
    let fineAmount = 0;

    if (today > dueDate) {
      const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = daysOverdue * 1.0; // $1 per day overdue
    }

    // Update borrow record and book availability in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedBorrowRecord = await tx.borrowRecord.update({
        where: { borrowId },
        data: {
          status: 'RETURNED',
          returnDate: today,
          fineAmount
        },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          },
          book: {
            select: { title: true, author: true, isbn: true }
          }
        }
      });

      await tx.book.update({
        where: { bookId: borrowRecord.bookId },
        data: { availableCopies: { increment: 1 } }
      });

      return updatedBorrowRecord;
    });

    res.json({
      message: 'Book returned successfully',
      borrowRecord: result,
      fine: fineAmount > 0 ? `$${fineAmount.toFixed(2)}` : 'No fine'
    });

  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's borrowing history
app.get('/my-borrows/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user is accessing their own records or is admin/staff
    if (req.user.userId !== userId && !['STAFF', 'ADMIN'].includes(req.user.membershipType)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status = 'all', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let where = { userId };
    if (status !== 'all') {
      where.status = status.toUpperCase();
    }

    const [borrowRecords, total] = await Promise.all([
      prisma.borrowRecord.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          book: {
            select: { title: true, author: true, isbn: true, category: true }
          }
        },
        orderBy: { borrowDate: 'desc' }
      }),
      prisma.borrowRecord.count({ where })
    ]);

    res.json({
      borrowRecords,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching borrow records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route to get user profile
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      select: {
        userId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        membershipType: true,
        membershipDate: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Library API Server is running on port ${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;