import { render, screen } from "@testing-library/react";

import { SessionHeader } from "@opencoven/ui/blocks/session-header";
import { TranscriptTurn } from "@opencoven/ui/blocks/transcript-turn";

describe("mobile block composition", () => {
  it("lets transcript provenance and utilities wrap without establishing intrinsic width", () => {
    const { container } = render(
      <TranscriptTurn
        familiar="Cody"
        initials="CO"
        role="Code Familiar"
        model="GPT-5.6 Sol"
        timestamp="now"
        utilities={
          <>
            <span>Reply</span>
            <span>Copy</span>
            <span>1.8K tokens</span>
          </>
        }
      >
        <p>The component source and registry share one boundary.</p>
      </TranscriptTurn>,
    );

    const turn = container.querySelector('[data-slot="transcript-turn"]');
    expect(turn).toHaveClass("min-w-0", "ps-3", "sm:ps-5");

    const provenance = screen.getByText(/Code Familiar/);
    expect(provenance).toHaveClass("break-words", "sm:truncate");

    const utilities = screen.getByLabelText("Message utilities");
    expect(utilities).toHaveClass("flex-wrap", "gap-y-1.5");
  });

  it("gives session identity a full mobile row and keeps state metadata independently reflowable", () => {
    const { container } = render(
      <SessionHeader
        title="Keep escaped delimiters without clipping the task title"
        branch="fix/tokenizer-escapes-with-a-long-branch-name"
        status="active"
        budget={{ used: 0.41, limit: 5 }}
      />,
    );

    const header = container.querySelector('[data-slot="session-header"]');
    expect(header).toHaveClass("grid", "grid-cols-2", "sm:flex");

    const title = screen.getByText(
      "Keep escaped delimiters without clipping the task title",
    );
    expect(title).toHaveClass("leading-5", "sm:truncate");
    expect(title).not.toHaveClass("truncate");

    const branch = screen.getByText(
      "fix/tokenizer-escapes-with-a-long-branch-name",
    );
    expect(branch).toHaveClass("min-w-0", "truncate");
  });
});
