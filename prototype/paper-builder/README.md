# Question paper builder (prototype)

Covers the **Assess** step of the workflow in `CLAUDE.md`: build an exam or mid-term paper with an answer key from a question bank.

## Run
- **Published page (private, owner only until shared):** https://claude.ai/artifact/SioMxmDzrU6CRGVwEYdQgh
- **Locally:** open `index.html` in any browser. No install, no server, works offline (fonts fall back to system fonts when offline).
- Inside the published page the browser print dialog is blocked, so use **Save as file (.html)**, open the saved file and press Print (Save as PDF if needed). Locally, **Print** works directly.
- To republish after changes: `python3 build-standalone.py out.html` inlines everything into one page fragment.

## Workflow
1. Pick class, subject and pattern, then tick the chapters taught.
2. Edit sections: name, type (MCQ, short, long), number of questions, marks each, heading text, instruction line. Add or remove sections.
3. **Generate** fills every section from the bank, spread evenly across ticked chapters, no repeats. **Fill empty slots only** keeps your edits.
4. On the paper: **Edit** any question, **Replace** from the bank, move up or down, remove, or add your own to a section.
5. Check the **Answer key** tab, then print or save.

## What can be customised
| Area | Options |
|---|---|
| Heading | School name, address line, logo upload (left, centre, right, size), session, exam title, class and subject label, time, max marks, date, student details line (name, roll no., class/section, date) |
| Instructions | Show or hide, heading, one per line, numbered or plain |
| Layout | Paper size (A4, Letter, A5), margins, font, font size, line spacing, gap between questions, numbering style (1. / Q1. / (1) / Q.1), continuous or per-section numbering, marks at right / inline / hidden, MCQ options in two columns / one per line / one row, section heading style, blank answer lines per mark, section totals, page break per section, "End of paper", watermark, footer |
| Questions | Edit text, options, answer, marks; shuffle MCQ options; reorder; add or remove |
| Answer key | Title, list or table, MCQ letter only or letter with text, repeat question text, marks, chapter, section totals, school heading on or off, closing note, teacher name |
| Saved settings | Everything above plus the pattern can be saved under a name, exported to a file and imported back |

Your work (settings, edited paper, added questions) is kept in the browser on that device. It is not shared and is lost if site data is cleared; use Export settings and Export CSV to back up.

## Data
- `data.js`: chapter lists, exam patterns and the **sample** question bank (49 Class 7 Maths questions written for demonstration; not from R S Aggarwal; check before real use).
- CSV columns: `id, class, subject, chapter, marks, text, optA, optB, optC, optD, answer`. All four options filled means an MCQ. These match the planned `QuestionBank` Sheet tab.

## Known limits (prototype)
- Half Yearly pattern is real (80 marks, 38 questions). Unit/Mid-term and Custom patterns are **placeholders**.
- Only Class 7 and Class 8 Maths chapters are listed; Class 8 is an assumption. No Science or Class 6 chapters yet.
- English only (confirmed as the paper language). No internal choice, no .docx export, no AI suggestions, no diary link (chapters are ticked by hand), no diagrams.
- Maths is typed as plain text (for example `x/3`, `½`, `△ABC`).
