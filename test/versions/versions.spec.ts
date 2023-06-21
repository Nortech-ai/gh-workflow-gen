import { Workflow, convertToYaml } from "@wardellbagby/gh-workflow-gen";
import fs from "fs";
import path from "path";
import { assertEquals, directory } from "../test_helpers";
import * as Versions from "./Verions";

export const testWorkflowWithVersions = () => {
  const workflow: Workflow<typeof Versions> = {
    name: "Versioned Workflow",
    on: {
      push: {},
    },
    jobs: {
      echo: {
        name: "Check the deps!",
        "runs-on": "ubuntu-20.04",
        steps: [
          {
            name: "Using a dependency!!",
            uses: Versions.SOME_THING,
          },
        ],
      },
    },
  };

  const actual = convertToYaml(workflow);

  const expected = fs
    .readFileSync(
      path.resolve(directory(import.meta.url), "versioned-expected.yml")
    )
    .toString();

  assertEquals(actual, expected);
};
