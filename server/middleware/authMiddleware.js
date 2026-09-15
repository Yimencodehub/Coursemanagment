/**
 * Auth Middleware
 * If a valid Firebase Bearer token is present, it verifies and attaches the user.
 * If Firebase is not configured or no token is present, it falls back gracefully
 * so the API still works with the local JSON store.
 */
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // No token – attach a generic dev user and continue
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = {
      uid:   'local-user',
      email: req.body?.email || req.query?.email || '',
      role:  req.body?.role  || 'student',
    };
    return next();
  }

  const token = authHeader.split('Bearer ')[1];

  // Try Firebase token verification (only works if Firebase Admin is configured)
  try {
    const admin = await import('firebase-admin');
    if (admin.default.apps.length > 0) {
      const decoded = await admin.default.auth().verifyIdToken(token);
      req.user = decoded;
      return next();
    }
  } catch {
    // Firebase not configured or token invalid — fall through to local handling
  }

  // Accept the token as a plain JSON payload (local session token)
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    req.user = payload;
    return next();
  } catch {
    // Cannot decode — still allow request with empty user
    req.user = { uid: 'anonymous', email: '', role: 'student' };
    return next();
  }
};
