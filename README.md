# Jadapi

A modern monorepo built with Turborepo, Next.js, Express, and shared packages.

## Architecture

This project is structured as a monorepo with the following packages:

- **apps/web** - Next.js web application with App Router, Tailwind CSS, and shared UI components
- **apps/api** - Express API server with Zod validation and Mongoose for MongoDB
- **packages/ui** - Shared UI component library built with React and Tailwind
- **packages/types** - Shared TypeScript definitions and Zod schemas

## Tech Stack

### Web App (apps/web)
- Next.js 15 with App Router
- Server Actions for form handling
- Tailwind CSS for styling
- Shared UI components from packages/ui
- TypeScript with shared types

### API (apps/api)
- Express.js server
- Zod validation for request/response schemas
- Mongoose ODM for MongoDB Atlas
- TypeScript with shared types
- CORS and Helmet for security

### Shared Packages
- **UI Package**: Reusable React components with Tailwind styling
- **Types Package**: Shared TypeScript types and Zod validation schemas

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas connection string (for API)

### Installation

```bash
# Install dependencies for all packages
npm install

# Build all packages
npm run build
```

### Development

```bash
# Start all applications in development mode
npm run dev

# Start specific application
npm run dev --workspace=apps/web
npm run dev --workspace=apps/api
```

### Environment Variables

Create `.env` files in the respective applications:

**apps/api/.env**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/jadapi
NODE_ENV=development
```

**apps/web/.env.local**
```
API_BASE_URL=http://localhost:3001
```

## Project Structure

```
jadapi/
├── apps/
│   ├── web/                 # Next.js application
│   │   ├── src/
│   │   │   ├── app/         # App Router pages
│   │   │   ├── components/  # React components
│   │   │   └── actions/     # Server actions
│   │   ├── package.json
│   │   └── next.config.js
│   └── api/                 # Express API
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── models/      # Mongoose models
│       │   └── middleware/  # Express middleware
│       └── package.json
├── packages/
│   ├── ui/                  # Shared UI components
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   └── lib/         # Utilities
│   │   └── package.json
│   └── types/               # Shared TypeScript types
│       ├── src/
│       │   └── index.ts     # Type definitions
│       └── package.json
├── package.json             # Root package.json
├── turbo.json              # Turborepo configuration
└── tsconfig.json           # Root TypeScript config
```

## Available Scripts

- `npm run build` - Build all packages and applications
- `npm run dev` - Start all applications in development mode
- `npm run lint` - Lint all code
- `npm run type-check` - Type check all TypeScript code

## Features

- **Monorepo setup** with Turborepo for efficient builds
- **Shared component library** with consistent styling
- **Type-safe API** with shared schemas between frontend and backend
- **Form validation** using Zod schemas
- **Modern Next.js** with App Router and Server Actions
- **Express API** with comprehensive validation and error handling