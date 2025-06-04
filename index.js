import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic root route
app.get('/api/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// You can add other routes here for your traditional server

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 