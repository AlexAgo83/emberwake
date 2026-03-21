import { describe, expect, it } from "vitest";

import {
  emberwakeContentAuthoringContract,
  validateEmberwakeContentAuthoring
} from "./contentAuthoring";

describe("emberwakeContentAuthoring", () => {
  it("keeps the Emberwake content graph internally consistent", () => {
    expect(() => validateEmberwakeContentAuthoring()).not.toThrow();
  });

  it("documents typed catalog ownership and validation posture", () => {
    expect(emberwakeContentAuthoringContract.authoringModel).toBe(
      "typed-module-owned-content-catalogs"
    );
    expect(emberwakeContentAuthoringContract.validation.execution).toBe(
      "module-load-and-vitest"
    );
  });
});
