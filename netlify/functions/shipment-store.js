const crypto = require("crypto");
const { getStore } = require("@netlify/blobs");

const STORE_NAME = "cops-pendency-dashboard";
const STORE_KEY = "latest-shipment-db";
const DEFAULT_ADMIN_PASSWORD_HASH = "231fb98687ed0272c3ed11c61ec1515b7b50789e25e62a1fa86e40bda7a2fd0d";

function getBlobStore() {
  const siteID = process.env.COPS_NETLIFY_SITE_ID || process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.COPS_NETLIFY_TOKEN || process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
  if (siteID && token) return getStore(STORE_NAME, { siteID, token });
  return getStore(STORE_NAME);
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0"
    },
    body: JSON.stringify(body)
  };
}

function hash(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function isAuthorized(event) {
  const expected = process.env.COPS_ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_PASSWORD_HASH;
  const supplied = event.headers["x-admin-password"] || event.headers["X-Admin-Password"] || "";
  return hash(supplied) === expected;
}

exports.handler = async function handler(event) {
  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 204, headers: { "Cache-Control": "no-store, max-age=0" }, body: "" };
    }

    const store = getBlobStore();

    if (event.httpMethod === "GET") {
      const record = await store.get(STORE_KEY, { type: "json" });
      if (!record) return json(200, { hasData: false });
      return json(200, Object.assign({ hasData: true }, record));
    }

    if (event.httpMethod === "POST") {
      if (!isAuthorized(event)) return json(401, { error: "Unauthorized admin upload." });

      let body;
      try {
        body = JSON.parse(event.body || "{}");
      } catch {
        return json(400, { error: "Invalid JSON payload." });
      }

      if (!body.payload || !body.payload.encoding || !body.payload.data) {
        return json(400, { error: "Missing shipment payload." });
      }

      const record = {
        fileName: String(body.fileName || "Shipment DB"),
        mode: body.mode === "append" ? "append" : "replace",
        savedAt: body.savedAt || new Date().toISOString(),
        rowCount: Number(body.rowCount || 0),
        payload: body.payload
      };

      await store.setJSON(STORE_KEY, record);
      return json(200, { ok: true, savedAt: record.savedAt, rowCount: record.rowCount });
    }

    return json(405, { error: "Method not allowed." });
  } catch (err) {
    console.error("shipment-store failed", err);
    return json(500, {
      error: "Shipment store function failed. Confirm @netlify/blobs installed and Netlify Functions are enabled.",
      detail: err && err.message ? err.message : String(err),
      requiredEnvironmentVariables: ["COPS_NETLIFY_SITE_ID", "COPS_NETLIFY_TOKEN"]
    });
  }
};
