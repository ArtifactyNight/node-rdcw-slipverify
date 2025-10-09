/**
 * rdcw-slipverify-sdk
 * A TypeScript SDK for SlipVerify with functional and OOP paradigms
 */

import decodeQR from "@paulmillr/qr/decode.js";
import axios, { AxiosInstance } from "axios";
import { isAfter, parse, subDays } from "date-fns";
import { parse as parsePrompt } from "promptparse";

import type {
  Locale,
  LocaleMessages,
  RdcwVerifyConfig,
  Result,
  SlipError,
  ValidationOptions,
  VerifySlipResult,
} from "./types";

// Re-export all types
export * from "./types";

/**
 * Default locale messages for English
 */
const enMessages: LocaleMessages = {
  qr: {
    invalidDimensions:
      "The image dimensions could not be determined. Please provide a valid image.",
    notFound: "No QR code found in the image",
    readFailed: "Failed to read QR code",
  },
  api: {
    invalidResponse: "Invalid response from API",
    requestFailed: "API request failed",
    unexpectedError: "Unexpected error",
  },
  validation: {
    invalidSlip: "Invalid slip",
    slipAlreadyUsed: "This slip has already been used",
    slipExpired: "This slip has expired",
    invalidAccount: "Invalid account number",
    invalidBank: "Invalid bank",
    invalidQRFormat: "Invalid QR code format",
    amountMismatch: "Amount mismatch in QR code",
  },
};

/**
 * Default locale messages for Thai
 */
const thMessages: LocaleMessages = {
  qr: {
    invalidDimensions: "ไม่สามารถระบุขนาดของรูปภาพได้ กรุณาใช้รูปภาพที่ถูกต้อง",
    notFound: "ไม่พบ QR code ในรูปภาพ",
    readFailed: "ไม่สามารถอ่าน QR code ได้",
  },
  api: {
    invalidResponse: "ได้รับข้อมูลที่ไม่ถูกต้องจาก API",
    requestFailed: "การเรียก API ล้มเหลว",
    unexpectedError: "เกิดข้อผิดพลาดที่ไม่คาดคิด",
  },
  validation: {
    invalidSlip: "สลิปไม่ถูกต้อง",
    slipAlreadyUsed: "สลิปนี้ถูกใช้งานไปแล้ว",
    slipExpired: "สลิปนี้หมดอายุแล้ว",
    invalidAccount: "หมายเลขบัญชีไม่ถูกต้อง",
    invalidBank: "ธนาคารไม่ถูกต้อง",
    invalidQRFormat: "รูปแบบ QR code ไม่ถูกต้อง",
    amountMismatch: "จำนวนเงินใน QR code ไม่ตรงกัน",
  },
};

/**
 * Locale messages registry
 */
const localeRegistry: Record<Locale, LocaleMessages> = {
  en: enMessages,
  th: thMessages,
};

/**
 * Main RDCW Verify class
 */
class RdcwVerify {
  private clientId: string;
  private secret: string;
  private baseUrl: string;
  private apiClient: AxiosInstance;
  private locale: Locale;
  private messages: LocaleMessages;

