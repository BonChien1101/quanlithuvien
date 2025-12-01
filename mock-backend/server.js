const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple in-memory users for demo
const users = [{ id: 1, username: 'admin', password: 'admin', roles: ['admin'] }];

app.post(['/api/auth/login', '/auth/login'], (req, res) => {
  const { username, password } = req.body || {};
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    // For demo, accept any credentials but return a token only if provided; otherwise 401
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
    return res.status(200).json({ token: 'demo-token', roles: ['user'] });
  }
  return res.json({ token: 'demo-admin-token', roles: user.roles });
});

app.post(['/api/auth/signup', '/auth/signup'], (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing' });
  const id = users.length + 1;
  users.push({ id, username, password, roles: ['user'] });
  res.json({ token: 'demo-token', roles: ['user'] });
});

// example endpoint for books
app.get('/api/books', (req, res) => {
  res.json([
    { id: 1, title: 'Demo Book', author: 'Author A', stock: 5 }
  ]);
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Mock backend listening on', port));
