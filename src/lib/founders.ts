/* The founders section on the landing page. Add each founder here (name,
   role, optional photo under /public) and they appear under the note; while
   the list is empty the note is signed "The Noni founders". */

export interface Founder {
  name: string;
  role: string;
  /** Path under /public, e.g. "/founders/elan.jpg". */
  photo?: string;
}

export const FOUNDERS: Founder[] = [];

export const FOUNDERS_NOTE = {
  title: "We built Noni because we needed it",
  paragraphs: [
    "We run a creator program for our own product, Field Vision AI. No tool covered the whole job, from telling a creator what to film to knowing whether the post made us a dollar, so we built one.",
    "Noni is that tool. Every company that joins talks to one of us first, so tell us what your program needs.",
  ],
};
