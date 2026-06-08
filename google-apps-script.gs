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
  "ingredient",
  "inci",
  "pct",
  "costPerKg",
  "grams"
];

function doGet() {
  return jsonResponse({
    ok: true,
    message: "UNPUN Formula Studio webhook is ready. Use POST to sync orders."
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const payload = parsePayload(e);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const ordersSheet = getOrCreateSheet(ss, "Orders", ORDER_HEADERS);
    const itemsSheet = getOrCreateSheet(ss, "Items", ITEM_HEADERS);

    const orderRow = normalizeOrderRow(payload);
    if (hasExistingOrder(ordersSheet, orderRow.orderId)) {
      return jsonResponse({ ok: true, duplicate: true, orderId: orderRow.orderId });
    }

    ordersSheet.appendRow(ORDER_HEADERS.map(header => orderRow[header] ?? ""));

    const itemRows = normalizeItemRows(payload, orderRow);
    if (itemRows.length) {
      itemsSheet
        .getRange(itemsSheet.getLastRow() + 1, 1, itemRows.length, ITEM_HEADERS.length)
        .setValues(itemRows.map(row => ITEM_HEADERS.map(header => row[header] ?? "")));
    }

    return jsonResponse({
      ok: true,
      orderId: orderRow.orderId,
      itemCount: itemRows.length
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
    ingredient: item.ingredient || "",
    inci: item.inci || "",
    pct: item.pct || "",
    costPerKg: item.costPerKg || "",
    grams: item.pct && orderRow.netWeight ? Number((item.pct * orderRow.netWeight / 100).toFixed(3)) : ""
  }));
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
