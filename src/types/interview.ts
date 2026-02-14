export interface InterviewTurn {
  speaker: "interviewer" | "candidate";
  section: string;
  topic: string;
  adjacent: boolean;
  content: string;
}

export interface Interview {
  id: number;
  title: string;
  technologies: string[];
  position: string;
  positionCode: string | null;
  difficulty: string | null;
  durationMinutes: number;
  generatedAt: string | null;
  company: string | null;
  industry: string | null;
  companySize: string | null;
  role: string | null;
  roleDescription: string | null;
  interviewRound: string | null;
  interviewerName: string | null;
  interviewerTitle: string | null;
  turns: InterviewTurn[];
  sourceFile: string;
  rawContent: string | null;
  createdAt: string | null;
}
