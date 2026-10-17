
import { randomUUID } from "crypto";
import app from "./app.js";
import { config } from "./config/env.js";

const server = app.listen(config.PORT, () => {
  console.log(
    `${randomUUID()} Smart Event Booking API running on port ${config.PORT}`,
  );
});

const shutdown = (signal: string): void => {
  console.log(`${signal} received. Shutting down server...`);

  server.close((error) => {
    if (error) {
      console.error("Error while closing server:", error);
      process.exitCode = 1;
      return;
    }

    console.log("Server closed successfully.");
    process.exitCode = 0;
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
