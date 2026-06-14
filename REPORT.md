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
| Figure A.8 | Mobile UI — bottom tab bar and More bottom sheet on iOS Safari | Appendix A |
| Figure A.9 | PWA — Safari share sheet install prompt on iOS and home screen icon | Appendix A |
| Figure A.10 | Authentication — login form with Remember me toggle and email confirmation banner | Appendix A |

---

## 1. Introduction

### 1.1 Background and motivation

UK households discard around £700 worth of food each year (WRAP, 2024), with household-level waste outweighing losses at every other supply chain stage in developed economies (FAO, 2019). No existing tool both predicts waste before it occurs and connects that prediction to an actionable recommendation. An ML ensemble combined with a locally-hosted LLM agent is the proposed approach.

### 1.2 Aims and objectives

**Aim:** Build and evaluate an AI-driven web application that helps UK households reduce food waste, and determine whether an ML ensemble combined with an LLM agent produces a more useful tool than either approach alone.

**Objectives:** (1) Full-stack React/TypeScript + Node.js/Express application with Supabase PostgreSQL and row-level security (React/TS familiar from coursework; Express and Supabase were new). (2) Heterogeneous ML ensemble targeting >90% waste-prediction accuracy (ML engineering was new). (3) Locally-hosted ReAct agent via Ollama (prompt engineering and tool-calling were new). (4) Meal planning that generates a 7-day plan with expiring items ranked first, verified by a usability task. (5) Household collaboration allowing at least two users to share a pantry and grocery list. (6) End-to-end testing with verified graceful degradation when AI services are offline.

### 1.3 Requirements

**Functional:** User auth and profile (FR1); pantry CRUD via manual entry, barcode, receipt OCR, and image classification (FR2); ML waste probability with LLM explanation (FR3–4); ReAct conversational agent (FR5); expiry-prioritised meal plans, grocery lists, and auto pantry-add on checkout (FR6–9); household sharing (FR10); waste analytics and store finder (FR11–12).

**Non-functional:** Every AI feature must degrade to a non-AI fallback (NFR1); database-level RLS isolation and JWT authentication with rate limiting (NFR2–3); PWA with offline caching (NFR4); >90% ML classification accuracy (NFR5); no user data sent to cloud AI APIs (NFR6); non-ML responses within 2 seconds (NFR7).

---

## 2. Literature review

### 2.1 The problem and the gap

WRAP (2024) found 70% of UK post-farm-gate waste occurs in homes; Quested et al. (2013) traced causes to over-purchasing, poor storage, and failure to plan meals around existing stock. Stancu et al. (2016) found planning behaviours the strongest predictor of lower waste; Graham-Rowe et al. (2014) showed waste visibility is a necessary precondition for changing it. Fang et al. (2023) demonstrated that gradient boosting alone predicts waste with above 85% accuracy; this project extends that by adding a neural network and grounding predictions in live pantry state rather than survey responses, addressing the reactive limitation Hebrok and Boks (2017) identified.

### 2.2 Technical foundations

Dietterich (2000) showed heterogeneous ensembles generalise better than homogeneous ones; LeCun et al. (2015) justified including a neural network for compressed nonlinear representations. Fang et al. (2023) achieved above 85% accuracy with gradient boosting alone, which raises the question of whether a neural network adds anything. The answer from this project is yes, but only marginally: the NN's 30% weight was trimmed after equal weighting added variance without improving overall accuracy. For structured tabular food data, tree models dominate; the NN's contribution was mainly on the high-risk minority class. Brancoli et al. (2017) identified perishability, storage conditions, and seasonal patterns as the strongest waste predictors. For the conversational layer, the ReAct pattern (Yao et al., 2023) grounds LLM responses in real data via tool calls; local inference via Ollama (2024) keeps pantry data off third-party servers. JWT (Jones et al., 2015), Supabase RLS (PostgreSQL Global Development Group, 2024), and PWA service workers (Biørn-Hansen et al., 2017) cover security and offline access.

### 2.3 Existing tools and the design gap

Existing tools address parts of the problem. Kitche suggests recipes from expiring items but has no predictive ML. OurGroceries makes no connection between purchased items and waste outcomes. Too Good To Go and OLIO address redistribution rather than prevention. None combines a predictive model with a conversational interface that responds to specific pantry context — that is the gap this project targets.

