# UNPUN Formula Studio Design Direction

## Product Use Case

UNPUN Formula Studio supports a workshop flow where a customer scans a QR code, enters basic contact information, selects a body oil direction as a guide, builds a full 100% formula from all ingredient groups, confirms consent, and receives a printed bottle label. The same order data is sent to the RD team for production through the connected sheet workflow.

## Experience Model

- Single customer-facing page: premium, calm, mobile-friendly, and non-technical.
- Operational review happens in the synced spreadsheet, not in a separate web admin page.
- Printed outputs: strict black-and-white production artifacts, optimized for label and RD formula sheet clarity.
- Print media target: Brother QL-800 with 62 mm continuous black/red-white adhesive roll. Bottle label uses 62 x 65 mm; production sheet uses 62 mm roll width with receipt-style flow.

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
- RD / owner review:
  - Use the synced spreadsheet for order status, cost review, and production tracking.
  - Keep private operational controls out of the customer web page.

## Tone

- Thai-first for customer guidance.
- English can remain for formula names and ingredient names.
- Use short labels and avoid long explanatory paragraphs in the UI.
