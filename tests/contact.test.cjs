const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { createRequire } = require("node:module");
const path = require("node:path");
const { afterEach, beforeEach, mock, test } = require("node:test");
const ts = require("typescript");

// Exercise the real TypeScript handler and validator without adding a test runtime.
// Only the Google transport is mocked; no test can write to a live spreadsheet.
function loadTypeScript(relativePath, dependencies = {}) {
  const filename = path.resolve(__dirname, "..", relativePath);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  const localRequire = createRequire(filename);
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (specifier) => Object.hasOwn(dependencies, specifier) ? dependencies[specifier] : localRequire(specifier),
    module,
    module.exports,
  );
  return module.exports;
}

const siteData = loadTypeScript("src/lib/site-data.ts");
const contact = loadTypeScript("src/lib/contact.ts", { "./site-data": siteData });
const envNames = ["GOOGLE_SHEETS_SPREADSHEET_ID", "GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"];
const previousEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));

beforeEach(() => {
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID = "test-spreadsheet";
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "test@example.iam.gserviceaccount.com";
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = "test-key-line-1\\ntest-key-line-2";
});

afterEach(() => {
  for (const [name, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  mock.restoreAll();
});

function fixture(append = async () => ({})) {
  const calls = [];
  const credentials = [];
  const route = loadTypeScript("src/app/api/contact/route.ts", {
    "@/lib/contact": contact,
    "googleapis/build/src/apis/sheets": {
      auth: { GoogleAuth: class { constructor(options) { credentials.push(options); } } },
      sheets: (options) => {
        assert.equal(options.version, "v4");
        return { spreadsheets: { values: { append: async (...args) => {
          calls.push(args);
          return append(...args);
        } } } };
      },
    },
  });
  return { ...route, calls, credentials };
}

function inquiry(overrides = {}) {
  return {
    name: "  Alex Rivera  ",
    email: "  ALEX@example.com  ",
    phone: "+1 (917) 555-0123",
    date: "2099-12-31",
    eventType: "Wedding",
    celebrationDetail: "",
    venue: "Example Hall, 123 Main Street, Queens, NY",
    experiences: [siteData.packages[0].name, "VIP Red Carpet Experience"],
    backdrop: "Crisp White",
    hours: "4 Hours",
    notes: "Please arrive before the guests.\nOur theme is gold.",
    website: "",
    ...overrides,
  };
}

function request(input, headers = {}) {
  return new Request("https://strikeapose.example/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8", Origin: "https://strikeapose.example", ...headers },
    body: JSON.stringify(input),
  });
}

test("appends all visible fields in the supplied ten-column order using RAW input", async () => {
  const route = fixture();
  const before = Date.now();
  const response = await route.POST(request(inquiry()));
  assert.equal(response.status, 200);
  assert.match((await response.json()).message, /received/);
  assert.equal(route.calls.length, 1);
  const [append, options] = route.calls[0];
  assert.equal(append.spreadsheetId, "test-spreadsheet");
  assert.equal(append.range, "'Sheet1'!A:J");
  assert.equal(append.valueInputOption, "RAW");
  assert.equal(append.insertDataOption, "INSERT_ROWS");
  assert.equal(append.requestBody.majorDimension, "ROWS");
  assert.deepEqual(options, { timeout: 15000, retry: false });
  const [[timestamp, ...fields]] = append.requestBody.values;
  assert.equal(new Date(timestamp).toISOString(), timestamp);
  assert.ok(Date.parse(timestamp) >= before && Date.parse(timestamp) <= Date.now());
  assert.deepEqual(fields, [
    "Alex Rivera", "alex@example.com", "+1 (917) 555-0123", "2099-12-31", "Wedding",
    "Example Hall, 123 Main Street, Queens, NY",
    `${siteData.packages[0].name}, VIP Red Carpet Experience`, "4 Hours",
    "Please arrive before the guests.\nOur theme is gold.\n\nPreferred backdrop: Crisp White",
  ]);
  assert.deepEqual(route.credentials[0], {
    credentials: { client_email: "test@example.iam.gserviceaccount.com", private_key: "test-key-line-1\ntest-key-line-2" },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
});

test("preserves custom celebrations, optional fields, and formula-like text as plain values", async () => {
  const route = fixture();
  const response = await route.POST(request(inquiry({
    eventType: "Other Celebrations", celebrationDetail: "Family reunion", experiences: [],
    backdrop: "", notes: '=HYPERLINK("https://example.com")',
  })));
  assert.equal(response.status, 200);
  const append = route.calls[0][0];
  const [row] = append.requestBody.values;
  assert.equal(row.length, 10);
  assert.equal(row[5], "Other Celebrations: Family reunion");
  assert.equal(row[7], "Help me choose");
  assert.equal(row[9], '=HYPERLINK("https://example.com")');
  assert.equal(append.valueInputOption, "RAW");
});

test("allows omitted optional fields and never saves extra payload properties", async () => {
  const route = fixture();
  const payload = inquiry({ GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: "attacker-value", spreadsheetId: "wrong-sheet" });
  for (const field of ["experiences", "backdrop", "notes", "celebrationDetail"]) delete payload[field];
  assert.equal((await route.POST(request(payload))).status, 200);
  assert.equal(route.calls[0][0].spreadsheetId, "test-spreadsheet");
  assert.equal(route.calls[0][0].requestBody.values[0][9], "");
  assert.ok(!JSON.stringify(route.calls).includes("attacker-value"));
});

for (const [field, value, extra = {}] of [
  ["name", "   "], ["name", 42], ["name", "a".repeat(101)],
  ["email", "not-an-email"], ["email", "a".repeat(201)],
  ["phone", "123"], ["phone", "not a phone number"], ["phone", "1".repeat(41)],
  ["date", "2099-02-30"], ["date", "2000-01-01"], ["date", "2099-13-01"],
  ["eventType", "Unknown event"], ["celebrationDetail", " ", { eventType: "Other Celebrations" }],
  ["venue", ""], ["venue", "x".repeat(201)], ["hours", "20 Hours"],
  ["backdrop", "Unknown backdrop"], ["experiences", "Mirror Photo Booth"],
  ["experiences", [null]], ["experiences", ["Unknown experience"]],
  ["experiences", Array(7).fill(siteData.packages[0].name)],
  ["notes", "x".repeat(2001)], ["notes", {}], ["notes", "invalid\0text"],
]) {
  test(`returns a useful ${field} validation error for ${JSON.stringify(value).slice(0, 55)}`, async () => {
    const route = fixture();
    const response = await route.POST(request(inquiry({ ...extra, [field]: value })));
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).errors[field], "string");
    assert.equal(route.calls.length, 0);
    assert.equal(route.credentials.length, 0);
  });
}

