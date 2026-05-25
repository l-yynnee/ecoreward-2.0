const cors=require("cors");
const express = require("express");
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://eco-reward-frontend-one.vercel.app",
  "https://eco-reward-waste-management-system.vercel.app",
  "https://ecoreward.vercel.app"];
app.use(
  cors({
  origin: function (origin, callback) {
      // allow requests with no origin (like curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods:["GET","POST","PUT","PATCH","DELETE", "OPTIONS"],
    allowHeaders:["Content-Type","Authorization"],
    
  })
);







const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const swaggerDocument = YAML.load(path.join(__dirname, "../docs/openapi.yaml"));

const customCss = `
  .topbar { display: none; }
  .swagger-ui .info .title { font-size: 32px; }
  .swagger-ui .scheme-container { box-shadow: none; border-radius: 12px; }
  .swagger-ui .opblock { border-radius: 12px; }
`;
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: "EcoReward API Docs",
    customCss,
    swaggerOptions: {
      docExpansion: "none",      // collapsed by default (clean)
      defaultModelsExpandDepth: -1, // hides huge models panel
      persistAuthorization: true // keeps token after refresh
    }
  })
);

app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per IP
  message: { message: "Too many requests, try again later" }
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});

app.use("/api/v1", apiLimiter);




app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", app: "backend" });
});

app.use("/api/v1/users", require("./modules/users/users.routes"));
app.use("/api/v1/admin", require("./modules/admin/admin.routes"));
app.use("/api/v1/pickups", require("./modules/pickups/pickups.routes"));
app.use("/api/v1/sme", require("./modules/sme/sme.routes"));
app.use("/api/v1/pricing", require("./modules/pricing/pricing.routes"));
app.use("/api/v1/auth", authLimiter, require("./modules/auth/auth.routes"));
app.use("/api/v1", require("./modules/ledger/ledger.routes"));
app.use("/api/v1/stats", require("./modules/stats/stats.routes"));
app.use("/api/v1/ai", require("./modules/ai/ai.routes"));
app.use("/api/v1/market", require("./modules/market/market.routes"));
app.use("/api/v1/leaderboard", require("./modules/leaderboard/leaderboard.routes"));
app.use("/api/v1/tips", require("./modules/tips/tips.routes"));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});


module.exports = app;

