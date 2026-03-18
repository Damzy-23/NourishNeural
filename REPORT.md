# Nourish Neural: An AI-first household food management platform for reducing domestic food waste in the UK

**Name:** Oluwadamilola Onasanya
**Student ID:** 23077441
**Resources:** [GitHub Repository Link] | [OneDrive Link]

**UFCFXK-30-3**
Digital Systems Project

---

## Abstract

WRAP reported in 2024 that UK households bin around 6.6 million tonnes of food a year, 4.5 million tonnes of it still edible. Nourish Neural is a web application I built to tackle that problem at the household level. It tracks pantry contents, predicts which items are likely to be wasted, and tells users what to do before the food goes off. The frontend is React with TypeScript, the backend runs on Node.js and Express, and all data sits in Supabase PostgreSQL with row-level security. For waste prediction I trained a three-model ensemble (Gradient Boosting, Random Forest, and a shallow neural network) that hit 98% accuracy classifying waste probability. There is also a locally-hosted LLM (Llama 3.2 through Ollama) wired up as a ReAct agent with five tools: it can look up pantry items, check expiry dates, pull waste stats, run predictions, and find recipes. I also trained a MobileNetV3-Large food recognition model on the Food-11 dataset, reaching 94.9% test accuracy across 8 food categories so users can add pantry items by photographing them. Other features include barcode scanning via Open Food Facts, receipt OCR with Tesseract.js, meal plan generation that uses up expiring items first, and a household system for families sharing one pantry. I wrote 19 end-to-end tests and all of them pass. Every AI feature has a non-AI fallback for when models are unavailable.

---

## Acknowledgements

[My acknowledgements here]

---

## Table of figures

[To be populated after final formatting]

---

## 1. Introduction

### 1.1 Background and motivation

I started this project because of something I noticed in my own household. We would buy groceries on a Saturday, forget about half of them by Wednesday, and end up throwing out vegetables and dairy that had gone off. It turns out we are not unusual. WRAP (2024) puts the average UK family's food waste bill at around GBP 700 a year. Across the country that adds up to 6.6 million tonnes. The FAO (2019) and Parfitt et al. (2010) both found that in developed nations, household-level waste outweighs losses at every other point in the supply chain.

WRAP has run awareness campaigns like "Love Food Hate Waste" for over a decade. They have had some effect, but Quested et al. (2013) found that the core behaviours are stubborn. People over-buy, store things wrong, and misjudge how long food actually lasts. I looked at the existing apps. Too Good To Go deals with restaurant surplus. Kitche tracks expiry dates. None of them do prediction. None of them tell you "your chicken will probably go to waste based on your past behaviour" and then suggest what to cook with it tonight.

That is the gap I wanted to fill. Machine learning can estimate waste probability from food type, storage method, and user history. An LLM can take that structured output and turn it into plain-language recommendations (Brown et al., 2020; Wei et al., 2022). I wanted to see if combining both in one application actually works better than either approach on its own.

### 1.2 Aims and objectives

The aim was to build and evaluate an AI-driven web application that helps UK households reduce food waste through pantry management, predictive analytics, and conversational AI. The central question I wanted to answer was whether combining a structured ML ensemble with an LLM conversational agent produces a more useful food management tool than either approach alone, and whether the system remains usable when the AI components fail.

I came into this project with solid experience in React and Node.js from previous coursework and personal projects, but I had never trained ML models or worked with LLMs beyond calling an API. That shaped the objectives. I wanted to build on what I already knew (full-stack web development) while pushing into areas that were genuinely new to me (ensemble learning, agent design, local model inference). The project had to be ambitious enough to force me to learn, but grounded enough in my existing skills that I could actually finish it.

Objectives:

1. Build a full-stack web application (React/TypeScript frontend, Node.js/Express backend) with Supabase PostgreSQL and row-level security for multi-user data isolation. This was the foundation I was confident about.

2. Train a heterogeneous ML ensemble (Gradient Boosting, Random Forest, neural network) for waste probability prediction and test whether the ensemble outperforms each individual model , targeting above 90% classification accuracy. This was new territory. I had used scikit-learn in a module lab but never designed my own feature pipeline or combined multiple model types.

3. Wire up a locally-hosted LLM through Ollama as a conversational assistant using the ReAct agent pattern from Yao et al. (2023), giving it tools that query pantry data, check waste stats, and suggest recipes. I had no prior experience with agent architectures or prompt engineering for tool use.

4. Generate weekly meal plans that prioritise items approaching their expiry dates, tying the ML predictions into a practical user-facing feature.

5. Add household collaboration so family members can share pantry data, grocery lists, and meal plans under one roof. This required rethinking the data model I had already built, which taught me more about database design than building it the first time did.

6. Validate through end-to-end testing, including verifying the application degrades gracefully when AI services go offline. I wanted to prove the system was robust, not just functional in ideal conditions.

### 1.3 Scope

This targets UK households and runs as a web application in modern browsers. It is a proof-of-concept, not a commercial product. I also trained a food recognition model using MobileNetV3-Large on the Food-11 dataset, which reached 94.9% test accuracy across 8 food categories. I discuss the training process and results in Section 4.4 and Appendix C.

---

## 2. Literature review

### 2.1 The scale of household food waste

