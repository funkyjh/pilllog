# Overview

MedTracker is a mobile-first web application that helps users manage their medications through prescription image scanning and symptom tracking. The system uses OCR technology to extract text from prescription images, automatically creates medication records, and provides tools for tracking symptoms and medication adherence. Built with React on the frontend and Express.js on the backend, it's designed to be a comprehensive medication management solution.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Mobile-First Design**: Responsive layout optimized for mobile devices with a tab navigation system

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for medication management, symptom tracking, and image processing
- **File Handling**: Multer for multipart form data and image uploads
- **Development Server**: Custom Vite integration for hot module replacement in development

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL instance
- **Schema**: Well-defined tables for users, medications, symptom records, and image uploads
- **Development Storage**: In-memory storage implementation for development/testing

## Authentication and Session Management
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple
- **User Management**: Basic user creation and retrieval system
- **Security**: Session-based authentication with secure cookie handling

## Image Processing Pipeline
- **OCR Service**: Google Cloud Vision API for text extraction from prescription images
- **Text Parsing**: Custom Korean/English text parsing to extract medication details
- **Processing Flow**: Upload → OCR → Text parsing → Medication record creation
- **File Constraints**: 10MB file size limit with image format validation

## Mobile Layout System
- **Navigation**: Fixed header with brand identity and user actions
- **Tab System**: Sticky tab navigation for main features (Upload, Medications, Symptoms)
- **Bottom Navigation**: Fixed bottom navigation with icon-based quick access
- **Content Areas**: Scrollable main content with proper spacing for mobile interaction

## Component Architecture
- **Design System**: Consistent component library using class-variance-authority for variant handling
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Data Visualization**: Chart.js integration for symptom tracking visualization
- **Accessibility**: Radix UI primitives ensure proper ARIA attributes and keyboard navigation

# External Dependencies

## Google Cloud Services
- **Vision API**: OCR text extraction from prescription images
- **Authentication**: Service account key-based authentication
- **Project Configuration**: Environment-based project ID configuration

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: Environment variable-based connection string configuration
- **Migration System**: Drizzle Kit for database schema migrations

## Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Error Handling**: Runtime error overlay for development debugging
- **Code Generation**: Cartographer plugin for enhanced development experience

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Headless component primitives for accessibility
- **Lucide Icons**: Icon library for consistent visual elements
- **FontAwesome**: Additional icons for specific UI elements (referenced in layout components)

## Form and Validation
- **React Hook Form**: Form state management and validation
- **Zod**: TypeScript-first schema validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## Date and Time
- **date-fns**: Date manipulation and formatting with Korean locale support
- **Timezone Handling**: Client-side date formatting for user-friendly display