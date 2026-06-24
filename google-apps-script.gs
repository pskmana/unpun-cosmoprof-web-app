const SPREADSHEET_ID = "151P8cOl1oi6r399jBJjdLErvDhtHnccaavdlki0JC9k";

const ORDER_HEADERS = [
  "orderId",
  "submittedAt",
  "createdAt",
  "batch",
  "customerCode",
  "firstName",
  "lastName",
  "customerName",
  "phone",
  "lineId",
  "email",
  "product",
  "netWeight",
  "costPerKg",
  "batchCost",
  "followupDue",
  "formula"
];

const ITEM_HEADERS = [
  "orderId",
  "lineNo",
  "batch",
  "customerCode",
  "product",
  "part",
  "code",
  "supplierCode",
  "ingredient",
  "inci",
  "pct",
  "costPerKg",
  "grams"
];

const LINE_LOG_HEADERS = ["timestamp", "orderId", "recipient", "status", "detail"];

function doGet() {
  return jsonResponse({
    ok: true,
    message: "UNPUN Formula Studio webhook is ready. Use POST to sync orders."
  });
}

// Run once from the Apps Script editor to authorize LINE's HTTPS API.
function authorizeLineDelivery() {
  const token = PropertiesService.getScriptProperties().getProperty("LINE_CHANNEL_ACCESS_TOKEN");
  if (!token) throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN");
  return UrlFetchApp.fetch("https://api.line.me/v2/bot/info", {
    headers: { Authorization: `Bearer ${token}` },
    muteHttpExceptions: true
  }).getResponseCode();
}

// Run from the Apps Script editor when diagnosing LINE delivery. This sends
// one text-only test message to the same staff recipients as workshop orders.
function testLineDelivery() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("LINE_CHANNEL_ACCESS_TOKEN");
  const recipients = [
    props.getProperty("LINE_ADMIN_TO_ID"),
    props.getProperty("LINE_STAFF_USER_ID")
  ].filter(Boolean).filter((id, index, list) => list.indexOf(id) === index);
  if (!token || !recipients.length) throw new Error("Missing LINE token or staff recipient");

  const text = `UNPUN Formula Studio delivery test\n${new Date().toISOString()}\nLINE notification is connected.`;
  const deliveries = recipients.map(recipient => pushLine(token, recipient, [{ type: "text", text }], text));
  Logger.log(JSON.stringify(deliveries));
  const failed = deliveries.filter(delivery => !delivery.ok);
  if (failed.length) throw new Error(JSON.stringify(failed));
  return JSON.stringify(deliveries);
}

function doPost(e) {
  let payload;
  try {
    payload = parsePayload(e);
    // ponytail: LINE only needs a fast acknowledgement; keep its path out of sheet locking.
    if (Array.isArray(payload.events)) return handleLineWebhook(payload);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }

  // Internal delivery check: verifies the rendered LINE text without writing
  // an order or notifying staff. It is useful when validating a new deploy.
  if (payload && payload.dryRun === true) {
    const orderRow = normalizeOrderRow(payload);
    const itemRows = normalizeItemRows(payload, orderRow);
    return jsonResponse({ ok: true, text: buildLineOrderText(orderRow, itemRows) });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const ordersSheet = getOrCreateSheet(ss, "Orders", ORDER_HEADERS);
    const itemsSheet = getOrCreateSheet(ss, "Items", ITEM_HEADERS);

    const orderRow = normalizeOrderRow(payload);
    const duplicate = hasExistingOrder(ordersSheet, orderRow.orderId);
    const itemRows = normalizeItemRows(payload, orderRow);
    if (!duplicate) {
      ordersSheet.appendRow(ORDER_HEADERS.map(header => orderRow[header] ?? ""));
      if (itemRows.length) {
        itemsSheet
          .getRange(itemsSheet.getLastRow() + 1, 1, itemRows.length, ITEM_HEADERS.length)
          .setValues(itemRows.map(row => ITEM_HEADERS.map(header => row[header] ?? "")));
      }
    }

    const lineNotified = notifyLineOa(ss, payload, orderRow, itemRows);

    return jsonResponse({
      ok: true,
      duplicate,
      orderId: orderRow.orderId,
      itemCount: itemRows.length,
      lineNotified
    });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: String(err && err.stack ? err.stack : err)
    });
  } finally {
    lock.releaseLock();
  }
}

function parsePayload(e) {
  const raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
  return JSON.parse(raw);
}

