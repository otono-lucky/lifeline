"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var routes_1 = require("./routes");
var env_1 = require("./config/env");
var errorHandler_1 = require("./middleware/errorHandler");
var swaggerSetup_1 = require("./docs/swaggerSetup");
var app = (0, express_1.default)();
var PORT = env_1.default.port;
var corsOptions = {
    origin: env_1.default.clientUrl,
    credentials: true,
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// API Documentation (Swagger UI)
(0, swaggerSetup_1.setupSwagger)(app);
// Routes
app.use("/api", routes_1.default);
// Health Route
app.get("/api/health", function (_req, res) {
    res.json({ status: "Lifeline API is online" });
});
app.get("/api", function (_, res) {
    res.json({ message: "Welcome to Lifeline API - Where Faith meets Logic." });
});
// Global Error Handler
app.use(errorHandler_1.errorHandler);
// Start Server
app.listen(PORT, function () {
    console.log("Server is running on http://localhost:".concat(PORT));
});
exports.default = app;
