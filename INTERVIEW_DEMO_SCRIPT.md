# Nourish Neural - Interview Demo Script
## Cuttsy+Cuttsy | Junior AI Developer Role
### Estimated Duration: 10-12 minutes

---

## PRE-DEMO CHECKLIST

- [ ] App running: `npm run dev` from project root
- [ ] Frontend live at http://localhost:3050
- [ ] Backend live at http://localhost:5000
- [ ] Browser open, dark mode OFF (light mode shows better on projector/screenshare)
- [ ] Browser zoom at 90% (fits more content on screen)
- [ ] All tabs closed except the app
- [ ] Have a test account logged in and ready (keep a second tab with the dashboard loaded)

---

## PART 1: THE HOOK (30 seconds)

**[Screen: Landing page at localhost:3050]**

> "I'd like to show you Nourish Neural - an AI-first household food management platform I built from scratch. It's a full-stack application with React, Node.js, Python ML models, and a local LLM-powered conversational agent.

> But more than just the tech, I want to show you HOW I approached building AI responsibly - because the decisions I made around prompt engineering, testing, governance, and explainability are directly relevant to healthcare AI."

**Why this works:** You're immediately signalling that you understand the difference between building AI and building TRUSTWORTHY AI. That's exactly what Cuttsy+Cuttsy needs.

---

## PART 2: LANDING PAGE - THE VALUE PROPOSITION (1.5 minutes)

**[Screen: Still on landing page, scroll slowly]**

> "The platform helps UK households manage their food - tracking what's in their pantry, predicting what's about to expire, reducing waste, and planning meals."

**[Point to the stats bar: 18k+, 52%, £220, 16+]**

> "The core metrics: households assisted, waste reduction percentage, monthly savings, and stores indexed. These are the business outcomes the AI is optimised for - not just technical metrics, but real impact."

**[Scroll to the 4-step user journey: Sense, Predict, Orchestrate, Elevate]**

> "The user journey follows a data-to-insight pipeline. Sense captures pantry state through barcode scans and camera intake. Predict uses our ML ensemble to anticipate expiry and waste risk. Orchestrate auto-generates grocery lists and meal plans. And Elevate closes the loop with dashboards and impact visualisation."

> "This pattern - capture data, apply AI, deliver actionable insight, measure outcomes - is the same pattern you'd use in patient engagement or clinical trial support."

**[Scroll to footer, point to the "Explore" column]**

> "I've built several pages specifically to demonstrate the AI development process. Let me walk you through the technical depth."

---

## PART 3: HOW IT WORKS - ARCHITECTURE (2 minutes)

**[Click: "How It Works" in the footer, or navigate to /how-it-works]**

> "This is the architecture overview. Let me walk you through the stack quickly."

**[Point to the Tech Stack grid]**

> "Frontend is React with TypeScript, Vite for builds, Tailwind for styling, and Recharts for data visualisation. Backend is Node.js with Express, JWT authentication, and rate limiting. Database is Supabase - that's PostgreSQL with row-level security, so users can only access their own data."

**[Scroll to ML Pipeline]**

> "The interesting part is the AI layer. I built a Python machine learning pipeline that extracts 45 features from user data - things like storage temperature, days since purchase, perishability scores, seasonal patterns using sine and cosine encoding."

> "These feed into an ensemble of three models: Random Forest at 40% weight, Gradient Boosting at 30%, and a Neural Network at 30%. The ensemble approach is deliberate - when models disagree significantly, we flag lower confidence. That's critical in any health-sensitive context where over-reliance on a single model is risky."

**[Scroll to ReAct Agent section]**

> "For the conversational AI, I built a ReAct agent - that's Reasoning plus Acting. The agent thinks step by step, selects from 7 specialised tools like checking the pantry or predicting waste risk, observes the result, and iterates until it can give a final answer. I'll show you the prompt engineering behind this in a moment."

**[Point to the stats at bottom: 45 features, 3 models, 7 tools, 97% accuracy, <500ms]**

> "Key numbers at a glance."

---

## PART 4: AI EXPLAINABILITY - THE DIFFERENTIATOR (2 minutes)

**[Navigate to /ai-explainability]**

> "This is what I think sets this project apart. In healthcare, you can't just have accurate AI - you need EXPLAINABLE AI. Let me show you what I mean."

**[Point to the ensemble diagram]**

> "Every prediction shows exactly how it was made. The three models vote independently, and users can see the individual scores. Random Forest might say 78% waste risk while the Neural Network says 69%. That disagreement is valuable information."

