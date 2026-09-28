import { Button, SearchField, TooltipProvider } from "@opencoven/ui";
import {
  ArrowLeft,
  ArrowRight,
  GitBranch,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CodeBlock } from "./code-block";
import { Brand, Home, SiteFooter } from "./home";
import { DensityControl, Lab, Library, SpecimenCard } from "./specimens";
import {
  groupOrder,
  groupDetails,
  matchesSpecimen,
  useSpecimens,
  type Density,
} from "./use-specimens";

type Scheme = "light" | "dark";
const guides = [
  {
    id: "introduction",
    title: "Introduction",
    description: "Building agent interfaces with OpenCoven UI.",
  },
  {
    id: "installation",
    title: "Installation",
    description: "Add OpenCoven components to your React project.",
  },
  {
    id: "components",
    title: "Components",
    description:
      "Explore the building blocks. Preview, install, and make them yours.",
  },
];

function GettingStarted({ installation }: { installation: boolean }) {
  return (
    <div className="docs-prose">
      {!installation && (
        <>
          <section id="overview">
            <h2>Interfaces for entrusted work</h2>
            <p>
              OpenCoven UI is a collection of React components for agent
              experiences: composing intent, following execution, and keeping
              evidence in view. Every preview uses the same public modules you
              install.
            </p>
            <p>
              Start with individual components or use complete blocks like the
              Composer, Run rail, and Transcript turn. Familiar identity,
              authority, and operational state stay explicit.
            </p>
          </section>
          <section id="foundation">
            <h2>A familiar foundation</h2>
            <p>
              Built with TypeScript, Tailwind CSS 4, and Base UI. Semantic
              tokens carry light and dark themes, lavender presence, tool
              classes, and explicit cozy and compact densities.
            </p>
            <p>
              Keyboard access, visible focus, and reduced-motion feedback belong
              to the components, not a separate demo layer.
            </p>
          </section>
        </>
      )}
      <section id="installation">
        <h2>
          {installation ? "Before you start" : "Bring it into your project"}
        </h2>
        <p>
          Use a React 19 project with Tailwind CSS 4 and shadcn initialized. The
          registry adds editable source to your project; the package provides
          public imports from the same source tree.
        </p>
        <h3>Install from the registry</h3>
        <p>
          Add the OpenCoven namespace to your existing{" "}
          <code>components.json</code> registries:
        </p>
        <CodeBlock label="components.json">{`{
  "registries": {
    "@opencoven": "https://ui.opencoven.ai/r/{name}.json"
  }
}`}</CodeBlock>
        <CodeBlock label="Registry install">
          pnpm dlx shadcn@latest add @opencoven/composer
        </CodeBlock>
        <h3>Or use the package</h3>
        <CodeBlock label="Package install">pnpm add @opencoven/ui</CodeBlock>
        <CodeBlock label="React imports">{`import "@opencoven/ui/globals.css";
import { Composer } from "@opencoven/ui/blocks/composer";`}</CodeBlock>
        <p>
          Import the theme once at your application entry point. Each component
          page includes its exact registry URL and React import path.
        </p>
      </section>
      <section id="next">
        <h2>Build your first surface</h2>
        <p>
          Explore individual previews or see how the pieces fit together in the
          five-state lab.
        </p>
        <div className="docs-next">
          <a href="/docs/components">
            Browse components <ArrowRight aria-hidden="true" />
          </a>
          <a href="/lab">
            Open assembled lab <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}

export function App() {
  const [scheme, setScheme] = useState<Scheme>(() =>
    localStorage.getItem("coven-ui:scheme") === "light" ? "light" : "dark",
  );
  const [density, setDensity] = useState<Density>(() =>
    localStorage.getItem("coven-ui:density") === "compact"
      ? "compact"
      : "default",
  );
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const isHome = path === "/";
  const isLab = path === "/lab";
  const pageId =
    path === "/docs"
      ? "introduction"
      : path.startsWith("/docs/")
        ? path.slice(6)
        : "";
  const specimens = useSpecimens(density);
  const specimen = specimens.find((item) => item.id === pageId);
  const nextSpecimen = specimen
    ? specimens[specimens.indexOf(specimen) + 1]
    : undefined;
  const guide = guides.find((item) => item.id === pageId);
  const title = isHome
    ? "OpenCoven UI"
    : isLab
      ? "Assembled lab"
      : (specimen?.title ?? guide?.title ?? "Page not found");
  const results = [
    ...guides
      .filter((item) =>
        `${item.title} ${item.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
      .map((item) => ({ ...item, category: "Getting started" })),
    ...specimens
      .filter((item) => matchesSpecimen(item, query))
      .map((item) => ({ ...item, category: item.group })),
  ];
  const toc = isLab
    ? [{ id: "assembled-lab", title: "Workbench" }]
    : specimen
      ? [
          { id: specimen.id, title: "Preview & installation" },
          { id: "states", title: "States" },
        ]
      : pageId === "components"
        ? groupOrder
            .filter((group) =>
              specimens.some(
                (item) => item.group === group && matchesSpecimen(item, query),
              ),
            )
            .map((group) => ({ id: groupDetails[group].id, title: group }))
        : [
            ...(pageId === "introduction"
              ? [
                  { id: "overview", title: "Overview" },
                  { id: "foundation", title: "Foundation" },
                ]
              : []),
            { id: "installation", title: "Installation" },
            { id: "next", title: "Next steps" },
          ];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", scheme === "dark");
    document.documentElement.dataset.density = density;
    localStorage.setItem("coven-ui:scheme", scheme);
    localStorage.setItem("coven-ui:density", density);
  }, [density, scheme]);

  useEffect(() => {
    document.title = isHome ? title : `${title} - OpenCoven UI`;
  }, [isHome, title]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        if (searchAreaRef.current?.contains(document.activeElement)) {
          event.preventDefault();
        }
        if (document.activeElement?.closest(".site-search-results")) {
          searchRef.current?.focus();
        }
        if (
          document.activeElement?.closest("#site-navigation") &&
          menuButtonRef.current?.getClientRects().length
        ) {
          menuButtonRef.current.focus();
        }
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !searchAreaRef.current?.contains(event.target)
      )
        setSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const update = () =>
      document.documentElement.style.setProperty(
        "--specimen-topbar-height",
        `${Math.ceil(header.getBoundingClientRect().height)}px`,
      );
    const observer = new ResizeObserver(update);
    update();
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <TooltipProvider>
      <a className="skip-link" href="#specimen-main">
        Skip to content
      </a>
      <header className="site-header" ref={headerRef}>
        <div className="site-header__inner">
          <Button
            ref={menuButtonRef}
            className="site-menu-toggle"
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
          <Brand />
          <nav className="site-links" aria-label="Main navigation">
            <a
              href="/docs/introduction"
              aria-current={
                guide && pageId !== "components" ? "page" : undefined
              }
            >
              Docs
            </a>
            <a
              href="/docs/components"
              aria-current={
                specimen || pageId === "components" ? "page" : undefined
              }
            >
              Components
            </a>
            <a href="/lab" aria-current={isLab ? "page" : undefined}>
              Lab
            </a>
          </nav>
          <div className="site-actions">
            <div
              className="site-search"
              role="search"
              aria-label="Documentation"
              ref={searchAreaRef}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setSearchOpen(false);
              }}
            >
              <SearchField
                ref={searchRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search documentation..."
                shortcut="⌘K"
                aria-label="Search documentation"
                aria-controls={searchOpen ? "site-search-results" : undefined}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    searchAreaRef.current
                      ?.querySelector<HTMLAnchorElement>(
                        ".site-search-results a",
                      )
                      ?.focus();
                  }
                }}
              />
              {searchOpen && (
                <div className="site-search-results" id="site-search-results">
                  <p role="status">
                    {results.length}{" "}
                    {results.length === 1 ? "result" : "results"}
                  </p>
                  {results.length ? (
                    <nav
                      aria-label="Search results"
                      onKeyDown={(event) => {
                        if (
                          !["ArrowDown", "ArrowUp", "Home", "End"].includes(
                            event.key,
                          )
                        )
                          return;
                        const links = [
                          ...event.currentTarget.querySelectorAll("a"),
                        ];
                        const current = links.findIndex(
                          (link) => link === document.activeElement,
                        );
                        event.preventDefault();
                        if (event.key === "ArrowUp" && current === 0) {
                          searchRef.current?.focus();
                          return;
                        }
                        const next =
                          event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? links.length - 1
                              : Math.min(
                                  links.length - 1,
                                  current +
                                    (event.key === "ArrowDown" ? 1 : -1),
                                );
                        links[next]?.focus();
                      }}
                    >
                      {results.map((item) => (
                        <a key={item.id} href={`/docs/${item.id}`}>
                          <span>{item.title}</span>
                          <small>{item.category}</small>
                          <ArrowRight aria-hidden="true" />
                        </a>
                      ))}
                    </nav>
                  ) : (
                    <p>Try a component name, state, or “installation”.</p>
                  )}
                </div>
              )}
            </div>
            <a
              className="site-icon-link site-github"
              href="https://github.com/OpenCoven/ui"
              aria-label="OpenCoven UI on GitHub"
            >
              <GitBranch aria-hidden="true" />
            </a>
            <Button
              variant="ghost"
              size="icon"
              className="site-scheme"
              aria-label={`Use ${scheme === "dark" ? "light" : "dark"} scheme`}
              onClick={() => setScheme(scheme === "dark" ? "light" : "dark")}
            >
              {scheme === "dark" ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </header>
      <div
        className={isHome ? "site-layout site-layout--home" : "site-layout"}
        data-menu-open={menuOpen}
      >
        <aside
          className="docs-sidebar"
          id="site-navigation"
          aria-label="Documentation navigation"
        >
          <nav>
            <div className="docs-nav-group">
              <h2>Getting started</h2>
              {guides.map((item) => (
                <a
                  key={item.id}
                  href={`/docs/${item.id}`}
                  aria-current={pageId === item.id ? "page" : undefined}
                >
                  {item.title}
                </a>
              ))}
              <a href="/lab" aria-current={isLab ? "page" : undefined}>
                Assembled lab
              </a>
            </div>
            {groupOrder.map((group) => (
              <div className="docs-nav-group" key={group}>
                <h2>{group}</h2>
                {specimens
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <a
                      key={item.id}
                      href={`/docs/${item.id}`}
                      aria-current={pageId === item.id ? "page" : undefined}
                    >
                      {item.title.replace(" block", "")}
                    </a>
                  ))}
              </div>
            ))}
          </nav>
          <div className="docs-sidebar__foot">
            <code>@opencoven/ui</code>
            <span>Knowledge is Freedom.</span>
          </div>
        </aside>
        {isHome ? (
          <Home specimens={specimens} />
        ) : (
          <main className="docs-main" id="specimen-main" tabIndex={-1}>
            <div className="docs-content">
              <header className="docs-heading">
                <p className="docs-breadcrumb">
                  Docs <span aria-hidden="true">/</span>{" "}
                  {specimen?.group ?? (isLab ? "Examples" : "Getting started")}
                </p>
                <h1 id={specimen ? `${specimen.id}-title` : undefined}>
                  {title}
                </h1>
                <p>
                  {specimen?.description ??
                    guide?.description ??
                    (isLab
                      ? "Five focused views, composed entirely from public OpenCoven modules."
                      : "This page is not part of the library. Browse the components to find what you need.")}
                </p>
              </header>
              {(specimen || pageId === "components" || isLab) && (
                <div className="docs-preview-toolbar">
                  <span>Preview density</span>
                  <DensityControl
                    density={density}
                    onDensityChange={setDensity}
                  />
                </div>
              )}
              {isLab ? (
                <Lab density={density} />
              ) : specimen ? (
                <>
                  <SpecimenCard specimen={specimen} detail />
                  <section className="docs-prose" id="states">
                    <h2>States</h2>
                    <p>{specimen.states}.</p>
                    <p>
                      Use semantic tokens and explicit state labels. Compact
                      density is opt-in; keyboard focus and reduced-motion
                      feedback remain visible.
                    </p>
                  </section>
                  <div className="docs-next">
                    <a href="/docs/components">
                      <ArrowLeft aria-hidden="true" /> All components
                    </a>
                    {nextSpecimen && (
                      <a href={`/docs/${nextSpecimen.id}`}>
                        {nextSpecimen.title} <ArrowRight aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </>
              ) : pageId === "components" ? (
                <Library specimens={specimens} query={query} />
              ) : guide ? (
                <GettingStarted installation={pageId === "installation"} />
              ) : (
                <a className="home-button" href="/docs/components">
                  Browse components <ArrowRight aria-hidden="true" />
                </a>
              )}
            </div>
            {(guide || specimen || isLab) && (
              <nav className="docs-toc" aria-label="On this page">
                <h2>On this page</h2>
                {toc.map((item) => (
                  <a key={item.id} href={`#${item.id}`}>
                    {item.title}
                  </a>
                ))}
                <a href="https://github.com/OpenCoven/ui">
                  View source <GitBranch aria-hidden="true" />
                </a>
              </nav>
            )}
          </main>
        )}
      </div>
      <SiteFooter />
    </TooltipProvider>
  );
}
