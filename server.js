import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || (process.env.VITE_APP_ENV === "local" ? 6003 : 3003);

// 1. Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://checkout.razorpay.com",
          "https://cdn.razorpay.com",
          "https://connect.facebook.net",
          "https://www.googletagmanager.com",
          "https://www.gstatic.com", // Firebase scripts
        ],
        workerSrc: ["'self'", "blob:", "https://www.gstatic.com"], // 🛡️ Allow Service Workers
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "https://www.facebook.com",
          "https://i.ytimg.com",
        ],
        connectSrc: [
          "'self'",
          "https:",
          "http://localhost:*",
          "http://192.168.1.9:*",
          "ws://localhost:*",
          "wss:",
          "https://lumberjack.razorpay.com",
          "https://www.google-analytics.com",
          "https://firebaseinstallations.googleapis.com", // Firebase API
          "https://fcmregistrations.googleapis.com", // FCM API
        ],
        frameSrc: [
          "'self'",
          "https://api.razorpay.com",
          "https://tds.razorpay.com",
          "https://www.youtube.com",
          "https://youtube.com",
          "https://mateandmentors.yourvideo.live",
          "https://matenmentor.yourvideo.live",
        ],
        mediaSrc: ["'self'", "https://mejoric.com", "https://*.mejoric.com"],
        upgradeInsecureRequests: null,
      },
    },
    hsts: false,
  }),
);

// 2. Compression
app.use(compression());

// 3. Static files — production lives at https://admin.mejoric.com/ (Vite base `/`)
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.use("/admin", express.static(distPath));
app.use("/staging-admin", express.static(distPath));

// 4. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

// 5. SPA fallback (admin.mejoric.com serves at `/login`, `/users`, …)
const sendAdminIndex = (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
};

app.get(["/staging-admin", "/admin"], sendAdminIndex);
app.get(/^\/(staging-admin|admin)\/.*/, sendAdminIndex);
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  sendAdminIndex(req, res);
});

app.listen(PORT, () => {
  console.log(`🛡️  Admin running on port ${PORT} (admin.mejoric.com / admin-dev.mejoric.com)`);
});
