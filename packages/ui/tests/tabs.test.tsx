import { render, screen } from "@testing-library/react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@opencoven/ui/components/ui/tabs";

describe("Tabs orientation", () => {
  it("stacks horizontal tab lists above their active panel", () => {
    const { container } = render(
      <Tabs defaultValue="overview">
        <TabsList aria-label="Sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="details">Details panel</TabsContent>
      </Tabs>,
    );

    const root = container.querySelector('[data-slot="tabs"]');
    expect(root).toHaveAttribute("data-orientation", "horizontal");
    expect(root).toHaveClass("flex-col");
    expect(screen.getByText("Overview panel")).toBeVisible();
    expect(screen.queryByText("Details panel")).not.toBeInTheDocument();
  });

  it("lets Base UI expose vertical orientation directly on the list", () => {
    const { container } = render(
      <Tabs defaultValue="overview" orientation="vertical">
        <TabsList aria-label="Sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
      </Tabs>,
    );

    const root = container.querySelector('[data-slot="tabs"]');
    const list = container.querySelector('[data-slot="tabs-list"]');
    expect(root).toHaveAttribute("data-orientation", "vertical");
    expect(root).not.toHaveClass("flex-col");
    expect(list).toHaveAttribute("data-orientation", "vertical");
  });
});
