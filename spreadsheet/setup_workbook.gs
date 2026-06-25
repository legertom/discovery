/**
 * AI Enablement Workflow Friction Intake & Triage System
 * Google Apps Script Setup
 *
 * Run setupWorkbook() once after importing the XLSX to Google Sheets.
 * Safe to re-run — idempotent where possible.
 */

// ─────────────────────────────────────────────
// MENU
// ─────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getActiveSpreadsheet().addMenu('AI Enablement System', [
    { name: 'Setup / Refresh Workbook', functionName: 'setupWorkbook' },
    null,
    { name: 'Generate Brief for Selected ID', functionName: 'generateBriefStub' }
  ]);
}

function generateBriefStub() {
  SpreadsheetApp.getUi().alert(
    'Select an Opportunity ID in B2 of the Opportunity Briefs tab first.'
  );
}

// ─────────────────────────────────────────────
// MAIN ORCHESTRATOR
// ─────────────────────────────────────────────

function setupWorkbook() {
  try {
    Logger.log('setupWorkbook() started');
    setTabColors();
    setupListsAndSettings();
    setupNamedRanges();
    setupIntakeResponsesValidation();
    setupOpportunityScoringValidation();
    setupDiscoverySessionsValidation();
    setupDiscoveryStepLogValidation();
    setupConditionalFormatting();
    setupHeaderNotes();
    setupProtectedRanges();
    SpreadsheetApp.getActiveSpreadsheet().toast('✅ Workbook setup complete!', 'Done', 5);
    Logger.log('setupWorkbook() finished successfully');
  } catch (e) {
    Logger.log('ERROR in setupWorkbook(): ' + e.message);
    SpreadsheetApp.getUi().alert('Setup error: ' + e.message);
  }
}

// ─────────────────────────────────────────────
// 1. TAB COLORS
// ─────────────────────────────────────────────

function setTabColors() {
  Logger.log('setTabColors() started');
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var colors = {
      'Intake Responses':   '#2E75B6',
      'Opportunity Scoring': '#375623',
      'Discovery Sessions':  '#7030A0',
      'Discovery Step Log':  '#9933CC',
      'Opportunity Briefs':  '#1F4E79',
      'Dashboard':           '#C55A11',
      'Lists & Settings':    '#595959',
      'Instructions':        '#595959'
    };
    for (var name in colors) {
      var sheet = ss.getSheetByName(name);
      if (sheet) {
        sheet.setTabColor(colors[name]);
        Logger.log('Set tab color for: ' + name);
      } else {
        Logger.log('WARNING: Sheet not found: ' + name);
      }
    }
  } catch (e) {
    Logger.log('ERROR in setTabColors(): ' + e.message);
    throw e;
  }
}

// ─────────────────────────────────────────────
// 2. LISTS & SETTINGS — populate if empty
// ─────────────────────────────────────────────

