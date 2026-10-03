# Teaching Assistant Tool: project handoff

Status as of 3 Oct 2026. Research and wireframe done; nothing built yet.

## Goal
A simple daily-use tool for one teacher (Varnika's mother) at a CBSE school in Aligarh, India. Scope for now: Maths and Science, Classes 6, 7 and 8. It should save time on lesson plans, question papers and the teaching diary without lowering teaching quality.

## Decisions made
| Area | Decision |
|---|---|
| Users | Her only (single teacher) |
| Board / books | CBSE. Maths: R S Aggarwal, Book 1 and Book 2 (NCF-aligned, Bharati Bhawan). Science book not yet known |
| Language | Bilingual Hindi / English |
| Devices | Android phone for daily logging, laptop for plans and papers |
| AI | Optional: drafts only, she edits everything |
| Student data | Class-level performance only, no student names |
| Templates | School's own formats; Word files with `{{placeholders}}` |
| Build path | Google Workspace prototype first (Sheets + Docs + Apps Script); custom web app (PWA) only if she keeps using it |
| Voice diary | Prototype: Gboard mic. App: Web Speech API (`hi-IN`); Sarvam Saaras v3 if accuracy is poor |
| Pedagogy | She chooses per lesson; plans favour low-cost activities, videos, worksheets and quizzes |

## School formats received
**Lesson plan** (landscape, one per chapter): header with school name and logo, session, chapter number and title, class.
- Columns: Key Competencies & Learning Outcomes | Teacher Activity | Student Activity | Teaching Aids / Resources
- Stages (rows): Pre-Classroom Activity | Introductory Activity | Class Activity/Creativity | Follow up Activity
- Currently handwritten, with hand-drawn diagrams and formulas

**Half Yearly Maths paper:** 80 marks, 3 hours, 38 questions.
- A: 15 x 1 (MCQ) = 15
- B: 10 x 2 = 20
- C: 7 x 3 = 21
- D: 6 x 4 = 24

**Chapter lists**
- Class 7 Book 2: Congruence (Geometric Twins); Operations on Integers; HCF and LCM; Multiplication and Division of Decimals; Connecting the Dots; Constructions and Tilings; Finding the Unknown.
- Second contents page (assumed Class 8 Book 2): Percentage and Its Applications; The Baudhayana-Pythagoras Theorem; Proportional Reasoning-2; Exploring Some Geometric Themes; Tales by Dots and Lines; Topics in Algebra; Area.
- Book 2 chapters follow NCERT Ganita Prakash Part 2 in the same order.

## Core workflow
1. **Plan:** chapter, then lesson plan in the school grid (reuse her old plans, optional AI draft), then print on A4 landscape.
2. **Teach and log:** a phone screen of today's periods, pre-filled from her timetable and lesson plan. She speaks or taps to log each period, checks the fields, and saves to the diary.
3. **Diary:** the week view is built automatically and exported in the school template. It flags periods not yet logged.
4. **Assess:** chapters marked as taught in the diary feed the paper builder. It fills the saved pattern from her question bank (optional AI suggestions) and generates a print-ready paper with answer key.

## Wireframe
https://claude.ai/artifact/KfaH1FsYKdfGN2k8jwDeuo (7 screens: Today, Voice log, Check and save, Chapters, Diary week, Paper builder, Lesson plan)

## Open questions (ask her)
1. Are typed or printed lesson plans accepted, or must they be handwritten? This decides the lesson plan feature.
2. Which class is the second contents page from?
3. Does the 80-mark pattern apply to Classes 6-8 and to Science? Is there internal choice?
4. Is Book 1 used for the half-yearly exam and Book 2 for the annual exam?
5. Is a blank lesson plan form available as a Word or PDF file?
6. Teaching diary: one entry per period, or a daily summary? Does it need a signature space?
7. When does she log entries (after class, staff room, or home)? This decides the offline needs.

## Still needed from her
- Book 1 contents pages (all classes) and Class 6 Book 2 contents
- Science textbook and chapter lists
- Unit test and annual exam patterns; question paper header and instructions
- Teaching diary format
- Exam calendar

## Suggested next steps
1. Get answers to the open questions and the missing formats.
2. Write a one-page spec covering the Sheets structure, Docs templates and Apps Script menu actions.
3. Build the Google Workspace prototype: Sheet tabs for Chapters, Plans, Diary, QuestionBank, Patterns and ClassNotes; Docs templates for the lesson plan and the paper; and Apps Script to generate PDFs.
4. Have her trial it for 2-3 weeks, then decide whether to build the PWA.

## Key sources
- NEP 2020: https://static.pib.gov.in/WriteReadData/userfiles/NEP_Final_English_0.pdf
- CBSE competency-based lesson plans: https://cbseacademic.nic.in/cbe/teacher-resources.html
- NCERT Ganita Prakash 7 Part II: https://ncert.nic.in/textbook/pdf/gegp2ps.pdf
- Shiksha Copilot study: https://arxiv.org/abs/2507.00456
- docxtpl: https://docxtpl.readthedocs.io/
- Apps Script PDF generation: https://developers.google.com/apps-script/samples/automations/generate-pdfs
- Sarvam STT: https://docs.sarvam.ai/api-reference-docs/models/saaras

## Repository layout (added 3 Oct 2026)
- `CLAUDE.md`: this handoff file, kept as received. Edit the sections above when decisions change.
- `docs/wireframe/project/`: the 7 wireframe screens exported from the Claude artifact (`*.dc.html`, index in `canvas.json`). Source of truth stays the artifact link above; these copies are a snapshot from 3 Oct 2026. They render only in the Design canvas, not in a plain browser.
- `prototype/paper-builder/`: first working prototype, covering only the **Assess** step (exam and mid-term question papers). See its README.

## Prototype status
- Paper builder runs in any browser with no install (open `prototype/paper-builder/index.html`).
- Question bank in the prototype is **sample data written for demonstration**, not taken from R S Aggarwal. Replace it with her own questions (CSV import, same columns as the planned `QuestionBank` Sheet tab).
- Exam patterns: only the Half Yearly Maths 80-mark pattern comes from a real school paper. Everything else is a placeholder flagged in the UI until open questions 3 and 4 are answered.
- Not built yet: Hindi question text, Science chapters, Book 1 chapters, Word template (`{{placeholders}}`) export, Apps Script version, AI suggestions.