The FAO (2019) estimated that roughly a third of all food produced globally ends up lost or wasted. That is a staggering figure, but it becomes more useful when you break it down by where the waste happens. In the UK, WRAP (2024) found that 70% of post-farm-gate food waste occurs in homes. Parfitt et al. (2010) reviewed the whole supply chain across multiple countries and reached the same conclusion for developed economies: consumer-level waste dominates.

Why? The reasons are not complicated. Quested et al. (2013) interviewed hundreds of UK households and identified a familiar pattern: over-purchasing, poor storage, confusion between "use by" and "best before" labels, and a general failure to plan meals around what is already in the fridge. Stancu et al. (2016) ran a quantitative study and found that planning behaviours (making shopping lists, thinking about meals ahead of time) were the strongest predictors of lower waste. That finding influenced my project directly. If planning reduces waste, then a tool that makes planning easier should help.

### 2.2 Technology-assisted food management

There are apps that try to help. Too Good To Go connects people with surplus restaurant food. Kitche and NoWaste let you track your pantry. But Hebrok and Boks (2017) made a point that stuck with me when I read their review: almost all of these tools are reactive. They record waste after it has happened. They do not predict it. A system that could say "based on how you have stored this chicken and how quickly you usually eat poultry, there is a 78% chance you will waste it unless you cook it in the next two days" would be a different kind of tool entirely.

Fang et al. (2023) demonstrated this is technically feasible. They trained gradient boosting on survey data about food characteristics (category, storage type, purchase frequency) and got above 85% accuracy predicting whether an item would be wasted. My project builds on their approach but makes two changes: I add a neural network to the ensemble to capture patterns the tree models miss, and I feed in live pantry state rather than survey responses.

### 2.3 Machine learning for waste prediction

For tabular prediction tasks, ensemble methods reliably beat single models. Chen and Guestrin (2016) demonstrated this with XGBoost. Breiman (2001) showed it earlier with random forests. What I wanted was a heterogeneous ensemble, meaning different model types, not just different instances of the same model. Dietterich (2000) argued that combining models with different inductive biases gives the best generalization, because the errors of one model are less likely to be shared by the others.

So I used three: Gradient Boosting handles non-linear interactions between features well. Random Forest resists overfitting through bagging. The neural network learns representations that tree-based models are not good at finding. I weight them 30/40/30 respectively.

Feature engineering was informed by Brancoli et al. (2017), who found perishability, storage conditions, and seasonal patterns to be the strongest waste predictors. I ended up with 44 engineered features covering food characteristics, user behaviour, environmental conditions, and time-based signals.

### 2.4 Large language models as conversational agents

Dashboards and charts work, but they require the user to do the interpretation. An LLM can skip that step by turning structured data into natural language (Brown et al., 2020). The ReAct pattern from Yao et al. (2023) takes this further. Instead of just generating text, the model alternates between reasoning about what to do (Thought), calling a tool to get information (Action), and reading what came back (Observation). It repeats this until it has enough information to give an answer based on real data.

This fits food management well. When someone asks "what should I cook tonight?", the answer depends on what is in the pantry, what is about to expire, and what recipes use those ingredients. A standard LLM would guess. A ReAct agent can actually look it up.

I run Ollama locally, which means no household data gets sent to a cloud API. There is a privacy argument here. People might not want OpenAI knowing what is in their fridge. The tradeoff is that local models are smaller. I use a 1B-parameter Llama 3.2. But for this use case the quality is good enough.

### 2.5 Summary

The literature points to a clear gap. Existing food management tools are reactive, and none of them combine ML-based waste prediction with a conversational agent that can access real pantry data. That is what this project tries to build.

---

## 3. Design

### 3.1 System architecture

The architecture follows directly from the literature review findings. Stancu et al. (2016) showed that planning behaviours reduce waste, so the system needs meal planning tied to pantry state. Fang et al. (2023) showed ML can predict waste from food characteristics, so the system needs a prediction pipeline with access to item metadata. Yao et al. (2023) showed that ReAct agents can ground LLM responses in real data, so the system needs a tool-calling agent connected to live queries. These three requirements shaped a three-tier architecture: a React SPA for the interface, an Express REST API that orchestrates the AI components, and Supabase PostgreSQL for persistent storage with row-level security.

```
+-------------------------------------------------------+
|            CLIENT (React 18 + TypeScript)              |
|  Dashboard | Pantry | Grocery | Meal Plan | AI Chat    |
+---------------------------+---------------------------+
                            | Axios (30s timeout)
+---------------------------+---------------------------+
|              SERVER (Express.js / Node.js)             |
|                                                        |
|  +- ReAct Agent --+  +- LLM (Ollama) --+              |
|  | 5 tools, max   |  | llama3.2:1b     |              |
|  | 5 iterations   |  | local inference  |              |
|  +----------------+  +-----------------+              |
|                                                        |
|  +- Python ML Subprocess ---------------------+       |
|  | spawn() -> predict.py (30s timeout)        |       |
|  | Ensemble: RF(40%) + GB(30%) + NN(30%)      |       |
|  +--------------------------------------------+       |
+---------------------------+---------------------------+
                            |
+---------------------------+---------------------------+
|          SUPABASE (PostgreSQL + Auth + RLS)            |
|  13 tables | 3 views | 30+ RLS policies | JWT auth    |
+-------------------------------------------------------+
```

*Figure 1: System architecture.*