function setupListsAndSettings() {
  Logger.log('setupListsAndSettings() started');
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Lists & Settings');
    if (!sheet) { Logger.log('WARNING: Lists & Settings sheet not found'); return; }

    // Only write if col A row 2 is empty (avoid overwriting existing data)
    if (sheet.getRange('A2').getValue() !== '') {
      Logger.log('Lists & Settings already populated, skipping write');
      return;
    }

    // Col A: Team / Function (rows 2-15)
    var teams = [
      'Customer Support','Customer Success','Product','Engineering','Sales',
      'Marketing','Operations','People','Finance','Legal','Security','IT',
      'Leadership','Other'
    ];
    sheet.getRange(2, 1, teams.length, 1).setValues(teams.map(function(v){ return [v]; }));

    // Col B: Frequency (rows 2-8)
    var frequencies = [
      'Multiple times per day','Daily','Weekly','Monthly',
      'Quarterly','Ad hoc','Unknown'
    ];
    sheet.getRange(2, 2, frequencies.length, 1).setValues(frequencies.map(function(v){ return [v]; }));

    // Col C: Friction Types (rows 2-16)
    var frictionTypes = [
      'Manual copy/paste','Repetitive data entry','Slow approvals / waiting',
      'Context switching between tools','Hard to find information',
      'Unclear ownership / handoffs','Inconsistent process execution',
      'High error rate / rework','Missing data at decision point',
      'Formatting / reformatting work','Duplicate data entry',
      'Manual reporting / aggregation','Alert / notification overload',
      'Difficult to onboard others','Other'
    ];
    sheet.getRange(2, 3, frictionTypes.length, 1).setValues(frictionTypes.map(function(v){ return [v]; }));

    // Col D: Likely Solution Type (rows 2-12)
    var solutionTypes = [
      'AI-assisted writing','AI-assisted summarization','AI-assisted research/retrieval',
      'Reporting automation','Data pipeline/integration','Workflow automation',
      'Template/process redesign','Knowledge management improvement',
      'Human-in-the-loop review process','Not enough information','Not a fit'
    ];
    sheet.getRange(2, 4, solutionTypes.length, 1).setValues(solutionTypes.map(function(v){ return [v]; }));

    // Col E: Opportunity Status (rows 2-10)
    var statuses = [
      'New','Needs Discovery','Discovery Scheduled','Discovery Complete',
      'Prototype Candidate','In Prototype','Implemented','Parked','Not a Fit'
    ];
    sheet.getRange(2, 5, statuses.length, 1).setValues(statuses.map(function(v){ return [v]; }));

    // Col F: Risk Level (rows 2-5)
    var riskLevels = ['Low','Medium','High','Unknown'];
    sheet.getRange(2, 6, riskLevels.length, 1).setValues(riskLevels.map(function(v){ return [v]; }));

    // Col G: Feasibility (rows 2-5)
    var feasibility = ['Easy','Medium','Hard','Unknown'];
    sheet.getRange(2, 7, feasibility.length, 1).setValues(feasibility.map(function(v){ return [v]; }));

    // Col H: Priority Category (rows 2-7)
    var priorityCategories = [
      'Quick Win','Discovery Needed','Strategic Project',
      'High Risk / Needs Review','Not a Fit','Process Issue'
    ];
    sheet.getRange(2, 8, priorityCategories.length, 1).setValues(priorityCategories.map(function(v){ return [v]; }));

    Logger.log('Lists & Settings populated');
  } catch (e) {
    Logger.log('ERROR in setupListsAndSettings(): ' + e.message);
    throw e;
  }
}

// ─────────────────────────────────────────────
// 3. NAMED RANGES
// ─────────────────────────────────────────────

function setupNamedRanges() {
  Logger.log('setupNamedRanges() started');
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Lists & Settings');
    if (!sheet) { Logger.log('WARNING: Lists & Settings sheet not found'); return; }

    var namedRanges = [
      { name: 'TeamList',             range: sheet.getRange('A2:A15') },
      { name: 'FrequencyList',        range: sheet.getRange('B2:B8') },
      { name: 'FrictionTypeList',     range: sheet.getRange('C2:C16') },
      { name: 'SolutionTypeList',     range: sheet.getRange('D2:D12') },
      { name: 'StatusList',           range: sheet.getRange('E2:E10') },
      { name: 'RiskLevelList',        range: sheet.getRange('F2:F5') },
      { name: 'FeasibilityList',      range: sheet.getRange('G2:G5') },
      { name: 'PriorityCategoryList', range: sheet.getRange('H2:H7') }
    ];

    // Remove existing named ranges with the same names first
    var existingNamedRanges = ss.getNamedRanges();
    var namesToRemove = namedRanges.map(function(nr){ return nr.name; });
    existingNamedRanges.forEach(function(existing) {
      if (namesToRemove.indexOf(existing.getName()) !== -1) {
        existing.remove();
        Logger.log('Removed existing named range: ' + existing.getName());
      }
    });

    // Create named ranges
    namedRanges.forEach(function(nr) {
      ss.setNamedRange(nr.name, nr.range);
      Logger.log('Created named range: ' + nr.name);
    });
  } catch (e) {
    Logger.log('ERROR in setupNamedRanges(): ' + e.message);
    throw e;
  }
}

// ─────────────────────────────────────────────
// 4. INTAKE RESPONSES — DATA VALIDATION
// ─────────────────────────────────────────────

