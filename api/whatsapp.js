import { handleChat } from './chat';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Handle WhatsApp webhook verification
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('Webhook verification attempt:', {
      mode,
      token,
      challenge,
      expectedToken: process.env.WHATSAPP_VERIFY_TOKEN
    });

    // Replace this with your verify token
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    if (!VERIFY_TOKEN) {
      console.error('WHATSAPP_VERIFY_TOKEN is not set in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified successfully');
        return res.status(200).send(challenge);
      } else {
        console.log('Webhook verification failed:', {
          modeMatch: mode === 'subscribe',
          tokenMatch: token === VERIFY_TOKEN
        });
        return res.sendStatus(403);
      }
    }
    return res.status(400).json({ error: 'Missing verification parameters' });
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;

      console.log('Received POST request body:', JSON.stringify(body, null, 2));

      // Check if this is a WhatsApp message
      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry[0];
        const changes = entry.changes[0];
        const value = changes.value;

        if (value.messages) {
          const message = value.messages[0];
          const from = message.from;
          const messageBody = message.text?.body;

          if (messageBody) {
            console.log('Processing message body:', messageBody);
            // Process the message using your existing chat handler
            const chatResponse = await handleChat({
              messages: [{ role: 'user', content: messageBody }]
            });

            // Send response back to WhatsApp
            await sendWhatsAppMessage(from, chatResponse.reply);
          }
        }

        res.status(200).json({ status: 'ok' });
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

async function sendWhatsAppMessage(to, message) {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
} 