# LINE OA Setup

## 1. Create the public entry

1. Create or use the UNPUN LINE Official Account.
2. In LINE Developers Console, create a Provider and a Messaging API channel for that OA.
3. Create a LIFF app in the same Provider.
4. Set its Endpoint URL to the public workshop app URL, for example:
   `https://pskmana.github.io/unpun-cosmoprof-web-app/`
5. Enable the `profile` scope.
6. Copy the LIFF ID into `LINE_LIFF_ID` in `index.html`.

## 2. Give customers one path

1. Put the LIFF URL in the OA rich menu as `Create My Oil`.
2. Use the OA QR code at the workshop entrance.
3. The customer adds the OA, taps `Create My Oil`, and continues in the web app.

## 3. What works after the LIFF ID is set

- The web app reads the LINE display name and User ID.
- The User ID is stored with the submitted order in Google Sheet.
- The customer only needs to add phone and email before building the formula.

## 4. Next step: automatic staff alerts

Use a small server endpoint to receive LINE webhooks, verify the LINE signature, and send a Messaging API push to the RD staff group when the Apps Script saves an order. Keep the channel access token only in that server's secret store, never in `index.html` or GitHub.
