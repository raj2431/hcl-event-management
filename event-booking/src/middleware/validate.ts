
import type { RequestHandler } from "express";
import type Joi from "joi";

import { HttpError } from "../utils/HttpError.js";

export const validate = (
  schema: Joi.ObjectSchema,
  source: "body" | "params" | "query" = "body",
): RequestHandler => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      convert: true,
      stripUnknown: false,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      next(
        new HttpError(
          400,
          "Validation failed",
          details as any,
        ),
      );
      return;
    }

    // Use Joi's validated and converted data.
    if (source === "body") {
      req.body = value;
    } else if (source === "params") {
      req.params = value;
    } else {
      req.query = value;
    }

    next();
  };
};
