const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(path.join(__dirname, "../docs/apps-script/notify-new-contacts.gs"), "utf8");
const headers = ["Submitted At", "Name", "Email", "Phone #", "Event Date", "Event Type", "Venue Name/Address", "Preferred Experiences", "Hours", "Anything else we should know"];
const checkpointKey = "STRIKE_A_POSE_LAST_NOTIFIED_ROW";

function fixture(options = {}) {
  const state = {
    rows: [headers.slice(), ...(options.rows || [])],
    properties: {}, emails: [], triggers: [], releases: 0, quota: options.quota ?? 100,
  };
  const sheet = {
    getLastRow: () => state.rows.length,
    getSheetId: () => 123,
    getRange: (row, column, count, width) => ({
      getDisplayValues: () => state.rows.slice(row - 1, row - 1 + count).map((values) => values.slice(column - 1, column - 1 + width)),
    }),
  };
  const spreadsheet = {
    getSheetByName: (name) => name === "Sheet1" ? sheet : null,
    getId: () => "test-spreadsheet",
    getUrl: () => "https://docs.google.com/spreadsheets/d/test-spreadsheet/edit",
  };
  const context = vm.createContext({
    Session: { getEffectiveUser: () => ({ getEmail: () => options.sender || "tahmid@novusnyc.org" }) },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => spreadsheet,
      openById: (id) => { assert.equal(id, "test-spreadsheet"); return spreadsheet; },
    },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: (key) => state.properties[key] ?? null,
      setProperty: (key, value) => { state.properties[key] = value; },
    }) },
    LockService: { getScriptLock: () => ({
      waitLock: () => {}, tryLock: () => options.lockAvailable !== false,
      releaseLock: () => { state.releases++; },
    }) },
    MailApp: {
      getRemainingDailyQuota: () => state.quota,
      sendEmail: (message) => {
        if (options.failAt && state.emails.length + 1 === options.failAt) throw new Error("Mail unavailable");
        state.emails.push(message);
      },
    },
    ScriptApp: {
      getProjectTriggers: () => state.triggers,
      newTrigger: (handler) => ({ timeBased: () => ({ everyMinutes: (minutes) => ({ create: () => {
        assert.equal(minutes, 1);
        state.triggers.push({ getHandlerFunction: () => handler });
      } }) }) }),
    },
  });
  vm.runInContext(source, context);
  return { state, context };
}

function row(overrides = {}) {
  return Object.assign([
    "2026-10-16T17:00:00.000Z", "Alex Rivera", "alex@example.com", "+1 (917) 555-0123",
    "2099-12-31", "Other Celebrations: Family reunion", "Example Hall, 123 Main St, Queens, NY",
    "Mirror Photo Booth, Audio Guest Book", "4 Hours", "Gold theme\nPreferred backdrop: Crisp White",
  ], overrides);
}

test("setup skips historical rows, preserves progress, and installs one timer", () => {
  const { state, context } = fixture({ rows: [row()] });
  context.installContactNotifications();
  assert.equal(state.properties[checkpointKey], "2");
  assert.equal(state.emails.length, 0);
  state.rows.push(row());
  context.installContactNotifications();
  assert.equal(state.properties[checkpointKey], "2");
  assert.equal(state.triggers.length, 1);
});

test("emails every field, includes a row link, sets Reply-To, and does not resend on the next run", () => {
  const { state, context } = fixture();
  context.installContactNotifications();
  const submission = row();
  state.rows.push(submission);
  context.notifyNewContacts();
  assert.equal(state.emails.length, 1);
  const email = state.emails[0];
  assert.equal(email.to, "islamtahmidd@gmail.com");
  assert.equal(email.replyTo, "alex@example.com");
  for (let column = 0; column < headers.length; column++) {
    assert.ok(email.body.includes(`${headers[column]}: ${submission[column]}`));
    assert.ok(email.htmlBody.includes(headers[column]));
  }
  assert.ok(email.body.includes("#gid=123&range=A2:J2"));
  assert.equal(state.properties[checkpointKey], "2");
  context.notifyNewContacts();
  assert.equal(state.emails.length, 1);
});

