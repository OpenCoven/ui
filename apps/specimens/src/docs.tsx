import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  PanelLeft,
  SlidersHorizontal,
} from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  buttonVariants,
} from "@opencoven/ui";
import {
  catalog,
  componentHref,
  exampleCode,
  groups,
  guides,
  installCommand,
  repository,
  type CatalogEntry,
  type Density,
} from "./catalog";
import { CodeBlock } from "./code-block";

export function Docs({
  path,
  query,
  density,
  onDensityChange,
}: {
  path: string;
  query: string;
  density: Density;
  onDensityChange: (density: Density) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const results = catalog.filter((entry) =>
    `${entry.title} ${entry.description} ${entry.group} ${entry.meta?.examples?.join(" ") ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const entry = catalog.find((item) => componentHref(item.name) === path);
  const isCatalog = path === "/docs/components";
  const isGuide = guides.some((guide) => guide.href === path);
  return (
    <div className="docs-layout">
      <div className="docs-mobile-toggle">
        <Button
          aria-expanded={menuOpen}
          aria-controls="docs-sidebar"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <PanelLeft data-icon="inline-start" />
          Documentation menu
        </Button>
      </div>
      <aside
        className="docs-sidebar"
        id="docs-sidebar"
        data-open={menuOpen}
        aria-label="Documentation navigation"
      >
        <nav>
          <div className="sidebar-group">
            <h2>Getting started</h2>
            {guides.map((guide) => (
              <a
                href={guide.href}
                key={guide.href}
                aria-current={path === guide.href ? "page" : undefined}
              >
                {guide.title}
              </a>
            ))}
            <a
              href="/docs/components"
              aria-current={isCatalog ? "page" : undefined}
            >
              All components <span>{catalog.length}</span>
            </a>
          </div>
          {groups.map((group) => (
            <div className="sidebar-group" key={group}>
              <h2>{group}</h2>
              {results
                .filter((item) => item.group === group)
                .map((item) => (
                  <a
                    key={item.name}
                    href={componentHref(item.name)}
                    aria-current={
                      path === componentHref(item.name) ? "page" : undefined
                    }
                  >
                    {item.title}
                  </a>
                ))}
            </div>
          ))}
          {results.length === 0 && <p role="status">No matching components.</p>}
        </nav>
        <a className="sidebar-lab" href="/lab">
          <Code2 />
          <span>
            See the bigger picture<small>Explore assembled examples</small>
          </span>
          <ArrowUpRight />
        </a>
      </aside>
      <main className="docs-main" id="main-content" tabIndex={-1}>
        <p className="breadcrumbs">
          <a href="/docs">Docs</a>
          <span>/</span>
          {entry ? (
            <>
              <a href="/docs/components">Components</a>
              <span>/</span>
              {entry.title}
            </>
          ) : isCatalog ? (
            "Components"
          ) : (
            (guides.find((guide) => guide.href === path)?.title ?? "Not found")
          )}
        </p>
        {entry ? (
          <ComponentDoc
            key={entry.name}
            entry={entry}
            density={density}
            onDensityChange={onDensityChange}
          />
        ) : isCatalog ? (
          <>
            <div className="docs-heading">
              <Badge variant="presence">The collection</Badge>
              <h1>Build with good pieces.</h1>
              <p>
                {catalog.length} focused components. One familiar system. Find
                what your interface needs and make it your own.
              </p>
            </div>
            {results.length ? (
              groups.map((group) => {
                const items = results.filter((item) => item.group === group);
                return items.length ? (
                  <section className="catalog-section" key={group}>
                    <h2>
                      {group}
                      <span>{items.length}</span>
                    </h2>
                    <div className="docs-catalog-grid">
                      {items.map((item) => (
                        <a
                          className="catalog-tile"
                          href={componentHref(item.name)}
                          key={item.name}
                        >
                          <div>
                            <h3>{item.title}</h3>
                            <ArrowUpRight aria-hidden="true" />
                          </div>
                          <p>{item.description}</p>
                        </a>
                      ))}
                    </div>
                  </section>
                ) : null;
              })
            ) : (
              <EmptyState
                title="Nothing by that name"
                description="Try a component, state, or concept such as composer, active, or context."
              />
            )}
          </>
        ) : isGuide ? (
          <Guide path={path} />
        ) : (
          <EmptyState
            title="Page not found"
            description="That component or guide isn’t in the collection."
            action={
              <a href="/docs/components" className={buttonVariants()}>
                Browse components
              </a>
            }
          />
        )}
      </main>
      <aside className="docs-contents">
        <span>On this page</span>
        {(entry
          ? ["Preview", "Installation", "Usage", "API reference"]
          : ["Overview", "Getting started"]
        ).map((label) => (
          <a key={label} href={`#${label.toLowerCase().replaceAll(" ", "-")}`}>
            {label}
          </a>
        ))}
        <div>
          <BookOpen />
          <p>
            Open source.
            <br />
            Open to possibility.
          </p>
          <a href={repository}>
            View on GitHub <ArrowUpRight />
          </a>
        </div>
      </aside>
    </div>
  );
}

