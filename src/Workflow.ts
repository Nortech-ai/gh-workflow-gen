export interface BranchesTagsOrPaths {
  branches?: string[];
  tags?: string[];
  paths?: string[];
}

export interface Schedule {
  cron: string;
}

type ubuntuVersions = "22.04" | "20.04" | "18.04" | "latest";
type macOSVersions = "12" | "11" | "10.15" | "latest";
type windowsVersions = "2016" | "2019" | "2022" | "latest";

type SelfHostedRunnerLabels =
  | "windows"
  | "linux"
  | "macOS"
  | "x64"
  | "ARM"
  | "ARM64"
  | string;

export type Runners =
  | `ubuntu-${ubuntuVersions}`
  | `macos-${macOSVersions}`
  | `windows-${windowsVersions}`
  | ["self-hosted", ...SelfHostedRunnerLabels[]];

export interface Job<
  VersionT extends Record<string, string> = Record<string, string>
> {
  name: string;
  "runs-on": Runners;
  needs?: Array<string | Job<VersionT>> | string | Job<VersionT>;
  if?: string;
  steps: Step<VersionT>[];
}

export interface Step<
  VersionT extends Record<string, string> = Record<string, string>
> {
  name: string;
  if?: string;
  uses?: VersionT[Extract<keyof VersionT, string>];

  run?: string;
  with?: Record<string, string | boolean | number>;
  env?: Record<string, string | boolean>;
}

export interface CacheStep {
  name: string;
  id: string;
  uses: `actions/cache@${string}`;
  with: {
    path: string;
    key: string;
    "restore-keys": string;
  };
}

export type Input = {
  required?: boolean;
  type?: "string" | "bool" | "number" | "enum";
};

export type Secret = {
  required?: boolean;
};

export interface Workflow<
  VersionT extends Record<string, string> = Record<string, string>
> {
  name: string;
  on: {
    push?: BranchesTagsOrPaths;
    pull_request?: BranchesTagsOrPaths;
    schedule?: Schedule[];
    workflow_dispatch?: Record<string, never>;
    workflow_call?: {
      inputs?: { [name: string]: Input };
      secrets?: { [name: string]: Secret };
    };
  };
  jobs: Record<string, Job<VersionT>>;
}
