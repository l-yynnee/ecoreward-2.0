//require("dotenv").config();
require("dotenv").config();
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DB_HOST runtime:", process.env.DB_HOST);
const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
