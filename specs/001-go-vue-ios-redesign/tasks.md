# Tasks: Go Backend, Vue Frontend, and iOS-Style UI Redesign for Doudizhu Game

**Input**: Design documents from `/specs/001-go-vue-ios-redesign/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Tests**: Test tasks included for core game logic (70% coverage target per SC-015).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/`, `frontend/`, `shared/`
- Backend: Go with standard layout (cmd/, internal/, pkg/)
- Frontend: Vue 3 + TypeScript with Vite

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for both backend and frontend

- [ ] T001 Create project directory structure per plan.md (backend/, frontend/, shared/)
- [ ] T002 Initialize Go module in backend/go.mod with Go 1.24
- [ ] T003 [P] Initialize Vue 3 + TypeScript project in frontend/ with Vite
- [ ] T004 [P] Configure backend dependencies (Gin, gorilla/websocket, testify, zerolog, go-redis, sqlc) in backend/go.mod
- [ ] T005 [P] Configure frontend dependencies (Vue 3, Pinia, Vue Router, TypeScript, Vitest) in frontend/package.json
- [ ] T006 [P] Create backend configuration file at backend/configs/config.yaml
- [ ] T007 [P] Create shared TypeScript types at shared/types/game.ts
- [ ] T008 [P] Setup backend Makefile with build, test, migrate, generate targets
- [ ] T009 [P] Configure frontend vite.config.ts with Vue 3 + TypeScript settings
- [ ] T010 [P] Configure frontend tsconfig.json with strict TypeScript settings
- [ ] T011 [P] Create backend Dockerfile at backend/Dockerfile
- [ ] T012 [P] Create docker-compose.yml for local development (backend, frontend, redis)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [ ] T013 Create backend entry point at backend/cmd/server/main.go
- [ ] T014 [P] Implement configuration loading with koanf in backend/internal/config/config.go
- [ ] T015 [P] Implement structured logging with zerolog in backend/internal/logger/logger.go
- [ ] T016 [P] Create HTTP server with Gin router in backend/internal/server/http.go
- [ ] T017 [P] Create WebSocket hub structure in backend/internal/server/hub.go
- [ ] T018 [P] Define WebSocket message types in backend/pkg/protocol/messages.go
- [ ] T019 Create Redis client wrapper in backend/internal/store/redis/client.go
- [ ] T020 [P] Create SQLite database connection in backend/internal/store/sqlite/db.go
- [ ] T021 [P] Create initial database schema migration at backend/migrations/000001_init_schema.up.sql
- [ ] T022 [P] Create down migration at backend/migrations/000001_init_schema.down.sql
- [ ] T023 Configure sqlc for type-safe queries in backend/sqlc.yaml
- [ ] T024 [P] Create SQL queries file at backend/sql/queries.sql
- [ ] T025 Generate sqlc code (models, queries) for SQLite access
- [ ] T026 Implement migration runner in backend/internal/migrate/migrate.go
- [ ] T027 [P] Create health check endpoint in backend/internal/api/health.go

### Frontend Foundation

- [ ] T028 Create frontend entry point at frontend/src/main.ts
- [ ] T029 [P] Create root App.vue component at frontend/src/App.vue
- [ ] T030 [P] Create Pinia store instance at frontend/src/stores/index.ts
- [ ] T031 [P] Create Vue Router instance at frontend/src/router/index.ts
- [ ] T032 [P] Create base CSS variables and iOS design tokens at frontend/src/styles/variables.css
- [ ] T033 [P] Create dark mode CSS at frontend/src/styles/dark-mode.css
- [ ] T034 [P] Create responsive design CSS with fluid typography at frontend/src/styles/responsive.css
- [ ] T035 [P] Create iOS-style button component at frontend/src/components/ui/Button.vue
- [ ] T036 [P] Create iOS-style modal component at frontend/src/components/ui/Modal.vue
- [ ] T037 [P] Create navigation bar component at frontend/src/components/ui/Navigation.vue
- [ ] T038 Create API service client at frontend/src/services/api.ts
- [ ] T039 [P] Create WebSocket service client at frontend/src/services/websocket.ts
- [ ] T040 [P] Create sound service at frontend/src/services/sound.ts
- [ ] T041 Copy existing sound assets from doudizhu/sounds/ to frontend/src/assets/sounds/
- [ ] T042 [P] Copy existing card images from doudizhu/images/ to frontend/src/assets/images/

