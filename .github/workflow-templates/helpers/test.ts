import { AppJob } from "../index";
import { basicSetup } from "./basicSetup";

export const test: AppJob = {
  name: "Run tests",
  "runs-on": "ubuntu-20.04",
  steps: [
    ...basicSetup,
    {
      name: "Run tests",
      run: "npm run test",
    },
  ],
};
