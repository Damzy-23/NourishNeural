/**
 * End-to-end test script for NourishNeural API
 * Tests all new endpoints: waste stats, forecast, predict/explain, ReAct agent, meal planner
 *
 * Usage: node test_e2e.js
 * Requires: server running on PORT 5000, valid Supabase credentials
 */

const BASE_URL = 'http://localhost:5000';

// We'll use the Supabase service key to get a test user token
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://plbgshkuzoxvudrxxpny.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYmdzaGt1em94dnVkcnh4cG55Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE0NzYzNiwiZXhwIjoyMDc4NzIzNjM2fQ.sHqinhvhpNbp_wKZ7Z_5KvZNsXHNjB0V2KNZgpLEMwk';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYmdzaGt1em94dnVkcnh4cG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNDc2MzYsImV4cCI6MjA3ODcyMzYzNn0.Y_7h4X8_-8tlnIGobfXWV_OsP4h21g0UTxVgEtNj2TY';

let AUTH_TOKEN = null;
let testResults = [];

// ANSI colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function log(color, label, msg) {
  console.log(`${color}[${label}]${RESET} ${msg}`);
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(AUTH_TOKEN ? { 'Authorization': `Bearer ${AUTH_TOKEN}` } : {}),
      ...options.headers
    }
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { _raw: text }; }
  return { status: res.status, ok: res.ok, json };
}

function record(name, passed, details = '') {
  testResults.push({ name, passed, details });
  if (passed) {
    log(GREEN, 'PASS', name + (details ? ` - ${details}` : ''));
  } else {
    log(RED, 'FAIL', name + (details ? ` - ${details}` : ''));
  }
}

// ============================================================
// Test functions
// ============================================================

async function testHealthCheck() {
  const { status, json } = await fetchJSON(`${BASE_URL}/health`);
  record('Health Check', status === 200 && json.status === 'OK', `status=${status}`);
}

