import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();

// Seed users — replace with DB table when ready
const USERS = [
  { id: '1', username: 'admin',   name: 'Admin User',       email: 'admin@sierradigitalinc.com',    password: bcrypt.hashSync('Admin@123', 10), role: 'executive' },
  { id: '2', username: 'finance', name: 'Finance Analyst',  email: 'finance@sierradigitalinc.com',  password: bcrypt.hashSync('Finance@123', 10), role: 'finance_analyst' },
  { id: '3', username: 'grants',  name: 'Grants Manager',   email: 'grants@sierradigitalinc.com',   password: bcrypt.hashSync('Grants@123', 10), role: 'grants_manager' },
  { id: '4', username: 'program', name: 'Program Manager',  email: 'program@sierradigitalinc.com',  password: bcrypt.hashSync('Program@123', 10), role: 'program_manager' },
  { id: '5', username: 'auditor', name: 'Auditor',          email: 'auditor@sierradigitalinc.com',  password: bcrypt.hashSync('Audit@123', 10), role: 'auditor' },
];

router.post('/login', (req, res) => {
  const { username, email, password } = req.body;
  const login = username || email;
  const user = USERS.find(u => u.email === login || u.username === login);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.get('/me', (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    const user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
