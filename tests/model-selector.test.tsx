import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  ModelSelector,
  type ModelSelectorOption,
} from "@/components/agents/model-selector";

afterEach(cleanup);

const MODELS: ModelSelectorOption[] = [
  {
    value: "default",
    label: "Default",
    description: "Recommended set of models",
  },
  { value: "gpt-6-sol", label: "GPT-6 Sol" },
  { value: "gpt-6-luna", label: "GPT-6 Luna", disabled: true },
  { value: "gpt-5.6-sol", label: "GPT-5.6 Sol" },
];

describe("ModelSelector", () => {
  test("positions from the stationary anchor instead of the pressed button", async () => {
    const { getByRole } = render(<ModelSelector models={MODELS} defaultValue="gpt-6-sol" />);
    const trigger = getByRole("button", { name: /Model and effort/ });
    const rect = (left: number, top: number, width: number) => ({ left, top, width, height: 32, right: left + width, bottom: top + 32, x: left, y: top, toJSON: () => ({}) });
    (trigger.parentElement as HTMLElement).getBoundingClientRect = () => rect(300, 500, 160);
    trigger.getBoundingClientRect = () => rect(303, 501, 154);
    fireEvent.click(trigger);
    const panel = await waitFor(() => getByRole("dialog", { name: "Model and effort" }));
    const portal = panel.closest("[data-model-selector-portal]") as HTMLElement;
    expect(portal.style.left).toBe("188px");
    expect(portal.style.top).toBe("492px");
  });

  test("respects a model with no manual effort choices", async () => {
    const { queryByRole, getByText } = render(
      <ModelSelector models={[{ value: "auto", label: "Automatic model", efforts: [] }]} defaultValue="auto" defaultOpen />,
    );
    await waitFor(() => expect(getByText("Effort is managed automatically for this model.")).toBeTruthy());
    expect(queryByRole("slider")).toBeNull();
  });

  test("rapid effort changes do not retain stale animated labels", async () => {
    const { getByRole } = render(<ModelSelector models={MODELS} defaultValue="gpt-6-sol" defaultOpen />);
    const slider = await waitFor(() => getByRole("slider", { name: "Reasoning effort" }));
    const panel = getByRole("dialog", { name: "Model and effort" });
    fireEvent.keyDown(slider, { key: "Home" });
    fireEvent.keyDown(slider, { key: "End" });
    expect(panel.textContent).toContain("Ultra");
    expect(panel.textContent).not.toContain("High");
    expect(panel.textContent).not.toContain("Low");
  });

  test("tracks continuous drag positions, commits only crossed stops, and releases capture", async () => {
    const onEffortChange = mock(() => {});
    const { getByRole } = render(
      <ModelSelector models={MODELS} defaultValue="gpt-6-sol" defaultEffort="low" defaultOpen onEffortChange={onEffortChange} />,
    );
    const slider = await waitFor(() => getByRole("slider", { name: "Reasoning effort" }));
    const carriage = slider.parentElement as HTMLElement;
    const track = carriage.parentElement as HTMLElement;
    track.getBoundingClientRect = () => ({ left: 100, top: 0, width: 228, height: 32, right: 328, bottom: 32, x: 100, y: 0, toJSON: () => ({}) });
    const pointer = { pointerId: 7, pointerType: "mouse", button: 0, buttons: 1 };
    fireEvent.pointerDown(track, { ...pointer, clientX: 114 });
    fireEvent.pointerMove(track, { ...pointer, clientX: 154 });
    await waitFor(() => expect(carriage.style.transform).toContain("20%"));
    fireEvent.pointerMove(track, { ...pointer, clientX: 164 });
    await waitFor(() => expect(carriage.style.transform).toContain("25%"));
    expect(slider.getAttribute("aria-valuetext")).toBe("Medium");
    expect(onEffortChange).toHaveBeenCalledTimes(1);
    fireEvent.pointerMove(track, { ...pointer, pointerId: 8, clientX: 314 });
    expect(onEffortChange).toHaveBeenCalledTimes(1);
    fireEvent.pointerCancel(track, pointer);
    fireEvent.pointerMove(track, { ...pointer, clientX: 314 });
    expect(onEffortChange).toHaveBeenCalledTimes(1);
  });

  test("opens effort management before the model list", async () => {
    const { getByRole, queryByRole } = render(
      <ModelSelector models={MODELS} defaultValue="gpt-6-sol" />,
    );
    const trigger = getByRole("button", {
      name: /Model and effort: GPT-6 Sol, High effort/,
    });

    fireEvent.click(trigger);
    const panel = await waitFor(() =>
      getByRole("dialog", { name: "Model and effort" }),
    );

    expect(getByRole("slider", { name: "Reasoning effort" })).toBeTruthy();
    expect(
      getByRole("button", { name: "Change model: GPT-6 Sol" }),
    ).toBeTruthy();
    expect(queryByRole("listbox")).toBeNull();
    expect(
      panel.closest("[data-model-selector-portal]")?.parentElement,
    ).toBe(document.body);
  });

  test("opens the full model list and returns to effort after selection", async () => {
    const onValueChange = mock(() => {});
    const { getByRole, queryByRole } = render(
      <ModelSelector
        models={MODELS}
        defaultValue="gpt-6-sol"
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(getByRole("button", { name: /Model and effort/ }));
    fireEvent.click(
      await waitFor(() =>
        getByRole("button", { name: "Change model: GPT-6 Sol" }),
      ),
    );

    expect(getByRole("listbox", { name: "Select model" })).toBeTruthy();
    fireEvent.click(getByRole("option", { name: "GPT-5.6 Sol" }));

    expect(onValueChange).toHaveBeenCalledWith("gpt-5.6-sol");
    expect(queryByRole("listbox")).toBeNull();
    expect(
      getByRole("button", { name: "Change model: GPT-5.6 Sol" }),
    ).toBeTruthy();
    expect(getByRole("dialog", { name: "Model and effort" })).toBeTruthy();
  });

  test("changes and resets reasoning effort without speed controls", async () => {
    const onEffortChange = mock(() => {});
    const { getByRole } = render(
      <ModelSelector
        models={MODELS}
        defaultValue="gpt-6-sol"
        defaultEffort="high"
        onEffortChange={onEffortChange}
      />,
    );
    fireEvent.click(getByRole("button", { name: /Model and effort/ }));
    const slider = await waitFor(() =>
      getByRole("slider", { name: "Reasoning effort" }),
    );

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onEffortChange).toHaveBeenLastCalledWith("max");
    expect(slider.getAttribute("aria-valuetext")).toBe("Max");
    expect(
      getByRole("button", { name: /Model and effort: GPT-6 Sol, Max effort/ }),
    ).toBeTruthy();

    fireEvent.click(getByRole("button", { name: "Reset effort" }));
    expect(onEffortChange).toHaveBeenLastCalledWith("high");
    expect(slider.getAttribute("aria-valuetext")).toBe("High");
  });

  test("emits once per effort stop and skips disabled efforts", async () => {
    const onEffortChange = mock(() => {});
    const { getByRole } = render(
      <ModelSelector
        models={MODELS}
        defaultValue="gpt-6-sol"
        defaultEffort="low"
        efforts={[
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium", disabled: true },
          { value: "high", label: "High" },
        ]}
        onEffortChange={onEffortChange}
        defaultOpen
      />,
    );
    const slider = await waitFor(() =>
      getByRole("slider", { name: "Reasoning effort" }),
    );

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.getAttribute("aria-valuetext")).toBe("High");
    expect(slider.getAttribute("aria-valuemax")).toBe("1");
    expect(onEffortChange).toHaveBeenCalledTimes(1);
    expect(onEffortChange).toHaveBeenCalledWith("high");
  });

  test("keeps a separate valid effort for each model", async () => {
    const focused = [
      { value: "high", label: "High" },
      { value: "max", label: "Max" },
    ];
    const compact = [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
    ];
    const models: ModelSelectorOption[] = [
      {
        value: "sol",
        label: "GPT-6 Sol",
        efforts: focused,
        defaultEffort: "high",
      },
      {
        value: "luna",
        label: "GPT-6 Luna",
        efforts: compact,
        defaultEffort: "medium",
      },
    ];
    const { getByRole } = render(
      <ModelSelector
        models={models}
        defaultValue="sol"
        defaultEffort="high"
      />,
    );

    fireEvent.click(getByRole("button", { name: /Model and effort/ }));
    let slider = getByRole("slider", { name: "Reasoning effort" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.getAttribute("aria-valuetext")).toBe("Max");

    fireEvent.click(getByRole("button", { name: "Change model: GPT-6 Sol" }));
    fireEvent.click(getByRole("option", { name: "GPT-6 Luna" }));
    slider = getByRole("slider", { name: "Reasoning effort" });
    expect(slider.getAttribute("aria-valuetext")).toBe("Medium");
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(slider.getAttribute("aria-valuetext")).toBe("Low");

    fireEvent.click(getByRole("button", { name: "Change model: GPT-6 Luna" }));
    fireEvent.click(getByRole("option", { name: "GPT-6 Sol" }));
    expect(
      getByRole("slider", { name: "Reasoning effort" }).getAttribute(
        "aria-valuetext",
      ),
    ).toBe("Max");

    fireEvent.click(getByRole("button", { name: "Change model: GPT-6 Sol" }));
    fireEvent.click(getByRole("option", { name: "GPT-6 Luna" }));
    expect(
      getByRole("slider", { name: "Reasoning effort" }).getAttribute(
        "aria-valuetext",
      ),
    ).toBe("Low");
  });

  test("navigates models by identity and skips disabled rows", async () => {
    const onValueChange = mock(() => {});
    const { getByRole } = render(
      <ModelSelector
        models={MODELS}
        defaultValue="gpt-6-sol"
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(getByRole("button", { name: /Model and effort/ }));
    fireEvent.click(
      await waitFor(() =>
        getByRole("button", { name: "Change model: GPT-6 Sol" }),
      ),
    );

    const selected = await waitFor(() =>
      getByRole("option", { name: "GPT-6 Sol" }),
    );
    expect(document.activeElement).toBe(selected);
    fireEvent.keyDown(selected, { key: "ArrowDown" });

    const next = getByRole("option", { name: "GPT-5.6 Sol" });
    expect(next.dataset.active).toBe("true");
    expect(document.activeElement).toBe(next);
    expect(
      getByRole("option", { name: "GPT-6 Luna" }).dataset.active,
    ).toBe("false");

    fireEvent.keyDown(next, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("gpt-5.6-sol");
  });

  test("clears a stale active model when the catalog changes", async () => {
    const { getByRole, rerender } = render(
      <ModelSelector models={MODELS} defaultValue="gpt-6-sol" defaultOpen />,
    );
    fireEvent.click(
      await waitFor(() =>
        getByRole("button", { name: "Change model: GPT-6 Sol" }),
      ),
    );
    fireEvent.pointerMove(getByRole("option", { name: "GPT-5.6 Sol" }));

    const replacement = MODELS.map((model) =>
      model.value === "gpt-5.6-sol"
        ? { ...model, value: "gpt-5.6-terra", label: "GPT-5.6 Terra" }
        : model,
    );
    rerender(
      <ModelSelector
        models={replacement}
        defaultValue="gpt-6-sol"
        defaultOpen
      />,
    );

    expect(
      getByRole("option", { name: "GPT-6 Sol" }).dataset.active,
    ).toBe("true");
  });

  test("Escape returns from models before closing effort management", async () => {
    const { getByRole, queryByRole } = render(
      <ModelSelector models={MODELS} defaultValue="gpt-6-sol" />,
    );
    const trigger = getByRole("button", { name: /Model and effort/ });
    fireEvent.click(trigger);
    fireEvent.click(
      await waitFor(() =>
        getByRole("button", { name: "Change model: GPT-6 Sol" }),
      ),
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(queryByRole("listbox")).toBeNull();
    expect(getByRole("slider", { name: "Reasoning effort" })).toBeTruthy();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  test("closes on an outside press", async () => {
    const { getByRole } = render(
      <ModelSelector models={MODELS} defaultValue="gpt-6-sol" />,
    );
    const trigger = getByRole("button", { name: /Model and effort/ });
    fireEvent.click(trigger);
    await waitFor(() => expect(getByRole("dialog")).toBeTruthy());

    fireEvent.pointerDown(document.body);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  test("has no accessibility violations while effort management is open", async () => {
    const { getByRole } = render(
      <ModelSelector models={MODELS} defaultValue="gpt-6-sol" defaultOpen />,
    );
    const panel = await waitFor(() =>
      getByRole("dialog", { name: "Model and effort" }),
    );

    const results = await axe(panel);
    expect(results.violations).toEqual([]);
  });
});
