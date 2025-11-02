const express = require("express");
const fs = require("fs");
const path = require("path");

function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  // Basic security - disable X-Powered-By header
  app.disable("x-powered-by");

  // Simple home endpoint
  app.get("/", (req, res) => {
    res.send("Chaldea Bot is running!");
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP" });
  });

  // Start the server
  app.listen(port, "0.0.0.0", () => {
    console.log(`Chaldea Bot server is running on port ${port}`);
  });

  return app;
}

module.exports = startServer;