**[Scroll to Feature Importance chart]**

> "This is a feature importance chart using permutation importance. Storage temperature is the strongest predictor at 18%, followed by days since purchase and food category. Users can see exactly WHICH factors drove a prediction. This is the same transparency required by GDPR Article 22 for automated decision-making."

**[Scroll to Model Performance metrics]**

> "The model achieves 94.2% accuracy, 91.8% precision, and 93.5% recall on a held-out test set. In food safety, recall matters more than precision - we'd rather flag a safe item than miss an expired one. That same principle applies in clinical screening."

**[Scroll to the prediction demo card]**

> "Here's a live prediction example. Semi-skimmed milk, 5 days in the fridge. The system shows 73% waste probability, plus or minus 8% confidence interval, with individual model scores broken down. Every prediction is transparent."

**[Scroll to Healthcare Relevance callout]**

> "I designed this with NHS Digital Service Standards and GDPR Article 22 in mind. The same explainability patterns - confidence scoring, feature attribution, bias monitoring - directly transfer to patient risk scores, drug interactions, or treatment outcome prediction."

---

## PART 5: PROMPT ENGINEERING LAB - CORE SKILL (2 minutes)

**[Navigate to /prompt-lab]**

> "This page demonstrates prompt engineering - which I know is a core part of this role. Let me show you my process."

**[Point to the 4-step lifecycle: Define, Draft & Test, Evaluate, Optimise]**

> "I follow a structured lifecycle. Define the problem and what a good output looks like. Draft and test across edge cases. Evaluate on five dimensions. Then optimise based on the data."

**[Scroll to the system prompt code block]**

> "This is the actual system prompt for the ReAct agent. A few key design decisions here:"

> "First, the structured output format - Thought, Action, Observation - makes reasoning chains reproducible and debuggable. You can trace exactly why the AI made each decision."

> "Second, explicit guardrails. The agent is told: never provide medical advice, always cite your data sources, and if you're uncertain, say so. In healthcare communications, these guardrails aren't optional - they're safety-critical."

> "Third, a 5-step limit prevents runaway reasoning and controls token costs."

**[Scroll to the Evaluation Metrics chart]**

> "This is the bit I'm most proud of. I tracked metrics across three prompt iterations. Version 1 had a 58% hallucination-free rate. By version 3, after adding few-shot examples and guardrails, that jumped to 93%. That's a 60% improvement through systematic prompt engineering, not just trial and error."

**[Scroll to Test Cases table]**

> "I also test adversarially. When a user asks 'What's the best diet for diabetes?', the agent declines and suggests NHS resources. When someone attempts prompt injection, the agent ignores it and stays in role. All 7 safety test cases pass."

**[Scroll to Healthcare callout]**

> "In healthcare communications, a hallucinated drug interaction could cause real harm. This evaluation framework - versioned prompts, measurable metrics, adversarial testing - is the same discipline you'd need when building AI tools for patient engagement."

---

## PART 6: AGENT TESTING & EVALUATION (1.5 minutes)

**[Navigate to /agent-evaluation]**

> "Testing AI isn't like testing regular software. You need systematic evaluation across multiple dimensions."

**[Point to the overview stats]**

> "I've built a suite of 247 test cases with a 94.3% overall pass rate."

**[Click through the tabs: Functional, Safety, Edge Cases, Adversarial]**

> "The tests are organised into four categories. Functional tests cover core capabilities - does it find pantry items, suggest recipes, predict waste correctly?"

> "Safety tests are the ones that matter most for healthcare. Medical advice refusal is 100%. Data privacy is 100%. Allergen warnings are 100%. These are non-negotiable."

> "Edge cases test graceful degradation - what happens with an empty pantry, a network timeout, or ambiguous input?"

> "And adversarial tests check for prompt injection, role manipulation, and data extraction attempts. All passing."

**[Scroll to the performance line chart]**

> "This shows the improvement trajectory over 12 weeks. Accuracy went from 62% to 94%, consistency from 55% to 91%. The key inflection points were adding few-shot examples at week 4 and guardrails at week 8."

**[Scroll to A/B Testing]**

> "I also ran A/B tests on prompt variants. Variant B - structured prompts with few-shot examples - delivered 91% user satisfaction versus 82% for the baseline. It was slightly slower, but the quality improvement justified it."

---

## PART 7: AI GOVERNANCE - HEALTHCARE THINKING (1.5 minutes)

**[Navigate to /ai-governance]**

