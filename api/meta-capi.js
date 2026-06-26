function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : undefined;
}

function getBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  if (typeof req.body === "string") {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch (_) {
      return Promise.resolve({});
    }
  }

  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 64) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (_) {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null && entry !== "")
  );
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  const token = process.env.META_CAPI_TOKEN;
  const datasetId = process.env.META_DATASET_ID || "986266751045210";
  const graphVersion = process.env.META_GRAPH_VERSION || "v20.0";

  if (!token || !datasetId) {
    sendJson(res, 500, { ok: false, error: "Missing Meta CAPI environment variables" });
    return;
  }

  let body;
  try {
    body = await getBody(req);
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message || "Invalid request body" });
    return;
  }

  const eventId = String(body.event_id || "");
  if (!eventId) {
    sendJson(res, 400, { ok: false, error: "Missing event_id" });
    return;
  }

  const userData = compactObject({
    client_ip_address: getClientIp(req),
    client_user_agent: body.client_user_agent || req.headers["user-agent"],
    fbp: body.fbp,
    fbc: body.fbc
  });

  const event = compactObject({
    event_name: "Contact",
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: "website",
    event_source_url: body.event_source_url,
    user_data: userData,
    custom_data: compactObject({
      content_name: body.content_name,
      destination: "whatsapp"
    })
  });

  const payload = {
    data: [event]
  };

  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  const metaUrl = `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(datasetId)}/events`;

  try {
    const metaResponse = await fetch(metaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...payload,
        access_token: token
      })
    });

    const responseBody = await metaResponse.json().catch(() => ({}));
    sendJson(res, metaResponse.ok ? 200 : 502, {
      ok: metaResponse.ok,
      event_id: eventId,
      meta: responseBody
    });
  } catch (error) {
    sendJson(res, 502, {
      ok: false,
      event_id: eventId,
      error: error.message || "Meta CAPI request failed"
    });
  }
};
