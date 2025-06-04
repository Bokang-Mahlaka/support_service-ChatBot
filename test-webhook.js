import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Configure dotenv
dotenv.config();

// Get verify token from environment variables
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

if (!VERIFY_TOKEN) {
  console.error('Error: WHATSAPP_VERIFY_TOKEN is not set in environment variables');
  process.exit(1);
}

async function testWebhook() {
  const webhookUrl = 'https://support-service-chat-qbnqwevrp-bokang-mahlakas-projects.vercel.app/api/whatsapp';
  
  // Test 1: Basic GET request
  console.log('\nTest 1: Basic GET request');
  try {
    const response = await fetch(webhookUrl);
    console.log('Status:', response.status);
    console.log('Response:', await response.text());
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 2: GET request with verification parameters
  console.log('\nTest 2: GET request with verification parameters');
  const getUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=CHALLENGE_ACCEPTED`;
  try {
    const response = await fetch(getUrl);
    console.log('Status:', response.status);
    console.log('Response:', await response.text());
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 3: POST request simulation
  console.log('\nTest 3: POST request simulation');
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '1234567890',
                text: { body: 'Test message' }
              }]
            }
          }]
        }]
      })
    });
    console.log('Status:', response.status);
    console.log('Response:', await response.text());
  } catch (error) {
    console.error('Error:', error);
  }
}

testWebhook(); 