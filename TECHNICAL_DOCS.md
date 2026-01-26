# Networkly Frontend - Technical Documentation

**Last Updated:** January 11, 2026

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [AI Model Management System](#ai-model-management-system)
3. [Authentication Setup](#authentication-setup)
4. [Database Schema](#database-schema)
5. [Server Actions (APIs)](#server-actions-apis)
6. [Feature Implementation Status](#feature-implementation-status)
7. [Environment Variables](#environment-variables)

---

## Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16.0.10 (App Router, Turbopack) |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | TailwindCSS 4 + shadcn/ui components |
| **Authentication** | Supabase Auth (with Postgres sync) |
| **Database** | PostgreSQL via Prisma ORM 5.22.0 (Neon) |
| **AI Chat** | Google Gemini via custom AI SDK |
| **Package Manager** | pnpm |

---

## AI Model Management System

### Overview

The AI Model Management System (`lib/ai/`) provides a robust, modular architecture for integrating multiple AI providers with automatic fallback, rate limiting, health monitoring, and use-case based model selection.

### Architecture

```
lib/ai/
├── index.ts              # Main exports & singleton
├── types.ts              # TypeScript types & Zod schemas
├── manager.ts            # AIModelManager orchestration class
├── model-configs.ts      # Provider configurations (Groq/Gemini)
├── examples.ts           # Usage examples
├── providers/
│   ├── base.ts           # Abstract base provider class
│   ├── openrouter.ts     # OpenRouter provider
│   └── groq.ts           # Groq provider
└── utils/
    ├── logger.ts         # Structured logging
    ├── rate-limiter.ts   # Token bucket rate limiting
    └── retry.ts          # Exponential backoff & circuit breaker
```

### Main Exports

```typescript
// Manager
import { getAIManager, createAIManager, AIModelManager } from '@/lib/ai'

// Model Configuration
import {
  GROQ_CONFIG, GEMINI_CONFIG, MODEL_CONFIGS,
  GROQ_MODELS, GEMINI_MODELS,
  GROQ_USE_CASES, GEMINI_USE_CASES,
  AGENT_MODEL_RECOMMENDATIONS,
  getActiveConfig, setActiveConfig,
  getModelForUseCase, getAvailableModels,
  getModelsByQuality, getModelsBySpeed, getFreeModels,
} from '@/lib/ai'

// Types
import type {
  ProviderName, ModelInfo, UseCase, Message,
  CompletionOptions, CompletionResult, StreamChunk,
} from '@/lib/ai'

// Errors
import { AIProviderError, RateLimitError, ModelNotFoundError } from '@/lib/ai'
```

### AIModelManager Methods

| Method | Description |
|--------|-------------|
| `complete(options)` | Execute completion with automatic fallback |
| `stream(options)` | Stream completion with automatic fallback |
| `getAllModels()` | Get all models across all providers |
| `getProviderModels(name)` | Get models from specific provider |
| `getModel(fullModelId)` | Get model by full ID (provider:model) |
| `configureUseCase(config)` | Configure specific use case |
| `runHealthChecks()` | Run health checks on all providers |
| `getProviderStatuses()` | Get all provider statuses |
| `isProviderHealthy(name)` | Check if provider is healthy |
| `getHealthyProviders()` | Get list of healthy provider names |
| `shutdown()` | Stop health checks and cleanup |

### Gemini Models
 
 | Model | Best For | Context | Speed |
 |-------|----------|---------|-------|
 | `gemini-1.5-pro` | Best overall reasoning | 1M | Standard |
 | `gemini-1.5-flash` | Fastest/Value | 1M | Fast |
 | `gemini-1.5-flash-lite` | Most cost-effective | 1M | Ultra-fast |

### Use Case Model Mapping

| Use Case | Primary Model | Fallbacks |
|----------|---------------|-----------|
| `chat` | gemini-1.5-pro | gemini-1.5-flash |
| `analysis` | gemini-1.5-pro | gemini-1.5-flash |
| `code-generation` | gemini-1.5-pro | gemini-1.5-flash |
| `summarization` | gemini-1.5-flash | gemini-1.5-flash-lite |
| `extraction` | gemini-1.5-pro | gemini-1.5-flash |
| `fast-response` | gemini-1.5-flash | gemini-1.5-flash-lite |
| `high-quality` | gemini-1.5-pro | gemini-1.5-flash |
| `cost-effective` | gemini-1.5-flash-lite | gemini-1.5-flash |

### Agent Model Recommendations

| Agent Role | Model | Reason |
|------------|-------|--------|
| **Planner** | `gemini-1.5-pro` | Best reasoning |
| **Coder** | `gemini-1.5-pro` | Strong coding performance |
| **Researcher** | `gemini-1.5-pro` | 1M context for long docs |
| **Router** | `gemini-1.5-flash` | Fastest |
| **Tool User** | `gemini-1.5-pro` | Good for agentic tool use |
| **Writer** | `gemini-1.5-pro` | Creative excellence |
| **Extractor** | `gemini-1.5-pro` | Structured extraction |
| **Summarizer** | `gemini-1.5-flash` | Fast and effective |
| **Moderator** | `gemini-1.5-pro` | Content safety |

### Usage Examples

#### Basic Completion

```typescript
import { getAIManager } from '@/lib/ai'

const ai = getAIManager()
const result = await ai.complete({
  messages: [{ role: 'user', content: 'Hello!' }],
  useCase: 'chat',
})
console.log(result.content)
```

#### Streaming Response

```typescript
for await (const chunk of ai.stream({
  messages: [{ role: 'user', content: 'Tell me a story' }],
  useCase: 'chat',
})) {
  process.stdout.write(chunk.content)
}
```

#### Switch Provider Config

```typescript
import { setActiveConfig, getActiveConfig } from '@/lib/ai'

setActiveConfig('gemini') // Use Gemini
```

#### Error Handling

```typescript
import { RateLimitError, AIProviderError } from '@/lib/ai'

try {
  const result = await ai.complete({ messages, useCase: 'chat' })
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter}s`)
  } else if (error instanceof AIProviderError) {
    console.log(`Provider error: ${error.message}`)
  }
}
```

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Chat completion with streaming |
| `/api/chat` | GET | Health check for providers |
| `/api/ai/complete` | POST | Generic completion endpoint |
| `/api/ai/models` | GET | List available models |
| `/api/ai/health` | GET | Detailed health checks |

### React Hooks

```typescript
import { useAIChat, useAICompletion } from '@/hooks/use-ai-chat'

// Chat hook
const { messages, input, setInput, sendMessage, isLoading, stop, clear, reload } = useAIChat({
  useCase: 'chat',
})

// Completion hook
const { complete, isLoading, result, error } = useAICompletion({
  useCase: 'code-generation',
})
```

---

## Authentication Setup
 
 ### Supabase Configuration
 
 **Supabase URL & Key** (in `.env`):
 ```env
 NEXT_PUBLIC_SUPABASE_URL="https://..."
 NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbG..."
 ```
 
 **Auth Flow:** Users are managed via Supabase Auth. The `createClient()` helper in `lib/supabase/` handles server-side sessions.
 
 **Auto-Sync:** User profile data is synced to the `User` table upon first login or profile update.

---

## Database Schema

### Core Models

| Model | Description | Key Fields |
|-------|-------------|------------|
| **User** | User profiles linked to Clerk | `clerkId`, `email`, `name`, `skills[]`, `interests[]` |
| **Opportunity** | Job/internship/fellowship listings | `title`, `company`, `deadline`, `skills[]`, `category` |
| **UserOpportunity** | User-opportunity relationship | `matchScore`, `matchReasons`, `status` |
| **UserGoal** | User career goals | `goalText`, `roadmap`, `filters` |
| **Project** | User project showcase | `title`, `status`, `visibility`, `tags[]` |
| **Connection** | Network connections | `requesterId`, `receiverId`, `status` |
| **Message** | Direct messages | `senderId`, `receiverId`, `content`, `unread` |
| **Application** | Job application tracker | `company`, `position`, `status` |

### Supporting Models

| Model | Purpose |
|-------|---------|
| **ProjectCollaborator** | Many-to-many: Users ↔ Projects |
| **ProjectUpdate** | Activity feed for projects |
| **Achievement** | User profile achievements |
| **Extracurricular** | User activities/roles |
| **Recommendation** | User recommendations |
| **AnalyticsData** | Profile views, network growth |
| **Event** | Networking events |
| **ChatLog** | AI assistant history |

---

## Server Actions (APIs)

All server actions are located in `/app/actions/` and use the `"use server"` directive.

### User Actions (`user.ts`)

| Function | Description |
|----------|-------------|
| `getCurrentUser()` | Get authenticated user's profile |
| `getUserAnalytics()` | Get profile views, network growth |
| `updateUserProfile(data)` | Update user profile fields |
| `syncUserFromSupabase(user)` | Sync user profile from Supabase |

### Connections Actions (`connections.ts`)

| Function | Description |
|----------|-------------|
| `getConnections()` | Get all user connections |
| `getSuggestedConnections()` | Get AI-suggested connections |
| `sendConnectionRequest(receiverId)` | Send a connection request |
| `acceptConnectionRequest(id)` | Accept a pending request |
| `removeConnection(id)` | Remove an existing connection |

### Messages Actions (`messages.ts`)

| Function | Description |
|----------|-------------|
| `getMessages()` | Get all messages (inbox preview) |
| `getConversation(otherUserId)` | Get full conversation thread |
| `sendMessage(receiverId, content)` | Send a new message |

### Opportunities Actions (`opportunities.ts`)

| Function | Description |
|----------|-------------|
| `getOpportunities()` | Get all opportunities |
| `getOpportunitiesWithSaved()` | Get with user's saved status |
| `toggleSaveOpportunity(id)` | Save/unsave an opportunity |

### Projects Actions (`projects.ts`)

| Function | Description |
|----------|-------------|
| `getProjects()` | Get all projects |
| `createProject(data)` | Create new project |
| `updateProject(id, data)` | Update project |
| `deleteProject(id)` | Delete project |

---

## Feature Implementation Status

### ✅ Fully Implemented

| Feature | Location |
|---------|----------|
| User Authentication | Supabase Auth |
| Dashboard | `/dashboard` |
| Profile Management | `/profile` |
| Network/Connections | `/network` |
| Messaging | `/network` (Messages panel) |
| Opportunities Discovery | `/opportunities` |
| Project Showcase | `/projects` |
| AI Assistant Chat | `/assistant` |
| Analytics Dashboard | `/analytics` |
| Settings | `/settings` |
| Events Calendar | `/events` |

### 🔄 Partially Implemented

| Feature | What's Missing |
|---------|----------------|
| AI Match Scoring | Real AI-based matching algorithm |
| Mutual Connections | Actual calculation |
| Notification System | Push/in-app notifications |

### ❌ Not Yet Implemented

| Feature | Description |
|---------|-------------|
| Real-time Messaging | WebSocket/SSE for live chat |
| File Uploads | Project images, resumes |
| OAuth Connections | LinkedIn, GitHub integration |
| Calendar Sync | Google/Outlook integration |

---

## Environment Variables

Required in `.env` or `.env.local`:

```env
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="pk_..."
SUPABASE_SERVICE_ROLE_KEY="sk_..."
 
# AI Providers
GEMINI_API_KEY="AIza..."

# AI Settings (optional)
AI_TIMEOUT=30000                     # Request timeout (ms)
AI_MAX_RETRIES=3                     # Max retry attempts
AI_HEALTH_CHECKS=true                # Enable health monitoring
AI_HEALTH_CHECK_INTERVAL=60000       # Health check interval (ms)
AI_LOGGING=true                      # Enable logging
AI_LOG_LEVEL=info                    # debug, info, warn, error

# Provider-specific (optional)
GROQ_DEFAULT_MODEL=llama-3.3-70b-versatile
OPENROUTER_DEFAULT_MODEL=openai/gpt-4o

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## File Structure

```
app/
├── actions/              # Server actions
├── api/
│   ├── chat/             # AI chat endpoint
│   └── ai/               # AI management endpoints
├── dashboard/
├── login/[[...sign-in]]/
├── signup/[[...sign-up]]/
├── network/
├── opportunities/
├── projects/
├── profile/
├── analytics/
├── assistant/
├── events/
└── settings/

components/
├── dashboard/
├── network/
├── opportunities/
├── projects/
├── profile/
├── analytics/
├── assistant/
├── discovery/
├── layout/
└── ui/                   # shadcn/ui components

hooks/
├── use-ai-chat.ts        # AI chat hooks
└── use-media-query.ts

lib/
├── ai/                   # AI Model Management System
│   ├── index.ts
│   ├── types.ts
│   ├── manager.ts
│   ├── model-configs.ts
│   ├── providers/
│   └── utils/
├── prisma.ts             # Prisma client singleton
└── utils.ts              # General utilities (cn, etc.)

prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Database seeding
```
