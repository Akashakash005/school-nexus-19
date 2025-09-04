# School Maintenance Software

## Overview

This is a comprehensive school management system built with React, Express.js, and PostgreSQL. The application serves multiple user roles including Super Admins, School Admins, Teachers, Students, and Parents. It provides features for managing school operations, academic activities, financial transactions, and communication between different stakeholders.

The system supports multi-school operations where a Super Admin can manage multiple schools, each with their own School Admin who handles day-to-day operations including staff management, student enrollment, fee collection, and academic scheduling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Radix UI components with Tailwind CSS for styling
- **Form Handling**: React Hook Form with Zod for validation
- **Authentication**: Context-based auth system with session management

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy using scrypt for password hashing
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API with role-based access control middleware
- **Data Validation**: Zod schemas for request/response validation

### Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Structure**: Comprehensive relational design with entities for users, schools, classes, subjects, attendance, fees, and messaging
- **Migration Management**: Drizzle Kit for database schema migrations
- **Connection Pooling**: Node.js PostgreSQL pool for efficient database connections

### Role-Based Access Control
- **Super Admin**: Manages multiple schools and system-wide settings
- **School Admin**: Manages single school operations, staff, students, and finances
- **Teacher**: Handles class-specific activities like attendance, assignments, and lesson plans
- **Student/Parent**: Access to academic records, fees, and communication

### Key Features
- **Academic Management**: Class structures, subject mapping, timetables, and attendance tracking
- **Financial Management**: Fee structures, payment tracking, and billing systems
- **Communication System**: Role-based messaging and announcements
- **User Management**: Role-specific dashboards and profile management
- **Responsive Design**: Mobile-first approach with responsive layouts

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **Authentication**: Passport.js with local strategy
- **Session Store**: connect-pg-simple for PostgreSQL session storage

### Frontend Libraries
- **UI Components**: Radix UI component library
- **Styling**: Tailwind CSS with custom theme configuration
- **State Management**: TanStack React Query
- **Form Validation**: React Hook Form with Hookform Resolvers
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography

### Development Tools
- **Build Tool**: Vite for fast development and building
- **TypeScript**: Full TypeScript support across frontend and backend
- **Linting**: ESLint configuration for code quality
- **Theme**: Custom Replit theme integration with shadcn/ui

### Runtime Environment
- **Node.js**: ES Modules with TypeScript execution via tsx
- **Environment Variables**: dotenv for configuration management
- **Cross-platform**: cross-env for environment variable handling across platforms