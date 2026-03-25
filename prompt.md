Carefully read and follow the instructions in the following Markdown document. 
Do not skip any section.

# SYSTEM ROLE
You are a **senior full-stack software engineer and system architect**.  
You write **production-grade, scalable, and maintainable code** following industry best practices.

You MUST:
- Think like a senior engineer
- Avoid shortcuts or toy implementations
- Prioritize scalability, SEO, and clean architecture
- Use modern, stable technologies

---

# OBJECTIVE
Design and implement a **complete eCommerce platform** with:

- SEO-optimized frontend
- FastAPI backend
- SQLite database (designed for easy migration to PostgreSQL/MySQL without code changes)

---

# CRITICAL CONSTRAINTS

## General
- DO NOT provide vague explanations
- DO NOT skip implementation details
- DO NOT use outdated libraries
- DO NOT tightly couple database logic to SQLite
- MUST follow clean architecture principles

---

## Frontend Constraints (VERY IMPORTANT)

1. MUST use:
   - SSR or SSG-based framework (strongly prefer Next.js)
   - TypeScript

2. MUST include:
   - SEO optimization:
     - Dynamic meta tags
     - Open Graph tags
     - JSON-LD structured data (Product schema)
   - Performance:
     - Lazy loading
     - Code splitting
     - Image optimization
   - Accessibility:
     - Semantic HTML
     - Proper ARIA usage where needed

3. Design Requirements:
   - STRICTLY follow `index.html` as base UI reference
   - Improve responsiveness without breaking layout consistency

---

## Backend Constraints

1. Framework:
   - FastAPI

2. Database:
   - SQLite (initial)
   - MUST be abstracted using ORM (SQLAlchemy)
   - MUST support easy migration (NO raw SQL tightly coupled to SQLite)

3. Architecture:
   - Clean Architecture (MANDATORY):
     - Controllers (API layer)
     - Services (business logic)
     - Repositories (data access)
     - Models (ORM)
     - Schemas (Pydantic)

4. Validation:
   - Use Pydantic for all request/response validation

---

# DOMAIN REQUIREMENTS

## Product Types

### 1. 3D Printers
- MUST support comparison feature
- Include:
  - `specifications` (JSON field)
- Comparison logic:
  - Dynamically compare JSON attributes across products
  - short description 
  - long description like html page able to add multiple image in the descriptions 
  - add multiple image for the product

---

### 2. Filaments
- MUST support variants:
  - Color
    - based on color image will be changed
  - Material (PLA, ABS, PETG, etc.)
  - Brand
- MUST support filtering on all variant attributes

---

### 3. CNC Machines
- Standard product structure
- Include specifications (JSON-supported)
- short description 
- long description like html page able to add multiple image in the descriptions 
- add multiple image for the product

---

### 4. 3D Printed Products
- Simple catalog items
- Image + description focused

---

# FUNCTIONAL REQUIREMENTS

## Pages
- Home
- Product Listing (with filters)
- Product Details
- Category Page
- Brand Page
- Comparison Page (3D printers only)
- Cart
- Checkout

---

## Features

### Filtering
- Multi-filter system:
  - Category
  - Brand
  - Price range
  - Attributes (dynamic)

### Search
- Full-text search support

### Comparison Engine
- Input: multiple product IDs
- Output: merged comparison table from JSON specifications

---

# API REQUIREMENTS

You MUST implement:

- `GET /products` (filters + pagination)
- `GET /products/{id}`
- `POST /compare`
- `GET /categories`
- `GET /brands`
- `GET /search`

---

# DATA MODEL REQUIREMENTS

## Product (Core Fields)
- id
- name
- description
- price
- brand_id
- category_id
- images (array)

## Extended Fields
- specifications (JSON)
- variants (JSON for filaments)

---

# PERFORMANCE REQUIREMENTS

- API response time optimized
- Pagination required
- Avoid N+1 queries
- Proper indexing strategy (explain it)

---

# OUTPUT FORMAT (STRICT — MUST FOLLOW)

You MUST structure your response EXACTLY as follows:

---

## 1. Tech Stack Justification
- Frontend framework (with reason)
- Backend framework
- ORM
- Supporting tools

---

## 2. System Architecture
- High-level architecture diagram (textual)
- Explanation of layers

---

4. Database Design
Tables
Relationships
JSON field usage
Migration strategy explanation
5. Backend Implementation (Key Code)

Provide REAL code for:

FastAPI app setup
SQLAlchemy models
Repository pattern example
Service layer example
API endpoints
Comparison logic implementation
6. Frontend Implementation (Key Code)

Provide REAL code for:

SEO setup (meta + JSON-LD)
Product listing page
Product details page
Comparison UI logic
API integration layer
7. SEO Strategy

Explain:

On-page SEO
Technical SEO
Structured data usage
Performance optimization strategy
8. Scalability Plan

Explain:

How to migrate from SQLite → PostgreSQL
How to scale backend
How to scale frontend
9. Future Enhancements

List:

Authentication
Payment integration
Admin dashboard
Caching (Redis)
CDN usage
FINAL INSTRUCTION

This is a production-grade system design + implementation task.

Be precise
Be complete
Write code like it will be deployed in production
Avoid placeholders unless absolutely necessary