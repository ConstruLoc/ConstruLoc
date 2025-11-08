# ConstruLoc - System Design Document

## Executive Summary

ConstruLoc is a comprehensive construction equipment rental management platform designed to streamline the rental process for construction companies. The system provides real-time inventory management, automated billing, customer relationship management, and detailed analytics to optimize equipment utilization and revenue.

**Key Objectives:**
- Simplify equipment rental operations
- Provide real-time visibility into inventory and rentals
- Automate billing and payment tracking
- Enable data-driven decision making through analytics
- Ensure secure multi-tenant operations

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Design](#database-design)
4. [API Design](#api-design)
5. [Security](#security)
6. [Performance & Scalability](#performance--scalability)
7. [Deployment](#deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## System Overview

### Core Features

#### 1. Equipment Management
- **Inventory Tracking**: Real-time status of all equipment (available, rented, maintenance)
- **Equipment Catalog**: Detailed specifications, images, and pricing
- **Maintenance Scheduling**: Track service history and schedule preventive maintenance
- **Depreciation Tracking**: Monitor equipment value over time

#### 2. Rental Management
- **Booking System**: Create, modify, and cancel rental reservations
- **Contract Generation**: Automated contract creation with terms and conditions
- **Rental Extensions**: Handle rental period modifications
- **Return Processing**: Streamlined equipment return workflow with condition assessment

#### 3. Customer Management
- **Customer Profiles**: Comprehensive customer information and history
- **Credit Management**: Track customer credit limits and payment history
- **Document Management**: Store contracts, IDs, and other customer documents
- **Communication History**: Log all customer interactions

#### 4. Financial Management
- **Automated Billing**: Generate invoices based on rental periods and rates
- **Payment Tracking**: Record and reconcile payments
- **Late Fee Calculation**: Automatic late fee assessment
- **Financial Reporting**: Revenue, expenses, and profitability analysis

#### 5. Analytics & Reporting
- **Equipment Utilization**: Track usage rates and identify underutilized assets
- **Revenue Analytics**: Analyze revenue by equipment type, customer, and time period
- **Customer Analytics**: Identify top customers and rental patterns
- **Operational Metrics**: KPIs for business performance monitoring

### User Roles

1. **Admin**: Full system access, user management, system configuration
2. **Manager**: Rental operations, customer management, reporting
3. **Operator**: Equipment check-in/out, basic customer service
4. **Customer**: Self-service portal for bookings and account management

---

## Architecture

### Technology Stack

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui
- **State Management**: React Context + SWR for data fetching
- **Form Handling**: React Hook Form + Zod validation

#### Backend
- **Runtime**: Node.js (Next.js API Routes & Server Actions)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Direct SQL queries (no ORM for performance)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime (for live updates)

#### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase (managed PostgreSQL)
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Sentry

### Architecture Patterns

#### 1. Monolithic Architecture
- Single Next.js application handling both frontend and backend
- Server-side rendering for optimal performance
- API routes for backend logic
- Server actions for mutations

#### 2. Multi-Tenant Architecture
- **Tenant Isolation**: Row-level security (RLS) in PostgreSQL
- **Data Segregation**: All tables include `tenant_id` for data isolation
- **Shared Infrastructure**: Single database with logical separation
- **Tenant Context**: Middleware ensures tenant context in all requests

#### 3. Layered Architecture

\`\`\`
┌─────────────────────────────────────┐
│     Presentation Layer              │
│  (Next.js Pages & Components)       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Business Logic Layer            │
│  (Server Actions & API Routes)      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Data Access Layer               │
│  (Database Queries & Supabase SDK)  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Data Layer                      │
│  (PostgreSQL Database)              │
└─────────────────────────────────────┘
\`\`\`

### System Architecture Diagram

\`\`\`
┌──────────────────────────────────────────────────────────────┐
│                         Client Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Web App   │  │  Mobile    │  │   Admin    │             │
│  │  (Next.js) │  │  (Future)  │  │  Dashboard │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                      Vercel Edge Network                      │
│                    (CDN + Edge Functions)                     │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    Application Layer                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Next.js Application                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │   Pages &    │  │    Server    │  │  API Routes │ │  │
│  │  │  Components  │  │   Actions    │  │             │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                      Supabase Platform                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │       │
│  │   Database   │  │   Service    │  │   Service    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   Realtime   │  │  Row Level   │                         │
│  │   Service    │  │   Security   │                         │
│  └──────────────┘  └──────────────┘                         │
└──────────────────────────────────────────────────────────────┘
\`\`\`

---

## Database Design

### Schema Overview

The database is designed with multi-tenancy in mind, using Row-Level Security (RLS) for data isolation. All tables include a `tenant_id` column to ensure data segregation.

### Core Tables

#### 1. Tenants
\`\`\`sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  subscription_tier VARCHAR(50) DEFAULT 'basic',
  subscription_status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Purpose**: Manages multi-tenant organizations
**Key Fields**:
- `slug`: URL-friendly identifier for tenant
- `settings`: Flexible JSON storage for tenant-specific configurations
- `subscription_tier`: Determines feature access (basic, professional, enterprise)

#### 2. Users
\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'operator', 'customer')),
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Purpose**: User accounts with role-based access control
**Key Fields**:
- `role`: Determines user permissions (admin, manager, operator, customer)
- `tenant_id`: Links user to their organization
- `is_active`: Soft delete mechanism

#### 3. Customers
\`\`\`sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_name VARCHAR(255),
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  tax_id VARCHAR(50),
  credit_limit DECIMAL(10, 2) DEFAULT 0,
  current_balance DECIMAL(10, 2) DEFAULT 0,
  payment_terms INTEGER DEFAULT 30,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Purpose**: Customer information and credit management
**Key Fields**:
- `credit_limit`: Maximum outstanding balance allowed
- `current_balance`: Current amount owed
- `payment_terms`: Days until payment is due
- `user_id`: Optional link to user account for self-service portal

#### 4. Equipment Categories
\`\`\`sql
CREATE TABLE equipment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Purpose**: Organize equipment into logical groups
**Examples**: Excavators, Bulldozers, Cranes, Generators, etc.

#### 5. Equipment
\`\`\`sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES equipment_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100) UNIQUE,
  year INTEGER,
  purchase_date DATE,
  purchase_price DECIMAL(10, 2),
  current_value DECIMAL(10, 2),
  daily_rate DECIMAL(10, 2) NOT NULL,
  weekly_rate DECIMAL(10, 2),
  monthly_rate DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'retired')),
  location VARCHAR(255),
  images JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  maintenance_schedule JSONB DEFAULT '{}',
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  total_rental_hours DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Purpose**: Equipment inventory and specifications
**Key Fields**:
- `status`: Current availability (available, rented, maintenance, retired)
- `daily_rate`, `weekly_rate`, `monthly_rate`: Flexible pricing options
- `images`: Array of image URLs stored as JSON
- `specifications`: Flexible JSON storage for equipment-specific details
- `maintenance_schedule`: Maintenance intervals and requirements

#### 6. Rentals
\`\`\`sql
CREATE TABLE rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  equipment_id UUID REFERENCES equipment(id) ON DELETE RESTRICT,
  rental_number VARCHAR(50) UNIQUE NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_return_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  daily_rate DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT false,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
  delivery_required BOOLEAN DEFAULT false,
  delivery_address TEXT,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  pickup_required BOOLEAN DEFAULT false,
  pickup_fee DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  contract_url TEXT,
  checked_out_by UUID REFERENCES users(id),
  checked_in_by UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Purpose**: Rental transactions and lifecycle management
**Key Fields**:
- `rental_number`: Human-readable unique identifier
- `status`: Rental lifecycle (pending, active, completed, cancelled)
- `payment_status`: Payment tracking (pending, partial, paid, overdue)
- `actual_return_date`: Tracks late returns
- `delivery_required`, `pickup_required`: Logistics management

#### 7. Invoices
\`\`\`sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  rental_id UUID REFERENCES rentals(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  balance_due DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  payment_terms INTEGER DEFAULT 30,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Purpose**: Billing and invoicing
**Key Fields**:
- `invoice_number`: Sequential invoice identifier
- `balance_due`: Calculated field (total_amount - amount_paid)
- `status`: Invoice lifecycle tracking

#### 8. Payments
\`\`\`sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  payment_number VARCHAR(50) UNIQUE NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'check', 'credit_card', 'bank_transfer', 'other')),
  reference_number VARCHAR(100),
  notes TEXT,
  processed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Purpose**: Payment tracking and reconciliation
**Key Fields**:
- `payment_method`: How payment was received
- `reference_number`: External payment reference (check number, transaction ID)

#### 9. Maintenance Records
\`\`\`sql
CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN ('preventive', 'repair', 'inspection', 'other')),
  description TEXT NOT NULL,
  maintenance_date DATE NOT NULL,
  cost DECIMAL(10, 2) DEFAULT 0,
  performed_by VARCHAR(255),
  next_maintenance_date DATE,
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Purpose**: Equipment maintenance history
**Key Fields**:
- `maintenance_type`: Categorize maintenance activities
- `next_maintenance_date`: Schedule future maintenance
- `attachments`: Store receipts, reports, etc.

#### 10. Audit Logs
\`\`\`sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Purpose**: Security and compliance auditing
**Key Fields**:
- `action`: Type of action (create, update, delete, login, etc.)
- `entity_type`: What was modified (rental, equipment, customer, etc.)
- `old_values`, `new_values`: Track changes for compliance

### Indexes

\`\`\`sql
-- Performance indexes
CREATE INDEX idx_equipment_tenant_status ON equipment(tenant_id, status);
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_rentals_tenant_status ON rentals(tenant_id, status);
CREATE INDEX idx_rentals_customer ON rentals(customer_id);
CREATE INDEX idx_rentals_equipment ON rentals(equipment_id);
CREATE INDEX idx_rentals_dates ON rentals(start_date, end_date);
CREATE INDEX idx_invoices_tenant_status ON invoices(tenant_id, status);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_customers_tenant_active ON customers(tenant_id, is_active);
CREATE INDEX idx_users_tenant_role ON users(tenant_id, role);
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
\`\`\`

### Row-Level Security (RLS)

All tables implement RLS policies to ensure tenant data isolation:

\`\`\`sql
-- Example RLS policy for equipment table
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON equipment
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Similar policies applied to all tables with tenant_id
\`\`\`

---

## API Design

### API Architecture

The API follows RESTful principles with Next.js API routes and Server Actions for mutations.

#### API Routes Structure
\`\`\`
/api
  /auth
    /login
    /logout
    /register
    /refresh
  /equipment
    /[id]
    /categories
    /availability
  /rentals
    /[id]
    /active
    /history
  /customers
    /[id]
    /search
  /invoices
    /[id]
    /generate
  /payments
    /[id]
    /process
  /reports
    /revenue
    /utilization
    /customers
  /maintenance
    /[id]
    /schedule
\`\`\`

### Authentication Endpoints

#### POST /api/auth/login
\`\`\`typescript
Request:
{
  email: string;
  password: string;
}

Response:
{
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    tenant_id: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}
\`\`\`

#### POST /api/auth/register
\`\`\`typescript
Request:
{
  email: string;
  password: string;
  full_name: string;
  tenant_slug: string;
}

Response:
{
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  message: string;
}
\`\`\`

### Equipment Endpoints

#### GET /api/equipment
\`\`\`typescript
Query Parameters:
{
  status?: 'available' | 'rented' | 'maintenance' | 'retired';
  category_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

Response:
{
  data: Equipment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
\`\`\`

#### GET /api/equipment/[id]
\`\`\`typescript
Response:
{
  id: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  status: string;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  images: string[];
  specifications: Record<string, any>;
  current_rental?: {
    id: string;
    customer_name: string;
    end_date: string;
  };
}
\`\`\`

#### POST /api/equipment
\`\`\`typescript
Request:
{
  name: string;
  description?: string;
  category_id: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  daily_rate: number;
  weekly_rate?: number;
  monthly_rate?: number;
  specifications?: Record<string, any>;
}

Response:
{
  id: string;
  message: string;
}
\`\`\`

#### PUT /api/equipment/[id]
\`\`\`typescript
Request: Partial<Equipment>

Response:
{
  id: string;
  message: string;
}
\`\`\`

#### DELETE /api/equipment/[id]
\`\`\`typescript
Response:
{
  message: string;
}
\`\`\`

### Rental Endpoints

#### GET /api/rentals
\`\`\`typescript
Query Parameters:
{
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
  customer_id?: string;
  equipment_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

Response:
{
  data: Rental[];
  pagination: PaginationInfo;
}
\`\`\`

#### POST /api/rentals
\`\`\`typescript
Request:
{
  customer_id: string;
  equipment_id: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  deposit_amount?: number;
  delivery_required?: boolean;
  delivery_address?: string;
  notes?: string;
}

Response:
{
  id: string;
  rental_number: string;
  message: string;
}
\`\`\`

#### PUT /api/rentals/[id]/checkout
\`\`\`typescript
Request:
{
  checked_out_by: string;
  notes?: string;
}

Response:
{
  message: string;
}
\`\`\`

#### PUT /api/rentals/[id]/checkin
\`\`\`typescript
Request:
{
  checked_in_by: string;
  actual_return_date: string;
  condition_notes?: string;
  additional_charges?: number;
}

Response:
{
  message: string;
  late_fees?: number;
}
\`\`\`

### Customer Endpoints

#### GET /api/customers
\`\`\`typescript
Query Parameters:
{
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

Response:
{
  data: Customer[];
  pagination: PaginationInfo;
}
\`\`\`

#### GET /api/customers/[id]
\`\`\`typescript
Response:
{
  customer: Customer;
  rental_history: Rental[];
  payment_history: Payment[];
  current_balance: number;
  total_rentals: number;
}
\`\`\`

### Invoice Endpoints

#### POST /api/invoices/generate
\`\`\`typescript
Request:
{
  rental_id: string;
  due_date?: string;
  notes?: string;
}

Response:
{
  invoice_id: string;
  invoice_number: string;
  total_amount: number;
}
\`\`\`

#### GET /api/invoices/[id]
\`\`\`typescript
Response:
{
  invoice: Invoice;
  rental: Rental;
  customer: Customer;
  payments: Payment[];
}
\`\`\`

### Payment Endpoints

#### POST /api/payments
\`\`\`typescript
Request:
{
  invoice_id: string;
  amount: number;
  payment_method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other';
  payment_date: string;
  reference_number?: string;
  notes?: string;
}

Response:
{
  payment_id: string;
  payment_number: string;
  remaining_balance: number;
}
\`\`\`

### Report Endpoints

#### GET /api/reports/revenue
\`\`\`typescript
Query Parameters:
{
  start_date: string;
  end_date: string;
  group_by?: 'day' | 'week' | 'month';
}

Response:
{
  total_revenue: number;
  data: Array<{
    period: string;
    revenue: number;
    rentals_count: number;
  }>;
}
\`\`\`

#### GET /api/reports/utilization
\`\`\`typescript
Query Parameters:
{
  start_date: string;
  end_date: string;
  category_id?: string;
}

Response:
{
  overall_utilization: number;
  equipment_utilization: Array<{
    equipment_id: string;
    equipment_name: string;
    utilization_rate: number;
    total_rental_days: number;
    revenue_generated: number;
  }>;
}
\`\`\`

### Error Handling

All API endpoints follow a consistent error response format:

\`\`\`typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  };
  status: number;
}
\`\`\`

**Common Error Codes:**
- `AUTH_REQUIRED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `CONFLICT`: Resource conflict (e.g., equipment already rented)
- `INTERNAL_ERROR`: Server error

---

## Security

### Authentication & Authorization

#### 1. Authentication Flow
- **Supabase Auth**: Email/password authentication
- **JWT Tokens**: Access and refresh tokens
- **Session Management**: Secure cookie-based sessions
- **Token Refresh**: Automatic token refresh before expiration

#### 2. Authorization
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full system access
  - **Manager**: Rental operations, customer management, reporting
  - **Operator**: Equipment check-in/out, basic operations
  - **Customer**: Self-service portal access only

#### 3. Multi-Tenant Security
- **Tenant Isolation**: RLS policies ensure data segregation
- **Tenant Context**: Middleware sets tenant context for all requests
- **Cross-Tenant Prevention**: Queries automatically filtered by tenant_id

### Data Security

#### 1. Encryption
- **In Transit**: TLS 1.3 for all connections
- **At Rest**: PostgreSQL encryption for sensitive data
- **Passwords**: Bcrypt hashing with salt

#### 2. Input Validation
- **Zod Schemas**: Type-safe validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Input sanitization and output encoding

#### 3. API Security
- **Rate Limiting**: Prevent abuse (100 requests/minute per user)
- **CORS**: Restricted to allowed origins
- **CSRF Protection**: Token-based CSRF prevention
- **API Keys**: For third-party integrations (future)

### Compliance

#### 1. Data Privacy
- **GDPR Compliance**: User data export and deletion
- **Data Retention**: Configurable retention policies
- **Audit Logs**: Complete audit trail for compliance

#### 2. Access Control
- **Principle of Least Privilege**: Minimal required permissions
- **Session Timeout**: Automatic logout after inactivity
- **Password Policy**: Strong password requirements

---

## Performance & Scalability

### Performance Optimization

#### 1. Database Optimization
- **Indexes**: Strategic indexes on frequently queried columns
- **Query Optimization**: Efficient SQL queries with proper joins
- **Connection Pooling**: Supabase connection pooling
- **Caching**: Redis caching for frequently accessed data (future)

#### 2. Frontend Optimization
- **Server-Side Rendering**: Next.js SSR for fast initial load
- **Code Splitting**: Automatic code splitting by Next.js
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Size**: Tree shaking and minification

#### 3. API Optimization
- **Response Caching**: Cache static and semi-static data
- **Pagination**: Limit result sets to prevent large payloads
- **Compression**: Gzip compression for API responses
- **CDN**: Vercel Edge Network for global distribution

### Scalability Strategy

#### 1. Horizontal Scaling
- **Vercel Serverless**: Auto-scaling based on demand
- **Database Scaling**: Supabase managed scaling
- **Read Replicas**: For read-heavy operations (future)

#### 2. Vertical Scaling
- **Database Upgrades**: Increase database resources as needed
- **Compute Resources**: Upgrade Vercel plan for more resources

#### 3. Performance Monitoring
- **Vercel Analytics**: Real-time performance metrics
- **Database Monitoring**: Query performance tracking
- **Error Tracking**: Sentry for error monitoring
- **User Monitoring**: Real user monitoring (RUM)

### Performance Targets

- **Page Load Time**: < 2 seconds (initial load)
- **API Response Time**: < 200ms (p95)
- **Database Query Time**: < 100ms (p95)
- **Uptime**: 99.9% availability

---

## Deployment

### Deployment Architecture

\`\`\`
┌─────────────────────────────────────────┐
│         GitHub Repository               │
│     (Source Code & Version Control)     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Vercel Platform                 │
│  ┌───────────────────────────────────┐  │
│  │   Automatic Deployments           │  │
│  │   - Preview (Pull Requests)       │  │
│  │   - Production (Main Branch)      │  │
│  └──────────────────────────���────────┘  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Vercel Edge Network (CDN)          │
│     (Global Content Distribution)       │
└─────────────────────────────────────────┘
\`\`\`

### Deployment Process

#### 1. Development Environment
\`\`\`bash
# Local development
npm run dev

# Environment variables from .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
\`\`\`

#### 2. Staging Environment
- **Trigger**: Pull request to main branch
- **URL**: Unique preview URL per PR
- **Database**: Separate staging database
- **Purpose**: Testing before production

#### 3. Production Environment
- **Trigger**: Merge to main branch
- **URL**: Custom domain (e.g., app.construloc.com)
- **Database**: Production Supabase instance
- **Monitoring**: Full monitoring and alerting

### CI/CD Pipeline

\`\`\`yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
\`\`\`

### Environment Variables

#### Production
\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Application
NEXT_PUBLIC_APP_URL=https://app.construloc.com
NODE_ENV=production

# Monitoring (Future)
SENTRY_DSN=https://xxx@sentry.io/xxx
\`\`\`

### Database Migrations

\`\`\`bash
# Run migrations
npm run db:migrate

# Rollback migration
npm run db:rollback

# Seed database
npm run db:seed
\`\`\`

### Backup Strategy

#### 1. Database Backups
- **Frequency**: Daily automated backups
- **Retention**: 30 days
- **Location**: Supabase managed backups
- **Recovery**: Point-in-time recovery available

#### 2. File Backups
- **Frequency**: Real-time replication
- **Location**: Supabase Storage with redundancy
- **Recovery**: Instant recovery from replicas

---

## Monitoring & Maintenance

### Monitoring Strategy

#### 1. Application Monitoring
- **Vercel Analytics**: Performance metrics, Core Web Vitals
- **Error Tracking**: Sentry for error monitoring and alerting
- **Uptime Monitoring**: Vercel uptime checks
- **Custom Metrics**: Business KPIs tracking

#### 2. Database Monitoring
- **Supabase Dashboard**: Query performance, connection pool
- **Slow Query Log**: Identify optimization opportunities
- **Storage Monitoring**: Database size and growth trends
- **Connection Monitoring**: Active connections and pool usage

#### 3. User Monitoring
- **Session Analytics**: User behavior and flow
- **Feature Usage**: Track feature adoption
- **Error Reports**: User-reported issues
- **Performance**: Real user monitoring (RUM)

### Alerting

#### Critical Alerts
- **Downtime**: Immediate notification
- **Error Rate Spike**: > 5% error rate
- **Database Issues**: Connection failures, slow queries
- **Security Events**: Failed login attempts, unauthorized access

#### Warning Alerts
- **Performance Degradation**: Response time > 1s
- **High Resource Usage**: CPU/Memory > 80%
- **Low Disk Space**: < 20% remaining
- **Backup Failures**: Failed backup jobs

### Maintenance Tasks

#### Daily
- Monitor error logs
- Review performance metrics
- Check backup status

#### Weekly
- Review slow query log
- Analyze user feedback
- Update documentation

#### Monthly
- Database optimization (VACUUM, ANALYZE)
- Security updates
- Performance review
- Capacity planning

#### Quarterly
- Disaster recovery testing
- Security audit
- Performance benchmarking
- Feature usage analysis

### Incident Response

#### 1. Incident Detection
- Automated monitoring alerts
- User reports
- Team member discovery

#### 2. Incident Response Process
1. **Acknowledge**: Confirm incident and notify team
2. **Assess**: Determine severity and impact
3. **Mitigate**: Implement temporary fix if possible
4. **Resolve**: Deploy permanent fix
5. **Post-Mortem**: Document and learn from incident

#### 3. Severity Levels
- **P0 (Critical)**: System down, data loss - Immediate response
- **P1 (High)**: Major feature broken - 1 hour response
- **P2 (Medium)**: Minor feature issue - 4 hour response
- **P3 (Low)**: Cosmetic issue - Next business day

---

## Appendix

### Technology Decisions

#### Why Next.js?
- **Full-stack Framework**: Single codebase for frontend and backend
- **Performance**: Built-in optimizations (SSR, code splitting, image optimization)
- **Developer Experience**: Hot reload, TypeScript support, great tooling
- **Deployment**: Seamless Vercel integration

#### Why Supabase?
- **Managed PostgreSQL**: No database administration overhead
- **Built-in Auth**: Secure authentication out of the box
- **Real-time**: WebSocket support for live updates
- **Storage**: Integrated file storage solution
- **Row-Level Security**: Built-in multi-tenancy support

#### Why No ORM?
- **Performance**: Direct SQL queries are faster
- **Flexibility**: Full control over query optimization
- **Simplicity**: No ORM learning curve or abstraction leaks
- **Type Safety**: TypeScript types generated from database schema

### Future Enhancements

#### Phase 2 (3-6 months)
- Mobile app (React Native)
- Advanced analytics dashboard
- Automated maintenance scheduling
- SMS notifications
- Document generation (contracts, receipts)

#### Phase 3 (6-12 months)
- IoT integration (GPS tracking, usage monitoring)
- Predictive maintenance using ML
- Multi-language support
- Advanced reporting and BI tools
- Third-party integrations (QuickBooks, Stripe)

#### Phase 4 (12+ months)
- Marketplace for equipment rental
- Peer-to-peer rental platform
- Insurance integration
- Fleet management features
- Advanced route optimization for delivery

### Glossary

- **RLS**: Row-Level Security - PostgreSQL feature for data isolation
- **RBAC**: Role-Based Access Control - Permission system based on user roles
- **SSR**: Server-Side Rendering - Rendering pages on the server
- **CDN**: Content Delivery Network - Distributed network for fast content delivery
- **JWT**: JSON Web Token - Token-based authentication standard
- **ORM**: Object-Relational Mapping - Database abstraction layer
- **CRUD**: Create, Read, Update, Delete - Basic data operations
- **API**: Application Programming Interface - Interface for software communication
- **SaaS**: Software as a Service - Cloud-based software delivery model

---

## Document Version

- **Version**: 1.0
- **Last Updated**: January 2025
- **Author**: ConstruLoc Development Team
- **Status**: Active

---

## Contact & Support

For questions or clarifications about this system design:
- **Technical Lead**: [Contact Information]
- **Project Manager**: [Contact Information]
- **Documentation**: [Wiki/Confluence Link]
