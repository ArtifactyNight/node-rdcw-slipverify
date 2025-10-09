# node-rdcw-slipverify

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

An unofficial SDK for [RDCW Slip Verify](https://slip.rdcw.co.th/) with a clean factory function API combining functional and OOP paradigms.

## Installation

```bash
npm install node-rdcw-slipverify
```

## Quick Start

```typescript
import { createRdcwVerify } from "node-rdcw-slipverify";

const rdcw = createRdcwVerify({
  clientId: "your-client-id",
  secret: "your-client-secret",
});

// Verify a slip from payload
const result = await rdcw.inquiryPayload(
  "0038000600000101030060217Bf870bf26685f55526203TH9104CF62"
);

if (result.error) {
  console.log("Error:", result.error.message);
} else {
  console.log("Success:", result.data);
}
```

## Locale Support

The SDK supports multiple locales for error messages. By default, it uses English (`en`), but you can configure it to use Thai (`th`) or provide custom messages.

### Using Thai Locale

```typescript
import { createRdcwVerify } from "node-rdcw-slipverify";

const rdcw = createRdcwVerify({
  clientId: "your-client-id",
  secret: "your-client-secret",
  locale: "th", // Use Thai locale
});

// All error messages will now be in Thai
const result = await rdcw.inquiryPayload(invalidPayload);

if (result.error) {
  console.log(result.error.message); // "สลิปไม่ถูกต้อง" instead of "Invalid slip"
}
```

### Custom Messages

You can also provide custom messages to override the default locale messages:

```typescript
const rdcw = createRdcwVerify({
  clientId: "your-client-id",
  secret: "your-client-secret",
  locale: "en",
  customMessages: {
    validation: {
      invalidSlip: "The slip you provided is not valid",
      slipExpired: "This slip is too old to be processed",
    },
    qr: {
      notFound: "We couldn't find a QR code in your image",
    },
  },
});
```

### Available Locales

- `en` - English (default)
- `th` - Thai (ภาษาไทย)

## Usage

### 1. Basic Inquiry (No Validation)

```typescript
import { createRdcwVerify } from "node-rdcw-slipverify";

const rdcw = createRdcwVerify({
  clientId: "your-client-id",
  secret: "your-client-secret",
});

// Verify from payload
const result = await rdcw.inquiryPayload(payload);

// Verify from image
const imageResult = await rdcw.inquiryImage(imageBuffer);

if (result.data) {
  console.log("Transaction details:", result.data);
}
```

### 2. Inquiry with Auto-Validation

```typescript
const result = await rdcw.inquiryPayload(payload, {
  expectedAccount: "1234567890",
  expectedBank: "014",
  expectedAmount: "100.00", // Optional
});

if (result.error) {
  console.log("Validation failed:", result.error.message);
  // Handle specific error types
  switch (result.error.type) {
    case "INVALID_SLIP":
      // Handle invalid slip
      break;
    case "EXPIRED_SLIP":
      // Handle expired slip
      break;
    case "VALIDATION_ERROR":
      // Handle validation errors
      break;
    case "API_ERROR":
      // Handle API errors
      break;
    case "QR_CODE_ERROR":
      // Handle QR code errors
      break;
  }
} else {
  console.log("Validation successful!", result.data);
}
```

### 3. Using Callbacks

```typescript
const result = await rdcw.inquiryImage(imageBuffer, {
  expectedAccount: "1234567890",
  expectedBank: "014",
  onSuccess: (data) => {
    console.log("✅ Verification successful!");
    console.log("Amount:", data.data.amount);
    console.log("From:", data.data.sender.displayName);
  },
  onError: (error) => {
    console.log("❌ API Error:", error.message);
  },
  onValidationError: (error) => {
    console.log("⚠️ Validation failed:", error.message);
  },
});

// Result is still returned for further processing
if (result.data) {
  // Save to database, etc.
}
```

### 4. Manual Validation

```typescript
// First, verify the slip
const verifyResult = await rdcw.inquiryPayload(payload);

if (verifyResult.data) {
  // Then, validate manually
  const validateResult = rdcw.validate(verifyResult.data, {
    expectedAccount: "1234567890",
    expectedBank: "014",
    expectedAmount: "100.00",
    onSuccess: (data) => console.log("Validation passed!"),
    onValidationError: (error) =>
      console.log("Validation failed:", error.message),
  });

  if (validateResult.data) {
    console.log("All checks passed!");
  }
}
```

### 5. Reading QR Code from Image

```typescript
import fs from "fs";

// From file buffer
const imageBuffer = fs.readFileSync("path/to/qr-code-image.png");
const result = await rdcw.inquiryImage(imageBuffer, {
  expectedAccount: "1234567890",
  expectedBank: "014",
});

// From base64 string
const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";
const result2 = await rdcw.inquiryImage(base64Image);
```

## API Reference

### Factory Function

#### `createRdcwVerify(config)`

Creates a new RDCW Verify instance.

**Parameters:**

- `config.clientId` (string, required): Your SlipVerify client ID
- `config.secret` (string, required): Your SlipVerify client secret
- `config.baseUrl` (string, optional): Custom API base URL (default: "https://suba.rdcw.co.th")
- `config.locale` (Locale, optional): Locale for error messages - `"en"` or `"th"` (default: "en")
- `config.customMessages` (Partial<LocaleMessages>, optional): Custom message overrides

**Returns:** `RdcwVerify` instance

### Instance Methods

#### `inquiryPayload(payload, options?)`

Verifies a slip using its payload string.

**Parameters:**

- `payload` (string): The QR code payload string
- `options` (ValidationOptions, optional): Validation options

**Returns:** `Promise<Result<VerifySlipResult, SlipError>>`

#### `inquiryImage(imageData, options?)`

Reads a QR code from an image and verifies the slip.

**Parameters:**

- `imageData` (ArrayBuffer | Buffer | string): Image data (buffer or base64 string)
- `options` (ValidationOptions, optional): Validation options

**Returns:** `Promise<Result<VerifySlipResult, SlipError>>`

#### `validate(result, options)`

Manually validates a verification result.

**Parameters:**

- `result` (VerifySlipResult): The result from inquiry
- `options` (ValidationOptions): Validation options

**Returns:** `Result<VerifySlipResult, SlipError>`

### Types

#### `Locale`

```typescript
type Locale = "en" | "th";
```

#### `LocaleMessages`

```typescript
interface LocaleMessages {
  qr: {
    invalidDimensions: string;
    notFound: string;
    readFailed: string;
  };
  api: {
    invalidResponse: string;
    requestFailed: string;
    unexpectedError: string;
  };
  validation: {
    invalidSlip: string;
    slipAlreadyUsed: string;
    slipExpired: string;
    invalidAccount: string;
    invalidBank: string;
    invalidQRFormat: string;
    amountMismatch: string;
  };
}
```

#### `Result<T, E>`

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

#### `ValidationOptions`

```typescript
interface ValidationOptions {
  expectedAccount?: string;
  expectedBank?: string;
  expectedAmount?: string;
  onSuccess?: (data: VerifySlipResult) => void;
  onError?: (error: SlipError) => void;
  onValidationError?: (error: SlipError) => void;
}
```

#### `SlipError`

```typescript
interface SlipError {
  type: ErrorType;
  message: string;
}

type ErrorType =
  | "INVALID_SLIP"
  | "EXPIRED_SLIP"
  | "QR_CODE_ERROR"
  | "API_ERROR"
  | "VALIDATION_ERROR";
```

#### `VerifySlipResult`

```typescript
interface VerifySlipResult {
  discriminator: string;
  valid: boolean;
  data: Data;
  quota: Quota;
  subscription: Subscription;
  isCached: boolean;
}

interface Data {
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

## Validation Rules

The SDK validates slips based on the following criteria:

1. **Validity**: The slip must be marked as valid by the API
2. **Cache Status**: The slip must not have been used before (not cached)
3. **Age**: The slip must not be older than 1 day
4. **Account Number**: Matches the expected account (if provided)
5. **Bank Code**: Matches the expected bank (if provided)
6. **Amount**: Matches the expected amount (if provided)

## Error Handling

All methods return a `Result` type that contains either `data` or `error`:

```typescript
const result = await rdcw.inquiryPayload(payload);

if (result.error) {
  // Handle error
  console.error(result.error.type, result.error.message);
} else {
  // Process data
  console.log(result.data);
}
```

### Error Types

- `INVALID_SLIP`: The slip is invalid
- `EXPIRED_SLIP`: The slip is older than 1 day
- `QR_CODE_ERROR`: Failed to read or parse QR code
- `API_ERROR`: API request failed
- `VALIDATION_ERROR`: Validation checks failed

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
- `npm run prepare` - Prepare the package for publishing

### Commit Message Convention

This project uses [semantic-release](https://semantic-release.gitbook.io/semantic-release/) with the [Angular Commit Message Convention](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format) for automated releases.

**Format:**
```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

**Types:**
- `feat`: A new feature (triggers minor release)
- `fix`: A bug fix (triggers patch release)
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi colons, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements (triggers patch release)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Breaking Changes:**
Add `BREAKING CHANGE:` in the commit footer to trigger a major release:
```
feat(api): change validation API

BREAKING CHANGE: The validate method now returns a Result type instead of throwing errors
```

**Examples:**
```bash
# Patch release (1.0.0 -> 1.0.1)
fix(validation): correct bank code validation

# Minor release (1.0.0 -> 1.1.0)
feat(locale): add Thai language support

# Major release (1.0.0 -> 2.0.0)
feat(api): redesign SDK API

BREAKING CHANGE: Removed deprecated methods and changed initialization pattern
```

**Automated Release Process:**

1. Push commits to `main` branch following the commit convention
2. GitHub Actions automatically runs semantic-release
3. Version is bumped based on commit types
4. CHANGELOG.md is generated
5. Package is published to npm with provenance
6. GitHub Release is created with release notes

No manual version bumping or tagging needed! 🎉

## License

ISC