### Shared Types

- [ ] T043 Define Card interface in shared/types/game.ts
- [ ] T044 [P] Define Player interface in shared/types/game.ts
- [ ] T045 [P] Define GameRoom interface in shared/types/game.ts
- [ ] T046 [P] Define Move interface in shared/types/game.ts
- [ ] T047 [P] Define WebSocket message interfaces in shared/types/game.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Play Doudizhu Game with Modern iOS-Style Interface (Priority: P1) 🎯 MVP

**Goal**: Core game functionality with iOS-style UI - players can start, play, and complete a full game round

**Independent Test**: Launch application, start new game, play through complete round (dealing, bidding, playing cards, determine winner), verify iOS-style UI renders on different sizes

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T048 [P] [US1] Unit tests for Card struct in backend/internal/game/card_test.go
- [ ] T049 [P] [US1] Unit tests for Deck in backend/internal/game/deck_test.go
- [ ] T050 [P] [US1] Unit tests for game rules in backend/internal/game/rules_test.go
- [ ] T051 [P] [US1] Unit tests for AI player in backend/internal/game/ai_test.go
- [ ] T052 [P] [US1] Frontend component tests for Card.vue in frontend/tests/components/Card.test.ts
- [ ] T053 [P] [US1] Frontend component tests for PlayerHand.vue in frontend/tests/components/PlayerHand.test.ts

### Backend Implementation for User Story 1

- [ ] T054 [P] [US1] Implement Card struct in backend/internal/game/card.go
- [ ] T055 [P] [US1] Implement Deck with shuffle and deal in backend/internal/game/deck.go
- [ ] T056 [US1] Implement game rules engine in backend/internal/game/rules.go (port from doudizhu/js/rules.js)
- [ ] T057 [US1] Implement AI player logic in backend/internal/game/ai.go (port from doudizhu/js/smart-ai-player.js)
- [ ] T058 [US1] Implement Player types in backend/internal/game/player.go
- [ ] T059 [US1] Implement Game controller in backend/internal/game/game.go
- [ ] T060 [US1] Implement game room manager in backend/internal/server/room.go
- [ ] T061 [US1] Implement WebSocket message handlers in backend/internal/server/websocket.go
- [ ] T062 [US1] Create REST API routes for game operations in backend/internal/api/game.go
- [ ] T063 [US1] Implement game state persistence in Redis at backend/internal/store/redis/game.go

### Frontend Implementation for User Story 1

- [ ] T064 [P] [US1] Create Pinia game store at frontend/src/stores/game.ts
- [ ] T065 [P] [US1] Create Pinia player store at frontend/src/stores/player.ts
- [ ] T066 [P] [US1] Create Pinia UI store at frontend/src/stores/ui.ts
- [ ] T067 [US1] Create useGame composable at frontend/src/composables/useGame.ts
- [ ] T068 [US1] Create useWebSocket composable at frontend/src/composables/useWebSocket.ts
- [ ] T069 [US1] Create useSound composable at frontend/src/composables/useSound.ts
- [ ] T070 [P] [US1] Create Card component at frontend/src/components/game/Card.vue
- [ ] T071 [P] [US1] Create PlayerHand component at frontend/src/components/game/PlayerHand.vue
- [ ] T072 [US1] Create CardTable component at frontend/src/components/game/CardTable.vue
- [ ] T073 [US1] Create GameControls component at frontend/src/components/game/GameControls.vue
- [ ] T074 [US1] Create GameLayout component at frontend/src/components/layout/GameLayout.vue
- [ ] T075 [US1] Create game page view at frontend/src/views/Game.vue
- [ ] T076 [US1] Add game route to router at frontend/src/router/index.ts
- [ ] T077 [US1] Implement card selection and play logic in frontend
- [ ] T078 [US1] Implement iOS-style card animations and transitions
- [ ] T079 [US1] Integrate sound effects with game actions

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - single player game works end-to-end

