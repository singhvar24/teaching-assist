// Seed data for the paper builder prototype.
// SAMPLE ONLY: questions are written for demonstration and are not from R S Aggarwal.
// Shapes mirror the planned Google Sheet tabs (Chapters, Patterns, QuestionBank).

window.CHAPTERS = {
  // key: "<class>-<subject>"; confirmed=false means the class is assumed (open question 2)
  "7-Maths": {
    book: "R S Aggarwal Book 2", confirmed: true,
    list: [
      [1, "Congruence (Geometric Twins)"], [2, "Operations on Integers"], [3, "HCF and LCM"],
      [4, "Multiplication and Division of Decimals"], [5, "Connecting the Dots"],
      [6, "Constructions and Tilings"], [7, "Finding the Unknown"]
    ]
  },
  "8-Maths": {
    book: "R S Aggarwal Book 2", confirmed: false,
    list: [
      [1, "Percentage and Its Applications"], [2, "The Baudhayana-Pythagoras Theorem"],
      [3, "Proportional Reasoning-2"], [4, "Exploring Some Geometric Themes"],
      [5, "Tales by Dots and Lines"], [6, "Topics in Algebra"], [7, "Area"]
    ]
  }
};

// kind: mcq = objective with 4 options, short/long = written. heading and instruction are optional per-section text.
window.PATTERNS = [
  {
    id: "half-yearly", name: "Half Yearly", time: "3 hours", confirmed: true,
    note: "From the Half Yearly Maths paper received (80 marks, 38 questions). Whether it applies to Classes 6-8 and Science is still to be confirmed.",
    sections: [
      { name: "A", kind: "mcq", count: 15, marks: 1, heading: "", instruction: "" },
      { name: "B", kind: "short", count: 10, marks: 2, heading: "", instruction: "" },
      { name: "C", kind: "short", count: 7, marks: 3, heading: "", instruction: "" },
      { name: "D", kind: "long", count: 6, marks: 4, heading: "", instruction: "" }
    ]
  },
  {
    id: "unit-test", name: "Unit / Mid-term Test", time: "1 hour", confirmed: false,
    note: "PLACEHOLDER pattern (20 marks). Replace with her real unit test pattern.",
    sections: [
      { name: "A", kind: "mcq", count: 4, marks: 1, heading: "", instruction: "" },
      { name: "B", kind: "short", count: 3, marks: 2, heading: "", instruction: "" },
      { name: "C", kind: "short", count: 2, marks: 3, heading: "", instruction: "" },
      { name: "D", kind: "long", count: 1, marks: 4, heading: "", instruction: "" }
    ]
  },
  {
    id: "custom", name: "Custom", time: "", confirmed: false,
    note: "Your own pattern. Add, remove and rename sections below.",
    sections: [
      { name: "A", kind: "mcq", count: 5, marks: 1, heading: "", instruction: "" },
      { name: "B", kind: "short", count: 5, marks: 2, heading: "", instruction: "" }
    ]
  }
];

const Q = (ch, marks, text, ans, opts) => ({
  cls: 7, subject: "Maths", chapter: ch, marks, text, answer: ans,
  type: opts ? "mcq" : "written", opts: opts || [], source: "sample", id: ""
});