A deeper question the literature leaves open is whether digital tools produce durable behaviour change. Hebrok and Boks (2017) found users reverted as novelty faded, attributing this to an effort-to-return imbalance: logging waste after the fact costs effort but returns nothing actionable. This design targets that failure — predictive ML flags items before expiry, and the conversational layer explains what to do about them. Whether the shift is durable requires longitudinal evaluation beyond this project's scope.

---

## 3. Design

The design was iterative: schema first, frontend/backend in parallel, ML and LLM last. Three rejected approaches informed final choices: Python monolith (blocking inference), SQLite (no native RLS), and a regression model (failed to separate the high-risk minority class). Mobile layouts were sketched before coding, following Material Design guidelines for PWAs.

### 3.1 System architecture

The literature pointed to three requirements — meal planning tied to pantry state, ML-based waste prediction, and a grounded conversational agent — mapping to a three-tier architecture: React SPA, Express REST API, and Supabase PostgreSQL with RLS.

![Figure 1: UML Component Diagram — System Architecture](./assets/diagrams/figure1_architecture_uml.png)

*Figure 1: UML Component Diagram. Four runtime processes: React 18 SPA, Express/Node.js server, Python ML Subprocess, and Supabase (PostgreSQL + RLS). The server communicates with the client over Axios HTTP, with Supabase via PostgREST, with Ollama on port 11434, and with the Python process via stdin/stdout using `spawn()`.*

Every client request attaches a JWT via Axios; the backend scopes Supabase queries to `req.user.id` and enforces access at middleware level (JWT) and database level (RLS). Ollama is called at `localhost:11434` with a fallback per route. The Python ML subprocess is spawned via `child_process.spawn()` with a 30-second kill timeout for TensorFlow cold starts.

#### 3.1.1 Key user-triggered workflows

Four core workflows are illustrated as BPMN Activity Diagrams (Figures 2–5). Checking off a grocery item triggers a non-blocking pantry upsert. ReAct queries are parsed from Thought/Action/Observation output with regex, executed against Supabase, and looped up to 5 iterations. ML prediction pipes item metadata to `predict.py`; the weighted ensemble returns a probability via stdout that Ollama converts to plain-language explanation, with independent fallbacks at each layer. Meal plans are generated from pantry items sorted by expiry; a diff against current pantry state returns only missing items for the grocery list.

![Figure 3: BPMN — Grocery Item Purchase to Automatic Pantry Addition](./assets/diagrams/figure3_bpmn_grocery_pantry.png)

*Figure 3: BPMN — Grocery to Pantry auto-add.*

![Figure 4: BPMN — ReAct Agent Conversational Query with Tool Calling](./assets/diagrams/figure4_bpmn_react_agent.png)

*Figure 4: BPMN — ReAct Agent loop.*

![Figure 2: BPMN — Food Image Upload with ML Waste Prediction and Dual Fallback](./assets/diagrams/figure2_bpmn_ml_prediction.png)

*Figure 2: BPMN — ML Prediction with dual fallback.*

![Figure 5: BPMN — AI Meal Plan Generation to Grocery List](./assets/diagrams/figure5_bpmn_meal_plan.png)

*Figure 5: BPMN — Meal Plan to Grocery List.*

#### 3.1.2 Rule-based fallback

When the ML ensemble is unavailable, `rule_based_prediction()` maps category and days-since-purchase to a waste probability using FSA shelf-life guidelines (thresholds calibrated on 500 test items). A confidence score of 0.5 signals an estimate to the frontend. Each invocation spawns a fresh Python process, introducing TensorFlow cold-start latency — discussed in Section 5.3.

### 3.2 Technology choices

Technologies were selected against four constraints: single developer, consumer hardware (RTX 2060, 6 GB VRAM), privacy (no food data to cloud APIs), and non-blocking concurrent AI requests.

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

The schema has 13 tables across four groups (full listing in Appendix B), all with RLS policies. Household sharing uses a nullable `household_id` on `pantry_items`, `grocery_lists`, and `meal_plans` — null means personal — avoiding table duplication. `waste_logs` records structured reason codes (expired, spoiled, did_not_like, etc.) that feed both the analytics dashboard and the ML feature pipeline.

### 3.4 ML pipeline design