---

## Phase 4: User Story 2 - Real-time Multiplayer with Stable Connection (Priority: P2)

**Goal**: Multiple players can play together online with real-time synchronization

**Independent Test**: Multiple players connect, join room, complete full round, verify game state syncs within 200ms

### Tests for User Story 2

- [ ] T080 [P] [US2] Integration tests for WebSocket room management in backend/tests/integration/room_test.go
- [ ] T081 [P] [US2] Integration tests for game state sync in backend/tests/integration/sync_test.go
- [ ] T082 [P] [US2] Frontend tests for multiplayer room UI in frontend/tests/components/RoomList.test.ts

### Backend Implementation for User Story 2

- [ ] T083 [US2] Implement room creation and join logic in backend/internal/server/room.go
- [ ] T084 [US2] Implement player connection management in backend/internal/server/connection.go
- [ ] T085 [US2] Implement broadcast message system in backend/internal/server/broadcast.go
- [ ] T086 [US2] Implement reconnection logic with session recovery in backend/internal/server/reconnect.go
- [ ] T087 [US2] Implement player disconnection handling (AI replacement) in backend/internal/server/room.go
- [ ] T088 [US2] Create REST API routes for room management in backend/internal/api/room.go
- [ ] T089 [US2] Add latency monitoring to WebSocket messages

### Frontend Implementation for User Story 2

- [ ] T090 [P] [US2] Create Pinia room store at frontend/src/stores/room.ts
- [ ] T091 [US2] Create useRoom composable at frontend/src/composables/useRoom.ts
- [ ] T092 [US2] Create RoomList component at frontend/src/components/game/RoomList.vue
- [ ] T093 [US2] Create RoomLobby component at frontend/src/components/game/RoomLobby.vue
- [ ] T094 [US2] Create lobby page view at frontend/src/views/Lobby.vue
- [ ] T095 [US2] Add lobby route to router at frontend/src/router/index.ts
- [ ] T096 [US2] Implement room creation and joining UI flows
- [ ] T097 [US2] Implement connection status indicators
- [ ] T098 [US2] Implement reconnection UI (loading state, retry logic)
- [ ] T099 [US2] Add player presence indicators to game table

**Checkpoint**: User Stories 1 AND 2 should both work independently - multiplayer games work

---

## Phase 5: User Story 3 - Responsive Design Across All Devices (Priority: P3)

**Goal**: Game interface adapts optimally to all screen sizes (320px to 2560px)

**Independent Test**: Open on various viewports (mobile, tablet, desktop), verify proper layout, touch targets, readability

### Frontend Implementation for User Story 3

- [ ] T100 [P] [US3] Implement fluid typography scale in frontend/src/styles/responsive.css
- [ ] T101 [P] [US3] Add container queries for CardTable in frontend/src/components/game/CardTable.vue
- [ ] T102 [US3] Implement mobile-first card layout with touch targets (44px min)
- [ ] T103 [US3] Implement tablet landscape layout optimizations
- [ ] T104 [US3] Implement desktop layout with efficient screen usage
- [ ] T105 [US3] Add orientation change handling without page reload
- [ ] T106 [US3] Implement touch interaction feedback for mobile
- [ ] T107 [US3] Add horizontal scroll handling for very small screens (<320px)
- [ ] T108 [US3] Test and fix layout issues on ultrawide aspect ratios
- [ ] T109 [US3] Verify all interactive elements meet 44px touch target minimum

### Tests for User Story 3

- [ ] T110 [P] [US3] Visual regression tests for mobile layout in frontend/tests/visual/mobile.test.ts
- [ ] T111 [P] [US3] Visual regression tests for tablet layout in frontend/tests/visual/tablet.test.ts
- [ ] T112 [P] [US3] Visual regression tests for desktop layout in frontend/tests/visual/desktop.test.ts

