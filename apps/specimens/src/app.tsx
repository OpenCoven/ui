import { useEffect, useRef, useState } from "react";
import {
  Asterisk,
  ArrowUpRight,
  GitFork,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { Button, TooltipProvider } from "@opencoven/ui";
import {
  catalog,
  componentHref,
  guides,
  repository,
  type Density,
} from "./catalog";
import { Home } from "./home";
import { Docs } from "./docs";
import { Lab } from "./lab";

type Scheme = "light" | "dark";
function preference(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const [scheme, setScheme] = useState<Scheme>(() =>
    preference("coven-ui:scheme", "dark") === "light" ? "light" : "dark",
  );
  const [density, setDensity] = useState<Density>(() =>
    preference("coven-ui:density", "default") === "compact"
      ? "compact"
      : "default",
  );
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchRegion = useRef<HTMLDivElement>(null);
  const isHome = path === "/";
  const isLab = path === "/lab";
  const searchItems = [
    ...guides,
    ...catalog.map((entry) => ({
      title: entry.title,
      href: componentHref(entry.name),
    })),
  ].filter((entry) =>
    entry.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", scheme === "dark");
    document.documentElement.dataset.density = "default";
    try {
      localStorage.setItem("coven-ui:scheme", scheme);
      localStorage.setItem("coven-ui:density", density);
    } catch {
      /* Preferences remain session-local when browser storage is blocked. */
    }
  }, [density, scheme]);
  useEffect(() => {
    const title =
      catalog.find((entry) => componentHref(entry.name) === path)?.title ??
      guides.find((guide) => guide.href === path)?.title ??
      (isHome
        ? "Built for agents. Made for humans."
        : isLab
          ? "Component lab"
          : "Components");
    document.title = `${title} — OpenCoven UI`;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!searchRegion.current?.contains(event.target as Node))
        setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [path, isHome, isLab]);

  return (
    <TooltipProvider>
      <div className="site font-sans">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <header className="site-header">
          <div className="site-header-inner">
            <a className="site-brand" href="/" aria-label="OpenCoven UI home">
              <Asterisk aria-hidden="true" />
              <span>
                coven<span className="brand-ui">ui</span>
              </span>
            </a>
            <nav
              className="primary-nav"
              data-open={menuOpen}
              aria-label="Main navigation"
            >
              <a
                href="/docs"
                aria-current={
                  path.startsWith("/docs") &&
                  !path.startsWith("/docs/components")
                    ? "page"
                    : undefined
                }
              >
                Docs
              </a>
              <a
                href="/docs/components"
                aria-current={
                  path.startsWith("/docs/components") ? "page" : undefined
                }
              >
                Components
              </a>
              <a href="/lab" aria-current={isLab ? "page" : undefined}>
                Lab <span className="nav-dot" />
              </a>
            </nav>
            <div className="header-tools">
              <div
                className="site-search"
                ref={searchRegion}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget))
                    setSearchOpen(false);
                }}
              >
                <Search aria-hidden="true" />
                <input
                  ref={searchRef}
                  aria-label="Search documentation"
                  aria-expanded={searchOpen}
                  aria-controls="search-results"
                  value={query}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSearchOpen(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.nativeEvent.isComposing || event.keyCode === 229)
                      return;
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      searchRegion.current
                        ?.querySelector<HTMLAnchorElement>(".search-result")
                        ?.focus();
                    }
                    if (event.key === "Enter" && searchItems[0])
                      window.location.assign(searchItems[0].href);
                  }}
                  placeholder="Search docs…"
                />
                <kbd>⌘ K</kbd>
                {searchOpen && (
                  <div className="search-results" id="search-results">
                    <span className="search-heading">
                      {query
                        ? `${searchItems.length} results`
                        : "Jump to a page"}
                    </span>
                    {searchItems.slice(0, 10).map((item) => (
                      <a
                        className="search-result"
                        href={item.href}
                        key={item.href}
                      >
                        {item.title}
                        <ArrowUpRight />
                      </a>
                    ))}
                    {!searchItems.length && (
                      <p role="status">No matching pages. Try “composer”.</p>
                    )}
                  </div>
                )}
              </div>
              <a
                className="icon-link github-link"
                href={repository}
                aria-label="OpenCoven UI on GitHub"
              >
                <GitFork aria-hidden="true" />
              </a>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Use ${scheme === "dark" ? "light" : "dark"} scheme`}
                onClick={() => setScheme(scheme === "dark" ? "light" : "dark")}
              >
                {scheme === "dark" ? <Sun /> : <Moon />}
              </Button>
              <Button
                className="mobile-nav-button"
                variant="ghost"
                size="icon"
                aria-label="Toggle navigation"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </header>
        {isHome ? (
          <Home />
        ) : isLab ? (
          <Lab density={density} />
        ) : (
          <Docs
            path={path}
            query={query}
            density={density}
            onDensityChange={setDensity}
          />
        )}
        <footer className="site-footer">
          <a className="site-brand" href="/">
            <Asterisk aria-hidden="true" />
            <span>
              coven<span className="brand-ui">ui</span>
            </span>
          </a>
          <p>Small components. A world of possibility.</p>
          <nav aria-label="Footer">
            <a href={repository}>
              GitHub <ArrowUpRight />
            </a>
            <a href="/docs">Documentation</a>
            <span>Made by OpenCoven</span>
          </nav>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export { App };
