const express = require('express');
const { authenticateJWT, optionalAuth } = require('../middleware/supabaseAuth');
const OpenAI = require('openai');

// TODO: Re-enable rate limiting when ready
const aiRateLimit = (req, res, next) => next(); // Temporarily bypass rate limiting

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Enhanced AI Chat endpoint with fallback responses
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    console.log('🤖 AI Chat request received:', message?.substring(0, 50));

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Try OpenAI first, then fallback to enhanced local responses
    let aiResponse;
    let responseType = 'text';

    try {
      if (process.env.OPENAI_API_KEY) {
        console.log('🤖 Attempting OpenAI call...');

        // Build system prompt for Nurexa AI - conversational and human-like
        const systemPrompt = `You are Nurexa, a friendly AI food companion in the Nourish Neural app. You're like a knowledgeable friend who genuinely cares about helping people eat better.

PERSONALITY:
- Warm, approachable, and encouraging - never preachy or judgmental
- Speak naturally like a real person, not a textbook or health pamphlet
- Use casual language, contractions, and occasional humor when appropriate
- Be empathetic - acknowledge that eating healthy can be challenging
- Give honest, practical advice that works in real life

COMMUNICATION STYLE:
- Start with a direct, helpful response to their question
- Keep responses concise but complete - don't overwhelm with bullet points
- Use 2-3 key points max, not endless lists
- Share tips like you're chatting with a friend over coffee
- Ask follow-up questions to personalize advice when relevant
- Use "you" and "I" to feel personal, not formal
- Write in flowing paragraphs when possible, not step-by-step lists
- For recipes, write conversationally like explaining to a friend, not numbered instructions

FORMATTING RULES:
- NEVER use markdown formatting like **bold**, *italics*, or ### headers
- NEVER use numbered lists (1. 2. 3.) for instructions
- Write naturally in paragraphs instead
- If you must list things, use simple dashes (-) sparingly
- Keep it clean and readable without special formatting

AVOID:
- Generic health disclaimers like "consult a healthcare professional"
- Long numbered lists that feel like Wikipedia articles
- Overly formal or clinical language
- Repeating the same advice structure every time
- Being preachy about "healthy eating" - meet people where they are
- Any markdown syntax (**bold**, *italic*, ##headers, etc.)

KNOWLEDGE:
- UK-focused (supermarkets, products, measurements)
- Practical cooking tips from real kitchen experience
- Budget-conscious advice
- Modern understanding of nutrition (not outdated food pyramid stuff)

Remember: You're helping a friend, not writing a health textbook. Be real, be helpful, be human.`;

        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 600,
          temperature: 0.85
        });

        aiResponse = completion.choices[0].message.content;
        console.log('🤖 OpenAI response received successfully');
      } else {
        console.log('🤖 No OpenAI API key, using fallback');
        throw new Error('No OpenAI API key');
      }
    } catch (openaiError) {
      console.error('🤖 OpenAI API error:', openaiError.message);
      console.log('🤖 Using fallback response...');
      // Enhanced fallback responses with context awareness
      try {
        aiResponse = generateFallbackResponse(message, context);
        responseType = getResponseType(message);
        console.log('🤖 Fallback response generated successfully');
      } catch (fallbackError) {
        console.error('🤖 Fallback also failed:', fallbackError.message);
        aiResponse = `I'd be happy to help with that! For budget-friendly grocery shopping, my top tips are: shop at Aldi or Lidl for basics, plan your meals before shopping, buy seasonal produce, and don't shop when you're hungry. What specific aspect of budget shopping would you like more help with?`;
        responseType = 'text';
      }
    }

    // Parse response for structured data
    const response = {
      response: aiResponse,
      message: aiResponse,
      type: responseType,
      suggestions: extractSuggestions(aiResponse),
      recipes: extractRecipes(aiResponse),
      nutritionInfo: extractNutritionInfo(aiResponse),
      substitutions: extractSubstitutions(aiResponse),
      data: {
        recipes: extractRecipes(aiResponse),
        nutrition: extractNutritionInfo(aiResponse),
        substitutions: extractSubstitutions(aiResponse)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('🤖 AI Chat Critical Error:', error.message);
    console.error(error.stack);

    // Even if everything fails, return a helpful response
    res.json({
      response: `Great question! I'd love to help with that. While I'm having a small technical hiccup, here's a quick tip: for budget shopping, Aldi and Lidl are your best friends for everyday items, and shopping in the evening often gets you reduced items. What specifically would you like to know more about?`,
      message: `Great question! I'd love to help with that. While I'm having a small technical hiccup, here's a quick tip: for budget shopping, Aldi and Lidl are your best friends for everyday items, and shopping in the evening often gets you reduced items. What specifically would you like to know more about?`,
      type: 'text',
      suggestions: [],
      recipes: [],
      nutritionInfo: null,
      substitutions: [],
      data: { recipes: [], nutrition: null, substitutions: [] }
    });
  }
});

