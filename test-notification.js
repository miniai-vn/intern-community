const fetch = require('node-fetch');

async function testNotificationSystem() {
  console.log('Testing notification system...');
  
  try {
    // Test 1: Get notifications (should be empty initially)
    console.log('\n1. Getting notifications...');
    const getResponse = await fetch('http://localhost:3000/api/notifications');
    const getData = await getResponse.json();
    console.log('Notifications:', getData);
    
    // Test 2: Create a test notification
    console.log('\n2. Creating test notification...');
    const createResponse = await fetch('http://localhost:3000/api/notifications/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const createData = await createResponse.json();
    console.log('Created notification:', createData);
    
    // Test 3: Get notifications again (should have the test notification)
    console.log('\n3. Getting notifications after creation...');
    const getResponse2 = await fetch('http://localhost:3000/api/notifications');
    const getData2 = await getResponse2.json();
    console.log('Notifications after creation:', getData2);
    
  } catch (error) {
    console.error('Error testing notification system:', error);
  }
}

testNotificationSystem();
