import { NPM_PUBLISH } from "./helpers/Versions";
import { basicSetup } from "./helpers/basicSetup";
import { test } from "./helpers/test";
import { AppWorkflow } from "./index";

export const productionRelease: AppWorkflow = {
  name: "Release to NPM",
  on: {
    push: {
      tags: ["v*"],
    },
  },
  jobs: {
    test,
    publish: {
      name: "Release to NPM registry",
      needs: test,
      "runs-on": "ubuntu-20.04",
      steps: [
        ...basicSetup,
        {
          name: "Publish to NPM",
          uses: NPM_PUBLISH,
          with: {
            token: "${{ secrets.NPM_TOKEN }}",
            registry: "https://registry.npmjs.org/",
          },
        },
        {
          name: "Publish to GitHub",
          uses: NPM_PUBLISH,
          with: {
            token: "${{ secrets.GITHUB_TOKEN }}",
            registry: "https://npm.pkg.github.com",
          },
        },
      ],
    },
  },
};
