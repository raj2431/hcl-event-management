
import "dotenv/config";
import Joi from "joi";

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),

  PORT: Joi.number()
    .port()
    .default(3000),

  CORS_ORIGIN: Joi.string()
    .default("http://localhost:3000"),

  DATA_DIRECTORY: Joi.string()
    .trim()
    .min(1)
    .default("data"),

  AUTH_SERVICE_URL: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .required(),

  JWT_ISSUER: Joi.string()
    .trim()
    .min(1)
    .required(),

  JWT_AUDIENCE: Joi.string()
    .trim()
    .min(1)
    .required(),
}).unknown(true);

const { error, value } = envSchema.validate(process.env, {
  abortEarly: false,
  convert: true,
});

if (error) {
  throw new Error(
    `Environment validation failed: ${error.details
      .map((detail: any) => detail.message)
      .join("; ")}`,
  );
}

export const config = {
  NODE_ENV: value.NODE_ENV as "development" | "test" | "production",
  PORT: value.PORT as number,
  CORS_ORIGIN: value.CORS_ORIGIN as string,
  DATA_DIRECTORY: value.DATA_DIRECTORY as string,
  AUTH_SERVICE_URL: value.AUTH_SERVICE_URL as string,
  JWT_ISSUER: value.JWT_ISSUER as string,
  JWT_AUDIENCE: value.JWT_AUDIENCE as string,
};
