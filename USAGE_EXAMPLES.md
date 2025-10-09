# Usage Examples

This document provides comprehensive examples of using the RDCW Slip Verify SDK.

## Table of Contents

1. [Installation](#installation)
2. [Basic Setup](#basic-setup)
3. [Locale Configuration](#locale-configuration)
4. [Simple Inquiry](#simple-inquiry)
5. [Inquiry with Validation](#inquiry-with-validation)
6. [Using Callbacks](#using-callbacks)
7. [Manual Validation](#manual-validation)
8. [Image-based Verification](#image-based-verification)
9. [Error Handling](#error-handling)

## Installation

```bash
npm install node-rdcw-slipverify
```

## Basic Setup

```typescript
import { createRdcwVerify } from "node-rdcw-slipverify";

const rdcw = createRdcwVerify({
  clientId: "your-client-id",
  secret: "your-client-secret",
  baseUrl: "https://suba.rdcw.co.th", // optional, this is the default
});
```

## Locale Configuration

The SDK supports multiple locales for error messages. By default, it uses English (`en`).

### Using English (Default)

```typescript
import { createRdcwVerify } from "node-rdcw-slipverify";

const rdcw = createRdcwVerify({
  clientId: "your-client-id",
  secret: "your-client-secret",
  // locale: "en" is the default, no need to specify
});

const result = await rdcw.inquiryPayload(invalidPayload);

if (result.error) {
  console.log(result.error.message); // "Invalid slip"
}
```

### Using Thai Locale

```typescript
import { createRdcwVerify } from "node-rdcw-slipverify";

const rdcw = createRdcwVerify({
  clientId: "your-client-id",
  secret: "your-client-secret",
  locale: "th", // Use Thai locale
});

const result = await rdcw.inquiryPayload(invalidPayload);

if (result.error) {
  console.log(result.error.message); // "สลิปไม่ถูกต้อง"
}
```

### Custom Messages

You can override specific messages while keeping the rest from the selected locale:

```typescript
import { createRdcwVerify } from "node-rdcw-slipverify";

const rdcw = createRdcwVerify({
  clientId: "your-client-id",
  secret: "your-client-secret",
  locale: "en",
  customMessages: {
    validation: {
      invalidSlip: "The payment slip is invalid",
      slipExpired: "This payment slip has expired",
      slipAlreadyUsed: "This payment slip has been used before",
      invalidAccount: "The account number does not match",
      invalidBank: "The bank code does not match",
      invalidQRFormat: "The QR code format is invalid",
      amountMismatch: "The payment amount does not match",
    },
    qr: {
      invalidDimensions: "Invalid image dimensions",
      notFound: "No QR code detected in the image",
      readFailed: "Unable to read QR code",
    },
    api: {
      invalidResponse: "Received invalid response from the server",
      requestFailed: "Server request failed",
      unexpectedError: "An unexpected error occurred",
    },
  },
});
```

### Partial Custom Messages

You can also override only specific messages:

```typescript
const rdcw = createRdcwVerify({
  clientId: "your-client-id",
  secret: "your-client-secret",
  locale: "th",
  customMessages: {
    validation: {
      // Override only specific validation messages in Thai
      invalidSlip: "สลิปชำระเงินไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
      slipExpired: "สลิปนี้เกินกำหนดเวลาที่ใช้งานได้แล้ว",
    },
    // Other messages will use default Thai locale
  },
});
```

### Available Error Messages

| Category       | Message Key         | English Default                                                             | Thai Default                                           |
| -------------- | ------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------ |
| **QR**         | `invalidDimensions` | The image dimensions could not be determined. Please provide a valid image. | ไม่สามารถระบุขนาดของรูปภาพได้ กรุณาใช้รูปภาพที่ถูกต้อง |
|                | `notFound`          | No QR code found in the image                                               | ไม่พบ QR code ในรูปภาพ                                 |
|                | `readFailed`        | Failed to read QR code                                                      | ไม่สามารถอ่าน QR code ได้                              |
| **API**        | `invalidResponse`   | Invalid response from API                                                   | ได้รับข้อมูลที่ไม่ถูกต้องจาก API                       |
|                | `requestFailed`     | API request failed                                                          | การเรียก API ล้มเหลว                                   |
|                | `unexpectedError`   | Unexpected error                                                            | เกิดข้อผิดพลาดที่ไม่คาดคิด                             |
| **Validation** | `invalidSlip`       | Invalid slip                                                                | สลิปไม่ถูกต้อง                                         |
|                | `slipAlreadyUsed`   | This slip has already been used                                             | สลิปนี้ถูกใช้งานไปแล้ว                                 |
|                | `slipExpired`       | This slip has expired                                                       | สลิปนี้หมดอายุแล้ว                                     |
|                | `invalidAccount`    | Invalid account number                                                      | หมายเลขบัญชีไม่ถูกต้อง                                 |
|                | `invalidBank`       | Invalid bank                                                                | ธนาคารไม่ถูกต้อง                                       |
|                | `invalidQRFormat`   | Invalid QR code format                                                      | รูปแบบ QR code ไม่ถูกต้อง                              |
|                | `amountMismatch`    | Amount mismatch in QR code                                                  | จำนวนเงินใน QR code ไม่ตรงกัน                          |

## Simple Inquiry

Verify a slip without any validation:

```typescript
const result = await rdcw.inquiryPayload(
  "0038000600000101030060217Bf870bf26685f55526203TH9104CF62"
);

if (result.error) {
  console.error("Failed:", result.error.message);
} else {
  console.log("Slip is valid!");
  console.log("Amount:", result.data.data.amount);
  console.log("Bank:", result.data.data.receivingBank);
  console.log("Sender:", result.data.data.sender.displayName);
}
```

## Inquiry with Validation

Automatically validate the slip during inquiry:

```typescript
const result = await rdcw.inquiryPayload(payload, {
  expectedAccount: "1234567890",
  expectedBank: "014", // SCB
  expectedAmount: "100.00", // optional
});

if (result.error) {
  // Handle validation or API errors
  switch (result.error.type) {
    case "INVALID_SLIP":
      console.log("The slip is invalid");
      break;
    case "EXPIRED_SLIP":
      console.log("The slip has expired (older than 1 day)");
      break;
    case "VALIDATION_ERROR":
      console.log("Validation failed:", result.error.message);
      break;
    case "API_ERROR":
      console.log("API request failed:", result.error.message);
      break;
  }
} else {
  console.log("Slip validated successfully!");
}
```

## Using Callbacks

Use callbacks for real-time feedback:

```typescript
const result = await rdcw.inquiryPayload(payload, {
  expectedAccount: "1234567890",
  expectedBank: "014",

  onSuccess: (data) => {
    console.log("✅ Verification successful!");
    console.log("Transaction amount:", data.data.amount);
    console.log("Transaction date:", data.data.transDate);

    // Update UI, save to database, etc.
    saveToDatabase(data);
  },

  onError: (error) => {
    console.log("❌ API Error:", error.message);

    // Log error, notify admin, etc.
    logError(error);
  },

  onValidationError: (error) => {
    console.log("⚠️ Validation Failed:", error.message);

    // Show user-friendly message
    showUserMessage("The slip validation failed: " + error.message);
  },
});

// Result is still available for further processing
if (result.data) {
  // Do something with the result
}
```

## Manual Validation

Verify first, then validate separately:

```typescript
// Step 1: Verify the slip
const verifyResult = await rdcw.inquiryPayload(payload, {
  onSuccess: (data) => console.log("Slip inquiry successful"),
  onError: (error) => console.log("API error:", error.message),
});

if (verifyResult.data) {
  // Step 2: Manually validate
  const validateResult = rdcw.validate(verifyResult.data, {
    expectedAccount: "1234567890",
    expectedBank: "014",
    expectedAmount: "100.00",

    onSuccess: (data) => {
      console.log("✅ Validation passed!");
      // Process the validated slip
    },

    onValidationError: (error) => {
      console.log("⚠️ Validation failed:", error.message);
      // Handle validation failure
    },
  });

  if (validateResult.data) {
    console.log("All checks passed!");
  }
}
```

## Image-based Verification

Verify a slip from a QR code image:

### From File Buffer

```typescript
import fs from "fs";

const imageBuffer = fs.readFileSync("path/to/slip-qr-code.png");

const result = await rdcw.inquiryImage(imageBuffer, {
  expectedAccount: "1234567890",
  expectedBank: "014",

  onSuccess: (data) => console.log("Image verified successfully!"),
  onError: (error) => console.log("Failed to process image:", error.message),
});
```

### From Base64 String

```typescript
// From a web form or API
const base64Image = req.body.slipImage; // "data:image/png;base64,iVBORw0KGg..."

const result = await rdcw.inquiryImage(base64Image, {
  expectedAccount: "1234567890",
  expectedBank: "014",

  onSuccess: (data) => {
    console.log("QR code read and verified!");
    console.log("Amount:", data.data.amount);
  },

  onError: (error) => {
    if (error.type === "QR_CODE_ERROR") {
      console.log("Could not read QR code from image");
    } else {
      console.log("Verification failed:", error.message);
    }
  },
});
```

### From ArrayBuffer

```typescript
// From a fetch request
const response = await fetch("https://example.com/slip-image.png");
const arrayBuffer = await response.arrayBuffer();

const result = await rdcw.inquiryImage(arrayBuffer, {
  expectedAccount: "1234567890",
  expectedBank: "014",
});
```

## Error Handling

### Complete Error Handling Example

```typescript
const result = await rdcw.inquiryImage(imageData, {
  expectedAccount: "1234567890",
  expectedBank: "014",
  expectedAmount: "100.00",
});

if (result.error) {
  const { type, message } = result.error;

  switch (type) {
    case "INVALID_SLIP":
      console.error("The slip is marked as invalid by the API");
      // The slip itself is not valid
      break;

    case "EXPIRED_SLIP":
      console.error("The slip has expired (older than 1 day)");
      // Transaction is too old
      break;

    case "QR_CODE_ERROR":
      console.error("Failed to read QR code:", message);
      // Could not parse the QR code from the image
      // Common causes: low quality image, no QR code in image
      break;

    case "API_ERROR":
      console.error("API request failed:", message);
      // Network error, authentication failed, or API is down
      break;

    case "VALIDATION_ERROR":
      console.error("Validation failed:", message);
      // Specific validation messages:
      // - "This slip has already been used" (cached)
      // - "Invalid account number" (account mismatch)
      // - "Invalid bank" (bank code mismatch)
      // - "Amount mismatch in QR code" (amount doesn't match)
      break;

    default:
      console.error("Unknown error:", message);
  }
} else {
  console.log("Success! Slip is valid and verified.");
  console.log("Data:", result.data);
}
```

### Async/Await with Try-Catch

```typescript
try {
  const result = await rdcw.inquiryPayload(payload, {
    expectedAccount: "1234567890",
    expectedBank: "014",
  });

  if (result.error) {
    throw new Error(`Verification failed: ${result.error.message}`);
  }

  // Process successful result
  console.log("Verification successful:", result.data);
} catch (error) {
  console.error("Unexpected error:", error);
  // Handle unexpected errors (network issues, etc.)
}
```

## Advanced Usage

### Combining with Express.js

```typescript
import express from "express";
import { createRdcwVerify } from "node-rdcw-slipverify";

const app = express();
const rdcw = createRdcwVerify({
  clientId: process.env.RDCW_CLIENT_ID!,
  secret: process.env.RDCW_SECRET!,
});

app.post("/verify-slip", express.json(), async (req, res) => {
  const { slipImage, expectedAmount } = req.body;

  const result = await rdcw.inquiryImage(slipImage, {
    expectedAccount: process.env.BANK_ACCOUNT!,
    expectedBank: process.env.BANK_CODE!,
    expectedAmount,

    onSuccess: (data) => {
      console.log("Slip verified for amount:", data.data.amount);
    },

    onValidationError: (error) => {
      console.log("Validation failed:", error.message);
    },
  });

  if (result.error) {
    return res.status(400).json({
      success: false,
      error: result.error.message,
      errorType: result.error.type,
    });
  }

  res.json({
    success: true,
    data: result.data,
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### TypeScript Types

All types are exported and can be imported:

```typescript
import type {
  Result,
  SlipError,
  ErrorType,
  VerifySlipResult,
  ValidationOptions,
  RdcwVerifyConfig,
  Data,
  Receiver,
  Account,
  Quota,
  Subscription,
} from "node-rdcw-slipverify";

// Use types in your code
function processSlipResult(result: Result<VerifySlipResult, SlipError>) {
  if (result.error) {
    handleError(result.error);
  } else {
    handleSuccess(result.data);
  }
}
```
