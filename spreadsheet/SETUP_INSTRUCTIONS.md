# Setup Instructions — AI Enablement Intake & Triage Workbook

## Step 1 — Upload the XLSX to Google Sheets

1. Go to [drive.google.com](https://drive.google.com)
2. Click **New → File upload** and select `AI_Enablement_Intake.xlsx`
3. After upload completes, right-click the file in Drive
4. Select **Open with → Google Sheets**
   - This converts the XLSX to a native Google Sheets file
   - The original XLSX remains in Drive; the new Sheets file is separate
5. Confirm you see all 8 tabs at the bottom: Intake Responses, Opportunity Scoring, Discovery Sessions, Discovery Step Log, Opportunity Briefs, Dashboard, Lists & Settings, Instructions

## Step 2 — Open the Apps Script Editor

1. In the Google Sheets file, click **Extensions → Apps Script**
2. A new browser tab opens showing the Apps Script editor
3. Delete any default placeholder code in the editor (the `function myFunction() {}` stub)

## Step 3 — Paste and Save the Script

1. Open `setup_workbook.gs` from this repo
2. Select all the content and copy it
3. Paste it into the Apps Script editor (replacing the deleted stub)
4. Click the **Save** icon (floppy disk) or press `Cmd+S` / `Ctrl+S`
5. Name the project something like `AI Enablement Setup` when prompted

## Step 4 — Run the Setup Script

1. In the Apps Script editor, ensure `setupWorkbook` is selected in the function dropdown (top toolbar)
2. Click **Run**
3. On first run, Google will ask for authorization:
   - Click **Review permissions**
   - Choose your Google account
   - Click **Advanced → Go to [project name] (unsafe)** (this is your own script — it is safe)
   - Click **Allow**
4. The script will run — this takes 15–45 seconds
5. Return to the Google Sheets tab; you should see:
   - A toast notification: "✅ Workbook setup complete!"
   - Colored tab labels on each sheet
   - A new **AI Enablement System** menu in the menu bar

## What the Script Configures

- **Tab colors** — each sheet gets a distinct color
- **Named ranges** — 8 list ranges created from Lists & Settings (used by dropdowns)
- **Data validation dropdowns** — in Intake Responses, Opportunity Scoring, Discovery Sessions, and Discovery Step Log
- **Conditional formatting** — color-coded Priority Score, Risk Level, and Priority Category in Opportunity Scoring
- **Header notes** — hover over any column header to see a description of what to enter
- **Protected ranges** (warning-only) — formula columns in Opportunity Scoring and auto-ID column in Intake Responses show a warning if accidentally edited; you can still override

## Re-running the Script

The script is safe to run again at any time via **AI Enablement System → Setup / Refresh Workbook**. It removes and recreates named ranges, clears and resets conditional formatting rules, and removes/recreates protected ranges before applying them fresh.
