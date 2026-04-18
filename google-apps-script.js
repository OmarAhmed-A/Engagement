// ─── Google Apps Script — paste this into your Google Sheet's Apps Script editor ───
//
// Setup:
//   1. Create a new Google Sheet
//   2. Go to Extensions → Apps Script
//   3. Delete the default code and paste this entire file
//   4. Click Deploy → Manage deployments → edit → NEW VERSION → Deploy
//   5. Type: "Web app"
//   6. Execute as: "Me"
//   7. Who has access: "Anyone"
//   8. Click Deploy, authorize, and copy the URL
//   9. Paste the URL into SCRIPT_URL in src/main.ts
//

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RSVPs") ||
      SpreadsheetApp.getActiveSpreadsheet().insertSheet("RSVPs");

    // Add headers on first use
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Guests", "Phone"]);
      sheet
        .getRange(1, 1, 1, 4)
        .setFontWeight("bold")
        .setBackground("#f3f0eb");
    }

    // e.parameter contains form field values (key=value pairs)
    var name = e.parameter.name || "";
    var guests = e.parameter.guests || "";
    var phone = e.parameter.phone || "";

    sheet.appendRow([new Date(), name, guests, phone]);

    return ContentService.createTextOutput("OK");
  } finally {
    lock.releaseLock();
  }
}
