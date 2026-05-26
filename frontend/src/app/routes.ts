// Centralized route and API constants for the frontend
export const Pages = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  TIMER: "/timer",
  ROOMS: "/rooms",
  FLASHCARDS: "/flashcards",
  EXAMS: "/exams",
  ASSISTANT: "/assistant",
  PROFILE: "/profile",
  PROFILE_ME: "/profile/me",
};

export const Api = {
  AUTH: "/api/auth",
  ASSISTANT: "/api/assistant",
  FLASHCARDS: "/api/flashcards",
  TIMER: "/api/timer",
  ROOMS: "/api/rooms",
  EXAM: "/api/exam",
  PROFILE: "/api/profile",
  PASSWORD_RESET: "/api/password-reset",
};

export const RESTRICTED_PAGES = [
  Pages.DASHBOARD,
  Pages.TIMER,
  Pages.ROOMS,
  Pages.FLASHCARDS,
  Pages.EXAMS,
  Pages.ASSISTANT,
  Pages.PROFILE,
];

export const MATCHER_ENTRIES = [
  Pages.LOGIN,
  `${Pages.DASHBOARD}/:path*`,
  `${Pages.TIMER}/:path*`,
  `${Pages.ROOMS}/:path*`,
  `${Pages.FLASHCARDS}/:path*`,
  `${Pages.EXAMS}/:path*`,
  `${Pages.ASSISTANT}/:path*`,
  `${Pages.PROFILE}/:path*`,
];

export default { Pages, Api, RESTRICTED_PAGES, MATCHER_ENTRIES };
