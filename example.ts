/**
 * Example usage — node-rdcw-slipverify v3
 */

import fs from "node:fs";

import { createSlipVerify, validateSlipResult, mergeLocaleMessages } from "./src/index";

const client = createSlipVerify({
  clientId: "your-client-id",
  secret: "your-client-secret",
});

async function examplePayloadOnly() {
  const result = await client.verifyFromPayload(
    "0038000600000101030060217Bf870bf26685f55526203TH9104CF62"
  );

  if (result.error) {
    console.log("Error:", result.error.message, result.error.code);
  } else {
    console.log("Success:", result.data);
  }
}

async function examplePayloadWithValidation() {
  const result = await client.verifyFromPayload("sample-payload", {
    expectedAccount: "1234567890",
    expectedBank: "014",
    expectedAmount: "100.00",
  });

  if (result.error) {
    console.log("Failed:", result.error.type, result.error.message);
  } else {
    console.log("OK:", result.data.data.amount);
  }
}

async function exampleMultipartFromDisk() {
  const data = fs.readFileSync("path/to/slip.jpg");

  const result = await client.verifyFromSlipFile(
    {
      data,
      fileName: "slip.jpg",
      contentType: "image/jpeg",
    },
    {
      expectedAccount: "1234567890",
      expectedBank: "014",
    }
  );

  console.log(result.error ? result.error : result.data);
}

async function exampleManualValidate() {
  const verifyResult = await client.verifyFromPayload("sample-payload");

  if (verifyResult.data) {
    const validated = validateSlipResult(
      verifyResult.data,
      { expectedBank: "014" },
      mergeLocaleMessages("en")
    );
    console.log(validated);
  }
}

// examplePayloadOnly();
// examplePayloadWithValidation();
// exampleMultipartFromDisk();
// exampleManualValidate();