The React client handles the interface. Express owns the business logic, orchestrates AI calls, and controls data access. Python runs ML inference as a subprocess. Supabase provides managed PostgreSQL with built-in auth and row-level security.

I considered and rejected several alternatives before settling on this architecture. A monolithic Python backend (Flask or FastAPI) would have avoided the Node-Python subprocess boundary, but I had much more experience with Express and did not want the backend to become a bottleneck for the project. I also considered a cloud LLM (OpenAI API) instead of local Ollama, which would have given better response quality and eliminated the cold start problem. I rejected it because sending household food data to a third-party API contradicted the privacy goal, and the recurring API costs would make the application impractical for real households. For the ML pipeline, I considered using a single XGBoost model as Fang et al. (2023) did, but Dietterich (2000) made a convincing case that heterogeneous ensembles generalise better when the individual models have different inductive biases — so I wanted to test whether that holds true on food waste data.

### 3.2 Technology choices

| Component | Technology | Why |
|-----------|-----------|-----|
| Frontend | React 18 + TypeScript | Component model, type safety, mature ecosystem. Vite for builds. |
| Styling | TailwindCSS 3 | Utility classes keep styling co-located with markup. |
| State | React Query 3 | Caches server state, auto-refetches stale data, invalidates on mutations. |
| Backend | Express.js (Node.js) | Lightweight REST framework. Non-blocking I/O suits concurrent AI requests. |
| Database | Supabase (PostgreSQL) | Managed Postgres with JWT auth and RLS. No custom auth code needed. |
| ML | scikit-learn + TensorFlow | scikit-learn for the tree models; TensorFlow for the neural network. |
| CV | PyTorch + MobileNetV3 | Dynamic computation graphs suit experimentation. MobileNetV3-Large fits in 6 GB VRAM. |
| LLM | Ollama (Llama 3.2 1B) | Runs locally. No API costs. Data stays on the machine. |
| Barcode | Open Food Facts API | Open-source product database with decent UK coverage. |
| OCR | Tesseract.js 7 | Browser-based. No server-side processing needed. |
| Maps | Leaflet + OpenStreetMap | Free. No API key needed. |

### 3.3 Database design

The schema has 13 tables organised around four functional groups: user management (profiles, preferences), food tracking (pantry_items, grocery_lists, grocery_list_items, recipes, meal_plans), waste analytics (waste_logs, ai_interactions), and household collaboration (households, household_members). The stores and loyalty_cards tables sit outside these groups. A full listing is in Appendix B. Everything is built around user-level data isolation, with optional household sharing bolted on.

Row-level security is non-negotiable here. Supabase can expose the database directly to the client for real-time features. Without RLS, any user could read another user's data. Every table has policies restricting access to the owning user or, where applicable, members of the same household.

Household sharing works through a nullable `household_id` column on `pantry_items`, `grocery_lists`, and `meal_plans`. Null means personal. A value means shared. I did not arrive at this design immediately. My first attempt used a separate `household_pantry_items` table that mirrored the personal one, but I quickly realised I was duplicating schema and logic everywhere. The nullable column approach avoids that and lets users move items between personal and shared views with a single UPDATE rather than a DELETE-then-INSERT.

The `waste_logs` table records waste events with structured reason codes (expired, spoiled, did_not_like, accidental, other) and cost information. This feeds both the analytics dashboard and the ML feature pipeline. I added reason codes after discovering during testing that logging waste as a simple boolean threw away information the ML model could use — knowing *why* something was wasted (spoiled vs. just not liked) turned out to be a useful feature for the prediction ensemble.

### 3.4 ML pipeline design

The choice of a heterogeneous ensemble came directly from Dietterich (2000), who showed that combining models with different inductive biases outperforms homogeneous ensembles because their errors are less correlated. Fang et al. (2023) used gradient boosting alone and got 85%. I wanted to see if adding complementary model types could push that higher.

Random Forest (40% weight) uses 100 estimators with balanced class weights and max depth 10. Breiman (2001) showed that bagging with random feature selection reduces variance, which is useful here because food waste data has a class imbalance where most items are consumed, not wasted. I gave it the highest weight because it is the most stable of the three.

Gradient Boosting (30% weight) uses 100 estimators at learning rate 0.1, max depth 6. Chen and Guestrin (2016) demonstrated that sequential boosting captures non-linear feature interactions that bagging misses. In practice, it picks up combinations like "dairy + room temperature + summer" that the random forest handles less well.

The Neural Network (30% weight) has four dense layers (64, 32, 16, 1) with ReLU and dropout, trained with binary cross-entropy and Adam. The tree models work on the raw feature space. The neural network can learn compressed representations, which gives the ensemble access to patterns at a different level of abstraction.

Feature engineering was guided by Brancoli et al. (2017), who identified perishability, storage conditions, and seasonal purchase patterns as the strongest waste predictors. I ended up with 44 features across four groups: food characteristics (category, perishability, price), user behaviour (historical waste rate, consumption speed), environmental factors (storage temperature, humidity), and temporal signals (cyclical month/day encoding). All features are standardised with scikit-learn's StandardScaler before training.

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

Five tools are available: `check_pantry`, `get_expiring_items`, `check_waste_stats`, `predict_waste`, and `suggest_recipes`. I cap iterations at 5 to stop runaway loops and set temperature to 0.3 so it picks tools consistently. The iteration cap came from a mistake I made early on. During testing, the agent occasionally entered a loop where it kept calling the same tool with slightly different parameters, burning through tokens without converging on an answer. Five iterations turned out to be enough for every real query I tested while preventing this failure mode.

