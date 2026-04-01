const { clearAuthCookie } = require('./_auth');

module.exports = (req, res) => {
  clearAuthCookie(res);
  res.statusCode = 200;
  res.json({ ok: true });
};
