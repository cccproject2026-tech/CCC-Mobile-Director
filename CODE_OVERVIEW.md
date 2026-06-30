# CCC Director Mobile — Code Overview & Explanation

> **Audience:** Junior developers joining the project  
> **Project path:** `D:\CCC-Director-Mobile`  
> **Last reviewed:** June 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [Application Architecture](#3-application-architecture)
4. [Screen-by-Screen Explanation](#4-screen-by-screen-explanation)
5. [Core Modules](#5-core-modules)
6. [API Integration](#6-api-integration)
7. [Database and Storage](#7-database-and-storage)
8. [Code Walkthrough](#8-code-walkthrough)
9. [Security Implementation](#9-security-implementation)
10. [Third-Party Libraries](#10-third-party-libraries)
11. [Error Handling and Logging](#11-error-handling-and-logging)
12. [Build and Deployment](#12-build-and-deployment)
13. [Future Improvements](#13-future-improvements)
14. [Summary](#14-summary)

---

## 1. Project Overview

### Purpose of the Application

**CCC Director Mobile** (`ccc-director`) is a cross-platform mobile app for **Directors** and **Super Admins** at *The Center for Community Change (CCC)*. It lets program leaders manage church revitalization workflows from a phone or tablet:

- Review new pastor/mentee interest applications
- Assign and track **mentors** and **pastors (mentees)**
- Create and assign **revitalization roadmaps** and **assessments**
- Schedule **appointments** and manage mentor availability
- Review **micro-grant** applications
- Issue **certificates** and monitor **progress**
- View **notifications** and program insights

The app talks to a **remote REST API** — it is not a standalone offline-first database app.

### Main Features

| Feature area | What directors can do |
|---|---|
| **Dashboard** | See program overview, quick actions, roadmaps, assessments, mentorship stats |
| **New Interests** | Review and accept/reject incoming pastor applications |
| **Mentors & Pastors** | Browse users, assign pairings, view profiles and documents |
| **Progress Tracker** | Monitor mentee progress, final comments, completion |
| **Schedule** | View/create appointments, set availability, Google Calendar OAuth |
| **Roadmaps** | Create, edit, assign revitalization roadmaps; manage phases and tasks |
| **Assessments** | Create assessments, assign to pastors, view CDP results |
| **Micro Grant** | Review grant applications |
| **Profile** | Edit profile, upload documents, personal notes |
| **Notifications** | In-app alerts tab |
| **Directors** (Super Admin) | Manage director accounts |

### Target Users

- **Director** — day-to-day program management
- **Super Admin** — director management + all director capabilities

> Only users with role `director` or `super admin` can log in. Other roles (mentor, pastor, etc.) are blocked at login.

### Technology Stack

| Layer | Technology | Version (approx.) |
|---|---|---|
| **Framework** | React Native | 0.81 |
| **App platform** | Expo SDK | 54 |
| **Language** | TypeScript | 5.9 |
| **Routing** | Expo Router (file-based) | 6 |
| **Server state** | TanStack React Query | 5 |
| **Client state** | Zustand | 5 |
| **HTTP client** | Axios | 1.13 |
| **Navigation** | React Navigation (Drawer + Tabs) | 7 |
| **Animations** | Reanimated, Moti | 4 / 0.30 |
| **UI extras** | Bottom Sheet, SVG, Gifted Charts, Calendars | various |
| **Secure storage** | expo-secure-store | 15 |
| **Persistence** | AsyncStorage (Zustand persist) | 2.2 |
| **Build / release** | EAS Build (`eas.json`) | — |
| **Platforms** | iOS, Android, Web (limited) | — |

---

## 2. Project Structure

### Top-Level Layout

```
CCC-Director-Mobile/
├── src/                    # All application source code
│   ├── app/                # Screens (Expo Router — file = route)
│   ├── assets/             # Images, fonts, icons
│   ├── components/         # Reusable UI building blocks
│   ├── config/             # API URL, timeouts
│   ├── constants/          # Menu items, icons, colors
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom hooks (data + UI logic)
│   ├── lib/                # Small domain helpers
│   ├── navigation/         # Typed route helpers
│   ├── services/           # API service functions
│   ├── stores/             # Zustand global stores
│   ├── types/              # TypeScript interfaces
│   └── utils/              # Helpers (tokens, PDF, navigation)
├── android/                # Native Android project (Expo prebuild)
├── scripts/                # Utility scripts (e.g. reset-project)
├── app.json                # Expo app configuration
├── eas.json                # EAS Build profiles
├── package.json            # Dependencies and npm scripts
├── tsconfig.json           # TypeScript + `@/*` path alias
├── .env                    # Local secrets (not committed)
└── .env.example            # Template for environment variables
```

### Major Directories Explained

| Directory | Purpose |
|---|---|
| `src/app/` | **Screens and navigation tree.** Folder names map to URLs. `(auth)` and `(director)` are route groups. |
| `src/components/` | **UI components** grouped by feature: `Cards/`, `Forms/`, `Modals/`, `Sheets/`, `Header/`, etc. |
| `src/services/` | **API layer.** One file per domain (`auth.service.ts`, `roadmap.service.ts`, …). |
| `src/services/api/` | Shared **Axios client**, **interceptors**, and **endpoint constants**. |
| `src/hooks/` | **React Query hooks** and screen logic (`useAuth`, `useRoadmaps`, `useAppointments`, …). |
| `src/stores/` | **Zustand** stores for auth, notes invalidation, schedule-meeting wizard, navigation state. |
| `src/types/` | Shared **TypeScript types** for API responses and domain models. |
| `src/constants/` | App-wide constants: drawer menu, icon paths, color tokens. |
| `src/utils/` | Pure helpers: token storage, PDF generation, certificate download, navigation patches. |

### Path Alias

`tsconfig.json` maps `@/*` → `./src/*`, so imports look like:

```typescript
import { useAuthStore } from '@/stores/auth.store';
import { ENDPOINTS } from '@/services/api/endpoints';
```

### Configuration Files

| File | Purpose |
|---|---|
| `app.json` | Expo config: app name, icons, splash, permissions, plugins, bundle IDs (`com.vkyboss.cccdirector`). |
| `eas.json` | EAS Build profiles: `development`, `preview`, `production`. |
| `tsconfig.json` | Strict TypeScript, path aliases. |
| `eslint.config.js` | Lint rules via `eslint-config-expo`. |
| `expo-env.d.ts` | Expo TypeScript environment types. |

### Environment Files

**`.env.example`** (committed template):

```env
EXPO_PUBLIC_API_URL=https://your-api-url.example.com
EXPO_PUBLIC_API_TIMEOUT=15000
```

**`.env`** (local, gitignored) — copy from example and set your real API URL.

These are read in `src/config/index.ts`:

```typescript
export const API_CONFIG = {
    BASE_URL: `${process.env.EXPO_PUBLIC_API_URL}/api/v1` || 'http://13.221.25.133/api/v1',
    TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 15000,
} as const;
```

- `EXPO_PUBLIC_*` variables are embedded at **build time** by Expo.
- The final API base URL is `{EXPO_PUBLIC_API_URL}/api/v1`.

---

## 3. Application Architecture

### Architectural Pattern

The app uses a **layered, feature-oriented** architecture (not strict MVC or Clean Architecture, but similar ideas):

```
┌─────────────────────────────────────────┐
│  Screens (src/app/)                     │  ← UI + navigation
├─────────────────────────────────────────┤
│  Components (src/components/)           │  ← Reusable UI
├─────────────────────────────────────────┤
│  Hooks (src/hooks/)                     │  ← React Query + UI logic
├─────────────────────────────────────────┤
│  Stores (src/stores/)                   │  ← Global client state (Zustand)
├─────────────────────────────────────────┤
│  Services (src/services/)               │  ← HTTP calls to backend
├─────────────────────────────────────────┤
│  API Client + Interceptors              │  ← Axios, auth headers, refresh
└─────────────────────────────────────────┘
                    │
                    ▼
            Remote REST API (backend)
```

### Data Flow Between Layers

**Example: Loading roadmaps on the Roadmaps screen**

1. **Screen** (`roadmaps/index.tsx`) calls `useAllRoadmaps()` hook.
2. **Hook** (`hooks/roadmap/useRoadmaps.ts`) uses React Query with `roadmapService.getAllRoadmaps()`.
3. **Service** (`services/roadmap.service.ts`) calls `apiClient.get(ENDPOINTS.ROADMAPS.GET_ALL)`.
4. **Interceptor** attaches `Authorization: Bearer <token>` from SecureStore.
5. **Response** flows back: Service → Hook (cached by React Query) → Screen → Components.

**Example: Login flow**

1. User submits email/password on `(auth)/index.tsx`.
2. `useLogin()` mutation calls `authService.login()`.
3. On success: tokens → `expo-secure-store`, user → Zustand `auth.store` (persisted to AsyncStorage).
4. `router.replace('/(director)/(tabs)')` opens the main app.
5. Root `_layout.tsx` uses `isAuthenticated` to show director routes vs auth routes.

### State Management Approach

| State type | Tool | Used for |
|---|---|---|
| **Server / API data** | TanStack React Query | Roadmaps, mentors, appointments, notifications, profile |
| **Auth session** | Zustand + persist | `user`, `isAuthenticated` |
| **JWT tokens** | expo-secure-store | `accessToken`, `refreshToken` (never in Zustand) |
| **Wizard / UI flow** | Zustand | Schedule meeting steps, mentor/mentee list navigation |
| **Notes refresh signal** | Zustand | `invalidationKey` to refetch notes after edits |
| **Local UI** | `useState` / `useRef` | Form inputs, modals, scroll position |

---

## 4. Screen-by-Screen Explanation

### Navigation Overview

```
App Start
    │
    ├─ Not logged in → (auth)/index          [Login]
    │
    └─ Logged in → (director)/_layout          [Drawer wrapper]
                        │
                        └─ (tabs)/_layout      [Bottom tabs: Alerts | Dashboard | Profile]
                               │
                               ├─ Hidden routes via drawer menu (mentors, roadmaps, etc.)
                               └─ Stack screens within each feature folder
```

**Visible bottom tabs:** Alerts (`notifications`), Dashboard (`index`), Profile (`profile`).

**Side drawer** (`components/Drawer`) exposes most features via `MENU_ITEMS` in `constants/index.ts`.

### All Screens / Pages

#### Authentication

| Route | File | Purpose |
|---|---|---|
| `/` (auth) | `(auth)/index.tsx` | Login form (email + password) |

#### Dashboard & Tabs

| Route | File | Purpose |
|---|---|---|
| `/(director)/(tabs)/` | `(tabs)/index.tsx` | Home dashboard with overview sections |
| `/(director)/(tabs)/notifications` | `notifications.tsx` | Notification list |
| `/(director)/(tabs)/profile` | `profile/index.tsx` | Director's own profile |
| `/(director)/(tabs)/ai-insights` | `ai-insights.tsx` | AI insights (from home shortcuts) |

#### Mentors & Mentees (shared tab group)

| Route | Purpose |
|---|---|
| `mentors/index` | List all mentors |
| `mentors/[id]` | Mentor profile detail |
| `mentors/[id]/documents` | Mentor documents |
| `mentors/assign-mentees` | Assign mentees to a mentor |
| `mentors/remove-mentee` | Remove mentee from mentor |
| `mentors/mentor-mentees` | View mentor's mentees |
| `mentees/index` | List all pastors/mentees |
| `mentees/[id]` | Mentee profile |
| `mentees/[id]/documents` | Mentee documents |
| `mentees/[id]/progress` | Mentee progress view |
| `mentees/assign-mentors` | Assign mentors to mentee |
| `mentees/remove-mentors` | Remove mentors from mentee |
| `mentees/mentees-location` | Location-based mentee view |
| `mentees/notes` | Notes on mentees |

#### Progress & Completion

| Route | Purpose |
|---|---|
| `progress-tracker/index` | Progress overview list |
| `progress-tracker/[userId]` | Individual user progress |
| `progress-tracker/report` | Progress reports |
| `progress-tracker/mentors/[id]` | Mentor-specific progress |
| `course-completed/index` | Completed course / certificate workflow |

#### New Interests

| Route | Purpose |
|---|---|
| `new-interests/index` | List new interest applications |
| `new-interests/interest-details` | Single interest detail + actions |

#### Appointments & Scheduling

| Route | Purpose |
|---|---|
| `appointments/index` | Calendar / appointment list |
| `appointments/availability` | Set weekly availability |
| `appointments/meeting-details` | Meeting detail (root stack) |
| `schedule-meeting/person` | Pick person for new meeting |
| `schedule-meeting/time` | Pick time slot |
| `schedule-meeting/confirm` | Confirm and book |
| `oauth/google-calendar` | Google Calendar OAuth callback |

#### Roadmaps

| Route | Purpose |
|---|---|
| `roadmaps/index` | Roadmap library hub |
| `roadmaps/[id]` | Roadmap detail |
| `roadmaps/select-roadmap` | Pick roadmap to assign |
| `roadmaps/assign-roadmaps` | Assign to users |
| `roadmaps/roadmap-paths` | User's roadmap paths |
| `roadmaps/phase-list` | Phases in a roadmap |
| `roadmaps/task` | Single task view |
| `roadmaps/mentor-pastors` | Pastors under a mentor (roadmap context) |
| `roadmaps/(creation)/roadmap-creation` | Create roadmap wizard |
| `roadmaps/(creation)/roadmap-form` | Roadmap form fields |
| `roadmaps/(creation)/roadmap-edit` | Edit existing roadmap |

#### Assessments

| Route | Purpose |
|---|---|
| `assessments/index` | Assessment library |
| `assessments/[id]` | Assessment detail |
| `assessments/create-assessment` | Create new assessment |
| `assessments/assign-assessments` | Assign to pastors |
| `assessments/select-assessment` | Picker screen |
| `assessments/edit-sections` | Edit assessment sections |
| `assessments/result` | View assessment results |
| `assessments/cdp` | Career Development Plan view |
| `assessments/mentor-pastors` | Pastor list for mentor |

#### Micro Grant & CCC

| Route | Purpose |
|---|---|
| `micro-grant/index` | Grant applications list |
| `micro-grant/[id]` | Application detail |
| `micro-grant/review/[id]` | Review workflow |
| `invite-field-mentor` | Invite field mentor form |
| `ccc/interest-form` | CCC interest form config |
| `product-and-services/index` | Products placeholder |
| `directors/index` | Director management (super admin) |

#### Profile Sub-routes

| Route | Purpose |
|---|---|
| `profile/documents` | User document uploads |
| `profile/personal-notes` | Notes list |
| `profile/personal-notes/new-note` | Create note |
| `profile/personal-notes/note-detail` | View/edit note |

#### Other

| Route | Purpose |
|---|---|
| `search.tsx` | Global search |
| `+not-found.tsx` | 404 screen |

### Navigation Flow (Typical Session)

1. **Login** → Dashboard
2. Open **drawer** → e.g. "All Pastors"
3. Tap a pastor → **Profile detail** → "Progress" or "Documents"
4. From dashboard shortcut → **Roadmaps** → **Assign** → pick pastor
5. **Schedule** → `schedule-meeting` wizard (person → time → confirm)

### Key UI Components Used Across Screens

| Component | Location | Role |
|---|---|---|
| `GradientBackground` | `components/ui/design-system` | App-wide background gradient |
| `HeroHeader` / `TopBar` | `components/Header/` | Screen headers |
| `CommonCard`, `PrimaryButton` | design-system | Cards and buttons |
| `WelcomeCard`, `MentorCard`, `MenteeCard` | `components/Cards/` | List item cards |
| `CustomDrawerContent` | `components/Drawer/` | Side navigation menu |
| `BottomSheetModal` | `@gorhom/bottom-sheet` | Create roadmap, actions |
| `ProfileContent` | `components/ProfileSection/` | Shared profile layout |
| `FilterModal`, `ConfirmModal` | `components/Modals/` | Dialogs |

---

## 5. Core Modules

### Authentication Module

**Files:** `src/app/(auth)/`, `src/hooks/useAuth.ts`, `src/services/auth.service.ts`, `src/stores/auth.store.ts`, `src/utils/tokenStorage.ts`

**Flow:**
1. User enters credentials → `useLogin()` mutation
2. `authService.login()` → `POST /auth/login`
3. Role check: only `director` or `super admin`
4. Tokens saved to SecureStore; user saved to Zustand
5. Navigate to director tabs

**Root guard** in `src/app/_layout.tsx`:

```typescript
<Stack.Protected guard={!isAuthenticated}>
  <Stack.Screen name="(auth)" />
</Stack.Protected>
<Stack.Protected guard={isAuthenticated}>
  <Stack.Screen name="(director)" />
</Stack.Protected>
```

- `guard={!isAuthenticated}` — show login only when **not** logged in
- `guard={isAuthenticated}` — show director app only when logged in

### User Profile Module

**Files:** `src/app/(director)/(tabs)/profile/`, `src/hooks/useProfile.ts`, `src/services/profile.service.ts`, `src/components/ProfileSection/`

- Fetches full user + interest data via `GET /users/:userId`
- Supports document upload/delete, profile picture, dynamic form fields
- `ProfileContent` is reused for director self-profile and viewing mentor/mentee profiles

### Dashboard / Home Module

**Files:** `src/app/(director)/(tabs)/index.tsx`, `src/components/NewHome/`, `src/components/Home/`

Dashboard sections include:
- `GlanceSection` — quick stats
- `QuickActionSection` — shortcuts
- `RoadMapsSection`, `AssesmentsAndCDPSection`
- `MentorShipAndSupportSection`
- `TrackingAndReportsSection`, `AiInsightsSection`
- `DirectorsNotesSection`

Data is loaded via various hooks (`useProgress`, `useInterests`, `useNotifications`, etc.).

### API Integration Module

**Files:** `src/services/api/client.ts`, `interceptors.ts`, `endpoints.ts`, plus `src/services/*.service.ts`

Central Axios instance with request/response interceptors for auth and logging. See [Section 6](#6-api-integration).

### Notification Module

**Files:** `src/app/(director)/(tabs)/notifications.tsx`, `src/hooks/useNotifications.ts`, `src/services/notifications.service.ts`

- Fetches `GET /home/notifications?role=director`
- Normalizes API shape to `{ items, unreadCount }`
- React Query caches for 60 seconds (`staleTime`)

### Storage Module

**Not a local database** — see [Section 7](#7-database-and-storage).

- **Tokens:** `expo-secure-store` (`src/utils/tokenStorage.ts`)
- **Auth user persist:** Zustand + AsyncStorage (`director-auth` key)
- **No SQLite / MMKV for data** (MMKV is in `package.json` but auth persist currently uses AsyncStorage via `zustandStorage.ts`)

---

## 6. API Integration

### Base URL

```
{EXPO_PUBLIC_API_URL}/api/v1
```

All paths below are relative to that base.

### API Endpoints (Grouped)

#### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/login` | Login |
| POST | `/auth/send-otp` | Send OTP |
| POST | `/auth/verify-otp` | Verify OTP |
| POST | `/auth/set-password` | Set password |
| POST | `/auth/forgot-password` | Forgot password |
| POST | `/auth/reset-password` | Reset password |
| POST | `/auth/refresh-token` | Refresh JWT |
| POST | `/auth/logout` | Logout |
| POST | `/auth/google` | Google auth |

#### Users & Profile

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/users?role=` | List users by role |
| GET/PATCH | `/users/:userId` | Get/update user |
| GET | `/users/check-status/:userId` | Check onboarding status |
| GET/PATCH | `/interests/by-email/:email` | Interest by email |
| GET | `/progress/:userId` | User progress |
| POST | `/users/:userId/profile-picture` | Upload avatar |
| GET/POST/DELETE | `/users/:userId/documents` | Documents CRUD |
| GET/POST | `/users/:userId/notes` | Notes |
| GET/PATCH/DELETE | `/users/:userId/notes/:noteId` | Single note |

#### Mentors & Mentees

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/users/:id/assigned` | Assigned users |
| POST | `/users/:id/assign` | Assign pairing |
| POST | `/users/:id/remove` | Remove pairing |

#### Home & Notifications

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/home/mentees`, `/home/mentors` | Home summaries |
| GET | `/home/notifications` | Notifications |
| GET | `/home/mentor/:email`, `/home/mentee/:email` | Lookup by email |

#### Assessments

| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST | `/assessment` | List/create |
| GET/PATCH/DELETE | `/assessment/:id` | CRUD |
| POST | `/assessment/:id/assign` | Assign |
| GET/POST | `/assessment/:id/answers/:userId` | Answers |
| GET | `/assessment/assigned/:userId` | Assigned list |
| PATCH | `/assessment/:id/sections` | Update sections |

#### Roadmaps

| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST | `/roadmaps` | List/create |
| GET/PATCH/DELETE | `/roadmaps/:id` | CRUD |
| POST | `/roadmaps/:id/nested` | Nested roadmaps |
| GET/POST | `/roadmaps/:id/comments` | Comments |
| GET/POST | `/roadmaps/:id/queries` | Q&A queries |
| GET | `/roadmaps/user/:userId` | User's roadmaps |

#### Appointments

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/appointments/user/:userId` | User appointments |
| POST | `/appointments` | Create |
| GET/PATCH | `/appointments/:id` | Detail/update |
| GET/POST | `/appointments/availability/...` | Availability management |
| POST | `/appointments/:id/reschedule` | Reschedule |
| POST | `/appointments/:id/cancel` | Cancel |
| GET | `/appointments/upcoming` | Upcoming |

#### Micro Grant

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/microgrant/applications` | List applications |
| GET | `/microgrant/application/:id` | Detail |
| PATCH | `/microgrant/application/:id/status` | Update status |
| POST | `/microgrant/apply` | Submit application |

#### Progress & Certificates

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/progress/assign-assessment` | Assign assessment |
| POST | `/progress/assign-roadmap` | Assign roadmap |
| POST/GET | `/progress/:userId/final-comments` | Final comments |
| GET | `/progress/overview/director` | Director overview |
| POST | `/users/:userId/issue-certificate` | Issue certificate |
| POST | `/certificates/issue` | Certificate API |

#### Interests, Directors, Scholarships

| Method | Endpoint | Purpose |
|---|---|---|
| GET/PATCH | `/interests`, `/interests/request/:id` | Interest management |
| CRUD | `/super-admin/directors` | Director admin |
| GET | `/scholarships` | Scholarships |

Full list: `src/services/api/endpoints.ts`.

### Request and Response Flow

```typescript
// 1. Service layer — thin wrapper
const response = await apiClient.get(ENDPOINTS.ROADMAPS.GET_ALL);

// 2. Request interceptor — adds Bearer token
config.headers.Authorization = `Bearer ${accessToken}`;

// 3. Response interceptor — on 401, refresh token and retry
```

### Authentication Mechanism

- **JWT Bearer tokens** in `Authorization` header
- **Access token** + **refresh token** stored in SecureStore
- On **401**, interceptor calls `POST /auth/refresh-token`, saves new tokens, retries original request
- Failed refresh → `logout()` clears session

### Error Handling Approach

Interceptors normalize errors to:

```typescript
{
  message: string,      // from API or fallback
  statusCode: number,   // HTTP status (0 = network error)
  errors?: unknown      // validation errors if any
}
```

React Query:
- Retries up to 2 times except for 401/403
- Hooks expose `isError`, `error` to screens
- UI often uses `Alert.alert()` for user-facing messages

---

## 7. Database and Storage

### Database Technology

**There is no on-device SQL/NoSQL database.** All persistent business data lives on the **backend API**. The mobile app caches API responses in **React Query memory** (with `staleTime` / `gcTime`).

### Backend Data (Conceptual)

The API likely uses document/collection-style storage (MongoDB-style IDs like `_id` appear in types). Main entities:

| Entity | Description |
|---|---|
| Users | Directors, mentors, pastors, admins |
| Interests | Onboarding applications |
| Roadmaps | Templates and user assignments |
| Assessments | Forms, sections, answers |
| Appointments | Meetings and availability |
| Micro grants | Grant applications |
| Progress | Completion, comments, certificates |
| Notifications | Alert feed |

### Local Storage Implementation

| Storage | Library | What's stored |
|---|---|---|
| **SecureStore** | `expo-secure-store` | `accessToken`, `refreshToken` |
| **AsyncStorage** | `@react-native-async-storage/async-storage` | Zustand persist blob `director-auth` (user + isAuthenticated) |
| **React Query cache** | In-memory | API responses while app is running |

**`tokenStorage.ts` — line by line:**

```typescript
import * as SecureStore from 'expo-secure-store';
// Import Expo's encrypted keychain/keystore wrapper

export const tokenStorage = {
    setTokens: async (accessToken: string, refreshToken: string) => {
        await SecureStore.setItemAsync("accessToken", accessToken);   // Save JWT access token
        await SecureStore.setItemAsync("refreshToken", refreshToken); // Save refresh token
    },

    getTokens: async () => {
        const accessToken = await SecureStore.getItemAsync("accessToken");   // Read access token
        const refreshToken = await SecureStore.getItemAsync("refreshToken"); // Read refresh token
        return { accessToken, refreshToken };  // Return both (may be null if logged out)
    },

    clearTokens: async () => {
        await SecureStore.deleteItemAsync("accessToken");   // Remove on logout
        await SecureStore.deleteItemAsync("refreshToken");
    }
};
```

### Data Synchronization

1. **Read:** React Query fetches from API; cache invalidated on mutations or manual `invalidateQueries`.
2. **Write:** Mutations POST/PATCH/DELETE → on success, invalidate related query keys.
3. **Offline:** No full offline sync; network errors show "Network error. Please check your connection."
4. **Pull-to-refresh:** Individual screens may refetch via `refetch()` from hooks.

---

## 8. Code Walkthrough

### Important Entry Point — Root Layout

**File:** `src/app/_layout.tsx`

```typescript
import "@/services/api/interceptors";  // Register Axios interceptors once at startup
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from "@/stores/auth.store";
import { Stack } from 'expo-router';

const queryClient = new QueryClient({ /* retry rules */ });

function RootNav() {
  const { isAuthenticated } = useAuthStore();  // Read login state from Zustand

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />           // Login screens
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(director)" />       // Main app
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>   {/* React Query for all API data */}
        <BottomSheetModalProvider>                 {/* Bottom sheets globally */}
          <RootNav />
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

### Auth Store

**File:** `src/stores/auth.store.ts`

- `setUser(user)` — after login, sets user and `isAuthenticated: true`
- `logout()` — clears SecureStore tokens + AsyncStorage persist + resets state
- `updateUser(partial)` — merge profile updates into cached user
- `persist` middleware saves only `{ user, isAuthenticated }` — **not tokens**

### Login Hook

**File:** `src/hooks/useAuth.ts`

Key steps in `onSuccess`:
1. Check `user.role` is `director` or `super admin`
2. `storage.setTokens(accessToken, refreshToken)`
3. Normalize `user.id` from `_id` if needed
4. `setUser(normalizedUser)`
5. `router.replace('/(director)/(tabs)')`

### Reusable Components

| Component | Use case |
|---|---|
| `DynamicFieldRenderer` | Renders profile/interest form fields by type |
| `SectionRenderer` / field renderers | Assessment and roadmap dynamic forms |
| `AppointmentCard` | Appointment list items |
| `RoadmapCard` / `AssessmentCard` | Library list cards |
| `CertificatePreview` | Certificate PDF preview |
| `ScheduleMonthCalendar` | Month view for scheduling |
| `ScreenBackHeader` | Consistent back navigation header |

### Utility / Helper Functions

| File | Purpose |
|---|---|
| `utils/tokenStorage.ts` | Secure JWT storage |
| `utils/authTokenResponse.ts` | Parse token shape from API |
| `utils/navigation.ts` | Safe navigation helpers |
| `utils/patchRouterBack.ts` | Android back button fixes |
| `utils/pdf.ts` | PDF generation (expo-print) |
| `utils/certificateDownload.ts` | Save/share certificates |
| `utils/appointments/timezone.ts` | Timezone helpers for scheduling |
| `navigation/routes.ts` | Typed `Routes.assessments.detail(id)` helpers |

### Custom Hooks (Selected)

| Hook | Purpose |
|---|---|
| `useLogin` | Login mutation |
| `useUserProfile` | Current or other user's profile |
| `useAllRoadmaps` / `useRoadmapTask` | Roadmap CRUD and reads |
| `useAssessments` | Assessment operations |
| `useMentors` / `useMentees` | User lists and assignments |
| `useAppointments` | Appointment calendar data |
| `useNotifications` | Notification feed |
| `useMicroGrant` | Grant applications |
| `useProgress` | Progress overview |
| `useGoogleCalendarStatus` | Google Calendar connection |

### Context Providers

| Provider | File | Purpose |
|---|---|---|
| `AddFieldSheetProvider` | `contexts/AddFieldSheetContext.tsx` | Global state for "add dynamic field" bottom sheet in forms |

---

## 9. Security Implementation

### Authentication and Authorization

- **Login required** for all director routes (`Stack.Protected`)
- **Role gate at login** — mentors/pastors cannot use this app
- **Drawer menu filtering** — super-admin-only items hidden for directors (`roles: ['super admin']` on menu items)

### Token Management

| Concern | Implementation |
|---|---|
| Storage | `expo-secure-store` (OS keychain/keystore) |
| Attachment | Axios request interceptor |
| Refresh | Automatic on 401 with queue for parallel requests |
| Logout | Clears tokens + persisted auth state |

### Secure Storage Practices

- JWTs **never** stored in AsyncStorage or plain Zustand state
- `android.usesCleartextTraffic: false` in `app.json` (HTTPS only)
- `.env` gitignored; secrets not in source code

### Data Validation

- **Client-side:** Form validation before submit (required email/password on login, trim inputs)
- **Server-side:** API returns 400 with `message` / `errors`; UI displays via Alert or inline error
- **URL safety:** Interceptor strips `undefined` from query params to avoid bad requests

---

## 10. Third-Party Libraries

| Package | Purpose | Where used |
|---|---|---|
| `expo` / `expo-router` | App runtime, file routing | Entire app |
| `react-native` | Mobile UI | All screens |
| `@tanstack/react-query` | Server state, caching | All `use*` data hooks |
| `zustand` | Global client state | `src/stores/` |
| `axios` | HTTP client | `src/services/api/` |
| `@react-navigation/drawer` | Side drawer | `(director)/_layout.tsx` |
| `@react-navigation/bottom-tabs` | Tab bar | `(tabs)/_layout.tsx` |
| `@gorhom/bottom-sheet` | Modal sheets | Create roadmap, scheduling |
| `expo-secure-store` | Token storage | `tokenStorage.ts` |
| `@react-native-async-storage/async-storage` | Zustand persist | `zustandStorage.ts` |
| `react-native-reanimated` | Animations | Dashboard scroll, transitions |
| `react-native-gesture-handler` | Gestures | Root wrapper, drawers |
| `react-native-calendars` | Calendar UI | Appointments |
| `react-native-gifted-charts` | Charts | Progress visuals |
| `react-native-signature-canvas` | Digital signatures | Assessment forms |
| `expo-image-picker` / `expo-document-picker` | Media upload | Profile, documents |
| `expo-print` / `expo-sharing` | PDF export | Certificates |
| `date-fns` | Date formatting | Appointments, lists |
| `moti` | Motion animations | UI polish |
| `react-native-mmkv` | Fast storage (dependency present) | Listed in package.json; auth persist uses AsyncStorage currently |
| `expo-dev-client` | Development builds | Local dev with native modules |

---

## 11. Error Handling and Logging

### Error Management Strategy

1. **Axios interceptor** — normalizes HTTP and network errors
2. **React Query** — `isError`, `error`, retry policy
3. **UI layer** — `Alert.alert`, error text on screens, skeleton/empty states
4. **Auth errors** — 401 triggers refresh; failed refresh logs user out

### Logging Implementation

Development-only logging in `interceptors.ts`:

```typescript
const devLog = (...args: any[]) => {
    if (__DEV__) console.log("[API]", ...args);  // Only logs in development builds
};
```

Logs include: request method/URL, body, response status, refresh flow steps.

`api/client.ts` also logs base URL on startup in `__DEV__`.

### Debugging Approach

1. Run `npx expo start` and watch Metro console for `[API]` logs
2. Verify `.env` has correct `EXPO_PUBLIC_API_URL`
3. Use React Query Devtools (not bundled by default — can add for web)
4. Test on **development build** (`expo-dev-client`) for native modules
5. Check `isAuthenticated` and tokens if routes don't appear

---

## 12. Build and Deployment

### Environment Setup

```bash
# 1. Clone repo
cd D:\CCC-Director-Mobile

# 2. Install dependencies
npm install
# or: pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env → set EXPO_PUBLIC_API_URL

# 4. Start dev server
npx expo start
```

**Requirements:** Node.js 18+, Expo CLI, Android Studio and/or Xcode for simulators.

### Build Process

| Command | Action |
|---|---|
| `npm start` | Expo dev server |
| `npm run android` | Run on Android (`expo run:android`) |
| `npm run ios` | Run on iOS (`expo run:ios`) |
| `npm run web` | Web preview |
| `npm run lint` | ESLint |

**EAS Build profiles** (`eas.json`):

- `development` — dev client, internal distribution
- `preview` — internal testing
- `production` — store builds with `autoIncrement` version

```bash
# Production build (requires EAS account)
eas build --platform android --profile production
eas build --platform ios --profile production
```

### Deployment Steps

1. Set production `EXPO_PUBLIC_API_URL` in EAS secrets or `.env`
2. Run `eas build` for target platform
3. Submit: `eas submit --platform android` / iOS
4. Bundle IDs: `com.vkyboss.ccc-director` (iOS + Android)

### Release Management

- Version in `app.json`: `1.0.0`
- EAS `production` profile uses `autoIncrement` for build numbers
- `owner`: `bala2002`, EAS project ID in `app.json` → `extra.eas.projectId`

---

## 13. Future Improvements

### Recommended Optimizations

- Call `authStore.initialize()` on app boot to sync `isAuthenticated` with SecureStore tokens (currently relies on Zustand persist hydration)
- Migrate Zustand persist from AsyncStorage to **MMKV** (already a dependency) for faster startup
- Add React Query `placeholderData` / optimistic updates on more mutations
- Remove `console.log` debug statements in production screens (e.g. dashboard `user Data`)

### Scalability Considerations

- Split large service files if domains grow
- Add pagination hooks for long mentor/mentee lists
- Consider feature flags for placeholder screens (`videos`, `reports`, `contact-details`)

### Security Enhancements

- Implement certificate pinning for production API
- Add biometrics unlock for reopening app
- Complete logout API call (`POST /auth/logout`) on sign-out

### Performance Improvements

- Lazy-load heavy screens (assessment editor, roadmap creation)
- Image optimization via `expo-image` with caching
- Tune React Query `staleTime` per endpoint (some use `0`, causing frequent refetch)

---

## 14. Summary

### Overall Project Flow

```
Login (auth) → JWT in SecureStore → Director Drawer App
    → Dashboard (tabs) + Drawer navigation
    → Feature screens call hooks → services → REST API
    → React Query caches responses → UI updates
    → Logout clears tokens and persisted user
```

### Key Takeaways for New Developers

1. **Start with `src/app/_layout.tsx`** — understand providers and auth guards.
2. **Follow a feature vertically:** screen → hook → service → endpoint.
3. **Tokens live in SecureStore** — never put them in Zustand or logs.
4. **Expo Router:** folder structure = routes; `(group)` names don't appear in URL.
5. **Drawer vs tabs:** most features are drawer items with hidden tab routes.
6. **Types first:** check `src/types/` before guessing API shapes.

### Important Files to Review First

| Priority | File | Why |
|---|---|---|
| 1 | `src/app/_layout.tsx` | App entry, providers, auth routing |
| 2 | `src/services/api/interceptors.ts` | Auth headers, refresh, errors |
| 3 | `src/services/api/endpoints.ts` | All API paths |
| 4 | `src/hooks/useAuth.ts` | Login flow |
| 5 | `src/stores/auth.store.ts` | Session state |
| 6 | `src/constants/index.ts` | Drawer menu / navigation map |
| 7 | `src/app/(director)/(tabs)/_layout.tsx` | Tab bar behavior |
| 8 | `src/navigation/routes.ts` | Typed navigation helpers |
| 9 | `src/config/index.ts` | API configuration |
| 10 | `src/app/(director)/(tabs)/index.tsx` | Dashboard composition |

---

*This document reflects the codebase at `D:\CCC-Director-Mobile`. Update it when major features or architecture change.*
