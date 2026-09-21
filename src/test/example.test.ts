import { describe, it, expect } from "vitest";
import { demoProfiles, newHomeSeed } from "@/data/newHome";
import { filterDashboardForUser } from "@/lib/newHomeService";

describe("New Home permissions", () => {
  it("filters records outside the user's modules", () => {
    const result = filterDashboardForUser({ user: demoProfiles.user, ...newHomeSeed });
    expect(result.actions.every((item) => demoProfiles.user.permissions.includes(item.permission))).toBe(true);
    expect(result.actions.some((item) => item.permission === "workflow")).toBe(false);
  });

  it("keeps administrator records available", () => {
    const result = filterDashboardForUser({ user: demoProfiles.admin, ...newHomeSeed });
    expect(result.actions).toHaveLength(newHomeSeed.actions.length);
  });
});
