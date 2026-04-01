function getCookieValue(req, name) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';').map((part) => part.trim()).filter(Boolean);
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return '';
}

function getEnv(name) {
  return String(process.env[name] || '').trim();
}

function isAuthenticated(req) {
  const sessionToken = getEnv('DASHBOARD_SESSION_TOKEN');
  if (!sessionToken) {
    return false;
  }
  return getCookieValue(req, 'dashboard_auth') === sessionToken;
}

function buildCookie(value, maxAge) {
  const parts = [
    `dashboard_auth=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    `Max-Age=${maxAge}`
  ];
  return parts.join('; ');
}

function setAuthCookie(res) {
  const sessionToken = getEnv('DASHBOARD_SESSION_TOKEN');
  res.setHeader('Set-Cookie', buildCookie(sessionToken, 60 * 60 * 12));
}

function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', buildCookie('', 0));
}

module.exports = {
  getEnv,
  isAuthenticated,
  setAuthCookie,
  clearAuthCookie,
};