function setupIntakeResponsesValidation() {
  Logger.log('setupIntakeResponsesValidation() started');
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Intake Responses');
    if (!sheet) { Logger.log('WARNING: Intake Responses sheet not found'); return; }

    // Col D (4) — Team — from TeamList named range
    var teamRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(ss.getRangeByName('TeamList'), true)
      .setAllowInvalid(false)
      .setHelpText('Select the team or function that owns this workflow.')
      .build();
    sheet.getRange(2, 4, 500, 1).setDataValidation(teamRule);

    // Col M (13) — Frequency — from FrequencyList named range
    var freqRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(ss.getRangeByName('FrequencyList'), true)
      .setAllowInvalid(false)
      .setHelpText('How often this workflow runs.')
      .build();
    sheet.getRange(2, 13, 500, 1).setDataValidation(freqRule);

    // Col AF (32) — Sensitive Data — direct list
    var sensitiveRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Yes', 'No', 'Unsure'], true)
      .setAllowInvalid(false)
      .setHelpText('Does this workflow involve sensitive, private, or regulated data?')
      .build();
    sheet.getRange(2, 32, 500, 1).setDataValidation(sensitiveRule);

    // Col AL (38) — Available for Live Walkthrough — direct list
    var walkthroughRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Yes', 'No', 'Maybe'], true)
      .setAllowInvalid(false)
      .setHelpText('Is the submitter available to walk through the workflow live?')
      .build();
    sheet.getRange(2, 38, 500, 1).setDataValidation(walkthroughRule);

    // Col AM (39) — Prototype Willingness — direct list
    var protoRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Yes', 'No', 'Maybe'], true)
      .setAllowInvalid(false)
      .setHelpText('Is the submitter willing to pilot a prototype solution?')
      .build();
    sheet.getRange(2, 39, 500, 1).setDataValidation(protoRule);

    // Col AN (40) — Ideal Timeline — direct list
    var timelineRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['This week', 'This month', 'This quarter', 'No specific timeline'], true)
      .setAllowInvalid(false)
      .setHelpText('When does the submitter hope to see improvement?')
      .build();
    sheet.getRange(2, 40, 500, 1).setDataValidation(timelineRule);

    Logger.log('Intake Responses validation applied');
  } catch (e) {
    Logger.log('ERROR in setupIntakeResponsesValidation(): ' + e.message);
    throw e;
  }
}

// ─────────────────────────────────────────────
// 5. OPPORTUNITY SCORING — DATA VALIDATION
// ─────────────────────────────────────────────

function setupOpportunityScoringValidation() {
  Logger.log('setupOpportunityScoringValidation() started');
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Opportunity Scoring');
    if (!sheet) { Logger.log('WARNING: Opportunity Scoring sheet not found'); return; }

    // Col E (5) — Status — from StatusList
    var statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(ss.getRangeByName('StatusList'), true)
      .setAllowInvalid(false)
      .setHelpText('Current pipeline stage for this opportunity.')
      .build();
    sheet.getRange(2, 5, 500, 1).setDataValidation(statusRule);

    // Col S (19) — Likely Solution Type — from SolutionTypeList
    var solutionRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(ss.getRangeByName('SolutionTypeList'), true)
      .setAllowInvalid(false)
      .setHelpText('Best current guess at solution type. Update after triage.')
      .build();
    sheet.getRange(2, 19, 500, 1).setDataValidation(solutionRule);

    // Col T (20) — Feasibility — from FeasibilityList
    var feasRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(ss.getRangeByName('FeasibilityList'), true)
      .setAllowInvalid(false)
      .setHelpText('Estimated implementation difficulty.')
      .build();
    sheet.getRange(2, 20, 500, 1).setDataValidation(feasRule);

    // Col U (21) — Risk Level — from RiskLevelList
    var riskRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(ss.getRangeByName('RiskLevelList'), true)
      .setAllowInvalid(false)
      .setHelpText('Overall risk rating based on data sensitivity and operational impact.')
      .build();
    sheet.getRange(2, 21, 500, 1).setDataValidation(riskRule);

    // Col AA (27) — Priority Category — from PriorityCategoryList
    var priorityRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(ss.getRangeByName('PriorityCategoryList'), true)
      .setAllowInvalid(false)
      .setHelpText('Formula-derived triage bucket. Can be overridden by reviewer.')
      .build();
    sheet.getRange(2, 27, 500, 1).setDataValidation(priorityRule);

    Logger.log('Opportunity Scoring validation applied');
  } catch (e) {
    Logger.log('ERROR in setupOpportunityScoringValidation(): ' + e.message);
    throw e;
  }
}

// ─────────────────────────────────────────────
// 6. DISCOVERY SESSIONS — DATA VALIDATION
// ─────────────────────────────────────────────

