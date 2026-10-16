# Contact notification setup

The website already appends requests to `Sheet1`. This separate Google Apps
Script emails each new request to `islamtahmidd@gmail.com` from
`tahmid@novusnyc.org`, with all ten columns, a link to the row, and the visitor's
address as Reply-To. The backdrop choice is included in the final notes column,
as it is in the website integration.

## Install

1. Sign into the Google Workspace mailbox `tahmid@novusnyc.org`. That account
   must have Editor access to the contact spreadsheet and be able to send mail.
   MailApp sends as the trigger creator; the code checks the account to avoid
   sending from the wrong address. If this address is only a forwarding address
   or alias, this MailApp version requires the actual Workspace mailbox instead.
2. Open the contact spreadsheet, then **Extensions > Apps Script**. Use a project
   bound to this spreadsheet, separate from the Higher Learning script.
3. Copy the entire contents of `notify-new-contacts.gs` into `Code.gs`. Save it.
   No spreadsheet ID, service account key, Vercel variable, or API key needs to
   be pasted into the script.
4. Select **installContactNotifications** in the function dropdown and click
   **Run**. Complete Google's account selection and authorization prompts using
   `tahmid@novusnyc.org`. This authorizes access to the spreadsheet, sending
   email, the signed-in account's email, and managing the script's timer.
5. Open **Triggers** (the clock icon). Confirm there is one trigger for
   `notifyNewContacts`, with event source **Time-driven**, running every minute.
   The installer creates it. Do not add a second trigger manually.
6. Submit a new request through the website. Expect a notification after a
   timer run, usually around a minute later, with possible scheduling delays.
   Confirm From is `tahmid@novusnyc.org`, To is `islamtahmidd@gmail.com`, and
   all request details are included. Replying should address the visitor.

The initial installation deliberately skips existing rows. Only requests added
after installation are emailed. Running the installer again preserves progress
and does not create another timer for the same function under this account.

## Operation

- Website requests are written with the Sheets API. These writes do not fire
  edit, change, or form-submit triggers, so the script polls once per minute.
- The timer works without the spreadsheet or browser remaining open. The script
  stores the spreadsheet ID during setup and opens it explicitly on each run.
- Keep `Sheet1` as an append-only log. Do not sort, move, insert, or delete raw
  request rows. Use a separate tab for rearranged reports.
- Each run processes up to 50 pending rows, limited by remaining email quota.
  Additional rows stay pending for later runs. Google account quotas still apply.
- A script lock prevents concurrent runs from processing the queue together.
  The checkpoint advances after each successful send. If a send fails, that row
  and later rows remain pending. Email delivery and checkpoint updates are
  separate operations, so a rare interruption between them can repeat an email.
- HTML values are escaped before inclusion in email. No submission contents or
  credentials are written to logs.

To troubleshoot, open **Executions** in Apps Script and inspect failed runs.
Also check the recipient's spam folder. To pause notifications, delete the
`notifyNewContacts` timer from **Triggers**. Running the installer again resumes
from the saved checkpoint.

To email historical requests intentionally, edit the script property
`STRIKE_A_POSE_LAST_NOTIFIED_ROW` to `1` under **Project Settings > Script
Properties**, then run `notifyNewContacts`. This resends all existing data rows,
including requests previously emailed; it is not necessary for normal setup.

## Google references

- [Installable trigger restrictions and time-driven triggers](https://developers.google.com/apps-script/guides/triggers/installable)
- [MailApp email options](https://developers.google.com/apps-script/reference/mail/mail-app)
- [Effective user identity](https://developers.google.com/apps-script/reference/base/session#getEffectiveUser())
- [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas)
