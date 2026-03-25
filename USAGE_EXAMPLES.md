# Usage examples (v3)

## Installation

```bash
npm install node-rdcw-slipverify
```

Requires **Node 18+**.

## Basic setup

```typescript
import { createSlipVerify } from "node-rdcw-slipverify";

const slip = createSlipVerify({
  clientId: "your-client-id",
  secret: "your-client-secret",
  baseUrl: "https://suba.rdcw.co.th", // optional default
});
```

## Payload inquiry (no local validation)

```typescript
const result = await slip.verifyFromPayload(
  "0038000600000101030060217Bf870bf26685f55526203TH9104CF62"
);

if (result.error) {
  console.error(result.error.message, result.error.code);
} else {
  console.log(result.data.data.amount, result.data.data.receivingBank);
}
```

## Multipart inquiry (slip image file)

```typescript
import fs from "node:fs";

const buf = fs.readFileSync("./slip.png");

const result = await slip.verifyFromSlipFile({
  data: buf,
  fileName: "slip.png",
  contentType: "image/png",
});
```

## Inquiry + validation

Pass a second argument to enforce **valid flag**, **cache**, **age** (default 1 day), and optional **account / bank / amount**:

```typescript
const result = await slip.verifyFromPayload(payload, {
  expectedAccount: "1234567890",
  expectedBank: "014",
  expectedAmount: "100.00",
  maxAgeDays: 1,
  rejectCached: true,
});

if (result.error) {
  switch (result.error.type) {
    case "INVALID_SLIP":
    case "EXPIRED_SLIP":
    case "VALIDATION_ERROR":
    case "API_ERROR":
      console.log(result.error.message);
  }
}
```

## Thai locale

```typescript
const slip = createSlipVerify({
  clientId: "…",
  secret: "…",
  locale: "th",
});
```

## Custom messages

```typescript
const slip = createSlipVerify({
  clientId: "…",
  secret: "…",
  locale: "en",
  customMessages: {
    validation: {
      invalidSlip: "The payment slip is invalid",
      slipExpired: "This payment slip has expired",
    },
    api: {
      requestFailed: "Network or API error",
    },
  },
});
```

## Manual validation (standalone)

```typescript
import {
  validateSlipResult,
  mergeLocaleMessages,
} from "node-rdcw-slipverify";

const messages = mergeLocaleMessages("en");

const verified = await slip.verifyFromPayload(payload);
if (verified.data) {
  const v = validateSlipResult(
    verified.data,
    { expectedBank: "014", rejectCached: false },
    messages
  );
}
```

## Express: multipart upload

Use a middleware that gives you a file buffer (e.g. `multer` memory storage), then:

```typescript
import express from "express";
import multer from "multer";
import { createSlipVerify } from "node-rdcw-slipverify";

const upload = multer({ storage: multer.memoryStorage() });
const slip = createSlipVerify({
  clientId: process.env.RDCW_CLIENT_ID!,
  secret: process.env.RDCW_SECRET!,
});

app.post("/verify-slip", upload.single("slip"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "slip file required" });
  }

  const result = await slip.verifyFromSlipFile(
    {
      data: file.buffer,
      fileName: file.originalname || "slip.jpg",
      contentType: file.mimetype || "image/jpeg",
    },
    {
      expectedAccount: process.env.BANK_ACCOUNT,
      expectedBank: process.env.BANK_CODE,
      expectedAmount: req.body.expectedAmount,
    }
  );

  if (result.error) {
    return res.status(400).json({
      success: false,
      error: result.error.message,
      type: result.error.type,
      code: result.error.code,
    });
  }

  res.json({ success: true, data: result.data });
});
```

## TypeScript imports

```typescript
import type {
  Result,
  SlipError,
  VerifySlipResult,
  ValidateSlipOptions,
  SlipVerifyConfig,
  SlipFileInput,
} from "node-rdcw-slipverify";
```
