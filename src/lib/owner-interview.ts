// Canonical owner-interview questions.
//
// These four questions are hardcoded platform-wide. Merchants edit only their
// ANSWERS — the questions themselves are not editable. Rendered as fixed
// labels in the listing edit form (DirectoryListingForm) and as the question
// text on the public listing (DirectoryDetail), regardless of whatever prompt
// happens to be stored on a legacy/edited record.
//
// Mirror of the backend's OWNER_INTERVIEW_QUESTIONS
// (src/api/store/directory/listings/owner-interview.ts), which enforces the
// same prompts server-side. Keep the two in sync.
export const OWNER_INTERVIEW_QUESTIONS = [
  "What inspired you to start this business?",
  "How does your faith shape your work?",
  "What's a favorite patron saint or scripture?",
  "What's one thing you'd like customers to know?",
] as const
