# Lifeline

**Where Faith meets Logic** ✨

A faith-based community dating and matchmaking application designed to connect people within religious communities through shared values and meaningful relationships.

## Overview

Lifeline is a full-stack application that facilitates authentic connections between individuals who share faith and religious values. The platform provides a secure, user-friendly experience for creating profiles, discovering matches, and building relationships within faith communities.

## Key Features

### 🔐 Authentication & User Management

- User registration (signup) and login
- Email verification workflow
- Password reset functionality
- JWT-based authentication with secure password hashing

### 👤 Comprehensive User Profiles

- Basic information (name, email, phone, gender)
- Origin details (country, state, LGA)
- Residence information (country, state, city, address)
- Occupation and personal interests
- Church affiliation and denomination
- Subscription tier management

### 💕 Intelligent Matching System

Three matching preference options:

- **My Church** - Connect with members from your church
- **My Church+** - Expand to extended church networks
- **Other Churches** - Open to faith communities beyond your church

### 💳 Subscription Model

- **Free Tier** - Basic features and limited matches
- **Premium Tier** - Enhanced features and unlimited access
- Subscription lifecycle management (active, expired, canceled)

## Tech Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT + bcryptjs
- **API:** RESTful with CORS support
- **Environment:** dotenv for configuration

### Frontend

- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router
- **Styling:** Tailwind CSS
- **Testing:** Vitest with Testing Library

## Project Structure

```
lifeline/
├── backend/
│   ├── src/
│   │   ├── index.js           # Express server entry point
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Custom middleware (auth, etc)
│   │   ├── models/            # Data models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── utils/             # Utility functions
│   ├── schema/
│   │   └── schema.sql         # PostgreSQL database schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app component with routing
│   │   ├── pages/             # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   └── ... (more pages)
│   │   ├── features/
│   │   │   └── auth/          # Auth feature components
│   │   ├── components/        # Reusable UI components
│   │   └── assets/            # Static assets
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/lifeline.git
   cd lifeline
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install

   # Create .env file with your configuration
   # Set DATABASE_URL, JWT_SECRET, PORT, etc.

   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Database Setup**
   ```bash
   # Run the schema.sql file in your PostgreSQL database
   psql -U username -d database_name -f backend/schema/schema.sql
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email address

## Development

### Backend Scripts

```bash
npm start    # Production server
npm run dev  # Development with nodemon
npm test     # Run tests
```

### Frontend Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
npm test         # Run tests
```

## Database Schema

The PostgreSQL schema includes:

- **users table** - Core user data with all profile information
- **Gender types** - Male, Female
- **Match preferences** - my-church, my-church-plus, other-churches
- **Subscription tiers** - free, premium
- **Subscription status** - active, expired, canceled

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Email verification workflow
- CORS protection
- Environment variable configuration for sensitive data

## License

ISC

## Contact & Support

For questions or support, please reach out to the development team.

---

**Lifeline** - Connecting hearts, building faith-based communities ❤️
