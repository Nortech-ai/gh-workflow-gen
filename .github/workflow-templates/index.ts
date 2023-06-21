import { Job, Step, Workflow } from "../../src/";
import * as versions from "./helpers/Versions";

export type AppWorkflow = Workflow<typeof versions>;
export type AppStep = Step<typeof versions>;
export type AppJob = Job<typeof versions>;
