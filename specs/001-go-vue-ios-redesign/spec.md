# Feature Specification: Go Backend, Vue Frontend, and iOS-Style UI Redesign for Doudizhu Game

**Feature Branch**: `001-go-vue-ios-redesign`  
**Created**: 2026-03-01  
**Status**: Draft  
**Input**: User description: "将这个项目，改为使用golang作为后端，然后vue作为前端，并实现一个ios系统风格的ui设计，做到25年标准的自适应水平"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play Doudizhu Game with Modern iOS-Style Interface (Priority: P1)

As a player, I want to play the Doudizhu card game using a modern iOS-style interface that adapts perfectly to my device, so I can enjoy a familiar, premium gaming experience on any screen size.

**Why this priority**: This is the core functionality - the game must work flawlessly with the new architecture while providing an enhanced user experience. Without this, the project has no value.

**Independent Test**: Can be fully tested by launching the application, starting a new game, playing through a complete round (dealing, bidding, playing cards, and determining winner), and verifying the iOS-style UI renders correctly on different device sizes.

**Acceptance Scenarios**:

1. **Given** a player opens the application on any device, **When** the game loads, **Then** the iOS-style interface displays with proper spacing, typography, and visual hierarchy that adapts to the screen size
2. **Given** a player starts a new game, **When** cards are dealt, **Then** cards animate smoothly with iOS-style transitions and are clearly visible on all supported device sizes
3. **Given** a player is playing the game, **When** they interact with UI elements (buttons, cards, menus), **Then** the interface responds with iOS-standard haptic feedback animations and visual states
4. **Given** a game is in progress, **When** the player resizes the browser window or rotates a mobile device, **Then** the UI automatically adapts layout and card sizing without breaking the game state

---

### User Story 2 - Real-time Multiplayer with Stable Connection (Priority: P2)

As a player, I want to play against other players online with minimal latency and stable connections, so I can enjoy competitive multiplayer gaming without interruptions.

**Why this priority**: Multiplayer is a key feature of the current implementation. The Go backend must maintain or improve the real-time communication capabilities while ensuring stability.

**Independent Test**: Can be tested by having multiple players connect to the server, start a game, and complete a full round while verifying all game state synchronizes correctly and latency remains acceptable.

**Acceptance Scenarios**:

1. **Given** multiple players connect to the game server, **When** they join a game room, **Then** all players see the same game state within 100ms of any action
2. **Given** players are in an active game, **When** a player plays a card, **Then** all other players see the action within 200ms
3. **Given** a player temporarily loses connection, **When** they reconnect within 30 seconds, **Then** they can resume the game with no state loss
4. **Given** a player disconnects permanently, **When** the system detects the disconnection, **Then** the game handles the situation gracefully with an AI replacement or game cancellation

---

### User Story 3 - Responsive Design Across All Devices (Priority: P3)

As a player using different devices (desktop, tablet, mobile phone), I want the game interface to automatically adjust to provide the optimal experience for my screen size, so I can play comfortably regardless of device.

**Why this priority**: While important, the core game functionality must work first. Responsive design ensures broader accessibility once the game is functional.

**Independent Test**: Can be tested by opening the application on various viewport sizes (mobile: 320px-767px, tablet: 768px-1023px, desktop: 1024px+) and verifying proper layout, touch targets, and readability.

**Acceptance Scenarios**:

1. **Given** a player accesses the game on a mobile phone, **When** the interface loads, **Then** cards, buttons, and text are sized appropriately for touch interaction with minimum 44px touch targets
2. **Given** a player accesses the game on a tablet, **When** in landscape orientation, **Then** the layout uses the additional horizontal space to show more game information simultaneously
3. **Given** a player accesses the game on a desktop, **When** the window is maximized, **Then** the interface expands to use screen real estate efficiently while maintaining iOS design principles
4. **Given** a player rotates their mobile device, **When** orientation changes, **Then** the UI reflows smoothly without requiring a page reload

---

### User Story 4 - Authentic iOS Visual Design (Priority: P4)

As a player familiar with iOS devices, I want the game to follow iOS Human Interface Guidelines, so the interface feels natural and intuitive.

**Why this priority**: Visual polish enhances user experience but is not critical for core functionality. Can be refined iteratively after the game works.

**Independent Test**: Can be tested by reviewing the UI against iOS Human Interface Guidelines for typography, spacing, colors, animations, and interaction patterns.

**Acceptance Scenarios**:

1. **Given** the game interface is displayed, **When** a player views any screen, **Then** it uses iOS-standard system fonts (San Francisco or equivalent), appropriate font weights, and proper text hierarchy
2. **Given** a player interacts with buttons, **When** pressing a button, **Then** it shows iOS-standard pressed states with appropriate opacity changes and scale transforms
3. **Given** the game displays cards and UI elements, **When** rendered, **Then** proper iOS-style shadows, corner radii, and blur effects are applied consistently
4. **Given** a player navigates between screens, **When** transitions occur, **Then** they use iOS-standard push/pop or modal presentation animations

---

### Edge Cases

- What happens when a player's device screen is extremely small (width < 320px)? The interface should gracefully degrade with horizontal scrolling or simplified layout
- How does the system handle slow network connections (latency > 500ms)? The game should show loading indicators and queue actions locally while synchronizing
- What happens when a player tries to join a full game room? The system should show a friendly message and offer alternatives (join another room, create new room, wait in queue)
- How does the system handle browser tab switching on mobile? Game state should persist and reconnect seamlessly when returning
- What happens when browser window is resized to unusual aspect ratios (e.g., ultrawide)? The layout should maintain readability with maximum content width constraints
- How does the game handle touch versus mouse input? Both should work seamlessly with appropriate interaction feedback for each input type