> "This is probably the most relevant page for Cuttsy+Cuttsy's healthcare context."

**[Point to the Risk Classification section]**

> "I've classified the app using the EU AI Act risk framework. Nourish Neural sits at 'limited risk' - it's a recommendation system, not a medical device. But here's the key: I voluntarily apply HIGH-risk governance practices, because food safety predictions can indirectly affect health outcomes."

> "That mindset - treating AI outputs as potentially safety-critical even when regulations don't require it - is exactly what you need in healthcare communications."

**[Scroll to the 6 Governance Pillars]**

> "The governance framework covers six pillars: safety first, transparency, fairness and bias monitoring, privacy by design, auditability, and human oversight. AI assists but never overrides human judgement."

**[Scroll to Healthcare Safeguards]**

> "Specific safeguards include a hard boundary on medical advice, food safety conservatism where we'd rather have false positives than false negatives, allergen cross-referencing, and source attribution on every recommendation."

**[Scroll to Regulatory Alignment table]**

> "The architecture aligns with GDPR, NHS Digital Service Standards, NICE evidence frameworks, the EU AI Act, ICO AI guidance, and MHRA Software as Medical Device principles. It's not a medical device, but the architecture is designed so it could extend into regulated environments."

**[Scroll to Incident Response]**

> "And there's a four-step incident response protocol: detect, contain, investigate, remediate. Because in healthcare, having a plan for when AI goes wrong isn't optional."

---

## PART 8: QUICK APP DEMO (1 minute)

**[Switch to the logged-in dashboard tab]**

> "Let me quickly show the actual app in action."

**[Show the Dashboard]**

> "This is the live dashboard - real data from Supabase. Pantry items, grocery lists, spending trends, waste analytics."

**[Navigate to Pantry]**

> "The pantry shows items with freshness indicators and expiry tracking."

**[Navigate to Nurexa AI Assistant]**

> "And this is the conversational AI - Nurexa. The ReAct agent I showed you the prompts for. You can ask it things like 'What's expiring soon?' or 'Suggest a recipe with what I have' and it'll reason through the tools step by step."

---

## PART 9: NUTRITIONAL INSIGHTS (30 seconds - optional, mention if time)

**[Navigate to /nutrition-insights]**

> "One more thing - there's a nutritional analysis engine showing health scores, macronutrient distribution against NHS Eatwell Guide standards, micronutrient coverage, and personalised recommendations. The same architecture that powers clinical nutrition monitoring."

---

## PART 10: CLOSING (30 seconds)

> "So to summarise: this project demonstrates full-stack development, machine learning with an ensemble approach, LLM integration with a ReAct agent, systematic prompt engineering with measurable improvements, comprehensive testing including adversarial scenarios, and governance practices aligned with healthcare standards."

> "I built all of this - the frontend, backend, ML models, agent architecture, and documentation. And I think the most relevant thing for this role isn't just that I can build AI tools, but that I understand WHY responsible AI practices matter, especially in healthcare."

> "Happy to dive deeper into any part of this, or answer any questions."

---

## ANTICIPATED QUESTIONS & ANSWERS

### Q: "What was the hardest technical challenge?"

> "The ML model cold start. TensorFlow takes 15-30 seconds to load, which made the first waste prediction painfully slow. I solved it with a rule-based fallback that gives instant predictions using shelf-life heuristics while the ML models warm up. The fallback is clearly labelled so users know they're getting a simpler prediction. That graceful degradation pattern is something I'd apply in healthcare too - you never want a system that just fails silently."

### Q: "How would you apply this to healthcare communications?"

> "The patterns transfer directly. The ReAct agent architecture could power a patient engagement chatbot - one that reasons step by step, uses tools to look up relevant information, and has explicit guardrails against providing clinical advice outside its scope. The prompt engineering process - define, test, evaluate, optimise - is the same whether you're building a food assistant or a clinical trial support tool. And the governance framework - risk classification, safety-first design, audit trails - is exactly what you'd need for healthcare AI."

### Q: "What would you improve if you had more time?"

> "Three things. First, I'd add a proper experiment tracking system - something like MLflow or Weights & Biases - to version models and track metrics over time rather than using the evaluation framework I built manually. Second, I'd implement user feedback more deeply - right now the testing is pre-deployment, but I'd want ongoing monitoring of real user interactions. Third, I'd explore RAG - Retrieval Augmented Generation - to ground the agent's responses in verified nutritional databases rather than relying solely on the LLM's training data."

