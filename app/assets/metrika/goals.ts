export const MetrikaGoal = {
  skillsOpen: "skills_open",
  portfolioView: "portfolio_view",
  projectsPage: "projects_page",
  projectView: "project_view",
  assistantAsk: "assistant_ask",
  contactSend: "contact_send",
} as const;

export type MetrikaGoalId = (typeof MetrikaGoal)[keyof typeof MetrikaGoal];
