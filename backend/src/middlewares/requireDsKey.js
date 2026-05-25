module.exports = function (req, res, next) {
  const key = req.headers["x-ds-key"];

  if (!key || key !== process.env.DS_API_KEY) {
    return res.status(403).json({ message: "Invalid DS key" });
  }

  next();
};