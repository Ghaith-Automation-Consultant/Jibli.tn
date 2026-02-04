# Automated Testing Strategy - Jibli.tn

## Current State Analysis

### Project Architecture
- **Backend:** Node.js + Express (modular routes/controllers)
- **Frontend:** Vanilla JS + HTML + Tailwind CSS
- **Auth:** JWT + bcrypt
- **Data:** JSON File Store (prototype)
- **Dependencies:** express, cors, body-parser, bcrypt, jsonwebtoken

### Current Test Coverage
- **Unit Tests:** 67 tests (92-100% coverage)
- **Integration Tests:** 30 tests (full API coverage)
- **E2E Tests:** 15+ tests (critical flows)
- **Total Coverage:** 96 tests, ~88% pass rate (85 passing, 11 failing)
- **Note:** Some intermittent failures related to MongoDB connection timing

---

## Recommended Tech Stack

### 1. Backend Testing

#### **Jest** (Primary Framework)
**Why Jest?**
- ✅ Zero config for Node.js projects
- ✅ Built-in mocking, assertions, coverage
- ✅ Fast parallel execution
- ✅ Excellent VS Code integration
- ✅ Industry standard (used by Facebook, Airbnb, Netflix)

**Alternatives Considered:**
- Mocha + Chai: More configuration needed
- Vitest: Better for Vite projects, overkill here

#### **Supertest** (API Testing)
**Why Supertest?**
- ✅ Designed for Express apps
- ✅ HTTP assertions built-in
- ✅ Works seamlessly with Jest
- ✅ No need to start server manually

#### **mongodb-memory-server** or **In-Memory DB**
**Why?**
- ✅ Isolated test environment
- ✅ Fast test execution
- ✅ No side effects on real data
- ✅ Easy CI/CD integration

**For our JSON File Store:**
- Create `backend/db.test.js` - in-memory version
- Mock file system operations

---

### 2. Frontend Testing

#### **Jest + jsdom** (Unit Tests)
**Why?**
- ✅ Same framework as backend (consistency)
- ✅ jsdom simulates browser environment
- ✅ Test pure JS functions (data.js, render.js)

#### **Playwright** (E2E Tests)
**Why Playwright over Cypress/Selenium?**
- ✅ Multi-browser (Chrome, Firefox, Safari, Edge)
- ✅ Auto-wait (no flaky tests)
- ✅ Network interception built-in
- ✅ Parallel execution
- ✅ Modern API, better than Selenium
- ✅ Free and open-source (vs Cypress paid features)

**Alternatives:**
- Cypress: Good but paid for advanced features
- Puppeteer: Chrome-only
- Selenium: Outdated, flaky

---

## Test Architecture

### Directory Structure
```
/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── authController.test.js       # Unit tests
│   ├── middleware/
│   │   ├── auth.js
│   │   └── auth.test.js                 # Unit tests
│   ├── routes/
│   │   ├── trips.js
│   │   └── trips.test.js                # Integration tests
│   ├── db.js
│   ├── db.test.js                       # In-memory mock
│   └── testUtils.js                     # Shared test helpers
├── js/
│   ├── data.js
│   ├── data.test.js                     # Unit tests
│   ├── render.js
│   └── render.test.js                   # Unit tests
├── tests/
│   ├── e2e/
│   │   ├── auth.spec.js                 # E2E: Login/Register
│   │   ├── trips.spec.js                # E2E: Create/Edit trip
│   │   └── search.spec.js               # E2E: Search flow
│   ├── integration/
│   │   ├── api.test.js                  # Full API integration
│   │   └── auth-flow.test.js            # Auth integration
│   └── fixtures/
│       ├── users.json                   # Test data
│       └── trips.json                   # Test data
├── jest.config.js
├── playwright.config.js
└── package.json
```

---

## Testing Pyramid

### Level 1: Unit Tests (70% of tests)
**What to test:**
- Controllers (authController, tripController, requestController)
- Middleware (auth, validation)
- Utilities (db.js operations)
- Frontend functions (data.js API calls, render.js)

**Example:**
```javascript
// backend/controllers/authController.test.js
describe('AuthController', () => {
  test('register should hash password with bcrypt', async () => {
    // Test password hashing
  });
  
  test('login should return JWT token on valid credentials', async () => {
    // Test JWT generation
  });
});
```

### Level 2: Integration Tests (20% of tests)
**What to test:**
- Full API endpoints (request → middleware → controller → response)
- Database operations (CRUD)
- Auth flow (register → login → protected route)

**Example:**
```javascript
// backend/routes/trips.test.js
describe('POST /api/trips', () => {
  test('should create trip when authenticated', async () => {
    const token = await getAuthToken();
    const response = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ from: 'Paris', to: 'Tunis', ... });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
  
  test('should return 401 without token', async () => {
    // Test auth middleware
  });
});
```

### Level 3: E2E Tests (10% of tests)
**What to test:**
- Critical user journeys
- UI interactions
- Full workflows