function setupDiscoverySessionsValidation() {
  Logger.log('setupDiscoverySessionsValidation() started');
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Discovery Sessions');
    if (!sheet) { Logger.log('WARNING: Discovery Sessions sheet not found'); return; }

    // Col G (7) — Session Type — direct list
    var sessionTypeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList([
        'Intake Review',
        'Live Workflow Walkthrough',
        'Stakeholder Interview',
        'Async Review',
        'Prototype Scoping',
        'Follow-up'
      ], true)
      .setAllowInvalid(false)
      .setHelpText('The kind of discovery activity conducted in this session.')
      .build();
    sheet.getRange(2, 7, 500, 1).setDataValidation(sessionTypeRule);

    // Col M (13) — Likely Solution Direction — from SolutionTypeList
    var solutionRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(ss.getRangeByName('SolutionTypeList'), true)
      .setAllowInvalid(false)
      .setHelpText('Best current guess at solution direction based on this session.')
      .build();
    sheet.getRange(2, 13, 500, 1).setDataValidation(solutionRule);

    Logger.log('Discovery Sessions validation applied');
  } catch (e) {
    Logger.log('ERROR in setupDiscoverySessionsValidation(): ' + e.message);
    throw e;
  }
}

// ─────────────────────────────────────────────
// 7. DISCOVERY STEP LOG — DATA VALIDATION
// ─────────────────────────────────────────────

function setupDiscoveryStepLogValidation() {
  Logger.log('setupDiscoveryStepLogValidation() started');
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Discovery Step Log');
    if (!sheet) { Logger.log('WARNING: Discovery Step Log sheet not found'); return; }

    // Col O (15) — Human Judgment Required?
    var humanJudgmentRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Yes', 'No', 'Sometimes', 'Unknown'], true)
      .setAllowInvalid(false)
      .setHelpText('Does this step require human interpretation, approval, or accountability?')
      .build();
    sheet.getRange(2, 15, 1000, 1).setDataValidation(humanJudgmentRule);

    // Col P (16) — Could This Be Automated?
    var automatedRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Yes', 'No', 'Partially', 'Unknown'], true)
      .setAllowInvalid(false)
      .setHelpText('Could deterministic automation handle this step without AI?')
      .build();
    sheet.getRange(2, 16, 1000, 1).setDataValidation(automatedRule);

    // Col Q (17) — Could This Be AI-Assisted?
    var aiAssistedRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Yes', 'No', 'Partially', 'Unknown'], true)
      .setAllowInvalid(false)
      .setHelpText('Could AI assist with drafting, summarizing, classifying, or transforming this step?')
      .build();
    sheet.getRange(2, 17, 1000, 1).setDataValidation(aiAssistedRule);

    Logger.log('Discovery Step Log validation applied');
  } catch (e) {
    Logger.log('ERROR in setupDiscoveryStepLogValidation(): ' + e.message);
    throw e;
  }
}

// ─────────────────────────────────────────────
// 8. CONDITIONAL FORMATTING
// ─────────────────────────────────────────────