test("escapes HTML, preserves multiline notes, and removes newlines from subject fields", () => {
  const { state, context } = fixture();
  context.installContactNotifications();
  state.rows.push(row({ 1: '<img src=x onerror="bad">\nTest', 9: "<script>bad()</script>\nNew line & details" }));
  context.notifyNewContacts();
  assert.ok(!state.emails[0].htmlBody.includes("<script>"));
  assert.ok(!state.emails[0].htmlBody.includes("<img"));
  assert.ok(state.emails[0].htmlBody.includes("&lt;script&gt;bad()&lt;/script&gt;<br>New line &amp; details"));
  assert.ok(!state.emails[0].subject.includes("\n"));
});

test("a partial email failure retains successful progress and leaves later rows pending", () => {
  const { state, context } = fixture({ failAt: 2 });
  context.installContactNotifications();
  state.rows.push(row(), row(), row());
  assert.throws(() => context.notifyNewContacts(), /Mail unavailable/);
  assert.equal(state.emails.length, 1);
  assert.equal(state.properties[checkpointKey], "2");
  assert.equal(state.releases, 2);
});

test("rejects setup and notification under the wrong sending account", () => {
  const { state, context } = fixture({ sender: "someone@gmail.com" });
  assert.throws(() => context.installContactNotifications(), /Sign into tahmid@novusnyc.org/);
  assert.throws(() => context.notifyNewContacts(), /Sign into tahmid@novusnyc.org/);
  assert.equal(state.triggers.length, 0);
  assert.equal(state.emails.length, 0);
});

test("rejects mismatched headers before installation or sending", () => {
  const { state, context } = fixture();
  state.rows[0][3] = "Wrong phone column";
  assert.throws(() => context.installContactNotifications(), /Expected column 4/);
  assert.equal(state.triggers.length, 0);
});

test("remaining daily quota limits work without dropping queued rows", () => {
  const { state, context } = fixture({ quota: 1 });
  context.installContactNotifications();
  state.rows.push(row(), row());
  context.notifyNewContacts();
  assert.equal(state.emails.length, 1);
  assert.equal(state.properties[checkpointKey], "2");
  state.quota = 0;
  context.notifyNewContacts();
  assert.equal(state.properties[checkpointKey], "2");
});

test("processes at most 50 queued requests per execution", () => {
  const { state, context } = fixture();
  context.installContactNotifications();
  for (let index = 0; index < 51; index++) state.rows.push(row());
  context.notifyNewContacts();
  assert.equal(state.emails.length, 50);
  assert.equal(state.properties[checkpointKey], "51");
  context.notifyNewContacts();
  assert.equal(state.emails.length, 51);
});

test("skips blank rows and omits an invalid Reply-To address", () => {
  const { state, context } = fixture();
  context.installContactNotifications();
  state.rows.push(Array(10).fill(""), row({ 2: "not an email" }));
  context.notifyNewContacts();
  assert.equal(state.emails.length, 1);
  assert.equal(state.emails[0].replyTo, undefined);
  assert.equal(state.properties[checkpointKey], "3");
});

test("does not send while another execution holds the lock", () => {
  const { state, context } = fixture({ lockAvailable: false });
  context.installContactNotifications();
  state.rows.push(row());
  context.notifyNewContacts();
  assert.equal(state.emails.length, 0);
  assert.equal(state.properties[checkpointKey], "1");
});

test("requires installation and rejects a checkpoint invalidated by deleted rows", () => {
  const { state, context } = fixture();
  assert.throws(() => context.notifyNewContacts(), /Run installContactNotifications/);
  context.installContactNotifications();
  state.properties[checkpointKey] = "9";
  assert.throws(() => context.notifyNewContacts(), /append-only/);
  assert.equal(state.emails.length, 0);
});
