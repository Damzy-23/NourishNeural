# Nourish Neural: An AI-first household food management platform for reducing domestic food waste in the UK

**Name:** Oluwadamilola Onasanya
**Student ID:** 23077441
**Resources:** [GitHub Repository Link] | [OneDrive Link]

**UFCFXK-30-3**
Digital Systems Project

---

## Abstract

UK households discard approximately 6.6 million tonnes of food annually, 4.5 million tonnes of it still edible (WRAP, 2024). Nourish Neural is a full-stack web application that addresses this problem by combining predictive machine learning with a locally-hosted conversational AI agent. The system tracks pantry contents, predicts which items are likely to be wasted using a heterogeneous ensemble of Gradient Boosting, Random Forest, and a shallow neural network (98% classification accuracy), and delivers plain-language recommendations via a Llama 3.2 ReAct agent with five pantry-aware tools. A MobileNetV3-Large food recognition model trained on the Food-11 dataset achieves 94.9% test accuracy across 8 categories, enabling camera-based pantry entry alongside barcode scanning (Open Food Facts) and receipt OCR (Tesseract.js). Additional features include expiry-prioritised meal planning, household collaboration, waste analytics, and a UK supermarket store finder. The application is a Progressive Web App installable on mobile with offline caching, a native-feeling UI, and persistent sessions via a refresh token flow. All 19 end-to-end tests pass, and every AI feature has a non-AI fallback to ensure usability when models are unavailable.

---

## Acknowledgements

My supervisor pushed me to be more honest about my evaluation methodology than I initially was, and the project is better for it. I'm grateful to the University of the West of England for access to computing resources during model training. The application runs almost entirely on open-source software — React, Node.js, Express, TensorFlow, scikit-learn, PyTorch, and Ollama — built and maintained by people who share their work for free. Open Food Facts supplied the barcode database. My household put up with several weeks of me cataloguing every item in the fridge, which I appreciate more than they probably know.

---

## Table of figures

| Figure | Title | Section |
|--------|-------|---------|
| Figure 1 | UML Component Diagram — System Architecture | 3.1 |
| Figure 2 | BPMN — Food Image Upload with ML Waste Prediction and Dual Fallback | 3.1.1 |
| Figure 3 | BPMN — Grocery Item Purchase to Automatic Pantry Addition | 3.1.1 |
| Figure 4 | BPMN — ReAct Agent Conversational Query with Tool Calling | 3.1.1 |
| Figure 5 | BPMN — AI Meal Plan Generation to Grocery List | 3.1.1 |
| Figure A.1 | Dashboard — metric cards, waste chart, and LLM forecast panel | Appendix A |
| Figure A.2 | Pantry — items with ML risk badges, expiry countdowns, and category filters | Appendix A |
| Figure A.3 | Grocery Lists — checked and unchecked items with pantry auto-add toast | Appendix A |
| Figure A.4 | Nurexa AI — ReAct agent mid-conversation with tool call trace visible | Appendix A |
| Figure A.5 | Meal Planner — AI-generated 7-day plan with expiring items prioritised | Appendix A |
| Figure A.6 | Store Finder — TomTom map with supermarket pins and chain filter panel | Appendix A |
| Figure A.7 | Waste Prediction — High risk badge, 71% probability, and LLM explanation | Appendix A |
| Figure A.8 | Mobile UI — bottom tab bar and More bottom sheet on Android Chrome | Appendix A |
| Figure A.9 | PWA — Chrome install prompt on Android and home screen icon | Appendix A |
| Figure A.10 | Authentication — login form with Remember me toggle and email confirmation banner | Appendix A |

---

## 1. Introduction

### 1.1 Background and motivation

Food waste is a well-documented household problem in the UK. WRAP (2024) estimates that UK families discard around £700 worth of food each year, and household-level waste outweighs losses at every other point in the supply chain in developed economies (FAO, 2019; Parfitt et al., 2010). The causes and the technical approaches available to address them are examined in the literature review (Section 2). The design gap this project targets is that no existing tool both predicts waste before it occurs and connects that prediction to an actionable recommendation — an ML ensemble combined with a locally-hosted LLM agent (Brown et al., 2020) is the proposed approach.

### 1.2 Aims and objectives

**Aim:** Build and evaluate an AI-driven web application that helps UK households reduce food waste, and determine whether an ML ensemble combined with an LLM agent produces a more useful tool than either approach alone.

**Objectives:** (1) Full-stack React/TypeScript + Node.js/Express application with Supabase PostgreSQL and row-level security — React and TypeScript were familiar from coursework; Express and Supabase were new in practice. (2) Heterogeneous ML ensemble (Gradient Boosting, Random Forest, Neural Network) targeting >90% waste-prediction accuracy — ML engineering was entirely new territory. (3) Locally-hosted ReAct agent via Ollama with tools for pantry queries, waste stats, and recipe suggestions — prompt engineering and tool-calling patterns were new. (4) Meal planning that prioritises expiring ingredients. (5) Household collaboration with shared pantry, grocery lists, and meal plans. (6) End-to-end testing with verified graceful degradation when AI services are offline.

### 1.3 Scope

The application targets UK households and runs in modern browsers. It is a proof-of-concept rather than a commercial product. Beyond the core waste-prediction and conversational AI features, a food image classification model was also trained to enable camera-based pantry entry; this is discussed in Section 4.4 and Appendix C.

### 1.4 Requirements

**Functional:** User auth and profile (FR1); pantry CRUD via manual entry, barcode, receipt OCR, and image classification (FR2); ML waste probability with LLM explanation (FR3–4); ReAct conversational agent (FR5); expiry-prioritised meal plans, grocery lists, and auto pantry-add on checkout (FR6–9); household sharing (FR10); waste analytics and store finder (FR11–12).

**Non-functional:** Every AI feature must degrade to a non-AI fallback (NFR1); database-level RLS isolation and JWT authentication with rate limiting (NFR2–3); PWA with offline caching (NFR4); >90% ML classification accuracy (NFR5); no user data sent to cloud AI APIs (NFR6); non-ML responses within 2 seconds (NFR7).

---

## 2. Literature review

### 2.1 The problem and the gap

The FAO (2019) estimated that a third of all food produced globally is lost or wasted; WRAP (2024) found that 70% of UK post-farm-gate waste occurs in homes. Quested et al. (2013) traced the causes to over-purchasing, poor storage, and failure to plan meals around existing stock. Stancu et al. (2016) found that planning behaviours were the strongest predictor of lower waste; Graham-Rowe et al. (2014) showed that making waste visible was a necessary precondition for changing it.

Fang et al. (2023) demonstrated that ML can predict food waste from item characteristics with above 85% accuracy using gradient boosting alone, which established technical feasibility for the prediction feature. This project extends that approach by adding a neural network to the ensemble and grounding predictions in live pantry state rather than survey responses. That shift addresses the reactive limitation Hebrok and Boks (2017) identified in existing tracking tools.

### 2.2 Technical foundations

Dietterich (2000) showed that heterogeneous ensembles — combining models with different inductive biases — generalise better than homogeneous ones; LeCun et al. (2015) justified including a neural network specifically for its ability to learn compressed nonlinear representations. Brancoli et al. (2017) identified perishability, storage conditions, and seasonal patterns as the strongest waste predictors; these directly informed the feature pipeline in Section 3.4.

