import { continuousIntegration } from "../.github/workflow-templates/continuousIntegration";
import { productionRelease } from "../.github/workflow-templates/productionRelease";
import { writeWorkflow } from "../src/index";

writeWorkflow(continuousIntegration);
writeWorkflow(productionRelease);
