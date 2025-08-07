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
- Registration: 5 requests per hour per IP
- Login: 5 requests per 15 minutes per IP

---

## 🔐 Authentication Endpoints

### POST /register
Register a new user account.

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
    "membershipDate": "2024-08-05",
    "createdAt": "2024-08-05T08:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

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

---

## 📚 Books Endpoints

### GET /books
Get all books with optional filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category (case-insensitive)
- `author`: Filter by author (case-insensitive)
- `search`: Search in title, author, or description (case-insensitive)

**Example:**
```
GET /books?page=1&limit=5&category=fiction&search=dan brown
```

**Success Response (200):**
```json
{
  "books": [
    {
      "bookId": 1,
      "isbn": "978-0-7432-7356-5",
      "title": "The Da Vinci Code",
      "author": "Dan Brown",
      "publisher": "Doubleday",
      "publicationYear": 2003,
      "category": "Fiction",
      "language": "English",
      "pages": 454,
      "description": "A mystery thriller novel",
      "locationShelf": "A1-001",
      "totalCopies": 3,
      "availableCopies": 2,
      "createdAt": "2024-08-05T08:00:00.000Z",
      "updatedAt": "2024-08-05T08:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 5,
    "totalPages": 2
  }
}
```

### GET /books/:id
Get a specific book by ID with current borrowers.

**Success Response (200):**
```json
{
  "bookId": 1,
  "isbn": "978-0-7432-7356-5",
  "title": "The Da Vinci Code",
  "author": "Dan Brown",
  "publisher": "Doubleday",
  "publicationYear": 2003,
  "category": "Fiction",
  "language": "English",
  "pages": 454,
  "description": "A mystery thriller novel",
  "locationShelf": "A1-001",
  "totalCopies": 3,
  "availableCopies": 2,
  "createdAt": "2024-08-05T08:00:00.000Z",
  "updatedAt": "2024-08-05T08:00:00.000Z",
  "borrowRecords": [
    {
      "borrowId": 1,
      "userId": 1,
      "bookId": 1,
      "borrowDate": "2024-08-01",
      "dueDate": "2024-08-15",
      "status": "BORROWED",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@email.com"
      }
    }
  ]
}
```

---

## 🔄 Borrowing Endpoints

### POST /borrow
Borrow a book (requires authentication).

**Request Body:**
```json
{
  "userId": 1,
  "bookId": 1,
  "dueDate": "2024-08-20"
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
    "bookId": 1,
    "borrowDate": "2024-08-05",
    "dueDate": "2024-08-19",
    "status": "BORROWED",
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@email.com"
    },
    "book": {
      "title": "The Da Vinci Code",
      "author": "Dan Brown",
      "isbn": "978-0-7432-7356-5"
    }
  }
}
```

**Error Responses:**
- `400`: Book not available, user already has this book, validation errors
- `404`: Book not found

### POST /return
Return a borrowed book (requires authentication).

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
    "bookId": 1,
    "borrowDate": "2024-08-05",
    "dueDate": "2024-08-19",
    "returnDate": "2024-08-18",
    "status": "RETURNED",
    "fineAmount": 0.00,
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@email.com"
    },
    "book": {
      "title": "The Da Vinci Code",
      "author": "Dan Brown",
      "isbn": "978-0-7432-7356-5"
    }
  },
  "fine": "No fine"
}
```

**Fine Calculation:**
- $1.00 per day overdue
- Automatically calculated and applied

---

## 👤 User Endpoints

### GET /my-borrows/:userId
Get user's borrowing history (requires authentication).

**Query Parameters:**
- `status`: Filter by status (all, BORROWED, RETURNED, OVERDUE) (default: all)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Authorization:**
- Users can only access their own records
- STAFF and ADMIN can access any user's records

**Success Response (200):**
```json
{
  "borrowRecords": [
    {
      "borrowId": 1,
      "userId": 1,
      "bookId": 1,
      "borrowDate": "2024-08-05",
      "dueDate": "2024-08-19",
      "returnDate": null,
      "status": "BORROWED",
      "fineAmount": 0.00,
      "book": {
        "title": "The Da Vinci Code",
        "author": "Dan Brown",
        "isbn": "978-0-7432-7356-5",
        "category": "Fiction"
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

### GET /profile
Get current user's profile (requires authentication).

**Success Response (200):**
```json
{
  "user": {
    "userId": 1,
    "email": "john.doe@email.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "555-0123",
    "address": "123 Main St",
    "membershipType": "STANDARD",
    "membershipDate": "2024-08-05",
    "isActive": true,
    "createdAt": "2024-08-05T08:00:00.000Z"
  }
}
```

---

## 🏥 Health Check

### GET /health
Check if the API is running.

**Success Response (200):**
```json
{
  "status": "OK",
  "message": "Library App Backend is running",
  "timestamp": "2024-08-05T08:00:00.000Z"
}
```

---

## 🚨 Error Responses

### Common Error Formats

**Validation Error (400):**
```json
{
  "error": "\"email\" must be a valid email"
}
```

**Authentication Error (401):**
```json
{
  "error": "Access token required"
}
```

**Authorization Error (403):**
```json
{
  "error": "Access denied"
}
```

**Not Found Error (404):**
```json
{
  "error": "Book not found"
}
```

**Conflict Error (409):**
```json
{
  "error": "User with this email already exists"
}
```

**Rate Limit Error (429):**
```json
{
  "error": "Too many login attempts from this IP, please try again after 15 minutes."
}
```

**Server Error (500):**
```json
{
  "error": "Internal server error"
}
```

---

## 🧪 Testing Examples

### Using curl

**Register a new user:**
```bash
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get books:**
```bash
curl -X GET "http://localhost:3001/books?page=1&limit=5&search=dan"
```

**Borrow a book (with auth token):**
```bash
curl -X POST http://localhost:3001/borrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": 1,
    "bookId": 1
  }'
```

### Testing with existing users
You can login with any of these test accounts (password: "password123"):
- john.doe@email.com
- jane.smith@email.com  
- bob.johnson@email.com
- alice.brown@email.com

---

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://admin:admin123@db:5432/library_db?schema=public"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

---

## 🚀 Running the API

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

3. **Start the server:**
   ```bash
   npm run dev  # Development mode
   npm start    # Production mode
   ```

The API will be available at `http://localhost:3001`