import { test } from "./helpers/test";
import { AppWorkflow } from "./index";

export const continuousIntegration: AppWorkflow = {
  name: "Run all tests",
  on: {
    push: {
      branches: ["main"],
    },
    pull_request: {
      branches: ["main"],
    },
  },
  jobs: {
    test,
  },
};
