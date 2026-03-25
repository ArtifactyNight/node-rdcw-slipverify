/**
 * node-rdcw-slipverify — v3 SDK for [RDCW Slip Verify](https://slip.rdcw.co.th/)
 */

export type {
  Account,
  Data,
  ErrorType,
  Failure,
  Locale,
  LocaleMessages,
  Quota,
  Receiver,
  Result,
  SlipError,
  SlipFileInput,
  SlipVerifyConfig,
  Subscription,
  Success,
  ValidateSlipOptions,
  VerifySlipResult
} from "./types";

export { mergeLocaleMessages } from "./locales";

export {
  buildBasicAuthHeader,
  defaultBaseUrl,
  inquiryPath,
  inquiryPayloadJson,
  inquirySlipMultipart,
  sanitizeSlipFileName
} from "./inquiry";

export { shouldRunValidation, validateSlipResult } from "./validate-slip";

export {
  SlipVerifyClient,
  createSlipVerify
} from "./slip-verify-client";

export { createSlipVerify as default } from "./slip-verify-client";
