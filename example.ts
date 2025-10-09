/**
 * Example usage of the RDCW Slip Verify SDK
 * This file demonstrates the new API design
 */

import { createRdcwVerify } from "./src/index";

// Example configuration
const rdcw = createRdcwVerify({
  clientId: "your-client-id",
  secret: "your-client-secret",
});

async function example1_BasicInquiry() {
  console.log("=== Example 1: Basic Inquiry ===");

  const result = await rdcw.inquiryPayload("sample-payload");

  if (result.error) {
    console.log("Error:", result.error.message);
  } else {
    console.log("Success:", result.data);
  }
}

async function example2_InquiryWithValidation() {
  console.log("\n=== Example 2: Inquiry with Validation ===");

  const result = await rdcw.inquiryPayload("sample-payload", {
    expectedAccount: "1234567890",
    expectedBank: "014",
    expectedAmount: "100.00",
  });

  if (result.error) {
    console.log("Validation failed:", result.error.message);
    console.log("Error type:", result.error.type);
  } else {
    console.log("Validation successful!");
  }
}

async function example3_WithCallbacks() {
  console.log("\n=== Example 3: With Callbacks ===");

  const result = await rdcw.inquiryPayload("sample-payload", {
    expectedAccount: "1234567890",
    expectedBank: "014",
    onSuccess: (data) => {
      console.log("✅ Success callback triggered!");
      console.log("Amount:", data.data.amount);
    },
    onError: (error) => {
      console.log("❌ Error callback triggered:", error.message);
    },
    onValidationError: (error) => {
      console.log("⚠️ Validation error callback triggered:", error.message);
    },
  });

  console.log("Result also returned:", result.data ? "success" : "failed");
}

async function example4_ManualValidation() {
  console.log("\n=== Example 4: Manual Validation ===");

  // First, verify the slip
  const verifyResult = await rdcw.inquiryPayload("sample-payload");

  if (verifyResult.data) {
    // Then, validate manually
    const validateResult = rdcw.validate(verifyResult.data, {
      expectedAccount: "1234567890",
      expectedBank: "014",
      onSuccess: (data) => console.log("Validation passed!"),
      onValidationError: (error) =>
        console.log("Validation failed:", error.message),
    });

    if (validateResult.data) {
      console.log("All checks passed!");
    }
  }
}

async function example5_ImageInquiry() {
  console.log("\n=== Example 5: Image Inquiry ===");

  // Example with base64 string
  const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";

  const result = await rdcw.inquiryImage(base64Image, {
    expectedAccount: "1234567890",
    expectedBank: "014",
    onSuccess: (data) => console.log("Image verification successful!"),
    onError: (error) =>
      console.log("Image verification failed:", error.message),
  });

  console.log("Result:", result.data ? "success" : "failed");
}

// Run examples (uncomment to test)
// example1_BasicInquiry();
// example2_InquiryWithValidation();
// example3_WithCallbacks();
// example4_ManualValidation();
// example5_ImageInquiry();