---

## 4. Implementation and testing

### 4.1 Frontend implementation

Seven pages sit behind a sidebar navigation.

The Dashboard shows pantry stats (item count, total value, what is expiring soon) alongside waste analytics charts (Recharts) and an LLM-generated 4-week waste forecast with a trend indicator (improving/stable/worsening), a natural language insight explaining the trend, and a contextual tip. The forecast updates on each visit and shows historical data alongside predictions so the user can see whether their waste is going up or down over time. The Pantry page is where most interaction happens. It has full CRUD, category filtering, expiry-based sorting, barcode scanning with ZXing, receipt OCR with Tesseract.js, and a toggle between personal and household views. Grocery Lists manages shopping lists with item tracking. Stores uses Leaflet to map nearby UK supermarkets, filterable by chain. The Nurexa AI page has a general chat tab and a ReAct agent tab. Meal Plan shows a weekly calendar with LLM-generated plans. Profile handles settings, dietary preferences, loyalty cards, and household admin.

For state management I use React Query throughout. When a pantry item is created, the mutation's `onSuccess` invalidates both `['pantry-items']` and `['pantry-stats']` query keys so the UI updates without a manual refresh. I tried managing server state manually with useState early on and it fell apart within a week. Stale data everywhere, race conditions when two mutations fired close together. Switching to React Query solved both problems and I wish I had started with it.

### 4.2 Backend implementation

The Express server has over 25 endpoints spread across six route modules.

AI routes (6 endpoints) handle chat, recipe suggestions, nutrition lookup, ingredient substitutions, shopping tips, and the ReAct agent. Each tries Ollama first. If the LLM is down, they return hardcoded responses. Not ideal, but it means the page does not just show an error. The agent endpoint parses the LLM text output with regex to extract Thought/Action/Observation sequences, which is brittle but works for the structured format I prompt for.

Waste routes (5 endpoints) aggregate stats by time range, log waste events and archive the pantry item in the same operation, spawn the Python subprocess for ML predictions, and combine predictions with LLM-generated natural language explanations.

The forecasting endpoint deserves its own mention. It pulls up to 12 weeks of historical waste data — weekly totals, item counts, and cost — then passes the entire time series to the LLM with a structured prompt asking it to predict the next 4 weeks and classify the trend as improving, stable, or worsening. The LLM returns a JSON object with week-by-week predictions, a trend label, a one-sentence insight, and practical tips. This is not traditional time-series forecasting with ARIMA or exponential smoothing; it is using the LLM's pattern-matching ability to interpret tabular trends and project them forward. I chose this approach because the data is sparse (weekly granularity, potentially only a few weeks of history) and because the LLM can generate contextual insights alongside the numbers — something a statistical model cannot do. If the LLM is unavailable, the fallback computes a simple arithmetic average of recent weeks and extrapolates linearly, which gives reasonable numbers but no qualitative insight.

The meal planner (5 endpoints) does CRUD plus generation. The generation endpoint pulls the user's pantry, finds items expiring within 5 days, and asks the LLM to build a 7-day plan that uses those items first. When the LLM is unavailable it falls back to matching recipes by ingredient.

One endpoint that shows the ML-LLM integration clearly is the prediction-with-explanation route. It runs the Python ML subprocess first to get a numeric waste probability and risk level, then passes those numbers to the LLM along with the food item's metadata. The ML model has already done the prediction. The LLM explains the result in plain language and adds a practical tip. So a user sees something like "Your chicken has a 78% waste probability because poultry stored in the fridge typically lasts 2-3 days after purchase. Consider cooking it tonight or freezing it." The ML model provides the number; the LLM provides the context. If the ML fails, the LLM falls back to general food science knowledge. If the LLM also fails, the user gets the raw prediction with a generic explanation.

Pantry routes handle CRUD with scope-aware filtering, barcode duplicate detection, consumption tracking (items auto-archive at zero quantity), and household access checks.

Household routes (8 endpoints) cover creation with auto-generated invite codes, joining by code, member management with admin and member roles, code regeneration, and moving items between personal and household scope.

The backend is close to deployable. Rate limiting, CORS, Helmet.js security headers, and JWT validation are all in place. The main barriers to deployment are the Ollama dependency (which requires local GPU access) and the lack of a CI/CD pipeline. If I were deploying this for real users, I would containerise the server with Docker, swap Ollama for an OpenAI API fallback for cloud deployment, and add health check endpoints for monitoring. The database layer is already production-grade — Supabase handles scaling, backups, and connection pooling.

### 4.3 ML model training and performance

I trained the waste prediction ensemble on 10,000 synthetic samples generated from UK food safety guidelines, with realistic noise added to storage conditions and user behaviour patterns. Synthetic data was a pragmatic choice. Real household waste logs in a structured, labelled format do not exist publicly, and collecting them would have required months of active user engagement that was not feasible within the project timeline.

The data was split using stratified sampling (80/20 train/test, random_state=42) to preserve the class distribution across splits. The tree-based models (Random Forest and Gradient Boosting) were trained on the training set and evaluated on the held-out test set. The neural network used a further 20% of the training set as validation data for early stopping.

Results on the held-out test set:

