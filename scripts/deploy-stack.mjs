#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envConfig = JSON.parse(readFileSync(join(rootDir, "env.json"), "utf8"));
const extraCdkArgs = process.argv.slice(2);

run("npm", ["run", "build"], { stdio: "inherit" });

const outputDir = detectOutputDir(envConfig.outputDir);
const assetPath = relative(rootDir, outputDir) || ".";

run("npx", [
  "cdk",
  "bootstrap",
  `aws://${required(envConfig.account, "account")}/${required(envConfig.region, "region")}`,
], { stdio: "inherit" });

run("npx", [
  "cdk",
  "deploy",
  "--all",
  "--require-approval",
  "never",
  "--context",
  `assetPath=${assetPath}`,
  ...extraCdkArgs,
], { stdio: "inherit" });

function required(value, name) {
  if (!value) {
    throw new Error(`Missing required env.json field: ${name}`);
  }
  return String(value);
}

function detectOutputDir(configuredOutputDir) {
  const candidates = [
    configuredOutputDir,
    ".output/public",
    "dist",
    "build",
    "out",
  ].filter(Boolean);

  const found = candidates
    .map((candidate) => resolve(rootDir, candidate))
    .find((candidate) => existsSync(join(candidate, "index.html")) && statSync(candidate).isDirectory());

  if (!found) {
    throw new Error(`Could not find build output. Tried: ${candidates.join(", ")}`);
  }

  return found;
}

function run(command, args, options = {}) {
  execFileSync(command, args, {
    cwd: rootDir,
    env: { ...process.env, AWS_PAGER: "" },
    stdio: options.stdio || "pipe",
  });
}