window.SAMPLE_BANK = [
  // Ch 1 Congruence
  Q(1, 1, "Two figures having exactly the same shape and size are called", "(b) congruent", ["similar", "congruent", "equal", "parallel"]),
  Q(1, 1, "If △ABC ≅ △PQR, then side AB corresponds to", "(c) PQ", ["PR", "QR", "PQ", "BC"]),
  Q(1, 1, "Which of these is NOT a rule for congruence of triangles?", "(d) AAA", ["SSS", "SAS", "ASA", "AAA"]),
  Q(1, 2, "State the SAS congruence rule.", "Two triangles are congruent if two sides and the angle included between them in one triangle are equal to the corresponding two sides and included angle of the other."),
  Q(1, 3, "In △ABC and △PQR, AB = PQ = 5 cm, BC = QR = 6 cm and ∠B = ∠Q = 50°. Are the triangles congruent? Give the rule.", "Yes. Two sides and the included angle are equal, so △ABC ≅ △PQR by the SAS rule."),
  Q(1, 4, "In △ABC and △DEF, ∠A = ∠D = 40°, ∠B = ∠E = 60° and AB = DE = 7 cm. Show that the triangles are congruent and find ∠C and ∠F.", "Two angles and the included side are equal, so △ABC ≅ △DEF by ASA. ∠C = 180° − 40° − 60° = 80°, so ∠F = 80°."),
  // Ch 2 Integers
  Q(2, 1, "(−7) + (−5) =", "(a) −12", ["−12", "−2", "12", "2"]),
  Q(2, 1, "(−6) × (−4) =", "(c) 24", ["−24", "−10", "24", "10"]),
  Q(2, 1, "(−36) ÷ 9 =", "(b) −4", ["4", "−4", "−27", "27"]),
  Q(2, 1, "15 − (−8) =", "(d) 23", ["7", "−7", "−23", "23"]),
  Q(2, 2, "Evaluate: (−9) × (+6).", "−54"),
  Q(2, 2, "Simplify: −12 + 18 − 5.", "1"),
  Q(2, 3, "Evaluate: (−8) × (−5) + (−20) ÷ 4.", "40 + (−5) = 35"),
  Q(2, 3, "The temperature at 6 a.m. is 5°C and falls by 3°C every hour. What is the temperature 4 hours later?", "5 − 3 × 4 = 5 − 12 = −7°C"),
  Q(2, 4, "Evaluate: [(−48) ÷ 6] × (−3) + 15 − (−9).", "(−8) × (−3) = 24; 24 + 15 = 39; 39 + 9 = 48"),
  Q(2, 4, "A shopkeeper gains ₹7 on each pen and loses ₹3 on each pencil. He sells 12 pens and 15 pencils. Find his net gain or loss.", "Gain 7 × 12 = ₹84; loss 3 × 15 = ₹45; net gain = ₹39"),
  // Ch 3 HCF and LCM
  Q(3, 1, "The HCF of 12 and 18 is", "(b) 6", ["3", "6", "12", "36"]),
  Q(3, 1, "The LCM of 4 and 6 is", "(c) 12", ["2", "24", "12", "10"]),
  Q(3, 1, "The HCF of two co-prime numbers is", "(a) 1", ["1", "0", "the smaller number", "their product"]),
  Q(3, 1, "The product of two numbers is 120 and their HCF is 4. Their LCM is", "(d) 30", ["4", "24", "480", "30"]),
  Q(3, 2, "Find the HCF of 36 and 48 by prime factorisation.", "36 = 2²×3², 48 = 2⁴×3; HCF = 2²×3 = 12"),
  Q(3, 2, "Find the LCM of 15 and 20.", "60"),
  Q(3, 3, "Find the LCM of 12, 18 and 24.", "72"),
  Q(3, 3, "Find the HCF of 84 and 126 by the division method.", "126 = 84×1 + 42; 84 = 42×2 + 0; HCF = 42"),
  Q(3, 4, "Three bells ring every 12, 15 and 20 minutes. They ring together at 8:00 a.m. When will they next ring together?", "LCM(12, 15, 20) = 60 minutes, so at 9:00 a.m."),
  Q(3, 4, "Find the greatest length of a tape that can measure exactly 90 cm, 150 cm and 210 cm.", "HCF(90, 150, 210) = 30 cm"),
  // Ch 4 Decimals
  Q(4, 1, "0.3 × 0.4 =", "(b) 0.12", ["1.2", "0.12", "0.012", "12"]),
  Q(4, 1, "4.5 ÷ 0.5 =", "(c) 9", ["0.9", "90", "9", "2.25"]),
  Q(4, 1, "0.06 ÷ 0.3 =", "(a) 0.2", ["0.2", "2", "0.02", "20"]),
  Q(4, 1, "2.5 × 10 =", "(d) 25", ["0.25", "2.50", "250", "25"]),
  Q(4, 2, "Find the product: 1.2 × 0.05.", "0.06"),
  Q(4, 2, "Divide: 7.2 ÷ 0.8.", "9"),
  Q(4, 3, "One metre of cloth costs ₹45.50. Find the cost of 3.5 m.", "45.50 × 3.5 = ₹159.25"),
  Q(4, 3, "Evaluate: 12.6 ÷ 0.07.", "180"),
  Q(4, 4, "A car runs 14.4 km on 1.2 litres of petrol. How far will it run on 5.5 litres?", "14.4 ÷ 1.2 = 12 km per litre; 12 × 5.5 = 66 km"),
  Q(4, 4, "A rope 18.75 m long is cut into pieces of 1.25 m each. How many pieces are there?", "18.75 ÷ 1.25 = 15 pieces"),
  // Ch 6 Constructions
  Q(6, 1, "The sum of the three angles of a triangle is", "(b) 180°", ["90°", "180°", "270°", "360°"]),
  Q(6, 1, "A triangle cannot be drawn with sides", "(d) 3 cm, 4 cm, 8 cm", ["3 cm, 4 cm, 5 cm", "5 cm, 5 cm, 5 cm", "4 cm, 6 cm, 9 cm", "3 cm, 4 cm, 8 cm"]),
  Q(6, 2, "State the triangle inequality.", "The sum of any two sides of a triangle is greater than the third side."),
  Q(6, 3, "Construct a triangle with sides 4 cm, 5 cm and 6 cm. Write the steps.", "Draw BC = 6 cm. With B as centre and radius 4 cm, draw an arc. With C as centre and radius 5 cm, draw another arc cutting the first at A. Join AB and AC."),
  // Ch 7 Finding the Unknown
  Q(7, 1, "If x + 7 = 15, then x =", "(a) 8", ["8", "22", "7", "−8"]),
  Q(7, 1, "If 3x = 21, then x =", "(c) 7", ["63", "18", "7", "24"]),
  Q(7, 1, "If 2x − 3 = 9, then x =", "(b) 6", ["3", "6", "12", "9"]),
  Q(7, 2, "Solve: 5x − 4 = 16.", "5x = 20, so x = 4"),
  Q(7, 2, "Solve: x/3 + 2 = 6.", "x/3 = 4, so x = 12"),
  Q(7, 3, "Solve: 3(x − 2) = 2x + 5.", "3x − 6 = 2x + 5, so x = 11"),
  Q(7, 3, "The sum of two consecutive numbers is 37. Find the numbers.", "x + (x + 1) = 37, so x = 18; the numbers are 18 and 19"),
  Q(7, 4, "A father is three times as old as his son. The sum of their ages is 56 years. Find their ages.", "x + 3x = 56, so x = 14; son 14 years, father 42 years"),
  Q(7, 4, "The perimeter of a rectangle is 52 cm. Its length is 6 cm more than its breadth. Find its length and breadth.", "2(b + b + 6) = 52, so b = 10; breadth 10 cm, length 16 cm")
].map((q, i) => (q.id = "S" + String(i + 1).padStart(3, "0"), q));

