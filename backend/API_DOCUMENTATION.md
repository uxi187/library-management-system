# 📚 Library Management System API Documentation

## Base URL
```
http://localhost:3001
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
- **Registration**: 5 requests per hour per IP ✅ **ACTIVE**
- **Login**: ⚠️ **TEMPORARILY DISABLED** (for debugging)
- **Other endpoints**: No rate limiting

## CORS Configuration
- **Current**: Very permissive (allows all origins) for development/testing
- **Headers**: All common headers allowed including Authorization
- **Methods**: GET, POST, PUT, DELETE, OPTIONS

## Security Middleware
- **Helmet**: ⚠️ **TEMPORARILY DISABLED** (for debugging)
- **Request Logging**: ✅ **ACTIVE** (comprehensive debug logging enabled)

---

## 🔐 Authentication Endpoints

### POST /register
Register a new user account.

**Rate Limiting**: ✅ 5 requests per hour per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "phone": "555-0123",
  "address": "123 Main St",
  "membershipType": "STANDARD"
}
```

**Validation Rules:**
- `email`: Valid email format (required)
- `firstName`: 2-50 characters (required)
- `lastName`: 2-50 characters (required)
- `password`: Minimum 6 characters (required)
- `phone`: Optional string
- `address`: Optional string
- `membershipType`: One of: STANDARD, PREMIUM, STUDENT, STAFF (default: STANDARD)

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "userId": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "membershipType": "STANDARD",
    "membershipDate": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Validation error
- `409`: User already exists
- `429`: Rate limit exceeded
- `500`: Internal server error

---

### POST /login
Authenticate an existing user.

**Rate Limiting**: ⚠️ **TEMPORARILY DISABLED** (for debugging)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `email`: Valid email format (required)
- `password`: Required

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "userId": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "membershipType": "STANDARD"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Validation error
- `401`: Invalid credentials
- `500`: Internal server error

---

## 📚 Books Endpoints

### GET /books
Retrieve a paginated list of books with optional filtering.

**Authentication**: Not required (public endpoint)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category (case-insensitive)
- `author` (optional): Filter by author (case-insensitive)
- `search` (optional): Search in title, author, or description (case-insensitive)

**Example Request:**
```
GET /books?page=1&limit=5&category=fiction&search=javascript
```

