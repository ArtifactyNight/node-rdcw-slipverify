import type { Locale, LocaleMessages } from "./types";

const enMessages: LocaleMessages = {
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

const thMessages: LocaleMessages = {
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

const localeRegistry: Record<Locale, LocaleMessages> = {
  en: enMessages,
  th: thMessages,
};

export function mergeLocaleMessages(
  locale: Locale,
  customMessages?: Partial<LocaleMessages>
): LocaleMessages {
  const baseMessages = localeRegistry[locale];
  if (!customMessages) {
    return baseMessages;
  }
  return {
    api: { ...baseMessages.api, ...customMessages.api },
    validation: {
      ...baseMessages.validation,
      ...customMessages.validation,
    },
  };
}
