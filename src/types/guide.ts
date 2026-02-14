export interface GuideSection {
  id: string;
  title: string;
  level: number;
  content: string;
}

export interface Guide {
  id: number;
  title: string;
  targetAudience: string | null;
  techStack: string | null;
  duration: string | null;
  tableOfContents: string[];
  sections: GuideSection[];
  sourceFile: string;
  generatedAt: string | null;
  rawContent: string | null;
  createdAt: string | null;
}
