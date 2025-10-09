/**
 * Example demonstrating locale configuration
 */

import { createRdcwVerify } from "./src/index";

// Example 1: Using default English locale
const rdcwEn = createRdcwVerify({
  clientId: "test-client-id",
  secret: "test-secret",
  // locale: "en" is the default
});

// Example 2: Using Thai locale
const rdcwTh = createRdcwVerify({
  clientId: "test-client-id",
  secret: "test-secret",
  locale: "th",
});

// Example 3: Using custom messages with English locale
const rdcwCustom = createRdcwVerify({
  clientId: "test-client-id",
  secret: "test-secret",
  locale: "en",
  customMessages: {
    validation: {
      invalidSlip: "The payment slip you provided is not valid",
      slipExpired: "This payment slip has expired and cannot be used",
    },
    qr: {
      notFound: "We couldn't detect a QR code in your image",
    },
  },
});

// Example 4: Partial custom messages with Thai locale
const rdcwThCustom = createRdcwVerify({
  clientId: "test-client-id",
  secret: "test-secret",
  locale: "th",
  customMessages: {
    validation: {
      invalidSlip: "สลิปชำระเงินไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
    },
    // Other messages will use default Thai locale
  },
});

console.log("✅ Locale configuration examples loaded successfully!");
console.log("\nAvailable instances:");
console.log("- rdcwEn: English (default)");
console.log("- rdcwTh: Thai locale");
console.log("- rdcwCustom: Custom English messages");
console.log("- rdcwThCustom: Custom Thai messages");

