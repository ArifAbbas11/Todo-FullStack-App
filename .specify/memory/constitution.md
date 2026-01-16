<!--
Sync Impact Report:
- Version: NEW → 1.0.0 (Initial constitution for Todo Full-Stack Web Application)
- Rationale: First constitution establishing core principles for Phase II hackathon project
- Modified Principles: N/A (new constitution)
- Added Sections: All sections (Core Principles, Technology Stack, Development Workflow, Governance)
- Removed Sections: N/A
- Templates Status:
  ✅ spec-template.md - Reviewed, compatible with constitution requirements
  ✅ tasks-template.md - Reviewed, compatible with user story and testing approach
  ✅ plan-template.md - Reviewed, constitution check section aligns with principles
- Follow-up TODOs: None
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Feature Accuracy

All 5 basic task features MUST be implemented exactly as specified. Every feature requirement from the specification must be delivered with full functionality. No partial implementations or feature shortcuts are acceptable.

**Rationale**: This is a hackathon evaluation project where completeness and correctness are primary success criteria. Judges will assess based on full feature delivery.

### II. API Contract Clarity

All API endpoints MUST adhere to REST principles with clear, predictable contracts. Endpoints MUST return standard HTTP status codes (200, 201, 400, 401, 404, 500) with consistent JSON response structures. API documentation MUST be complete and accurate.

**Rationale**: Clear contracts enable independent frontend/backend development and ensure reliable integration. Predictable APIs reduce debugging time and improve maintainability.

### III. Security-First Development

JWT-based authentication MUST be implemented with proper token verification on every protected endpoint. User data isolation MUST be enforced at the database query level. Secrets MUST never be hardcoded; all sensitive configuration MUST use environment variables.

**Security Requirements**:
- JWT tokens verified using shared secret on every protected request
- User ID from token MUST match user ID in request URL/body
- Invalid/expired tokens MUST return 401 Unauthorized
- Database queries MUST filter by authenticated user ID
- HTTPS required in production

**Rationale**: Multi-user applications require strict security boundaries. Data leaks between users are unacceptable and would fail security review.

### IV. Spec-Driven Reproducibility

Development MUST follow the Spec-Kit Plus workflow: Write spec → Generate plan → Break into tasks → Implement via Claude Code. No manual coding is permitted. All implementation decisions MUST be traceable to specification documents.

**Workflow Steps**:
1. `/sp.specify` - Create detailed feature specification
2. `/sp.plan` - Generate architectural plan with research
3. `/sp.tasks` - Break down into testable, prioritized tasks
4. Implement using specialized agents (auth-security, nextjs-ui-builder, neon-db-manager, fastapi-backend-dev)
5. Document with PHRs and ADRs

**Rationale**: Reproducibility is a core evaluation criterion. The development process itself is being judged, not just the final product.

### V. Multi-User Data Isolation

Every database query that retrieves or modifies user data MUST include a WHERE clause filtering by the authenticated user's ID. No endpoint may return or modify data belonging to other users. User ownership MUST be validated before any data operation.

**Enforcement Rules**:
- All task queries: `WHERE user_id = {authenticated_user_id}`
- Create operations: Automatically set `user_id` from JWT token
- Update/Delete operations: Verify ownership before execution
- List operations: Filter to current user's data only

**Rationale**: Data isolation is fundamental to multi-user applications. Cross-user data access is a critical security vulnerability.

### VI. Responsive Design

Frontend interfaces MUST be responsive and functional across desktop, tablet, and mobile devices. Layouts MUST adapt gracefully to different screen sizes. User interactions MUST be intuitive and accessible.

**Requirements**:
- Mobile-first CSS approach
- Breakpoints for tablet (768px) and desktop (1024px)
- Touch-friendly interactive elements (min 44px tap targets)
- Readable typography at all sizes
- No horizontal scrolling on mobile

**Rationale**: Modern web applications must work on all devices. Poor mobile experience would fail user acceptance testing.

