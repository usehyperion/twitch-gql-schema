#!/usr/bin/env bun

import { watch } from "node:fs";
import { dirname, join } from "node:path";
import type { Subprocess } from "bun";

const root = join(dirname(import.meta.dir), "");
const srcDir = join(root, "schema");
const entry = join(root, "index.ts");
const buildScript = join(import.meta.dir, "build.ts");

let server: Subprocess | null = null;
let restarting = false;
let pending = false;
let timer: Timer | null = null;

async function build() {
	const proc = Bun.spawn(["bun", "run", buildScript], {
		cwd: root,
		stdout: "inherit",
		stderr: "inherit",
	});
	return (await proc.exited) === 0;
}

async function stopServer() {
	if (!server) return;
	const proc = server;
	server = null;
	proc.kill();
	await proc.exited;
}

function startServer() {
	server = Bun.spawn(["bun", "run", entry], {
		cwd: root,
		stdout: "inherit",
		stderr: "inherit",
	});
}

async function cycle() {
	if (restarting) {
		pending = true;
		return;
	}
	restarting = true;
	do {
		pending = false;
		if (await build()) {
			await stopServer();
			startServer();
			console.log("server restarted");
		} else {
			console.error("build failed - server left running");
		}
	} while (pending);
	restarting = false;
}

// Coalesce the burst of events editors emit for a single save.
function schedule() {
	if (timer) clearTimeout(timer);
	timer = setTimeout(() => {
		timer = null;
		void cycle();
	}, 100);
}

const watcher = watch(srcDir, { recursive: true }, (_event, filename) => {
	if (filename && !filename.endsWith(".graphql")) return;
	console.log(`change: ${filename ?? srcDir}`);
	schedule();
});

async function shutdown() {
	watcher.close();
	if (timer) clearTimeout(timer);
	await stopServer();
	process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(`watching ${srcDir}`);
await cycle();
