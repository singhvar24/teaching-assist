# Question paper builder (prototype)

Covers the **Assess** step of the workflow in `CLAUDE.md`: build an exam or mid-term paper with an answer key from a question bank.

## Run
Open `index.html` in any browser. No install, no server, works offline. Needs the browser to print to PDF (Print, then "Save as PDF").

## What it does
1. Pick class, subject and exam pattern, then tick the chapters taught.
2. Edit the number of questions per section if the pattern differs.
3. **Generate** fills each section from the bank, spreading questions evenly across ticked chapters, with no repeats.
4. **Replace this question** swaps one question for another unused one (same chapter when possible).
5. The **Answer key** tab shows the same paper with answers. **Print (A4)** prints whichever tab is open.
6. The **Question bank** tab lets her add questions, delete her own, and import or export CSV.
7. If the bank cannot fill a section, the paper shows a clear gap and says how many questions are missing, rather than inventing questions.

## Data
- `data.js`: chapter lists, exam patterns and the **sample** question bank (49 Class 7 Maths questions written for demonstration; not from R S Aggarwal; check before real use).
- Questions she adds are stored in the browser (`localStorage`) on that device only. Use Export CSV to back them up.
- CSV columns: `id, class, subject, chapter, marks, text, optA, optB, optC, optD, answer`. All four options filled means an MCQ. These match the planned `QuestionBank` Sheet tab, so the same data can move to the Google Workspace version.

## Known limits (prototype)
- Half Yearly pattern is real (80 marks, 38 questions). The Unit/Mid-term pattern is a **placeholder**.
- Only Class 7 and Class 8 Maths chapters are listed; Class 8 is an assumption. No Science or Class 6 chapters yet.
- English only. No internal choice, no Word template export, no AI suggestions, no diary link (chapters are ticked by hand).
- Maths is typed as plain text (for example `x/3`, `½`, `△ABC`). Diagrams are not supported yet.
