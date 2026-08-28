import express from "express";
import cors from "cors";
import routes from "./routes";
import env from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = env.port;

const corsOptions = {
  origin: env.clientUrl,
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

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