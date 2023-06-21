import { Job, Step, Workflow } from "@wardellbagby/gh-workflow-gen";
import * as versions from "./Versions";

export type VersionedJob = Job<typeof versions>;
export type VersionedStep = Step<typeof versions>;
export type VersionedWorkflow = Workflow<typeof versions>;
