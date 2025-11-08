# Project Synapse - System Architecture

## Executive Summary
Project Synapse is an intelligent knowledge management system that captures, organizes, and retrieves information using AI-powered understanding. Built with enterprise-grade architecture, security, and scalability.

## Technology Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with middleware architecture
- **Database**: PostgreSQL 16+ with full-text search
- **ORM**: Prisma (type-safe, migration support)
- **Authentication**: JWT with refresh tokens, bcrypt for hashing
- **File Storage**: Local storage with option to extend to S3
- **API Documentation**: OpenAPI/Swagger
- **Validation**: Zod schemas

### Frontend (Dashboard)
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) + Custom components
- **State Management**: React Query (TanStack Query) + Context API
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Styling**: Emotion + MUI theming

### Chrome Extension
- **Manifest**: V3 (latest standard)
- **Tech**: TypeScript, React for popup
- **APIs**: Chrome Storage, Tabs, ContextMenus, Runtime
- **Content Scripts**: Intelligent page analysis

### AI/ML Integration
- **Primary**: Google Gemini API (gemini-pro, gemini-pro-vision)
- **Use Cases**:
  - Natural language search
  - Content classification
  - Metadata extraction
  - OCR for handwritten notes
  - Semantic understanding

## System Architecture

### High-Level Architecture
```
┌─────────────────┐
│  Chrome         │
│  Extension      │──────┐
└─────────────────┘      │
                         │
┌─────────────────┐      │     ┌──────────────────┐
│  Web Dashboard  │──────┼────▶│   API Gateway    │
└─────────────────┘      │     │   (Express)      │
                         │     └────────┬─────────┘
┌─────────────────┐      │              │
│  Mobile (PWA)   │──────┘              │
└─────────────────┘                     │
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
              ┌─────▼──────┐    ┌──────▼───────┐   ┌──────▼────────┐
              │   Auth      │    │   Content    │   │   Search      │
              │   Service   │    │   Service    │   │   Service     │
              └─────┬──────┘    └──────┬───────┘   └──────┬────────┘
                    │                  │                   │
                    └──────────────────┼───────────────────┘
                                       │
                         ┌─────────────┼──────────────┐
                         │             │              │
                   ┌─────▼─────┐ ┌────▼────┐  ┌──────▼──────┐
                   │ PostgreSQL│ │  Gemini │  │   Storage   │
                   │  Database │ │   API   │  │   (Files)   │
                   └───────────┘ └─────────┘  └─────────────┘
```

## Core Features

### 1. Content Capture System
**Content Types Supported:**
- URLs/Bookmarks (with metadata extraction)
- Screenshots (with OCR)
- Text selections
- Product listings (price tracking)
- YouTube videos (embed support)
- Research papers (PDF parsing)
- Handwritten notes (OCR + understanding)
- Code snippets (syntax highlighting)
- Social media posts
- To-do lists (structured)

**Capture Methods:**
- Browser extension (right-click menu, toolbar button, keyboard shortcut)
- Web clipper
- Screenshot tool with annotation
- Voice notes (bonus feature)
- Email forwarding
- API integration

### 2. Intelligent Organization
**Auto-Classification:**
- Content type detection using AI
- Smart tagging
- Category assignment
- Priority scoring
- Related content linking

**Metadata Extraction:**
- Title, description, author
- Timestamps, location
- Price (for products)
- Sentiment analysis
- Key entities (people, places, concepts)

### 3. Visual Dashboard
**Content Rendering:**
- Product cards (image, price, specs)
- Article previews (hero image, excerpt)
- Video embeds (YouTube, Vimeo)
- Note cards (markdown support)
- To-do lists (interactive checkboxes)
- Image galleries
- Code blocks (syntax highlighted)

**Views:**
- Grid view (Pinterest-style)
- List view (compact)
- Timeline view (chronological)
- Mind map view (knowledge graph)
- Calendar view (time-based)

### 4. AI-Powered Search
**Natural Language Queries:**
- "Find articles about AI from last month"
- "Show me black shoes under $300"
- "What did I save about React hooks?"
- "My todo list from yesterday"

**Search Features:**
- Semantic search (meaning, not just keywords)
- Filters (date, type, tags, source)
- Fuzzy matching
- Multi-language support
- Voice search

## X-Factor Features (Competitive Advantages)

### 1. **Smart Collections**
- AI automatically groups related content
- Suggests connections between ideas
- Creates knowledge graphs
- Identifies trends in saved content

### 2. **Time Machine**
- Visual timeline of your knowledge journey
- "On this day" reminders
- Evolution tracking of ideas

### 3. **Collaborative Spaces**
- Share collections with teams
- Real-time collaboration
- Permission management
- Comments and annotations

### 4. **Smart Reminders**
- "You saved this product, it's now 20% off"
- "You wanted to read this article, have 10 minutes?"
- Price drop alerts for products

### 5. **Knowledge Assistant (Chat)**
- Chat with your saved content
- "Summarize all articles about ML I saved"
- "Create a study plan from my research"
- Generate insights and reports

### 6. **OCR + Handwriting Recognition**
- Extract text from images
- Understand handwritten notes
- Convert sketches to digital

### 7. **Browser History Integration**
- Suggest saving frequently visited pages
- Rediscover forgotten bookmarks
- Smart duplicate detection

