#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-env --allow-run
// Copyright 2018-2022 the oak authors. All rights reserved. MIT license.

/**
 * This is the build script for building npm package.
 *
 * @module
 */

import { build, emptyDir } from "https://deno.land/x/dnt@0.34.0/mod.ts";

async function start() {
  await emptyDir("./npm");

  await build({
    entryPoints: ["./mod.ts"],
    outDir: "./npm",
    shims: {},
    test: false,
    typeCheck: false,
    compilerOptions: {
      importHelpers: false,
      target: "ES2021",
      lib: ["esnext", "dom", "dom.iterable"],
    },
    package: {
      name: "rad-event-listener",
      version: Deno.args[0],
      description:
        "Simple wrapper for addEventListener that returns a cleanup function so you don't have to call removeEventListener manually. The rad part is that it works with typescript 🤯",
      license: "MIT",
      keywords: ["addEventListener", "cleanup", "typescript"],
      engines: {
        node: ">=8.0.0",
      },
      repository: {
        type: "git",
        url: "git+https://github.com/JLarky/rad-event-listener.git",
      },
      bugs: {
        url: "https://github.com/JLarky/rad-event-listener/issues",
      },
      dependencies: {},
      devDependencies: {},
    },
  });

  await Deno.copyFile("LICENSE", "npm/LICENSE");
  await Deno.copyFile("README.npm.md", "npm/README.md");
}

start();
