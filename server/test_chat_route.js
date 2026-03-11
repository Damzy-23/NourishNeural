const axios = require('axios');

async function testChat() {
    console.log('Testing /api/ai/chat...');
    try {
        const response = await axios.post('http://localhost:5000/api/ai/chat', {
            message: 'hi'
        });
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.error('Test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error message:', error.message);
        }
    }
}

testChat();