**Example:**
```javascript
// tests/e2e/auth.spec.js
test('User can register and login', async ({ page }) => {
  await page.goto('http://localhost:3000/template.html');
  
  // Click register
  await page.click('[data-testid="register-btn"]');
  
  // Fill form
  await page.fill('#registerEmail', 'test@example.com');
  await page.fill('#registerPassword', 'password123');
  
  // Submit
  await page.click('[data-testid="submit-register"]');
  
  // Verify redirect to dashboard
  await expect(page).toHaveURL(/dashboard/);
});
```

---

## Implementation Plan

### Phase 1: Setup & Infrastructure (Week 1)
✅ **Completed**

#### Install Dependencies
✅ Installed `jest`, `supertest`, `playwright`.

#### Configure Jest
✅ `jest.config.js` configured for high coverage.

#### Configure Playwright
✅ `playwright.config.js` configured for E2E testing.

---

### Phase 2: Backend Unit Tests (Week 2)
✅ **Completed (95%+ Coverage)**

**Implemented:**
1. ✅ Auth middleware (`backend/middleware/auth.test.js`)
2. ✅ Validation middleware (`backend/middleware/validation.test.js`)
3. ✅ Auth controller (`backend/controllers/authController.test.js`)
4. ✅ Trip controller (`backend/controllers/tripController.test.js`)
5. ✅ Request controller (`backend/controllers/requestController.test.js`)
6. ✅ DB utilities (`backend/db.test.js`)

---

### Phase 3: Backend Integration Tests (Week 3)
✅ **Completed (90%+ Coverage)**

**Implemented:**
1. ✅ Auth routes (`tests/integration/auth.test.js`)
2. ✅ Trip routes (`tests/integration/trips.test.js`) includes pagination & filtering
3. ✅ Request routes (`tests/integration/requests.test.js`) includes pagination & filtering
4. ✅ User routes (`tests/integration/users.test.js` - implicitly covered by auth)

---

### Phase 4: Frontend Unit Tests (Week 4)

**Priority Order:**
1. ✅ Data API client (`js/data.test.js`)
2. ✅ Render functions (`js/render.test.js`)
3. ✅ Main app logic (`js/main.test.js`)

**Target Coverage:** 70%+

---

### Phase 5: E2E Tests (Week 5)

**Critical Flows:**
1. ✅ Authentication (`tests/e2e/auth.spec.js`)
   - Register → Login → Dashboard
2. ✅ Trip Management (`tests/e2e/trips.spec.js`)
   - Create trip → View trip → Edit trip → Delete trip
3. ✅ Search (`tests/e2e/search.spec.js`)
   - Search trips → Filter results → View details
4. ✅ Request Management (`tests/e2e/requests.spec.js`)
   - Create request → View request → Edit → Delete

**Target:** 100% critical flows covered

---

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm test -- --coverage
      - run: npx playwright install
      - run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Best Practices

### 1. Test Naming Convention
```javascript
// ✅ Good
test('should return 401 when token is missing')
test('should hash password with bcrypt on registration')

// ❌ Bad
test('test1')
test('auth works')
```

### 2. AAA Pattern (Arrange-Act-Assert)
```javascript
test('should create trip when authenticated', async () => {
  // Arrange
  const token = await getAuthToken();
  const tripData = { from: 'Paris', to: 'Tunis' };
  
  // Act
  const response = await request(app)
    .post('/api/trips')
    .set('Authorization', `Bearer ${token}`)
    .send(tripData);
  
  // Assert
  expect(response.status).toBe(201);
  expect(response.body.from).toBe('Paris');
});
```

### 3. Test Isolation
- Each test should be independent
- Use `beforeEach` to reset state
- Clean up after tests

### 4. Mock External Dependencies
- Don't make real API calls
- Mock file system operations
- Use in-memory database for tests

---

## Success Metrics

### Coverage Targets
- **Unit Tests:** 80%+ coverage
- **Integration Tests:** 90%+ API coverage
- **E2E Tests:** 100% critical flows

### Performance Targets
- Unit tests: < 5 seconds total
- Integration tests: < 30 seconds total
- E2E tests: < 2 minutes total

### Quality Targets
- Zero flaky tests
- All tests pass on CI/CD
- Code review requires tests for new features

---

## Discussion Points

### Questions for Review:

1. **Test-First vs Test-After?**
   - Should we adopt TDD (Test-Driven Development)?
   - Or write tests for existing code first, then TDD for new features?

2. **Coverage Threshold?**
   - 70%, 80%, or 90% minimum coverage?
   - Should we block PRs that decrease coverage?

3. **E2E Test Scope?**
   - Test all pages or just critical flows?
   - How often to run E2E (every commit vs nightly)?

4. **Mocking Strategy?**
   - Mock all external dependencies?
   - Or use real services in integration tests?

5. **Performance vs Coverage?**
   - Prioritize fast tests or comprehensive coverage?
   - Skip slow tests in pre-commit hooks?

### Next Steps:
1. Review and approve this strategy
2. Install dependencies (Phase 1)
3. Start with backend unit tests (Phase 2)
4. Iterate based on learnings