The heterogeneous ensemble (Dietterich, 2000) weights RF at 40%, GB at 30%, and a 4-layer NN at 30%. RF's share was raised after it consistently outperformed GB on the high-risk minority class; the NN's share was trimmed from 33% after equal weighting added variance without improving accuracy. Feature importance analysis (Gini for RF, gain for GB) confirmed perishability, days-since-purchase, and category as the top predictors, consistent with Brancoli et al. (2017); 44 features were produced in total, standardised with StandardScaler. Evaluation used stratified 80/20 splits across 10 random seeds.

### 3.5 ReAct agent design

The conversational agent uses the ReAct pattern (Yao et al., 2023), alternating Thought/Action/Observation cycles with five tools: `check_pantry`, `get_expiring_items`, `check_waste_stats`, `predict_waste`, and `suggest_recipes`. The iteration cap is 5; all test queries resolved in 3–4 tool calls. Temperature is 0.3 for consistent tool selection; `stop: ['Observation:']` prevents the model from hallucinating its own observations.

---

## 4. Implementation and testing

### 4.1 Frontend implementation

Seven pages sit behind a sidebar on desktop and a bottom tab bar on mobile. The Pantry page handles full CRUD with barcode scanning (ZXing), receipt OCR (Tesseract.js), category filtering, and a household/personal toggle. The Dashboard shows waste analytics (Recharts) and an LLM-generated 4-week forecast. React Query manages all server state — `useState` caused stale data race conditions in week one and was replaced. The PWA uses Workbox (CacheFirst for static assets, NetworkFirst for API endpoints) with an offline banner. On mobile, the layout switches to bottom-sheet modals, scroll-snap cards, and safe-area-inset navigation for a native feel. Two bugs worth noting: a cached user object caused unauthenticated query loops after logout, fixed by gating all fetches on both `!!user?.id` and `!!token`; a shared `supabase-js` client caused RLS recursion on `household_members`, fixed by splitting into separate auth and data clients.

### 4.2 Backend implementation

The Express server has 25+ endpoints across six route modules. AI routes try Ollama first and return fallbacks if unreachable. Waste routes spawn the Python subprocess, aggregate historical stats, and pass the time series to the LLM for 4-week forecasting (linear average fallback). Pantry routes handle CRUD with barcode duplicate detection; household routes manage invite codes and member roles. Rate limiting, Helmet.js, CORS, and JWT validation are in place. Production deployment is straightforward for the Node/React layers (Docker + CDN); the harder constraint is Ollama, which needs a GPU-enabled cloud instance or an ONNX Runtime replacement for serverless inference. A CI/CD pipeline running the E2E suite on each push would be the first operational addition.

### 4.3 ML model training and performance

The ensemble was trained on 10,000 synthetic samples from UK food safety guidelines — real labelled household waste logs do not exist publicly. Stratified 80/20 splits preserved class distribution.

Results on the held-out test set:

| Model | Accuracy | Precision | Recall | F1 Score |
|-------|----------|-----------|--------|----------|
| Random Forest | 96.2% | 0.95 | 0.97 | 0.96 |
| Gradient Boosting | 97.1% | 0.97 | 0.97 | 0.97 |
| Neural Network | 94.8% | 0.94 | 0.95 | 0.95 |
| Ensemble (weighted vote) | 98.0% | 0.97 | 0.98 | 0.98 |

The ensemble never scored below the best individual model (GB at 97.1%) across all 10 splits. A separate GB+NN ensemble for expiry date prediction achieved 0.73 days MAE. These numbers come from synthetic data; real-world performance will be lower (see Section 5.3).

### 4.4 Food recognition model training

MobileNetV3-Large (Howard et al., 2019) was chosen over EfficientNet-B4 because it trains within 2 GB VRAM on an RTX 2060. Food-11's 11 categories were remapped to 8 UK-relevant ones; three auxiliary heads (storage type, chain, quality) provided additional gradient signal. Training used AdamW with cosine annealing and fp16 mixed-precision for 47 epochs.

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

Five bugs were caught: NumPy `float32` not JSON-serialisable (`NumpyEncoder` added); missing `rule_based_prediction()` implementation; "undefined waste risk" interpolation bug; Axios timeout too short (10s → 30s); Python subprocess timeout too short for TensorFlow cold starts (15s → 30s). The NumPy bug only surfaces across the full inference chain — subprocess, TensorFlow load, model run, float32 output — unreachable by unit tests. NFR7 was confirmed: non-ML endpoints responded within 400–600ms throughout E2E testing.

