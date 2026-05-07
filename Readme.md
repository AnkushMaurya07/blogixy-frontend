# Blogixy Frontend (React + TypeScript)

## Purpose
UI application for Blogixy with modular pages for:
- authentication and role selection
- home feed
- blog creation dashboard
- notifications

## Architecture
- React + TypeScript
- Redux Toolkit for authentication/session state
- TanStack Query for API data flow
- Bootstrap utility classes for UI layout

## Folder Structure
- `src/components` reusable UI components (`AppNavbar`, `BlogCard`)
- `src/pages` page-level composition (`HomePage`, `AuthPage`, `DashboardPage`, `NotificationsPage`)
- `src/features/auth` Redux auth slice + typed hooks
- `src/api` central API client + TanStack Query hooks + payload types

## Module Documentation

### Auth Page
- **Purpose:** register/login and role selection.
- **Components used:** Bootstrap form controls.
- **State management:** local form state + Redux token state.
- **APIs involved:** `/api/auth/register/`, `/api/auth/login/`.
- **User flow:** user toggles register/login -> authenticates -> token stored.
- **Edge cases:** invalid credentials, registration validation errors.

### Home Page
- **Purpose:** render public blog listing.
- **Components used:** `BlogCard`.
- **State management:** TanStack Query cache (`blogs` query).
- **APIs involved:** `/api/blogs/`.
- **User flow:** load feed on page open.
- **Edge cases:** empty list and loading state.

### Dashboard Page
- **Purpose:** create blog posts.
- **Components used:** Bootstrap form card.
- **State management:** local form state + mutation invalidation.
- **APIs involved:** `/api/blogs/`.
- **User flow:** authenticated user submits blog form.
- **Edge cases:** unauthenticated route blocked by `ProtectedRoute`.

### Notifications Page
- **Purpose:** display user notifications.
- **Components used:** Bootstrap list group.
- **State management:** TanStack Query (`notifications` query).
- **APIs involved:** `/api/notifications/`.
- **User flow:** authenticated user checks activity updates.
- **Edge cases:** empty notifications list.

### Explore Page
- **Purpose:** search and discover blogs by ranking or latest.
- **Components used:** `BlogCommentsPanel`.
- **State management:** TanStack Query with query params.
- **APIs involved:** `/api/blogs/?search=&sort=`.
- **User flow:** user searches posts -> toggles ranking/latest -> likes/comments.
- **Edge cases:** empty result set.

### Messages & Friends Page
- **Purpose:** direct messaging and follow/friend connection flow.
- **Components used:** Bootstrap list groups and input groups.
- **State management:** local selection state + query/mutation hooks.
- **APIs involved:** `/api/auth/users/`, `/api/auth/follows/create/`, `/api/auth/messages/`.
- **User flow:** search users -> follow -> chat with selected user.
- **Edge cases:** no selected user, empty message not sent.

## Run
1. `npm install`
2. `npm run dev`

## Change Tracking
- **What changed:** full frontend scaffold and domain pages.
- **Why changed:** satisfy complete app workflow in one implementation pass.
- **Impacted modules:** auth, blogs, notifications, explore, messaging, navigation, API layer.