  constructor(config: RdcwVerifyConfig) {
    this.clientId = config.clientId;
    this.secret = config.secret;
    this.baseUrl = config.baseUrl || "https://suba.rdcw.co.th";
    this.locale = config.locale || "en";

    // Initialize locale messages
    this.messages = this.initializeMessages(this.locale, config.customMessages);

    // Initialize axios instance with default configuration
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: this.clientId,
        password: this.secret,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Initialize locale messages with custom overrides
   * @param locale Selected locale
   * @param customMessages Custom message overrides
   * @returns Merged locale messages
   */
  private initializeMessages(
    locale: Locale,
    customMessages?: Partial<LocaleMessages>
  ): LocaleMessages {
    const baseMessages = localeRegistry[locale];

    if (!customMessages) {
      return baseMessages;
    }

    // Deep merge custom messages with base messages
    return {
      qr: { ...baseMessages.qr, ...customMessages.qr },
      api: { ...baseMessages.api, ...customMessages.api },
      validation: {
        ...baseMessages.validation,
        ...customMessages.validation,
      },
    };
  }

  /**
   * Read QR code from an image and extract the payload
   * @param imageInput Image data (ArrayBuffer, Buffer, or base64 string)
   * @returns The QR code payload string
   */
  private async readQRCode(
    imageInput: ArrayBuffer | Buffer | string
  ): Promise<Result<string, SlipError>> {
    try {
      // If imageInput is a base64 string, convert it to a Buffer
      let processedInput = imageInput;
      if (
        typeof processedInput === "string" &&
        processedInput.includes("base64,")
      ) {
        const base64Data = processedInput.split("base64,")[1];
        processedInput = Buffer.from(base64Data, "base64");
      } else if (
        typeof processedInput === "string" &&
        !processedInput.includes("base64,")
      ) {
        // Assume it's a base64 string without the data URL prefix
        processedInput = Buffer.from(processedInput, "base64");
      }

      // Convert Buffer to Uint8Array if needed
      const imageArray =
        processedInput instanceof Buffer
          ? new Uint8Array(processedInput)
          : new Uint8Array(processedInput as ArrayBuffer);

      // Prepare image data for QR library
      const width = Math.sqrt(imageArray.length / 4); // Assuming square image with RGBA
      const height = width;

      if (!Number.isInteger(width)) {
        return {
          error: {
            type: "QR_CODE_ERROR",
            message: this.messages.qr.invalidDimensions,
          },
        };
      }

      // Use the QR library to read the code
      const qrImageData = {
        width,
        height,
        data: imageArray,
      };

      const result = decodeQR(qrImageData);

      if (!result) {
        return {
          error: {
            type: "QR_CODE_ERROR",
            message: this.messages.qr.notFound,
          },
        };
      }

      return { data: result };
    } catch (error) {
      return {
        error: {
          type: "QR_CODE_ERROR",
          message: `${this.messages.qr.readFailed}: ${(error as Error).message}`,
        },
      };
    }
  }

  /**
   * Call the inquiry API to verify a slip
   * @param payload Payload string from QR code
   * @returns Verification result
   */
  private async inquiry(
    payload: string
  ): Promise<Result<VerifySlipResult, SlipError>> {
    try {
      const response = await this.apiClient.post("/v1/inquiry", {
        payload,
      });

      if (response.data && response.data.valid !== undefined) {
        return { data: response.data as VerifySlipResult };
      }

      return {
        error: {
          type: "API_ERROR",
          message: this.messages.api.invalidResponse,
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          error: {
            type: "API_ERROR",
            message: `${this.messages.api.requestFailed}: ${error.message}`,
          },
        };
      }
      return {
        error: {
          type: "API_ERROR",
          message: `${this.messages.api.unexpectedError}: ${(error as Error).message}`,
        },
      };
    }
  }

  /**
   * Check if a string is numeric
   * @param str String to check
   * @returns true if string is numeric, false otherwise
   */
  private isNumeric(str: string): boolean {
    if (typeof str !== "string") return false;
    return !isNaN(Number(str)) && !isNaN(parseFloat(str));
  }

  /**
   * Check if a bank account number matches the expected account
   * @param expectedAccount Expected account number
   * @param actualAccount Actual account number from the slip
   * @returns true if accounts match, false otherwise
   */
  private checkBankAccount(
    expectedAccount: string,
    actualAccount: string
  ): boolean {
    const cleanExpected = expectedAccount.replace(/-/g, "");
    const cleanActual = actualAccount.replace(/-/g, "");

    if (cleanExpected.length !== cleanActual.length) return false;

    let matchingDigits = 0;
    for (let i = 0; i < cleanExpected.length; i++) {
      if (!this.isNumeric(cleanExpected[i])) continue;
      if (cleanExpected[i] !== cleanActual[i]) continue;
      matchingDigits++;
    }

    return matchingDigits >= 3;
  }

  /**
   * Check if a slip is too old (more than 1 day)
   * @param transDate Transaction date in YYYYMMDD format
   * @param transTime Transaction time in HH:mm:ss format
   * @returns true if slip is too old, false otherwise
   */
  private isOldSlip(transDate: string, transTime: string): boolean {
    try {
      // Parse the date and time
      const date = parse(transDate, "yyyyMMdd", new Date());
      const time = parse(transTime, "HH:mm:ss", new Date());

      // Combine date and time
      const transactionDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes(),
        time.getSeconds()
      );

      // Check if transaction is older than 1 day
      const oneDayAgo = subDays(new Date(), 1);
      return !isAfter(transactionDateTime, oneDayAgo);
    } catch (error) {
      return true; // If parsing fails, consider the slip invalid
    }
  }