// Recipe suggestions based on ingredients
router.post('/recipes', authenticateJWT, aiRateLimit, async (req, res) => {
  try {
    const { ingredients, dietaryRestrictions, cuisine, difficulty } = req.body;
    
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients are required' });
    }

    const prompt = `Suggest 3 recipes using these ingredients: ${ingredients.join(', ')}.
${dietaryRestrictions ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}.` : ''}
${cuisine ? `Preferred cuisine: ${cuisine}.` : ''}
${difficulty ? `Difficulty level: ${difficulty}.` : ''}

For each recipe, provide:
- Recipe name
- Ingredients list with quantities
- Step-by-step instructions
- Prep and cook time
- Servings
- Difficulty level
- Cuisine type
- Nutritional info per serving (calories, protein, carbs, fat)`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a culinary expert. Provide detailed, practical recipes.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.8
    });

    const recipes = parseRecipes(completion.choices[0].message.content);
    res.json({ recipes });
  } catch (error) {
    console.error('Recipe Generation Error:', error);
    res.status(500).json({ error: 'Recipe generation failed' });
  }
});

// Nutrition analysis
router.post('/nutrition', optionalAuth, aiRateLimit, async (req, res) => {
  try {
    const { food, quantity, unit } = req.body;
    
    if (!food) {
      return res.status(400).json({ error: 'Food item is required' });
    }

    const prompt = `Provide detailed nutritional information for ${quantity || 1} ${unit || 'serving'} of ${food}.
Include:
- Calories
- Protein (g)
- Carbohydrates (g)
- Fat (g)
- Fiber (g)
- Sugar (g)
- Sodium (mg)
- Any notable vitamins or minerals

Provide accurate, UK-standard nutritional information.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a nutrition expert. Provide accurate nutritional information.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.3
    });

    const nutritionInfo = parseNutritionInfo(completion.choices[0].message.content);
    res.json({ nutritionInfo });
  } catch (error) {
    console.error('Nutrition Analysis Error:', error);
    res.status(500).json({ error: 'Nutrition analysis failed' });
  }
});

// Food substitutions
router.post('/substitutions', optionalAuth, aiRateLimit, async (req, res) => {
  try {
    const { ingredient, reason } = req.body;
    
    if (!ingredient) {
      return res.status(400).json({ error: 'Ingredient is required' });
    }

    const prompt = `Suggest 3-5 substitutes for ${ingredient}.
${reason ? `Reason for substitution: ${reason}.` : ''}

For each substitute, provide:
- Substitute name
- How to use it (ratio/conversion)
- Any adjustments needed in the recipe
- Availability in UK supermarkets
- Cost comparison`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a culinary expert. Provide practical substitution advice.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.6
    });

    const substitutions = parseSubstitutions(completion.choices[0].message.content);
    res.json({ substitutions });
  } catch (error) {
    console.error('Substitution Error:', error);
    res.status(500).json({ error: 'Substitution suggestions failed' });
  }
});