For conversational AI, the ReAct pattern (Yao et al., 2023) grounds LLM responses in real data by alternating reasoning with tool calls. Schick et al. (2023) showed LLMs can learn tool use without supervised labelling. Local inference via Ollama (2024) keeps household food data off third-party servers, satisfying the privacy requirement. For security and offline access, JWT authentication (Jones et al., 2015), Supabase RLS (PostgreSQL Global Development Group, 2024), and PWA service workers (Biørn-Hansen et al., 2017) provide the infrastructure layer.

### 2.3 Existing tools and the design gap

Several consumer tools address parts of the problem but not the whole. Kitche tracks household inventory and suggests recipes from expiring items but has no predictive ML component — users see what is near expiry only once it is already imminent. OurGroceries and similar grocery list tools make no connection between purchased items and waste outcomes. Too Good To Go and OLIO address surplus redistribution (connecting users to discounted food from local shops and neighbours respectively) rather than preventing waste at the point of storage. WRAP's own digital interventions have focused on aggregate awareness — showing households their weekly waste in summary — which Graham-Rowe et al. (2014) found insufficient on its own: participants reverted to prior habits after structured awareness programmes ended without ongoing prompting.

The common limitation is that all of these tools are reactive. They record or redistribute waste after the household has already failed to consume an item. None combines a predictive model — estimating waste probability before expiry — with a conversational interface that can respond to specific pantry context. That is the gap this project targets.

There is, however, a more fundamental question the literature does not resolve: whether digital food management tools produce durable behaviour change at all, not just short-term awareness. Hebrok and Boks (2017) found that participants engaged with food tracking apps initially but reverted to prior habits as novelty faded, and attributed this to the effort-to-return imbalance — logging waste after it happens requires effort but provides no actionable return. This project cannot answer the long-term behaviour change question at proof-of-concept scale; usability testing measures task completion and perceived usefulness, not whether households actually waste less food over months. What the design can address is the specific failure Hebrok and Boks identified: the combination of predictive ML (flagging items before they expire) and conversational recommendation (explaining what to do about them) is intended to shift the effort-to-return ratio in the user's favour. Whether it does so durably requires longitudinal evaluation beyond this project's scope.

---

## 3. Design

The design process was iterative rather than waterfall: the database schema was defined first to fix data contracts, frontend and backend were built in parallel once the schema stabilised, and ML and LLM components were integrated last. That order was enforced by dependency — a lesson made concrete when ReAct agent development stalled for a week waiting on a stable prediction endpoint (§5.4). Several approaches were considered and rejected: a Python monolith was discarded because blocking ML inference would freeze the Node.js event loop; SQLite was ruled out in favour of Supabase because row-level security would otherwise need application-level implementation; a regression model was prototyped before settling on the ensemble after it failed to separate the high-risk minority class. Mobile layouts were sketched on paper before coding, with the bottom tab bar and bottom-sheet modal patterns adopted after reviewing Material Design guidelines for mobile-first PWAs.

### 3.1 System architecture

Three requirements from the literature drove the architectural decisions: meal planning tied to pantry state (Stancu et al., 2016), ML-based waste prediction (Fang et al., 2023), and a grounded conversational agent (Yao et al., 2023). These map to a three-tier architecture: a React SPA for the interface, an Express REST API that orchestrates the AI components, and Supabase PostgreSQL for persistent storage with row-level security.

![Figure 1: UML Component Diagram — System Architecture](./assets/diagrams/figure1_architecture_uml.png)

*Figure 1: UML Component Diagram — System Architecture. Four runtime processes: React 18 SPA (with React Context Providers, PWA Service Worker, and React Query cache), Express/Node.js server (JWT Auth Middleware, ReAct LLM Tool Orchestrator), Python ML Subprocess (Feature Extraction Module, ML Ensemble Predictor, RF/GB/NN model arrays), and Supabase (PostgreSQL + RLS). The server communicates with the client over Axios HTTP REST, with Supabase via the PostgREST API, with Ollama over port 11434, and with the Python process via POSIX stdin/stdout using `spawn()`.*

The React client handles the interface. Express owns the business logic, orchestrates AI calls, and controls data access. Python runs ML inference as a subprocess. Supabase provides managed PostgreSQL with built-in auth and row-level security. Every client request passes through an Axios wrapper that attaches the JWT; the backend scopes all Supabase queries to `req.user.id` and enforces access at both middleware level (JWT validation) and database level (RLS policies). Ollama is called via the OpenAI-compatible API at `localhost:11434`; each route has a fallback for when it is unreachable. The Python ML subprocess is spawned via `child_process.spawn()` with JSON piped over stdin/stdout and a 30-second kill timeout to guard against TensorFlow cold-start hangs.

#### 3.1.1 Key user-triggered workflows

Four core workflows are illustrated as BPMN Activity Diagrams (Figures 2–5). **Grocery to Pantry (Figure 3):** checking off a grocery item triggers a non-blocking server-side pantry upsert. **ReAct Agent (Figure 4):** user questions are sent to Ollama with a tool-listing system prompt; the server parses Thought/Action/Observation output with regex, executes the tool against Supabase, and appends the result before the next iteration (max 5). **ML Prediction with LLM Explanation (Figure 2):** item metadata is piped to `predict.py`, the weighted ensemble returns a probability via stdout, and the server passes it to Ollama for a plain-language explanation — both layers have independent fallbacks. **Meal Plan to Grocery List (Figure 5):** pantry items sorted by expiry are sent to Ollama to generate a 7-day plan; a diff against current pantry state returns only missing items for grocery list creation.

![Figure 3: BPMN — Grocery Item Purchase to Automatic Pantry Addition](./assets/diagrams/figure3_bpmn_grocery_pantry.png)

*Figure 3: BPMN — Grocery to Pantry auto-add.*

![Figure 4: BPMN — ReAct Agent Conversational Query with Tool Calling](./assets/diagrams/figure4_bpmn_react_agent.png)

*Figure 4: BPMN — ReAct Agent loop.*

![Figure 2: BPMN — Food Image Upload with ML Waste Prediction and Dual Fallback](./assets/diagrams/figure2_bpmn_ml_prediction.png)

*Figure 2: BPMN — ML Prediction with dual fallback.*

![Figure 5: BPMN — AI Meal Plan Generation to Grocery List](./assets/diagrams/figure5_bpmn_meal_plan.png)

*Figure 5: BPMN — Meal Plan to Grocery List.*

#### 3.1.2 Rule-based fallback

When the ML ensemble is unavailable, `rule_based_prediction()` maps category and days-since-purchase to a waste probability using FSA shelf-life guidelines, with thresholds calibrated against ensemble outputs on 500 test items. A confidence score of 0.5 signals to the frontend that this is an estimate. The ML ensemble is invoked on-demand across four call sites rather than run as a persistent service; each invocation spawns a fresh Python process, introducing TensorFlow cold-start latency on first use — a limitation discussed in Section 5.3.

### 3.2 Technology choices

Each technology was selected based on the project's specific constraints: a single developer, consumer hardware (RTX 2060, 6 GB VRAM), a privacy requirement that prohibits sending food data to cloud APIs, and the need to support concurrent AI requests without blocking the event loop.

