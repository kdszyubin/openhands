# Implementation Plan: Go Backend, Vue Frontend, and iOS-Style UI Redesign for Doudizhu Game

**Branch**: `001-go-vue-ios-redesign` | **Date**: 2026-03-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-go-vue-ios-redesign/spec.md`

## Summary

Migrate the existing Doudizhu card game from Node.js/Vanilla JS to a Go backend with Vue.js 3 frontend, implementing a modern iOS-style UI with 2025-standard responsive design. The project involves full technology stack replacement while preserving all existing game rules, AI logic, and multiplayer functionality.

## Technical Context

**Language/Version**: Backend: Go 1.21+; Frontend: Vue.js 3.x with TypeScript 5.x (NEEDS CLARIFICATION on exact versions)  
**Primary Dependencies**: NEEDS CLARIFICATION - Go: (Gin/Echo/fiber for HTTP, gorilla/websocket or melody for WebSocket); Vue: (Pinia for state, Vue Router, Vite for build)  
**Storage**: NEEDS CLARIFICATION - In-memory for MVP, Redis for session management if scaling required  
**Testing**: Backend: Go testing package + NEEDS CLARIFICATION on assertion library (testify?); Frontend: Vitest + Vue Test Utils  
**Target Platform**: Backend: Linux server (Docker container); Frontend: Modern browsers (Chrome, Firefox, Safari, Edge last 2 versions)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: 300 concurrent players, WebSocket latency <100ms, API response <50ms, LCP <2.5s, FID <100ms, CLS <0.1  
**Constraints**: Offline mode NOT required, single-region deployment initially, no authentication system in MVP  
**Scale/Scope**: 100 concurrent game rooms, 300 simultaneous players, single-page application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: The constitution file (`.specify/memory/constitution.md`) contains template placeholders. No specific project governance rules are defined yet. Proceeding with standard best practices:

| Principle | Status | Notes |
|-----------|--------|-------|
| Project Structure | ⚠️ REVIEW | Web app structure (frontend/backend) justified - matches spec requirements |
| Testing | ⚠️ REVIEW | TDD approach recommended - test coverage target 70% per SC-015 |
| Documentation | ⚠️ REVIEW | API contracts and component documentation required |

## Project Structure

### Documentation (this feature)

```text
specs/001-go-vue-ios-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md       # Phase 1 output
├── quickstart.md       # Phase 1 output
├── contracts/          # Phase 1 output
└── tasks.md            # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── cmd/
│   └── server/
│       └── main.go           # Application entry point
├── internal/
│   ├── game/
│   │   ├── card.go           # Card data structure
│   │   ├── deck.go           # Deck management
│   │   ├── rules.go          # Game rules engine
│   │   ├── player.go         # Player types
│   │   ├── ai.go             # AI player logic
│   │   └── game.go           # Game controller
│   ├── server/
│   │   ├── http.go           # HTTP server & routes
│   │   ├── websocket.go      # WebSocket handling
│   │   └── room.go           # Game room management
│   └── models/
│       └── types.go          # Shared types
├── pkg/
│   └── protocol/
│       └── messages.go       # WebSocket message types
└── tests/
    ├── game_test.go
    ├── rules_test.go
    └── integration_test.go

frontend/
├── src/
│   ├── main.ts               # Application entry
│   ├── App.vue               # Root component
│   ├── components/
│   │   ├── game/
│   │   │   ├── CardTable.vue
│   │   │   ├── PlayerHand.vue
│   │   │   ├── Card.vue
│   │   │   └── GameControls.vue
│   │   ├── ui/
│   │   │   ├── Button.vue
│   │   │   ├── Modal.vue
│   │   │   └── Navigation.vue
│   │   └── layout/
│   │       └── GameLayout.vue
│   ├── composables/
│   │   ├── useGame.ts
│   │   ├── useWebSocket.ts
│   │   └── useSound.ts
│   ├── stores/
│   │   ├── game.ts           # Pinia game store
│   │   ├── player.ts         # Pinia player store
│   │   └── ui.ts             # Pinia UI store
│   ├── services/
│   │   ├── api.ts            # HTTP API client
│   │   └── websocket.ts       # WebSocket client
│   ├── styles/
│   │   ├── ios-design.css    # iOS design system
│   │   ├── responsive.css    # Fluid layouts
│   │   └── dark-mode.css     # Dark mode theme
│   └── assets/
│       ├── sounds/           # Audio files
│       └── images/           # Card images
├── public/
│   └── favicon.ico
├── tests/
│   ├── components/
│   └── composables/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json

shared/
└── types/
    └── game.ts               # Shared TypeScript types
```

**Structure Decision**: Web application structure with separate `backend/` (Go) and `frontend/` (Vue.js) directories. This separation allows independent development, testing, and deployment while maintaining clear boundaries between concerns. A `shared/` directory contains TypeScript types that can be used for API contract documentation.

## Complexity Tracking

> No constitution violations requiring justification at this stage. The dual-project structure is necessary for the Go backend + Vue frontend architecture specified in requirements.

## Phase 0: Research Tasks

### NEEDS CLARIFICATION Items to Research

1. **Go Web Framework Selection** - Evaluate Gin, Echo, Fiber for HTTP routing
2. **Go WebSocket Library Selection** - Evaluate gorilla/websocket, melody, nhooyr/websocket
3. **Vue 3 State Management** - Confirm Pinia vs Vuex for this project
4. **Vue 3 Build Tool** - Confirm Vite configuration for Vue 3 + TypeScript
5. **Go Testing Approach** - Standard library vs testify assertion library
6. **Session Management** - In-memory vs Redis for game room state
7. **iOS Design System Implementation** - CSS framework vs custom implementation
8. **Dark Mode Strategy** - CSS custom properties approach
9. **Container Queries Support** - Browser support and fallback strategy