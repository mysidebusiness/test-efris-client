
import axios from "axios";
import "dotenv/config";
import { randomUUID } from "node:crypto";

const API_URL = process.env.EFRIS_API_URL;
const DEVICE_NO = process.env.EFRIS_DEVICE_NO;
const TIN = process.env.EFRIS_TIN;

if (!API_URL || !DEVICE_NO || !TIN) {
  throw new Error("Missing EFRIS environment variables");
}

function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + " " + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join(":");
}

async function main() {
  const payload = {
    data: {
      content: "",
      signature: "",
      dataDescription: {
        codeType: "0",
        encryptCode: "1",
        zipCode: "0",
      },
    },
    globalInfo: {
      appId: "AP04",
      version: process.env.EFRIS_API_VERSION ?? "1.1.20191201",
      dataExchangeId: "51e04d876acb4c19a649b150a4d3f821",
      interfaceCode: "T101",
      requestCode: "TP",
      requestTime: formatDate(new Date()),
      responseCode: "TA",
      userName: "admin",
      deviceMAC: "FFFFFFFFFFFF",
      deviceNo: DEVICE_NO,
      tin: TIN,
      brn: "",
      taxpayerID: TIN,
      longitude: "32.5825",
      latitude: "0.3476",
      extendField: {},
    },
    returnStateInfo: {
      returnCode: "",
      returnMessage: "",
    },
  };

  try {
    console.log("Sending T101 request...");

    const response = await axios.post(API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    console.log(
      "HTTP Status:",
      response.status
    );

    console.log(
      "Response:",
      JSON.stringify(response.data, null, 2)
    );

    const state = response.data?.returnStateInfo;

    if (state?.returnCode) {
      console.log("EFRIS Code:", state.returnCode);
      console.log("EFRIS Message:", state.returnMessage);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("HTTP Status:", error.response?.status);
      console.error("API Error:", error.response?.data ?? error.message);
    } else {
      console.error("Unexpected error:", error);
    }

    process.exitCode = 1;
  }
}

main();
