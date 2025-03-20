# node-rdcw-slipverify

An unofficial SDK for [RDCW Slip Verify](https://slip.rdcw.co.th/) with helper function `validateSlip()` and PromptParse QR code validation

## Installation

```bash
npm install node-rdcw-slipverify
```

## Usage

### Basic Usage

```typescript
import SlipVerifySDK, { BankSlipValidator } from "node-rdcw-slipverify";
import { format, parseISO } from "date-fns";

// Initialize the SDK with your API credentials
const slipVerify = new SlipVerifySDK("your-client-id", "your-client-secret");

// Verify a slip using its payload
slipVerify
  .verifySlip("0038000600000101030060217Bf870bf26685f55526203TH9104CF62")
  .then((result) => {
    // Validate the slip with basic validation
    const expectedAccount = "1234567890"; // Your expected account number
    const expectedBank = "014"; // Your expected bank code

    const validationResult = BankSlipValidator.validateSlip(
      result,
      expectedAccount,
      expectedBank
    );

    if (!validationResult.isValid) {
      console.log("Validation failed:", validationResult.error);
      return;
    }

    // Or use enhanced validation with PromptParse
    const expectedAmount = "100.00"; // Optional: expected amount
    const enhancedValidationResult =
      BankSlipValidator.validateSlipWithPromptParse(
        result,
        expectedAccount,
        expectedBank,
        expectedAmount
      );

    if (!enhancedValidationResult.isValid) {
      console.log(
        "Enhanced validation failed:",
        enhancedValidationResult.error
      );
      return;
    }

    console.log("Validation successful!");
    console.log("Verification result:", result);

    // Format dates using date-fns
    if (result.valid) {
      const transDate = parseISO(result.data.transDate);
      const formattedDate = format(transDate, "yyyy-MM-dd");
      const formattedTime = format(parseISO(result.data.transTime), "HH:mm:ss");

      console.log("Transaction Date:", formattedDate);
      console.log("Transaction Time:", formattedTime);
    }
  })
  .catch((error) => {
    console.error("Verification failed:", error);
  });
```

### Reading QR code from an image

```typescript
import fs from "fs";
import SlipVerifySDK, { BankSlipValidator } from "rdcw-slipverify-sdk";

// Initialize the SDK with your API credentials
const slipVerify = new SlipVerifySDK("your-client-id", "your-client-secret");

// Read a QR code from an image file
const imageBuffer = fs.readFileSync("path/to/qr-code-image.png");

// Method 1: Read the QR code to get the payload
slipVerify
  .readQRCode(imageBuffer)
  .then((payload) => {
    console.log("QR Code payload:", payload);
    // Verify the payload
    return slipVerify.verifySlip(payload);
  })
  .then((result) => {
    // Validate the slip
    const expectedAccount = "1234567890"; // Your expected account number
    const expectedBank = "014"; // Your expected bank code

    const validationResult = BankSlipValidator.validateSlip(
      result,
      expectedAccount,
      expectedBank
    );

    if (!validationResult.isValid) {
      console.log("Validation failed:", validationResult.error);
      return;
    }

    console.log("Validation successful!");
    console.log("Verification result:", result);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// Method 2: Directly verify a slip from an image
slipVerify
  .verifySlipFromImage(imageBuffer)
  .then((result) => {
    // Validate the slip
    const expectedAccount = "1234567890"; // Your expected account number
    const expectedBank = "014"; // Your expected bank code

    const validationResult = BankSlipValidator.validateSlip(
      result,
      expectedAccount,
      expectedBank
    );

    if (!validationResult.isValid) {
      console.log("Validation failed:", validationResult.error);
      return;
    }

    console.log("Validation successful!");
    console.log("Verification result:", result);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

### Working with Base64 Images

```typescript
// For base64-encoded images (e.g., from a web form)
const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";

slipVerify
  .verifySlipFromImage(base64Image)
  .then((result) => {
    // Validate the slip
    const expectedAccount = "1234567890"; // Your expected account number
    const expectedBank = "014"; // Your expected bank code

    const validationResult = BankSlipValidator.validateSlip(
      result,
      expectedAccount,
      expectedBank
    );

    if (!validationResult.isValid) {
      console.log("Validation failed:", validationResult.error);
      return;
    }

    console.log("Validation successful!");
    console.log("Verification result:", result);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

## API Reference

### Constructor

```typescript
new SlipVerifySDK(clientId: string, clientSecret: string, options?: { baseUrl?: string })
```

- `clientId`: Your SlipVerify API client ID
- `clientSecret`: Your SlipVerify API client secret
- `options.baseUrl`: Optional API base URL (defaults to 'https://suba.rdcw.co.th')

### Methods

#### `readQRCode(imageData: ArrayBuffer | Buffer | string): Promise<string>`

Reads a QR code from an image and returns the payload string.

#### `verifySlip(payload: string): Promise<VerifySlipResult>`

Verifies a slip using its payload string.

#### `verifySlipFromImage(imageData: ArrayBuffer | Buffer | string): Promise<VerifySlipResult>`

Combines readQRCode and verifySlip in one operation - reads a QR code from an image and verifies the slip in one step.

### Interfaces

#### `Account`

```typescript
interface Account {
  type: null | string;
  value: null | string;
}
```

#### `Receiver`

```typescript
interface Receiver {
  displayName: string;
  name: string;
  proxy: Account;
  account: Account;
}
```

#### `Data`

```typescript
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

#### `Quota`

```typescript
interface Quota {
  cost: number;
  usage: number;
  limit: number;
}
```

#### `Subscription`

```typescript
interface Subscription {
  id: number;
  postpaid: boolean;
}
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
```

#### `BankValidationResult`

```typescript
interface BankValidationResult {
  isValid: boolean;
  error?: string;
}
```

### Bank Slip Validation

The SDK provides a `BankSlipValidator` class with utility functions for validating bank slips:

#### `BankSlipValidator.checkBankAccount(expectedAccount: string, actualAccount: string): boolean`

Checks if a bank account number matches the expected account. The matching is done by comparing at least 3 digits of the account numbers.

#### `BankSlipValidator.isOldSlip(transDate: string, transTime: string): boolean`

Checks if a slip is too old (more than 1 day). The date and time should be in the format returned by the API (YYYYMMDD and HH:mm:ss respectively).

#### `BankSlipValidator.validateSlip(result: VerifySlipResult, expectedAccount: string, expectedBank: string): BankValidationResult`

Validates a slip by checking:

- If the slip is valid
- If the slip has already been used (cached)
- If the slip is too old (more than 1 day)
- If the account number matches the expected account
- If the bank code matches the expected bank

Returns a `BankValidationResult` with the validation status and any error message.

#### `BankSlipValidator.validatePromptParse(payload: string): PromptParseResult | null`

Validates a QR code payload using the PromptParse library. Returns the parsed result or null if the payload is invalid.

#### `BankSlipValidator.validateSlipWithPromptParse(result: VerifySlipResult, expectedAccount: string, expectedBank: string, expectedAmount?: string): BankValidationResult`

Enhanced validation that combines basic slip validation with QR code validation using PromptParse. Checks:

- All basic slip validations
- QR code format validation
- Account number validation from QR code (Tag 30-01)
- Amount validation from QR code (Tag 54) if expectedAmount is provided

Returns a `BankValidationResult` with the validation status and any error message.

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
