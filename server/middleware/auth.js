import jwt from 'jsonwebtoken';

const ROLES = {
  finance_analyst: ['grants','funds','forecast','audit'],
  grants_manager:  ['grants','subawards','audit'],
  program_manager: ['outcomes','grants'],
  executive:       ['grants','funds','subawards','outcomes','audit','forecast'],
  auditor:         ['audit','grants','subawards'],
  public_user:     ['grants'],
};

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function authorize(module) {
  return (req, res, next) => {
    const allowed = ROLES[req.user?.role] || [];
    if (allowed.includes(module)) return next();
    res.status(403).json({ error: 'Access denied' });
  };
}
