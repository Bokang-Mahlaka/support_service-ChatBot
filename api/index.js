import express from 'express';
import { createServer } from 'http';
import { parse } from 'url';

const app = express();

app.use(express.json());

app.post('/api/chat', (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request format' });
  }

  const lastMessage = messages[messages.length - 1];
  res.json({
    reply: `I received your message: "${lastMessage.content}"`
  });
});

// Export the app as a function (DO NOT use app.listen)
export default app;