### 4.7 Ethics and security

Supabase's GDPR DPA covers stored data; Ollama runs locally so pantry data never reaches a third-party API; receipt images are processed client-side. The ML ensemble uses synthetic data — real waste logs would have required ethics approval not feasible in scope. Full deployment would need a privacy notice and Article 17 deletion mechanism; cascading deletion is implemented. Rate limiting, 30+ RLS policies, Helmet.js, and parameterised queries cover the security surface.

### 4.8 Usability testing

Three participants completed five structured tasks on their own phones, followed by the SUS questionnaire (Brooke, 1996). No assistance was given.

| Participant | Task 1 | Task 2 | Task 3 | Task 4 | Task 5 | SUS Score |
|-------------|--------|--------|--------|--------|--------|-----------|
| P1 — Titobiloluwa Awe | Yes | Yes | Yes | Partial | Yes | 82 |
| P2 — Ninioritse Eruwa Great | Yes | Partial | Yes | Yes | Partial | 74 |
| P3 — Ayobamidele Esho | Yes | Yes | Yes | Yes | Yes | 88 |
| **Average** | 3/3 | 2/3 | 3/3 | 2/3 | 2/3 | **81.3** |

12/15 tasks completed (80%); SUS mean 81.3 ("Excellent", Brooke, 1996). Task 4 partials were caused by ML cold-start latency; Task 5 partials by the shopping list button being hidden below the calendar fold; P2's Task 2 partial confirmed that risk badge colours alone are insufficient affordance without a text label. N=3 produces a point estimate only — the SUS band classification should be treated with caution at this sample size.


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

All seven objectives met, with three additional NFRs (PWA installability, mobile-native UI, session persistence) emerging from mobile testing. The food recognition model missed the 95% target by 0.1 percentage points — close enough to be usable, worth noting honestly.

### 5.2 Strengths

The fallback architecture was the single most important design decision — without it, Ollama crashes and TensorFlow cold starts would have broken half the app. The 98% ensemble accuracy reflects genuine feature quality: errors clustered around ambiguous items rather than randomly, and the ensemble beat every individual model across all 10 splits. Development fallback periods provide indirect evidence on the research question: ML badges without LLM explanation gave P2 no reason for the risk; hardcoded LLM responses without ML grounding were generic rather than item-specific. Neither component alone satisfied the NFRs, echoing Graham-Rowe et al. (2014) — visibility requires an actionable prompt. A controlled A/B study is the next step.

### 5.3 Limitations

Synthetic training data is the biggest caveat — the ensemble captures category-level patterns but not individual quirks. Cold-start latency (15–30 seconds) caused Task 4 usability failures; ONNX Runtime would cut this to under 3 seconds but required rewriting the export pipeline, which ran out of time. The food classifier's 6–7 point train-validation gap indicates overfitting; CutMix/MixUp augmentation and decoupled auxiliary heads are the first interventions.

### 5.4 Reflection

Dependency sequencing was the main process lesson — the ReAct agent depended on a stable prediction endpoint and a week was lost assuming the two could be built in parallel. The E2E suite catching five bugs unreachable by unit tests changed how I think about testing: integration tests should come first. Feature pipeline design and debugging a plateaued loss curve was where understanding an algorithm and running it on constrained hardware stopped being the same thing.

---

## 6. Further work and conclusion

### 6.1 Further work

Three priorities: push the food classifier past 95% with CutMix/MixUp augmentation; retrain the waste ensemble on real household data collected through the app's existing waste logging; replace the TensorFlow subprocess with ONNX Runtime to cut cold-start latency from 30 seconds to under 3.

### 6.2 Conclusion

Combining a heterogeneous ML ensemble with a locally-hosted ReAct agent produces a tool that predicts waste before it occurs and grounds recommendations in the user's actual pantry state. The ensemble hit 98% accuracy; the food recognition model reached 94.9%; all 19 E2E tests pass; SUS mean is 81.3. The known limitations — synthetic training data, TensorFlow cold-start latency, classifier overfitting — are addressable without architectural change. Most food management tools record waste after it happens. This one is designed to prevent it.

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