// Grocery shopping tips
router.post('/shopping-tips', authenticateJWT, aiRateLimit, async (req, res) => {
  try {
    const { budget, dietaryRestrictions, householdSize, mealPlan } = req.body;

    const prompt = `Provide grocery shopping tips for:
- Budget: £${budget || 'flexible'}
- Dietary restrictions: ${dietaryRestrictions ? dietaryRestrictions.join(', ') : 'none'}
- Household size: ${householdSize || 1} people
${mealPlan ? `- Meal plan: ${mealPlan}` : ''}

Include:
- Budget-saving strategies
- Shopping list organization tips
- Best times to shop for deals
- UK supermarket recommendations
- Meal planning advice
- Food waste reduction tips`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a grocery shopping expert. Provide practical, UK-focused advice.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const tips = completion.choices[0].message.content;
    res.json({ tips });
  } catch (error) {
    console.error('Shopping Tips Error:', error);
    res.status(500).json({ error: 'Shopping tips generation failed' });
  }
});

// Helper functions for parsing AI responses
function extractSuggestions(response) {
  // Extract bullet points or numbered suggestions
  const suggestions = response.match(/(?:^|\n)[•\-\*]\s*(.+?)(?=\n|$)/g);
  return suggestions ? suggestions.map(s => s.replace(/^[•\-\*]\s*/, '').trim()) : [];
}

function extractRecipes(response) {
  // Basic recipe extraction - in production, use more sophisticated parsing
  const recipes = [];
  const recipeBlocks = response.split(/(?=Recipe|Recipe \d+|^Recipe)/gi);
  
  recipeBlocks.forEach(block => {
    if (block.trim().length > 50) {
      recipes.push({
        name: extractRecipeName(block),
        instructions: extractInstructions(block),
        ingredients: extractIngredients(block)
      });
    }
  });
  
  return recipes;
}

function extractRecipeName(block) {
  const nameMatch = block.match(/(?:Recipe|Recipe \d+):\s*(.+?)(?:\n|Ingredients|Instructions)/i);
  return nameMatch ? nameMatch[1].trim() : 'Untitled Recipe';
}

function extractIngredients(block) {
  const ingredients = [];
  const ingredientMatches = block.match(/(?:^|\n)[•\-\*]\s*(.+?)(?=\n|$)/g);
  if (ingredientMatches) {
    ingredients.push(...ingredientMatches.map(i => i.replace(/^[•\-\*]\s*/, '').trim()));
  }
  return ingredients;
}

function extractInstructions(block) {
  const instructions = [];
  const instructionMatches = block.match(/(?:^|\n)\d+\.\s*(.+?)(?=\n\d+\.|$)/g);
  if (instructionMatches) {
    instructions.push(...instructionMatches.map(i => i.replace(/^\d+\.\s*/, '').trim()));
  }
  return instructions;
}

function extractNutritionInfo(response) {
  // Extract nutritional values
  const nutrition = {};
  const caloriesMatch = response.match(/calories?[:\s]*(\d+(?:\.\d+)?)/i);
  const proteinMatch = response.match(/protein[:\s]*(\d+(?:\.\d+)?)/i);
  const carbsMatch = response.match(/carbohydrates?[:\s]*(\d+(?:\.\d+)?)/i);
  const fatMatch = response.match(/fat[:\s]*(\d+(?:\.\d+)?)/i);
  
  if (caloriesMatch) nutrition.calories = parseFloat(caloriesMatch[1]);
  if (proteinMatch) nutrition.protein = parseFloat(proteinMatch[1]);
  if (carbsMatch) nutrition.carbs = parseFloat(carbsMatch[1]);
  if (fatMatch) nutrition.fat = parseFloat(fatMatch[1]);
  
  return Object.keys(nutrition).length > 0 ? nutrition : null;
}