function ComponentDoc({
  entry,
  density,
  onDensityChange,
}: {
  entry: CatalogEntry;
  density: Density;
  onDensityChange: (value: Density) => void;
}) {
  const index = catalog.indexOf(entry);
  const previous = catalog[index - 1];
  const next = catalog[index + 1];
  const code = exampleCode(entry);
  return (
    <>
      <header className="docs-heading">
        <Badge variant="neutral">{entry.group}</Badge>
        <h1>{entry.title}</h1>
        <p>{entry.description}</p>
        <a
          className="source-link"
          href={`${repository}/blob/main/${entry.sourcePath}`}
        >
          View source <ArrowUpRight />
        </a>
      </header>
      <section id="preview" className="doc-preview">
        <Tabs defaultValue="preview">
          <div className="preview-toolbar">
            <TabsList variant="line">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            {entry.source.includes('density?: "default" | "compact"') && (
              <label className="density-select">
                <SlidersHorizontal aria-hidden="true" />
                <span className="sr-only">Preview density</span>
                <select
                  value={density}
                  onChange={(event) =>
                    onDensityChange(event.target.value as Density)
                  }
                >
                  <option value="default">Cozy</option>
                  <option value="compact">Compact</option>
                </select>
              </label>
            )}
          </div>
          <TabsContent value="preview">
            <div className="component-stage">
              <entry.Component density={density} />
            </div>
            <div className="preview-caption">
              Live component preview <span>React · TypeScript</span>
            </div>
          </TabsContent>
          <TabsContent value="code">
            <CodeBlock
              code={code}
              language="typescript"
              label="example.tsx · package imports"
            />
          </TabsContent>
        </Tabs>
      </section>
      <section className="doc-section" id="installation">
        <h2>Installation</h2>
        <p>
          Add the component source to your project with the shadcn CLI. Its
          registry dependencies are included automatically.
        </p>
        <CodeBlock code={installCommand(entry.name)} />
        <p>
          Using the package instead? Follow the{" "}
          <a href="/docs/installation#package">package setup</a> and use{" "}
          <code>{entry.packagePath}</code>.
        </p>
      </section>
      <section className="doc-section" id="usage">
        <h2>Usage</h2>
        <p>
          For a registry install using the default aliases, import from your
          local source:
        </p>
        <CodeBlock
          label="Registry import"
          language="typescript"
          code={`import { ${entry.symbol} } from "${entry.consumerPath}";`}
        />
        <p>
          The Code tab contains the exact interactive example above, using
          package imports. Adapt those imports to your local paths when using
          registry source.
        </p>
        {entry.meta?.examples?.length ? (
          <div className="state-list">
            <span>Supported states</span>
            {entry.meta.examples.map((state) => (
              <Badge key={state} variant="neutral">
                {state}
              </Badge>
            ))}
          </div>
        ) : null}
      </section>
      <section className="doc-section" id="api-reference">
        <h2>API reference</h2>
        <p>
          {entry.api
            ? "The current public prop contract, taken directly from the component source."
            : "This primitive forwards its underlying element or Base UI props. See the source for its composition and supported variants."}
        </p>
        {entry.api ? (
          <CodeBlock
            code={entry.api}
            language="typescript"
            label="Component props"
          />
        ) : (
          <a
            className="source-link"
            href={`${repository}/blob/main/${entry.sourcePath}`}
          >
            Explore the full API <ArrowUpRight />
          </a>
        )}
        <p>
          Semantic tokens carry the visual treatment. Preserve accessible
          labels, explicit state cues, and visible focus when customizing your
          copy.
        </p>
      </section>
      <nav className="docs-pagination" aria-label="Adjacent components">
        {previous ? (
          <a href={componentHref(previous.name)}>
            <ArrowLeft />
            <span>
              <small>Previous</small>
              {previous.title}
            </span>
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a href={componentHref(next.name)}>
            <span>
              <small>Next</small>
              {next.title}
            </span>
            <ArrowRight />
          </a>
        )}
      </nav>
    </>
  );
}

