import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use('/style.css', express.static(path.join(__dirname, 'public', 'style.css'), {
  setHeaders: (res) => {
    res.setHeader('Content-Type', 'text/css');
  }
}));

app.use('/chat.js', express.static(path.join(__dirname, 'public', 'chat.js'), {
  setHeaders: (res) => {
    res.setHeader('Content-Type', 'application/javascript');
  }
}));

// Serve other static files
app.use(express.static('public'));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 