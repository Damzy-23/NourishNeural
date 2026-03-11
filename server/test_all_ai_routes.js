const axios = require('axios');

async function testAllRoutes() {
    const routes = [
        { name: 'Chat', path: '/chat', body: { message: 'hi' } },
        { name: 'Recipes', path: '/recipes', body: { ingredients: ['chicken', 'rice'], dietaryRestrictions: [], cuisine: '', difficulty: '' } },
        { name: 'Nutrition', path: '/nutrition', body: { food: 'apple', quantity: 1, unit: 'piece' } },
        { name: 'Substitutions', path: '/substitutions', body: { ingredient: 'milk', reason: 'vegan' } }
    ];

    console.log('Testing AI Routes...');

    for (const route of routes) {
        console.log(`\n--- Testing ${route.name} (${route.path}) ---`);
        try {
            const response = await axios.post(`http://localhost:5000/api/ai${route.path}`, route.body);
            console.log('Status:', response.status);
            console.log('Preview:', JSON.stringify(response.data).substring(0, 100) + '...');
        } catch (error) {
            console.error(`FAILED ${route.name}:`);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            } else {
                console.error('Error message:', error.message);
            }
        }
    }
}

testAllRoutes();
