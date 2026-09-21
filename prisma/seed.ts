import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD_HASH = bcrypt.hashSync("demo1234", 10);

const FIRST_NAMES_M = [
  "Kwame", "Kofi", "Yaw", "Kwabena", "Kwesi", "Kojo", "Samuel", "Emmanuel",
  "Daniel", "Michael", "Nana", "Elorm", "Selorm", "Kelvin", "Prince",
];
const FIRST_NAMES_F = [
  "Ama", "Akosua", "Abena", "Efua", "Adjoa", "Yaa", "Esi", "Akua", "Gifty",
  "Comfort", "Priscilla", "Rita", "Vida", "Sandra", "Josephine",
];
const LAST_NAMES = [
  "Mensah", "Owusu", "Asante", "Boateng", "Osei", "Adjei", "Appiah", "Darko",
  "Amoah", "Gyasi", "Antwi", "Sarpong", "Frimpong", "Acheampong", "Narteh",
  "Tetteh", "Addo", "Yeboah",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pickMany<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

async function main() {
  console.log("Seeding Alphason International School demo data...");

  await prisma.studentTransport.deleteMany();
  await prisma.transportRoute.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.borrowRecord.deleteMany();
  await prisma.book.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.staffAttendance.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.score.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.reportCardRemark.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.gradeBand.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.feeItem.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.studentGuardian.deleteMany();
  await prisma.student.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.applicant.deleteMany();
  await prisma.performanceSnapshot.deleteMany();
  await prisma.schoolEvent.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.section.deleteMany();
  await prisma.schoolClass.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.user.deleteMany();

  // --- Academic year & terms ---
  const academicYear = await prisma.academicYear.create({
    data: {
      name: "2026/2027",
      startDate: new Date("2026-09-07"),
      endDate: new Date("2027-07-16"),
      isCurrent: true,
    },
  });

  const termNames = ["Term 1", "Term 2", "Term 3"];
  for (const [i, name] of termNames.entries()) {
    await prisma.term.create({
      data: {
        name,
        academicYearId: academicYear.id,
        startDate: new Date(2026, 8 + i * 4, 7),
        endDate: new Date(2026, 11 + i * 4, 12),
      },
    });
  }

  // --- Classes & sections ---
  const classNames = [
    "Creche", "Nursery 1", "Nursery 2", "KG 1", "KG 2",
    "Basic 1", "Basic 2", "Basic 3", "Basic 4", "Basic 5", "Basic 6",
    "JHS 1", "JHS 2", "JHS 3",
  ];
  const classes = [];
  for (const [i, name] of classNames.entries()) {
    const cls = await prisma.schoolClass.create({ data: { name, order: i } });
    await prisma.section.create({ data: { name: "A", classId: cls.id } });
    classes.push(cls);
  }

  // --- Subjects ---
  const subjectDefs = [
    ["English Language", "ENG"],
    ["Mathematics", "MTH"],
    ["Integrated Science", "SCI"],
    ["Social Studies", "SOC"],
    ["Computing", "ICT"],
    ["Religious & Moral Education", "RME"],
    ["French", "FRE"],
    ["Creative Arts", "ART"],
    ["Physical Education", "PE"],
  ];
  const subjects = [];
  for (const [name, code] of subjectDefs) {
    subjects.push(await prisma.subject.create({ data: { name, code } }));
  }

  // --- Staff / teacher users ---
  const teacherCount = 20;
  const teachers: Awaited<ReturnType<typeof prisma.teacher.create>>[] = [];
  for (let i = 0; i < teacherCount; i++) {
    const gender = Math.random() > 0.5 ? "F" : "M";
    const firstName = pick(gender === "F" ? FIRST_NAMES_F : FIRST_NAMES_M);
    const lastName = pick(LAST_NAMES);
    const email = `${firstName}.${lastName}${i}@alphason.edu.gh`.toLowerCase();
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: DEMO_PASSWORD_HASH,
        name: `${firstName} ${lastName}`,
        role: "TEACHER",
      },
    });
    const teacher = await prisma.teacher.create({
      data: { staffId: `STF-${String(i + 1).padStart(3, "0")}`, userId: user.id },
    });
    await prisma.teacherSubject.create({
      data: { teacherId: teacher.id, subjectId: pick(subjects).id },
    });
    teachers.push(teacher);
  }

  // Non-teaching / role demo accounts (one each, for RBAC pitch demo)
  const roleAccounts: { role: "SUPER_ADMIN" | "PRINCIPAL" | "ACADEMIC_HEAD" | "ACCOUNTANT" | "ADMISSIONS" | "LIBRARIAN" | "NURSE" | "HR" | "TRANSPORT" | "PARENT" | "STUDENT"; name: string; email: string }[] = [
    { role: "SUPER_ADMIN", name: "Godfred Narteh", email: "admin@alphason.edu.gh" },
    { role: "PRINCIPAL", name: "Mrs. Comfort Asante", email: "principal@alphason.edu.gh" },
    { role: "ACADEMIC_HEAD", name: "Mr. Yaw Owusu", email: "academichead@alphason.edu.gh" },
    { role: "ACCOUNTANT", name: "Mrs. Rita Boateng", email: "accountant@alphason.edu.gh" },
    { role: "ADMISSIONS", name: "Mr. Kojo Darko", email: "admissions@alphason.edu.gh" },
    { role: "LIBRARIAN", name: "Ms. Gifty Amoah", email: "librarian@alphason.edu.gh" },
    { role: "NURSE", name: "Nurse Josephine Sarpong", email: "nurse@alphason.edu.gh" },
    { role: "HR", name: "Mr. Prince Frimpong", email: "hr@alphason.edu.gh" },
    { role: "TRANSPORT", name: "Mr. Samuel Antwi", email: "transport@alphason.edu.gh" },
    { role: "PARENT", name: "Mr. Emmanuel Mensah", email: "parent@alphason.edu.gh" },
    { role: "STUDENT", name: "Ama Owusu", email: "student@alphason.edu.gh" },
  ];
  for (const acc of roleAccounts) {
    await prisma.user.create({
      data: {
        email: acc.email,
        passwordHash: DEMO_PASSWORD_HASH,
        name: acc.name,
        role: acc.role,
      },
    });
  }

  // --- Fee items per class ---
  for (const cls of classes) {
    const baseTuition = cls.order < 5 ? 1200 : cls.order < 11 ? 1600 : 2000;
    await prisma.feeItem.create({
      data: { name: "Tuition", amount: baseTuition, classId: cls.id },
    });
    await prisma.feeItem.create({
      data: { name: "Feeding", amount: 400, classId: cls.id },
    });
  }

  // --- Guardians & students ---
  const studentCount = 100;
  const sectionsByClass = await prisma.section.findMany();
  let invoiceCounter = 1;

  for (let i = 0; i < studentCount; i++) {
    const gender: "MALE" | "FEMALE" = Math.random() > 0.5 ? "FEMALE" : "MALE";
    const firstName = pick(gender === "FEMALE" ? FIRST_NAMES_F : FIRST_NAMES_M);
    const lastName = pick(LAST_NAMES);
    const cls = pick(classes);
    const classAgeBase = 3 + cls.order; // rough age progression by class order
    const dob = randomDate(
      new Date(2026 - classAgeBase - 1, 0, 1),
      new Date(2026 - classAgeBase, 11, 31)
    );

    const student = await prisma.student.create({
      data: {
        admissionNumber: `AIS-${String(i + 1).padStart(4, "0")}`,
        firstName,
        lastName,
        gender,
        dateOfBirth: dob,
        admissionDate: randomDate(new Date("2020-09-01"), new Date("2026-08-01")),
      },
    });

    const guardian = await prisma.guardian.create({
      data: {
        name: `${pick(gender === "FEMALE" ? FIRST_NAMES_M : FIRST_NAMES_F)} ${lastName}`,
        relationship: pick(["Mother", "Father", "Guardian"]),
        phone: `+2332${Math.floor(10000000 + Math.random() * 89999999)}`,
        email: `${lastName.toLowerCase()}${i}@gmail.com`,
        occupation: pick(["Trader", "Teacher", "Nurse", "Engineer", "Civil Servant", "Business Owner"]),
      },
    });

    await prisma.studentGuardian.create({
      data: { studentId: student.id, guardianId: guardian.id, isPrimary: true },
    });

    const section = sectionsByClass.find((s) => s.classId === cls.id);
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        classId: cls.id,
        sectionId: section?.id,
        academicYearId: academicYear.id,
      },
    });

    // Attendance for the last 30 days (school days only)
    const today = new Date();
    for (let d = 0; d < 30; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const roll = Math.random();
      const status = roll < 0.9 ? "PRESENT" : roll < 0.96 ? "LATE" : roll < 0.99 ? "ABSENT" : "EXCUSED";
      await prisma.attendance.create({
        data: { studentId: student.id, date, status },
      });
    }

    // Invoice + payment for this term
    const tuition = cls.order < 5 ? 1200 : cls.order < 11 ? 1600 : 2000;
    const total = tuition + 400;
    const paidRatio = Math.random();
    const amountPaid = paidRatio < 0.7 ? total : paidRatio < 0.9 ? total * 0.5 : 0;
    const status = amountPaid >= total ? "PAID" : amountPaid > 0 ? "PARTIAL" : "UNPAID";

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${String(invoiceCounter++).padStart(5, "0")}`,
        studentId: student.id,
        academicYearId: academicYear.id,
        termName: "Term 1",
        totalAmount: total,
        amountPaid,
        status,
        dueDate: new Date("2026-10-15"),
      },
    });

    if (amountPaid > 0) {
      // Spread payment dates across the last 5 months so the fee-collection
      // trend chart has enough history to be meaningful in the demo.
      const fiveMonthsAgo = new Date();
      fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: amountPaid,
          method: pick(["Mobile Money", "Cash", "Bank Transfer"]),
          paidAt: randomDate(fiveMonthsAgo, new Date()),
        },
      });
    }
  }

  // --- Expenses (Phase 3) ---
  const expenseCategories: { category: string; range: [number, number] }[] = [
    { category: "Salaries", range: [8000, 15000] },
    { category: "Utilities", range: [500, 1800] },
    { category: "Supplies", range: [300, 1200] },
    { category: "Maintenance", range: [200, 2000] },
    { category: "Transport", range: [400, 1500] },
  ];
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  for (let m = 0; m < 6; m++) {
    for (const { category, range } of expenseCategories) {
      const date = new Date(sixMonthsAgo);
      date.setMonth(date.getMonth() + m);
      date.setDate(5 + Math.floor(Math.random() * 20));
      await prisma.expense.create({
        data: {
          category,
          description: `${category} — ${date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`,
          amount: Math.round(range[0] + Math.random() * (range[1] - range[0])),
          date,
        },
      });
    }
  }

  // --- Performance snapshots (school-wide average trend) ---
  await prisma.performanceSnapshot.createMany({
    data: [
      { termName: "Term 1 (2025/2026)", academicYearId: academicYear.id, averageScore: 67 },
      { termName: "Term 2 (2025/2026)", academicYearId: academicYear.id, averageScore: 72 },
      { termName: "Term 3 (2025/2026)", academicYearId: academicYear.id, averageScore: 74 },
      { termName: "Term 1 (2026/2027)", academicYearId: academicYear.id, averageScore: 79 },
    ],
  });

  // --- Admissions pipeline ---
  const stages: ("INQUIRY" | "APPLIED" | "INTERVIEW" | "ACCEPTED" | "ENROLLED" | "WAITLISTED")[] = [
    "INQUIRY", "APPLIED", "INTERVIEW", "ACCEPTED", "ENROLLED", "WAITLISTED",
  ];
  for (let i = 0; i < 42; i++) {
    const gender = Math.random() > 0.5 ? "F" : "M";
    await prisma.applicant.create({
      data: {
        firstName: pick(gender === "F" ? FIRST_NAMES_F : FIRST_NAMES_M),
        lastName: pick(LAST_NAMES),
        parentName: `${pick(LAST_NAMES)} Family`,
        parentPhone: `+2332${Math.floor(10000000 + Math.random() * 89999999)}`,
        stage: pick(stages),
        source: pick(["Website", "Referral", "Walk-in", "Social Media"]),
        academicYearId: academicYear.id,
      },
    });
  }

  // --- Events ---
  const now = new Date();
  await prisma.schoolEvent.createMany({
    data: [
      {
        title: "PTA Meeting",
        description: "Termly Parent-Teacher Association meeting",
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
        audience: "PARENTS",
      },
      {
        title: "Mid-Term Examination",
        description: "Mid-term assessments for all classes",
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12),
        audience: "ALL",
      },
      {
        title: "Inter-House Sports Day",
        description: "Annual sports competition",
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21),
        audience: "ALL",
      },
    ],
  });

  // --- Recent activity ---
  await prisma.activityLog.createMany({
    data: [
      { message: "New student admitted to Basic 4", actorName: "Admissions Office" },
      { message: "Payment received from a Basic 2 parent", actorName: "Accounts Office" },
      { message: "Term 1 results published for JHS 3", actorName: "Academic Office" },
      { message: "Attendance recorded for all classes", actorName: "System" },
    ],
  });

  // --- Communication (Phase 4) ---
  const [adminUser, principalUser, academicHeadUser, accountantUser, parentUser, firstTeacherUser] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { email: "admin@alphason.edu.gh" } }),
      prisma.user.findUniqueOrThrow({ where: { email: "principal@alphason.edu.gh" } }),
      prisma.user.findUniqueOrThrow({ where: { email: "academichead@alphason.edu.gh" } }),
      prisma.user.findUniqueOrThrow({ where: { email: "accountant@alphason.edu.gh" } }),
      prisma.user.findUniqueOrThrow({ where: { email: "parent@alphason.edu.gh" } }),
      prisma.teacher.findFirstOrThrow({ include: { user: true } }),
    ]);

  const allUsers = await prisma.user.findMany({ select: { id: true, role: true } });
  const jhs3 = classes.find((c) => c.name === "JHS 3")!;

  type AnnouncementDef = {
    title: string;
    description: string;
    audience: "ALL" | "STAFF" | "PARENTS" | "TEACHERS" | "CLASS";
    authorId: string;
    classId?: string;
    draft?: boolean;
  };

  const announcementDefs: AnnouncementDef[] = [
    {
      title: "Mid-Term Examination Schedule Released",
      description: "The mid-term examination timetable has been published. Please check the Academics section for your class schedule.",
      audience: "ALL" as const,
      authorId: principalUser.id,
    },
    {
      title: "Term 1 Fees Due by October 15th",
      description: "A reminder that all outstanding Term 1 fees are due by October 15th. Visit the school office or pay via Mobile Money to settle your balance.",
      audience: "PARENTS" as const,
      authorId: accountantUser.id,
    },
    {
      title: "Staff Meeting This Friday",
      description: "All staff are required to attend the end-of-month staff meeting this Friday at 3:00pm in the staff common room.",
      audience: "STAFF" as const,
      authorId: principalUser.id,
    },
    {
      title: "New Lesson Plan Template",
      description: "Please switch to the updated lesson plan template for all schemes of work starting next week.",
      audience: "TEACHERS" as const,
      authorId: academicHeadUser.id,
    },
    {
      title: "JHS 3 BECE Mock Exam Registration",
      description: "JHS 3 students should register for the upcoming BECE mock examination with their class teacher by Friday.",
      audience: "CLASS" as const,
      classId: jhs3.id,
      authorId: firstTeacherUser.user.id,
    },
    {
      title: "Speech and Prize-Giving Day (Draft)",
      description: "Planning notes for this year's Speech and Prize-Giving Day — not yet ready to publish.",
      audience: "ALL" as const,
      authorId: adminUser.id,
      draft: true,
    },
  ];

  const staffRoles = new Set([
    "SUPER_ADMIN", "PRINCIPAL", "ACADEMIC_HEAD", "TEACHER", "ACCOUNTANT",
    "ADMISSIONS", "LIBRARIAN", "NURSE", "HR", "TRANSPORT",
  ]);

  for (const def of announcementDefs) {
    const announcement = await prisma.announcement.create({
      data: {
        title: def.title,
        description: def.description,
        audience: def.audience,
        classId: def.classId ?? null,
        authorId: def.authorId,
        status: def.draft ? "DRAFT" : "PUBLISHED",
      },
    });

    if (def.draft) continue;

    let recipientIds: string[] = [];
    if (def.audience === "ALL") recipientIds = allUsers.map((u) => u.id);
    else if (def.audience === "STAFF") recipientIds = allUsers.filter((u) => staffRoles.has(u.role)).map((u) => u.id);
    else if (def.audience === "PARENTS") recipientIds = allUsers.filter((u) => u.role === "PARENT").map((u) => u.id);
    else if (def.audience === "TEACHERS") recipientIds = allUsers.filter((u) => u.role === "TEACHER").map((u) => u.id);
    else if (def.audience === "CLASS") {
      recipientIds = [firstTeacherUser.user.id, adminUser.id, principalUser.id];
    }

    if (recipientIds.length > 0) {
      await prisma.notification.createMany({
        data: recipientIds.map((userId) => ({
          userId,
          type: "ANNOUNCEMENT" as const,
          title: `New announcement: ${announcement.title}`,
          body: announcement.description,
          link: `/communication/announcements/${announcement.id}`,
        })),
      });
    }
  }

  // Sample message thread between a parent and a teacher, plus admin/staff notes.
  const messageDefs = [
    {
      senderId: principalUser.id,
      recipientId: adminUser.id,
      subject: "Welcome to ALPHSON360",
      body: "Welcome aboard — let me know if you need anything set up on the system side.",
    },
    {
      senderId: parentUser.id,
      recipientId: firstTeacherUser.user.id,
      subject: "Question about homework",
      body: "Good afternoon, could you clarify what pages are expected for tonight's Mathematics homework? Thank you.",
    },
    {
      senderId: firstTeacherUser.user.id,
      recipientId: parentUser.id,
      subject: "Re: Question about homework",
      body: "Good afternoon, it's pages 24-26 in the workbook, questions 1 to 10. Please let me know if your child needs extra help.",
    },
    {
      senderId: adminUser.id,
      recipientId: accountantUser.id,
      subject: "Outstanding Term 1 fees",
      body: "Please follow up with parents who still have an outstanding balance for Term 1 this week.",
    },
  ];

  for (const m of messageDefs) {
    const message = await prisma.message.create({ data: m });
    await prisma.notification.create({
      data: {
        userId: m.recipientId,
        type: "MESSAGE",
        title: `New message: ${m.subject}`,
        body: m.body,
        link: `/communication/messages/${message.id}`,
      },
    });
  }

  // Mark the oldest notification for the parent demo account as already read,
  // so the notification bell demonstrates both read and unread states.
  const parentNotifications = await prisma.notification.findMany({
    where: { userId: parentUser.id },
    orderBy: { createdAt: "asc" },
    take: 1,
  });
  if (parentNotifications[0]) {
    await prisma.notification.update({
      where: { id: parentNotifications[0].id },
      data: { isRead: true },
    });
  }

  // --- Grading scale (Phase 2) ---
  await prisma.gradeBand.createMany({
    data: [
      { minScore: 80, maxScore: 100, grade: "A", remark: "Excellent" },
      { minScore: 70, maxScore: 79.99, grade: "B", remark: "Very Good" },
      { minScore: 60, maxScore: 69.99, grade: "C", remark: "Good" },
      { minScore: 50, maxScore: 59.99, grade: "D", remark: "Credit" },
      { minScore: 40, maxScore: 49.99, grade: "E", remark: "Pass" },
      { minScore: 0, maxScore: 39.99, grade: "F", remark: "Fail" },
    ],
  });

  // --- Timetable (Phase 2) ---
  // Assign a teacher per (day, period) globally so no teacher is double-booked
  // across classes, preferring a teacher who actually teaches that subject.
  const teacherSubjectLinks = await prisma.teacherSubject.findMany();
  const usedTeacherSlots = new Set<string>();

  function pickAvailableTeacher(subjectId: string, day: number, start: string): string {
    const key = (teacherId: string) => `${teacherId}|${day}|${start}`;
    const preferred = teacherSubjectLinks
      .filter((l) => l.subjectId === subjectId)
      .map((l) => l.teacherId);
    const pools = [preferred, teachers.map((t) => t.id)];
    for (const pool of pools) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      for (const teacherId of shuffled) {
        if (!usedTeacherSlots.has(key(teacherId))) {
          usedTeacherSlots.add(key(teacherId));
          return teacherId;
        }
      }
    }
    throw new Error("No available teacher for timetable slot");
  }

  const weekDays = [1, 2, 3, 4, 5];
  const periods: [string, string][] = [
    ["08:00", "08:45"],
    ["08:45", "09:30"],
    ["09:30", "10:15"],
    ["10:45", "11:30"],
  ];

  for (const cls of classes) {
    for (const day of weekDays) {
      for (const [i, [start, end]] of periods.entries()) {
        const subject = subjects[(cls.order + day + i) % subjects.length];
        await prisma.timetableSlot.create({
          data: {
            classId: cls.id,
            subjectId: subject.id,
            teacherId: pickAvailableTeacher(subject.id, day, start),
            dayOfWeek: day,
            startTime: start,
            endTime: end,
          },
        });
      }
    }
  }

  // --- Assessments, scores, report card remarks & assignments (Phase 2) ---
  const gradedSubjects = subjects.slice(0, 3);
  const assessmentDefs: { type: "CLASSWORK" | "ASSIGNMENT" | "TEST" | "EXAM"; name: string; weight: number }[] = [
    { type: "CLASSWORK", name: "Class Exercises", weight: 20 },
    { type: "ASSIGNMENT", name: "Homework Assignments", weight: 10 },
    { type: "TEST", name: "Class Test", weight: 20 },
    { type: "EXAM", name: "End of Term Exam", weight: 50 },
  ];

  for (const cls of classes) {
    const classEnrollments = await prisma.enrollment.findMany({
      where: { classId: cls.id, academicYearId: academicYear.id },
    });
    if (classEnrollments.length === 0) continue;

    for (const subject of gradedSubjects) {
      // A stable per-student ability baseline keeps a student's scores across
      // classwork/test/exam coherent, so report cards read like a real term.
      const abilityByStudent = new Map(
        classEnrollments.map((e) => [e.studentId, 45 + Math.random() * 45])
      );

      for (const def of assessmentDefs) {
        const assessment = await prisma.assessment.create({
          data: {
            name: `${def.name} — ${subject.name}`,
            type: def.type,
            weight: def.weight,
            classId: cls.id,
            subjectId: subject.id,
            termName: "Term 1",
            academicYearId: academicYear.id,
          },
        });

        for (const e of classEnrollments) {
          const ability = abilityByStudent.get(e.studentId)!;
          const noise = (Math.random() - 0.5) * 20;
          const score = Math.max(20, Math.min(100, Math.round(ability + noise)));
          await prisma.score.create({
            data: { assessmentId: assessment.id, studentId: e.studentId, score },
          });
        }
      }
    }

    // Report card remarks, derived from each student's actual seeded scores.
    for (const e of classEnrollments) {
      const studentScores = await prisma.score.findMany({ where: { studentId: e.studentId } });
      if (studentScores.length === 0) continue;
      const avg = studentScores.reduce((sum, s) => sum + s.score, 0) / studentScores.length;
      const classTeacherComment =
        avg >= 80
          ? "An excellent term. Keep up the outstanding work."
          : avg >= 65
          ? "A good term with solid effort. Can push further."
          : avg >= 50
          ? "Satisfactory performance. Needs more consistent effort at home."
          : "Struggling this term — recommend extra support and a parent meeting.";
      await prisma.reportCardRemark.create({
        data: {
          studentId: e.studentId,
          academicYearId: academicYear.id,
          termName: "Term 1",
          classTeacherComment,
          headteacherComment: avg >= 50 ? "Promoted to the next term." : "Promoted on trial.",
        },
      });
    }

    // Assignments (homework) for two of the graded subjects per class.
    for (const subject of gradedSubjects.slice(0, 2)) {
      await prisma.assignment.create({
        data: {
          title: `${subject.name} Homework`,
          instructions: `Complete the assigned ${subject.name} workbook exercises and submit in class.`,
          classId: cls.id,
          subjectId: subject.id,
          dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3 + Math.floor(Math.random() * 10)),
        },
      });
    }
  }

  // --- HR: staff profiles, attendance, leave (Phase 5) ---
  const staffUsers = await prisma.user.findMany({
    where: { role: { notIn: ["PARENT", "STUDENT"] } },
    include: { teacher: true },
  });

  const departmentByRole: Record<string, string> = {
    SUPER_ADMIN: "Administration",
    PRINCIPAL: "Administration",
    ACADEMIC_HEAD: "Academics",
    TEACHER: "Academics",
    ACCOUNTANT: "Finance",
    ADMISSIONS: "Admissions",
    LIBRARIAN: "Library",
    NURSE: "Health & Welfare",
    HR: "Human Resources",
    TRANSPORT: "Transport",
  };
  const qualifications = [
    "B.Ed Basic Education", "BSc Administration", "Diploma in Education",
    "BA Social Sciences", "MSc Management", "HND Accountancy",
  ];

  let staffCounter = 1;
  for (const u of staffUsers) {
    await prisma.staffProfile.create({
      data: {
        userId: u.id,
        staffId: u.teacher?.staffId ?? `STF-A${String(staffCounter++).padStart(3, "0")}`,
        department: departmentByRole[u.role] ?? "General",
        qualification: pick(qualifications),
        employmentDate: randomDate(new Date("2019-01-01"), new Date("2025-06-01")),
        phone: `+2332${Math.floor(10000000 + Math.random() * 89999999)}`,
        address: "Oduman, Accra",
        emergencyContact: `+2332${Math.floor(10000000 + Math.random() * 89999999)}`,
      },
    });

    // Attendance for the last 10 working days.
    const todayForStaff = new Date();
    for (let d = 0; d < 14; d++) {
      const date = new Date(todayForStaff);
      date.setDate(date.getDate() - d);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const roll = Math.random();
      const status = roll < 0.92 ? "PRESENT" : roll < 0.98 ? "LATE" : "ABSENT";
      const clockIn = new Date(date);
      clockIn.setHours(7, 30 + Math.floor(Math.random() * 30), 0, 0);
      const clockOut = new Date(date);
      clockOut.setHours(16, Math.floor(Math.random() * 30), 0, 0);
      await prisma.staffAttendance.create({
        data: {
          userId: u.id,
          date,
          status,
          clockIn: status === "ABSENT" ? null : clockIn,
          clockOut: status === "ABSENT" ? null : clockOut,
        },
      });
    }
  }

  const leaveDefs: { email: string; type: "ANNUAL" | "SICK" | "EMERGENCY"; status: "PENDING" | "APPROVED" | "REJECTED"; days: number }[] = [
    { email: "accountant@alphason.edu.gh", type: "ANNUAL", status: "PENDING", days: 5 },
    { email: "librarian@alphason.edu.gh", type: "SICK", status: "APPROVED", days: 2 },
    { email: "hr@alphason.edu.gh", type: "EMERGENCY", status: "REJECTED", days: 1 },
  ];
  for (const def of leaveDefs) {
    const leaveUser = await prisma.user.findUniqueOrThrow({ where: { email: def.email } });
    const startDate = randomDate(new Date(), new Date(now.getFullYear(), now.getMonth() + 1, 0));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + def.days);
    await prisma.leaveRequest.create({
      data: {
        userId: leaveUser.id,
        type: def.type,
        startDate,
        endDate,
        reason: def.type === "SICK" ? "Feeling unwell, doctor's note attached." : def.type === "EMERGENCY" ? "Family emergency." : "Annual leave request.",
        status: def.status,
        reviewedById: def.status === "PENDING" ? null : adminUser.id,
        reviewNotes: def.status === "APPROVED" ? "Approved, please arrange cover." : def.status === "REJECTED" ? "Too close to end-of-term exams, please reschedule." : null,
      },
    });
  }

  // --- Library (Phase 5) ---
  const bookDefs = [
    ["Things Fall Apart", "Chinua Achebe", "Literature"],
    ["The African Child", "Camara Laye", "Literature"],
    ["New General Mathematics 1", "M.F. Macrae", "Mathematics"],
    ["New General Mathematics 2", "M.F. Macrae", "Mathematics"],
    ["Integrated Science for Basic Schools", "GES", "Science"],
    ["A History of West Africa", "J.B. Webster", "Social Studies"],
    ["English Grammar in Use", "Raymond Murphy", "Language"],
    ["Computing for Junior High", "GES", "ICT"],
    ["Religious and Moral Education", "GES", "RME"],
    ["The Gods Are Not To Blame", "Ola Rotimi", "Literature"],
    ["Junior Graphic Atlas", "Various", "Reference"],
    ["Ghanaian Folk Tales", "Various", "Literature"],
    ["Basic French for Schools", "Various", "Language"],
    ["Creative Arts Handbook", "GES", "Arts"],
    ["Physical Education Manual", "GES", "PE"],
  ];
  const books = [];
  for (const [title, author, category] of bookDefs) {
    const totalCopies = 2 + Math.floor(Math.random() * 4);
    books.push(
      await prisma.book.create({
        data: { title, author, category, publisher: "Ghana Education Service", totalCopies, availableCopies: totalCopies },
      })
    );
  }

  const allStudents = await prisma.student.findMany({ take: 40 });
  for (let i = 0; i < 25; i++) {
    const book = pick(books);
    const student = pick(allStudents);
    const borrowDate = randomDate(new Date(now.getFullYear(), now.getMonth() - 1, 1), now);
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14);
    const isReturned = Math.random() < 0.6;

    await prisma.borrowRecord.create({
      data: {
        bookId: book.id,
        studentId: student.id,
        borrowDate,
        dueDate,
        returnDate: isReturned ? randomDate(borrowDate, new Date(Math.min(dueDate.getTime(), now.getTime()))) : null,
      },
    });

    if (!isReturned) {
      await prisma.book.update({
        where: { id: book.id },
        data: { availableCopies: { decrement: 1 } },
      });
    }
  }
  // Guard against availableCopies going negative if a book was borrowed more than its stock.
  for (const book of books) {
    const current = await prisma.book.findUniqueOrThrow({ where: { id: book.id } });
    if (current.availableCopies < 0) {
      await prisma.book.update({ where: { id: book.id }, data: { availableCopies: 0 } });
    }
  }

  // --- Transport (Phase 5) ---
  const vehicleDefs = [
    { registrationNumber: "GT 4521-24", vehicleType: "33-seater bus", capacity: 33, driverName: "Mr. Kwesi Boateng", driverPhone: "+233241122334" },
    { registrationNumber: "GT 7789-23", vehicleType: "18-seater minibus", capacity: 18, driverName: "Mr. Yaw Sarpong", driverPhone: "+233201122335" },
    { registrationNumber: "GT 2290-25", vehicleType: "33-seater bus", capacity: 33, driverName: "Mr. Kojo Amoah", driverPhone: "+233551122336" },
  ];
  const vehicles = [];
  for (const v of vehicleDefs) {
    vehicles.push(await prisma.vehicle.create({ data: v }));
  }

  const routeDefs = [
    { name: "Oduman - Amasaman Route", stops: "Oduman Station, Ofankor, Amasaman Market", pickupTime: "06:00", dropoffTime: "15:30" },
    { name: "Achimota - Lapaz Route", stops: "Achimota Circle, Lapaz Station, Kwashieman", pickupTime: "06:15", dropoffTime: "15:45" },
    { name: "Pokuase - Nsawam Road Route", stops: "Pokuase, Ablekuma, Nsawam Road Junction", pickupTime: "06:00", dropoffTime: "15:30" },
  ];
  const routes = [];
  for (const [i, r] of routeDefs.entries()) {
    routes.push(await prisma.transportRoute.create({ data: { ...r, vehicleId: vehicles[i % vehicles.length].id } }));
  }

  const transportStudents = pickMany(allStudents, 30);
  for (const student of transportStudents) {
    await prisma.studentTransport.create({
      data: { studentId: student.id, routeId: pick(routes).id },
    });
  }

  console.log("Seed complete.");
  console.log(`Students: ${studentCount}, Teachers: ${teacherCount}, Classes: ${classes.length}`);
  console.log("All demo accounts use password: demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