function extractSubstitutions(response) {
  // Extract substitution suggestions
  const substitutions = [];
  const subMatches = response.match(/(?:^|\n)[•\-\*]\s*(.+?)(?=\n|$)/g);
  if (subMatches) {
    substitutions.push(...subMatches.map(s => s.replace(/^[•\-\*]\s*/, '').trim()));
  }
  return substitutions;
}

function parseRecipes(response) {
  // More sophisticated recipe parsing
  return extractRecipes(response);
}

function parseNutritionInfo(response) {
  return extractNutritionInfo(response);
}

function parseSubstitutions(response) {
  return extractSubstitutions(response);
}

// Enhanced fallback response generation
function generateFallbackResponse(message, context) {
  const lowerMessage = message.toLowerCase();
  
  // Recipe-related queries
  if (lowerMessage.includes('recipe') || lowerMessage.includes('cook') || lowerMessage.includes('make')) {
    return generateRecipeResponse(message, context);
  }
  
  // Nutrition queries
  if (lowerMessage.includes('nutrition') || lowerMessage.includes('calories') || lowerMessage.includes('protein') || lowerMessage.includes('vitamin')) {
    return generateNutritionResponse(message, context);
  }
  
  // Substitution queries
  if (lowerMessage.includes('substitute') || lowerMessage.includes('replace') || lowerMessage.includes('instead of')) {
    return generateSubstitutionResponse(message, context);
  }
  
  // Shopping queries
  if (lowerMessage.includes('shop') || lowerMessage.includes('buy') || lowerMessage.includes('grocery') || lowerMessage.includes('budget')) {
    return generateShoppingResponse(message, context);
  }
  
  // Meal planning queries
  if (lowerMessage.includes('meal plan') || lowerMessage.includes('meal prep') || lowerMessage.includes('weekly menu')) {
    return generateMealPlanningResponse(message, context);
  }
  
  // Expiry/freshness queries
  if (lowerMessage.includes('expire') || lowerMessage.includes('fresh') || lowerMessage.includes('spoiled') || lowerMessage.includes('bad')) {
    return generateFreshnessResponse(message, context);
  }
  
  // General food advice
  if (lowerMessage.includes('healthy') || lowerMessage.includes('diet') || lowerMessage.includes('eat')) {
    return generateHealthResponse(message, context);
  }
  
  // Default helpful response
  return generateDefaultResponse(message, context);
}

