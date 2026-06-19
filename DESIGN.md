# UNPUN Formula Studio Design Direction

## Product Use Case

UNPUN Formula Studio supports a workshop flow where a customer scans a QR code, adds the LINE OA, opens the customer web app from LINE, enters basic contact information, selects a body oil direction as a guide, builds a full 100% formula from all ingredient groups, confirms consent, and receives a finished bottle. The same order data is sent to the public backend, stored in the connected sheet workflow, and picked up by the Macbook Print Station for label and RD sheet generation.

## Experience Model

- Single customer-facing page: premium, calm, mobile-friendly, and non-technical.
- Operational review happens in the synced spreadsheet, not in a separate web admin page.
- LINE OA is the public entry point and staff notification layer, not the only operational database.
- Macbook Print Station is the local production handoff for Brother QL-800 label files and RD sheets.
- Printed outputs: strict black-and-white production artifacts, optimized for label and RD formula sheet clarity.
- Bottle label target: portrait ratio `7:13`. The original 35 x 65 mm label scales to 62 x 115.14 mm when using the 62 mm Brother roll width.
- Print media target: Brother QL-800 with 62 mm Black/Red adhesive roll. P-touch Editor detects the media as `62mm Black/Red`; the customer flow exports a portrait Brother label PNG plus CSV/RD text files instead of relying on browser direct print, because CUPS/browser print can report Brother paper-size errors with this roll.
- Label artwork must be black and white only. Do not use the red channel for bottle labels.
- Label PNG export should render with high-resolution canvas supersampling for crisp 300dpi-class print output.

## Visual Direction

- Inspired by premium commerce and structured SaaS systems.
- Use warm off-white surfaces, slate text, deep green accents, and restrained amber highlights.
- Avoid decorative gradients, floating blobs, and overly playful styling.
- Keep controls compact but touch-friendly for workshop use.
- Prioritize scannability over marketing copy.

## Core UI Rules

- Customer-facing labels should describe outcomes, not back-office terms.
- Technical part codes may remain visible for RD traceability, but the primary text must be human-readable.
- Cost can be visible to customers as an estimated workshop cost.
- The customer page must not expose sheet IDs, webhook setup, retry sync, export, or order history.
- Back-office data review should happen in the connected spreadsheet.
- Dew Oil, Perfume Oil, Dry Oil, and Sleep Oil are guide archetypes only. They suggest approximate group ratios but should not lock ingredient choices.

## Formula Part Language

- A: Base Oil
- B: Texture / Emollient
- C: Active Oils
- D: Fragrance
- E: Antioxidant

## Page-Level Patterns

- Customer page:
  - Left side: guided steps and order controls.
  - Right side: live label preview.
  - Bottom action area: estimated cost and confirm action.
- Success page:
  - Confirms the order was received.
  - Avoids technical sync or print details.
  - Sets expectation that staff will prepare the bottle.
- Macbook Print Station:
  - Shows a compact queue of new orders.
  - Generates label artwork and RD production sheets.
  - Exposes print/download actions only to staff on the connected Macbook.
- RD / owner review:
  - Use the synced spreadsheet for order status, cost review, and production tracking.
  - Keep private operational controls out of the customer web page.

## Workflow Source

- See `FLOW.md` for the current end-to-end workshop workflow and status model.

## Tone

- Thai-first for customer guidance.
- English can remain for formula names and ingredient names.
- Use short labels and avoid long explanatory paragraphs in the UI.