// Worked solutions for the sample questions: [work, reason, marks]. Step marks add up to the question marks.
// Questions without an entry here are split into steps automatically from their answer text.
window.SAMPLE_SOLUTIONS = [
  ["In △ABC and △PQR, AB = PQ", [["AB = PQ = 5 cm and BC = QR = 6 cm", "two sides equal", 1], ["∠B = ∠Q = 50°, the angle included between these sides", "included angles equal", 1], ["∴ △ABC ≅ △PQR", "SAS rule", 1]], "Yes, the triangles are congruent by the SAS rule."],
  ["In △ABC and △DEF, ∠A", [["∠A = ∠D = 40° and ∠B = ∠E = 60°", "given", 1], ["AB = DE = 7 cm, the side between ∠A and ∠B", "included side equal", 1], ["∴ △ABC ≅ △DEF", "ASA rule", 1], ["∠C = 180° − 40° − 60° = 80°, so ∠F = ∠C = 80°", "angle sum; corresponding parts", 1]], "△ABC ≅ △DEF by ASA; ∠C = ∠F = 80°."],
  ["Evaluate: (−8) × (−5)", [["(−8) × (−5) = 40", "negative × negative = positive", 1], ["(−20) ÷ 4 = −5", "negative ÷ positive = negative", 1], ["40 + (−5) = 35", "", 1]], "35"],
  ["The temperature at 6 a.m.", [["Fall in 4 hours = 3 × 4 = 12°C", "", 1], ["Temperature = 5 − 12", "", 1], ["= −7°C", "", 1]], "−7°C"],
  ["Evaluate: [(−48) ÷ 6]", [["(−48) ÷ 6 = −8", "", 1], ["(−8) × (−3) = 24", "", 1], ["24 + 15 = 39", "", 1], ["39 − (−9) = 39 + 9 = 48", "subtracting a negative = adding", 1]], "48"],
  ["A shopkeeper gains", [["Gain on 12 pens = 7 × 12 = ₹84", "", 1], ["Loss on 15 pencils = 3 × 15 = ₹45", "", 1], ["Net = 84 − 45", "", 1], ["= ₹39 gain", "", 1]], "Net gain of ₹39."],
  ["Find the LCM of 12, 18 and 24.", [["12 = 2² × 3, 18 = 2 × 3², 24 = 2³ × 3", "prime factorisation", 1], ["Highest powers: 2³ and 3²", "", 1], ["LCM = 8 × 9 = 72", "", 1]], "72"],
  ["Find the HCF of 84 and 126", [["126 = 84 × 1 + 42", "divide the larger by the smaller", 1], ["84 = 42 × 2 + 0", "remainder is 0", 1], ["HCF = last divisor = 42", "", 1]], "42"],
  ["Three bells ring", [["Bells ring together after the LCM of 12, 15 and 20 minutes", "", 1], ["12 = 2² × 3, 15 = 3 × 5, 20 = 2² × 5", "prime factorisation", 1], ["LCM = 2² × 3 × 5 = 60 minutes", "", 1], ["8:00 a.m. + 60 minutes = 9:00 a.m.", "", 1]], "They next ring together at 9:00 a.m."],
  ["Find the greatest length of a tape", [["Greatest length = HCF of 90, 150 and 210", "", 1], ["90 = 2 × 3² × 5, 150 = 2 × 3 × 5², 210 = 2 × 3 × 5 × 7", "prime factorisation", 1], ["Common factors: 2 × 3 × 5", "", 1], ["HCF = 30", "", 1]], "30 cm"],
  ["One metre of cloth costs", [["Cost of 3.5 m = 45.50 × 3.5", "", 1], ["4550 × 35 = 159250", "ignore the decimal points", 1], ["Three decimal places in all: 159.250 = ₹159.25", "", 1]], "₹159.25"],
  ["Evaluate: 12.6 ÷ 0.07.", [["Multiply both numbers by 100", "to remove the decimal in the divisor", 1], ["12.6 ÷ 0.07 = 1260 ÷ 7", "", 1], ["= 180", "", 1]], "180"],
  ["A car runs 14.4 km", [["Distance per litre = 14.4 ÷ 1.2", "", 1], ["= 144 ÷ 12 = 12 km", "", 1], ["Distance on 5.5 litres = 12 × 5.5", "", 1], ["= 66 km", "", 1]], "66 km"],
  ["A rope 18.75 m long", [["Number of pieces = 18.75 ÷ 1.25", "", 1], ["= 1875 ÷ 125", "multiply both by 100", 1], ["125 × 15 = 1875", "", 1], ["So there are 15 pieces", "", 1]], "15 pieces"],
  ["Construct a triangle with sides", [["Draw BC = 6 cm", "", 1], ["With B as centre, radius 4 cm, draw an arc; with C as centre, radius 5 cm, draw another arc meeting it at A", "", 1], ["Join AB and AC. △ABC is the required triangle", "", 1]], "△ABC with sides 4 cm, 5 cm and 6 cm."],
  ["Solve: 3(x − 2)", [["3x − 6 = 2x + 5", "expand the bracket", 1], ["3x − 2x = 5 + 6", "transpose terms", 1], ["x = 11", "", 1]], "x = 11"],
  ["The sum of two consecutive numbers", [["Let the numbers be x and x + 1", "", 1], ["x + (x + 1) = 37, so 2x = 36", "", 1], ["x = 18; the numbers are 18 and 19", "", 1]], "18 and 19"],
  ["A father is three times", [["Let the son's age be x years; father's age = 3x", "", 1], ["x + 3x = 56", "", 1], ["4x = 56, so x = 14", "", 1], ["Son = 14 years, father = 3 × 14 = 42 years", "", 1]], "Son 14 years, father 42 years"],
  ["The perimeter of a rectangle", [["Let the breadth be b cm; length = (b + 6) cm", "", 1], ["2(b + b + 6) = 52", "perimeter = 2(l + b)", 1], ["2b + 6 = 26, so b = 10", "", 1], ["Breadth = 10 cm, length = 10 + 6 = 16 cm", "", 1]], "Breadth 10 cm, length 16 cm"]
];
window.SAMPLE_SOLUTIONS.forEach(([start, steps, fin]) => {
  const q = window.SAMPLE_BANK.find((x) => x.text.startsWith(start));
  if (!q) throw new Error("No sample question starts with: " + start);
  const sum = steps.reduce((t, s) => t + s[2], 0);
  if (sum !== q.marks) throw new Error("Step marks " + sum + " != " + q.marks + " for: " + start);
  q.steps = steps.map(([work, reason, marks]) => ({ work, reason, marks }));
  q.answer = fin;
});