function generateRecipeResponse(message, context) {
  const responses = [
    `Based on your question about cooking, here are some great recipe suggestions:

**Quick & Easy Options:**
• **One-Pan Chicken & Vegetables** - Season chicken breast with herbs, add mixed vegetables, roast at 200°C for 25-30 minutes
• **Pasta with Garlic & Olive Oil** - Cook pasta, sauté minced garlic in olive oil, toss with pasta and parmesan
• **Simple Stir-Fry** - Use any vegetables you have, add protein, season with soy sauce and ginger

**Tips for Better Cooking:**
• Always taste and adjust seasoning as you go
• Prep ingredients before you start cooking
• Use fresh herbs when possible for maximum flavor
• Don't overcrowd the pan when cooking meat

Would you like specific recipes for any particular cuisine or dietary requirements?`,
    
    `I'd love to help you with cooking! Here are some versatile recipe ideas:

**Budget-Friendly Meals:**
• **Bean & Rice Bowl** - Mix cooked rice with canned beans, add vegetables and your favorite sauce
• **Egg Fried Rice** - Use leftover rice, scramble eggs, add vegetables and soy sauce
• **Vegetable Soup** - Sauté onions and garlic, add any vegetables, cover with stock and simmer

**Time-Saving Tips:**
• Batch cook grains and proteins on weekends
• Use frozen vegetables for quick meals
• Keep basic seasonings on hand (salt, pepper, garlic powder, herbs)

What type of meal are you planning to make? I can give you more specific suggestions!`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateNutritionResponse(message, context) {
  const responses = [
    `Great question about nutrition! Here's some helpful information:

**General Nutrition Tips:**
• Aim for 5 portions of fruits and vegetables daily
• Include lean proteins (chicken, fish, beans, tofu)
• Choose whole grains over refined grains
• Stay hydrated with water throughout the day
• Limit processed foods and added sugars

**Key Nutrients to Focus On:**
• **Protein**: Builds and repairs tissues (aim for 0.8g per kg body weight)
• **Fiber**: Supports digestion (25-35g daily)
• **Healthy Fats**: Essential for brain function (avocados, nuts, olive oil)
• **Vitamins & Minerals**: Eat a variety of colorful foods

**UK-Specific Tips:**
• Check the traffic light system on food labels
• Look for the "Eatwell Guide" recommendations
• Seasonal produce is often more nutritious and affordable

Would you like specific nutrition info for any particular food or meal?`,
    
    `Nutrition is so important for your health! Here's what you should know:

**Balanced Plate Method:**
• 1/2 plate: Fruits and vegetables
• 1/4 plate: Lean protein
• 1/4 plate: Whole grains or starchy vegetables
• Small amount of healthy fats

**Reading UK Food Labels:**
• Red = High (limit these)
• Amber = Medium (eat occasionally) 
• Green = Low (good choice)
• Check serving sizes - they're often smaller than you think!

**Common Nutritional Concerns:**
• **Iron**: Found in red meat, spinach, lentils
• **Vitamin D**: Get from sunlight, oily fish, fortified foods
• **Calcium**: Dairy products, leafy greens, fortified alternatives

What specific nutritional information are you looking for?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateSubstitutionResponse(message, context) {
  const commonSubstitutions = {
    'eggs': 'Flax eggs (1 tbsp ground flaxseed + 3 tbsp water), applesauce, or mashed banana work well in baking',
    'butter': 'Vegetable oil, coconut oil, or margarine in equal amounts. For baking, use 3/4 the amount of oil',
    'milk': 'Plant-based alternatives like oat, almond, or soy milk work great in most recipes',
    'flour': 'Gluten-free flour blends, almond flour, or coconut flour (adjust quantities)',
    'sugar': 'Honey, maple syrup, or stevia (adjust sweetness to taste)',
    'cheese': 'Nutritional yeast, vegan cheese alternatives, or hummus for creaminess'
  };
  
  let response = `I can help you find substitutions! Here are some common ones:\n\n`;
  
  Object.entries(commonSubstitutions).forEach(([ingredient, substitute]) => {
    response += `**${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}**: ${substitute}\n\n`;
  });
  
  response += `**General Substitution Tips:**\n`;
  response += `• Start with small amounts and adjust to taste\n`;
  response += `• Some substitutions may change texture slightly\n`;
  response += `• Check for allergies when using alternatives\n`;
  response += `• UK supermarkets have great ranges of alternatives\n\n`;
  response += `What specific ingredient are you looking to substitute? I can give you more detailed advice!`;
  
  return response;
}

function generateShoppingResponse(message, context) {
  const responses = [
    `Smart shopping is key to managing your budget! Here are my top tips:

**UK Supermarket Strategies:**
• **Aldi/Lidl**: Great for basics, own-brand products, and seasonal items
• **Tesco/Sainsbury's**: Good for variety and loyalty schemes
• **Asda**: Often cheapest for branded items
• **Waitrose/M&S**: Premium quality, good for special occasions

**Money-Saving Tips:**
• Shop at the end of the day for reduced items
• Use loyalty cards and apps for discounts
• Buy seasonal produce - it's cheaper and fresher
• Compare unit prices, not just package prices
• Plan meals around what's on offer

**Shopping List Organization:**
• Group by store layout (produce, meat, dairy, etc.)
• Check what you already have before shopping
• Buy in bulk for non-perishables when on sale

What's your typical budget? I can give you more specific advice!`,
    
    `Here are my top grocery shopping strategies for the UK:

**Best Times to Shop:**
• Early morning (8-9am): Freshest produce, less crowded
• Late evening (7-8pm): Reduced items, quieter stores
• Midweek: Better deals than weekends

**Budget-Friendly Strategies:**
• Set a weekly budget and stick to it
• Use cashback apps like TopCashback or Quidco
• Buy own-brand products - often same quality, lower price
• Look for "wonky" vegetables - they're cheaper and just as good
• Freeze bread and batch cook meals

**Reducing Food Waste:**
• Plan meals for the week
• Use your freezer effectively
• Learn proper storage techniques
• Get creative with leftovers

Need help with meal planning or specific store recommendations?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateMealPlanningResponse(message, context) {
  return `Meal planning is a game-changer for healthy eating and budget management!

**Weekly Meal Planning Strategy:**
• **Sunday**: Plan the week and write shopping list
• **Monday**: Start with fresh ingredients that spoil quickly
• **Wednesday**: Use up mid-week vegetables and proteins
• **Friday**: Clear the fridge with creative leftover meals

**Batch Cooking Ideas:**
• Cook grains (rice, quinoa) in large batches
• Prep vegetables for the week
• Make big pots of soup or stew
• Freeze individual portions for quick meals

**Sample Weekly Plan:**
• **Monday**: Fresh fish with seasonal vegetables
• **Tuesday**: Stir-fry with leftover vegetables
• **Wednesday**: Pasta with homemade sauce
• **Thursday**: One-pot rice dish
• **Friday**: Use-up-everything soup or curry

**Storage Tips:**
• Store herbs in water like flowers
• Keep vegetables in breathable bags
• Label and date everything you freeze
• Use clear containers to see what you have

Would you like me to create a personalized meal plan based on your preferences?`;
}

function generateFreshnessResponse(message, context) {
  return `Great question about food freshness! Here's how to keep your food at its best:

**Storage Tips by Category:**
• **Dairy**: Keep in coldest part of fridge, use within 3-7 days of opening
• **Meat**: Store on bottom shelf, use within 1-2 days or freeze
• **Vegetables**: Most keep best in fridge crisper drawer
• **Fruits**: Some ripen on counter, then refrigerate
• **Herbs**: Store in water like flowers, or freeze in oil

**Signs of Spoilage:**
• **Mold**: Never eat moldy food, even if you cut off the moldy part
• **Smell**: Trust your nose - if it smells off, it probably is
• **Texture**: Slimy, mushy, or discolored foods should be discarded
• **Taste**: If it tastes different, don't risk it

**Extending Freshness:**
• Freeze items before they expire
• Use the "first in, first out" rule
• Store items in proper containers
• Keep fridge at 4°C or below

**UK Food Safety Guidelines:**
• Follow "use by" dates strictly
• "Best before" dates are quality indicators, not safety
• When in doubt, throw it out

Need specific advice about any particular food item?`;
}

function generateHealthResponse(message, context) {
  const lowerMessage = message.toLowerCase();

  // Weight loss specific
  if (lowerMessage.includes('weight') || lowerMessage.includes('lose') || lowerMessage.includes('slim')) {
    const responses = [
      `Ah, the weight question - probably the most common one I get! Here's the honest truth: sustainable weight loss really comes down to being in a slight calorie deficit consistently, not any magic diet.

The approach that actually works for most people? Don't overhaul everything at once. Pick ONE thing to change this week - maybe swap your afternoon biscuits for some fruit, or start walking for 20 minutes after dinner.

The boring secret is that small changes you can stick with beat dramatic diets every time. What's your biggest challenge right now - is it snacking, portion sizes, or something else? I can give you more specific tips based on what you're actually dealing with.`,

      `Real talk - most diets fail because they're too restrictive. Your body is smarter than any fad diet, and it'll fight back if you cut too much too fast.

What actually works is finding ways to eat that you genuinely enjoy AND that happen to be lower in calories. For me, that's things like:
- Loading up on vegetables first (they fill you up for barely any calories)
- Having protein with every meal (keeps you satisfied way longer)
- Not keeping trigger foods in the house (out of sight, out of mind!)

What kind of foods do you actually enjoy? I can help you figure out how to make them work for your goals rather than against them.`,

      `I'll skip the generic advice and give you what actually matters: weight loss is about calories, but keeping the weight off is about habits.

The trap most people fall into is going too hard too fast, then burning out. Instead, think about what you could realistically do for the next 6 months - not just the next 2 weeks.

A few things that make a surprisingly big difference:
- Eating slowly (sounds silly, but it works)
- Getting enough sleep (lack of sleep messes with your hunger hormones)
- Not drinking your calories (that daily latte or juice adds up fast)

What does a typical day of eating look like for you? I can spot where the easy wins might be.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // General healthy eating
  const responses = [
    `Healthy eating honestly doesn't need to be complicated - the basics work: eat more vegetables, get enough protein, don't overdo the processed stuff.

The game-changer for most people is actually cooking more at home. Even simple meals you make yourself are usually way better than takeaway or ready meals.

What's your main goal - more energy, losing weight, building muscle, or just generally eating better? I can give you more targeted advice based on what you're actually going for.`,

    `Here's my no-nonsense take on eating well: focus on adding good stuff rather than obsessing over cutting things out.

Try to get some protein and vegetables at most meals, drink water, and don't stress too much about the occasional treat. Life's too short to be miserable about food!

Is there something specific you're trying to improve? I can help with practical stuff like quick healthy meals, making vegetables actually taste good, or eating well on a budget.`,

    `The honest truth about healthy eating? It's less about superfoods and more about consistency with the basics.

Most people would see huge improvements just by:
- Eating a bit more protein (keeps you full and maintains muscle)
- Getting vegetables into at least two meals a day
- Cooking at home more often

What's your current situation like? I can help you figure out realistic changes that actually fit your life.`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

function generateDefaultResponse(message, context) {
  const responses = [
    `I'm here to help with all your food and cooking questions! I can assist with:

• **Recipe suggestions** based on ingredients you have
• **Nutritional advice** and meal planning
• **Food substitutions** when you're missing ingredients
• **Shopping tips** and budget-friendly meal ideas
• **Storage and freshness** advice for your groceries

Just ask me anything about cooking, nutrition, shopping, or food management. What would you like to know?`,
    
    `Hello! I'm your PantryPal AI assistant, and I'm excited to help you with all things food-related!

I can help you with:
• Finding recipes for ingredients you have on hand
• Understanding nutrition and making healthy choices
• Finding substitutions for missing ingredients
• Planning meals and shopping lists
• Storing food properly to reduce waste
• Budget-friendly cooking tips

What's on your mind today? Feel free to ask me anything about cooking, nutrition, or managing your pantry!`,
    
    `Hi there! I'm here to make your food journey easier and more enjoyable.

Whether you need help with:
• Quick and easy recipe ideas
• Understanding food labels and nutrition
• Finding alternatives for ingredients
• Planning meals for the week
• Shopping smarter and saving money
• Keeping your food fresh longer

I'm ready to help! What would you like to know about food, cooking, or nutrition?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function getResponseType(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('recipe') || lowerMessage.includes('cook')) {
    return 'recipe';
  } else if (lowerMessage.includes('nutrition') || lowerMessage.includes('calories')) {
    return 'nutrition';
  } else if (lowerMessage.includes('substitute') || lowerMessage.includes('replace')) {
    return 'substitution';
  } else if (lowerMessage.includes('shop') || lowerMessage.includes('buy')) {
    return 'shopping_tip';
  }
  
  return 'text';
}

module.exports = router; 