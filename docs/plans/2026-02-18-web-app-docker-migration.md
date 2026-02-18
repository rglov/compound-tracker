# Compound Tracker Web App Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Electron runtime with a browser-accessible web app, preserving existing features and local data behavior, and make it runnable in Docker.

**Architecture:** Keep `/src/renderer` UI code and route all persistence/file operations through a new Express API server. Replace `window.api` Electron bridge with a browser `fetch` bridge that matches the same method surface. Persist data in a JSON file on disk and expose uploaded test-result files via static routes.

**Tech Stack:** Node.js, Express, Multer, vanilla JS frontend, Docker.

---

### Task 1: Add web server foundation

**Files:**
- Create: `src/web/server.js`
- Create: `src/web/store.js`
- Create: `src/web/defaults.js`
- Reuse: `src/shared/store-utils.js`

**Step 1: Write failing test**
- Add API integration test shell expecting `GET /api/doses` to return array.

**Step 2: Verify fail**
- Run test and confirm missing server module.

**Step 3: Implement minimal server/store**
- Serve renderer static files.
- Add JSON-backed store abstraction with defaults and safe read/write.
- Add initial `/api/doses` endpoints.

**Step 4: Verify pass**
- Run tests for green.

### Task 2: Complete API parity with existing renderer

**Files:**
- Modify: `src/web/server.js`

**Step 1: Write failing test**
- Add tests for at least one CRUD path each for doses, inventory, orders, settings, import/export.

**Step 2: Verify fail**
- Run tests and confirm missing endpoints.

**Step 3: Implement API endpoints**
- Port all current `window.api` methods to HTTP endpoints.
- Add upload endpoint for test files (`pickTestFile` replacement).
- Add open endpoint returning browser URL for uploaded test files (`openTestFile` replacement).

**Step 4: Verify pass**
- Run endpoint tests and smoke-check response shapes.

### Task 3: Replace Electron bridge in frontend

**Files:**
- Create: `src/renderer/js/web-api.js`
- Modify: `src/renderer/index.html`

**Step 1: Write failing test**
- Browser-bridge unit test for a representative API call URL/method.

**Step 2: Verify fail**
- Run and confirm missing bridge file.

**Step 3: Implement bridge**
- Define `window.api` methods matching existing names/signatures.
- Implement JSON and multipart upload handling.
- Implement `openTestFile` using `window.open` on API URL.

**Step 4: Verify pass**
- Run bridge tests and syntax checks.

### Task 4: Dockerize and update scripts/docs

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Modify: `package.json`
- Modify: `README.md`

**Step 1: Write failing test/check**
- Validate `npm run web` and Docker build/run instructions against current config.

**Step 2: Verify fail**
- Confirm missing scripts/Docker artifacts.

**Step 3: Implement**
- Add web scripts (`web`, `test`).
- Add Docker image build instructions exposing app port.
- Update README to web-first run path.

**Step 4: Verify pass**
- Run tests and syntax checks.
- Build Docker image.

### Task 5: Final verification and migration notes

**Files:**
- Modify: `README.md`

**Step 1: Verify all checks**
- Run full test command.
- Run syntax validation across server + renderer JS.

**Step 2: Document behavioral differences**
- Explicitly note browser-safe replacements for native file open/pick flow.

**Step 3: Report completion evidence**
- Include exact commands and outcomes.
