import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import TutorProfile from './models/TutorProfile.js';
import Inquiry from './models/Inquiry.js';
import Review from './models/Review.js';
import { connectDB } from './config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await TutorProfile.deleteMany();
    await Inquiry.deleteMany();
    await Review.deleteMany();

    console.log('Seeding administrative and student users...');
    // 1. Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@vidyanest.com').toLowerCase().trim();
    const adminUser = await User.create({
      name: 'VidyaNest Admin',
      email: adminEmail,
      password: 'adminpassword',
      role: 'admin',
      phone: '+91 (011) 4567-8900',
      city: 'New Delhi'
    });

    // 2. Student / Parent Users
    const studentUser1 = await User.create({
      name: 'Vikram Verma',
      email: 'student@vidyanest.com',
      password: 'password123',
      role: 'student',
      phone: '+91 98112 34567',
      state: 'Delhi NCR',
      city: 'New Delhi',
      locality: 'Greater Kailash II',
      houseLocation: 'Flat 402, Block B, Silver Oak Apartments',
      studentName: 'Arjun Verma',
      studentGrade: 'Class 11 - 12 (Senior Secondary)',
      board: 'CBSE'
    });

    const studentUser2 = await User.create({
      name: 'Priya Nair',
      email: 'priya.nair@gmail.com',
      password: 'password123',
      role: 'student',
      phone: '+91 98450 12345',
      state: 'Karnataka',
      city: 'Bengaluru',
      locality: 'Whitefield',
      houseLocation: 'Villa 18, Palm Meadows',
      studentName: 'Ananya Nair',
      studentGrade: 'Class 9 - 10 (Secondary)',
      board: 'ICSE / ISC'
    });

    const studentUser3 = await User.create({
      name: 'Rajesh Kulkarni',
      email: 'rajesh.kulkarni@yahoo.com',
      password: 'password123',
      role: 'student',
      phone: '+91 97654 98765',
      state: 'Maharashtra',
      city: 'Pune',
      locality: 'Kothrud',
      houseLocation: 'Bungalow 4, Mayur Colony',
      studentName: 'Rohan Kulkarni',
      studentGrade: 'Class 6 - 8 (Middle)',
      board: 'State Board'
    });

    console.log('Seeding tutor users...');
    // 3. Tutor User 1 - Dr. Rajesh Sharma
    const tutorUser1 = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'tutor@vidyanest.com',
      password: 'password123',
      role: 'tutor',
      phone: '+91 98711 54321',
      state: 'Delhi NCR',
      city: 'New Delhi',
      locality: 'South Extension'
    });

    // 4. Tutor User 2 - Pooja Venkatesh
    const tutorUser2 = await User.create({
      name: 'Pooja Venkatesh',
      email: 'pooja.v@example.com',
      password: 'password123',
      role: 'tutor',
      phone: '+91 99011 33445',
      state: 'Karnataka',
      city: 'Bengaluru',
      locality: 'Koramangala'
    });

    // 5. Tutor User 3 - Amitabh Banerjee
    const tutorUser3 = await User.create({
      name: 'Amitabh Banerjee',
      email: 'amitabh.b@example.com',
      password: 'password123',
      role: 'tutor',
      phone: '+91 98301 22334',
      state: 'West Bengal',
      city: 'Kolkata',
      locality: 'Salt Lake'
    });

    // 6. Tutor User 4 - Sneha Kulkarni
    const tutorUser4 = await User.create({
      name: 'Sneha Kulkarni',
      email: 'sneha.k@example.com',
      password: 'password123',
      role: 'tutor',
      phone: '+91 98220 55667',
      state: 'Maharashtra',
      city: 'Pune',
      locality: 'Kothrud'
    });

    // 7. Tutor User 5 - Farhan Siddiqui
    const tutorUser5 = await User.create({
      name: 'Farhan Siddiqui',
      email: 'farhan.s@example.com',
      password: 'password123',
      role: 'tutor',
      phone: '+91 98200 99881',
      state: 'Maharashtra',
      city: 'Mumbai',
      locality: 'Bandra West'
    });

    // 8. Tutor User 6 - Sunayana Roy (Pending verification for admin audit demo)
    const tutorUser6 = await User.create({
      name: 'Sunayana Roy',
      email: 'sunayana@example.com',
      password: 'password123',
      role: 'tutor',
      phone: '+91 98111 22334',
      state: 'Delhi NCR',
      city: 'Noida',
      locality: 'Sector 62'
    });

    console.log('Seeding tutor profiles...');
    // Profile 1: Dr. Rajesh Sharma
    const tutorProfile1 = await TutorProfile.create({
      user: tutorUser1._id,
      name: tutorUser1.name,
      tagline: 'Ex-Delhi Public School Senior Physics Faculty & IIT-JEE Mentor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 42,
      experienceYears: 14,
      qualification: 'Ph.D. in Physics, M.Sc (Delhi University), B.Ed',
      isVerified: true,
      verificationDetails: {
        idProof: 'Aadhaar Card Verified',
        degreeProof: 'DU Masters & Ph.D. Verified',
        addressProof: 'Electricity Bill Verified',
        verifiedAt: new Date('2025-11-10')
      },
      verificationDocuments: [
        {
          id: 'doc-sharma-1',
          docType: 'id_proof',
          docName: 'Aadhaar_Card_Dr_Rajesh.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-11-09'),
          status: 'approved'
        },
        {
          id: 'doc-sharma-2',
          docType: 'degree_certificate',
          docName: 'DU_PhD_Physics_Degree.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-11-09'),
          status: 'approved'
        },
        {
          id: 'doc-sharma-3',
          docType: 'address_proof',
          docName: 'Electricity_Bill_South_Ex_Delhi.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-11-09'),
          status: 'approved'
        }
      ],
      location: {
        state: 'Delhi NCR',
        city: 'New Delhi',
        localities: ['South Extension', 'Hauz Khas', 'Lajpat Nagar', 'Saket', 'Greater Kailash'],
        pincodes: ['110049', '110016', '110024', '110017', '110048']
      },
      modes: ['home_visit', 'online', 'tutor_place'],
      subjects: ['Physics', 'Mathematics'],
      classes: ['Class 9 - 10 (Secondary)', 'Class 11 - 12 (Senior Secondary)', 'JEE / NEET Foundation'],
      boards: ['CBSE', 'ICSE / ISC', 'Cambridge (IGCSE)'],
      rates: {
        hourly: 900,
        monthly: 9500
      },
      bio: 'Passionate educator with 14+ years of dedicated teaching experience in CBSE & competitive physics. My pedagogy emphasizes conceptual understanding from first principles followed by problem-solving drills. I have mentored over 150+ students into top engineering and medical colleges.',
      achievements: [
        'Mentored AIR 412 in JEE Advanced 2024',
        'Former HOD Physics at prestigious Delhi school',
        "Published author of 'Conceptual Physics Problems for Secondary Students'"
      ]
    });

    // Profile 2: Pooja Venkatesh
    const tutorProfile2 = await TutorProfile.create({
      user: tutorUser2._id,
      name: tutorUser2.name,
      tagline: 'Vedic & Modern Mathematics Specialist for ICSE & Cambridge',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviewCount: 36,
      experienceYears: 9,
      qualification: 'M.Sc Mathematics (IIT Madras), B.Sc (Hons)',
      isVerified: true,
      verificationDetails: {
        idProof: 'Passport Verified',
        degreeProof: 'IIT Madras Certificate Verified',
        addressProof: 'Aadhaar Verified',
        verifiedAt: new Date('2025-10-15')
      },
      verificationDocuments: [
        {
          id: 'doc-pooja-1',
          docType: 'id_proof',
          docName: 'Indian_Passport_Pooja_Venkatesh.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-10-14'),
          status: 'approved'
        },
        {
          id: 'doc-pooja-2',
          docType: 'degree_certificate',
          docName: 'IIT_Madras_MSc_Maths_Certificate.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-10-14'),
          status: 'approved'
        },
        {
          id: 'doc-pooja-3',
          docType: 'address_proof',
          docName: 'Bengaluru_Electricity_Bill_Koramangala.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-10-14'),
          status: 'approved'
        }
      ],
      location: {
        state: 'Karnataka',
        city: 'Bengaluru',
        localities: ['Koramangala', 'Indiranagar', 'HSR Layout', 'BTM Layout', 'Jayanagar'],
        pincodes: ['560034', '560038', '560102', '560068', '560041']
      },
      modes: ['home_visit', 'online'],
      subjects: ['Mathematics', 'Vedic Maths & Abacus'],
      classes: ['Class 6 - 8 (Middle)', 'Class 9 - 10 (Secondary)', 'Class 11 - 12 (Senior Secondary)'],
      boards: ['ICSE / ISC', 'CBSE', 'IB (International Baccalaureate)', 'Cambridge (IGCSE)'],
      rates: {
        hourly: 750,
        monthly: 8000
      },
      bio: "Mathematics doesn't need to be intimidating. I blend Vedic mental maths speed techniques with rigorous syllabus coverage. I specialize in turning around students who struggle with math anxiety and algebra fundamentals.",
      achievements: [
        '100% pass rate with 85%+ distinction across all board candidates',
        'Gold medalist in State Mathematical Olympiad (2015)',
        'Conducted 50+ math workshops for international school students'
      ]
    });

    // Profile 3: Amitabh Banerjee
    const tutorProfile3 = await TutorProfile.create({
      user: tutorUser3._id,
      name: tutorUser3.name,
      tagline: 'Organic & Physical Chemistry Specialist | NEET & Board Rank Maker',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 51,
      experienceYears: 12,
      qualification: 'M.Tech Chemical Engineering (Jadavpur Univ), B.Tech',
      isVerified: true,
      verificationDetails: {
        idProof: 'Voter ID Verified',
        degreeProof: 'University Transcript Verified',
        addressProof: 'Aadhaar Verified',
        verifiedAt: new Date('2025-09-02')
      },
      verificationDocuments: [
        {
          id: 'doc-banerjee-1',
          docType: 'id_proof',
          docName: 'Government_Voter_ID_Card.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-09-01'),
          status: 'approved'
        },
        {
          id: 'doc-banerjee-2',
          docType: 'degree_certificate',
          docName: 'Jadavpur_University_MTech_Degree.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-09-01'),
          status: 'approved'
        },
        {
          id: 'doc-banerjee-3',
          docType: 'address_proof',
          docName: 'Kolkata_Salt_Lake_Aadhaar_Proof.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-09-01'),
          status: 'approved'
        }
      ],
      location: {
        state: 'West Bengal',
        city: 'Kolkata',
        localities: ['Salt Lake', 'New Town', 'Ballygunge', 'Park Street', 'Dum Dum'],
        pincodes: ['700064', '700156', '700019', '700016', '700028']
      },
      modes: ['home_visit', 'tutor_place', 'online'],
      subjects: ['Chemistry', 'Biology'],
      classes: ['Class 9 - 10 (Secondary)', 'Class 11 - 12 (Senior Secondary)', 'JEE / NEET Foundation'],
      boards: ['CBSE', 'ICSE / ISC', 'State Board'],
      rates: {
        hourly: 650,
        monthly: 7000
      },
      bio: 'Chemistry is easy when reaction mechanisms and periodic trends are visualized rather than rote-memorized. I use molecular 3D model kits during home sessions to make chemical bonding crystal clear.',
      achievements: [
        '12 students qualified NEET 2024 with 150+ in Chemistry',
        'Regular guest lecturer on Applied Chemistry'
      ]
    });

    // Profile 4: Sneha Kulkarni
    const tutorProfile4 = await TutorProfile.create({
      user: tutorUser4._id,
      name: tutorUser4.name,
      tagline: 'Coding, Python & Computer Science Educator for Young Minds',
      avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80',
      rating: 4.7,
      reviewCount: 29,
      experienceYears: 7,
      qualification: 'B.Tech Computer Science (Pune University)',
      isVerified: true,
      verificationDetails: {
        idProof: 'Aadhaar Verified',
        degreeProof: 'Degree Certificate Verified',
        addressProof: 'Bank Statement Verified',
        verifiedAt: new Date('2025-12-01')
      },
      verificationDocuments: [
        {
          id: 'doc-kulkarni-1',
          docType: 'id_proof',
          docName: 'Aadhaar_National_ID_Sneha.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-11-28'),
          status: 'approved'
        },
        {
          id: 'doc-kulkarni-2',
          docType: 'degree_certificate',
          docName: 'Pune_University_BTech_CS_Degree.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-11-28'),
          status: 'approved'
        },
        {
          id: 'doc-kulkarni-3',
          docType: 'address_proof',
          docName: 'Pune_Residential_Address_Statement.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-11-28'),
          status: 'approved'
        }
      ],
      location: {
        state: 'Maharashtra',
        city: 'Pune',
        localities: ['Kothrud', 'Aundh', 'Baner', 'Viman Nagar', 'Shivajinagar'],
        pincodes: ['411038', '411007', '411045', '411014', '411005']
      },
      modes: ['home_visit', 'online'],
      subjects: ['Computer Science & Python Coding', 'Mathematics'],
      classes: ['Class 6 - 8 (Middle)', 'Class 9 - 10 (Secondary)', 'Class 11 - 12 (Senior Secondary)'],
      boards: ['CBSE', 'ICSE / ISC'],
      rates: {
        hourly: 600,
        monthly: 6500
      },
      bio: 'Former software engineer turned full-time tutor. I teach Python, SQL, and CS board curriculum by building actual games and mini-projects so students develop computational thinking.',
      achievements: [
        'Guided 40+ CBSE Class 12 students to score 95+ in Computer Science',
        'Mentor for Young Coders Hackathon Pune'
      ]
    });

    // Profile 5: Farhan Siddiqui
    const tutorProfile5 = await TutorProfile.create({
      user: tutorUser5._id,
      name: tutorUser5.name,
      tagline: 'Chartered Accountant & Senior Commerce Faculty (Accounts & Economics)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 48,
      experienceYears: 11,
      qualification: 'Chartered Accountant (ICAI), M.Com (Finance)',
      isVerified: true,
      verificationDetails: {
        idProof: 'PAN & Aadhaar Verified',
        degreeProof: 'ICAI Membership Verified',
        addressProof: 'Aadhaar Verified',
        verifiedAt: new Date('2025-08-18')
      },
      verificationDocuments: [
        {
          id: 'doc-farhan-1',
          docType: 'id_proof',
          docName: 'Income_Tax_PAN_Card_Farhan.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-08-15'),
          status: 'approved'
        },
        {
          id: 'doc-farhan-2',
          docType: 'degree_certificate',
          docName: 'ICAI_Chartered_Accountant_Certificate.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-08-15'),
          status: 'approved'
        },
        {
          id: 'doc-farhan-3',
          docType: 'address_proof',
          docName: 'Bandra_West_Electricity_Bill.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2025-08-15'),
          status: 'approved'
        }
      ],
      location: {
        state: 'Maharashtra',
        city: 'Mumbai',
        localities: ['Bandra West', 'Andheri West', 'Juhu', 'Khar', 'Santacruz'],
        pincodes: ['400050', '400053', '400049', '400052', '400054']
      },
      modes: ['home_visit', 'tutor_place', 'online'],
      subjects: ['Accountancy & Commerce', 'Economics'],
      classes: ['Class 11 - 12 (Senior Secondary)', 'College / Degree'],
      boards: ['CBSE', 'ICSE / ISC', 'State Board'],
      rates: {
        hourly: 850,
        monthly: 9000
      },
      bio: "As a practicing CA and passionate teacher, I bring real-world balance sheets, GST examples, and financial statements into classroom teaching. Balance sheets won't just tally; you'll understand why.",
      achievements: [
        'Student secured 100/100 in CBSE Class 12 Accountancy (2024)',
        'Over 300+ commerce students guided for CA Foundation'
      ]
    });

    // Profile 6: Sunayana Roy (Pending audit queue)
    const tutorProfile6 = await TutorProfile.create({
      user: tutorUser6._id,
      name: tutorUser6.name,
      tagline: 'English Literature, Creative Writing & Public Speaking Mentor',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviewCount: 22,
      experienceYears: 8,
      qualification: 'M.A. English Literature (JNU), B.Ed',
      isVerified: false,
      verificationDetails: {
        idProof: 'Aadhaar Uploaded (Pending Admin Review)',
        degreeProof: 'JNU Degree Uploaded (Pending Admin Review)',
        addressProof: 'Aadhaar Uploaded',
        verifiedAt: null
      },
      verificationDocuments: [
        {
          id: 'doc-sunayana-1',
          docType: 'id_proof',
          docName: 'Aadhaar_Card_Sunayana_Roy.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2026-03-15'),
          status: 'pending'
        },
        {
          id: 'doc-sunayana-2',
          docType: 'degree_certificate',
          docName: 'JNU_MA_English_Degree_Certificate.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2026-03-15'),
          status: 'pending'
        },
        {
          id: 'doc-sunayana-3',
          docType: 'address_proof',
          docName: 'Electricity_Bill_Noida_Sec62.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          uploadedAt: new Date('2026-03-15'),
          status: 'pending'
        }
      ],
      location: {
        state: 'Delhi NCR',
        city: 'Noida',
        localities: ['Sector 62', 'Sector 50', 'Sector 18', 'Sector 137', 'Sector 76'],
        pincodes: ['201301', '201307', '201309', '201305', '201304']
      },
      modes: ['home_visit', 'online'],
      subjects: ['English Literature & Grammar', 'Social Science / History / Civics'],
      classes: ['Class 6 - 8 (Middle)', 'Class 9 - 10 (Secondary)', 'Class 11 - 12 (Senior Secondary)'],
      boards: ['CBSE', 'ICSE / ISC', 'Cambridge (IGCSE)'],
      rates: {
        hourly: 550,
        monthly: 6000
      },
      bio: 'Passionate literature tutor helping students unlock critical essay writing, poetry analysis, and grammar mastery. Also conduct speech and debate coaching for school competitions.',
      achievements: [
        'Best English Teacher Award (Regional school cluster 2022)',
        'Published poetry in international anthologies'
      ]
    });

    console.log('Seeding reviews across all tutors...');
    await Review.create([
      {
        tutor: tutorProfile1._id,
        studentUser: studentUser1._id,
        studentName: 'Ananya Mehra (Class 12)',
        parentName: 'Sanjay Mehra',
        rating: 5,
        subject: 'Physics Class 12 CBSE',
        comment: 'Dr. Sharma made electromagnetism and optics so intuitive for my daughter. Her board mock test scores leaped from 62% to 94%. Highly recommended for home tuition!'
      },
      {
        tutor: tutorProfile1._id,
        studentUser: studentUser1._id,
        studentName: 'Kabir Malhotra',
        parentName: 'Sunita Malhotra',
        rating: 5,
        subject: 'JEE Foundation Physics',
        comment: 'Very punctual, patient, and brings customized numerical worksheets every session. The best tutor we have had in South Delhi.'
      },
      {
        tutor: tutorProfile2._id,
        studentUser: studentUser2._id,
        studentName: 'Aditya Hegde',
        parentName: 'Meenakshi Hegde',
        rating: 5,
        subject: 'Class 10 ICSE Maths',
        comment: "Pooja ma'am eliminated my son's fear of geometry and trigonometry. Her weekly assessments are phenomenal."
      },
      {
        tutor: tutorProfile3._id,
        studentUser: studentUser3._id,
        studentName: 'Rohan Sen',
        parentName: 'Debashis Sen',
        rating: 5,
        subject: 'NEET Chemistry',
        comment: "Amitabh Sir's organic chemistry notes and reaction maps are gold. Clear, disciplined, and genuinely cares about student progress."
      },
      {
        tutor: tutorProfile4._id,
        studentName: 'Aarav Deshmukh',
        parentName: 'Prashant Deshmukh',
        rating: 5,
        subject: 'Class 11 Python & CS',
        comment: 'Sneha explains programming logic without unnecessary jargon. My son now loves coding and completed his school project independently.'
      },
      {
        tutor: tutorProfile5._id,
        studentName: 'Zara Merchant',
        parentName: 'Farida Merchant',
        rating: 5,
        subject: 'Class 12 Accounts',
        comment: 'Farhan Sir made partnership accounts and cash flow statements remarkably straightforward. Punctual, strict yet very supportive.'
      }
    ]);

    console.log('Seeding initial inquiries...');
    await Inquiry.create([
      {
        tutor: tutorProfile1._id,
        tutorName: tutorProfile1.name,
        studentUser: studentUser1._id,
        studentName: 'Arjun Verma',
        parentName: 'Vikram Verma',
        parentPhone: '+91 98112 34567',
        parentEmail: 'student@vidyanest.com',
        grade: 'Class 11 - 12 (Senior Secondary)',
        board: 'CBSE',
        subject: 'Physics',
        locality: 'Greater Kailash II',
        houseLocation: 'Flat 402, Block B, Silver Oak Apartments',
        landmark: 'Near M-Block Market & Savitri Cinema',
        city: 'New Delhi',
        state: 'Delhi NCR',
        pincode: '110048',
        fullAddress: 'Flat 402, Block B, Silver Oak Apartments, Near M-Block Market, Greater Kailash II, New Delhi, Delhi NCR - 110048',
        mode: 'home_visit',
        preferredDays: '3 days / week (Mon, Wed, Fri)',
        preferredTime: '5:00 PM - 6:30 PM',
        budgetPerMonth: 9500,
        studentNotes: 'Needs conceptual focus for Class 12 Boards and JEE Main.',
        status: 'pending'
      },
      {
        tutor: tutorProfile1._id,
        tutorName: tutorProfile1.name,
        studentName: 'Rhea Kapur',
        parentName: 'Meera Kapur',
        parentPhone: '+91 98200 87654',
        parentEmail: 'meera.kapur@example.com',
        grade: 'Class 9 - 10 (Secondary)',
        board: 'ICSE / ISC',
        subject: 'Physics & Mathematics',
        locality: 'Hauz Khas',
        houseLocation: 'Villa 14, Deer Park Enclave, 1st Floor',
        landmark: 'Opposite Deer Park Gate 2 & Hauz Khas Social',
        city: 'New Delhi',
        state: 'Delhi NCR',
        pincode: '110016',
        fullAddress: 'Villa 14, Deer Park Enclave, Opposite Deer Park Gate 2, Hauz Khas, New Delhi, Delhi NCR - 110016',
        mode: 'home_visit',
        preferredDays: '2 days / week (Tue, Thu)',
        preferredTime: '4:00 PM - 5:30 PM',
        budgetPerMonth: 9000,
        studentNotes: 'Looking for regular home tutor for upcoming ICSE board preparation.',
        status: 'accepted',
        acceptedAt: new Date('2026-03-11T09:00:00Z')
      },
      {
        tutor: tutorProfile2._id,
        tutorName: tutorProfile2.name,
        studentUser: studentUser2._id,
        studentName: 'Tanya Shenoy',
        parentName: 'Girish Shenoy',
        parentPhone: '+91 99011 22334',
        parentEmail: 'girish.shenoy@example.com',
        grade: 'Class 6 - 8 (Middle)',
        board: 'Cambridge (IGCSE)',
        subject: 'Mathematics',
        locality: 'Indiranagar',
        houseLocation: '#45, 2nd Cross, Defence Colony, 100ft Road',
        landmark: 'Near Sony Center & BDA Complex',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        fullAddress: '#45, 2nd Cross, Defence Colony, 100ft Road, Near Sony Center, Indiranagar, Bengaluru, Karnataka - 560038',
        mode: 'home_visit',
        preferredDays: '3 days / week',
        preferredTime: '6:00 PM - 7:00 PM',
        budgetPerMonth: 8000,
        studentNotes: 'Needs support with Cambridge Checkpoint algebra and geometry.',
        status: 'pending'
      }
    ]);

    console.log('✓ Seeding completed successfully!');
    console.log(`✓ 6 Tutors, 3 Students, 1 Admin, 6 Reviews, 3 Inquiries saved in MongoDB Atlas!`);
    process.exit(0);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
