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

// type: mcq = objective with 4 options; marks per question in each section
window.PATTERNS = [
  {
    id: "half-yearly", name: "Half Yearly", time: "3 hours", confirmed: true,
    note: "From the Half Yearly Maths paper received (80 marks, 38 questions). Whether it applies to Classes 6-8 and Science is still to be confirmed.",
    sections: [
      { name: "A", kind: "mcq", count: 15, marks: 1 },
      { name: "B", kind: "short", count: 10, marks: 2 },
      { name: "C", kind: "short", count: 7, marks: 3 },
      { name: "D", kind: "long", count: 6, marks: 4 }
    ]
  },
  {
    id: "unit-test", name: "Unit / Mid-term Test", time: "1 hour", confirmed: false,
    note: "PLACEHOLDER pattern (20 marks). Replace with her real unit test pattern.",
    sections: [
      { name: "A", kind: "mcq", count: 4, marks: 1 },
      { name: "B", kind: "short", count: 3, marks: 2 },
      { name: "C", kind: "short", count: 2, marks: 3 },
      { name: "D", kind: "long", count: 1, marks: 4 }
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
