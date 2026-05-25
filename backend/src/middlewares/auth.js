const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
//$ADMIN_TOKEN
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyMDAyODM5LCJleHAiOjE3NzI2MDc2Mzl9.Iautq89v9xRpmMjdh1LUmkBdw4pjyEUjV3sPtXOJQvU
//echo $COLLECTOR_TOKEN
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6IkNPTExFQ1RPUiIsImlhdCI6MTc3MjAwMjkwNCwiZXhwIjoxNzcyNjA3NzA0fQ.Rxofi4gEng0mSW77gRKuEcIsBdlbYnp2uXsCKaDpaa4
//$CITIZEN_TOKEN
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicm9sZSI6IkNJVElaRU4iLCJpYXQiOjE3NzIwMDI5NzAsImV4cCI6MTc3MjYwNzc3MH0.QylkfeXeanwIYOSB3n7iYPZsLjzTe_ZC7we43JqMrKM