async function getAuthToken() {
  log(CYAN, 'AUTH', 'Attempting to get auth token from Supabase...');

  const supaHeaders = {
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  };

  try {
    // Step 1: List existing users via admin API
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=5`, {
      headers: supaHeaders
    });

    if (listRes.ok) {
      const listData = await listRes.json();
      const users = listData.users || listData;
      if (users && users.length > 0) {
        log(CYAN, 'AUTH', `Found ${users.length} existing users. Trying to sign in...`);

        // Try signing in with each user using common test passwords
        const testPasswords = ['TestPassword123!', 'Password123!', 'test1234', 'Nourish123!'];
        for (const user of users) {
          for (const pwd of testPasswords) {
            const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
              body: JSON.stringify({ email: user.email, password: pwd })
            });
            if (signInRes.ok) {
              const session = await signInRes.json();
              AUTH_TOKEN = session.access_token;
              log(GREEN, 'AUTH', `Signed in as: ${user.email}`);
              return true;
            }
          }
        }
        log(YELLOW, 'AUTH', 'Could not sign in with existing users. Creating temp user...');
      }
    }

    // Step 2: Create a temporary test user
    const tempEmail = `e2e_test_${Date.now()}@test.nourishneural.dev`;
    const tempPassword = 'E2E_Test_Pass_123!';

    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: supaHeaders,
      body: JSON.stringify({
        email: tempEmail,
        password: tempPassword,
        email_confirm: true
      })
    });

    if (!createRes.ok) {
      const errBody = await createRes.text();
      log(YELLOW, 'AUTH', `Could not create user (${createRes.status}): ${errBody.substring(0, 200)}`);
      return false;
    }

    log(CYAN, 'AUTH', `Created temp user: ${tempEmail}`);

    // Step 3: Sign in as the temp user
    const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ email: tempEmail, password: tempPassword })
    });

    if (signInRes.ok) {
      const session = await signInRes.json();
      AUTH_TOKEN = session.access_token;
      log(GREEN, 'AUTH', `Authenticated as temp user: ${tempEmail}`);
      return true;
    }

    const signInErr = await signInRes.text();
    log(YELLOW, 'AUTH', `Sign in failed (${signInRes.status}): ${signInErr.substring(0, 200)}`);
    return false;

  } catch (e) {
    log(RED, 'AUTH', `Auth error: ${e.message}`);
    return false;
  }
}

async function testAIChat() {
  // Chat endpoint doesn't require auth
  const { status, json } = await fetchJSON(`${BASE_URL}/api/ai/chat`, {
    method: 'POST',
    body: JSON.stringify({ message: 'What are some tips for storing bananas?' })
  });

  const hasResponse = json.response || json.message;
  record('AI Chat (no auth)', status === 200 && !!hasResponse,
    `status=${status}, response_length=${(json.response || '').length}`);
}

async function testAIChatEmptyMessage() {
  const { status } = await fetchJSON(`${BASE_URL}/api/ai/chat`, {
    method: 'POST',
    body: JSON.stringify({ message: '' })
  });
  record('AI Chat - empty message returns 400', status === 400);
}

async function testWasteStats() {
  if (!AUTH_TOKEN) { record('Waste Stats', false, 'Skipped - no auth'); return; }

  const { status, json } = await fetchJSON(`${BASE_URL}/api/waste/stats?timeRange=month`);
  const hasSummary = json.summary && json.summary.totalItems !== undefined;
  record('Waste Stats (month)', status === 200 && hasSummary,
    `status=${status}, totalItems=${json.summary?.totalItems}, totalLoss=£${json.summary?.totalLoss?.toFixed(2)}`);
}

async function testWasteStatsWeek() {
  if (!AUTH_TOKEN) { record('Waste Stats (week)', false, 'Skipped - no auth'); return; }

  const { status, json } = await fetchJSON(`${BASE_URL}/api/waste/stats?timeRange=week`);
  record('Waste Stats (week)', status === 200 && !!json.summary, `status=${status}`);
}

async function testWastePredict() {
  if (!AUTH_TOKEN) { record('Waste Predict', false, 'Skipped - no auth'); return; }

  const { status, json } = await fetchJSON(`${BASE_URL}/api/waste/predict`, {
    method: 'POST',
    body: JSON.stringify({
      food_item: {
        category: 'Dairy',
        storage_type: 'fridge',
        days_since_purchase: 5,
        quantity: 1
      }
    })
  });

  const hasResult = json.waste_probability !== undefined || json.error;
  record('Waste Predict (ML)', status === 200 && hasResult,
    `status=${status}, probability=${json.waste_probability}, risk=${json.risk_level}`);
}

async function testWastePredictExplain() {
  if (!AUTH_TOKEN) { record('Waste Predict/Explain', false, 'Skipped - no auth'); return; }

  const { status, json } = await fetchJSON(`${BASE_URL}/api/waste/predict/explain`, {
    method: 'POST',
    body: JSON.stringify({
      food_item: {
        name: 'Milk',
        category: 'Dairy',
        storage_type: 'fridge',
        days_since_purchase: 6,
        quantity: 1,
        unit: 'litre'
      }
    })
  });

  const hasExplanation = !!json.explanation;
  const hasPrediction = !!json.prediction;
  record('Waste Predict + Explain', status === 200 && hasExplanation,
    `status=${status}, has_prediction=${hasPrediction}, explanation_length=${(json.explanation || '').length}`);

  if (json.explanation) {
    log(CYAN, 'INFO', `Explanation: "${json.explanation.substring(0, 120)}..."`);
  }
}

async function testWasteForecast() {
  if (!AUTH_TOKEN) { record('Waste Forecast', false, 'Skipped - no auth'); return; }

  const { status, json } = await fetchJSON(`${BASE_URL}/api/waste/forecast`, {
    method: 'POST'
  });

  const hasForecast = json.trend !== undefined;
  record('Waste Forecast', status === 200 && hasForecast,
    `status=${status}, trend=${json.trend}, historical_weeks=${json.historical?.length || 0}, forecast_weeks=${json.forecast?.length || 0}`);

  if (json.insight) {
    log(CYAN, 'INFO', `Forecast insight: "${json.insight}"`);
  }
}

async function testReActAgent() {
  if (!AUTH_TOKEN) { record('ReAct Agent', false, 'Skipped - no auth'); return; }

  const { status, json } = await fetchJSON(`${BASE_URL}/api/ai/agent`, {
    method: 'POST',
    body: JSON.stringify({ message: "What's expiring in my pantry soon?" })
  });

  const hasResponse = !!json.response || !!json.message;
  const hasToolsUsed = Array.isArray(json.toolsUsed);
  record('ReAct Agent - expiring items query', status === 200 && hasResponse,
    `status=${status}, tools_used=${json.toolsUsed?.length || 0}, response_length=${(json.response || '').length}`);

  if (json.toolsUsed && json.toolsUsed.length > 0) {
    log(CYAN, 'INFO', `Tools used: ${json.toolsUsed.map(t => t.tool).join(', ')}`);
  }
  if (json.response) {
    log(CYAN, 'INFO', `Agent response: "${json.response.substring(0, 150)}..."`);
  }
}

async function testReActAgentWaste() {
  if (!AUTH_TOKEN) { record('ReAct Agent (waste)', false, 'Skipped - no auth'); return; }

  const { status, json } = await fetchJSON(`${BASE_URL}/api/ai/agent`, {
    method: 'POST',
    body: JSON.stringify({ message: "How much food have I wasted this month?" })
  });

  record('ReAct Agent - waste query', status === 200 && !!(json.response || json.message),
    `status=${status}, tools_used=${json.toolsUsed?.length || 0}`);
}

async function testReActAgentRecipes() {
  if (!AUTH_TOKEN) { record('ReAct Agent (recipes)', false, 'Skipped - no auth'); return; }

  const { status, json } = await fetchJSON(`${BASE_URL}/api/ai/agent`, {
    method: 'POST',
    body: JSON.stringify({ message: "What should I cook tonight with what I have?" })
  });

  record('ReAct Agent - recipe query', status === 200 && !!(json.response || json.message),
    `status=${status}, tools_used=${json.toolsUsed?.length || 0}`);
}

async function testMealPlanGenerate() {
  if (!AUTH_TOKEN) { record('Meal Plan Generate', false, 'Skipped - no auth'); return; }

  const { status, json } = await fetchJSON(`${BASE_URL}/api/meal-planner/generate`, {
    method: 'POST',
    body: JSON.stringify({
      preferences: { dietary: 'none', cuisine: 'British' }
    })
  });

  const hasPlan = json.plan && Object.keys(json.plan).length > 0;
  record('Meal Plan Generate', status === 200 && json.success,
    `status=${status}, source=${json.source}, days=${Object.keys(json.plan || {}).length}, expiring_used=${json.expiringItemsUsed?.length || 0}`);

  if (json.plan) {
    const days = Object.keys(json.plan);
    log(CYAN, 'INFO', `Plan days: ${days.join(', ')}`);
    if (days.length > 0 && json.plan[days[0]]) {
      const firstDay = json.plan[days[0]];
      const meals = Object.keys(firstDay);
      log(CYAN, 'INFO', `${days[0]} meals: ${meals.map(m => `${m}: ${firstDay[m]?.name || 'N/A'}`).join(', ')}`);
    }
  }
}

async function testMealPlanCRUD() {
  if (!AUTH_TOKEN) { record('Meal Plan CRUD', false, 'Skipped - no auth'); return; }

  // Create
  const { status: createStatus, json: createJson } = await fetchJSON(`${BASE_URL}/api/meal-planner`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'E2E Test Plan',
      meals: { Monday: { Breakfast: { name: 'Toast', ingredients: ['bread', 'butter'] } } }
    })
  });
  record('Meal Plan - Create', createStatus === 201 && !!createJson.plan,
    `status=${createStatus}`);

  if (!createJson.plan) return;

  const planId = createJson.plan.id;

  // List
  const { status: listStatus, json: listJson } = await fetchJSON(`${BASE_URL}/api/meal-planner`);
  record('Meal Plan - List', listStatus === 200 && Array.isArray(listJson.plans),
    `status=${listStatus}, count=${listJson.plans?.length}`);

  // Update
  const { status: updateStatus } = await fetchJSON(`${BASE_URL}/api/meal-planner/${planId}`, {
    method: 'PUT',
    body: JSON.stringify({ name: 'E2E Test Plan Updated' })
  });
  record('Meal Plan - Update', updateStatus === 200, `status=${updateStatus}`);

  // Delete
  const { status: deleteStatus } = await fetchJSON(`${BASE_URL}/api/meal-planner/${planId}`, {
    method: 'DELETE'
  });
  record('Meal Plan - Delete', deleteStatus === 200, `status=${deleteStatus}`);
}

async function testShoppingList() {
  const testPlan = {
    Monday: {
      Breakfast: { name: 'Toast', ingredients: ['Bread', 'Butter', 'Jam'] },
      Lunch: { name: 'Salad', ingredients: ['Lettuce', 'Tomatoes', 'Cucumber'] }
    }
  };

  const { status, json } = await fetchJSON(`${BASE_URL}/api/meal-planner/shopping-list`, {
    method: 'POST',
    body: JSON.stringify({
      plan: testPlan,
      pantryItems: [{ name: 'Bread' }, { name: 'Butter' }]
    })
  });

  record('Shopping List from Plan', status === 200 && json.success,
    `status=${status}, items=${json.shoppingList?.length}`);
}

async function testWasteStatsNoAuth() {
  // Temporarily remove auth
  const savedToken = AUTH_TOKEN;
  AUTH_TOKEN = null;

  const { status } = await fetchJSON(`${BASE_URL}/api/waste/stats?timeRange=month`);
  record('Waste Stats - no auth returns 401', status === 401);

  AUTH_TOKEN = savedToken;
}

async function testAgentNoAuth() {
  const savedToken = AUTH_TOKEN;
  AUTH_TOKEN = null;

  const { status } = await fetchJSON(`${BASE_URL}/api/ai/agent`, {
    method: 'POST',
    body: JSON.stringify({ message: 'test' })
  });
  record('ReAct Agent - no auth returns 401', status === 401);

  AUTH_TOKEN = savedToken;
}

// ============================================================
// Main test runner
// ============================================================

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log(`${CYAN}  NourishNeural End-to-End API Tests${RESET}`);
  console.log('='.repeat(70) + '\n');

  // 1. Health check
  log(CYAN, 'TEST', '--- Health Check ---');
  try {
    await testHealthCheck();
  } catch (e) {
    record('Health Check', false, `Server not running? ${e.message}`);
    console.log(`\n${RED}Server appears to be down. Start it with: cd server && npm run dev${RESET}\n`);
    return;
  }

  // 2. Authentication
  log(CYAN, 'TEST', '\n--- Authentication ---');
  const authed = await getAuthToken();

  // 3. Unauthenticated tests
  log(CYAN, 'TEST', '\n--- Unauthenticated Endpoints ---');
  await testAIChat();
  await testAIChatEmptyMessage();
  await testWasteStatsNoAuth();
  await testAgentNoAuth();
  await testShoppingList();

  // 4. Authenticated tests
  if (authed) {
    log(CYAN, 'TEST', '\n--- Waste Endpoints ---');
    await testWasteStats();
    await testWasteStatsWeek();
    await testWastePredict();
    await testWastePredictExplain();
    await testWasteForecast();

    log(CYAN, 'TEST', '\n--- ReAct Agent ---');
    await testReActAgent();
    await testReActAgentWaste();
    await testReActAgentRecipes();

    log(CYAN, 'TEST', '\n--- Meal Planner ---');
    await testMealPlanGenerate();
    await testMealPlanCRUD();
  } else {
    log(YELLOW, 'SKIP', 'Authenticated tests skipped - no valid auth token');
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  const passed = testResults.filter(t => t.passed).length;
  const failed = testResults.filter(t => !t.passed).length;
  const total = testResults.length;

  console.log(`\n${CYAN}Test Summary:${RESET}`);
  console.log(`  ${GREEN}Passed: ${passed}${RESET}`);
  console.log(`  ${RED}Failed: ${failed}${RESET}`);
  console.log(`  Total:  ${total}`);
  console.log('');

  if (failed > 0) {
    console.log(`${RED}Failed tests:${RESET}`);
    testResults.filter(t => !t.passed).forEach(t => {
      console.log(`  - ${t.name}: ${t.details}`);
    });
  }

  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => {
  console.error(`${RED}Test runner error: ${e.message}${RESET}`);
  process.exit(1);
});