### Q: "What experience do you have with no-code/low-code tools?"

> "This project is primarily code-based, but I understand the value of low-code platforms for rapid prototyping. The ReAct agent pattern I built could easily be replicated in something like n8n or Zapier for simpler workflows. I think the right approach is matching the tool to the problem - code when you need full control and customisation, low-code when you need speed and team accessibility. I'm keen to learn whatever platforms Cuttsy+Cuttsy uses."

### Q: "How do you stay current with AI developments?"

> "I actively experiment. This project uses Ollama for local LLM inference because I was exploring how to run models without sending data to external APIs - important for privacy-sensitive applications. I follow developments from Anthropic, OpenAI, and open-source communities. I experiment with new models, prompting techniques, and evaluation frameworks. And I try to understand not just what's possible, but what's responsible - which is why I built the governance and testing pages."

### Q: "Why food waste? What's the connection to healthcare?"

> "Food waste is a public health issue. Diet-related diseases cost the NHS over 6 billion pounds annually. A platform that helps households eat better, waste less, and understand nutrition has genuine health outcomes. The allergen tracking, nutritional analysis against NHS guidelines, and food safety predictions all sit at the intersection of food and health. And technically, the same AI patterns - prediction, personalisation, safety guardrails - apply directly to patient-facing tools."

### Q: "What's your understanding of responsible AI in healthcare?"

> "It's not just about accuracy - it's about trust. Healthcare AI needs to be explainable so clinicians and patients understand why a recommendation was made. It needs to be auditable so regulators can review decisions. It needs to fail safely - graceful degradation rather than silent errors. And it needs governance - not as an afterthought, but baked into the architecture from day one. That's what I tried to demonstrate with this project: every AI output has a confidence score, every prediction is traceable, and there are explicit boundaries around what the AI will and won't advise on."

---

## NAVIGATION QUICK REFERENCE

| Page | URL | Key Talking Point |
|---|---|---|
| Landing Page | `/` | Business value, user journey |
| How It Works | `/how-it-works` | Tech stack, ML pipeline, architecture |
| AI Explainability | `/ai-explainability` | Feature importance, model transparency |
| Prompt Lab | `/prompt-lab` | Prompt engineering process, evaluation metrics |
| Agent Evaluation | `/agent-evaluation` | 247 test cases, safety testing, A/B results |
| AI Governance | `/ai-governance` | EU AI Act, healthcare safeguards, compliance |
| Nutrition Insights | `/nutrition-insights` | NHS Eatwell Guide, health scoring |
| Dashboard | `/app/dashboard` | Live app, real data |
| Nurexa AI | `/app/ai-assistant` | Live agent demo |
| Support | `/support` | FAQ, professional polish |
| Contact | `/contact` | Contact form, professional polish |
| GDPR Controls | `/app/profile` (My Data tab) | Data export, GDPR Article 17 |

---

## TIMING GUIDE

| Section | Duration | Running Total |
|---|---|---|
| The Hook | 0:30 | 0:30 |
| Landing Page | 1:30 | 2:00 |
| How It Works | 2:00 | 4:00 |
| AI Explainability | 2:00 | 6:00 |
| Prompt Engineering Lab | 2:00 | 8:00 |
| Agent Testing | 1:30 | 9:30 |
| AI Governance | 1:30 | 11:00 |
| Quick App Demo | 1:00 | 12:00 |
| Nutrition (optional) | 0:30 | 12:30 |
| Closing | 0:30 | 13:00 |

**If short on time:** Skip Nutrition Insights and shorten the Architecture section. The Prompt Lab, Agent Evaluation, and Governance pages are the highest-impact for this specific role.

**If they want to go deeper:** The live app demo (dashboard, pantry, Nurexa AI) can expand to 3-5 minutes. Let them ask questions and drive the exploration.

---

## KEY PHRASES TO USE (mapped to job description)

- "Rapidly prototyping" - use when describing how you built features
- "Translating business problems into AI solutions" - use when explaining the user journey
- "Prompt engineering, evaluation, and optimisation" - use at the Prompt Lab page
- "Testing and improving AI outputs for quality and consistency" - use at the Agent Evaluation page
- "Responsible AI practices in a healthcare context" - use at the Governance page
- "Experimenting with LLMs" - use when discussing Ollama and the ReAct agent
- "Build-and-test mindset" - use when describing your iterative approach
- "Governance with particular care given the healthcare context" - use at the Governance page

---

*Good luck. You've built something genuinely impressive. Own it.*
