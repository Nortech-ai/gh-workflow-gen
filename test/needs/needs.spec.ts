import { Job, Workflow, convertToYaml } from "@wardellbagby/gh-workflow-gen";
import fs from "fs";
import path from "path";
import { assertEquals, directory } from "../test_helpers";

export const testNeedsWorkflow = () => {
  const myFirstJob: Job = {
    name: "My First Job",
    "runs-on": "ubuntu-20.04",
    steps: [
      {
        name: "My first step",
        run: 'echo "My First Step!"',
      },
    ],
  };

  const mySecondJob: Job = {
    name: "My Second Job",
    "runs-on": "ubuntu-20.04",
    needs: myFirstJob,
    steps: [
      {
        name: "My second step",
        run: 'echo "My Second Step!!"',
      },
    ],
  };

  const myThirdJob: Job = {
    name: "My Third Job",
    "runs-on": "ubuntu-20.04",
    needs: [myFirstJob, mySecondJob],
    steps: [
      {
        name: "My third step",
        run: 'echo "My Third Step!!!"',
      },
    ],
  };
  const workflow: Workflow = {
    name: "Needs Workflow",
    on: {
      push: {},
    },
    jobs: {
      myFirstJob,
      mySecondJob,
      myThirdJob,
    },
  };

  const actual = convertToYaml(workflow);

  const expected = fs
    .readFileSync(
      path.resolve(directory(import.meta.url), "needs-expected.yml")
    )
    .toString();

  assertEquals(actual, expected);
};
