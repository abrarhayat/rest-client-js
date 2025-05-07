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

if (!url) {
  console.log("No URL was provided.");
  core.setFailed("No URL was provided.");
  return;
}

if (!method) {
  console.log("No method was provided.");
  core.setFailed("No method was provided.");
  return;
}

if (!headers) {
  console.log("No headers were provided.");
  headers = {};
  return;
}

if (!body) {
  console.log("No body was provided.");
  return;
}

if (!attachmentDir) {
  console.log("No attachment directory was provided.");
} else {
  // Check if the attachment directory exists
  if (!fs.existsSync(attachmentDir)) {
    console.log("Attachment directory does not exist.");
    core.setFailed("Attachment directory does not exist.");
    return;
  }

  //Check if it is a directory or a single file
  const stat = fs.statSync(attachmentDir);
  if (!stat.isDirectory()) {
    //check if it is a file
    if (fs.existsSync(attachmentDir)) {
      // If it is a file, check if it exists
      const filePath = path.join(attachmentDir);
      if (fs.existsSync(filePath)) {
        // If it is a file, read the file and add it to the body
        const fileStream = fs.createReadStream(filePath);
        const formData = new FormData();
        formData.append("attachments", fileStream);
        body = formData;
        headers = {
          ...headers,
          ...formData.getHeaders(),
        };
      } else {
        console.log("Attachment path does not exist.");
        core.setFailed("Attachment path does not exist.");
        return;
      }
    } else {
      console.log("Attachment path does not exist.");
    }
  } else {
    // Read all files in the attachment directory
    const files = fs.readdirSync(attachmentDir);
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach((file) => {
        const filePath = path.join(attachmentDir, file);
        formData.append("attachments", fs.createReadStream(filePath));
      });
      // Merge formData with the body
      body = formData;
      // Set the headers to include the formData headers
      // This is important for multipart/form-data requests
      headers = {
        ...headers,
        ...formData.getHeaders(),
      };
    } else {
      console.log("No files found in the attachment directory.");
    }
  }
}
console.log("Sending request to URL:", url,
  "with method:", method,
  "and headers:", headers,
  "with body:", body);
switch (method.toLowerCase()) {
  case "get":
    // GET request
    axios
      .get(url, { headers })
      .then((response) => {
        console.log("GET response:", response.data);
        core.setOutput("response", response.data);
      })
      .catch((error) => {
        console.error("GET error:", error);
        core.setFailed("GET request failed.", error);
      });
    break;
  case "post":
    // POST request
    axios
      .post(url, body, { headers })
      .then((response) => {
        console.log("POST response:", response.data);
        core.setOutput("response", response.data);
      })
      .catch((error) => {
        console.error("POST error:", error);
        core.setFailed("POST request failed.", error);
      });
    break;
  case "put":
    // PUT request
    axios
      .put(url, body, { headers })
      .then((response) => {
        console.log("PUT response:", response.data);
        core.setOutput("response", response.data);
      })
      .catch((error) => {
        console.error("PUT error:", error);
        core.setFailed("PUT request failed.", error);
      });
    break;
  case "delete":
    console.log("DELETE request");
    // DELETE request
    axios
      .delete(url, { headers, data: body })
      .then((response) => {
        console.log("DELETE response:", response.data);
        core.setOutput("response", response.data);
      })
      .catch((error) => {
        console.error("DELETE error:", error);
        core.setFailed("DELETE request failed.", error);
      });
    break;
  default:
    console.log(
      "Invalid method provided. Please use GET, POST, DELETE, or PUT."
    );
    core.setFailed(
      "Invalid method provided. Please use GET, POST, DELETE, or PUT."
    );
    return;
}