## Technology Stack Constraints

The following technology stack is MANDATORY and MUST NOT be substituted:

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 16+ |
| Backend | Python FastAPI | Latest stable |
| ORM | SQLModel | Latest stable |
| Database | Neon Serverless PostgreSQL | Latest |
| Authentication | Better Auth (JWT tokens) | Latest |
| Development | Claude Code + Spec-Kit Plus | Current |

**Additional Constraints**:
- Backend and Frontend MUST be separate projects with independent deployment capability
- Environment variables MUST be used for all configuration (database URLs, JWT secrets, API endpoints)
- Database migrations MUST be version-controlled and reversible
- API MUST be RESTful with proper HTTP methods (GET, POST, PUT, DELETE)
- CORS MUST be configured to allow frontend-backend communication

**Rationale**: Technology stack is specified by hackathon requirements and cannot be changed. Consistency ensures fair evaluation across all submissions.

## Development Workflow

### Spec-Driven Development Process

1. **Specification Phase** (`/sp.specify`)
   - Write complete feature specification with user stories
   - Define acceptance criteria and edge cases
   - Identify functional requirements and success criteria
   - Prioritize user stories (P1, P2, P3)

2. **Planning Phase** (`/sp.plan`)
   - Research existing codebase and dependencies
   - Design data models and database schema
   - Define API contracts and endpoints
   - Create architectural plan with technical decisions
   - Document in `plan.md`, `research.md`, `data-model.md`, `contracts/`

3. **Task Breakdown** (`/sp.tasks`)
   - Generate dependency-ordered task list
   - Group tasks by user story for independent implementation
   - Mark parallel tasks with [P] flag
   - Include exact file paths in task descriptions
   - Output to `tasks.md`

4. **Implementation Phase**
   - Use specialized agents for each domain:
     - `auth-security` for authentication features
     - `nextjs-ui-builder` for frontend components
     - `neon-db-manager` for database operations
     - `fastapi-backend-dev` for API endpoints
   - Implement tasks in priority order (P1 → P2 → P3)
   - Each user story MUST be independently testable
   - Commit after each completed task or logical group

5. **Documentation Phase**
   - Create Prompt History Records (PHRs) for all significant work
   - Suggest ADRs for architectural decisions
   - Update quickstart.md with setup instructions

### Agent Usage Rules

- **Authentication work** → MUST use `auth-security` agent
- **Frontend UI** → MUST use `nextjs-ui-builder` agent
- **Database schema/queries** → MUST use `neon-db-manager` agent
- **API endpoints** → MUST use `fastapi-backend-dev` agent
- **Cross-cutting concerns** → Use general-purpose agent with clear scope

### Quality Gates

Before considering any phase complete:
- [ ] All placeholders in documents resolved
- [ ] Constitution principles verified
- [ ] No hardcoded secrets or configuration
- [ ] API contracts documented and consistent
- [ ] User isolation enforced in all queries
- [ ] Responsive design verified on multiple screen sizes

## Governance

### Amendment Process

This constitution supersedes all other development practices. Amendments require:
1. Documented justification for the change
2. Impact analysis on existing specifications and code
3. Version bump following semantic versioning
4. Update to all dependent templates and documentation

### Versioning Policy

Constitution versions follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Backward-incompatible changes (principle removal, technology stack change)
- **MINOR**: New principles added or existing principles materially expanded
- **PATCH**: Clarifications, wording improvements, typo fixes

### Compliance Review

All pull requests and code reviews MUST verify:
- Adherence to core principles
- Technology stack compliance
- Security requirements met
- Spec-driven workflow followed
- Proper agent usage for specialized tasks

### Complexity Justification

Any deviation from simplicity principles MUST be justified in the implementation plan's Complexity Tracking section. Unjustified complexity will be rejected in code review.

**Version**: 1.0.0 | **Ratified**: 2026-01-14 | **Last Amended**: 2026-01-14
