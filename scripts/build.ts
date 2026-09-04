#!/usr/bin/env bun
/**
 * Concatenates every `schema/**\/*.graphql` source file into the single
 * `schema.graphql` bundle that `index.ts` serves.
 */
import { Glob } from "bun";
import { dirname, join } from "node:path";

const root = join(dirname(import.meta.dir), "");
const srcDir = join(root, "schema");
const out = join(root, "schema.graphql");

const files = [...new Glob("**/*.graphql").scanSync(srcDir)].sort();
if (files.length === 0) throw new Error(`No .graphql files found in ${srcDir}`);

const parts = await Promise.all(
  files.map((f) => Bun.file(join(srcDir, f)).text()),
);

const header = "# GENERATED FILE - do not edit. Edit schema/**/*.graphql and run `bun run build`.\n\n";
const bundle = header + parts.map((p) => p.trim()).join("\n\n") + "\n";
await Bun.write(out, bundle);

console.log(`schema.graphql <- ${files.length} files, ${bundle.split("\n").length - 1} lines`);
