/**
 * rdcw-slipverify-sdk
 * A TypeScript SDK for SlipVerify
 */

import axios, { AxiosInstance } from "axios";
import decodeQR from "@paulmillr/qr/decode";
import { isAfter, subDays, parse } from "date-fns";

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
 * Validation result for bank slip
 */
export interface BankValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Utility functions for bank slip validation
 */
export class BankSlipValidator {
  /**
   * Check if a bank account number matches the expected account
   * @param expectedAccount Expected account number
   * @param actualAccount Actual account number from the slip
   * @returns true if accounts match, false otherwise
   */
  static checkBankAccount(
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
  static isOldSlip(transDate: string, transTime: string): boolean {
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
   * Check if a string is numeric
   * @param str String to check
   * @returns true if string is numeric, false otherwise
   */
  private static isNumeric(str: string): boolean {
    if (typeof str !== "string") return false;
    return !isNaN(Number(str)) && !isNaN(parseFloat(str));
  }

  /**
   * Validate a bank slip
   * @param result Slip verification result
   * @param expectedAccount Expected account number
   * @param expectedBank Expected bank code
   * @returns Validation result
   */
  static validateSlip(
    result: VerifySlipResult,
    expectedAccount: string,
    expectedBank: string
  ): BankValidationResult {
    // Check if slip is valid
    if (!result.valid) {
      return {
        isValid: false,
        error: "Invalid slip",
      };
    }

    // Check if slip is cached
    if (result.isCached) {
      return {
        isValid: false,
        error: "This slip has already been used",
      };
    }

    // Check if slip is too old
    if (this.isOldSlip(result.data.transDate, result.data.transTime)) {
      return {
        isValid: false,
        error: "This slip has expired",
      };
    }

    // Check if account number matches
    const receiverAccount = result.data.receiver.account.value;
    if (
      !receiverAccount ||
      !this.checkBankAccount(expectedAccount, receiverAccount)
    ) {
      return {
        isValid: false,
        error: "Invalid account number",
      };
    }

    // Check if bank code matches
    if (result.data.receivingBank !== expectedBank) {
      return {
        isValid: false,
        error: "Invalid bank",
      };
    }

    return { isValid: true };
  }
}

/**
 * SlipVerifySDK - A TypeScript SDK for interacting with the SlipVerify API
 */
export class SlipVerifySDK {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private apiClient: AxiosInstance;

  /**
   * Initialize the SlipVerify SDK
   * @param clientId Your SlipVerify client ID
   * @param clientSecret Your SlipVerify client secret
   * @param options Additional configuration options
   */
  constructor(
    clientId: string,
    clientSecret: string,
    options: { baseUrl?: string } = {}
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.baseUrl = options.baseUrl || "https://suba.rdcw.co.th";

    // Initialize axios instance with default configuration
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: this.clientId,
        password: this.clientSecret,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Read QR code from an image and extract the payload
   * @param imageInput Image data (ArrayBuffer, Buffer, or base64 string)
   * @returns The QR code payload string
   * @throws Error if QR code cannot be read
   */
  async readQRCode(imageInput: ArrayBuffer | Buffer | string): Promise<string> {
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

      // Prepare image data for QR library - this is a simplification
      // In a real implementation, you'd need to properly decode the image format
      // Here we're assuming a simple raw RGBA format
      const width = Math.sqrt(imageArray.length / 4); // Assuming square image with RGBA
      const height = width;

      if (!Number.isInteger(width)) {
        throw new Error(
          "The image dimensions could not be determined. Please provide a valid image."
        );
      }

      // Use the QR library to read the code
      const qrImageData = {
        width,
        height,
        data: imageArray,
      };

      const result = decodeQR(qrImageData);

      if (!result) {
        throw new Error("No QR code found in the image");
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to read QR code: ${(error as Error).message}`);
    }
  }

  /**
   * Inquire about a transfer slip's validity and details
   * @param payload Payload string from QR code
   * @returns Promise with verification result
   */
  private async inquiry(payload: string): Promise<VerifySlipResult> {
    try {
      const response = await this.apiClient.post("/v1/inquiry", {
        payload,
      });

      if (response.data && response.data.valid !== undefined) {
        return response.data as VerifySlipResult;
      }

      throw new Error("Invalid response from API");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Verify a slip using its QR code image
   * @param imageData QR code image data (ArrayBuffer, Buffer, or base64 string)
   * @returns Promise with verification result
   */
  async verifySlipFromImage(
    imageData: ArrayBuffer | Buffer | string
  ): Promise<VerifySlipResult> {
    const payload = await this.readQRCode(imageData);
    return this.inquiry(payload);
  }

  /**
   * Verify a slip using its payload
   * @param payload The ID of the slip to verify
   * @returns Promise with verification result
   */
  async verifySlip(payload: string): Promise<VerifySlipResult> {
    return this.inquiry(payload);
  }
}

export default SlipVerifySDK;
