# Transition Log: OpenAI to Local Ollama Implementation

**Objective:** Migrate Nourish Neural's intelligence from cloud-based OpenAI GPT-4o to local inference for data privacy, cost reduction, and reduced latency.

---

### 1. Hardware Context & Constraints
*   **Target Machine:** 16GB System RAM | 6GB VRAM (NVIDIA GPU).
*   **Critical Constraint:** Available Memory (approx. 5.2 GiB).
*   **Inference Dynamics:** GPU memory (VRAM) is ~10x faster than System RAM. Models must fit in VRAM to avoid "swapping/stalling."

### 2. Model Selection Evolution (The "Uni" Iterations)
1.  **Iter-01: `gpt-oss` (13GB)**
    *   *Result:* **FAIL** (Memory Error). Required 10.4GB+; triggered EADDRINUSE and system hang.
2.  **Iter-02: `Llama 3.2 3B` (Quantized)**
    *   *Result:* **FAIL** (Memory Error). Requested 8.3GB; exceeded 6GB VRAM + available RAM buffer.
3.  **Iter-03: `Llama 3.2 1B` (Ultra-Lightweight)**
    *   *Result:* **PASS**. FOOTPRINT: ~1.3GB disk / ~2.1GB runtime. Fits entirely in VRAM.

### 3. Implementation Workflow
*   **Infrastructure:** Deployed **Ollama** locally (Port 11434).
*   **API Layer:** Utilized OpenAI SDK's `baseURL` parameter to point at `http://localhost:11434/v1`. Zero code-logic changes needed for the client.
*   **Persona Injections:** Created `NurexaModelfile` to "burn" the system prompt and temperature parameters into the model itself.
*   **Route Hardening:**
    *   Unified frontend/backend endpoints (Fixed 404s).
    *   Implemented `res.headersSent` guards to prevent double-response crashes.

### 4. Key Configuration Changes
*   **Environment:** Updated `.env` to `USE_OLLAMA=true`.
*   **Cleanup:** Purged `gpt-oss` (13GB) to free up drive space.
*   **Backend:** Instrumented `ai.js` with UK-specific knowledge context.

### 5. Technical Difficulties & Obstacles
*   **Port Locking (Zombie Processes):** Node.js processes persisted on `3050`/`5000` post-crash, requiring `netstat` PID identification and forced kills to resume dev environment.
*   **Memory Ceiling (VRAM vs. RAM):** Initial 13GB model footprint triggered system-wide page-swapping. Resolved via move to 1B parameter model to guarantee 100% VRAM occupancy.
*   **Header Racing:** Encountered `ERR_HTTP_HEADERS_SENT` due to catch loops in the AI route. Solved by implementing explicit execution guards (`res.headersSent`).
*   **Fragile Extraction:** Non-deterministic AI output (markdown vs. plain text) initially crashed regex parsers. Hardened via string-type validation and fallback JSON objects.

---
**Status:** FULLY MIGRATED. Local AI (Nurexa) is functional on GPU.
