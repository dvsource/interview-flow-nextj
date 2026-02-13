// Client-side type — dates are strings because tRPC v11 + superjson
// infers them as strings even though runtime deserializes correctly.
// Field names match the Drizzle schema's camelCase column mappings.
export interface Question {
  id: number;
  topic: string;
  subtopic: string | null;
  summary: string;
  question: string;
  whyImportant: string;
  answer: string;
  keyNotes: string;
  keywords: string[];
  sourceFile: string;
  generatedAt: string | null;
  createdAt: string | null;
}
