export type Certification = {
  id: string;
  title: string;
  issuer: string;
  credentialType: "Course completion" | "Attendance certificate" | "Training record";
  date: string;
  hours: number;
  image: string;
  description: string;
  instructor?: string;
  credentialUrl?: string;
};

export const certifications: Certification[] = [
  {
    id: "web-development-bootcamp",
    title: "The Complete 2024 Web Development Bootcamp",
    issuer: "Udemy",
    instructor: "Dr. Angela Yu",
    credentialType: "Course completion",
    date: "October 15, 2024",
    hours: 61.5,
    image: "/certificates/web-development-bootcamp.webp",
    description:
      "A structured web development curriculum led by Dr. Angela Yu, covering the foundations of building web applications.",
    credentialUrl:
      "https://ude.my/UC-09619523-511d-4690-ab06-8f064eb313bd",
  },
  {
    id: "software-engineering-101",
    title: "Software Engineering 101: Plan and Execute Better Software",
    issuer: "Udemy",
    instructor: "Kurt Anderson",
    credentialType: "Course completion",
    date: "November 28, 2024",
    hours: 8.5,
    image: "/certificates/software-engineering-101.webp",
    description:
      "A course focused on planning, execution, and improving software delivery practices.",
    credentialUrl:
      "https://ude.my/UC-5306d230-5d14-4a93-a33d-b9e722d7532b",
  },
  {
    id: "ai-from-zero-to-production",
    title: "Desarrollo con IA: de 0 a Producción",
    issuer: "BIG school · Mouredev",
    credentialType: "Attendance certificate",
    date: "March 13, 2026",
    hours: 6,
    image: "/certificates/ai-from-zero-to-production.webp",
    description:
      "Training sessions exploring the journey from getting started with AI-assisted development to production-oriented work.",
  },
  {
    id: "ai-program-with-agents",
    title: "Desarrollo con IA: Programa con Agentes",
    issuer: "BIG school · Mouredev",
    credentialType: "Attendance certificate",
    date: "June 26, 2026",
    hours: 6,
    image: "/certificates/ai-program-with-agents.webp",
    description:
      "An introductory training session on AI-assisted development with agent-based workflows.",
  },
  {
    id: "ai-new-programmer",
    title: "Desarrollo con IA Gratis — El Nuevo Programador",
    issuer: "BIG school · Mouredev",
    credentialType: "Attendance certificate",
    date: "October 2, 2026",
    hours: 4,
    image: "/certificates/ai-new-programmer.webp",
    description:
      "An introductory course on AI-assisted programming and the evolving role of the developer.",
  },
  {
    id: "cybersecurity-fundamentals",
    title: "Cybersecurity Fundamentals",
    issuer: "Issuer not specified",
    credentialType: "Training record",
    date: "Date not provided",
    hours: 6,
    image: "/certificates/Cibersecurity.webp",
    description:
      "Six hours of cybersecurity training. The display title is provisional; the official course name and issuing organization have not been confirmed.",
  },
];

export const totalTrainingHours = certifications.reduce(
  (total, certification) => total + certification.hours,
  0,
);