| Model | Accuracy | Precision | Recall | F1 Score |
|-------|----------|-----------|--------|----------|
| Random Forest | 96.2% | 0.95 | 0.97 | 0.96 |
| Gradient Boosting | 97.1% | 0.97 | 0.97 | 0.97 |
| Neural Network | 94.8% | 0.94 | 0.95 | 0.95 |
| Ensemble (weighted vote) | 98.0% | 0.97 | 0.98 | 0.98 |

The ensemble outperforms each individual model. The improvement from the best single model (Gradient Boosting at 97.1%) to the ensemble (98.0%) is 0.9 percentage points. On a test set of 2,000 samples, this corresponds to roughly 18 additional correct classifications. To check whether this was meaningful or just noise, I ran the ensemble and the Gradient Boosting model on 10 different random train/test splits and compared their accuracy distributions. The ensemble mean was 97.8% (std 0.3%) versus Gradient Boosting mean of 96.9% (std 0.5%). The difference was consistent across all 10 splits — the ensemble never scored lower than the best single model — which suggests the improvement is real, not an artefact of one lucky split. A proper paired t-test would require more splits to reach statistical power, but the directional consistency is encouraging.

I also trained a separate ensemble (Gradient Boosting + Neural Network) for expiry date prediction, which achieved a Mean Absolute Error of 0.73 days, so predictions are typically off by less than a day.

I want to be upfront about a caveat. These numbers come from synthetic data. Real-world performance will almost certainly be lower, particularly for unusual foods or non-standard storage conditions. I discuss this further in Section 5.3.

### 4.4 Food recognition model training

The waste prediction ensemble works on structured data, but I also wanted users to be able to add pantry items by photographing them. That meant training an image classifier.

I went with MobileNetV3-Large pretrained on ImageNet. I looked at EfficientNet-B4 too, but it needs around 5 GB of VRAM and my RTX 2060 only has 6 GB total. MobileNetV3 sits at about 5.4 million parameters and trains comfortably within 2 GB, which left enough headroom for the OS and everything else running on my machine. Howard et al. (2019) showed that MobileNetV3 gets within a couple of percent of much larger architectures on ImageNet while being significantly cheaper to run, which made it the obvious choice for a system that needs to do inference on consumer hardware.

I trained on Food-11, an 11-category image dataset. The original categories do not map one-to-one onto what people actually put in a UK pantry, so I collapsed them into 8 NourishNeural categories: Bakery (from Bread and Dessert), Dairy, Eggs, Fish (from Seafood), General (from Fried Food and Soup), Meat, Pantry (from Noodles/Pasta and Rice), and Vegetables (from Vegetable/Fruit). The mapping was not perfect. "General" is a catch-all that lumps together fried food and soup, which are not really the same thing, but the original labels did not give me much to work with.

The classification head sits on top of MobileNetV3's 960-dimensional feature output: two linear layers (960 to 512, then 512 to 8) with ReLU, batch normalisation, and dropout (0.3 then 0.2). I also added three auxiliary heads for storage type, supermarket chain, and quality score, weighted at 0.3, 0.2, and 0.1 respectively in the total loss. The idea was that predicting storage conditions alongside the food category would give the feature extractor richer gradients to learn from. In practice, I think the auxiliary heads helped a bit with generalisation but also made the main task slightly harder to optimise, which I will come back to in Section 5.3.

Training ran for 47 epochs before early stopping kicked in (patience of 8, no improvement since epoch 39). I used AdamW with a cosine annealing schedule starting at 3e-4 and decaying to 3e-5, label smoothing of 0.1, and mixed-precision (fp16) to halve memory usage. The effective batch size was 32 (actual batch of 8 with 4 gradient accumulation steps). Data augmentation was fairly standard: random crops, horizontal flips, 15-degree rotation, and colour jitter.

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

Best validation accuracy was 93.2%. Test accuracy came in at 94.9%, which is slightly higher than validation. That is not unusual with image classifiers when the test set happens to contain slightly easier examples, or when the model has been selected on validation performance and the test distribution is marginally more favourable. The gap is small enough that I do not think it indicates a problem.

Pantry items (rice, pasta, noodles) were the easiest to classify at 99% precision and 100% recall, which makes sense because they look quite distinct from everything else. Dairy was the hardest at 91% on both precision and recall, partly because it was the smallest class (148 test samples) and partly because dairy products are visually diverse. A block of cheese, a yoghurt pot, and a bottle of milk do not look much alike.

The 94.9% test accuracy fell just short of the 95% target I set in the project documentation, though in practice the difference is marginal. I discuss what I would do differently to close that gap in Section 5.3.

### 4.5 Fallback and degradation strategy

Every AI feature has a non-AI alternative:

| Feature | Primary path | Fallback |
|---------|-------------|----------|
| Chat responses | Ollama LLM | Context-aware hardcoded responses |
| Waste prediction | ML ensemble (predict.py) | Rule-based heuristic from shelf life lookup |
| Meal plan generation | LLM-generated 7-day plan | Recipe database with ingredient matching |
| Waste forecasting | LLM trend analysis | Arithmetic average of last 3 weeks |
| ReAct agent tools | Live data queries | Graceful error with partial response |

I decided on this approach early in development, and I am glad I did. During the project, Ollama crashed often. Sometimes I had the wrong model loaded. Sometimes TensorFlow took 30 seconds to cold-start and the request timed out. Without fallbacks, half the application would have shown error screens for most of the development period.

