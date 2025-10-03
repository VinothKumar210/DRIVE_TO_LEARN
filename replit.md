# Drive to Learn - AI-Powered 3D Educational Driving Game

## Overview

Drive to Learn is a browser-based 3D educational driving game that combines learning with interactive gameplay. Players paste their study material into the application, and the system uses AI (Gemini API) to generate multiple-choice questions. Gameplay involves driving a 3D car where different road paths (straight, U-turn, left turn, right turn) represent different answer options (A, B, C, D). Players navigate to the correct path to answer questions, with performance metrics tracked throughout the session.

The application is built as a full-stack TypeScript project using React Three Fiber for 3D graphics, Express.js for the backend, and PostgreSQL (via Neon serverless) for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**3D Rendering Engine**
- Uses React Three Fiber (@react-three/fiber) as the primary 3D rendering framework built on top of Three.js
- Leverages @react-three/drei for common 3D helpers and utilities (OrbitControls, Text, useTexture)
- Implements @react-three/postprocessing for visual effects (Bloom, DepthOfField, Vignette)
- Physics simulation powered by cannon-es for realistic vehicle movement and collision detection

**Component Structure**
- Game phases managed through state: 'input' (study material entry), 'loading', 'playing', 'results'
- Primary components: StudyMaterialInput, Game (3D scene), QuestionDisplay, GameResults
- 3D scene components: CarWithPhysics (player vehicle), Road (track layout), Environment (scenery), RoadSigns (question display), Traffic (AI vehicles)
- Progressive environment system that changes visual themes based on player score and level

**State Management**
- Custom Zustand stores for game state and question management:
  - useGameStore: tracks score, level, accuracy, speed, game phase
  - useQuestionStore: manages current question, answers, question progression
- React Query (@tanstack/react-query) for server data fetching and caching

**UI Framework**
- Tailwind CSS for styling with custom design system based on HSL color variables
- Radix UI components for accessible, headless UI primitives
- Custom shadcn/ui components built on top of Radix primitives
- Dark mode support via CSS custom properties

### Backend Architecture

**Server Framework**
- Express.js server with TypeScript
- Middleware stack includes JSON parsing, URL encoding, request logging
- Custom error handling middleware for consistent error responses
- Development: Vite middleware for HMR and asset serving
- Production: Static file serving of built React application

**API Routes**
- RESTful API endpoints under `/api` prefix
- Question generation endpoint (`/api/questions/generate`) that interfaces with Gemini API
- Fallback question generation system when AI service fails or is unavailable
- Session tracking and user progress endpoints (implied from schema)

**Development Workflow**
- Hot module replacement in development via Vite
- Separate build process for client (Vite) and server (esbuild)
- TypeScript compilation across entire stack with shared types

### Data Storage

**Database Technology**
- PostgreSQL database via Neon serverless (@neondatabase/serverless)
- Drizzle ORM for type-safe database queries and migrations
- WebSocket-based connection pooling for serverless compatibility

**Schema Design**
- `users`: User authentication and identification (id, username, password, createdAt)
- `gameSessions`: Individual game session records tracking performance metrics (score, questionsAnswered, correctAnswers, accuracy, maxLevel, totalTime, studyMaterial)
- `userProgress`: Aggregated user statistics across all sessions (totalGamesPlayed, totalScore, averageAccuracy, highestScore, highestLevel, lastPlayedAt)
- All tables use serial primary keys with timestamp tracking

**Data Validation**
- Zod schemas generated from Drizzle table definitions for runtime validation
- Type inference ensures compile-time type safety throughout the stack

### External Dependencies

**AI Service Integration**
- Gemini API for generating educational multiple-choice questions from study material
- API calls made server-side to protect API keys
- Adaptive difficulty system that adjusts question complexity based on player performance
- Fallback question generation using text parsing when API unavailable

**3D Asset Management**
- Texture loading for road (asphalt) and environment (grass) surfaces
- Support for GLTF/GLB 3D models (configured but not actively used in current implementation)
- GLSL shader support via vite-plugin-glsl for custom visual effects
- Font loading via @fontsource/inter for consistent typography

**Third-party UI Libraries**
- Comprehensive Radix UI component suite for accessibility-first UI components
- class-variance-authority for type-safe component variants
- cmdk for command palette functionality
- lucide-react for icon system

**Build and Development Tools**
- Vite for fast development builds and optimized production bundles
- esbuild for server-side bundling
- PostCSS with Tailwind CSS and Autoprefixer
- Drizzle Kit for database migrations and schema management
- tsx for TypeScript execution in development

**Infrastructure**
- Neon serverless PostgreSQL with WebSocket support
- Environment-based configuration (DATABASE_URL required)
- Session management via connect-pg-simple (PostgreSQL session store)