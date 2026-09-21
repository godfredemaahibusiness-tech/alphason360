import type { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Administrator",
  PRINCIPAL: "Principal",
  ACADEMIC_HEAD: "Academic Head",
  TEACHER: "Teacher",
  ACCOUNTANT: "Accountant",
  ADMISSIONS: "Admissions Officer",
  PARENT: "Parent",
  STUDENT: "Student",
  LIBRARIAN: "Librarian",
  NURSE: "School Nurse",
  HR: "HR / Admin",
  TRANSPORT: "Transport Manager",
};

export const LOGIN_ROLE_GROUPS = [
  { label: "Administrator", roles: ["SUPER_ADMIN", "PRINCIPAL", "ACADEMIC_HEAD"] as Role[] },
  { label: "Teacher", roles: ["TEACHER"] as Role[] },
  { label: "Parent", roles: ["PARENT"] as Role[] },
  { label: "Staff", roles: ["ACCOUNTANT", "ADMISSIONS", "LIBRARIAN", "NURSE", "HR", "TRANSPORT"] as Role[] },
];
