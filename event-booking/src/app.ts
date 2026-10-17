
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { errorHandler } from "./middleware/errorHandler.js";
import eventRoutes from "./routes/eventRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
      : false,
  }),
);

app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Event Booking API is running",
  });
});

app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

app.use(errorHandler);

export default app;
