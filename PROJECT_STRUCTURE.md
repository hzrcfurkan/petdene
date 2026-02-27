# Project Structure

This document outlines the world-recognized, quality-standard folder structure for this Next.js starter kit.

## 📁 Directory Structure

```
start-full-stack/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Route group for authenticated pages
│   │   ├── admin/               # Admin pages
│   │   ├── dashboard/            # Client dashboard
│   │   ├── profile/             # User profile
│   │   ├── settings/           # User settings
│   │   └── staff/              # Staff pages
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication routes
│   │   └── v1/                 # Versioned API routes
│   │       ├── admin/          # Admin API endpoints
│   │       └── user/           # User API endpoints
│   ├── signin/                  # Sign in page
│   ├── signup/                  # Sign up page
│   ├── layout.tsx              # Root layout
│   └── page.tsx                 # Landing page
│
├── components/                   # React components
│   ├── features/                # Feature-based components
│   │   ├── admin/              # Admin feature components
│   │   ├── auth/               # Authentication components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── profile/            # Profile components
│   │   └── settings/           # Settings components
│   ├── layout/                  # Layout components
│   │   ├── admin/              # Admin layout
│   │   └── landing/            # Landing page layout
│   ├── providers/               # Context providers
│   ├── shared/                  # Shared/common components
│   └── ui/                      # shadcn/ui components
│
├── lib/                         # Library/utility code
│   ├── api/                     # API utilities
│   │   ├── cloudinary.ts       # Cloudinary integration
│   │   └── email-service.ts    # Email utilities
│   ├── auth/                    # Authentication utilities
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── current-user-client.ts
│   │   ├── current-user-server.ts
│   │   ├── rbac.ts             # Role-based access control
│   │   └── index.ts             # Auth module exports
│   ├── constants/               # Application constants
│   ├── db/                      # Database utilities
│   │   ├── prisma.ts           # Prisma client
│   │   └── index.ts
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # General utilities
│       ├── utils.ts            # Utility functions
│       └── index.ts
│
├── hooks/                       # Custom React hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── prisma/                      # Prisma ORM
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
│
├── public/                      # Static assets
│
└── middleware.ts               # Next.js middleware
```

## 🎯 Structure Principles

### 1. **Feature-Based Components** (`components/features/`)
- Components are organized by feature/domain
- Each feature has its own folder with related components
- Index files for clean exports

### 2. **Layered Architecture** (`lib/`)
- **`lib/api/`** - External API integrations
- **`lib/auth/`** - Authentication & authorization
- **`lib/db/`** - Database access layer
- **`lib/utils/`** - Pure utility functions
- **`lib/constants/`** - Application constants
- **`lib/types/`** - Shared TypeScript types

### 3. **Clear Separation of Concerns**
- **Pages** (`app/`) - Route handlers and page components
- **Components** (`components/`) - Reusable UI components
- **Business Logic** (`lib/`) - Core application logic
- **Hooks** (`hooks/`) - Reusable React hooks

### 4. **Consistent Naming**
- Files use kebab-case: `signin-form.tsx`
- Components use PascalCase: `SigninForm`
- Directories use kebab-case: `features/`, `admin/`

## 📦 Import Patterns

### Recommended Import Paths

```typescript
// Features
import { SigninForm } from "@/components/features/auth"
import { AdminDashboard } from "@/components/features/admin"
import { ClientDashboard } from "@/components/features/admin"

// Layouts
import LayoutAdmin from "@/components/layout/admin"
import LayoutLanding from "@/components/layout/landing"

// UI Components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Library
import { authOptions, currentUserServer } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { cn } from "@/lib/utils"
import { USER_ROLES } from "@/lib/constants"
import type { User } from "@/lib/types"

// Hooks
import { useToast } from "@/hooks/use-toast"
```

## ✅ Best Practices

1. **Feature Isolation**: Each feature is self-contained
2. **Index Exports**: Use index files for cleaner imports
3. **Type Safety**: Centralized types in `lib/types/`
4. **Constants**: All constants in `lib/constants/`
5. **Consistent Paths**: Use `@/` alias for all imports
6. **Clear Naming**: Descriptive, consistent naming conventions

