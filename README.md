# Jadapi

A modern monorepo built with Turborepo, featuring a Next.js web application and Express API with shared packages.

## Architecture

This monorepo contains the following packages and applications:

### Apps
- **`apps/web`** - Next.js application with App Router, Tailwind CSS, and shadcn/ui
- **`apps/api`** - Express.js API server with Zod validation and Mongoose ODM

### Packages
- **`packages/ui`** - Shared React components using shadcn/ui
- **`packages/types`** - Shared TypeScript types and Zod schemas

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# For the API (apps/api/.env)
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your MongoDB connection string

# For the web app (apps/web/.env.local)
cp apps/web/.env.example apps/web/.env.local
```

3. Start the development servers:
```bash
npm run dev
```

This will start both the Next.js app (http://localhost:3000) and the Express API (http://localhost:3001).

## Development

### Available Scripts

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps and packages
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean all build artifacts

### Project Structure

```
jadapi/
├── apps/
│   ├── web/                 # Next.js web application
│   │   ├── src/
│   │   │   ├── app/         # App Router pages and API routes
│   │   │   └── components/  # React components
│   │   └── package.json
│   └── api/                 # Express API server
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── models/      # Mongoose models
│       │   └── middleware/  # Express middleware
│       └── package.json
├── packages/
│   ├── ui/                  # Shared UI components
│   │   ├── components/      # React components
│   │   └── lib/            # Utilities
│   └── types/               # Shared TypeScript types
│       └── index.ts        # Type definitions and Zod schemas
├── package.json            # Root package.json with workspace config
└── turbo.json             # Turborepo configuration
```

## Technologies Used

- **Turborepo** - Monorepo build system
- **Next.js 14** - React framework with App Router
- **Express.js** - Node.js web framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern React component library
- **Zod** - Schema validation
- **Mongoose** - MongoDB ODM
- **MongoDB** - Database