function Guide({ path }: { path: string }) {
  if (path === "/docs/installation")
    return (
      <article className="guide">
        <header className="docs-heading" id="overview">
          <Badge variant="presence">Getting started</Badge>
          <h1>A few lines. All yours.</h1>
          <p>
            Install source through the registry, or consume the package. Same
            components. Your choice.
          </p>
        </header>
        <section className="doc-section" id="getting-started">
          <h2>Start with your foundation</h2>
          <p>
            Coven UI targets React 19.2 and Tailwind CSS 4. Interactive
            primitives use Base UI. Start in a React project with shadcn
            configured for Base UI and working component aliases.
          </p>
          <CodeBlock code="pnpm dlx shadcn@latest init --base base" />
          <h2>Add the Coven theme</h2>
          <p>
            The theme provides the semantic colors, typography, and density
            variables used throughout the library. Review the generated
            stylesheet, import it in your app entry, and keep only one Tailwind
            entry import.
          </p>
          <CodeBlock code={installCommand("coven-theme")} />
          <CodeBlock
            label="App entry · adjust the relative path"
            language="typescript"
            code={'import "./styles/opencoven.css";'}
          />
          <h2>Add your first component</h2>
          <CodeBlock code={installCommand("composer")} />
          <p>
            Registry items are copied into your project. You own them. For the
            default aliases, blocks go into <code>components/blocks</code>,
            Coven components into <code>components</code>, and primitives into{" "}
            <code>components/ui</code>. Your components.json aliases determine
            the exact locations.
          </p>
        </section>
        <section className="doc-section" id="package">
          <h2>Working with the package</h2>
          <p>
            The repository also exposes <code>@opencoven/ui</code> through its
            workspace package. To use that route, clone the GitHub repository
            and build the workspace. This does not assume an npm release is
            available.
          </p>
          <CodeBlock code="pnpm install\npnpm build" />
          <p>
            Within the workspace, add <code>@opencoven/ui: workspace:*</code> to
            your app dependencies, then import the stylesheet and components:
          </p>
          <CodeBlock
            label="Package imports"
            language="typescript"
            code={
              'import "@opencoven/ui/globals.css";\nimport { Composer } from "@opencoven/ui/blocks/composer";'
            }
          />
          <p>
            For projects outside this workspace, the shadcn CLI is the simplest
            source installation path.
          </p>
        </section>
      </article>
    );
  if (path === "/docs/theming")
    return (
      <article className="guide">
        <header className="docs-heading" id="overview">
          <Badge variant="presence">Make it yours</Badge>
          <h1>
            Familiar foundations.
            <br />
            Your own expression.
          </h1>
          <p>
            A small semantic vocabulary makes the whole interface feel like one
            considered system.
          </p>
        </header>
        <section className="doc-section" id="getting-started">
          <h2>Theme with meaning</h2>
          <p>
            Use background and foreground for the canvas, card for surfaces, and
            presence for familiar identity and intentional accents. Define
            tokens in your global stylesheet rather than overriding individual
            components.
          </p>
          <div className="token-swatches">
            {["background", "card", "foreground", "presence"].map((token) => (
              <div key={token}>
                <span style={{ background: `var(--${token})` }} />
                <code>--{token}</code>
              </div>
            ))}
          </div>
          <CodeBlock
            label="Your global stylesheet"
            language="css"
            code={
              ":root {\n  --oc-action: #7a22ee;\n  --oc-presence: #5e2a8a;\n}\n\n.dark {\n  --oc-action: #8e3dff;\n  --oc-presence: #b991ff;\n}"
            }
          />
          <h2>Light and dark</h2>
          <p>
            Add or remove <code>dark</code> on the root element. Components
            inherit their semantic colors without per-component dark-mode
            classes.
          </p>
          <CodeBlock
            label="Set the color scheme"
            language="typescript"
            code={'document.documentElement.classList.toggle("dark", isDark);'}
          />
          <h2>Density is explicit</h2>
          <p>
            Pass <code>density="compact"</code> to components that support it.
            Density changes spacing, not information hierarchy. The docs preview
            control lets you compare supported densities.
          </p>
          <CodeBlock
            label="Compact input"
            language="typescript"
            code={'<Input density="compact" aria-label="Project name" />'}
          />
          <h2>State is not decoration</h2>
          <p>
            Keep canonical tool classes stable: read, exec, write, and net have
            distinct meanings. Statuses pair color with text and icons. Preserve
            these cues, keyboard focus, and reduced-motion support when changing
            your theme.
          </p>
        </section>
      </article>
    );
  return (
    <article className="guide">
      <header className="docs-heading" id="overview">
        <Badge variant="presence">Welcome to the coven</Badge>
        <h1>
          Good interfaces
          <br />
          start with good pieces.
        </h1>
        <p>
          A collection of accessible, composable components for agent
          interfaces. Built with Base UI. Distributed the shadcn way.
        </p>
      </header>
      <div className="intro-callout">
        <BookOpen />
        <p>
          This is your source code, not a black box. Take the components you
          need, change what you want, and build something that feels like you.
        </p>
      </div>
      <section className="doc-section" id="getting-started">
        <h2>Less scaffolding. More making.</h2>
        <p>
          Coven UI brings intent, execution, and evidence into the same visual
          language. Start with familiar primitives, add focused controls, then
          compose complete agent surfaces.
        </p>
        <div className="guide-links">
          <a href="/docs/installation">
            <strong>Installation</strong>
            <p>A working foundation in a few commands.</p>
            <ArrowUpRight />
          </a>
          <a href="/docs/components">
            <strong>Explore the collection</strong>
            <p>{catalog.length} components, with live examples and source.</p>
            <ArrowUpRight />
          </a>
        </div>
        <h2>Four layers, one system</h2>
        {groups.map((group) => (
          <div className="guide-layer" key={group}>
            <h3>{group}</h3>
            <p>
              {
                {
                  Foundations:
                    "Buttons, inputs, menus, and the accessible primitives every product needs.",
                  "Composer controls":
                    "Express intent, choose authority, attach context, and send with confidence.",
                  "Run & evidence":
                    "Make progress, resource changes, context, and operational limits visible.",
                  Blocks:
                    "Complete composers, transcripts, session headers, and run rails.",
                }[group]
              }
            </p>
          </div>
        ))}
        <h2>Built to be understood</h2>
        <p>
          React 19.2, TypeScript, Tailwind CSS 4, and Base UI. Explicit props,
          readable source, keyboard-ready interactions, and light and dark
          themes. No model provider or backend is bundled into the components.
        </p>
      </section>
    </article>
  );
}
