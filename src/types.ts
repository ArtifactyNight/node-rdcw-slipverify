/**
 * Type definitions for node-rdcw-slipverify (v3)
 */

// Result Types
export interface Success<T> {
  data: T;
  error?: never;
}

export interface Failure<E> {
  data?: never;
  error: E;
}

export type Result<T, E> = Success<T> | Failure<E>;

// Error Types
export type ErrorType =
  | "INVALID_SLIP"
  | "EXPIRED_SLIP"
  | "API_ERROR"
  | "VALIDATION_ERROR";

export interface SlipError {
  type: ErrorType;
  message: string;
  /** Present when `type === "API_ERROR"` and the server returned a numeric code */
  code?: number;
}

/**
 * Account information for sender or receiver
 */
export interface Account {
  type: null | string;
  value: null | string;
}

/**
 * Sender or receiver information
 */
export interface Receiver {
  displayName: string;
  name: string;
  proxy: Account;
  account: Account;
}

/**
 * Transaction data from the API
 */
export interface Data {
  language: string;
  transRef: string;
  sendingBank: string;
  receivingBank: string;
  transDate: string;
  transTime: string;
  sender: Receiver;
  receiver: Receiver;
  amount: string;
  paidLocalAmount: string;
  paidLocalCurrency: string;
  countryCode: string;
  transFeeAmount: string;
  ref1: string;
  ref2: string;
  ref3: string;
  toMerchantId: string;
}

/**
 * Quota information from the API
 */
export interface Quota {
  cost: number;
  usage: number;
  limit: number;
}

/**
 * Subscription information from the API
 */
export interface Subscription {
  id: number;
  postpaid: boolean;
}

/**
 * Result from the slip inquiry API
 */
export interface VerifySlipResult {
  discriminator: string;
  valid: boolean;
  data: Data;
  quota: Quota;
  subscription: Subscription;
  isCached: boolean;
}

export type Locale = "en" | "th";

export interface LocaleMessages {
  api: {
    invalidResponse: string;
    requestFailed: string;
    unexpectedError: string;
  };
  validation: {
    invalidSlip: string;
    slipAlreadyUsed: string;
    slipExpired: string;
    invalidAccount: string;
    invalidBank: string;
    invalidQRFormat: string;
    amountMismatch: string;
  };
}

/**
 * SDK configuration (v3)
 */
export interface SlipVerifyConfig {
  clientId: string;
  secret: string;
  baseUrl?: string;
  locale?: Locale;
  customMessages?: Partial<LocaleMessages>;
}

/**
 * Rules applied after a successful API inquiry
 */
export interface ValidateSlipOptions {
  expectedAccount?: string;
  expectedBank?: string;
  expectedAmount?: string;
  /** Reject slips older than this many days (default: 1) */
  maxAgeDays?: number;
  /** Reject when `isCached` is true (default: true) */
  rejectCached?: boolean;
}

/**
 * Multipart slip upload input for {@link SlipVerifyClient.verifyFromSlipFile}
 */
export interface SlipFileInput {
  data: ArrayBuffer | Buffer | Uint8Array | Blob;
  fileName: string;
  contentType?: string;
  /** Override default `file` field construction (e.g. custom fields) */
  buildFormData?: () => FormData;
}