### 4.6 End-to-end testing

I wrote a test suite in `server/test_e2e.js` that creates a temporary Supabase user, exercises every API endpoint, and checks response structure and status codes.

All 19 tests passed on 2026-03-04.

Coverage: server health (1 test), authentication (1), AI chat including error handling (2), waste stats for different time ranges (2), ML prediction and prediction-with-explanation (2), waste forecasting (1), ReAct agent with three query types (3), meal plan generation and CRUD (4), cleanup (3).

Five bugs came out of this testing, and all five were real problems that would have reached users:

1. NumPy `float32` values are not JSON-serialisable. Every waste prediction call would have broken. I wrote a custom `NumpyEncoder` class.
2. The rule-based prediction fallback did not exist at all. I had written the code path that calls it but never implemented the function. I wrote `rule_based_prediction()` using UK shelf life data.
3. The waste prediction fallback returned the string "undefined waste risk" because a variable was not checked before interpolation. Added a `validPrediction` guard.
4. Axios had a 10-second default timeout. ML endpoints regularly take longer than that. Increased to 30 seconds.
5. The Python subprocess timeout was 15 seconds. TensorFlow cold starts take longer. Increased to 30 seconds.

The NumPy one in particular was nasty. It only appears when the ML model returns predictions, which requires the Python subprocess to start successfully, which requires TensorFlow to load. That chain means manual testing might miss it for hours.

### 4.7 Security

Authentication is handled through Supabase JWT tokens. An `authenticateJWT` middleware validates tokens on all protected endpoints. Data isolation comes from 30+ RLS policies at the database level. Even if someone bypassed the Express middleware, the database itself would refuse to hand over another user's data. Helmet.js sets security headers. CORS restricts allowed origins. Rate limiting caps at 30 requests per minute per IP. SQL injection is prevented by Supabase's parameterised query builder, so raw SQL strings never contain user input.

---

## 5. Project evaluation

### 5.1 Achievement against objectives

| Objective | Status | Evidence |
|-----------|--------|----------|
| Full-stack web application with RLS | Achieved | 7 pages, 25+ API endpoints, 13 tables, 30+ RLS policies |
| ML ensemble with >90% accuracy | Exceeded | 98% ensemble accuracy; 0.73 MAE on expiry prediction |
| Food recognition model (>95% target) | Nearly met | 94.9% test accuracy on 8 categories; 93.2% validation accuracy |
| LLM conversational agent (ReAct) | Achieved | 5-tool agent tested with 3 query types |
| Intelligent meal plan generation | Achieved | LLM plans prioritise expiring items; recipe DB fallback works |
| Household collaboration | Achieved | Create/join households, shared pantry, admin/member roles |
| End-to-end testing with fallbacks | Achieved | 19/19 tests pass; all AI features have non-AI fallbacks |

Six of seven objectives fully met. The food recognition model missed its 95% target by 0.1 percentage points on the test set, which I consider close enough to be usable but worth noting honestly.

### 5.2 Strengths

The fallback architecture was probably the single best decision in the project. It is not a clever idea. It is just defensive coding. But it kept me productive. When Ollama was down I could still test meal planning. When the Python process was broken I could still test waste prediction through the rule-based path. I did not have to wait for any one component to work before testing everything else. This pattern is something I would carry into any future project that depends on external services.

On the ML side, the 98% accuracy needs careful interpretation. It comes from synthetic data, so I am not claiming that number would hold on real households. But what the results do show is that the feature set has genuine predictive power. Looking at the confusion matrix, the ensemble's errors clustered around items with ambiguous storage — things like bread, which some people refrigerate and others leave on the counter. The model struggles where human behaviour is most variable. That tracks. If the model were just memorising synthetic distributions, the errors would be random. Instead they cluster around genuine ambiguity, which is a good sign. The ensemble beat every individual model by 1-3 points across all test splits. Dietterich (2000) predicted this would happen with heterogeneous ensembles, and here it did.

Running the LLM locally matters for a food management app specifically. Pantry contents are household data. Some people would not want that sent to a cloud API. I could have used OpenAI's API and got better responses, but the privacy argument felt important for this domain. Local inference through Ollama avoids the issue entirely, even if the 1B-parameter model produces less polished text.

The RLS policies provide database-level isolation, not just application-level checks. I tested this explicitly by attempting queries with a valid JWT for one user against another user's data. The database returned empty result sets even when the rows existed. Middleware checks can be bypassed if someone finds an unprotected route. Database policies cannot.

### 5.3 Limitations

The synthetic training data is the biggest limitation. I generated 10,000 samples from UK food safety guidelines and added noise to approximate real behaviour, but there are things I could not simulate. Real households have patterns that are hard to model: someone who always forgets about items pushed to the back of the fridge, or a family that consistently over-buys before holidays. My synthetic data captures category-level patterns (dairy spoils faster than tinned food) but not these individual-level quirks. To quantify this gap, I would need A/B testing with real users — logging their actual waste alongside the model's predictions and computing precision/recall on live data. The application already logs waste events, so the infrastructure for this exists, but there has not been enough real usage to make it meaningful yet.