**Checkpoint**: User Stories 1, 2, AND 3 should all work independently - game is fully responsive

---

## Phase 6: User Story 4 - Authentic iOS Visual Design (Priority: P4)

**Goal**: Interface follows iOS Human Interface Guidelines for native feel

**Independent Test**: Review UI against iOS HIG for typography, spacing, colors, animations, interactions

### Frontend Implementation for User Story 4

- [ ] T113 [P] [US4] Implement San Francisco font stack in frontend/src/styles/variables.css
- [ ] T114 [P] [US4] Add iOS-standard spacing (8pt grid) throughout components
- [ ] T115 [US4] Implement iOS color palette (system colors, semantic colors)
- [ ] T116 [US4] Add iOS-standard pressed states with opacity and scale transforms
- [ ] T117 [US4] Implement iOS-standard shadows and corner radii
- [ ] T118 [US4] Add blur backdrop effects for navigation bars
- [ ] T119 [US4] Implement iOS-standard spring animations (0.3-0.5s with ease-out)
- [ ] T120 [US4] Add iOS-style page transitions (push/pop animations)
- [ ] T121 [US4] Implement iOS-style modal presentations (slide up from bottom)
- [ ] T122 [US4] Add haptic feedback simulation for interactions
- [ ] T123 [US4] Implement iOS-style navigation bar with large titles
- [ ] T124 [US4] Create iOS-style tab bar component at frontend/src/components/ui/TabBar.vue

### Tests for User Story 4

- [ ] T125 [P] [US4] Accessibility tests for color contrast in frontend/tests/a11y/contrast.test.ts
- [ ] T126 [P] [US4] Animation performance tests in frontend/tests/performance/animation.test.ts

**Checkpoint**: All user stories should now be independently functional - complete iOS-style experience

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Performance Optimization

- [ ] T127 [P] Implement lazy loading for frontend routes
- [ ] T128 [P] Add code splitting for game components
- [ ] T129 Optimize WebSocket message payload sizes
- [ ] T130 [P] Add image optimization for card assets
- [ ] T131 Implement backend connection pooling for Redis

### Security & Error Handling

- [ ] T132 [P] Add input validation for all API endpoints
- [ ] T133 [P] Implement rate limiting on WebSocket connections
- [ ] T134 Add comprehensive error handling middleware in backend
- [ ] T135 [P] Add user-friendly error messages in frontend
- [ ] T136 Implement graceful shutdown for backend server

### Documentation & Deployment

- [ ] T137 [P] Create API documentation at backend/docs/api.md
- [ ] T138 [P] Create WebSocket protocol documentation at backend/docs/websocket.md
- [ ] T139 [P] Create frontend component documentation at frontend/docs/components.md
- [ ] T140 Create deployment guide at docs/deployment.md
- [ ] T141 [P] Add README.md for backend with setup instructions
- [ ] T142 [P] Add README.md for frontend with setup instructions

### Final Validation

- [ ] T143 Run quickstart.md validation scenarios
- [ ] T144 Verify all Core Web Vitals targets (LCP <2.5s, FID <100ms, CLS <0.1)
- [ ] T145 Run full test suite and verify 70% coverage
- [ ] T146 Performance test with 300 concurrent players
- [ ] T147 Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 can start after Foundational
  - US2 depends on US1 backend game logic complete
  - US3 can start after US1 frontend complete (parallel with US2)
  - US4 can start after US3 responsive base complete
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
US1 (P1) ──┬──> US2 (P2) ──┐
           │               │
           └──> US3 (P3) ──┴──> US4 (P4)
