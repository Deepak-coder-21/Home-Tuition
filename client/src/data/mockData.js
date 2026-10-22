// Domain Constants & Metadata Categories for VidyaNest Home Tutor Discovery Platform

export const SUBJECTS_LIST = [
  // Primary & General Subjects
  "All Primary Subjects (Class 1 - 5 General: Maths, English, EVS, Hindi)",
  "All Middle School Subjects (Class 6 - 8 General)",
  "Environmental Studies (EVS)",
  "Handwriting, Phonics & Reading",
  "General Science",
  "Social Studies / Social Science",

  // Core Secondary & Senior Subjects
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English Literature & Grammar",
  "Computer Science & Python Coding",
  "Economics",
  "Accountancy & Commerce",
  "Business Studies",
  "Social Science / History / Civics",
  "Hindi Language & Literature",
  "Sanskrit Language",
  "French Language",
  "German Language",
  "Vedic Maths & Abacus"
];

export const CLASSES_LIST = [
  "Class 1 - 5 (Primary)",
  "Class 6 - 8 (Middle)",
  "Class 9 - 10 (Secondary)",
  "Class 11 - 12 (Senior Secondary)",
  "JEE / NEET Foundation",
  "College / Degree",
  "Competitive / Olympiad Prep"
];

export const BOARDS_LIST = [
  "CBSE",
  "ICSE / ISC",
  "State Board",
  "IB (International Baccalaureate)",
  "Cambridge (IGCSE)"
];

export const TEACHING_MODES = [
  { id: "home_visit", label: "Home Visit (Student's Home)", icon: "Home" },
  { id: "online", label: "Online 1-on-1", icon: "Video" },
  { id: "tutor_place", label: "At Tutor's Residence", icon: "Building" }
];

export const QUALIFICATIONS_CATEGORIES = [
  {
    category: "Primary Education & Teacher Training",
    options: [
      "D.El.Ed / D.Ed (Diploma in Elementary Education)",
      "NTT (Nursery Teacher Training) / ECCE Certified",
      "Montessori Certified Primary Educator",
      "CTET / State TET Qualified Primary Teacher",
      "Primary School Teacher (CBSE/ICSE School)",
      "College Student / Peer Tutor (Undergraduate)"
    ]
  },
  {
    category: "10+2 / Intermediate (By Stream)",
    options: [
      "Intermediate / 10+2 (Science: PCM - Physics, Chem, Maths)",
      "Intermediate / 10+2 (Science: PCB - Physics, Chem, Biology)",
      "Intermediate / 10+2 (Science: PCMB)",
      "Intermediate / 10+2 (Commerce with Maths)",
      "Intermediate / 10+2 (Commerce without Maths)",
      "Intermediate / 10+2 (Arts / Humanities)"
    ]
  },
  {
    category: "Bachelor Degrees",
    options: [
      "B.Tech / B.E. (Computer Science & IT)",
      "B.Tech / B.E. (Mechanical / Civil / Electrical / ECE)",
      "B.Sc (Mathematics / Statistics)",
      "B.Sc (Physics / Chemistry)",
      "B.Sc (Biology / Life Sciences / Biotechnology)",
      "B.Sc (Computer Science / IT)",
      "B.Ed (Bachelor of Education)",
      "B.Com / B.Com (Honours)",
      "B.A. (English Literature / Linguistics)",
      "B.A. (Economics / Mathematics)",
      "B.A. (History / Political Science / Psychology)",
      "BCA (Bachelor of Computer Applications)",
      "BBA / BMS (Business Administration)",
      "MBBS / BDS (Medical Sciences)",
      "LLB (Law)"
    ]
  },
  {
    category: "Master Degrees & Post-Graduation",
    options: [
      "M.Sc (Mathematics / Applied Maths)",
      "M.Sc (Physics / Applied Physics)",
      "M.Sc (Chemistry - Organic / Physical / Inorganic)",
      "M.Sc (Biology / Zoology / Botany / Biotech)",
      "M.Sc (Computer Science / Data Science)",
      "M.Tech / M.E. (Engineering)",
      "M.Ed (Master of Education)",
      "M.Com (Finance / Accounting)",
      "M.A. (English Literature)",
      "M.A. (Economics)",
      "M.A. (Psychology / History / Political Science)",
      "MCA (Master of Computer Applications)",
      "MBA / PGDM",
      "Ph.D. / Research Scholar (Doctorate)"
    ]
  },
  {
    category: "Professional & Specialized Certifications",
    options: [
      "Chartered Accountant (CA) / CA Inter",
      "CS (Company Secretary) / CMA",
      "UGC-NET / JRF Qualified Assistant Professor",
      "Language Certified (DELF / Goethe / JLPT)"
    ]
  }
];

export const QUALIFICATIONS_LIST = QUALIFICATIONS_CATEGORIES.flatMap(c => c.options);

// Production fallbacks (empty arrays - all data is loaded live from MongoDB)
export const INITIAL_TUTORS = [];
export const INITIAL_INQUIRIES = [];
