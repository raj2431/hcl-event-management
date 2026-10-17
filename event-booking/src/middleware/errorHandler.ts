
import type { ErrorRequestHandler } from "express";
import { HttpError } from "../utils/HttpError.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
): void => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  console.error("Unexpected server error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