## Requirements *(mandatory)*

### Functional Requirements

#### Game Core Functionality
- **FR-001**: System MUST maintain all existing game rules (dealing, bidding, playing all card types including single, pair, triple, straight, flush, airplane, bomb, rocket)
- **FR-002**: System MUST support single-player mode with AI opponents that play according to existing AI logic
- **FR-003**: System MUST support multiplayer mode with real-time synchronization between connected players
- **FR-004**: System MUST preserve all current game features including scoring system, spring detection, and倍数 calculation
- **FR-005**: System MUST handle player disconnection and reconnection during multiplayer games

#### Backend Architecture (Go)
- **FR-006**: System MUST provide a Go-based backend server that handles game logic, player connections, and game state management
- **FR-007**: System MUST support WebSocket connections for real-time multiplayer communication
- **FR-008**: System MUST provide RESTful APIs for game room management, player authentication, and game history
- **FR-009**: System MUST maintain backward compatibility with existing game protocol formats where feasible
- **FR-010**: System MUST handle at least 100 concurrent game rooms with 300 simultaneous players

#### Frontend Architecture (Vue)
- **FR-011**: System MUST provide a Vue.js 3 frontend application with component-based architecture
- **FR-012**: System MUST use reactive state management for game state synchronization
- **FR-013**: System MUST implement all existing UI interactions including card selection, playing, and game flow controls
- **FR-014**: System MUST support keyboard shortcuts currently implemented (Space, P, H, 1/2/3, 0)
- **FR-015**: System MUST preserve existing sound effects and background music functionality

#### iOS-Style UI Design
- **FR-016**: System MUST implement iOS Human Interface Guidelines for visual design including typography, spacing, and interaction patterns
- **FR-017**: System MUST use iOS-standard animations and transitions (spring animations, fade transitions, blur effects)
- **FR-018**: System MUST provide iOS-native visual feedback for all interactive elements (pressed states, hover effects, disabled states)
- **FR-019**: System MUST use appropriate iOS-style navigation patterns (tab bars, navigation bars, modals)

#### Responsive Design (2025 Standards)
- **FR-020**: System MUST implement fluid typography that scales with viewport size using clamp() CSS functions
- **FR-021**: System MUST use CSS Grid and Flexbox for layout with container queries where supported
- **FR-022**: System MUST provide appropriate touch targets (minimum 44x44px) on touch devices
- **FR-023**: System MUST support dark mode following user system preferences with proper contrast ratios
- **FR-024**: System MUST optimize for Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- **FR-025**: System MUST support both portrait and landscape orientations on mobile and tablet devices
- **FR-026**: System MUST implement lazy loading for assets and code splitting for performance

### Key Entities

- **Game**: Represents a single Doudizhu game session with deck, players, current state, scores, and game history
- **Player**: Represents a human or AI player with hand cards, role (landlord/peasant), connection status, and game statistics
- **Card**: Represents a playing card with suit, rank, weight, and visual representation
- **GameRoom**: Represents a multiplayer game room with capacity, players list, game state, and room settings
- **Move**: Represents a player's action (play cards, pass, bid) with cards involved and timestamp
- **User**: Represents a registered player account with authentication credentials, game history, and preferences

## Success Criteria *(mandatory)*

### Measurable Outcomes

#### Functionality
- **SC-001**: Players can complete a full game round (dealing through win/loss) with zero critical errors
- **SC-002**: All existing game rules and card combinations work identically to current implementation
- **SC-003**: Multiplayer games synchronize game state across all players within 200ms of any action

#### Performance
- **SC-004**: Initial page load completes in under 2 seconds on 4G mobile connection
- **SC-005**: Time to interactive is under 3 seconds on mid-range mobile devices
- **SC-006**: Server handles 300 concurrent players with CPU usage under 70% on standard cloud instance
- **SC-007**: WebSocket message latency is under 100ms in same-region deployments

#### User Experience
- **SC-008**: Interface is fully usable on viewport widths from 320px to 2560px without horizontal scrolling
- **SC-009**: 90% of users can start and complete their first game without consulting documentation
- **SC-010**: All interactive elements meet WCAG 2.1 Level AA accessibility standards
- **SC-011**: Touch targets are appropriately sized (minimum 44x44px) and spaced on mobile devices
- **SC-012**: Visual design receives positive feedback in user testing (target: 80%+ satisfaction rate)

#### Code Quality
- **SC-013**: Frontend application achieves Lighthouse performance score of 85+ on mobile
- **SC-014**: Backend API response time is under 50ms for non-computationally-intensive requests
- **SC-015**: Test coverage is at least 70% for critical game logic and UI components
- **SC-016**: Application builds and deploys successfully with zero errors in production build

## Assumptions

- The current Node.js server uses WebSocket (ws library) for real-time communication, which will be replicated in Go
- Game rules and AI logic will remain unchanged during migration
- The existing asset files (sounds, images) can be reused in the Vue frontend
- Players will continue to use the same game controls (mouse/touch + keyboard shortcuts)
- Dark mode support is expected as part of 2025 UI standards
- The application will be deployed on cloud infrastructure (no specific platform requirements)
- No need for backward compatibility with the old Node.js server (fresh deployment)
- Single-page application architecture is acceptable for the Vue frontend
- Minimum supported browsers are modern evergreen browsers (Chrome, Firefox, Safari, Edge last 2 versions)
- Mobile-first responsive design approach will be used