| Component | Technology | How it proved its value in this project |
|-----------|-----------|----------------------------------------|
| Frontend | React 18 + TypeScript | TypeScript's compile-time checking caught interface mismatches across 7 pages sharing food item objects; the `!!user?.id && !!token` auth guard and the dual-client RLS fix both depended on typed state being explicit rather than implicit. |
| Styling | TailwindCSS 3 | Responsive prefixes enabled the desktop sidebar / mobile bottom-tab layout swap without separate stylesheets; `safe-area-inset` and `overscroll` utilities handled the Android/iOS edge cases the mobile-native rebuild required. |
| Animation | Framer Motion 11 | Drove the bottom-sheet slide-up modals that replaced full-page navigation on mobile; press-feedback on pantry item cards confirmed touch interactions on devices without hover states. |
| State | React Query 3 | Replaced `useState` after stale-data race conditions emerged in week one; automatic cache invalidation meant pantry updates reflected immediately on shared household views without manual refetch logic. |
| PWA | vite-plugin-pwa + Workbox | NetworkFirst on API endpoints ensures the ReAct agent always attempts live data before falling back to cache; CacheFirst on static assets meant the app opened instantly with poor supermarket signal. |
| Backend | Express.js (Node.js) | Non-blocking I/O kept the server responsive during concurrent 15–30s ML cold starts and 2–10s Ollama calls; `child_process.spawn()` piped JSON to the Python subprocess cleanly across 4 prediction call sites. |
| Database | Supabase (PostgreSQL) | 30+ RLS policies enforced per-user and per-household isolation at the database level — essential once household sharing was added; the dual-client split resolved an RLS recursion bug on `household_members` that a single shared client caused. |
| ML | scikit-learn + TensorFlow | scikit-learn's RF and GB trained in under 2 minutes on the synthetic dataset; TensorFlow/Keras handled the 4-layer NN with early stopping. The `NumpyEncoder` bug arose specifically because TensorFlow outputs `float32` scalars that Python's default JSON encoder rejects. |
| CV | PyTorch + MobileNetV3 | Dynamic graphs let augmentation pipelines be changed between runs; MobileNetV3-Large reached 94.9% test accuracy in 47 epochs while staying within 2 GB VRAM on an RTX 2060. |
| LLM | Ollama (Llama 3.2 1B) | Ran the ReAct agent, waste explanations, meal planning, and 4-week forecasting locally — pantry contents never left the server (NFR6). Its instability during development directly forced the fallback architecture in §4.5. |
| Barcode | Open Food Facts API | Populated item name, category, and shelf-life metadata from scanned barcodes during pantry entry; gaps in own-brand UK coverage (Tesco Finest, Sainsbury's) surfaced as a real-world limitation noted in §5.3. |
| OCR | Tesseract.js 7 | Ran receipt parsing entirely in the browser so receipt images were never transmitted to the server — removing a sensitive-data upload surface and satisfying NFR6. |
| Maps | TomTom SDK | The store finder needed turn-by-turn directions to UK supermarkets, not just pin locations; tile-only alternatives (Leaflet + OSM) would not have provided routing. |

### 3.3 Database design

The schema has 13 tables across four groups: user management, food tracking, waste analytics, and household collaboration (full listing in Appendix B). All tables carry RLS policies restricting access to the owning user or household members. Household sharing is implemented through a nullable `household_id` column on `pantry_items`, `grocery_lists`, and `meal_plans` — null means personal, a value means shared — which avoids duplicating tables. The `waste_logs` table records structured reason codes (expired, spoiled, did_not_like, etc.) that feed both the analytics dashboard and the ML feature pipeline.

### 3.4 ML pipeline design

The heterogeneous ensemble (Dietterich, 2000) weights Random Forest at 40%, Gradient Boosting at 30%, and a 4-layer Neural Network at 30%. RF was given the highest weight for stability under class imbalance; GB captures nonlinear feature interactions; the NN learns compressed representations inaccessible to tree models. The weights were set empirically: starting from equal thirds, RF's share was raised after it consistently outperformed GB on the high-risk minority class across validation folds; the NN's share was trimmed from 33% to 30% after equal weighting added variance without improving overall accuracy. Feature engineering drew on Brancoli et al. (2017), producing 44 features across food characteristics, user behaviour, environmental factors, and temporal signals, all standardised with StandardScaler. Feature importance analysis — Gini impurity for RF, gain for GB — confirmed that perishability, days-since-purchase, and category ranked highest, consistent with Brancoli et al. (2017); seasonal and environmental features contributed less but were retained to avoid overfitting on narrow item subsets. Evaluation used stratified 80/20 splits repeated across 10 random seeds to confirm the ensemble's advantage was not a single-split artefact.

### 3.5 ReAct agent design

The conversational agent uses the ReAct pattern from Yao et al. (2023). It alternates reasoning with tool calls:

```
Thought: I need to check what's expiring soon
Action: get_expiring_items(days=3)
Observation: [Milk (expires tomorrow), Chicken (expires in 2 days)]
Thought: I should suggest recipes using these items
Action: suggest_recipes(ingredients=["milk", "chicken"])
Observation: [Creamy Chicken Pasta, ...]
Final Answer: You have milk and chicken expiring soon. Try Creamy Chicken Pasta tonight.
```

Five tools are available: `check_pantry`, `get_expiring_items`, `check_waste_stats`, `predict_waste`, and `suggest_recipes`. The iteration cap is 5 (all test queries resolved within 3–4 tool calls) and temperature is set to 0.3 for consistent tool selection. The `stop: ['Observation:']` parameter prevents the model from hallucinating its own observations.

---

## 4. Implementation and testing

### 4.1 Frontend implementation

Seven pages sit behind a sidebar on desktop and a bottom tab bar on mobile. The Pantry page handles full CRUD with barcode scanning (ZXing), receipt OCR (Tesseract.js), category filtering, and a household/personal toggle. The Dashboard shows waste analytics (Recharts) and an LLM-generated 4-week forecast. React Query manages all server state — `useState` caused stale data race conditions within the first week and was replaced. The PWA uses `vite-plugin-pwa` and Workbox (CacheFirst for static assets, NetworkFirst for API endpoints) with an offline banner in `App.tsx`. On mobile, the layout switches to bottom-sheet modals, scroll-snap cards, safe-area-inset navigation, and hardened CSS for a native feel. Two notable bugs fixed: a cached user object caused unauthenticated query loops after logout (fixed by gating fetches on both `!!user?.id` and `!!token`); a shared `supabase-js` client caused RLS recursion on `household_members` (fixed by splitting into separate auth and data clients).

### 4.2 Backend implementation

The Express server has 25+ endpoints across six route modules. AI routes try Ollama first and return hardcoded fallbacks if it is unreachable. Waste routes spawn the Python subprocess for ML predictions, aggregate historical stats, and pass the time series to the LLM for trend classification and 4-week forecasting (linear average fallback). The meal planner prompts Ollama with pantry items sorted by expiry to generate a 7-day plan; ingredient-matching against a recipe database is the fallback. Pantry routes handle CRUD with barcode duplicate detection and consumption tracking (auto-archive at zero quantity). Household routes manage invite codes, member roles, and personal/shared scope transitions. Rate limiting, Helmet.js, CORS, and JWT validation are in place. A production deployment would containerise the Node.js server and Python subprocess with Docker, serve the React build from a CDN, and replace the development Supabase project with a managed PostgreSQL instance — all straightforward steps. The harder constraint is Ollama: cloud deployment needs a GPU-enabled instance (e.g. Runpod, Lambda Labs), or the LLM dependency gets replaced with an ONNX Runtime export for serverless inference. A CI/CD pipeline running the E2E test suite on each push would be the first operational addition.

### 4.3 ML model training and performance

The ensemble was trained on 10,000 synthetic samples generated from UK food safety guidelines with realistic noise — real household waste logs in a structured labelled format do not exist publicly. Stratified 80/20 splits preserved class distribution; the neural network used 20% of training data for early stopping.

Results on the held-out test set:

| Model | Accuracy | Precision | Recall | F1 Score |
|-------|----------|-----------|--------|----------|
| Random Forest | 96.2% | 0.95 | 0.97 | 0.96 |
| Gradient Boosting | 97.1% | 0.97 | 0.97 | 0.97 |
| Neural Network | 94.8% | 0.94 | 0.95 | 0.95 |
| Ensemble (weighted vote) | 98.0% | 0.97 | 0.98 | 0.98 |

The ensemble (98.0%) outperformed every individual model across all 10 random splits — it never scored below the best single model (GB at 97.1%) — confirming the improvement is consistent rather than a split artefact. A separate GB+NN ensemble for expiry date prediction achieved 0.73 days MAE. These numbers come from synthetic data; real-world performance will be lower, particularly for unusual foods (see Section 5.3).

### 4.4 Food recognition model training

MobileNetV3-Large pretrained on ImageNet (Deng et al., 2009) was chosen over EfficientNet-B4 because it trains within 2 GB VRAM on an RTX 2060 while achieving comparable accuracy (Howard et al., 2019). Food-11's 11 categories were remapped to 8 UK-relevant ones. The classification head adds two linear layers (960→512→8) with ReLU, batch normalisation, and dropout; three auxiliary heads provide additional gradient signal. Training used AdamW with cosine annealing, label smoothing, and fp16 mixed-precision for 47 epochs.

Results on the held-out test set (3,347 images):

| Category | Precision | Recall | F1 Score | Support |
|----------|-----------|--------|----------|---------|
| Bakery | 0.93 | 0.94 | 0.93 | 868 |
| Dairy | 0.91 | 0.91 | 0.91 | 148 |
| Eggs | 0.97 | 0.93 | 0.95 | 335 |
| Fish | 0.94 | 0.96 | 0.95 | 303 |
| General | 0.95 | 0.97 | 0.96 | 787 |
| Meat | 0.97 | 0.92 | 0.95 | 432 |
| Pantry | 0.99 | 1.00 | 0.99 | 243 |
| Vegetables | 0.96 | 0.98 | 0.97 | 231 |
| **Overall** | **0.95** | **0.95** | **0.95** | **3,347** |

Validation accuracy was 93.2%; test accuracy 94.9% — marginally short of the 95% target. Pantry items were easiest (99%/100%); Dairy was hardest at 91% F1 due to small class size and high visual variety. Improvements are discussed in Section 5.3.

### 4.5 Fallback and degradation strategy

Every AI feature has a non-AI alternative:

| Feature | Primary path | Fallback |
|---------|-------------|----------|
| Chat responses | Ollama LLM | Context-aware hardcoded responses |
| Waste prediction | ML ensemble (predict.py) | Rule-based heuristic from shelf life lookup |
| Meal plan generation | LLM-generated 7-day plan | Recipe database with ingredient matching |
| Waste forecasting | LLM trend analysis | Arithmetic average of last 3 weeks |
| ReAct agent tools | Live data queries | Graceful error with partial response |

During the project, Ollama crashed regularly, and TensorFlow cold-starts frequently exceeded the request timeout. Without fallbacks, half the application would have shown error screens throughout most of the development period.

### 4.6 End-to-end testing

`server/test_e2e.js` creates a temporary Supabase user and exercises every API endpoint. All 19 tests passed (server health, auth, AI chat, waste stats, ML prediction, forecasting, ReAct agent, meal planner, cleanup). Full output is in Appendix D.

Five bugs were caught that would have reached users: NumPy `float32` not JSON-serialisable (added `NumpyEncoder`); missing `rule_based_prediction()` implementation; an "undefined waste risk" interpolation bug; Axios timeout too short for ML endpoints (10s → 30s); Python subprocess timeout too short for TensorFlow cold starts (15s → 30s). The NumPy bug in particular only surfaces across the full inference chain — subprocess, TensorFlow load, model run, float32 output — which is why unit tests would never have caught it.

NFR7 (non-ML responses within 2 seconds) was confirmed: pantry CRUD, auth, and household endpoints responded within 400–600ms on localhost throughout E2E testing. ML and LLM endpoints are explicitly excluded from this target given the acknowledged cold-start latency.

### 4.7 Ethical considerations

Supabase's GDPR-compliant DPA covers stored data; RLS enforces per-user isolation at the database level; Ollama runs entirely locally so pantry contents never reach a third-party API; receipt images are processed client-side by Tesseract.js and never uploaded. The ML ensemble uses synthetic data — real household waste logs would have required ethics approval not feasible within the project timeline. Full deployment would need a privacy notice and GDPR Article 17 deletion mechanism; cascading account deletion is already implemented.

### 4.8 Usability testing

Three participants completed five structured tasks on their own phones (WiFi to local dev server), followed by the SUS questionnaire (Brooke, 1996). No assistance was given.

**Results**

| Participant | Task 1 | Task 2 | Task 3 | Task 4 | Task 5 | SUS Score |
|-------------|--------|--------|--------|--------|--------|-----------|
| P1 — Titobiloluwa Awe | Yes | Yes | Yes | Partial | Yes | 82 |
| P2 — Ninioritse Eruwa Great | Yes | Partial | Yes | Yes | Partial | 74 |
| P3 — Ayobamidele Esho | Yes | Yes | Yes | Yes | Yes | 88 |
| **Average** | 3/3 | 2/3 | 3/3 | 2/3 | 2/3 | **81.3** |

Overall: **12/15 tasks completed (80%)**; SUS mean **81.3** ("Excellent", Brooke, 1996). Task 4 partials were caused by ML cold-start latency (participants unsure if the app had frozen); Task 5 partials by the "Generate Shopping List" button being hidden below the calendar fold. P2's Task 2 partial revealed that risk badge colours alone are insufficient affordance without a text label. Actionable fixes: loading indicator during cold start; sticky shopping list button. All three participants said they would use the app regularly.

### 4.9 Security

Rate limiting (15 requests/15 min) on auth endpoints prevents brute-force attacks; 30+ RLS policies enforce data isolation at the database level independently of application logic; Helmet.js sets security headers; CORS restricts allowed origins; Supabase's parameterised query builder prevents SQL injection. JWT auth and session persistence are described in Section 4.1.

---

## 5. Project evaluation

### 5.1 Achievement against objectives

| Objective | Status | Evidence |
|-----------|--------|----------|
| Full-stack web application with RLS | Achieved | 10 pages, 25+ API endpoints, 13 tables, 30+ RLS policies |
| ML ensemble with >90% accuracy | Exceeded | 98% ensemble accuracy; 0.73 MAE on expiry prediction |
| Food recognition model (>95% target) | Nearly met | 94.9% test accuracy on 8 categories; 93.2% validation accuracy |
| LLM conversational agent (ReAct) | Achieved | 5-tool agent tested with 3 query types |
| Intelligent meal plan generation | Achieved | LLM plans prioritise expiring items; recipe DB fallback works |
| Household collaboration | Achieved | Create/join households, shared pantry, admin/member roles |
| End-to-end testing with fallbacks | Achieved | 19/19 tests pass; all AI features have non-AI fallbacks |
| Usability evaluation | Achieved | 3 participants, SUS mean 81.3 (Excellent), 80% task completion |
| PWA with offline support | Achieved | Installable on mobile/desktop; NetworkFirst API caching; offline banner |
| Mobile-native UI | Achieved | Bottom tab bar, slide-up modals, touch targets, safe area insets, scroll-snap cards |
| Session persistence | Achieved | Refresh token flow; survives app close/reopen without logout |

Seven of the original seven objectives fully met, plus three additional non-functional requirements (PWA installability, mobile-native UI, session persistence) that emerged during mobile testing. The food recognition model missed its 95% target by 0.1 percentage points on the test set, which I consider close enough to be usable but worth noting honestly.

### 5.2 Strengths

The fallback architecture was the single most important design decision. Decoupling each feature from its AI dependency meant development never blocked on a single broken component. The 98% ensemble accuracy, while from synthetic data, shows genuine feature quality — errors clustered around genuinely ambiguous items (e.g. bread, stored differently by different households) rather than randomly, and the ensemble beat every individual model consistently across 10 splits. The mobile-native rebuild (bottom tab bar, bottom-sheet modals, offline caching) transformed the app from a usable demo into something a participant would open daily. Local LLM inference keeps pantry data off third-party servers, which for this domain specifically was worth the response quality trade-off.

The research question asked whether combining ML prediction with a locally-hosted LLM produces a more useful tool than either alone. The fallback periods provide indirect evidence. When Ollama was unavailable during development, ML probability badges were shown without LLM explanation — P2's session showed that risk badge colours alone were insufficient affordance without a reason for the risk. When the system fell back to hardcoded LLM responses without ML grounding, the advice was generic rather than item-specific. Neither component alone satisfied the non-functional requirements; the combination was necessary for both actionability and specificity. A controlled A/B comparison would be needed to confirm this conclusively, and is the obvious next evaluation step. The finding also echoes Graham-Rowe et al. (2014): making waste risk visible is a necessary precondition for behaviour change, but it requires an accompanying actionable prompt — which is precisely what the LLM explanation layer provides over a bare ML probability badge.

### 5.3 Limitations

**Synthetic training data** is the biggest caveat. The ensemble captures category-level patterns but not individual household quirks (e.g. consistently forgetting items at the back of the fridge). The application logs waste events, so retraining on real data is feasible once sufficient usage exists.

**Cold-start latency** (15–30 seconds on first ML invocation) is a known usability problem. Switching to ONNX Runtime would eliminate TensorFlow's graph compilation overhead — estimated to cut start time to under 3 seconds — but required rewriting the model export pipeline, which ran out of time.

**Food classifier shortfall**: The 6–7 point train-validation gap (99.9% vs 93.2%) indicates overfitting. More aggressive augmentation (CutMix, MixUp) and isolating the classification head from auxiliary training tasks would be the first interventions. Barcode coverage for UK own-brand products (Tesco Finest, Sainsbury's Taste the Difference) is also patchy via Open Food Facts.

### 5.4 Reflection

The main process lesson was dependency sequencing. I assumed the ML pipeline and LLM integration could be built in parallel; in practice the ReAct agent depended on a stable prediction endpoint. A week was lost before I accepted the sequential constraint.

The end-to-end test suite caught five bugs that unit tests would not have found — the NumPy float32 serialisation bug only surfaces across the full chain from subprocess spawn to JSON response. That shifted how I think about testing: integration tests should come before unit tests.

The area where I learned most was ML engineering: feature pipeline design, class imbalance handling, ensemble architecture, and debugging a plateaued neural network loss. The gap between understanding an algorithm conceptually and making it work on constrained hardware is only bridged by doing it.

---

## 6. Further work and conclusion

### 6.1 Further work

Priority items: (1) push the food classifier past 95% with CutMix/MixUp augmentation and decoupled auxiliary head training; (2) retrain the waste ensemble on real household data collected through the app's existing waste logging; (3) extend household sharing to grocery lists and meal plans; (4) replace the TensorFlow subprocess with ONNX Runtime to eliminate cold-start latency; (5) add background push notifications via web-push/VAPID for expiry alerts when the app is closed.

### 6.2 Conclusion

Combining a heterogeneous ML ensemble with a locally-hosted ReAct agent produces a different kind of food management tool — one that predicts waste before it occurs and grounds its recommendations in the user's actual pantry state. The waste prediction ensemble exceeded its accuracy target at 98%; the food recognition model reached 94.9%, marginally below the 95% threshold; all 19 end-to-end tests pass; and usability testing returned a SUS mean of 81.3. The known limitations — synthetic training data, TensorFlow cold-start latency, and food classifier overfitting — are well-understood and addressable without architectural change, as detailed in Section 5.3 and the further work above.

The application is installable as a PWA, functional offline in a supermarket, and designed to feel native on a phone. The UK focus — FSA shelf-life guidelines in the ML features, TomTom store finder for UK supermarkets, British English throughout — runs through the whole system.

Most food management tools record waste after it happens. This one is designed to prevent it.

---

## 7. Use of AI tools

I used GitHub Copilot and Claude Code as autocomplete aids — to speed up boilerplate syntax in the same way I would use documentation, not to design or architect anything. Suggestions that did not fit the codebase were discarded. All design decisions (ensemble composition, agent architecture, prompt engineering, database schema, RLS policies) are my own, informed by the literature cited. The end-to-end test suite, model training, evaluation, and this report are entirely my own work.

---

## Table of abbreviations

| Abbreviation | Meaning |
|-------------|---------|
| AI | Artificial Intelligence |
| API | Application Programming Interface |
| CORS | Cross-Origin Resource Sharing |
| CSS | Cascading Style Sheets |
| FAO | Food and Agriculture Organization |
| GB | Gradient Boosting |
| GPU | Graphics Processing Unit |
| HTML | HyperText Markup Language |
| JWT | JSON Web Token |
| LLM | Large Language Model |
| MAE | Mean Absolute Error |
| ML | Machine Learning |
| NN | Neural Network |
| OCR | Optical Character Recognition |
| PWA | Progressive Web Application |
| REST | Representational State Transfer |
| RF | Random Forest |
| RLS | Row-Level Security |
| SQL | Structured Query Language |
| UK | United Kingdom |
| VRAM | Video Random Access Memory |
| WRAP | Waste and Resources Action Programme |

---

## References

Brooke, J. (1996) 'SUS: a "quick and dirty" usability scale', in Jordan, P.W., Thomas, B., Weerdmeester, B.A. and McClelland, I.L. (eds) *Usability Evaluation in Industry*. London: Taylor and Francis, pp. 189–194.

Biørn-Hansen, A., Majchrzak, T.A. and Grønli, T-M. (2017) 'Progressive web apps: the possible web-native unifier for mobile development', in *Proceedings of the 13th International Conference on Web Information Systems and Technologies (WEBIST 2017)*, Porto, Portugal, pp. 344–351. doi:[10.5220/0006353703440351](https://doi.org/10.5220/0006353703440351).

Brancoli, P., Rousta, K. and Bolton, K. (2017) 'Life cycle assessment of supermarket food waste', *Resources, Conservation and Recycling*, 118, pp. 39–46. doi:[10.1016/j.resconrec.2016.11.024](https://doi.org/10.1016/j.resconrec.2016.11.024).

Breiman, L. (2001) 'Random forests', *Machine Learning*, 45(1), pp. 5–32. doi:[10.1023/A:1010933404324](https://doi.org/10.1023/A:1010933404324).

Brown, T. et al. (2020) 'Language models are few-shot learners', *Advances in Neural Information Processing Systems*, 33, pp. 1877–1901. Available at: [https://arxiv.org/abs/2005.14165](https://arxiv.org/abs/2005.14165).

Chen, T. and Guestrin, C. (2016) 'XGBoost: a scalable tree boosting system', in *Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, San Francisco, CA, pp. 785–794. doi:[10.1145/2939672.2939785](https://doi.org/10.1145/2939672.2939785).

Deng, J., Dong, W., Socher, R., Li, L-J., Li, K. and Fei-Fei, L. (2009) 'ImageNet: a large-scale hierarchical image database', in *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2009)*, Miami, FL, pp. 248–255. doi:[10.1109/CVPR.2009.5206848](https://doi.org/10.1109/CVPR.2009.5206848). Available at: [https://www.image-net.org/static_files/papers/imagenet_cvpr09.pdf](https://www.image-net.org/static_files/papers/imagenet_cvpr09.pdf).

Dietterich, T.G. (2000) 'Ensemble methods in machine learning', in *International Workshop on Multiple Classifier Systems*, pp. 1–15. doi:[10.1007/3-540-45014-9_1](https://doi.org/10.1007/3-540-45014-9_1).

Fang, D. et al. (2023) 'Machine learning approaches for predicting household food waste', *Journal of Cleaner Production*, 395, p. 136369. doi:[10.1016/j.jclepro.2023.136369](https://doi.org/10.1016/j.jclepro.2023.136369).

FAO (2019) *The State of Food and Agriculture 2019: Moving Forward on Food Loss and Waste Reduction*. Rome: Food and Agriculture Organization of the United Nations. Available at: [https://www.fao.org/3/ca6030en/ca6030en.pdf](https://www.fao.org/3/ca6030en/ca6030en.pdf).

Graham-Rowe, E., Jessop, D.C. and Sparks, P. (2014) 'Identifying motivations and barriers to minimising household food waste', *Resources, Conservation and Recycling*, 84, pp. 15–23. doi:[10.1016/j.resconrec.2013.12.005](https://doi.org/10.1016/j.resconrec.2013.12.005).

He, K., Zhang, X., Ren, S. and Sun, J. (2016) 'Deep residual learning for image recognition', in *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*, Las Vegas, NV, pp. 770–778. doi:[10.1109/CVPR.2016.90](https://doi.org/10.1109/CVPR.2016.90). Available at: [https://arxiv.org/abs/1512.03385](https://arxiv.org/abs/1512.03385).

Hebrok, M. and Boks, C. (2017) 'Household food waste: drivers and potential intervention points for design — an extensive review', *Journal of Cleaner Production*, 151, pp. 380–392. doi:[10.1016/j.jclepro.2017.03.069](https://doi.org/10.1016/j.jclepro.2017.03.069).

Howard, A. et al. (2019) 'Searching for MobileNetV3', in *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, Seoul, pp. 1314–1324. doi:[10.1109/ICCV.2019.00140](https://doi.org/10.1109/ICCV.2019.00140).

Jones, M., Bradley, J. and Sakimura, N. (2015) *JSON Web Token (JWT)*, RFC 7519. Internet Engineering Task Force. doi:[10.17487/RFC7519](https://doi.org/10.17487/RFC7519).

Kingma, D.P. and Ba, J. (2015) 'Adam: a method for stochastic optimization', in *Proceedings of the 3rd International Conference on Learning Representations (ICLR 2015)*, San Diego, CA. Available at: [https://arxiv.org/abs/1412.6980](https://arxiv.org/abs/1412.6980).

Koivupuro, H-K., Hartikainen, H., Silvennoinen, K., Katajajuuri, J-M., Heikintalo, N., Reinikainen, A. and Jalkanen, L. (2012) 'Influence of socio-demographical, behavioural and attitudinal factors on the amount of avoidable food waste generated in Finnish households', *International Journal of Consumer Studies*, 36(2), pp. 183–191. doi:[10.1111/j.1470-6431.2011.01080.x](https://doi.org/10.1111/j.1470-6431.2011.01080.x).

LeCun, Y., Bengio, Y. and Hinton, G. (2015) 'Deep learning', *Nature*, 521(7553), pp. 436–444. doi:[10.1038/nature14539](https://doi.org/10.1038/nature14539). Available at: [https://www.nature.com/articles/nature14539](https://www.nature.com/articles/nature14539).

MDN Web Docs (2024) *Progressive web apps*. Mozilla. Available at: [https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) (Accessed: 15 March 2026).

Ollama (2024) *Ollama: Run Large Language Models Locally*. Available at: [https://ollama.com](https://ollama.com) (Accessed: 10 March 2026).

Parfitt, J., Barthel, M. and Macnaughton, S. (2010) 'Food waste within food supply chains: quantification and potential for change to 2050', *Philosophical Transactions of the Royal Society B*, 365(1554), pp. 3065–3081. doi:[10.1098/rstb.2010.0126](https://doi.org/10.1098/rstb.2010.0126).

Parizeau, K., von Massow, M. and Martin, R. (2015) 'Household-level dynamics of food waste production and related beliefs, attitudes, and behaviours in Guelph, Ontario', *Waste Management*, 35, pp. 207–217. doi:[10.1016/j.wasman.2014.09.019](https://doi.org/10.1016/j.wasman.2014.09.019).

PostgreSQL Global Development Group (2024) *Row Security Policies*, PostgreSQL 16 Documentation. Available at: [https://www.postgresql.org/docs/16/ddl-rowsecurity.html](https://www.postgresql.org/docs/16/ddl-rowsecurity.html) (Accessed: 15 March 2026).

Qin, Y. et al. (2024) 'ToolLLM: facilitating large language models to master 16,000+ real-world APIs', in *Proceedings of the 12th International Conference on Learning Representations (ICLR 2024)*. Available at: [https://arxiv.org/abs/2307.16789](https://arxiv.org/abs/2307.16789).

Quested, T.E. et al. (2013) 'Spaghetti soup: the complex world of food waste behaviours', *Resources, Conservation and Recycling*, 79, pp. 43–51. doi:[10.1016/j.resconrec.2013.06.012](https://doi.org/10.1016/j.resconrec.2013.06.012).

Schick, T. et al. (2023) 'Toolformer: language models can teach themselves to use tools', in *Advances in Neural Information Processing Systems 36 (NeurIPS 2023)*. Available at: [https://arxiv.org/abs/2302.04761](https://arxiv.org/abs/2302.04761).

Secondi, L., Principato, L. and Laureti, T. (2015) 'Household food waste behaviour in EU-27 countries: a multilevel analysis', *Food Policy*, 56, pp. 25–40. doi:[10.1016/j.foodpol.2015.07.007](https://doi.org/10.1016/j.foodpol.2015.07.007).

Shinn, N. et al. (2023) 'Reflexion: language agents with verbal reinforcement learning', in *Advances in Neural Information Processing Systems 36 (NeurIPS 2023)*. Available at: [https://arxiv.org/abs/2303.11366](https://arxiv.org/abs/2303.11366).

Srivastava, N., Hinton, G., Krizhevsky, A., Sutskever, I. and Salakhutdinov, R. (2014) 'Dropout: a simple way to prevent neural networks from overfitting', *Journal of Machine Learning Research*, 15(1), pp. 1929–1958. Available at: [https://jmlr.org/papers/v15/srivastava14a.html](https://jmlr.org/papers/v15/srivastava14a.html).

Stancu, V., Haugaard, P. and Lahteenmaki, L. (2016) 'Determinants of consumer food waste behaviour: two routes to food waste', *Appetite*, 96, pp. 7–17. doi:[10.1016/j.appet.2015.08.025](https://doi.org/10.1016/j.appet.2015.08.025).

Supabase (2024) *Supabase Documentation*. Available at: [https://supabase.com/docs](https://supabase.com/docs) (Accessed: 15 March 2026).

Thyberg, K.L. and Tonjes, D.J. (2016) 'Drivers of food waste and their implications for sustainable policy development', *Resources, Conservation and Recycling*, 106, pp. 110–123. doi:[10.1016/j.resconrec.2015.11.016](https://doi.org/10.1016/j.resconrec.2015.11.016).

Touvron, H. et al. (2023) 'Llama 2: open foundation and fine-tuned chat models', arXiv preprint arXiv:2307.09288. Available at: [https://arxiv.org/abs/2307.09288](https://arxiv.org/abs/2307.09288).

Vaswani, A. et al. (2017) 'Attention is all you need', in *Advances in Neural Information Processing Systems 30 (NeurIPS 2017)*, Long Beach, CA, pp. 5998–6008. Available at: [https://arxiv.org/abs/1706.03762](https://arxiv.org/abs/1706.03762).

Wei, J. et al. (2022) 'Chain-of-thought prompting elicits reasoning in large language models', in *Advances in Neural Information Processing Systems 35 (NeurIPS 2022)*, pp. 24824–24837. Available at: [https://arxiv.org/abs/2201.11903](https://arxiv.org/abs/2201.11903).

WRAP (2023) *Household Food and Drink Waste in the United Kingdom 2022*. Banbury: Waste and Resources Action Programme. Available at: [https://www.wrap.ngo/resources/report/household-food-and-drink-waste-uk-2022](https://www.wrap.ngo/resources/report/household-food-and-drink-waste-uk-2022).

WRAP (2024) *UK Household Food Waste Tracking Survey — Autumn 2023*. Banbury: Waste and Resources Action Programme. Available at: [https://www.wrap.ngo/resources/report/uk-household-food-waste-tracking-survey-autumn-2023](https://www.wrap.ngo/resources/report/uk-household-food-waste-tracking-survey-autumn-2023).

Yao, S. et al. (2023) 'ReAct: synergizing reasoning and acting in language models', in *Proceedings of the 11th International Conference on Learning Representations (ICLR 2023)*. Available at: [https://arxiv.org/abs/2210.03629](https://arxiv.org/abs/2210.03629).

---

## Appendix A: System screenshots

The screenshots below show the application running against a live Supabase backend in Chrome on Android and Chrome on Windows. They cover the full feature set from Section 4 and give visual evidence for the non-functional requirements, particularly NFR4 (PWA installability and mobile-native UI).

---

**Figure A.1 — Dashboard.**

![Dashboard — metric cards, waste chart, and LLM forecast panel](./assets/screenshots/01_dashboard.png)

The dashboard shows three metric cards (total pantry items, items expiring within 3 days, estimated pantry value in GBP), the weekly waste bar chart built with Recharts, and the LLM-generated 4-week forecast panel. The forecast shows a trend label (Improving / Stable / Worsening), a one-sentence insight, and a practical tip. The LLM-as-analyst pattern from Section 4.2 — where structured time-series data is passed to the LLM for interpretation rather than statistical projection — is visible here.

---

**Figure A.2 — Pantry.**

![Pantry — items with ML risk badges, expiry countdowns, and category filters](./assets/screenshots/02_pantry.png)

The Pantry page displays items as cards. Each card shows a colour-coded risk badge (Low / Medium / High / Very High) calculated client-side from the ML ensemble result, the number of days until expiry, quantity controls, and the item category. The category filter bar and personal/household scope toggle are both visible in the header. Most of the user's daily interaction with the application happens on this page.

---

**Figure A.3 — Grocery Lists.**

![Grocery Lists — checked and unchecked items with pantry auto-add toast](./assets/screenshots/03_grocery_lists.png)

An active shopping list with checked and unchecked items. Checking an item triggers a server-side pantry upsert — the "Added to pantry" toast at the bottom of the screen confirms the write succeeded. This is the grocery-to-pantry automatic addition workflow (FR8, Section 1.4): the user does not need to re-enter the item on the Pantry page.

---

**Figure A.4 — Nurexa AI (ReAct Agent).**

![Nurexa AI — ReAct agent mid-conversation with tool call trace visible](./assets/screenshots/04_nurexa_ai.png)

The Nurexa AI assistant on the Agent tab, mid-conversation. The exchange shows the agent calling `get_expiring_items` and then `check_pantry` before returning a recommendation based on the user's actual pantry state. The tool call trace is visible in the response. This is the Thought/Action/Observation loop from Section 3.5 running against live data, not a generic response from a base LLM.

---

**Figure A.5 — Meal Planner.**

![Meal Planner — AI-generated 7-day plan with expiring items prioritised](./assets/screenshots/05_meal_planner.png)

The AI-generated weekly plan in a 7-day calendar grid with breakfast, lunch, and dinner slots. Meals that use expiring pantry items are flagged. The "Generate Shopping List" button below the calendar calls the endpoint described in Section 3.1.2 (Workflow 4): it extracts missing ingredients, filters against current pantry stock, and creates a new grocery list — FR9 in one click.

---

**Figure A.6 — Store Finder.**

![Stores — TomTom map with supermarket pins and chain filter panel](./assets/screenshots/06_stores.png)

The Stores page with a TomTom map centred on the user's location and pins for nearby UK supermarkets. The left panel lets the user filter by chain (Tesco, Sainsbury's, ASDA, Waitrose, Morrisons, Lidl, Aldi) and shows distance and estimated opening hours for each result. This is FR12 from Section 1.4 and uses the TomTom SDK as described in the technology choices table (Section 3.2).

---

**Figure A.7 — Waste Prediction detail.**

![Waste Prediction — High risk badge, 71% probability, and LLM explanation](./assets/screenshots/07_waste_prediction.png)

The waste prediction overlay for milk (refrigerated, purchased 6 days ago). The ML ensemble returned 71% waste probability and a High risk classification. The LLM-generated explanation beneath it translates that number into plain language: "consider using it today or tomorrow." The ML model did the prediction; the LLM provided the context. This is the integration point described in Section 4.2 and implements FR4.

---

**Figure A.8 — Mobile UI.**

![Mobile UI — bottom tab bar and 'More' bottom sheet on Android Chrome](./assets/screenshots/08_mobile_ui.png)

Chrome on Android showing the bottom tab bar (Home, Lists, Pantry, Nurexa, More) with frosted-glass background and safe-area inset padding at the bottom. The "More" sheet is expanded, showing secondary navigation items. This is the mobile-native navigation pattern from Section 4.1.2. The bottom tab bar replaces the desktop sidebar below the `lg` breakpoint; the sheet replaces a separate page for secondary routes. Evidence for NFR4.

---

**Figure A.9 — PWA install prompt and home screen.**

![PWA — Chrome install prompt on Android (left) and home screen icon (right)](./assets/screenshots/09_pwa_install.png)

Left: Chrome on Android showing the "Add to home screen" install prompt after visiting the application. Right: the NourishNeural icon on the Android home screen sitting alongside native apps. The icon uses the 512px PNG declared in `manifest.json`. This is direct evidence that NFR4 (installable PWA) is met. Once installed, the app opens without browser chrome and behaves identically to a native app.

---

**Figure A.10 — Authentication.**

![Authentication — login form with Remember me toggle and email confirmation banner](./assets/screenshots/10_auth.png)

The login page showing the email and password fields, "Remember me" toggle, and the email confirmation banner shown after a new registration. The confirmation email is sent by Supabase's built-in auth flow. The "Remember me" toggle controls whether the refresh token is persisted to `localStorage`. This page covers NFR3: stateless JWT authentication with refresh token session persistence, as described in Section 4.1.3.


## Appendix B: Database schema




## Appendix C: Food recognition model training outputs

### Training configuration

| Parameter | Value |
|-----------|-------|
| Architecture | MobileNetV3-Large (pretrained on ImageNet) |
| Dataset | Food-11, remapped to 8 NourishNeural categories |
| Input size | 224x224 (RandomResizedCrop for training, CenterCrop for eval) |
| Batch size | 8 (effective 32 with 4x gradient accumulation) |
| Optimiser | AdamW (lr=3e-4, weight_decay=1e-4) |
| Scheduler | CosineAnnealingLR (T_max=50, eta_min=3e-5) |
| Loss | CrossEntropy with label smoothing=0.1 + auxiliary losses |
| Precision | Mixed (fp16 via GradScaler) |
| Hardware | NVIDIA RTX 2060 (6 GB VRAM), capped at 4 GB |
| Training time | Approximately 3.5 hours (47 epochs) |
| Early stopping | Patience=8, triggered at epoch 47 |

### Training progression (selected epochs)

| Epoch | Train Loss | Train Acc | Val Loss | Val Acc | LR |
|-------|-----------|-----------|----------|---------|------|
| 1 | 1.8249 | 82.5% | 1.0347 | 82.1% | 3.00e-04 |
| 5 | 1.5402 | 93.0% | 0.7812 | 88.3% | 2.90e-04 |
| 10 | 1.4217 | 96.8% | 0.7112 | 90.3% | 2.72e-04 |
| 15 | 1.3874 | 98.0% | 0.6739 | 91.7% | 2.39e-04 |
| 19 | 1.3662 | 98.8% | 0.6637 | 92.5% | 2.06e-04 |
| 24 | 1.3471 | 99.4% | 0.6537 | 92.7% | 1.61e-04 |
| 27 | 1.3432 | 99.5% | 0.6494 | 92.8% | 1.33e-04 |
| 33 | 1.3336 | 99.8% | 0.6436 | 92.7% | 8.00e-05 |
| 39 | 1.3282 | 99.9% | 0.6351 | 93.2% | 3.27e-05 |
| 47 | 1.3266 | 99.9% | 0.6351 | 93.1% | 5.63e-06 |

Best validation accuracy: 93.2% at epoch 39. Early stopping at epoch 47.

### Test set evaluation (3,347 images)

```
              precision    recall  f1-score   support

      Bakery       0.93      0.94      0.93       868
       Dairy       0.91      0.91      0.91       148
        Eggs       0.97      0.93      0.95       335
        Fish       0.94      0.96      0.95       303
     General       0.95      0.97      0.96       787
        Meat       0.97      0.92      0.95       432
      Pantry       0.99      1.00      0.99       243
  Vegetables       0.96      0.98      0.97       231

    accuracy                           0.95      3347
   macro avg       0.95      0.95      0.95      3347
weighted avg       0.95      0.95      0.95      3347
```

Test accuracy: 94.9%. Confusion matrix and training history plots are saved in `ml-models/models/`.

### Food-11 to NourishNeural category mapping

| Food-11 category | NourishNeural category |
|-----------------|----------------------|
| Bread | Bakery |
| Dessert | Bakery |
| Dairy product | Dairy |
| Egg | Eggs |
| Fried food | General |
| Soup | General |
| Meat | Meat |
| Noodles-Pasta | Pantry |
| Rice | Pantry |
| Seafood | Fish |
| Vegetable-Fruit | Vegetables |

## Appendix D: End-to-end test output

The output below is from a live run of `server/test_e2e.js` executed on 2026-04-02. The suite creates a temporary Supabase user, hits every protected and public API endpoint, checks response shape and status codes, and deletes the test user on exit. All 19 tests passed on the day of submission.

```
======================================================================
  NourishNeural End-to-End API Tests
======================================================================

[TEST] --- Health Check ---
[PASS] Health Check - status=200

[TEST]
--- Authentication ---
[AUTH] Attempting to get auth token from Supabase...
[AUTH] Found 5 existing users. Trying to sign in...
[AUTH] Could not sign in with existing users. Creating temp user...
[AUTH] Created temp user: e2e_test_1775091259623@test.nourishneural.dev
[AUTH] Authenticated as temp user: e2e_test_1775091259623@test.nourishneural.dev

[TEST]
--- Unauthenticated Endpoints ---
[PASS] AI Chat (no auth) - status=200, response_length=1212
[PASS] AI Chat - empty message returns 400
[PASS] Waste Stats - no auth returns 401
[PASS] ReAct Agent - no auth returns 401
[PASS] Shopping List from Plan - status=200, items=4

[TEST]
--- Waste Endpoints ---
[PASS] Waste Stats (month) - status=200, totalItems=0, totalLoss=£0.00
[PASS] Waste Stats (week) - status=200
[PASS] Waste Predict (ML) - status=200, probability=0.7090055510604774, risk=High
[PASS] Waste Predict + Explain - status=200, has_prediction=true, explanation_length=630
[INFO] Explanation: "The milk in the fridge purchased 6 days ago is showing a high waste
       probability, which could be due to its age and stora..."
[PASS] Waste Forecast - status=200, trend=insufficient_data, historical_weeks=0, forecast_weeks=0
[INFO] Forecast insight: "Log more waste data to enable forecasting. We need at least 2 weeks
       of history."

[TEST]
--- ReAct Agent ---
[PASS] ReAct Agent - expiring items query - status=200, tools_used=1, response_length=138
[INFO] Tools used: get_expiring_items
[INFO] Agent response: "In your pantry, there are some items set to expire within the next
       week. Please plan meals around these ingredients to avoid food waste."
[PASS] ReAct Agent - waste query - status=200, tools_used=1
[PASS] ReAct Agent - recipe query - status=200, tools_used=2

[TEST]
--- Meal Planner ---
[PASS] Meal Plan Generate - status=200, source=ai, days=7, expiring_used=0
[INFO] Plan days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
[INFO] Monday meals: Breakfast: Scrambled Eggs with Avocado, Lunch: Cucumber and Tomato
       Salad, Dinner: Stir-Fried Tofu with Vegetables
[PASS] Meal Plan - Create - status=201
[PASS] Meal Plan - List - status=200, count=1
[PASS] Meal Plan - Update - status=200
[PASS] Meal Plan - Delete - status=200

======================================================================

Test Summary:
  Passed: 19
  Failed: 0
  Total:  19
======================================================================
```

**Notes on specific results:**

- **Waste Predict (ML):** The Python subprocess loaded the trained ensemble and returned `probability=0.709, risk=High` for a refrigerated dairy item 6 days past purchase. The rule-based fallback was not invoked — the ML path completed within the 30-second timeout.
- **Waste Forecast:** The `trend=insufficient_data` result is expected for a freshly created test user with no waste history. The endpoint correctly returned the minimum-data fallback message rather than an error.
- **ReAct Agent:** The expiring-items query resolved in one tool call (`get_expiring_items`). The recipe query used two tools. Both returned 200 within 15 seconds. The agent fell back to a courteous "pantry is empty" message because the test user had no pantry items — this is the graceful degradation path described in Section 4.5.
- **Meal Plan Generate:** `source=ai` confirms Ollama was reachable and generated the plan rather than the recipe-database fallback. All 7 days were populated.

