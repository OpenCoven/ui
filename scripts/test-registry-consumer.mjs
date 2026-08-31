import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = process.cwd();
const consumer = path.join(root, ".tmp", "registry-consumer");
const registryRoot = path.join(root, "public", "r");

await rm(consumer, { recursive: true, force: true });
await mkdir(path.join(consumer, "src", "components", "ui"), {
  recursive: true,
});
await mkdir(path.join(consumer, "src", "lib"), { recursive: true });
await mkdir(path.join(consumer, "src", "styles"), { recursive: true });

await writeFile(
  path.join(consumer, "package.json"),
  `${JSON.stringify(
    {
      name: "opencoven-registry-consumer",
      version: "0.0.0",
      private: true,
      type: "module",
      dependencies: {
        react: "^19.2.8",
        "react-dom": "^19.2.8",
      },
      devDependencies: {
        "@types/react": "^19.2.14",
        "@types/react-dom": "^19.2.3",
        typescript: "~6.0.0",
      },
    },
    null,
    2,
  )}\n`,
);
await writeFile(
  path.join(consumer, "components.json"),
  `${JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema.json",
      style: "base-nova",
      rsc: false,
      tsx: true,
      tailwind: {
        config: "",
        css: "src/styles/globals.css",
        baseColor: "zinc",
        cssVariables: true,
        prefix: "",
      },
      iconLibrary: "lucide",
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
        hooks: "@/hooks",
        lib: "@/lib",
        ui: "@/components/ui",
      },
      registries: {
        "@opencoven": `http://127.0.0.1:PORT/{name}.json`,
      },
    },
    null,
    2,
  )}\n`,
);
await writeFile(
  path.join(consumer, "tsconfig.json"),
  `${JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM"],
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        ignoreDeprecations: "6.0",
        paths: {
          "@/*": ["./src/*"],
        },
      },
      include: ["src"],
    },
    null,
    2,
  )}\n`,
);
await writeFile(
  path.join(consumer, "src", "styles", "globals.css"),
  '@import "tailwindcss";\n',
);

const server = createServer(async (request, response) => {
  const name = path.basename(
    new URL(request.url ?? "/", "http://local").pathname,
  );
  if (!/^[a-z0-9-]+\.json$/.test(name)) {
    response.writeHead(404).end();
    return;
  }

  try {
    const body = await readFile(path.join(registryRoot, name));
    response.writeHead(200, {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") {
  throw new Error("Registry test server did not bind a TCP port");
}

const componentsPath = path.join(consumer, "components.json");
const components = JSON.parse(await readFile(componentsPath, "utf8"));
components.registries["@opencoven"] =
  `http://127.0.0.1:${address.port}/{name}.json`;
await writeFile(componentsPath, `${JSON.stringify(components, null, 2)}\n`);

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
  });
}

try {
  const items = ["composer", "developer-surface"];
  for (const item of items) {
    await run("pnpm", [
      "exec",
      "shadcn",
      "add",
      `http://127.0.0.1:${address.port}/${item}.json`,
      "--cwd",
      consumer,
      "--yes",
    ]);
  }

  await run("pnpm", ["--dir", consumer, "install", "--ignore-workspace"]);
  await run("pnpm", ["--dir", consumer, "exec", "tsc", "--noEmit"]);

  for (const [relativePath, label] of [
    ["src/components/blocks/composer.tsx", "composer"],
    ["src/components/blocks/developer-surface.tsx", "developer surface"],
  ]) {
    const source = await readFile(path.join(consumer, relativePath), "utf8");
    if (source.includes("@opencoven/ui")) {
      throw new Error(`${label} retained package-internal aliases`);
    }
  }

  console.log(
    `Clean consumer installed and type-checked ${items.join(", ")} from the generated registry.`,
  );
} finally {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  await rm(consumer, { recursive: true, force: true });
}
