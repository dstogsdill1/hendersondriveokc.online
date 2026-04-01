const { getEnv, setAuthCookie } = require('./_auth');

function parseBody(raw) {
  if (!raw) {
    return {};
  }

  const normalized = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);

  try {
    return JSON.parse(normalized);
  } catch (error) {
    const params = new URLSearchParams(normalized);
    return {
      username: params.get('username') || '',
      password: params.get('password') || ''
    };
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }

    if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
      resolve(parseBody(req.body));
      return;
    }

    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      resolve(parseBody(raw));
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.json({ ok: false, message: 'Method not allowed' });
    return;
  }

  const configuredUsername = getEnv('DASHBOARD_USERNAME');
  const configuredPassword = getEnv('DASHBOARD_PASSWORD');
  const configuredToken = getEnv('DASHBOARD_SESSION_TOKEN');

  if (!configuredUsername || !configuredPassword || !configuredToken) {
    res.statusCode = 500;
    res.json({ ok: false, message: 'Dashboard environment variables are not configured yet.' });
    return;
  }

  const body = await readBody(req);
  const username = String(body.username || '').trim();
  const password = String(body.password || '');

  if (username !== configuredUsername || password !== configuredPassword) {
    res.statusCode = 401;
    res.json({ ok: false, message: 'Invalid username or password.' });
    return;
  }

  setAuthCookie(res);
  res.statusCode = 200;
  res.json({ ok: true, redirect: '/api/dashboard' });
};
