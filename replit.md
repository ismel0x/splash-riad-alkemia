# Riad Alkemia WiFi Portal

## Overview

This is a WiFi guest portal application for Riad Alkemia, a Moroccan hospitality business in Marrakech. The application provides a registration system for WiFi access where guests fill out their details, verify their email, and receive WiFi credentials. The system includes multi-language support (English, French, Arabic) and integrates with email verification services to ensure valid guest information.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built as a single-page application using:
- **React 18** with TypeScript for the main UI framework
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight React router alternative)
- **Tailwind CSS** with shadcn/ui components for styling and UI components
- **React Hook Form** with Zod validation for form handling and validation
- **TanStack Query** for API state management and caching
- **i18n system** for multi-language support (English, French, Arabic)

The application follows a component-based architecture with:
- Page components in `client/src/pages/`
- Reusable UI components in `client/src/components/ui/`
- Custom hooks for device detection and toast notifications
- Centralized form validation using Zod schemas

### Backend Architecture

The backend uses a hybrid approach suitable for both development and serverless deployment:
- **Express.js** server with TypeScript
- **In-memory storage** for simplicity (no database persistence)
- **Serverless-ready** architecture with Vercel Functions support
- **RESTful API** design with clear endpoint separation

Key backend features:
- Email verification endpoint using Verimail API
- Guest registration with form validation
- Access code validation (format-based)
- Environment-based configuration

### Data Storage Solutions

The application currently uses **in-memory storage** via a custom `MemStorage` class that implements:
- WiFi guest data storage with UUID-based IDs
- Email-based guest lookup
- Access code validation
- Thread-safe operations for concurrent access

This design allows for easy migration to persistent storage (PostgreSQL with Drizzle ORM is configured but not currently used).

### Authentication and Authorization

The system uses a simple access-code based approach:
- Guests receive access codes from hotel reception
- Access codes are validated by format (6-9 digits)
- No persistent user sessions or complex authentication
- Email verification ensures valid contact information

### Form Validation and User Experience

- **Multi-step validation** with real-time feedback
- **Email verification** integration with Verimail service
- **Accessibility features** with proper ARIA labels and semantic HTML
- **Responsive design** optimized for mobile devices (common in hospitality)
- **Progressive enhancement** with loading states and error handling

## External Dependencies

### Third-Party Services
- **Verimail API** - Email verification service to ensure valid guest email addresses
- **Vercel** - Hosting platform with serverless function deployment
- **Neon Database** - PostgreSQL hosting (configured but not actively used)

### Key Libraries
- **React ecosystem** - React 18, React Hook Form, TanStack Query for frontend functionality
- **UI Framework** - Tailwind CSS with shadcn/ui component library for consistent design
- **Validation** - Zod for schema validation across frontend and backend
- **Build Tools** - Vite for development and build processes, esbuild for backend bundling
- **Icons** - Lucide React for consistent iconography

### Development Dependencies
- **TypeScript** for type safety across the entire application
- **ESLint and Prettier** for code quality and formatting
- **Replit integration** for development environment optimization

The architecture prioritizes simplicity and deployability while maintaining flexibility for future enhancements like persistent storage, user analytics, or integration with hotel management systems.