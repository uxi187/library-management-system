# Library Management System - Frontend

A modern Next.js frontend for the Library Management System, built with TypeScript and TailwindCSS.

## Features

### 🔐 Authentication
- **User Registration**: Complete signup form with validation
- **User Login**: Secure authentication with JWT tokens
- **Auto-logout**: Automatic logout on token expiration
- **Protected Routes**: Authentication-aware navigation

### 📚 Book Management
- **Book List**: Paginated grid view with search and filtering
- **Book Details**: Comprehensive book information with borrow functionality
- **Search & Filter**: Search by title, author, or description; filter by category and author
- **Real-time Availability**: Live updates of book availability

### 📋 Borrowing System
- **Borrow Books**: One-click borrowing for authenticated users
- **Return Books**: Easy book return functionality
- **Borrowing History**: Complete history with status tracking
- **Status Management**: BORROWED, RETURNED, OVERDUE status indicators

### 🎨 User Experience
- **Responsive Design**: Mobile-first responsive layout
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: Comprehensive error messages and recovery
- **Success Feedback**: Toast notifications for successful actions
- **Accessibility**: ARIA labels and keyboard navigation

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom theme
- **Icons**: Heroicons
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context for authentication
- **UI Components**: Custom components with HeadlessUI

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Library backend running on port 3001

### Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment setup**:
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NODE_ENV=development
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open http://localhost:3000 in your browser

## API Integration

### Base Configuration
- **Base URL**: `http://localhost:3001` (configurable via environment)
- **Authentication**: JWT tokens in Authorization headers
- **Error Handling**: Automatic token refresh and logout on 401 errors

### Key Endpoints Used
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /profile` - User profile
- `GET /books` - Book listing with pagination/search
- `GET /books/:id` - Book details
- `POST /borrow` - Borrow a book
- `POST /return` - Return a book
- `GET /my-borrows/:userId` - User's borrowing history

## Project Structure

```
frontend/
├── app/                          # App Router pages
│   ├── book/[id]/page.tsx       # Book details page
│   ├── login/page.tsx           # Login page
│   ├── register/page.tsx        # Registration page
│   ├── my-borrows/page.tsx      # User borrowing history
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page (book list)
│   └── globals.css              # Global styles
├── components/                   # Reusable UI components
│   └── Navigation.tsx           # Main navigation component
├── contexts/                     # React contexts
│   └── AuthContext.tsx          # Authentication context
├── lib/                          # Utilities and configurations
│   └── api.ts                   # API client with types
└── README.md                    # This file
```

## Test Credentials

For testing purposes, use these credentials:
- **Email**: `test.user@example.com`
- **Password**: `testpass123`

## Authentication Flow

1. **Login**: User enters credentials → JWT token stored in localStorage
2. **Auto-login**: Token persists across browser sessions
3. **API Requests**: Automatic token inclusion in headers
4. **Token Expiry**: Auto-logout with redirect to login page
5. **Protected Routes**: Navigation hides/shows based on auth state

## Key Features Detail

### Search & Filtering
- **Global Search**: Searches across book titles, authors, and descriptions
- **Category Filter**: Filter books by category (case-insensitive)
- **Author Filter**: Filter books by author name (case-insensitive)
- **Real-time Results**: Live search with debouncing

### Book Borrowing
- **Availability Check**: Real-time availability display
- **User Restrictions**: Prevents multiple borrows of same book
- **Status Tracking**: BORROWED → RETURNED/OVERDUE workflow
- **Due Date Management**: Automatic overdue detection

### Responsive Design
- **Mobile Navigation**: Collapsible hamburger menu
- **Grid Layouts**: Responsive book grid (1-4 columns based on screen)
- **Touch-friendly**: Large touch targets for mobile devices
- **Progressive Enhancement**: Works without JavaScript

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality
- **TypeScript**: Full type safety with strict mode
- **ESLint**: Code linting with Next.js recommended rules
- **Consistent Formatting**: Prettier integration (if configured)

## Error Handling

### Network Errors
- **Connection Issues**: Graceful fallback with retry options
- **API Errors**: User-friendly error messages
- **Validation Errors**: Field-level validation feedback

### Authentication Errors
- **Invalid Credentials**: Clear error messaging
- **Token Expiry**: Automatic logout with redirect
- **Permission Denied**: Appropriate access control

## Performance

### Optimization Features
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js automatic image optimization
- **Caching**: Browser and API response caching
- **Lazy Loading**: Components loaded on demand

### Metrics
- **Bundle Size**: Optimized with tree shaking
- **Loading Times**: Skeleton loaders for perceived performance
- **Core Web Vitals**: Optimized for Google performance metrics

## Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Set these for production:
- `NEXT_PUBLIC_API_URL` - Production API URL
- `NODE_ENV=production`

### Docker Support
The project includes Docker configuration for containerized deployment.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow TypeScript strict mode guidelines
2. Use TailwindCSS for all styling
3. Include proper error handling for all async operations
4. Add loading states for all user interactions
5. Ensure mobile responsiveness for all new features

## Troubleshooting

### Common Issues

**Frontend not connecting to backend**:
- Check API URL in environment variables
- Ensure backend is running on port 3001
- Verify CORS configuration in backend

**Authentication not working**:
- Clear localStorage and cookies
- Check JWT token in browser dev tools
- Verify backend authentication endpoints

**Styling issues**:
- Rebuild TailwindCSS: `npm run build`
- Check for conflicting CSS classes
- Verify TailwindCSS configuration
