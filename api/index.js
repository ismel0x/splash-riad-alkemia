import express from 'express';
import { registerRoutes } from '../dist/index.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Initialize routes
let server;
async function initializeServer() {
  if (!server) {
    server = await registerRoutes(app);
  }
  return server;
}

export default async function handler(req, res) {
  await initializeServer();
  
  // Handle the request
  return new Promise((resolve) => {
    app(req, res, (result) => {
      if (result instanceof Error) {
        console.error('Handler error:', result);
        res.status(500).json({ error: 'Internal server error' });
      }
      resolve(result);
    });
  });
}