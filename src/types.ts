/**
 * Type definitions for rdcw-slipverify-sdk
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
  | "QR_CODE_ERROR"
  | "API_ERROR"
  | "VALIDATION_ERROR";

export interface SlipError {
  type: ErrorType;
  message: string;
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

/**
 * Locale type
 */
export type Locale = "en" | "th";

/**
 * Locale messages for error and validation messages
 */
export interface LocaleMessages {
  qr: {
    invalidDimensions: string;
    notFound: string;
    readFailed: string;
  };
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
 * RDCW Verify configuration
 */
export interface RdcwVerifyConfig {
  clientId: string;
  secret: string;
  baseUrl?: string;
  locale?: Locale;
  customMessages?: Partial<LocaleMessages>;
}

/**
 * Validation options for slip verification
 */
export interface ValidationOptions {
  expectedAccount?: string;
  expectedBank?: string;
  expectedAmount?: string;
  onSuccess?: (data: VerifySlipResult) => void;
  onError?: (error: SlipError) => void;
  onValidationError?: (error: SlipError) => void;
}
