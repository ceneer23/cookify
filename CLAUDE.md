# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cookify is a full-stack MERN food delivery web application with separate frontend and backend directories:
- **Frontend**: React + Vite + TailwindCSS (planned)
- **Backend**: Node.js + Express + MongoDB (planned, currently minimal setup)

## Architecture

**Current State**: Early development phase
- Frontend uses modern React 19 with Vite build system
- Backend has minimal package.json setup with empty server.js
- Project follows MVC architecture pattern (per requirements)

**Tech Stack (from Requirements.txt)**:
- Frontend: React, TailwindCSS, React Router, Axios, JWT auth
- Backend: Node.js, Express, Mongoose, JWT, Bcrypt
- Database: MongoDB Atlas
- Integrations: Stripe payments, Cloudinary uploads

## Development Commands

### Frontend (CookifyFrontend/)
```bash
cd "CookifyFrontend"
npm run dev          # Start development server
npm run build        # Build for production  
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (Cookify Backend/)
```bash
cd "Cookify Backend"
# No scripts currently configured - needs setup
```

## Project Structure

```
Cookify WebApp/
├── CookifyFrontend/           # React frontend (Vite)
├── Cookify Backend/           # Node.js backend (minimal)
├── Requirements.txt           # Complete project specifications
└── CLAUDE.md                 # This file
```

## Key Implementation Notes

1. **Directory Naming**: Inconsistent spacing - frontend lacks space, backend includes space in name
2. **Backend Setup Needed**: Currently has empty server.js and minimal package.json
3. **TailwindCSS Missing**: Required by specs but not yet configured in frontend
4. **MVC Pattern**: Backend should follow Model-View-Controller architecture
5. **Authentication**: JWT-based with role-based access (admin, user, restaurant_owner)

## API Structure (Planned)

Based on Requirements.txt, implement these endpoints:
- `/api/auth` - Authentication routes
- `/api/restaurants` - Restaurant management
- `/api/menus` - Menu CRUD operations  
- `/api/orders` - Order processing
- `/api/reviews` - Review system
- `/api/admin` - Admin dashboard functionality

## Security Requirements

- Password hashing with Bcrypt
- JWT token authentication
- Role-based middleware
- Input validation
- Rate limiting and Helmet middleware

## Development Workflow

When setting up new features:
1. Frontend components should follow existing React patterns
2. Backend should implement MVC structure with proper middleware
3. All routes require appropriate authentication/authorization
4. Use environment variables for sensitive configuration