# node-rdcw-slipverify

> **Deprecated** — This package is no longer maintained. Use **[slipverify](https://github.com/maythiwat/slipverify)** instead: a unified SDK for Thai bank & e-wallet slip verification (including RDCW) with a single `inquiry` API and multiple providers.

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

## Migrate to slipverify

```bash
npm install slipverify
```

```typescript
import { inquiry } from "slipverify";
import { rdcw } from "slipverify/providers";

const provider = rdcw({
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
});

const result = await inquiry({
  provider,
  payload: "0038000600000101030060217Bf870bf26685f55526203TH9104CF62",
});

if (result.valid) {
  console.log(result.data);
} else {
  console.log("Slip is invalid.");
}
```

| This package | [slipverify](https://github.com/maythiwat/slipverify) |
| ------------ | ------------------------------------------------------- |
| `createSlipVerify({ clientId, secret })` | `rdcw({ clientId, clientSecret })` |
| `verifyFromPayload(payload)` | `inquiry({ provider, payload })` |
| `Result<T, E>` (`{ data }` / `{ error }`) | `result.valid` + `result.data`; API errors throw `SlipVerifyError` |

**Other providers** (SCB, KBank, SlipOK, Thunder, EasySlip, TrueMoney, etc.) use the same `inquiry` flow — see the [slipverify README](https://github.com/maythiwat/slipverify#usage).

**Requirements:** Node **>= 18** or Bun **>= 1.0** (native `fetch`). Server-side only.

---

## Legacy documentation (v4)

The sections below describe this deprecated package only. Do not start new projects on `node-rdcw-slipverify`.

Unofficial SDK for [RDCW Slip Verify](https://slip.rdcw.co.th/). Requests use **`POST {baseUrl}/v2/inquiry`** with **`fetch`** — JSON body for a payload string, or **`multipart/form-data`** (`file`) for slip images.

### Installation

```bash
npm install node-rdcw-slipverify
```

### Quick start

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

### Verify from slip image (multipart)

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
```

### Validation (optional second argument)

```typescript
const result = await slip.verifyFromPayload(payload, {
  expectedAccount: "1234567890",
  expectedBank: "014",
  expectedAmount: "100.00",
  maxAgeDays: 1,
  rejectCached: true,
});
```

### Development

```bash
ni
nr build
```

## License

ISC
