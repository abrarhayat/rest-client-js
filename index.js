/**
 * @author: Abrar Hayat <abrarhayat@gmail.com>
 * @since: Tue, 06 May 2025
 */

const fs = require("fs");
const path = require("path");
const FormData = require('form-data');
const core = require("@actions/core");
const axios = require("axios");

const url = core.getInput("url") || process.env.URL;
const method = core.getInput("method") || process.env.METHOD;
let headers = JSON.parse(
  core.getInput("headers") || process.env.HEADERS || "{}"
);
let body = JSON.parse(core.getInput("body") || process.env.BODY || "{}");
const attachmentDir =
  core.getInput("attachment-dir") || process.env.ATTACHMENT_DIR;

function validateInputs(url, method) {
  if (!url) {
    core.setFailed("No URL was provided.");
    throw new Error("No URL was provided.");
  }
  const validMethods = ["get", "post", "put", "delete"];
  if (!validMethods.includes(method.toLowerCase())) {
    core.setFailed("Invalid method provided. Please use GET, POST, PUT, or DELETE.");
    throw new Error("Invalid method provided.");
  }
}

function handleAttachments(attachmentDir, headers) {
  if (!fs.existsSync(attachmentDir)) {
    core.setFailed("Attachment directory does not exist.");
    throw new Error("Attachment directory does not exist.");
  }
  const stat = fs.statSync(attachmentDir);
  const formData = new FormData();
  if (stat.isDirectory()) {
    const files = fs.readdirSync(attachmentDir);
    if (files.length === 0) {
      console.log("No files found in the attachment directory.");
      return { formData: null, headers };
    }
    files.forEach((file) => {
      const filePath = path.join(attachmentDir, file);
      formData.append("attachments", fs.createReadStream(filePath));
    });
  } else {
    formData.append("attachments", fs.createReadStream(attachmentDir));
  }
  const updatedHeaders = { ...headers, ...formData.getHeaders() };
  return { formData, updatedHeaders };
}

async function sendRequest(method, url, body, headers) {
  try {
    const response = await axios({ method, url, data: body, headers });
    console.log(`${method.toUpperCase()} response:`, response.data);
    core.setOutput("response", response.data);
  } catch (error) {
    console.error(`${method.toUpperCase()} error:`, error);
    core.setFailed(`${method.toUpperCase()} request failed.`);
  }
}

// Main Execution
try {
  validateInputs(url, method);
  if (attachmentDir) {
    const { formData, updatedHeaders } = handleAttachments(attachmentDir, headers);
    if (formData) {
      body = formData;
      headers = updatedHeaders;
    }
  }
  sendRequest(method.toLowerCase(), url, body, headers);
} catch (error) {
  console.error(error.message);
}