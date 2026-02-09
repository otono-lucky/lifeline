import express from "express";
import cors from "cors";
import routes from "./routes";
import env from "./config/env";

const app = express();
const PORT = env.port;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

// Basic Route
app.get("/", (_, res) => {
  res.json({ message: "Welcome to Lifeline API - Where Faith meets Logic." });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
