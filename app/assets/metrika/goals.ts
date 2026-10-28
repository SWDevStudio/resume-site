export const MetrikaGoal = {
  skillsOpen: "skills_open",
  portfolioView: "portfolio_view",
  projectsPage: "projects_page",
  projectView: "project_view",
} as const;

export type MetrikaGoalId = (typeof MetrikaGoal)[keyof typeof MetrikaGoal];