```

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Requires US1 backend game logic (T054-T063)
- **User Story 3 (P3)**: Requires US1 frontend components (T064-T079)
- **User Story 4 (P4)**: Requires US3 responsive base (T100-T112)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T012)
- Backend and frontend foundational tasks can run in parallel (T013-T027 || T028-T042)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- US2 backend and US3 frontend can run in parallel after US1

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit tests for Card struct in backend/internal/game/card_test.go"
Task: "Unit tests for Deck in backend/internal/game/deck_test.go"
Task: "Unit tests for game rules in backend/internal/game/rules_test.go"
Task: "Unit tests for AI player in backend/internal/game/ai_test.go"
Task: "Frontend component tests for Card.vue in frontend/tests/components/Card.test.ts"
Task: "Frontend component tests for PlayerHand.vue in frontend/tests/components/PlayerHand.test.ts"

# Launch all models for User Story 1 together:
Task: "Implement Card struct in backend/internal/game/card.go"
Task: "Implement Deck with shuffle and deal in backend/internal/game/deck.go"

# Launch all stores for User Story 1 together:
Task: "Create Pinia game store at frontend/src/stores/game.ts"
Task: "Create Pinia player store at frontend/src/stores/player.ts"
Task: "Create Pinia UI store at frontend/src/stores/ui.ts"
```

---

## Parallel Example: Foundational Phase

```bash
# Backend tasks that can run in parallel:
Task: "Implement configuration loading in backend/internal/config/config.go"
Task: "Implement structured logging in backend/internal/logger/logger.go"
Task: "Create HTTP server with Gin router in backend/internal/server/http.go"
Task: "Create WebSocket hub structure in backend/internal/server/hub.go"
Task: "Define WebSocket message types in backend/pkg/protocol/messages.go"

# Frontend tasks that can run in parallel:
Task: "Create root App.vue component at frontend/src/App.vue"
Task: "Create Pinia store instance at frontend/src/stores/index.ts"
Task: "Create Vue Router instance at frontend/src/router/index.ts"
Task: "Create base CSS variables at frontend/src/styles/variables.css"
Task: "Create iOS-style button component at frontend/src/components/ui/Button.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T012)
2. Complete Phase 2: Foundational (T013-T047) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T048-T079)
4. **STOP and VALIDATE**: Test single-player game independently
5. Deploy/demo if ready - this is a working game!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! Single-player game works)
3. Add User Story 2 → Test independently → Deploy/Demo (Multiplayer works)
4. Add User Story 3 → Test independently → Deploy/Demo (Fully responsive)
5. Add User Story 4 → Test independently → Deploy/Demo (Polished iOS experience)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T047)
2. Once Foundational is done:
   - Developer A: User Story 1 backend (T054-T063)
   - Developer B: User Story 1 frontend (T064-T079)
   - Developer C: User Story 1 tests in parallel (T048-T053)
3. After US1:
   - Developer A: User Story 2 backend (T083-T089)
   - Developer B: User Story 3 frontend (T100-T112)
   - Developer C: User Story 2 frontend + tests (T090-T099, T080-T082)
4. Finally: User Story 4 (T113-T126)

---

## Summary

| Phase | Tasks | Parallelizable | Story |
|-------|-------|----------------|-------|
| Phase 1: Setup | T001-T012 (12) | 10 | - |
| Phase 2: Foundational | T013-T047 (35) | 28 | - |
| Phase 3: US1 (P1) 🎯 MVP | T048-T079 (32) | 13 | US1 |
| Phase 4: US2 (P2) | T080-T099 (20) | 4 | US2 |
| Phase 5: US3 (P3) | T100-T112 (13) | 4 | US3 |
| Phase 6: US4 (P4) | T113-T126 (14) | 3 | US4 |
| Phase 7: Polish | T127-T147 (21) | 11 | - |
| **Total** | **147 tasks** | **73 parallelizable** | - |

### MVP Scope (Recommended)

**MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1 only)**

- Tasks: T001-T079 (79 tasks)
- Deliverable: Fully functional single-player Doudizhu game with iOS-style UI
- Can be deployed and demonstrated independently

### Independent Test Criteria

| Story | Test Criteria |
|-------|---------------|
| US1 | Launch app, start game, play complete round, verify iOS UI renders correctly |
| US2 | Multiple players connect, join room, complete round, verify sync <200ms |
| US3 | Open on mobile/tablet/desktop, verify proper layout and touch targets |
| US4 | Review UI against iOS HIG for typography, spacing, animations |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence