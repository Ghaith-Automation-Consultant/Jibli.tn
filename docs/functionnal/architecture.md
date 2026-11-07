# Jibli.tn - Architecture Documentation

> **Outdated:** this describes the earlier Express + static HTML version, which is now legacy.
> The current design is in [../tech/system-design.md](../tech/system-design.md).

**Last Updated:** 2026-01-26  
**Version:** 1.0.0

---

## System Architecture Overview

Jibli.tn follows a **three-tier architecture** pattern with clear separation between presentation, business logic, and data layers.

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        HTML[HTML Pages]
        CSS[Tailwind CSS]
        JS[JavaScript Modules]
    end
    
    subgraph "Application Layer"
        Express[Express Server]
        Routes[API Routes]
        Middleware[Middleware Layer]
        Controllers[Controllers]
    end
    
    subgraph "Data Layer"
        Mongoose[Mongoose ODM]
        MongoDB[(MongoDB Database)]
    end
    
    Browser --> HTML
    Browser --> CSS
    Browser --> JS
    JS -->|HTTP/REST| Express
    Express --> Routes
    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> Mongoose
    Mongoose --> MongoDB
```

---

## Component Architecture

### Frontend Architecture

```mermaid
graph LR
    subgraph "Frontend Modules"
        Main[main.js<br/>App Initialization]
        Data[data.js<br/>API Client]
        Render[render.js<br/>UI Components]
        Dashboard[dashboard.js<br/>Dashboard Logic]
        Search[recherche.js<br/>Search Logic]
    end
    
    subgraph "Pages"
        Index[index.html]
        Recherche[recherche.html]
        Poster[poster-annonce.html]
        Voyage[voyage.html]
        Dash[dashboard.html]
    end
    
    Main --> Data
    Main --> Render
    Dashboard --> Data
    Dashboard --> Render
    Search --> Data
    Search --> Render
    
    Index --> Main
    Recherche --> Search
    Poster --> Main
    Voyage --> Main
    Dash --> Dashboard
```

**Key Responsibilities:**
- **main.js:** Event handling, form submissions, authentication flow
- **data.js:** API communication, JWT token management, state
- **render.js:** HTML generation, UI component rendering
- **dashboard.js:** User dashboard logic, trip/request management
- **recherche.js:** Search and filter logic

---

### Backend Architecture

```mermaid
graph TB
    subgraph "API Layer"
        AuthRoute[/api/auth]
        TripsRoute[/api/trips]
        RequestsRoute[/api/requests]
        UsersRoute[/api/users]
    end
    
    subgraph "Middleware Layer"
        AuthMW[Auth Middleware<br/>JWT Verification]
        ValidMW[Validation Middleware<br/>Input Validation]
        ErrorMW[Error Middleware<br/>Error Handling]
    end
    
    subgraph "Controller Layer"
        AuthCtrl[Auth Controller<br/>Login/Register]
        TripCtrl[Trip Controller<br/>CRUD Operations]
        ReqCtrl[Request Controller<br/>CRUD Operations]
    end
    
    subgraph "Model Layer"
        UserModel[User Model<br/>Mongoose Schema]
        TripModel[Trip Model<br/>Mongoose Schema]
        RequestModel[Request Model<br/>Mongoose Schema]
    end
    
    AuthRoute --> AuthMW
    TripsRoute --> AuthMW
    RequestsRoute --> AuthMW
    UsersRoute --> AuthMW
    
    AuthMW --> ValidMW
    ValidMW --> AuthCtrl
    ValidMW --> TripCtrl
    ValidMW --> ReqCtrl
    
    AuthCtrl --> UserModel
    TripCtrl --> TripModel
    ReqCtrl --> RequestModel
    
    AuthCtrl --> ErrorMW
    TripCtrl --> ErrorMW
    ReqCtrl --> ErrorMW
```

---

## Data Flow Diagrams

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Express
    participant AuthCtrl
    participant MongoDB
    
    User->>Browser: Enter credentials
    Browser->>Express: POST /api/auth/login
    Express->>AuthCtrl: Validate & authenticate
    AuthCtrl->>MongoDB: Find user by email
    MongoDB-->>AuthCtrl: User document
    AuthCtrl->>AuthCtrl: Verify password (bcrypt)
    AuthCtrl->>AuthCtrl: Generate JWT token
    AuthCtrl-->>Express: Token + user data
    Express-->>Browser: 200 OK + JWT
    Browser->>Browser: Store token in localStorage
    Browser-->>User: Redirect to dashboard
```

### Trip Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Express
    participant AuthMW
    participant ValidMW
    participant TripCtrl
    participant MongoDB
    
    User->>Browser: Fill trip form
    Browser->>Express: POST /api/trips<br/>(with JWT header)
    Express->>AuthMW: Verify JWT token
    AuthMW->>AuthMW: Decode & validate token
    AuthMW->>ValidMW: Token valid, proceed
    ValidMW->>ValidMW: Validate trip data
    ValidMW->>TripCtrl: Data valid, create trip
    TripCtrl->>MongoDB: Insert trip document
    MongoDB-->>TripCtrl: Created trip
    TripCtrl-->>Express: 201 Created
    Express-->>Browser: Trip data
    Browser-->>User: Success message
```

### Search Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Express
    participant TripCtrl
    participant MongoDB
    
    User->>Browser: Enter search filters
    Browser->>Express: GET /api/trips?from=Paris&to=Tunis
    Express->>TripCtrl: Handle search request
    TripCtrl->>TripCtrl: Build MongoDB query
    TripCtrl->>MongoDB: Find trips (with filters)
    MongoDB-->>TripCtrl: Matching trips
    TripCtrl->>TripCtrl: Apply pagination
    TripCtrl-->>Express: Paginated results
    Express-->>Browser: { data: [...], pagination: {...} }
    Browser->>Browser: Render trip cards
    Browser-->>User: Display results
```

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ TRIP : creates
    USER ||--o{ REQUEST : creates
    
    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string phone
        string bio
        date createdAt
        date updatedAt
    }
    
    TRIP {
        ObjectId _id PK
        ObjectId userId FK
        string from
        string to
        date date
        number availableWeight
        number pricePerKg
        string type
        string description
        date createdAt
        date updatedAt
    }
    
    REQUEST {
        ObjectId _id PK
        ObjectId userId FK
        string from
        string to
        string itemType
        number weight
        number budget
        string description
        boolean urgent
        date createdAt
        date updatedAt
    }
```

---

## Security Architecture

### Authentication & Authorization Flow

```mermaid
graph TB
    subgraph "Client"
        Login[Login Form]
        Token[JWT Token<br/>localStorage]
    end
    
    subgraph "Server"
        AuthEndpoint[POST /api/auth/login]
        Bcrypt[bcrypt.compare<br/>Password Verification]
        JWTSign[jwt.sign<br/>Token Generation]
        AuthMiddleware[Auth Middleware<br/>Token Verification]
    end
    
    subgraph "Database"
        UserDB[(User Collection<br/>Hashed Passwords)]
    end
    
    Login -->|email + password| AuthEndpoint
    AuthEndpoint --> UserDB
    UserDB -->|user document| Bcrypt
    Bcrypt -->|valid| JWTSign
    JWTSign -->|JWT token| Token
    Token -->|Authorization header| AuthMiddleware
    AuthMiddleware -->|req.user| ProtectedRoutes[Protected Routes]
```

**Security Measures:**
- **Password Hashing:** bcrypt with 10 salt rounds
- **Token-based Auth:** JWT with 7-day expiration
- **Stateless Sessions:** No server-side session storage
- **Protected Routes:** Middleware verification on sensitive endpoints
- **Input Validation:** Middleware validation before controller execution

---

## Deployment Architecture

### Development Environment

```mermaid
graph LR
    subgraph "Local Machine"
        Dev[Developer]
        VSCode[VS Code]
        Node[Node.js Server<br/>localhost:3000]
        Mongo[MongoDB<br/>localhost:27017]
    end
    
    Dev --> VSCode
    VSCode -->|npm start| Node
    Node --> Mongo
```

### Production Environment (Recommended)

```mermaid
graph TB
    subgraph "Client"
        Users[End Users]
    end
    
    subgraph "CDN/Static Hosting"
        Static[Static Assets<br/>HTML/CSS/JS]
    end
    
    subgraph "Application Server"
        LB[Load Balancer]
        App1[Node.js Instance 1]
        App2[Node.js Instance 2]
        App3[Node.js Instance 3]
    end
    
    subgraph "Database Cluster"
        Primary[(MongoDB Primary)]
        Secondary1[(MongoDB Secondary)]
        Secondary2[(MongoDB Secondary)]
    end
    
    Users --> Static
    Users --> LB
    LB --> App1
    LB --> App2
    LB --> App3
    App1 --> Primary
    App2 --> Primary
    App3 --> Primary
    Primary --> Secondary1
    Primary --> Secondary2
```

---

## Technology Stack Diagram

```mermaid
graph TB
    subgraph "Frontend Stack"
        HTML5[HTML5]
        Tailwind[Tailwind CSS v3]
        VanillaJS[Vanilla JavaScript ES6+]
        FontAwesome[FontAwesome 5.15]
    end
    
    subgraph "Backend Stack"
        NodeJS[Node.js 18+]
        Express[Express.js 5.x]
        JWT[jsonwebtoken]
        Bcrypt[bcrypt]
    end
    
    subgraph "Database Stack"
        MongoDB[MongoDB 7.x]
        Mongoose[Mongoose ODM]
    end
    
    subgraph "Testing Stack"
        Jest[Jest]
        Supertest[Supertest]
        Playwright[Playwright]
    end
    
    subgraph "DevOps Stack"
        NPM[npm]
        Git[Git]
        Dotenv[dotenv]
    end
```

---

## API Architecture

### RESTful Endpoint Structure

```
/api
├── /auth
│   ├── POST /register          # Create new user
│   └── POST /login             # Authenticate user
│
├── /trips
│   ├── GET /                   # List trips (with filters)
│   ├── GET /:id                # Get single trip
│   ├── POST /                  # Create trip (auth required)
│   ├── PUT /:id                # Update trip (auth required)
│   └── DELETE /:id             # Delete trip (auth required)
│
├── /requests
│   ├── GET /                   # List requests (with filters)
│   ├── GET /:id                # Get single request
│   ├── POST /                  # Create request (auth required)
│   ├── PUT /:id                # Update request (auth required)
│   └── DELETE /:id             # Delete request (auth required)
│
└── /users
    ├── GET /:id                # Get user profile
    ├── PUT /:id                # Update profile (auth required)
    └── DELETE /:id             # Delete account (auth required)
```

### Request/Response Flow

```mermaid
graph LR
    Request[HTTP Request] --> CORS[CORS Middleware]
    CORS --> BodyParser[Body Parser]
    BodyParser --> Router[Express Router]
    Router --> Auth{Auth Required?}
    Auth -->|Yes| AuthMW[Auth Middleware]
    Auth -->|No| Validation[Validation Middleware]
    AuthMW --> Validation
    Validation --> Controller[Controller]
    Controller --> Model[Mongoose Model]
    Model --> DB[(MongoDB)]
    DB --> Model
    Model --> Controller
    Controller --> Response[HTTP Response]
```

---

## File Organization

```
Jibli.tn code/
│
├── Frontend Layer
│   ├── pages/              # HTML views
│   ├── js/                 # Client-side logic
│   ├── css/                # Stylesheets
│   └── assets/             # Static assets
│
├── Backend Layer
│   ├── routes/             # API endpoints
│   ├── middleware/         # Request processing
│   ├── controllers/        # Business logic
│   ├── models/             # Data schemas
│   └── config/             # Configuration
│
├── Testing Layer
│   ├── tests/integration/  # API tests
│   ├── tests/e2e/          # UI tests
│   └── */**.test.js        # Unit tests
│
├── Documentation Layer
│   └── docs/               # Project documentation
│
└── Configuration
    ├── server.js           # Entry point
    ├── package.json        # Dependencies
    ├── jest.config.js      # Test config
    └── .env                # Environment vars
```

---

## Scalability Considerations

### Current Architecture (MVP)
- **Single Server:** One Node.js instance
- **Single Database:** One MongoDB instance
- **Suitable for:** 100-1000 concurrent users

### Phase 2 (Growth)
- **Horizontal Scaling:** Multiple Node.js instances behind load balancer
- **Database Replication:** MongoDB replica set (1 primary, 2 secondaries)
- **Caching Layer:** Redis for session management and frequent queries
- **Suitable for:** 10,000+ concurrent users

### Phase 3 (Scale)
- **Microservices:** Separate services for auth, trips, messaging
- **Database Sharding:** Distributed MongoDB across regions
- **CDN:** Static asset delivery via CloudFlare/AWS CloudFront
- **Message Queue:** RabbitMQ/Kafka for async operations
- **Suitable for:** 100,000+ concurrent users

---

## Performance Optimization

### Current Optimizations
- **Database Indexing:** Indexes on frequently queried fields (email, userId)
- **Pagination:** Limit results to 20 items per page
- **JWT Stateless:** No server-side session storage
- **Static Asset Serving:** Express static middleware

### Planned Optimizations
- **Query Optimization:** Mongoose lean() for read-only operations
- **Response Compression:** gzip middleware
- **Rate Limiting:** Prevent API abuse
- **Image Optimization:** Compress and resize uploaded images
- **Database Connection Pooling:** Reuse connections

---

## Monitoring & Logging (Planned)

```mermaid
graph TB
    App[Node.js Application]
    
    App --> Logger[Winston/Pino Logger]
    App --> Metrics[Prometheus Metrics]
    App --> APM[Application Performance Monitoring]
    
    Logger --> LogStorage[Log Storage<br/>ELK Stack]
    Metrics --> Grafana[Grafana Dashboards]
    APM --> NewRelic[New Relic/Datadog]
    
    LogStorage --> Alerts[Alert System]
    Grafana --> Alerts
    APM --> Alerts
```

---

## References

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [MongoDB Schema Design](https://www.mongodb.com/docs/manual/core/data-modeling-introduction/)
- [JWT Authentication](https://jwt.io/introduction)
- [RESTful API Design](https://restfulapi.net/)