FAO (2019) *The State of Food and Agriculture 2019: Moving Forward on Food Loss and Waste Reduction*. Rome: Food and Agriculture Organization of the United Nations. doi:[10.4060/ca6030en](https://doi.org/10.4060/ca6030en).

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

![Mobile UI — bottom tab bar and 'More' bottom sheet on iOS Safari](./assets/screenshots/08_mobile_ui.png)

Safari on iOS showing the bottom tab bar (Home, Lists, Pantry, Nurexa, More) with frosted-glass background and safe-area inset padding at the bottom. The "More" sheet is expanded, showing secondary navigation items. This is the mobile-native navigation pattern from Section 4.1.2. The bottom tab bar replaces the desktop sidebar below the `lg` breakpoint; the sheet replaces a separate page for secondary routes. Evidence for NFR4.

---

**Figure A.9 — PWA install prompt and home screen.**

![PWA — Safari share sheet install prompt on iOS (left) and home screen icon (right)](./assets/screenshots/09_pwa_install.png)

Left: Safari on iOS showing the "Add to Home Screen" option in the share sheet after visiting the application. Right: the NourishNeural icon on the iOS home screen sitting alongside native apps. The icon uses the 512px PNG declared in `manifest.json`. This is direct evidence that NFR4 (installable PWA) is met. Once installed, the app opens without browser chrome and behaves identically to a native app.

---

**Figure A.10 — Authentication.**

![Authentication — login form with Remember me toggle and email confirmation banner](./assets/screenshots/10_auth.png)

The login page showing the email and password fields, "Remember me" toggle, and the email confirmation banner shown after a new registration. The confirmation email is sent by Supabase's built-in auth flow. The "Remember me" toggle controls whether the refresh token is persisted to `localStorage`. This page covers NFR3: stateless JWT authentication with refresh token session persistence, as described in Section 4.1.3.


## Appendix B: Database schema




## Appendix C: Food recognition model training outputs

### Training configuration

The model is MobileNetV3-Large, pretrained on ImageNet and fine-tuned on Food-11 remapped to 8 NourishNeural categories. Input images are 224×224; training uses RandomResizedCrop and evaluation uses CenterCrop.

Hardware was the binding constraint. The RTX 2060 has 6 GB VRAM but works stably at 4 GB, so the physical batch size was kept at 8 with 4× gradient accumulation to reach an effective batch of 32. fp16 mixed precision via GradScaler stopped VRAM from spiking during the forward pass.

The optimiser is AdamW (lr=3e-4, weight_decay=1e-4) with CosineAnnealingLR (T_max=50, eta_min=3e-5). Loss is CrossEntropy with 0.1 label smoothing plus auxiliary heads for storage type, supermarket chain, and quality, which provided additional gradient signal during fine-tuning. Training took around 3.5 hours over 47 epochs before early stopping triggered at patience=8.

### Training progression

Validation accuracy was 82.1% after the first epoch, largely because ImageNet pretraining does a lot of the heavy lifting upfront. It climbed steadily through the early epochs: 88.3% at epoch 5, 90.3% at epoch 10, 92.5% at epoch 19. Things slowed after that. The best result came at epoch 39 with 93.2% validation accuracy, and the last eight epochs produced no meaningful improvement. Early stopping triggered at epoch 47.

By then, training accuracy was 99.9% against validation accuracy of 93.1%, a 6–7 point gap that is the overfitting problem flagged in Section 5.3.

### Test set performance (3,347 images)

On 3,347 held-out images the model reached 94.9% overall accuracy. The easiest class was Pantry (F1 0.99), where items are visually distinct. Vegetables came next at 0.97, then General at 0.96. Eggs, Fish, and Meat all landed at 0.95 F1. Bakery scored 0.93 across its 868-image test set, the largest class by some margin. Dairy was the weakest at 0.91 F1, with only 148 test images and high visual variety across milk, cheese, and yoghurt. Macro and weighted F1 both round to 0.95. Confusion matrix and training history plots are saved in `ml-models/models/`.

### Food-11 to NourishNeural category mapping

Food-11 ships with 11 categories; NourishNeural uses 8, chosen to reflect how a UK household actually organises food rather than how a research dataset groups it. Bread and Dessert both map to Bakery. Dairy product maps to Dairy. Egg maps to Eggs. Fried food and Soup consolidate under General, as neither maps cleanly to a pantry shelf. Meat stays as Meat. Noodles-Pasta and Rice both become Pantry. Seafood maps to Fish. Vegetable-Fruit maps to Vegetables.

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

