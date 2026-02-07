import dotenv from "dotenv";

dotenv.config();

const requiredEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const toInt = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  port: toInt(process.env.PORT, 5000),
  jwtSecret: requiredEnv("JWT_SECRET"),
  databaseUrl: requiredEnv("DATABASE_URL"),
  databaseDirectUrl: process.env.DATABASE_DIRECT_URL || null,
  db: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "postgres",
    port: toInt(process.env.DB_PORT, 5432),
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: toInt(process.env.SMTP_PORT, 467),
    user: process.env.SMTP_USER,
    from: process.env.FROM_EMAIL,
    pass: process.env.SMTP_PASS,
  },
};

export default env;