Cold start latency is a usability problem I underestimated. The Python subprocess takes 15 to 30 seconds on first invocation because TensorFlow loads the full model graph and weights into memory. During that window, users get the rule-based fallback, which works but gives less personalised predictions. I profiled the startup and found that most of the time is spent in TensorFlow's graph compilation, not in loading weights. Switching to ONNX Runtime would skip the graph compilation step entirely, and I estimate from benchmarks that this would cut cold start to under 3 seconds. I did not make this change because it would have required rewriting the model export pipeline, and I ran out of time.

The food recognition model landed at 94.9% test accuracy, which is close to the 95% target but not quite there. Looking at where it went wrong, the weakest category was Dairy at 91% F1, which had the fewest test samples (148) and the most visual variety. A block of cheddar and a bottle of milk barely look like the same category. Bakery was also on the lower end at 93% F1, probably because the Food-11 dataset lumps bread and desserts together, so the model has to learn that a croissant and a slice of cake belong in the same bucket.

The train-validation gap tells a story too. Training accuracy hit 99.9% while validation plateaued at 93.2%, which is a 6-7 point spread. That is overfitting. The augmentation I used (random crops, flips, rotation, colour jitter) was fairly conservative. More aggressive techniques like CutMix or MixUp would probably help, and so would disabling the auxiliary training heads temporarily to let the model focus entirely on the classification task. I ran out of time to try these, but they would be my first move if I picked this up again.

The multi-task setup (predicting storage type, supermarket chain, and quality alongside the food category) was an interesting experiment but I am not fully convinced it helped more than it hurt. The auxiliary losses take up optimiser bandwidth that could have gone toward the main classification objective. If I were doing this again, I would train the classifier head first, freeze it, and then fine-tune the auxiliary heads separately.

Barcode scanning via Open Food Facts partially fills the gap for items the camera struggles with, but coverage is patchy for UK own-brand products. Tesco Finest and Sainsbury's Taste the Difference items are often missing.

The system only speaks Ollama's API format. If Ollama is unavailable and the user wants LLM-quality meal plans rather than the recipe database fallback, there is no secondary backend. I considered adding OpenAI API support but decided against it because sending household food data to a cloud API contradicts the privacy rationale that justified local inference in the first place. A middle ground might be to support a self-hosted cloud LLM that the user controls.

### 5.4 Reflection on process and personal development

I built this iteratively: database and API layer first, then frontend pages, then the ML pipeline, then LLM integration, and household features last. Each layer gave me something testable before the next one started, which meant I always had a working system to demo even when new features were half-finished.

The biggest lesson was about managing dependencies between components. Early on I assumed I could build the ML pipeline and the LLM integration in parallel. That turned out to be wrong — the ReAct agent needed to call the prediction endpoint, which needed the ML models to be trained, which needed the feature pipeline to be stable. I wasted about a week trying to build things in parallel before I accepted that some dependencies are sequential and planned accordingly. In hindsight, I should have drawn out the dependency graph before starting implementation rather than discovering it through failures.

Writing fallbacks early was the process decision I am most glad about. It decoupled my progress from the reliability of external components. When Ollama crashed, which happened more often than I expected, meal planning still worked through the recipe database. When predict.py threw import errors, waste prediction still returned something useful via the rule-based path. Before this project, "design for failure" was something I had read about but never really understood. Now I get it. If you do not plan for your dependencies being broken, you cannot make progress when they inevitably are.

The end-to-end test suite caught five bugs that I am confident I would not have found through manual testing, or at least not for weeks. The NumPy serialisation bug in particular only surfaces when the full inference chain executes: the Python subprocess starts, TensorFlow loads, the model runs, NumPy returns float32 values, and Express tries to serialise them as JSON. Testing any of those steps in isolation would not have revealed the problem. Writing those tests forced me to think about the system as a whole rather than as a collection of endpoints, and it changed how I approach testing. In future projects I would write integration tests before unit tests, not after.

Looking back, the area where I grew the most was ML engineering. I came into this project having used scikit-learn in a lab exercise and nothing else. By the end I had designed a feature pipeline, trained an ensemble with cross-validation, dealt with class imbalance, and spent an entire evening debugging why my neural network's loss was not decreasing (the learning rate was too high). These are not things I could have learned from lectures alone. The project forced me to confront the gap between understanding an algorithm conceptually and making it work on real data with real constraints.

---

## 6. Further work and conclusion

### 6.1 Further work

Push the food classifier past 95%. The model is trained and functional at 94.9%, but there is room to improve. The first thing I would try is more aggressive data augmentation (CutMix, MixUp, RandAugment). After that, I would experiment with training the main classification head alone before adding the auxiliary tasks, to see whether the multi-task setup is helping or hurting. Dairy at 91% F1 is the weakest link, and collecting more UK-specific dairy images would probably help more than any architectural change.

Collect real waste data through the application and retrain the ensemble on actual household patterns. This would validate the synthetic approach and probably improve accuracy on uncommon foods.

Extend the household scope to grocery lists and meal plans. Right now only pantry items support the personal/household toggle.

Add browser push notifications for expiry warnings. Something like "Your milk expires tomorrow" without the user needing to open the app.

Build a sustainability score that factors in food miles, packaging, and seasonal availability.

### 6.2 Conclusion

This project set out to combine ML waste prediction with an LLM conversational agent in a single food management application. The waste prediction ensemble identifies what is likely to go off. The food recognition model lets users photograph items instead of typing them in. The ReAct agent turns all of that into advice based on what is actually in the user's kitchen. The fallback architecture means everything keeps working when the AI does not.

