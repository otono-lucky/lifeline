import express from "express";
import cors from "cors";
import routes from "./routes";
import env from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { setupSwagger } from "./docs/swaggerSetup";

const app = express();
const PORT = env.port;

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // In development or when origin matches localhost (Expo web 8081, Vite 5173), 127.0.0.1, or ngrok
    if (
      env.nodeEnv === "development" ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      origin.includes("ngrok") ||
      origin === env.clientUrl
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "ngrok-skip-browser-warning",
    "X-Requested-With",
    "Accept",
  ],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// API Documentation (Swagger UI)
setupSwagger(app);

// Routes
app.use("/api", routes);

// Health Route
app.get("/api/health", (_req, res) => {
  res.json({ status: "Lifeline API is online" });
});

app.get("/api", (_, res) => {
  res.json({ message: "Welcome to Lifeline API - Where Faith meets Logic." });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;