# node-rdcw-slipverify

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

Unofficial **v3** SDK for [RDCW Slip Verify](https://slip.rdcw.co.th/). All requests use **`POST {baseUrl}/v2/inquiry`** with **`fetch`** — JSON body for a payload string, or **`multipart/form-data`** (`file`) for slip images.

**Requirements:** Node **18+** (`fetch`, `FormData`, `Blob`).

## Installation

```bash
npm install node-rdcw-slipverify
```

## Quick start

```typescript
import { createSlipVerify } from "node-rdcw-slipverify";

const slip = createSlipVerify({
  clientId: "your-client-id",
  secret: "your-client-secret",
});

const result = await slip.verifyFromPayload(
  "0038000600000101030060217Bf870bf26685f55526203TH9104CF62"
);

if (result.error) {
  console.log(result.error.message, result.error.code);
} else {
  console.log(result.data);
}
```

## Verify from slip image (multipart)

Upload the **full slip image** (JPG/PNG). The API reads the slip; you do not need to decode a QR locally.

```typescript
import fs from "node:fs";
import { createSlipVerify } from "node-rdcw-slipverify";

const slip = createSlipVerify({
  clientId: process.env.RDCW_CLIENT_ID!,
  secret: process.env.RDCW_SECRET!,
});

const buf = fs.readFileSync("./slip.jpg");

const result = await slip.verifyFromSlipFile({
  data: buf,
  fileName: "slip.jpg",
  contentType: "image/jpeg",
});

if (result.data) {
  console.log(result.data.data.amount, result.data.data.transRef);
}
```

## Validation (optional second argument)

If you pass a **second argument**, the SDK runs checks on the API result:

- API `valid` must be true
- `isCached` rejected by default (`rejectCached: false` to allow)
- Transaction age vs `maxAgeDays` (default **1**)
- Optional `expectedAccount`, `expectedBank`, `expectedAmount` (amount uses `promptparse` on `transRef`)

```typescript
const result = await slip.verifyFromPayload(payload, {
  expectedAccount: "1234567890",
  expectedBank: "014",
  expectedAmount: "100.00",
  maxAgeDays: 1,
  rejectCached: true,
});
```

Omit the second argument to return the **raw API result** without these rules.

## Manual validation

```typescript
import {
  createSlipVerify,
  validateSlipResult,
  mergeLocaleMessages,
} from "node-rdcw-slipverify";

const slip = createSlipVerify({ clientId: "…", secret: "…" });
const verified = await slip.verifyFromPayload(payload);

if (verified.data) {
  const checked = validateSlipResult(
    verified.data,
    { expectedBank: "014" },
    mergeLocaleMessages("th")
  );
}
```

Or use the client (uses the same locale as the client config):

```typescript
const verified = await slip.verifyFromPayload(payload);
if (verified.data) {
  const checked = slip.validate(verified.data, { expectedBank: "014" });
}
```

## Locales

```typescript
const slip = createSlipVerify({
  clientId: "…",
  secret: "…",
  locale: "th",
});

const slipEn = createSlipVerify({
  clientId: "…",
  secret: "…",
  locale: "en",
  customMessages: {
    validation: {
      invalidSlip: "The slip you provided is not valid",
    },
  },
});
```

Supported locales: `en`, `th`.

## Advanced: custom `FormData`

```typescript
await slip.verifyFromSlipFile({
  data: buffer,
  fileName: "x.jpg",
  buildFormData: () => {
    const fd = new FormData();
    fd.append("file", new Blob([buffer], { type: "image/jpeg" }), "x.jpg");
    return fd;
  },
});
```

## Low-level HTTP helpers

For custom flows you can call **`inquiryPayloadJson`** / **`inquirySlipMultipart`** from `"node-rdcw-slipverify"` (same auth and URL as the client).

## API errors

On failure responses, `SlipError` may include **`code`** (when the server returns a numeric `code`) and always includes **`message`**.

## Types

`Result<T, E>` is `{ data: T } | { error: E }`. Main exports: `SlipVerifyConfig`, `SlipFileInput`, `ValidateSlipOptions`, `VerifySlipResult`, `SlipError`, `ErrorType`.

## Breaking changes (v3)

- **Removed:** `createRdcwVerify`, `inquiryPayload`, `inquiryImage`, `inquirySlipMultipart`, `inquirySlipV2Multipart`, `/v1/inquiry`, axios, local QR decoding.
- **Added:** `createSlipVerify`, `SlipVerifyClient.verifyFromPayload`, `verifyFromSlipFile`, JSON inquiries on **`/v2/inquiry`**.

## Development

```bash
ni
nr build
```

Uses the [Angular commit convention](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit) with semantic-release.

## License

ISC