**Success Response (200):**
```json
{
  "books": [
    {
      "bookId": 1,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "isbn": "978-0132350884",
      "category": "Programming",
      "totalCopies": 5,
      "availableCopies": 3,
      "description": "A Handbook of Agile Software Craftsmanship",
      "publishedYear": 2008,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

### GET /books/:id
Retrieve details of a specific book including current borrowers.

**Authentication**: Not required (public endpoint)

**URL Parameters:**
- `id`: Book ID (integer)

**Success Response (200):**
```json
{
  "bookId": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "978-0132350884",
  "category": "Programming",
  "totalCopies": 5,
  "availableCopies": 3,
  "description": "A Handbook of Agile Software Craftsmanship",
  "publishedYear": 2008,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "borrowRecords": [
    {
      "borrowId": 1,
      "userId": 2,
      "borrowDate": "2024-01-15T00:00:00.000Z",
      "dueDate": "2024-01-29T00:00:00.000Z",
      "status": "BORROWED",
      "user": {
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com"
      }
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid book ID
- `404`: Book not found
- `500`: Internal server error

---

## 📋 Borrowing Endpoints

### POST /borrow
Borrow a book (requires authentication).

**Authentication**: Required (JWT token)

**Request Body:**
```json
{
  "userId": 1,
  "bookId": 5,
  "dueDate": "2024-02-15T00:00:00.000Z"
}
```

**Validation Rules:**
- `userId`: Positive integer (required)
- `bookId`: Positive integer (required)
- `dueDate`: Valid date (optional, defaults to 14 days from now)

**Success Response (201):**
```json
{
  "message": "Book borrowed successfully",
  "borrowRecord": {
    "borrowId": 1,
    "userId": 1,
    "bookId": 5,
    "borrowDate": "2024-01-15T00:00:00.000Z",
    "dueDate": "2024-01-29T00:00:00.000Z",
    "status": "BORROWED",
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "book": {
      "title": "JavaScript: The Good Parts",
      "author": "Douglas Crockford",
      "isbn": "978-0596517748"
    }
  }
}
```

**Error Responses:**
- `400`: Validation error or book not available
- `401`: Authentication required
- `404`: Book not found
- `500`: Internal server error

---

### POST /return
Return a borrowed book (requires authentication).

**Authentication**: Required (JWT token)

**Request Body:**
```json
{
  "borrowId": 1
}
```

**Success Response (200):**
```json
{
  "message": "Book returned successfully",
  "borrowRecord": {
    "borrowId": 1,
    "userId": 1,
    "bookId": 5,
    "borrowDate": "2024-01-15T00:00:00.000Z",
    "dueDate": "2024-01-29T00:00:00.000Z",
    "returnDate": "2024-01-25T00:00:00.000Z",
    "status": "RETURNED",
    "fineAmount": 0,
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "book": {
      "title": "JavaScript: The Good Parts",
      "author": "Douglas Crockford",
      "isbn": "978-0596517748"
    }
  },
  "fine": "No fine"
}
```

**Error Responses:**
- `400`: Missing borrow ID or book already returned
- `401`: Authentication required
- `404`: Borrow record not found
- `500`: Internal server error

---

### GET /my-borrows/:userId
Get borrowing history for a user (requires authentication).

**Authentication**: Required (JWT token)
**Authorization**: Users can only access their own records or staff/admin can access any

**URL Parameters:**
- `userId`: User ID (integer)

**Query Parameters:**
- `status` (optional): Filter by status (all, BORROWED, RETURNED, OVERDUE) (default: all)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "borrowRecords": [
    {
      "borrowId": 1,
      "bookId": 5,
      "borrowDate": "2024-01-15T00:00:00.000Z",
      "dueDate": "2024-01-29T00:00:00.000Z",
      "returnDate": "2024-01-25T00:00:00.000Z",
      "status": "RETURNED",
      "fineAmount": 0,
      "book": {
        "title": "JavaScript: The Good Parts",
        "author": "Douglas Crockford",
        "isbn": "978-0596517748",
        "category": "Programming"
      }
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Error Responses:**
- `400`: Invalid user ID
- `401`: Authentication required
- `403`: Access denied (not your records and not staff/admin)
- `500`: Internal server error

---

## 👤 User Profile Endpoints

### GET /profile
Get current user's profile information (requires authentication).

**Authentication**: Required (JWT token)

**Success Response (200):**
```json
{
  "user": {
    "userId": 1,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "555-0123",
    "address": "123 Main St",
    "membershipType": "STANDARD",
    "membershipDate": "2024-01-01T00:00:00.000Z",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Authentication required
- `500`: Internal server error

---

## 🔧 Utility Endpoints

### GET /health
Health check endpoint to verify the API is running.

**Authentication**: Not required (public endpoint)

**Success Response (200):**
```json
{
  "status": "OK",
  "message": "Library App Backend is running",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

---

### ALL /test
Debug endpoint for testing API connectivity (temporary).

**Authentication**: Not required (public endpoint)
**Methods**: GET, POST, PUT, DELETE, OPTIONS

**Success Response (200):**
```json
{
  "message": "Test endpoint works",
  "method": "GET",
  "headers": {
    "user-agent": "PostmanRuntime/7.45.0",
    "accept": "*/*",
    "host": "localhost:3001"
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

---

## 🚨 Error Handling

### Standard Error Response Format
```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created successfully
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (resource already exists)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

---

## 🧪 Testing Guide

### Prerequisites
1. Start the Docker containers:
   ```bash
   docker-compose up -d db backend
   ```

2. Wait for containers to be healthy:
   ```bash
   docker-compose ps
   ```

### Test Data Setup
The system comes with seeded data. To create a test user for API testing:

**Register a test user:**
```bash
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.user@example.com",
    "firstName": "Test",
    "lastName": "User", 
    "password": "testpass123",
    "membershipType": "STANDARD"
  }'
```

**Login and get token:**
```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.user@example.com",
    "password": "testpass123"
  }'
```

### Test Credentials
- **Email**: `test.user@example.com`
- **Password**: `testpass123`
- **User ID**: Will be returned in login response

### Common Test Scenarios

1. **Health Check**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Get All Books**:
   ```bash
   curl http://localhost:3001/books
   ```

3. **Search Books**:
   ```bash
   curl "http://localhost:3001/books?search=javascript&category=programming"
   ```

4. **Authenticated Request** (replace TOKEN with actual JWT):
   ```bash
   curl -X GET http://localhost:3001/profile \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### Debugging
- **Debug Logging**: All requests are logged with detailed information
- **CORS**: Very permissive for development (allows all origins)
- **Rate Limiting**: Disabled on login endpoint for testing

---

## 🔒 Security Notes

### Current Development Configuration
⚠️ **This configuration is for development/testing only**

- **CORS**: Very permissive (allows all origins)
- **Rate Limiting**: Partially disabled for debugging
- **Helmet**: Temporarily disabled
- **Debug Logging**: Comprehensive request logging enabled

### Production Recommendations
For production deployment, ensure:
- ✅ Enable Helmet security headers
- ✅ Configure strict CORS origins
- ✅ Enable all rate limiting
- ✅ Disable debug logging
- ✅ Use secure JWT secrets
- ✅ Enable HTTPS
- ✅ Use environment variables for all secrets

### JWT Configuration
- **Default Secret**: `your-super-secret-jwt-key-change-this-in-production`
- **Token Expiry**: 24 hours
- **Algorithm**: HS256

---

## 📝 Change Log

### Current Version (Latest)
- ✅ Base URL updated to `localhost:3001` (resolved port conflict)
- ⚠️ Login rate limiting temporarily disabled for debugging
- ⚠️ Helmet security headers temporarily disabled
- ✅ Comprehensive debug logging enabled
- ✅ CORS configured for development (very permissive)
- ✅ Test endpoint `/test` added for debugging
- ✅ Server binding fixed to `0.0.0.0` for external access

### Previous Versions
- Initial API implementation with full security middleware
- Registration, login, books, borrowing, and profile endpoints
- JWT authentication with proper validation
- Rate limiting on registration and login
- Comprehensive error handling and validation