### 8. **Export & Backup**
- Export to Notion, Obsidian, Markdown
- Scheduled backups
- GDPR-compliant data export

### 9. **Dark/Light Mode + Themes**
- Customizable UI themes
- Accessibility features
- Dyslexia-friendly fonts

### 10. **Offline Mode**
- PWA capabilities
- Local-first architecture
- Sync when online

## Security & Compliance

### Authentication & Authorization
- JWT with refresh token rotation
- Password hashing (bcrypt, cost factor 12)
- Rate limiting (express-rate-limit)
- CORS configuration
- Helmet.js for security headers

### Data Protection
- AES-256 encryption for sensitive data
- HTTPS only (TLS 1.3)
- Input sanitization (prevent XSS, SQL injection)
- Content Security Policy (CSP)
- CSRF protection

### Privacy
- GDPR compliant
- Data minimization
- Right to be forgotten
- Privacy by design
- No third-party tracking

### API Security
- API key authentication for extension
- Request signing
- Payload validation (Zod schemas)
- Error masking (don't leak internals)

## SOLID Principles Implementation

### Single Responsibility Principle
- Each service handles one domain (Auth, Content, Search)
- Controllers handle HTTP, Services handle business logic
- Repositories handle data access

### Open/Closed Principle
- Plugin architecture for content extractors
- Strategy pattern for different content types
- Middleware pipeline for extensibility

### Liskov Substitution Principle
- Interface-based design
- Content type polymorphism
- Storage abstraction (local/S3 interchangeable)

### Interface Segregation Principle
- Focused interfaces for each service
- No fat interfaces
- Client-specific contracts

### Dependency Inversion Principle
- Dependency injection
- Configuration externalization
- Abstract interfaces, concrete implementations

## Design Patterns Used

1. **Repository Pattern** - Data access abstraction
2. **Service Layer Pattern** - Business logic separation
3. **Factory Pattern** - Content extractor creation
4. **Strategy Pattern** - Different search algorithms
5. **Observer Pattern** - Real-time updates
6. **Middleware Pattern** - Request processing pipeline
7. **Singleton Pattern** - Database connection
8. **Decorator Pattern** - AI enhancement of content

## Database Schema

### Users
- id, email, password_hash, created_at, updated_at
- preferences (JSON)
- subscription_tier

### Content
- id, user_id, type, title, description
- url, content_text, metadata (JSONB)
- tags[], category, priority
- thumbnail_url, file_path
- created_at, updated_at, accessed_at
- embeddings (vector for semantic search)

### Collections
- id, user_id, name, description
- color, icon, visibility
- created_at, updated_at

### Tags
- id, name, color, user_id
- usage_count

### Shares
- id, content_id, shared_by, shared_with
- permissions, expires_at

## Performance Optimizations

1. **Database Indexing**
   - B-tree indexes on frequently queried fields
   - Full-text search indexes
   - Vector indexes for embeddings (pgvector)

2. **Caching Strategy**
   - Redis for session management
   - In-memory cache for AI responses
   - Browser cache for static assets

3. **Lazy Loading**
   - Infinite scroll for content
   - Image lazy loading
   - Code splitting

4. **CDN Integration**
   - Static asset delivery
   - Image optimization (WebP, AVIF)

5. **Rate Limiting**
   - API rate limits
   - Gemini API quota management
   - Throttling expensive operations

## Deployment Strategy

### Development
- Docker Compose for local development
- Hot reload for frontend and backend
- PostgreSQL in container

### Production
- Docker containers
- Nginx reverse proxy
- SSL/TLS certificates (Let's Encrypt)
- PM2 for Node.js process management
- Database migrations with Prisma
- Environment-based configuration

## Testing Strategy

1. **Unit Tests** - Jest
2. **Integration Tests** - Supertest
3. **E2E Tests** - Playwright
4. **Load Tests** - Artillery
5. **Security Tests** - OWASP ZAP

## Monitoring & Logging

- Winston for structured logging
- Health check endpoints
- Error tracking (Sentry integration ready)
- Performance metrics
- User analytics (privacy-preserving)

## Future Enhancements

1. Mobile apps (React Native)
2. Desktop apps (Electron)
3. API for third-party integrations
4. Zapier/Make integration
5. Browser extension for Firefox, Safari
6. Team workspaces
7. Advanced AI features (summarization, Q&A)
8. Multi-modal search (search by image)
9. Blockchain for content verification
10. AR/VR knowledge spaces

## Development Timeline (Prototype)

- **Day 1-2**: Backend setup, database, authentication
- **Day 3-4**: Content capture API, file handling
- **Day 5-6**: Frontend dashboard, UI components
- **Day 7-8**: Chrome extension development
- **Day 9-10**: AI integration, search functionality
- **Day 11-12**: X-factor features, polish, testing
- **Day 13-14**: Documentation, deployment, presentation

## Success Metrics

1. Content capture time < 2 seconds
2. Search response time < 500ms
3. 99.9% uptime
4. Zero security vulnerabilities
5. Mobile-responsive (score 95+ on Lighthouse)
6. Accessibility (WCAG 2.1 AA compliant)
7. Code coverage > 80%

---

**This architecture ensures Project Synapse is not just a prototype, but a production-ready, scalable, secure, and intelligent system that stands out from the competition.**
