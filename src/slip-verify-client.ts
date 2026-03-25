import {
  buildBasicAuthHeader,
  defaultBaseUrl,
  inquiryPayloadJson,
  inquirySlipMultipart,
} from "./inquiry";
import { mergeLocaleMessages } from "./locales";
import type {
  LocaleMessages,
  Result,
  SlipError,
  SlipFileInput,
  SlipVerifyConfig,
  ValidateSlipOptions,
  VerifySlipResult,
} from "./types";
import { shouldRunValidation, validateSlipResult } from "./validate-slip";

export class SlipVerifyClient {
  private readonly clientId: string;
  private readonly secret: string;
  private readonly baseUrl: string;
  private readonly messages: LocaleMessages;

  constructor(config: SlipVerifyConfig) {
    this.clientId = config.clientId;
    this.secret = config.secret;
    this.baseUrl = (config.baseUrl ?? defaultBaseUrl).replace(/\/$/, "");
    this.messages = mergeLocaleMessages(config.locale ?? "en", config.customMessages);
  }

  private authHeader(): string {
    return buildBasicAuthHeader(this.clientId, this.secret);
  }

  /**
   * Verify via PromptPay / slip payload (JSON body on `/v2/inquiry`).
   */
  async verifyFromPayload(
    payload: string,
    validate?: ValidateSlipOptions
  ): Promise<Result<VerifySlipResult, SlipError>> {
    const inquiryResult = await inquiryPayloadJson({
      baseUrl: this.baseUrl,
      authorization: this.authHeader(),
      apiMessages: this.messages.api,
      payload,
    });

    if (inquiryResult.error) {
      return inquiryResult;
    }

    if (shouldRunValidation(validate)) {
      return validateSlipResult(inquiryResult.data, validate!, this.messages);
    }

    return inquiryResult;
  }

  /**
   * Verify by uploading the slip image (`multipart/form-data` field `file`).
   */
  async verifyFromSlipFile(
    input: SlipFileInput,
    validate?: ValidateSlipOptions
  ): Promise<Result<VerifySlipResult, SlipError>> {
    const inquiryResult = await inquirySlipMultipart({
      baseUrl: this.baseUrl,
      authorization: this.authHeader(),
      apiMessages: this.messages.api,
      slipBuffer: input.data,
      fileName: input.fileName,
      contentType: input.contentType,
      buildFormData: input.buildFormData,
    });

    if (inquiryResult.error) {
      return inquiryResult;
    }

    if (shouldRunValidation(validate)) {
      return validateSlipResult(inquiryResult.data, validate!, this.messages);
    }

    return inquiryResult;
  }

  /**
   * Run validation rules on an existing inquiry result (same locale/messages as this client).
   */
  validate(
    result: VerifySlipResult,
    options: ValidateSlipOptions
  ): Result<VerifySlipResult, SlipError> {
    return validateSlipResult(result, options, this.messages);
  }
}

export function createSlipVerify(config: SlipVerifyConfig): SlipVerifyClient {
  return new SlipVerifyClient(config);
}
