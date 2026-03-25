import { isAfter, parse, subDays } from "date-fns";
import { parse as parsePrompt } from "promptparse";

import type {
  LocaleMessages,
  Result,
  SlipError,
  ValidateSlipOptions,
  VerifySlipResult,
} from "./types";

function isNumeric(str: string): boolean {
  if (typeof str !== "string") return false;
  return !isNaN(Number(str)) && !isNaN(parseFloat(str));
}

function checkBankAccount(expectedAccount: string, actualAccount: string): boolean {
  const cleanExpected = expectedAccount.replace(/-/g, "");
  const cleanActual = actualAccount.replace(/-/g, "");

  if (cleanExpected.length !== cleanActual.length) return false;

  let matchingDigits = 0;
  for (let i = 0; i < cleanExpected.length; i++) {
    if (!isNumeric(cleanExpected[i])) continue;
    if (cleanExpected[i] !== cleanActual[i]) continue;
    matchingDigits++;
  }

  return matchingDigits >= 3;
}

function isSlipOlderThan(
  transDate: string,
  transTime: string,
  maxAgeDays: number
): boolean {
  try {
    const date = parse(transDate, "yyyyMMdd", new Date());
    const time = parse(transTime, "HH:mm:ss", new Date());

    const transactionDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds()
    );

    const cutoff = subDays(new Date(), maxAgeDays);
    return !isAfter(transactionDateTime, cutoff);
  } catch {
    return true;
  }
}

/**
 * Validate an API inquiry result against business rules (account, bank, amount, age, cache).
 */
export function validateSlipResult(
  result: VerifySlipResult,
  options: ValidateSlipOptions,
  messages: LocaleMessages
): Result<VerifySlipResult, SlipError> {
  const v = messages.validation;
  const rejectCached = options.rejectCached ?? true;
  const maxAgeDays = options.maxAgeDays ?? 1;

  if (!result.valid) {
    return {
      error: {
        type: "INVALID_SLIP",
        message: v.invalidSlip,
      },
    };
  }

  if (rejectCached && result.isCached) {
    return {
      error: {
        type: "VALIDATION_ERROR",
        message: v.slipAlreadyUsed,
      },
    };
  }

  if (isSlipOlderThan(result.data.transDate, result.data.transTime, maxAgeDays)) {
    return {
      error: {
        type: "EXPIRED_SLIP",
        message: v.slipExpired,
      },
    };
  }

  if (options.expectedAccount) {
    const receiverAccount = result.data.receiver.account.value;
    if (
      !receiverAccount ||
      !checkBankAccount(options.expectedAccount, receiverAccount)
    ) {
      return {
        error: {
          type: "VALIDATION_ERROR",
          message: v.invalidAccount,
        },
      };
    }
  }

  if (options.expectedBank) {
    if (result.data.receivingBank !== options.expectedBank) {
      return {
        error: {
          type: "VALIDATION_ERROR",
          message: v.invalidBank,
        },
      };
    }
  }

  if (options.expectedAmount) {
    try {
      const promptParseResult = parsePrompt(result.data.transRef);

      if (!promptParseResult) {
        return {
          error: {
            type: "VALIDATION_ERROR",
            message: v.invalidQRFormat,
          },
        };
      }

      const qrAmount = promptParseResult.getTagValue("54");
      if (qrAmount !== options.expectedAmount) {
        return {
          error: {
            type: "VALIDATION_ERROR",
            message: v.amountMismatch,
          },
        };
      }
    } catch {
      return {
        error: {
          type: "VALIDATION_ERROR",
          message: v.invalidQRFormat,
        },
      };
    }
  }

  return { data: result };
}

export function shouldRunValidation(validate?: ValidateSlipOptions): boolean {
  return validate !== undefined;
}
