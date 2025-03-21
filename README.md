# node-rdcw-slipverify

An unofficial SDK for [RDCW Slip Verify](https://slip.rdcw.co.th/) with functional approach and type-safe error handling

## Installation

```bash
npm install node-rdcw-slipverify
```

## Usage

### Basic Usage

```typescript
import { verifySlipFromPayload, validateSlip } from "node-rdcw-slipverify";

const config = {
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
};

// Verify a slip using its payload
const verifyResult = await verifySlipFromPayload({
  payload: "0038000600000101030060217Bf870bf26685f55526203TH9104CF62",
  config,
});

if (verifyResult.error) {
  console.log("Verification failed:", verifyResult.error.message);
  // Handle specific error types
  switch (verifyResult.error.type) {
    case "API_ERROR":
      // Handle API errors
      break;
    case "QR_CODE_ERROR":
      // Handle QR code errors
      break;
    // ... handle other error types
  }
} else {
  // Validate the slip
  const validationResult = validateSlip({
    slipResult: verifyResult.data,
    expectedAccount: "1234567890", // Your expected account number
    expectedBank: "014", // Your expected bank code
    expectedAmount: "100.00", // Optional: expected amount
  });

  if (validationResult.error) {
    console.log("Validation failed:", validationResult.error.message);
  } else {
    console.log("Validation successful!");
    console.log("Verification result:", verifyResult.data);
  }
}
```

### Reading QR code from an image

```typescript
import fs from "fs";
import { verifySlipFromImage, validateSlip } from "node-rdcw-slipverify";

const config = {
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
};

// Read a QR code from an image file
const imageBuffer = fs.readFileSync("path/to/qr-code-image.png");

const verifyResult = await verifySlipFromImage({
  imageData: imageBuffer,
  config,
});

if (verifyResult.error) {
  console.log("Verification failed:", verifyResult.error.message);
} else {
  const validationResult = validateSlip({
    slipResult: verifyResult.data,
    expectedAccount: "1234567890",
    expectedBank: "014",
  });

  if (validationResult.error) {
    console.log("Validation failed:", validationResult.error.message);
  } else {
    console.log("Validation successful!");
    console.log("Verification result:", verifyResult.data);
  }
}
```

### Working with Base64 Images

```typescript
// For base64-encoded images (e.g., from a web form)
const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";

const verifyResult = await verifySlipFromImage({
  imageData: base64Image,
  config,
});

if (verifyResult.error) {
  console.log("Verification failed:", verifyResult.error.message);
} else {
  const validationResult = validateSlip({
    slipResult: verifyResult.data,
    expectedAccount: "1234567890",
    expectedBank: "014",
  });

  if (validationResult.error) {
    console.log("Validation failed:", validationResult.error.message);
  } else {
    console.log("Validation successful!");
    console.log("Verification result:", verifyResult.data);
  }
}
```

## API Reference

### Functions

#### `verifySlipFromPayload({ payload, config }): Promise<Result<VerifySlipResult, SlipError>>`

Verifies a slip using its payload string.

#### `verifySlipFromImage({ imageData, config }): Promise<Result<VerifySlipResult, SlipError>>`

Reads a QR code from an image and verifies the slip in one step.

#### `validateSlip({ slipResult, expectedAccount, expectedBank, expectedAmount? }): Result<true, SlipError>`

Validates a slip by checking:

- Slip validity
- Cache status
- Age (expires after 1 day)
- Account number match
- Bank code match
- QR code format
- Amount match (if expectedAmount is provided)

### Types

#### Result Type

```typescript
type Result<T, E> = Success<T> | Failure<E>;

interface Success<T> {
  data: T;
  error?: never;
}

interface Failure<E> {
  data?: never;
  error: E;
}
```

#### Error Types

```typescript
type ErrorType =
  | "INVALID_SLIP"
  | "EXPIRED_SLIP"
  | "QR_CODE_ERROR"
  | "API_ERROR"
  | "VALIDATION_ERROR";

interface SlipError {
  type: ErrorType;
  message: string;
}
```

#### Configuration

```typescript
interface SlipVerifyConfig {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
}
```

#### Validation Parameters

```typescript
interface ValidateSlipParams {
  slipResult: VerifySlipResult;
  expectedAccount: string;
  expectedBank: string;
  expectedAmount?: string;
}
```

#### API Response Types

```typescript
interface VerifySlipResult {
  discriminator: string;
  valid: boolean;
  data: TransactionData;
  quota: Quota;
  subscription: Subscription;
  isCached: boolean;
}

interface TransactionData {
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
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run in development mode
npm run dev
```

### Scripts

- `npm run build` - Build the package
- `npm run dev` - Run the package in development mode
- `npm run clean` - Remove build artifacts
- `npm run prepare` - Prepare the package for publishing (runs automatically on npm install)

## License

ISC
