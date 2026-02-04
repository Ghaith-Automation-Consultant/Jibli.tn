# Jibli.tn - Project Overview

**Last Updated:** 2026-01-26  
**Version:** 1.0.0  
**Status:** MVP / Pre-Beta

---

## Executive Summary

**Jibli.tn** is a crowd-shipping platform connecting travelers with available luggage space to individuals who need to send packages between Tunisia and the diaspora (primarily France and Europe). The platform enables a peer-to-peer marketplace for package delivery, leveraging existing travel routes to provide affordable and flexible shipping solutions.

### Key Value Propositions
- **For Senders:** Affordable, flexible package delivery through trusted travelers
- **For Travelers:** Monetize unused luggage space, offset travel costs
- **For Community:** Strengthen diaspora connections, support family/business ties

---

## Technical Architecture

### High-Level Stack
```
Frontend (Client)          Backend (Server)           Database
─────────────────          ────────────────           ────────
HTML5 + Tailwind    ←→     Node.js + Express   ←→    MongoDB
Vanilla JavaScript         RESTful API                Mongoose ODM
                          JWT Authentication
```

### Technology Choices

#### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 5.x
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) with 7-day expiration
- **Security:** bcrypt password hashing (10 salt rounds)
- **API Design:** RESTful with standard HTTP methods and status codes

#### Frontend
- **Core:** Vanilla JavaScript (ES6+), HTML5
- **Styling:** Tailwind CSS v3 (local build via CLI)
- **Fonts:** Cairo (Arabic), Inter (Latin) from Google Fonts
- **Icons:** FontAwesome 5.15
- **Architecture:** Modular JS (data.js, render.js, main.js)

#### Testing
- **Unit Tests:** Jest (67 tests, ~94% coverage)
- **Integration Tests:** Supertest (30 tests, ~93% coverage)
- **E2E Tests:** Playwright (15+ tests, critical user flows)
- **Total:** 112+ tests with ~88% pass rate

#### DevOps
- **Package Manager:** npm
- **Version Control:** Git
- **Environment:** .env configuration
- **Build Tools:** Tailwind CLI for CSS compilation

---

## Project Structure

```
Jibli.tn code/
├── backend/                    # Server-side application
│   ├── config/                 # Database configuration
│   │   └── db.js              # MongoDB connection setup
│   ├── controllers/            # Business logic layer
│   │   ├── authController.js  # Registration, login, JWT
│   │   ├── tripController.js  # Trip CRUD operations
│   │   └── requestController.js # Request CRUD operations
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js            # User entity (auth + profile)
│   │   ├── Trip.js            # Travel offer entity
│   │   └── Request.js         # Package request entity
│   ├── routes/                 # Express route definitions
│   │   ├── auth.js            # /api/auth endpoints
│   │   ├── trips.js           # /api/trips endpoints
│   │   ├── requests.js        # /api/requests endpoints
│   │   └── users.js           # /api/users endpoints
│   ├── middleware/             # Express middleware
│   │   ├── auth.js            # JWT verification
│   │   ├── validation.js      # Input validation
│   │   └── error.js           # Centralized error handling
│   ├── legacy/                 # Deprecated JSON file system
│   └── seed.js                # Database seeding script
│
├── pages/                      # Frontend HTML views
│   ├── index.html             # Landing page
│   ├── recherche.html         # Search interface (trips/requests)
│   ├── poster-annonce.html    # Create trip/request form
│   ├── voyage.html            # Trip detail view
│   └── dashboard.html         # User dashboard
│
├── js/                         # Frontend JavaScript
│   ├── data.js                # API client + state management
│   ├── render.js              # UI component rendering
│   ├── main.js                # App initialization + events
│   ├── recherche.js           # Search page logic
│   └── dashboard.js           # Dashboard page logic
│
├── css/                        # Stylesheets
│   ├── input.css              # Tailwind source
│   └── output.css             # Compiled production CSS
│
├── tests/                      # Test suites
│   ├── integration/           # API integration tests
│   │   ├── auth.test.js       # Auth flow tests
│   │   ├── trips.test.js      # Trip API tests
│   │   └── requests.test.js   # Request API tests
│   ├── e2e/                   # End-to-end tests
│   │   ├── auth.spec.js       # Login/register flows
│   │   ├── trips.spec.js      # Trip management flows
│   │   └── search.spec.js     # Search functionality
│   └── setup.js               # Test configuration
│
├── docs/                       # Project documentation
│   ├── project-overview.md    # This file
│   ├── roadmap.md             # Product vision & phases
│   ├── feature-status.md      # Implementation checklist
│   ├── testing-strategy.md    # Test architecture
│   ├── technical-review.md    # Code quality assessment
│   ├── MONGODB_SETUP.md       # Database setup guide
│   └── Graphical_chart.json   # Design system tokens
│
├── assets/                     # Static assets (images, logos)
├── server.js                   # Express server entry point
├── package.json                # Dependencies & scripts
├── jest.config.js              # Jest configuration
├── playwright.config.js        # Playwright configuration
├── tailwind.config.js          # Tailwind customization
└── .env.example                # Environment variables template
```

---

## Core Features

### 1. User Authentication & Management
- **Registration:** Email/password with bcrypt hashing
- **Login:** JWT-based stateless authentication
- **Profile Management:** View/edit user information
- **Authorization:** Middleware-protected routes

