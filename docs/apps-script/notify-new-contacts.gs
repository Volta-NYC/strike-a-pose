/**
 * Paste this entire file into Extensions > Apps Script in the contact sheet.
 * While signed into tahmid@novusnyc.org, run installContactNotifications once.
 * No service account credentials or Vercel environment values belong here.
 */
const CONTACT_NOTIFICATIONS = {
  recipient: "islamtahmidd@gmail.com",
  sender: "tahmid@novusnyc.org",
  sheetName: "Sheet1",
  spreadsheetProperty: "STRIKE_A_POSE_SPREADSHEET_ID",
  checkpointProperty: "STRIKE_A_POSE_LAST_NOTIFIED_ROW",
  headers: [
    "Submitted At",
    "Name",
    "Email",
    "Phone #",
    "Event Date",
    "Event Type",
    "Venue Name/Address",
    "Preferred Experiences",
    "Hours",
    "Anything else we should know",
  ],
};

function installContactNotifications() {
  assertNotificationSender_();
  MailApp.getRemainingDailyQuota(); // Request email authorization during setup.
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("Open this script from the contact spreadsheet's Extensions menu.");
  const sheet = getContactSheet_(spreadsheet);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const properties = PropertiesService.getScriptProperties();
    const storedId = properties.getProperty(CONTACT_NOTIFICATIONS.spreadsheetProperty);
    if (storedId && storedId !== spreadsheet.getId()) {
      throw new Error("This script is already configured for a different spreadsheet.");
    }
    properties.setProperty(CONTACT_NOTIFICATIONS.spreadsheetProperty, spreadsheet.getId());
    // Only the FIRST installation skips historical rows. Rerunning setup keeps progress.
    if (properties.getProperty(CONTACT_NOTIFICATIONS.checkpointProperty) === null) {
      properties.setProperty(CONTACT_NOTIFICATIONS.checkpointProperty, String(sheet.getLastRow()));
    }
    const installed = ScriptApp.getProjectTriggers().some(
      (trigger) => trigger.getHandlerFunction() === "notifyNewContacts",
    );
    if (!installed) {
      ScriptApp.newTrigger("notifyNewContacts").timeBased().everyMinutes(1).create();
    }
  } finally {
    lock.releaseLock();
  }
}

function notifyNewContacts() {
  assertNotificationSender_();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return; // Another run is already processing the queue.
  try {
    const properties = PropertiesService.getScriptProperties();
    const spreadsheetId = properties.getProperty(CONTACT_NOTIFICATIONS.spreadsheetProperty);
    const checkpoint = properties.getProperty(CONTACT_NOTIFICATIONS.checkpointProperty);
    if (!spreadsheetId || checkpoint === null) {
      throw new Error("Run installContactNotifications once before enabling notifications.");
    }
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = getContactSheet_(spreadsheet);
    const lastNotifiedRow = Number(checkpoint);
    const lastRow = sheet.getLastRow();
    if (!Number.isInteger(lastNotifiedRow) || lastNotifiedRow < 1 || lastNotifiedRow > lastRow) {
      throw new Error("Invalid notification checkpoint. Keep Sheet1 as an append-only request log.");
    }
    const count = Math.min(lastRow - lastNotifiedRow, 50, MailApp.getRemainingDailyQuota());
    if (count < 1) return;
    const rows = sheet.getRange(lastNotifiedRow + 1, 1, count, CONTACT_NOTIFICATIONS.headers.length).getDisplayValues();

    for (let index = 0; index < rows.length; index++) {
      const rowNumber = lastNotifiedRow + index + 1;
      const row = rows[index];
      if (row.some((value) => value.trim())) {
        const fields = CONTACT_NOTIFICATIONS.headers.map((label, column) => [label, row[column] || "Not provided"]);
        const email = row[2].trim();
        const requestUrl = `${spreadsheet.getUrl()}#gid=${sheet.getSheetId()}&range=A${rowNumber}:J${rowNumber}`;
        const body = [
          "New Strike A Pose event request",
          "",
          ...fields.map(([label, value]) => `${label}: ${value}`),
          "",
          `Open request: ${requestUrl}`,
        ].join("\n");
        const htmlBody = `
          <h2>New Strike A Pose event request</h2>
          <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;text-align:left">
            ${fields.map(([label, value]) => `<tr><th scope="row" style="vertical-align:top">${escapeContactHtml_(label)}</th><td>${escapeContactHtml_(value).replace(/\r?\n/g, "<br>")}</td></tr>`).join("")}
          </table>
          <p><a href="${escapeContactHtml_(requestUrl)}">Open request in Google Sheets</a></p>
        `;
        const message = {
          to: CONTACT_NOTIFICATIONS.recipient,
          name: "Strike A Pose Website",
          subject: `New Strike A Pose request: ${row[1]} | ${row[5]} | ${row[4]}`.replace(/[\r\n]+/g, " ").slice(0, 200),
          body,
          htmlBody,
        };
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) message.replyTo = email;
        MailApp.sendEmail(message);
      }
      // Save after EACH successful email, so a later failure preserves earlier progress.
      properties.setProperty(CONTACT_NOTIFICATIONS.checkpointProperty, String(rowNumber));
    }
  } finally {
    lock.releaseLock();
  }
}

function assertNotificationSender_() {
  // MailApp sends as the account running the script or owning the timer trigger.
  const email = Session.getEffectiveUser().getEmail().toLowerCase();
  if (email !== CONTACT_NOTIFICATIONS.sender.toLowerCase()) {
    throw new Error(`Sign into ${CONTACT_NOTIFICATIONS.sender} to install and run this script. MailApp cannot choose an arbitrary From address.`);
  }
}

function getContactSheet_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(CONTACT_NOTIFICATIONS.sheetName);
  if (!sheet) throw new Error('The spreadsheet needs a tab named "Sheet1".');
  const headers = sheet.getRange(1, 1, 1, CONTACT_NOTIFICATIONS.headers.length).getDisplayValues()[0];
  CONTACT_NOTIFICATIONS.headers.forEach((expected, index) => {
    if (headers[index].trim() !== expected) {
      throw new Error(`Expected column ${index + 1} to be titled "${expected}" in row 1.`);
    }
  });
  return sheet;
}

function escapeContactHtml_(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}