test("rejects malformed JSON and non-object bodies without reaching Google", async () => {
  const route = fixture();
  for (const body of ["{bad json", "null", "[]", '"text"', "123", ""]) {
    const response = await route.POST(new Request("https://strikeapose.example/api/contact", {
      method: "POST", headers: { "Content-Type": "application/json" }, body,
    }));
    assert.equal(response.status, 400);
  }
  assert.equal(route.calls.length, 0);
});

test("rejects cross-site submissions and non-JSON content", async () => {
  const route = fixture();
  assert.equal((await route.POST(request(inquiry(), { Origin: "https://other.example" }))).status, 403);
  assert.equal((await route.POST(request(inquiry(), { "Sec-Fetch-Site": "cross-site" }))).status, 403);
  assert.equal((await route.POST(request(inquiry(), { "Content-Type": "text/plain" }))).status, 415);
  assert.equal(route.calls.length, 0);
});

test("accepts the browser origin when Next.js normalizes the internal URL", async () => {
  const route = fixture();
  const response = await route.POST(new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", Host: "127.0.0.1:3000", Origin: "http://127.0.0.1:3000" },
    body: JSON.stringify(inquiry()),
  }));
  assert.equal(response.status, 200);
  assert.equal(route.calls.length, 1);
});

test("caps streamed request bytes even without a Content-Length header", async () => {
  const route = fixture();
  let cancelled = false;
  const body = new ReadableStream({
    pull(controller) { controller.enqueue(new TextEncoder().encode("é".repeat(9000))); },
    cancel() { cancelled = true; },
  });
  const response = await route.POST(new Request("https://strikeapose.example/api/contact", {
    method: "POST", headers: { "Content-Type": "application/json" }, body, duplex: "half",
  }));
  assert.equal(response.status, 413);
  assert.equal(cancelled, true);
  assert.equal(route.calls.length, 0);
});

test("the honeypot returns a generic success without writing a row", async () => {
  const route = fixture();
  assert.equal((await route.POST(request({ website: "https://spam.example" }))).status, 200);
  assert.equal(route.calls.length, 0);
  assert.equal(route.credentials.length, 0);
});

test("missing server configuration returns 503 without exposing configuration", async () => {
  const logs = mock.method(console, "error", () => {});
  for (const name of envNames) {
    const value = process.env[name];
    delete process.env[name];
    const route = fixture();
    const response = await route.POST(request(inquiry()));
    assert.equal(response.status, 503);
    assert.ok(!(await response.text()).includes("test-key"));
    assert.equal(route.calls.length, 0);
    process.env[name] = value;
  }
  assert.equal(logs.mock.calls.length, 3);
});

test("Google failures do not expose credentials or personal data in responses or logs", async () => {
  const logs = mock.method(console, "error", () => {});
  const secret = "test-private-key-and-personal-information";
  const route = fixture(async () => { throw new Error(secret); });
  const response = await route.POST(request(inquiry()));
  assert.equal(response.status, 502);
  assert.ok(!(await response.text()).includes(secret));
  assert.ok(!JSON.stringify(logs.mock.calls).includes(secret));
  assert.equal(route.calls.length, 1);
});

test("does not report success before the Sheets append completes", async () => {
  let resolveAppend;
  let notifyStarted;
  const started = new Promise((resolve) => { notifyStarted = resolve; });
  const pending = new Promise((resolve) => { resolveAppend = resolve; });
  const route = fixture(() => { notifyStarted(); return pending; });
  let returned = false;
  const responsePromise = route.POST(request(inquiry())).then((response) => { returned = true; return response; });
  await started;
  assert.equal(returned, false);
  resolveAppend({});
  assert.equal((await responsePromise).status, 200);
});
