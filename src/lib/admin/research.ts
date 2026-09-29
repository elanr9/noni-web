/* Shapes written by the research-company and study-reference edge functions
   (noni repo, supabase/functions/_shared/companyResearch.ts and
   referenceStudy.ts). Keep in step with those files. */

export type ProductProfile = {
  product_name: string;
  one_liner: string;
  industry: string;
  niche: string;
  audience: Array<{ who: string; situation: string }>;
  problems: string[];
  features: Array<{ name: string; what_it_does: string }>;
  pricing: string | null;
  differentiators: string[];
  research_questions: string[];
};

export type IndustryPlaybook = {
  market: { summary: string; trends: string[] };
  audience: Array<{ who: string; moment: string; fears: string[]; their_words: string[] }>;
  calendar: Array<{ when: string; what: string; why_it_matters: string }>;
  insider_facts: Array<{ fact: string; source_url: string | null }>;
  problems: Array<{
    problem: string;
    in_their_words: string;
    how_it_is_solved_today: string;
    cost_of_getting_it_wrong: string;
  }>;
  myths: Array<{ myth: string; truth: string }>;
  vocabulary: Array<{ term: string; meaning: string }>;
  product_fit: Array<{ problem: string; how_the_product_helps: string }>;
  alternatives: Array<{ name: string; what_it_is: string }>;
  content_angles: Array<{ title: string; search_phrase: string; hook: string; why: string }>;
  never_say: string[];
};

export type CompanyResearch = {
  website: string | null;
  status: "idle" | "running" | "done" | "failed";
  stage: string | null;
  profile: ProductProfile | null;
  playbook: IndustryPlaybook | null;
  sources: Array<{ url: string; title: string }>;
  error: string | null;
  started_at: string | null;
  finished_at: string | null;
};

export type PatternCard = {
  topic: string;
  hook_spoken: string | null;
  hook_on_screen: string | null;
  hook_type: string;
  structure: string[];
  on_screen_text: string[];
  insider_details: string[];
  phrases: string[];
  product_mention: string | null;
  cta: string | null;
  why_it_works: string;
  quality: number;
};

export type StudiedReference = {
  id: string;
  url: string;
  status: "pending" | "done" | "failed";
  format: string | null;
  pattern: PatternCard | null;
  studied_at: string | null;
};

export type ReferenceLearning = {
  studies: StudiedReference[];
  playbook: string;
  playbookUpdatedAt: string | null;
  referenceCount: number;
};

/* A run still marked running after this long was cut off by the platform
   (research-company STALE_RUN_MS) and can be started again. */
export const RESEARCH_STALE_MS = 8 * 60 * 1000;
