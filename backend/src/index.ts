import express from "express";
import cors from "cors";
import routes from "./routes";
import env from "./config/env";

const app = express();
const PORT = env.port;

const corsOptions = {
  origin: env.clientUrl,
  credentials: true, // if you need cookies or auth headers
};

// Middleware
app.use(cors(corsOptions));

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
