# Replit Configuration for WiFi Guest Registration System

## Overview

This is a WiFi guest registration system for Riad Alkemia, a boutique hotel in Marrakech. The application provides a user-friendly interface for guests to register for WiFi access by providing their details and accepting terms of service. The system includes email verification using Verimail API and supports multiple languages (English, French, Arabic). It features a modern, responsive design with Moroccan hospitality theming.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom theming for Riad Alkemia branding
- **State Management**: React Hook Form for form handling, TanStack Query for API state management
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: Custom i18n implementation supporting English, French, and Arabic

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for guest registration and email verification
- **Session Management**: Express sessions with PostgreSQL session store
- **Validation**: Zod schemas for request/response validation

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon (serverless PostgreSQL)
- **ORM**: Drizzle ORM with type-safe database operations
- **Session Storage**: PostgreSQL-backed session storage using connect-pg-simple
- **Development Fallback**: In-memory storage implementation for local development

### Email Verification System
- **Service**: Verimail API integration for email validation
- **Validation Process**: Real-time email verification before registration
- **Error Handling**: Comprehensive error handling for invalid/undeliverable emails
- **Security**: API key-based authentication with environment variable configuration

### Deployment Architecture
- **Platform**: Vercel with serverless functions
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Static Assets**: Served via Vercel's CDN with optimized asset handling
- **Environment**: Environment-specific configurations for development and production

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Verimail API**: Email verification and validation service
- **Vercel**: Deployment platform and serverless function hosting

### Development Tools
- **Vite**: Frontend build tool with HMR and asset optimization
- **TypeScript**: Type safety across frontend and backend
- **ESLint/Prettier**: Code quality and formatting tools
- **Drizzle Kit**: Database migration and schema management

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Modern icon library
- **React Hook Form**: Form state management and validation
- **TanStack Query**: Server state management and caching

### Third-party Integrations
- **Google Fonts**: Custom typography (Lato font family)
- **Asset Management**: Static asset handling for Riad Alkemia branding
- **CORS Configuration**: Cross-origin resource sharing for API access