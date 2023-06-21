import crypto from "crypto";
import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import slugify from "slugify";
import { CacheStep, Job, Step, Workflow } from "./Workflow";
export * from "./Workflow";
/**
 * Convert an array of entries into an object of type T;
 */
const fromEntries = <T>(entries: Array<[keyof T, T[keyof T]]>): T => {
  const newObject = Object.create(null);
  for (const [key, val] of entries) {
    newObject[key] = val;
  }
  return newObject;
};

const error = (message: string): never => {
  throw new Error(message);
};

/**
 * A very complicated way to replace the "needs" field with the actual key of
 * the job being depended on.
 *
 * @param workflow The Workflow to normalize.
 */
const normalize = <T extends Record<string, string>>(
  workflow: Workflow<T>
): Workflow<T> => ({
  ...workflow,
  jobs: fromEntries(
    Object.entries(workflow.jobs).map((namedJob) => {
      const [name, job] = namedJob;
      return [
        name,
        {
          ...job,
          needs: (Array.isArray(job.needs)
            ? job.needs
            : job.needs === undefined
            ? undefined
            : [job.needs]
          )?.map((need: string | Job<T>) => {
            if (typeof need === "string") {
              return need;
            } else {
              const reference = Object.entries(workflow.jobs).find(
                (match) => match[1] === need
              );
              return reference[0];
            }
          }),
        },
      ];
    })
  ),
});

/**
 * Iterates through all parent directories until it finds a valid GitHub Workflows folder and returns it if it
 * exists, and null otherwise.
 *
 * @param dir An optional starting directory. If not supplied, will default to the current working directory.
 */
export const findNearestWorkflowFolder = (dir?: string): string | null => {
  const currentDir = path.resolve(dir ?? process.cwd());
  for (const dir of fs.readdirSync(currentDir)) {
    if (dir === ".github") {
      return path.resolve(dir, "workflows");
    }
  }
  const parentDir = path.resolve(currentDir, "..");
  if (parentDir === currentDir) {
    return null;
  }
  return findNearestWorkflowFolder(parentDir);
};
/**
 * Write the given Workflow to a YAML file.

 * @param workflow The Workflow to write.
 * @param file An optional file to write to. If not given, will default to a file based on the name of the Workflow
 * in the first GitHub Workflows folder that can be found by iterating through parent directories, starting at the
 * current working directory.

 * @see findNearestWorkflowFolder
 */
export const writeWorkflow = <T extends Record<string, string>>(
  workflow: Workflow<T>,
  file?: string
) => {
  const outputFile =
    file ??
    path.resolve(
      findNearestWorkflowFolder() ??
        error("Failed to find a valid GitHub Workflows folder."),
      `${workflow.name.replace(/\s/g, "-")}.yml`
    );

  fs.mkdirSync(path.resolve(outputFile, ".."), { recursive: true });
  fs.writeFileSync(outputFile, convertToYaml(workflow));
};

/**
 * Convert the given Workflow to a YAML file that is valid for GitHub.
 * @param workflow The Workflow to convert.
 */
export const convertToYaml = <T extends Record<string, string>>(
  workflow: Workflow<T>
): string => {
  return yaml.dump(normalize(workflow), { noRefs: true });
};

/**
 * Add a cache step to the given step.
 * @param step The step to add a cache to.
 * @param cache How to configure the cache.
 * @param runEvenWhenCacheHit Whether to run the step even if the cache is hit.
 * */
export function stepWithCache(
  step: Step,
  cache: Omit<CacheStep, "name" | "uses" | "with" | "id"> & {
    id?: string;
    with: Omit<CacheStep["with"], "key"> & {
      key?: string;
    };
  },
  runEvenWhenCacheHit?: boolean
) {
  const cacheId =
    cache.id ??
    `cache-${slugify(step.name, {
      lower: true,
      replacement: "-",
    })}`;
  const hashedKey = crypto
    .createHash("md5")
    .update(JSON.stringify(step.with))
    .digest("hex");
  const cacheStep = {
    name: `Cache - ${step.name}`,
    uses: "actions/cache@v3",
    ...cache,
    id: cacheId,
    with: {
      ...cache.with,
      key: `${cacheId}-\${{ runner.os }}-${hashedKey}-${cache.with.key ?? ""}`,
    },
  } satisfies CacheStep;

  const finalStep = {
    ...step,
    //TODO: merge ifs
    ...(!runEvenWhenCacheHit
      ? { if: `steps.${cacheId}.outputs.cache-hit != 'true'` }
      : {}),
  };

  return [cacheStep, finalStep] as const;
}
