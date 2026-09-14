export const APP_ERROR_CODES = [
  "VALIDATION",
  "NOT_FOUND",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "CONFLICT",
  "INTERNAL",
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

type AppErrorOptions = {
  code: AppErrorCode;
  message: string;
  safeMessage: string;
  status: number;
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly safeMessage: string;
  readonly status: number;

  constructor({ code, message, safeMessage, status }: AppErrorOptions) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.safeMessage = safeMessage;
    this.status = status;
  }
}

export type PublicErrorBody = {
  code: AppErrorCode;
  message: string;
  status: number;
};

export function toPublicError(error: unknown): PublicErrorBody {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.safeMessage,
      status: error.status,
    };
  }

  return {
    code: "INTERNAL",
    message: "Something went wrong. Please try again.",
    status: 500,
  };
}
