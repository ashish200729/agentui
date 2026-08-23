import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { AgentActivityLandingPreview } from "@/components/previews/agents/agent-activity-landing.preview";

afterEach(cleanup);

describe("AgentActivityLandingPreview", () => {
  test("renders complete stable copy without the streaming demo lifecycle", () => {
    const { getByText, queryByText } = render(<AgentActivityLandingPreview />);

    expect(
      getByText("Separated the content model from the presentation."),
    ).toBeTruthy();
    expect(
      getByText("Preserved the full history while keeping the latest result in view."),
    ).toBeTruthy();
    expect(queryByText("Thinking…")).toBeNull();
    expect(queryByText("Replay")).toBeNull();
  });
});
