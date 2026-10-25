import { defineEventHandler, setResponseHeader } from "h3";
import { issueChallenge } from "../../utils/assistant";

export default defineEventHandler((event) => {
  setResponseHeader(event, "cache-control", "no-store");
  return issueChallenge();
});