### 2. Trip Management (Voyages)
- **Create Trip:** Travelers post available luggage space
- **Search Trips:** Filter by departure, arrival, date, type, weight
- **View Details:** Full trip information with traveler profile
- **Edit/Delete:** Owners can modify their trips (backend ready, UI partial)

### 3. Request Management (Demandes)
- **Create Request:** Senders post package delivery needs
- **Search Requests:** Filter by location, budget, item type
- **View Details:** Full request information with sender profile
- **Edit/Delete:** Owners can modify their requests (backend ready, UI partial)

### 4. Search & Discovery
- **Dual Search:** Separate tabs for trips and requests
- **Advanced Filters:** Location, date, price, weight, item type
- **Backend Filtering:** Server-side search with regex support
- **Pagination:** 20 items per page (backend implemented)

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - Authenticate and receive JWT token

### Trips (`/api/trips`)
- `GET /` - List all trips (with filters & pagination)
- `GET /:id` - Get single trip details
- `POST /` - Create new trip (auth required)
- `PUT /:id` - Update trip (auth required, owner only)
- `DELETE /:id` - Delete trip (auth required, owner only)

### Requests (`/api/requests`)
- `GET /` - List all requests (with filters & pagination)
- `GET /:id` - Get single request details
- `POST /` - Create new request (auth required)
- `PUT /:id` - Update request (auth required, owner only)
- `DELETE /:id` - Delete request (auth required, owner only)

### Users (`/api/users`)
- `GET /:id` - Get user profile
- `PUT /:id` - Update user profile (auth required, owner only)
- `DELETE /:id` - Delete user account (auth required, owner only)

### Health Check
- `GET /api/health` - Server status check

---

## Data Models

### User
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String,
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Trip
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  from: String (required),
  to: String (required),
  date: Date (required),
  availableWeight: Number (required),
  pricePerKg: Number,
  type: String (enum: ['gratuit', 'payant']),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Request
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  from: String (required),
  to: String (required),
  itemType: String (required),
  weight: Number (required),
  budget: Number,
  description: String,
  urgent: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Seed database (optional)
npm run seed
```

### Running Locally
```bash
# Start development server
npm start
# Server runs on http://localhost:3000

# Access the application
# Landing page: http://localhost:3000/index.html
# Search: http://localhost:3000/recherche.html
```

### Testing
```bash
# Run all backend tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run E2E with UI
npm run test:e2e:ui
```

### Building
```bash
# Compile Tailwind CSS
npm run build:css
```

---

## Current Status

### Completed ✅
- MongoDB database with Mongoose ODM
- JWT authentication system
- Complete backend API (CRUD for all entities)
- Frontend search and browse functionality
- Trip and request creation forms
- Comprehensive test suite (112+ tests)
- Responsive UI with Tailwind CSS
- Backend filtering and pagination

### In Progress 🟡
- Dashboard edit/delete UI (backend ready)
- Frontend test coverage
- Error handling improvements

### Planned ❌
- Real-time messaging between users
- Rating and review system
- Image upload for trips/requests
- Payment integration
- Mobile applications
- Advanced matching algorithm

---

## Key Metrics

### Code Quality
- **Backend Coverage:** 92-100% (controllers, middleware)
- **Test Pass Rate:** ~88% (85 passing, 11 failing)
- **Total Tests:** 96 tests across unit, integration, and E2E
- **Code Organization:** Modular MVC architecture

### Performance
- **Test Execution:** ~10 seconds for full suite
- **API Response:** Sub-100ms for most endpoints
- **Database:** MongoDB with indexed queries

---

## Security Considerations

### Implemented ✅
- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Protected API routes with auth middleware
- Input validation on all endpoints
- CORS enabled for cross-origin requests
- Environment variable configuration

### Recommended 🔜
- HTTPS in production
- Rate limiting on API endpoints
- Input sanitization against XSS
- CSRF protection
- Security headers (helmet.js)
- MongoDB connection encryption

---

## Deployment Considerations

### Prerequisites
- Node.js 18+ runtime
- MongoDB instance (local or Atlas)
- Environment variables configured

### Environment Variables
```env
MONGO_URI=mongodb://127.0.0.1:27017/jibli
JWT_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=production
```

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Use MongoDB Atlas or managed instance
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up logging (winston/pino)
- [ ] Implement rate limiting
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

---

## Team & Contribution

### Development Approach
- Modular architecture for easy collaboration
- Comprehensive test coverage for confidence
- Clear documentation for onboarding
- Git-based version control

### Code Standards
- ES6+ JavaScript
- RESTful API conventions
- Mongoose schema validation
- Jest testing patterns
- Descriptive commit messages

---

## Resources

### Documentation
- [Roadmap](roadmap.md) - Product vision and phases
- [Feature Status](feature-status.md) - Implementation checklist
- [Testing Strategy](testing-strategy.md) - Test architecture
- [Technical Review](technical-review.md) - Code quality assessment
- [MongoDB Setup](MONGODB_SETUP.md) - Database configuration

### External Links
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Jest Testing](https://jestjs.io/)
- [Playwright](https://playwright.dev/)

---

## Contact & Support

For questions, issues, or contributions, please refer to the project repository or contact the development team.

**Project Repository:** [GitHub - Jibli.tn](https://github.com/Ghaith-Automation-Consultant/Jibli.tn)
