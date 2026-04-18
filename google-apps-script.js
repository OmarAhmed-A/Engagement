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
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    var sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RSVPs") ||
      SpreadsheetApp.getActiveSpreadsheet().insertSheet("RSVPs");

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Guests", "Phone"]);
    }

    var name = "";
    var guests = "";
    var phone = "";

    // Try form parameters first (from form submission)
    if (e && e.parameter) {
      name = e.parameter.name || "";
      guests = e.parameter.guests || "";
      phone = e.parameter.phone || "";
    }

    // Try JSON body as fallback
    if (!name && e && e.postData && e.postData.contents) {
      try {
        var json = JSON.parse(e.postData.contents);
        name = json.name || "";
        guests = json.guests || "";
        phone = json.phone || "";
      } catch (ignored) {}
    }

    sheet.appendRow([new Date(), name, guests, phone]);

    return ContentService.createTextOutput("OK");
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message);
  }
}
