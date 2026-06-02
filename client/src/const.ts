export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Login URL now points to internal login page instead of external OAuth
export const getLoginUrl = () => {
  return "/login";
};