  /**
   * Validate a slip result against expected parameters
   * @param result Slip verification result
   * @param options Validation options
   * @returns Validation result
   */
  public validate(
    result: VerifySlipResult,
    options: ValidationOptions
  ): Result<VerifySlipResult, SlipError> {
    // Check if slip is valid
    if (!result.valid) {
      const error: SlipError = {
        type: "INVALID_SLIP",
        message: this.messages.validation.invalidSlip,
      };
      if (options.onValidationError) {
        options.onValidationError(error);
      }
      return { error };
    }

    // Check if slip is cached
    if (result.isCached) {
      const error: SlipError = {
        type: "VALIDATION_ERROR",
        message: this.messages.validation.slipAlreadyUsed,
      };
      if (options.onValidationError) {
        options.onValidationError(error);
      }
      return { error };
    }

    // Check if slip is too old
    if (this.isOldSlip(result.data.transDate, result.data.transTime)) {
      const error: SlipError = {
        type: "EXPIRED_SLIP",
        message: this.messages.validation.slipExpired,
      };
      if (options.onValidationError) {
        options.onValidationError(error);
      }
      return { error };
    }

    // Check if account number matches (if provided)
    if (options.expectedAccount) {
      const receiverAccount = result.data.receiver.account.value;
      if (
        !receiverAccount ||
        !this.checkBankAccount(options.expectedAccount, receiverAccount)
      ) {
        const error: SlipError = {
          type: "VALIDATION_ERROR",
          message: this.messages.validation.invalidAccount,
        };
        if (options.onValidationError) {
          options.onValidationError(error);
        }
        return { error };
      }
    }

    // Check if bank code matches (if provided)
    if (options.expectedBank) {
      if (result.data.receivingBank !== options.expectedBank) {
        const error: SlipError = {
          type: "VALIDATION_ERROR",
          message: this.messages.validation.invalidBank,
        };
        if (options.onValidationError) {
          options.onValidationError(error);
        }
        return { error };
      }
    }

    // Check if amount matches (if provided)
    if (options.expectedAmount) {
      // Validate the QR code payload using PromptParse
      try {
        const promptParseResult = parsePrompt(result.data.transRef);

        if (!promptParseResult) {
          const error: SlipError = {
            type: "VALIDATION_ERROR",
            message: this.messages.validation.invalidQRFormat,
          };
          if (options.onValidationError) {
            options.onValidationError(error);
          }
          return { error };
        }

        // Validate amount from PromptParse
        const qrAmount = promptParseResult.getTagValue("54"); // Tag 54 contains the transaction amount
        if (qrAmount !== options.expectedAmount) {
          const error: SlipError = {
            type: "VALIDATION_ERROR",
            message: this.messages.validation.amountMismatch,
          };
          if (options.onValidationError) {
            options.onValidationError(error);
          }
          return { error };
        }
      } catch (error) {
        const slipError: SlipError = {
          type: "VALIDATION_ERROR",
          message: this.messages.validation.invalidQRFormat,
        };
        if (options.onValidationError) {
          options.onValidationError(slipError);
        }
        return { error: slipError };
      }
    }

    // All validation passed
    if (options.onSuccess) {
      options.onSuccess(result);
    }
    return { data: result };
  }

  /**
   * Verify a slip using its QR code image
   * @param imageData QR code image data (ArrayBuffer, Buffer, or base64 string)
   * @param options Optional validation options
   * @returns Promise with verification result
   */
  public async inquiryImage(
    imageData: ArrayBuffer | Buffer | string,
    options?: ValidationOptions
  ): Promise<Result<VerifySlipResult, SlipError>> {
    // Read QR code
    const qrResult = await this.readQRCode(imageData);
    if (qrResult.error) {
      if (options?.onError) {
        options.onError(qrResult.error);
      }
      return qrResult;
    }

    // Call inquiry API
    const inquiryResult = await this.inquiry(qrResult.data);
    if (inquiryResult.error) {
      if (options?.onError) {
        options.onError(inquiryResult.error);
      }
      return inquiryResult;
    }

    // If validation options provided, validate the result
    if (
      options &&
      (options.expectedAccount ||
        options.expectedBank ||
        options.expectedAmount)
    ) {
      return this.validate(inquiryResult.data, options);
    }

    // No validation needed, just call onSuccess if provided
    if (options?.onSuccess) {
      options.onSuccess(inquiryResult.data);
    }
    return inquiryResult;
  }

  /**
   * Verify a slip using its payload
   * @param payload The payload string from the QR code
   * @param options Optional validation options
   * @returns Promise with verification result
   */
  public async inquiryPayload(
    payload: string,
    options?: ValidationOptions
  ): Promise<Result<VerifySlipResult, SlipError>> {
    // Call inquiry API
    const inquiryResult = await this.inquiry(payload);
    if (inquiryResult.error) {
      if (options?.onError) {
        options.onError(inquiryResult.error);
      }
      return inquiryResult;
    }

    // If validation options provided, validate the result
    if (
      options &&
      (options.expectedAccount ||
        options.expectedBank ||
        options.expectedAmount)
    ) {
      return this.validate(inquiryResult.data, options);
    }

    // No validation needed, just call onSuccess if provided
    if (options?.onSuccess) {
      options.onSuccess(inquiryResult.data);
    }
    return inquiryResult;
  }
}

/**
 * Factory function to create an RDCW Verify instance
 * @param config Configuration object with clientId, secret, and optional baseUrl
 * @returns RdcwVerify instance
 */
export function createRdcwVerify(config: RdcwVerifyConfig): RdcwVerify {
  return new RdcwVerify(config);
}

export default createRdcwVerify;