function setupConditionalFormatting() {
  Logger.log('setupConditionalFormatting() started');
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Opportunity Scoring');
    if (!sheet) { Logger.log('WARNING: Opportunity Scoring sheet not found'); return; }

    // Clear existing CF rules for this sheet
    sheet.setConditionalFormatRules([]);
    var rules = [];

    // ── Col Z (Priority Score) ──────────────────
    var zRange = sheet.getRange('Z2:Z501');

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($Z2>=20,$Z2<>"")')
      .setBackground('#C6EFCE')
      .setFontColor('#375623')
      .setRanges([zRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($Z2>=10,$Z2<20,$Z2<>"")')
      .setBackground('#FFEB9C')
      .setFontColor('#9C6500')
      .setRanges([zRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($Z2<10,$Z2<>"")')
      .setBackground('#FFC7CE')
      .setFontColor('#9C0006')
      .setRanges([zRange])
      .build());

    // ── Col U (Risk Level) ──────────────────────
    var uRange = sheet.getRange('U2:U501');

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$U2="High"')
      .setBackground('#FFC7CE')
      .setFontColor('#9C0006')
      .setRanges([uRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$U2="Medium"')
      .setBackground('#FFEB9C')
      .setFontColor('#9C6500')
      .setRanges([uRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$U2="Low"')
      .setBackground('#C6EFCE')
      .setFontColor('#375623')
      .setRanges([uRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$U2="Unknown"')
      .setBackground('#D9D9D9')
      .setFontColor('#595959')
      .setRanges([uRange])
      .build());

    // ── Col AA (Priority Category) ──────────────
    var aaRange = sheet.getRange('AA2:AA501');

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$AA2="Quick Win"')
      .setBackground('#C6EFCE')
      .setFontColor('#375623')
      .setRanges([aaRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$AA2="Discovery Needed"')
      .setBackground('#BDD7EE')
      .setFontColor('#1F4E79')
      .setRanges([aaRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$AA2="Strategic Project"')
      .setBackground('#E2CFED')
      .setFontColor('#7030A0')
      .setRanges([aaRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$AA2="High Risk / Needs Review"')
      .setBackground('#FFC7CE')
      .setFontColor('#9C0006')
      .setRanges([aaRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$AA2="Process Issue"')
      .setBackground('#FFEB9C')
      .setFontColor('#9C6500')
      .setRanges([aaRange])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$AA2="Not a Fit"')
      .setBackground('#D9D9D9')
      .setFontColor('#595959')
      .setRanges([aaRange])
      .build());

    // Apply all rules
    sheet.setConditionalFormatRules(rules);
    Logger.log('Conditional formatting applied — ' + rules.length + ' rules set');
  } catch (e) {
    Logger.log('ERROR in setupConditionalFormatting(): ' + e.message);
    throw e;
  }
}

// ─────────────────────────────────────────────
// 9. HEADER NOTES / COMMENTS
// ─────────────────────────────────────────────

function setupHeaderNotes() {
  Logger.log('setupHeaderNotes() started');
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // ── Intake Responses ─────────────────────────
    var irSheet = ss.getSheetByName('Intake Responses');
    if (irSheet) {
      var irNotes = {
        'E1':  'Name the actual work being performed, not the proposed AI idea.',
        'I1':  'Explain why this workflow exists and what business outcome it supports.',
        'K1':  'Describe the consequence if this work is delayed, incorrect, incomplete, or skipped.',
        'L1':  'Describe what happens today. Do not solve here; capture current-state steps, handoffs, and manual effort.',
        'M1':  'How often this work occurs. Use Unknown if the submitter cannot estimate.',
        'N1':  'Approximate active minutes required each time the workflow runs.',
        'O1':  'Number of people who perform this workflow each cycle.',
        'S1':  'Types of pain present. Multiple values may apply.',
        'Z1':  'Describe what better would look like in terms of outcome and experience.',
        'AA1': 'Judgment, approvals, sensitivity checks, or quality review that should remain human-owned.',
        'AB1': 'Boundaries for automation or AI assistance.',
        'AC1': 'Controls, evidence, review steps, or transparency needed for adoption.',
        'AD1': 'Failure modes or missing requirements that would make the solution unacceptable.',
        'AE1': 'Measurable or observable success criteria.',
        'AF1': 'Whether sensitive, private, regulated, customer, student, employee, financial, legal, or confidential data may be involved.',
        'AG1': 'Specific kinds of data used by the workflow.',
        'AH1': 'Where source data lives today.',
        'AI1': 'Where the completed output goes.'
      };
      for (var cell in irNotes) {
        irSheet.getRange(cell).setNote(irNotes[cell]);
      }
      Logger.log('Intake Responses header notes applied');
    }

    // ── Opportunity Scoring ──────────────────────
    var osSheet = ss.getSheetByName('Opportunity Scoring');
    if (osSheet) {
      var osNotes = {
        'E1':  'Current stage in the opportunity pipeline.',
        'S1':  'Best current guess at what type of improvement may fit. Update manually after triage.',
        'T1':  'Estimated implementation difficulty. Update manually after triage.',
        'U1':  'Risk based on data sensitivity, compliance, operational consequences, and customer impact.',
        'V1':  'Formula-derived score combining business criticality, urgency, and estimated monthly hours.',
        'W1':  'Formula-derived frequency score (how often the workflow occurs).',
        'X1':  'Average of pain rating and error-proneness.',
        'Y1':  'Penalty for high risk level and sensitive data involvement.',
        'Z1':  'Combined weighted priority score. Use to sort candidates, then apply judgment.',
        'AA1': 'Formula-derived triage bucket. Can be overridden by reviewer.',
        'AB1': 'Suggested next action based on Priority Category.'
      };
      for (var cell in osNotes) {
        osSheet.getRange(cell).setNote(osNotes[cell]);
      }
      Logger.log('Opportunity Scoring header notes applied');
    }

    // ── Discovery Sessions ───────────────────────
    var dsSheet = ss.getSheetByName('Discovery Sessions');
    if (dsSheet) {
      var dsNotes = {
        'A1': 'Auto-generated readable ID for this discovery conversation or session.',
        'B1': 'The Opportunity ID this discovery session is about.',
        'G1': 'The kind of discovery activity: Intake Review, Live Workflow Walkthrough, Stakeholder Interview, Async Review, Prototype Scoping, or Follow-up.',
        'H1': 'What this session is meant to clarify.',
        'I1': 'Brief narrative summary of the workflow, pain, constraints, or key discoveries.',
        'J1': 'Most important friction points found during discovery.',
        'K1': 'Privacy, compliance, security, data quality, customer impact, or human-review considerations.',
        'L1': 'Systems, permissions, APIs, reports, templates, stakeholders, or decisions needed before improvement work can proceed.',
        'N1': 'Concrete next action after this session.',
        'Q1': 'Optional link to filter the Discovery Step Log by this Opportunity ID.'
      };
      for (var cell in dsNotes) {
        dsSheet.getRange(cell).setNote(dsNotes[cell]);
      }
      Logger.log('Discovery Sessions header notes applied');
    }

    // ── Discovery Step Log ───────────────────────
    var slSheet = ss.getSheetByName('Discovery Step Log');
    if (slSheet) {
      var slNotes = {
        'A1': 'Detailed step-level log. Many rows per opportunity. Filter by Opportunity ID to see one workflow\'s steps.',
        'F1': 'Sequential step number in the current-state workflow.',
        'G1': 'What happens in this step. Capture the action, not a proposed solution.',
        'H1': 'Tool, system, document, report, inbox, or file used in this step.',
        'I1': 'What information, file, request, data, or context enters this step.',
        'J1': 'What this step produces or changes.',
        'K1': 'What the human actually does: copy, paste, search, rewrite, verify, reconcile, approve, escalate, etc.',
        'M1': 'Pain, delay, confusion, repetition, missing context, or frustration observed.',
        'N1': 'Where errors, privacy issues, customer impact, compliance concerns, or rework could occur.',
        'O1': 'Whether this step requires human interpretation, accountability, empathy, approval, or judgment.',
        'P1': 'Whether deterministic automation could handle this step.',
        'Q1': 'Whether AI could assist with drafting, summarizing, retrieval, classification, checking, or transformation.',
        'R1': 'What would be required to improve this step.'
      };
      for (var cell in slNotes) {
        slSheet.getRange(cell).setNote(slNotes[cell]);
      }
      Logger.log('Discovery Step Log header notes applied');
    }
  } catch (e) {
    Logger.log('ERROR in setupHeaderNotes(): ' + e.message);
    throw e;
  }
}

// ─────────────────────────────────────────────
// 10. PROTECTED RANGES
// ─────────────────────────────────────────────

function setupProtectedRanges() {
  Logger.log('setupProtectedRanges() started');
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // ── Opportunity Scoring — formula columns ────
    var osSheet = ss.getSheetByName('Opportunity Scoring');
    if (osSheet) {
      // Remove existing protections on this sheet to allow re-run
      osSheet.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(function(p) {
        p.remove();
      });

      var osProtections = [
        { range: 'B2:D501', desc: 'XLOOKUP formulas — do not edit manually (WorkflowName, Team, WorkflowOwner)' },
        { range: 'F2:K501', desc: 'Calculated run and hours formulas — do not edit manually' },
        { range: 'L2:R501', desc: 'XLOOKUP formulas — do not edit manually (scoring inputs from Intake)' },
        { range: 'V2:Z501', desc: 'Priority score formulas — do not edit manually' },
        { range: 'AA2:AB501', desc: 'Priority category and next step formulas — do not edit manually' }
      ];

      osProtections.forEach(function(p) {
        osSheet.getRange(p.range).protect()
          .setDescription(p.desc)
          .setWarningOnly(true);
        Logger.log('Protected (warning-only): Opportunity Scoring ' + p.range);
      });
    }

    // ── Intake Responses — auto-generated IDs ────
    var irSheet = ss.getSheetByName('Intake Responses');
    if (irSheet) {
      // Remove existing protections
      irSheet.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(function(p) {
        p.remove();
      });

      irSheet.getRange('A2:A501').protect()
        .setDescription('Auto-generated Opportunity IDs — do not edit manually')
        .setWarningOnly(true);
      Logger.log('Protected (warning-only): Intake Responses A2:A501');
    }

    Logger.log('Protected ranges configured');
  } catch (e) {
    Logger.log('ERROR in setupProtectedRanges(): ' + e.message);
    throw e;
  }
}
