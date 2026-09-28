import { ArrowRight, Blocks, GitBranch, Sparkles } from "lucide-react";
import type { Specimen } from "./use-specimens";

const featured = [
  "composer",
  "mode-switch",
  "budget-pill",
  "activity-item",
  "run-rail",
  "context-meter",
  "transcript-turn",
];

export function Brand() {
  return (
    <a className="site-brand" href="/" aria-label="OpenCoven UI home">
      <Sparkles aria-hidden="true" />
      <span>
        OpenCoven <span className="site-brand__suffix">UI</span>
      </span>
    </a>
  );
}

export function Home({ specimens }: { specimens: Specimen[] }) {
  return (
    <main id="specimen-main" className="home" tabIndex={-1}>
      <section className="home-hero" aria-labelledby="home-title">
        <a className="home-announcement" href="https://github.com/OpenCoven/ui">
          Open source. Yours to build with. <ArrowRight aria-hidden="true" />
        </a>
        <h1 id="home-title">
          Thoughtful UI components
          <br />
          for agent experiences.
        </h1>
        <p>
          Composers, execution evidence, and familiar-native building blocks.
          Copy the source. Make it your own.
        </p>
        <div className="home-actions">
          <a
            className="home-button home-button--primary"
            href="/docs/introduction"
          >
            Get started <ArrowRight aria-hidden="true" />
          </a>
          <a className="home-button" href="/docs/components">
            <Blocks aria-hidden="true" /> Components
          </a>
        </div>
        <p className="home-stack">
          React <span aria-hidden="true">/</span> Tailwind CSS{" "}
          <span aria-hidden="true">/</span> Base UI{" "}
          <span aria-hidden="true">/</span> shadcn registry
        </p>
      </section>
      <section
        className="home-showcase"
        aria-label="Featured component previews"
      >
        {featured.map((id) => {
          const specimen = specimens.find((item) => item.id === id);
          if (!specimen) throw new Error(`Missing featured specimen: ${id}`);
          return (
            <article
              className={`showcase-tile showcase-tile--${id}`}
              key={id}
              aria-label={specimen.title}
            >
              <div className="showcase-tile__stage">
                {id === "composer" && (
                  <div className="showcase-intro">
                    <span className="showcase-intro__mark">
                      <Sparkles aria-hidden="true" />
                    </span>
                    <h2>Intent, with a little clarity.</h2>
                    <p>A place to think, plan, and build with your familiar.</p>
                  </div>
                )}
                {specimen.preview}
              </div>
              <a className="showcase-tile__link" href={`/docs/${id}`}>
                {specimen.title.replace(" block", "")}{" "}
                <ArrowRight aria-hidden="true" />
              </a>
            </article>
          );
        })}
      </section>
      <p className="home-caption">
        Real components, interactive previews. No agent runs or external
        actions.
      </p>
    </main>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Brand />
          <p>
            Thoughtful interfaces for people
            <br />
            and their familiars.
          </p>
          <a
            className="site-icon-link"
            href="https://github.com/OpenCoven/ui"
            aria-label="OpenCoven UI on GitHub"
          >
            <GitBranch aria-hidden="true" />
          </a>
        </div>
        <nav aria-label="Library resources">
          <h2>Library</h2>
          <a href="/docs/introduction">Introduction</a>
          <a href="/docs/installation">Installation</a>
          <a href="/docs/components">Components</a>
          <a href="/lab">Assembled lab</a>
        </nav>
        <nav aria-label="OpenCoven projects">
          <h2>OpenCoven</h2>
          <a href="https://github.com/OpenCoven">GitHub</a>
          <a href="https://github.com/OpenCoven/coven-cave">Coven Cave</a>
          <a href="https://github.com/OpenCoven/coven">Coven runtime</a>
        </nav>
        <div className="site-footer__note">
          <h2>Source you own</h2>
          <p>
            Install from the registry. Keep the code in your project. Build on
            your terms.
          </p>
        </div>
        <p className="site-footer__bottom">
          OpenCoven <span>Knowledge is Freedom.</span>
        </p>
      </div>
    </footer>
  );
}