function getOrCreateSheet(ss, name, headers) {
  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function hasExistingOrder(sheet, orderId) {
  if (!orderId || sheet.getLastRow() < 2) return false;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(row => String(row[0]) === String(orderId));
}

function normalizeOrderRow(payload) {
  const row = payload.orderRow || {};
  const order = payload.order || {};
  const fallbackOrderId = order.orderId || row.orderId || `ORDER-${Date.now()}`;

  return {
    orderId: fallbackOrderId,
    submittedAt: row.submittedAt || payload.submittedAt || new Date().toISOString(),
    createdAt: row.createdAt || order.createdAt || "",
    batch: row.batch || order.batch || "",
    customerCode: row.customerCode || order.customerCode || "",
    firstName: row.firstName || "",
    lastName: row.lastName || "",
    customerName: row.customerName || order.customerName || "",
    phone: row.phone || order.phone || "",
    lineId: row.lineId || order.lineId || "",
    email: row.email || order.email || "",
    product: row.product || order.product || "",
    netWeight: row.netWeight || order.netWeight || "",
    costPerKg: row.costPerKg || order.costPerKg || "",
    batchCost: row.batchCost || order.batchCost || "",
    followupDue: row.followupDue || order.followupDue || "",
    formula: row.formula || ""
  };
}

function normalizeItemRows(payload, orderRow) {
  if (Array.isArray(payload.itemRows) && payload.itemRows.length) {
    return payload.itemRows.map((row, index) => ({
      orderId: row.orderId || orderRow.orderId,
      lineNo: row.lineNo || index + 1,
      batch: row.batch || orderRow.batch,
      customerCode: row.customerCode || orderRow.customerCode,
      product: row.product || orderRow.product,
      part: row.part || "",
      code: row.code || "",
      supplierCode: row.supplierCode || "",
      ingredient: row.ingredient || "",
      inci: row.inci || "",
      pct: row.pct || "",
      costPerKg: row.costPerKg || "",
      grams: row.grams || ""
    }));
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  return items.map((item, index) => ({
    orderId: orderRow.orderId,
    lineNo: index + 1,
    batch: orderRow.batch,
    customerCode: orderRow.customerCode,
    product: orderRow.product,
    part: item.part || "",
    code: item.code || "",
    supplierCode: item.supplierCode || "",
    ingredient: item.ingredient || "",
    inci: item.inci || "",
    pct: item.pct || "",
    costPerKg: item.costPerKg || "",
    grams: item.pct && orderRow.netWeight ? Number((item.pct * orderRow.netWeight / 100).toFixed(3)) : ""
  }));
}

function notifyLineOa(ss, payload, order, items) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("LINE_CHANNEL_ACCESS_TOKEN");
  const recipients = [
    props.getProperty("LINE_ADMIN_TO_ID"),
    props.getProperty("LINE_STAFF_USER_ID")
  ].filter(Boolean).filter((id, index, list) => list.indexOf(id) === index);
  if (!token || !recipients.length) {
    logLineDelivery(ss, order.orderId, [{ recipient: "", status: "skipped", detail: "Missing LINE token or admin recipient" }]);
    return false;
  }

  let labelUrl = "";
  try {
    labelUrl = saveLabelImage(payload.labelPng, order.orderId);
  } catch (err) {
    // ponytail: a label upload must not block the RD notification.
    console.warn(`Label upload failed for ${order.orderId}: ${err}`);
  }
  const text = buildLineOrderText(order, items);
  const messages = [{ type: "text", text }];
  if (labelUrl) {
    messages.unshift({
      type: "image",
      originalContentUrl: labelUrl,
      previewImageUrl: labelUrl
    });
  }

  const deliveries = recipients.map(recipient => pushLine(token, recipient, messages, text));
  logLineDelivery(ss, order.orderId, deliveries);
  return deliveries.some(delivery => delivery.ok);
}

function buildLineOrderText(order, items) {
  const formula = items.map(item => {
    const grams = Number(item.grams || (Number(item.pct || 0) * Number(order.netWeight || 0) / 100));
    return `${item.part}. ${item.ingredient} ${item.pct}% (${grams.toFixed(2)} g)`;
  }).join("\n");
  return [
    "NEW WORKSHOP ORDER",
    `Order: ${order.orderId}`,
    `Batch: ${order.batch}`,
    `Customer: ${order.customerName}`,
    `Product: ${order.product}`,
    `Net: ${order.netWeight} g | Cost/kg: ${order.costPerKg} THB`,
    "",
    "FORMULA",
    formula
  ].join("\n").slice(0, 4900);
}

function pushLine(token, recipient, messages, fallbackText) {
  try {
    let response = UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: `Bearer ${token}` },
      payload: JSON.stringify({ to: recipient, messages }),
      muteHttpExceptions: true
    });
    if (response.getResponseCode() >= 300 && messages.length > 1) {
      response = UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", {
        method: "post",
        contentType: "application/json",
        headers: { Authorization: `Bearer ${token}` },
        payload: JSON.stringify({ to: recipient, messages: [{ type: "text", text: fallbackText }] }),
        muteHttpExceptions: true
      });
    }
    if (response.getResponseCode() >= 300) {
      const detail = response.getContentText().slice(0, 500);
      console.warn(`LINE push failed for ${recipient}: ${response.getResponseCode()} ${detail}`);
      return { recipient, ok: false, status: response.getResponseCode(), detail };
    }
    return { recipient, ok: true, status: response.getResponseCode(), detail: "sent" };
  } catch (err) {
    return { recipient, ok: false, status: "exception", detail: String(err).slice(0, 500) };
  }
}

function logLineDelivery(ss, orderId, deliveries) {
  const sheet = getOrCreateSheet(ss, "LineLog", LINE_LOG_HEADERS);
  sheet.getRange(sheet.getLastRow() + 1, 1, deliveries.length, LINE_LOG_HEADERS.length).setValues(
    deliveries.map(delivery => [new Date().toISOString(), orderId, delivery.recipient, delivery.status, delivery.detail])
  );
}

function handleLineWebhook(payload) {
  const props = PropertiesService.getScriptProperties();
  const sources = payload.events
    .map(event => event && event.source)
    .filter(Boolean);
  const adminTarget = sources
    .map(source => source.groupId || source.roomId || source.userId || "")
    .find(Boolean);
  if (adminTarget) props.setProperty("LINE_ADMIN_TO_ID", adminTarget);

  return jsonResponse({
    ok: true,
    lineWebhook: true,
    adminTargetSaved: Boolean(adminTarget)
  });
}

function saveLabelImage(dataUrl, orderId) {
  const match = String(dataUrl || "").match(/^data:image\/png;base64,(.+)$/);
  if (!match) return "";
  const props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty("LINE_LABEL_FOLDER_ID");
  const folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
  const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(match[1]), "image/png", `${orderId}.png`));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return `https://drive.google.com/uc?export=view&id=${file.getId()}`;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
