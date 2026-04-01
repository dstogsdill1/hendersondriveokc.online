const fs = require('fs');
const path = require('path');
const { isAuthenticated } = require('./_auth');

module.exports = (req, res) => {
  if (!isAuthenticated(req)) {
    res.statusCode = 302;
    res.setHeader('Location', '/admin.html');
    res.end();
    return;
  }

  const dashboardPath = path.join(process.cwd(), 'dashboard-content.html');
  const html = fs.readFileSync(dashboardPath, 'utf8');

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.end(html);
};
