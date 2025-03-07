/**
 * Example usage of the rdcw-slipverify-sdk
 */

import fs from "fs";
import path from "path";
import { format, parseISO } from "date-fns"; // date-fns is bundled with the package
import SlipVerifySDK, { BankSlipValidator } from "../src";

// Replace with your actual API credentials
const clientId = "your-client-id";
const clientSecret = "your-client-secret";

// Initialize the SDK
const slipVerify = new SlipVerifySDK(clientId, clientSecret);

// Example 1: Verify a slip using a raw payload
async function exampleVerifyWithPayload() {
  try {
    // Example payload from a QR code
    const payload = "0038000600000101030060217Bf870bf26685f55526203TH9104CF62";

    console.log("Example 1: Verifying slip with payload:", payload);
    const result = await slipVerify.verifySlip(payload);

    console.log("Verification result:", result);
    console.log("Is valid:", result.valid);

    // Example of using the BankSlipValidator
    const expectedAccount = "1234567890"; // Replace with your expected account number
    const expectedBank = "014"; // Replace with your expected bank code

    const validationResult = BankSlipValidator.validateSlip(
      result,
      expectedAccount,
      expectedBank
    );

    if (!validationResult.isValid) {
      console.log("\nValidation failed:", validationResult.error);
      return;
    }

    console.log("\nValidation successful!");

    // Parse and format the transaction date and time
    const transDate = parseISO(result.data.transDate);
    const formattedDate = format(transDate, "yyyy-MM-dd");
    const formattedTime = format(parseISO(result.data.transTime), "HH:mm:ss");

    console.log("\nTransaction Details:");
    console.log("Reference:", result.data.transRef);
    console.log("Amount:", result.data.amount);
    console.log("Currency:", result.data.paidLocalCurrency);
    console.log("Date:", formattedDate);
    console.log("Time:", formattedTime);
    console.log("Fee:", result.data.transFeeAmount);
    console.log("Country Code:", result.data.countryCode);

    console.log("\nReceiver Details:");
    console.log("Name:", result.data.receiver.name);
    console.log("Display Name:", result.data.receiver.displayName);
    console.log("Account:", result.data.receiver.account.value);
    console.log("Proxy:", result.data.receiver.proxy.value);

    console.log("\nSender Details:");
    console.log("Name:", result.data.sender.name);
    console.log("Display Name:", result.data.sender.displayName);
    console.log("Account:", result.data.sender.account.value);
    console.log("Proxy:", result.data.sender.proxy.value);

    console.log("\nBank Details:");
    console.log("Sending Bank:", result.data.sendingBank);
    console.log("Receiving Bank:", result.data.receivingBank);

    console.log("\nReference Information:");
    console.log("Ref1:", result.data.ref1);
    console.log("Ref2:", result.data.ref2);
    console.log("Ref3:", result.data.ref3);
    console.log("Merchant ID:", result.data.toMerchantId);

    console.log("\nQuota Information:");
    console.log("Cost:", result.quota.cost);
    console.log("Usage:", result.quota.usage);
    console.log("Limit:", result.quota.limit);

    console.log("\nSubscription Information:");
    console.log("ID:", result.subscription.id);
    console.log("Postpaid:", result.subscription.postpaid);

    console.log("\nAdditional Information:");
    console.log("Discriminator:", result.discriminator);
    console.log("Is Cached:", result.isCached);
  } catch (error) {
    console.error("Error verifying slip:", error);
  }
}

// Example 2: Read QR code from an image and verify the slip
async function exampleVerifyWithImage() {
  try {
    // Replace with the path to your QR code image
    const imagePath = path.join(__dirname, "sample-qrcode.png");

    // Check if the image exists
    if (!fs.existsSync(imagePath)) {
      console.log("QR code image not found. Skipping Example 2.");
      return;
    }

    const imageBuffer = fs.readFileSync(imagePath);

    console.log("Example 2: Reading QR code from image...");
    const payload = await slipVerify.readQRCode(imageBuffer);

    console.log("QR code payload:", payload);
    console.log("Verifying slip...");

    const result = await slipVerify.verifySlip(payload);

    // Example of using the BankSlipValidator
    const expectedAccount = "1234567890"; // Replace with your expected account number
    const expectedBank = "014"; // Replace with your expected bank code

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
  } catch (error) {
    console.error("Error reading QR code or verifying slip:", error);
  }
}

// Example 3: One-step verification from image
async function exampleOneStepVerification() {
  try {
    // Replace with the path to your QR code image
    const imagePath = path.join(__dirname, "sample-qrcode.png");

    // Check if the image exists
    if (!fs.existsSync(imagePath)) {
      console.log("QR code image not found. Skipping Example 3.");
      return;
    }

    const imageBuffer = fs.readFileSync(imagePath);

    console.log("Example 3: One-step verification from image...");
    const result = await slipVerify.verifySlipFromImage(imageBuffer);

    // Example of using the BankSlipValidator
    const expectedAccount = "1234567890"; // Replace with your expected account number
    const expectedBank = "014"; // Replace with your expected bank code

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
  } catch (error) {
    console.error("Error in one-step verification:", error);
  }
}

// Run the examples
async function runExamples() {
  console.log("Running SlipVerifySDK Examples\n");

  await exampleVerifyWithPayload();
  console.log("\n" + "-".repeat(50) + "\n");

  await exampleVerifyWithImage();
  console.log("\n" + "-".repeat(50) + "\n");

  await exampleOneStepVerification();
}

runExamples()
  .then(() => console.log("\nAll examples completed."))
  .catch((error) => console.error("Error running examples:", error));
