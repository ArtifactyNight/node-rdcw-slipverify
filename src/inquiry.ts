import type { LocaleMessages, Result, SlipError, VerifySlipResult } from "./types";

export const defaultBaseUrl = "https://suba.rdcw.co.th";

export const inquiryPath = "/v2/inquiry";

export function buildBasicAuthHeader(clientId: string, secret: string): string {
  return `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`;
}

function toBlobPart(data: ArrayBuffer | Buffer | Uint8Array | Blob): BlobPart {
  if (data instanceof Blob) {
    return data;
  }
  const src = Buffer.isBuffer(data) ? data : new Uint8Array(data);
  const ab = new ArrayBuffer(src.byteLength);
  const out = new Uint8Array(ab);
  out.set(src);
  return out;
}

/**
 * Normalize slip upload filename: trim, default to slip.jpg, ensure image extension.
 */
export function sanitizeSlipFileName(name: string): string {
  const trimmed = name.trim();
  const base = trimmed.length > 0 ? trimmed : "slip.jpg";
  const lower = base.toLowerCase();
  if (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png")
  ) {
    return base;
  }
  return `${base}.jpg`;
}

function parseVerifyBody(
  body: unknown,
  apiMessages: LocaleMessages["api"]
): Result<VerifySlipResult, SlipError> {
  const slip = body as Partial<VerifySlipResult>;
  if (typeof slip.valid !== "boolean" || slip.data === undefined) {
    return {
      error: {
        type: "API_ERROR",
        message: apiMessages.invalidResponse,
      },
    };
  }
  return { data: slip as VerifySlipResult };
}

export async function inquiryPayloadJson(params: {
  baseUrl: string;
  authorization: string;
  apiMessages: LocaleMessages["api"];
  payload: string;
}): Promise<Result<VerifySlipResult, SlipError>> {
  const { baseUrl, authorization, apiMessages, payload } = params;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${inquiryPath}`, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload }),
    });
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    return {
      error: {
        type: "API_ERROR",
        message: `${apiMessages.requestFailed}: ${detail}`,
      },
    };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      error: {
        type: "API_ERROR",
        message: apiMessages.invalidResponse,
      },
    };
  }

  if (!response.ok) {
    const apiError = body as { code?: number; message?: string };
    return {
      error: {
        type: "API_ERROR",
        code: apiError.code,
        message:
          apiError.message ??
          `${apiMessages.requestFailed} (HTTP ${response.status})`,
      },
    };
  }

  return parseVerifyBody(body, apiMessages);
}

export async function inquirySlipMultipart(params: {
  baseUrl: string;
  authorization: string;
  apiMessages: LocaleMessages["api"];
  slipBuffer: ArrayBuffer | Buffer | Uint8Array | Blob;
  fileName: string;
  contentType?: string;
  buildFormData?: () => FormData;
}): Promise<Result<VerifySlipResult, SlipError>> {
  const {
    baseUrl,
    authorization,
    apiMessages,
    slipBuffer,
    fileName,
    contentType,
    buildFormData,
  } = params;

  const formData =
    buildFormData?.() ??
    (() => {
      const fd = new FormData();
      const blob = new Blob([toBlobPart(slipBuffer)], {
        type: contentType?.trim() || "image/jpeg",
      });
      fd.append("file", blob, sanitizeSlipFileName(fileName));
      return fd;
    })();

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${inquiryPath}`, {
      method: "POST",
      headers: {
        Authorization: authorization,
      },
      body: formData,
    });
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    return {
      error: {
        type: "API_ERROR",
        message: `${apiMessages.requestFailed}: ${detail}`,
      },
    };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      error: {
        type: "API_ERROR",
        message: apiMessages.invalidResponse,
      },
    };
  }

  if (!response.ok) {
    const apiError = body as { code?: number; message?: string };
    return {
      error: {
        type: "API_ERROR",
        code: apiError.code,
        message:
          apiError.message ??
          `${apiMessages.requestFailed} (HTTP ${response.status})`,
      },
    };
  }

  return parseVerifyBody(body, apiMessages);
}
