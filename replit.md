# Riad Alkemia WiFi Portal

## Overview

This is a modern WiFi guest registration portal for Riad Alkemia, a hospitality establishment in Marrakech. The application provides a multilingual (English/French) guest registration system where visitors can register for WiFi access by providing their contact information and accepting terms of service. The system validates access codes and prevents duplicate registrations while maintaining a seamless user experience with elegant UI components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The client application is built with **React** and **TypeScript**, using a modern component-based architecture:

- **UI Framework**: React with TypeScript for type safety
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Hook Form with Zod validation for form handling
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Internationalization**: Custom i18n implementation supporting English and French

The architecture follows a monorepo structure with:
- `client/` - Frontend React application
- `server/` - Backend Express.js API
- `shared/` - Shared schemas and types

### Backend Architecture

The server is built with **Express.js** and follows a clean API architecture:

- **Web Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod for runtime type validation
- **Storage Layer**: Abstracted storage interface with in-memory implementation (easily swappable for database)
- **API Design**: RESTful endpoints with proper error handling and validation

### Data Storage Solutions

The application uses:
- **Database**: PostgreSQL with Drizzle ORM configuration
- **Connection**: Neon Database serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Development Storage**: In-memory storage implementation for development/testing

### Authentication and Authorization

The system implements a simple access code-based authentication:
- **Access Control**: Pre-defined access codes for guest registration
- **Validation**: Server-side access code validation
- **Session Management**: No persistent sessions, stateless validation
- **Guest Registration**: Email-based duplicate prevention

### Build and Development Tools

- **Build Tool**: Vite for fast development and optimized builds
- **Development**: Hot module replacement with Vite dev server
- **TypeScript**: Strict type checking across the entire codebase
- **Code Quality**: ESM modules, path aliases for clean imports
- **Deployment**: Production builds with esbuild for server bundling

## External Dependencies

### Core UI Dependencies
- **@radix-ui/\***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Modern icon library

### Form and Validation
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Resolvers for popular validation libraries
- **zod**: TypeScript-first schema validation
- **drizzle-zod**: Zod schema generation from Drizzle schemas

### Data Management
- **@tanstack/react-query**: Powerful data synchronization for React
- **drizzle-orm**: Lightweight TypeScript ORM
- **@neondatabase/serverless**: Serverless PostgreSQL database driver

### Development and Build Tools
- **vite**: Next generation frontend build tool
- **tsx**: TypeScript execution environment for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **drizzle-kit**: CLI tool for Drizzle ORM migrations

### Routing and Navigation
- **wouter**: Minimalist routing library for React

### Date and Utility Libraries
- **date-fns**: Modern JavaScript date utility library
- **clsx**: Utility for constructing className strings conditionally
- **nanoid**: URL-friendly unique string ID generator

The application is designed to be easily deployable to platforms like Replit, with proper environment variable configuration for database connections and development/production modes.