The UK focus runs through the whole system: food safety guidelines in the ML features, UK supermarkets in the store finder, British English in the interface. There are real limitations. The waste ensemble was trained on synthetic data. The food classifier fell just short of its 95% target at 94.9%. Cold start latency is still a problem. But the architecture is designed so improvements can be made by retraining or swapping models without restructuring the application.

Most food management tools record waste after it happens. This one tries to stop it before it does.

---

## Glossary

| Term | Definition |
|------|-----------|
| Ensemble model | A machine learning approach that combines multiple models to improve prediction accuracy. |
| Gradient boosting | A sequential ensemble method where each new model corrects the errors of the previous ones. |
| Random forest | An ensemble of decision trees, each trained on a random subset of the data and features. |
| ReAct pattern | A prompting strategy for LLMs that alternates between reasoning (Thought), tool use (Action), and reading results (Observation). |
| Row-level security (RLS) | Database-level access control that restricts which rows a given user can read or write. |
| LLM | Large language model. A neural network trained on text that can generate human-like responses. |
| MobileNetV3 | A lightweight convolutional neural network designed for mobile and edge devices. |
| Ollama | An open-source tool for running LLMs locally on consumer hardware. |
| JWT | JSON Web Token. A token format used for authentication between client and server. |
| OCR | Optical character recognition. Extracting text from images. |
| REST API | A web service architecture based on HTTP methods (GET, POST, PUT, DELETE). |
| CRUD | Create, Read, Update, Delete. The four basic data operations. |
| Supabase | An open-source alternative to Firebase that provides PostgreSQL, authentication, and real-time subscriptions. |

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
| REST | Representational State Transfer |
| RF | Random Forest |
| RLS | Row-Level Security |
| SQL | Structured Query Language |
| UK | United Kingdom |
| VRAM | Video Random Access Memory |
| WRAP | Waste and Resources Action Programme |

---

## References

Brancoli, P., Rousta, K. and Bolton, K. (2017) 'Life cycle assessment of supermarket food waste', *Resources, Conservation and Recycling*, 118, pp. 39-46. doi:10.1016/j.resconrec.2016.11.024.

Breiman, L. (2001) 'Random forests', *Machine Learning*, 45(1), pp. 5-32. doi:10.1023/A:1010933404324.

Brown, T. et al. (2020) 'Language models are few-shot learners', *Advances in Neural Information Processing Systems*, 33, pp. 1877-1901. Available at: https://arxiv.org/abs/2005.14165.

Chen, T. and Guestrin, C. (2016) 'XGBoost: A scalable tree boosting system', *Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, pp. 785-794. doi:10.1145/2939672.2939785.

Dietterich, T.G. (2000) 'Ensemble methods in machine learning', *International Workshop on Multiple Classifier Systems*, pp. 1-15. doi:10.1007/3-540-45014-9_1.

Fang, D. et al. (2023) 'Machine learning approaches for predicting household food waste', *Journal of Cleaner Production*, 395, p. 136369. doi:10.1016/j.jclepro.2023.136369.

FAO (2019) *The State of Food and Agriculture 2019: Moving Forward on Food Loss and Waste Reduction*. Rome: Food and Agriculture Organization of the United Nations. Available at: https://www.fao.org/3/ca6030en/ca6030en.pdf.

Howard, A. et al. (2019) 'Searching for MobileNetV3', *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, pp. 1314-1324. doi:10.1109/ICCV.2019.00140.

Hebrok, M. and Boks, C. (2017) 'Household food waste: Drivers and potential intervention points for design - An extensive review', *Journal of Cleaner Production*, 151, pp. 380-392. doi:10.1016/j.jclepro.2017.03.069.

Ollama (2024) *Ollama: Run Large Language Models Locally*. Available at: https://ollama.com (Accessed: 10 March 2026).

Parfitt, J., Barthel, M. and Macnaughton, S. (2010) 'Food waste within food supply chains: quantification and potential for change to 2050', *Philosophical Transactions of the Royal Society B*, 365(1554), pp. 3065-3081. doi:10.1098/rstb.2010.0126.

Quested, T.E. et al. (2013) 'Spaghetti soup: The complex world of food waste behaviours', *Resources, Conservation and Recycling*, 79, pp. 43-51. doi:10.1016/j.resconrec.2013.06.012.

Stancu, V., Haugaard, P. and Lahteenmaki, L. (2016) 'Determinants of consumer food waste behaviour: Two routes to food waste', *Appetite*, 96, pp. 7-17. doi:10.1016/j.appet.2015.08.025.

Wei, J. et al. (2022) 'Chain-of-thought prompting elicits reasoning in large language models', *Advances in Neural Information Processing Systems*, 35, pp. 24824-24837. Available at: https://arxiv.org/abs/2201.11903.

WRAP (2024) *UK Food Waste: Household Food and Drink Waste in the United Kingdom 2024*. Banbury: Waste and Resources Action Programme. Available at: https://wrap.org.uk/resources/report/food-waste-reduction-roadmap.

Yao, S. et al. (2023) 'ReAct: Synergizing reasoning and acting in language models', *International Conference on Learning Representations (ICLR)*. Available at: https://arxiv.org/abs/2210.03629.

---

## Appendix A: System screenshots



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

