"use client";

import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  EASE_OUT,
  SPRING_GLIDE,
  SPRING_LAYOUT,
  SPRING_PANEL,
  SPRING_PRESS,
  SPRING_SWAP,
} from "@/lib/ease";
import { useOnOpen } from "@/lib/hooks/use-on-open";
import { useSlider } from "@/lib/hooks/use-slider";
import { PresenceGate } from "@/lib/presence-gate";
import { capturePointer, releasePointer, TOUCH_GESTURE_CLASS } from "@/lib/touch";
import { cn } from "@/lib/utils";

type Side = "top" | "bottom";
type Align = "start" | "end";
type PanelView = "effort" | "models";

const VIEWPORT_PADDING = 12;
const PANEL_WIDTH = 272;
const PANEL_MAX_HEIGHT = 320;

export interface ModelSelectorEffortOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const DEFAULT_MODEL_EFFORTS: readonly ModelSelectorEffortOption[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "xhigh", label: "X-high" },
  { value: "max", label: "Max" },
  { value: "ultra", label: "Ultra" },
];

export interface ModelSelectorOption {
  value: string;
  label: ReactNode;
  /** Accessible text when `label` is not a string. Falls back to `value`. */
  textValue?: string;
  description?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
  /** Model-specific effort choices. Falls back to the root `efforts` prop. */
  efforts?: readonly ModelSelectorEffortOption[];
  defaultEffort?: string;
}

export interface ModelSelectorProps {
  models: readonly ModelSelectorOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  efforts?: readonly ModelSelectorEffortOption[];
  effort?: string;
  defaultEffort?: string;
  onEffortChange?: (effort: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  placeholder?: ReactNode;
  /** Accessible name for the trigger and effort panel. */
  label?: string;
  modelListLabel?: string;
  effortLabel?: string;
  side?: Side;
  align?: Align;
  sideOffset?: number;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

function optionText(option: ModelSelectorOption | undefined) {
  if (!option) return undefined;
  if (option.textValue) return option.textValue;
  if (typeof option.label === "string" || typeof option.label === "number") {
    return String(option.label);
  }
  return option.value;
}

function enabledModelValue(
  models: readonly ModelSelectorOption[],
  candidate: string | null | undefined,
) {
  return candidate !== null && candidate !== undefined
    ? models.find((model) => model.value === candidate && !model.disabled)?.value ??
        null
    : null;
}

function enabledEffortValue(
  efforts: readonly ModelSelectorEffortOption[],
  candidate: string | null | undefined,
) {
  return candidate !== null && candidate !== undefined
    ? efforts.find((effort) => effort.value === candidate && !effort.disabled)
        ?.value ?? null
    : null;
}

function effortsFor(
  model: ModelSelectorOption | undefined,
  fallback: readonly ModelSelectorEffortOption[],
) {
  return model?.efforts ?? fallback;
}

type TriggerRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
};

function sameTriggerRect(current: TriggerRect | null, next: TriggerRect) {
  return (
    current?.left === next.left &&
    current.top === next.top &&
    current.width === next.width &&
    current.height === next.height &&
    current.viewportWidth === next.viewportWidth &&
    current.viewportHeight === next.viewportHeight
  );
}

/** Measure only the anchor. Panel size changes must never feed positioning. */
function useTriggerRect(
  triggerRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  const [rect, setRect] = useState<TriggerRect | null>(null);
  const update = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const box = trigger.getBoundingClientRect();
    const next = {
      left: box.left,
      top: box.top,
      width: box.width,
      height: box.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
    setRect((current) => (sameTriggerRect(current, next) ? current : next));
  }, [triggerRef]);

  useLayoutEffect(() => {
    update();
    if (!active) return;
    const trigger = triggerRef.current;
    const observer = new ResizeObserver(update);
    if (trigger) observer.observe(trigger);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [active, triggerRef, update]);

  return rect;
}

/** Keep the active model valid while a streamed catalog changes identity. */
function useModelCursor({
  open,
  models,
  value,
}: {
  open: boolean;
  models: readonly ModelSelectorOption[];
  value: string | undefined;
}) {
  const [cursor, setCursor] = useState<string | null>(null);
  const enabled = useMemo(
    () => models.filter((model) => !model.disabled),
    [models],
  );
  const liveCursor = enabledModelValue(enabled, cursor);

  if (cursor !== null && liveCursor === null) setCursor(null);

  const fallback = enabledModelValue(enabled, value) ?? enabled[0]?.value ?? null;
  const activeValue = liveCursor ?? fallback;
  const latest = useRef({ open, enabled, value });

  useLayoutEffect(() => {
    latest.current = { open, enabled, value };
  });

  const reset = useCallback(() => setCursor(null), []);
  const moveTo = useCallback(
    (next: string | null) =>
      setCursor((current) => (current === next ? current : next)),
    [],
  );
  const move = useCallback((direction: 1 | -1 | "first" | "last") => {
    const current = latest.current;
    if (!current.open || current.enabled.length === 0) return;

    setCursor((previous) => {
      const rows = current.enabled;
      const last = rows.length - 1;
      const from =
        enabledModelValue(rows, previous) ??
        enabledModelValue(rows, current.value) ??
        rows[0]?.value ??
        null;
      const at = Math.max(
        rows.findIndex((model) => model.value === from),
        0,
      );
      const index =
        direction === "first"
          ? 0
          : direction === "last"
            ? last
            : (at + direction + rows.length) % rows.length;
      return rows[index]?.value ?? null;
    });
  }, []);

  useOnOpen(open, reset);

  return { activeValue, move, moveTo };
}

function EffortSlider({
  efforts,
  value,
  onValueChange,
  label,
  disabled,
  reduce,
}: {
  efforts: readonly ModelSelectorEffortOption[];
  value: string | undefined;
  onValueChange: (value: string) => void;
  label: string;
  disabled: boolean;
  reduce: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const activePointer = useRef<number | null>(null);
  const animation = useRef<{ stop: () => void } | null>(null);
  const enabled = efforts.filter((effort) => !effort.disabled);
  const resolved =
    enabled.findIndex((effort) => effort.value === value) >= 0
      ? (value as string)
      : enabled[0]?.value;
  const index = Math.max(
    enabled.findIndex((effort) => effort.value === resolved),
    0,
  );
  const lastEmitted = useRef(value);
  useLayoutEffect(() => {
    lastEmitted.current = value;
  }, [value]);

  const { percent, current, commit, sliderProps } = useSlider({
    value: index,
    min: 0,
    max: Math.max(enabled.length - 1, 0),
    step: 1,
    disabled: disabled || enabled.length < 2,
    "aria-label": label,
    formatValueText: (numeric) => enabled[Math.round(numeric)]?.label ?? "",
    onValueChange: (numeric) => {
      const next = enabled[Math.round(numeric)];
      if (next && next.value !== lastEmitted.current) {
        lastEmitted.current = next.value;
        onValueChange(next.value);
      }
    },
  });
  const position = useMotionValue(percent);
  useLayoutEffect(() => {
    if (dragging || activePointer.current !== null) return;
    if (reduce) {
      position.set(percent);
      return;
    }
    animation.current = animate(position, percent, {
      type: "spring",
      ...SPRING_GLIDE,
    });
    return () => animation.current?.stop();
  }, [dragging, percent, position, reduce]);
  const thumbX = useMotionTemplate`${position}%`;
  const fillScale = useTransform(position, (progress) => progress / 100);
  const currentOption = enabled[Math.round(current)];
  const denominator = Math.max(enabled.length - 1, 1);

  const movePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    // Pointer coordinates and the visual thumb share the same inset endpoints,
    // including while the opening panel is still scaled.
    const inset = 14 * (track.offsetWidth ? rect.width / track.offsetWidth : 1);
    const travel = Math.max(rect.width - inset * 2, 1);
    const progress = Math.min(1, Math.max(0, (event.clientX - rect.left - inset) / travel));
    position.set(progress * 100);
    commit(progress * Math.max(enabled.length - 1, 0));
  };
  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointer.current) return;
    activePointer.current = null;
    setDragging(false);
    releasePointer(event.currentTarget, event.pointerId);
  };

  if (enabled.length === 0) {
    return (
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Effort is managed automatically for this model.
      </p>
    );
  }

  return (
    <div
      onPointerDown={(event) => {
        if (disabled || enabled.length < 2 || event.button !== 0 || activePointer.current !== null) return;
        event.preventDefault();
        animation.current?.stop();
        activePointer.current = event.pointerId;
        setDragging(true);
        capturePointer(event.currentTarget, event.pointerId);
        event.currentTarget.querySelector<HTMLElement>('[role="slider"]')?.focus({ preventScroll: true });
        movePointer(event);
      }}
      onPointerMove={(event) => {
        if (!disabled && event.pointerId === activePointer.current) movePointer(event);
      }}
      onPointerUp={(event) => {
        if (!disabled && event.pointerId === activePointer.current) movePointer(event);
        endPointer(event);
      }}
      onPointerCancel={endPointer}
      onLostPointerCapture={endPointer}
      className={cn(
        "relative mt-3 h-8 w-full touch-none",
        TOUCH_GESTURE_CLASS,
        disabled || enabled.length < 2
          ? "pointer-events-none opacity-50"
          : "cursor-grab active:cursor-grabbing",
      )}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-6 -translate-y-1/2 overflow-hidden rounded-full bg-foreground/5">
        <motion.span
          className="absolute inset-0 origin-left bg-accent"
          style={{ scaleX: fillScale }}
        />
        <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-border-strong" />
      </div>
      <div className="pointer-events-none absolute inset-x-3.5 inset-y-0">
        {enabled.map((effort, effortIndex) => {
          const tickLeft =
            enabled.length === 1
              ? "0%"
              : `${(effortIndex / denominator) * 100}%`;
          return (
            <span
              key={effort.value}
              style={{ left: tickLeft }}
              className={cn(
                "absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full",
                effortIndex <= index
                  ? "bg-accent-foreground/45"
                  : "bg-muted-foreground/55",
              )}
            />
          );
        })}
      </div>
      <motion.div
        className="pointer-events-none absolute inset-y-0 left-0 right-7"
        style={{ x: thumbX }}
      >
      <motion.span
        {...sliderProps}
        className="pointer-events-auto absolute left-0 top-1/2 z-10 size-7 rounded-full outline-none"
        style={{ y: "-50%" }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <motion.span
          animate={reduce ? undefined : { scale: dragging ? 1.08 : 1 }}
          transition={SPRING_PRESS}
          className={cn(
            "block size-7 rounded-full bg-foreground shadow-[0_4px_12px_rgba(0,0,0,0.18)]",
            focused && "ring-2 ring-accent ring-offset-2 ring-offset-popover",
          )}
        />
        <AnimatePresence>
          {(hovered || focused || dragging) && currentOption?.description ? (
            <motion.span
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: 3, scale: 0.96 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 2, scale: 0.98 }}
              transition={reduce ? { duration: 0.1 } : SPRING_PANEL}
              className={cn(
                "pointer-events-none absolute top-full mt-2 max-w-48 rounded-xl border border-border bg-popover px-2.5 py-1.5 text-left shadow-lg",
                current === 0
                  ? "left-0"
                  : current === enabled.length - 1
                    ? "right-0"
                    : "left-1/2 -translate-x-1/2",
              )}
            >
              <span className="block truncate text-xs text-foreground">
                {currentOption.description}
              </span>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.span>
      </motion.div>
    </div>
  );
}

export function ModelSelector({
  models,
  value,
  defaultValue,
  onValueChange,
  efforts = DEFAULT_MODEL_EFFORTS,
  effort,
  defaultEffort = "high",
  onEffortChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  placeholder = "Select model",
  label = "Model and effort",
  modelListLabel = "Select model",
  effortLabel = "Reasoning effort",
  side = "top",
  align = "end",
  sideOffset = 8,
  className,
  triggerClassName,
  contentClassName,
}: ModelSelectorProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const panelId = `${baseId}-panel`;
  const listId = `${baseId}-list`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const modelButtonRef = useRef<HTMLButtonElement>(null);
  const focusActiveModel = useRef(false);
  const focusModelButton = useRef(false);
  const effortByModel = useRef(new Map<string, string>());
  const [portalReady, setPortalReady] = useState(false);
  const [view, setView] = useState<PanelView>("effort");
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalEffort, setInternalEffort] = useState(defaultEffort);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlledValue = value !== undefined;
  const controlledEffort = effort !== undefined;
  const controlledOpen = openProp !== undefined;
  const currentValue = controlledValue ? value : internalValue;
  const rawEffort = controlledEffort ? effort : internalEffort;
  const open = controlledOpen ? openProp : internalOpen;
  const currentModel = models.find((model) => model.value === currentValue);
  const currentText = optionText(currentModel);
  const currentEfforts = useMemo(
    () => effortsFor(currentModel, efforts),
    [currentModel, efforts],
  );
  const currentEffortValue =
    enabledEffortValue(currentEfforts, rawEffort) ??
    enabledEffortValue(currentEfforts, currentModel?.defaultEffort) ??
    enabledEffortValue(currentEfforts, defaultEffort) ??
    currentEfforts.find((option) => !option.disabled)?.value;
  const currentEffort = currentEfforts.find(
    (option) => option.value === currentEffortValue,
  );
  const resetEffortValue =
    enabledEffortValue(currentEfforts, currentModel?.defaultEffort) ??
    enabledEffortValue(currentEfforts, defaultEffort) ??
    currentEfforts.find((option) => !option.disabled)?.value;

  useLayoutEffect(() => {
    if (currentValue && currentEffortValue) {
      effortByModel.current.set(currentValue, currentEffortValue);
    }
  }, [currentEffortValue, currentValue]);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlledOpen) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const commitEffort = useCallback(
    (next: string) => {
      if (currentValue) effortByModel.current.set(currentValue, next);
      if (!controlledEffort) setInternalEffort(next);
      onEffortChange?.(next);
    },
    [controlledEffort, currentValue, onEffortChange],
  );

  const { activeValue, move, moveTo } = useModelCursor({
    open,
    models,
    value: currentValue,
  });
  const activeIndex = models.findIndex(
    (model) => model.value === activeValue,
  );

  const resetView = useCallback(() => setView("effort"), []);
  useOnOpen(open, resetView);

  const showModels = useCallback(() => {
    focusActiveModel.current = true;
    setView("models");
  }, []);

  const showEffort = useCallback(() => {
    focusModelButton.current = true;
    setView("effort");
  }, []);

  const choose = useCallback(
    (next: string) => {
      const model = models.find((option) => option.value === next);
      if (!model || model.disabled) return;
      const nextEfforts = effortsFor(model, efforts);
      const nextEffort =
        enabledEffortValue(nextEfforts, effortByModel.current.get(next)) ??
        enabledEffortValue(nextEfforts, currentEffortValue) ??
        enabledEffortValue(nextEfforts, model.defaultEffort) ??
        enabledEffortValue(nextEfforts, defaultEffort) ??
        nextEfforts.find((option) => !option.disabled)?.value;

      if (!controlledValue) setInternalValue(next);
      onValueChange?.(next);
      if (nextEffort && nextEffort !== currentEffortValue) {
        if (!controlledEffort) setInternalEffort(nextEffort);
        onEffortChange?.(nextEffort);
      }
      if (nextEffort) effortByModel.current.set(next, nextEffort);
      focusModelButton.current = true;
      setView("effort");
    },
    [
      controlledEffort,
      controlledValue,
      currentEffortValue,
      defaultEffort,
      efforts,
      models,
      onEffortChange,
      onValueChange,
    ],
  );

  useEffect(() => setPortalReady(true), []);

  useLayoutEffect(() => {
    if (view !== "models" || !focusActiveModel.current || activeIndex < 0) {
      return;
    }
    focusActiveModel.current = false;
    document.getElementById(`${baseId}-option-${activeIndex}`)?.focus();
  }, [activeIndex, baseId, view]);

  useLayoutEffect(() => {
    if (!open || view !== "effort" || !focusModelButton.current) return;
    focusModelButton.current = false;
    modelButtonRef.current?.focus();
  }, [open, view]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (view === "models") showEffort();
      else {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("focusin", handleFocus);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("focusin", handleFocus);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen, showEffort, view]);

  // The button scales during a press; its stationary wrapper is the anchor.
  const triggerRect = useTriggerRect(anchorRef, portalReady && open);
  const panelWidth = triggerRect
    ? Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_PADDING * 2)
    : PANEL_WIDTH;
  let placement = side;
  if (triggerRect) {
    const above = triggerRect.top - sideOffset - VIEWPORT_PADDING;
    const below =
      window.innerHeight -
      triggerRect.top -
      triggerRect.height -
      sideOffset -
      VIEWPORT_PADDING;
    if (side === "top" && above < PANEL_MAX_HEIGHT && below > above) {
      placement = "bottom";
    } else if (
      side === "bottom" &&
      below < PANEL_MAX_HEIGHT &&
      above > below
    ) {
      placement = "top";
    }
  }

  const panelLeft = triggerRect
    ? Math.min(
        Math.max(
          VIEWPORT_PADDING,
          align === "end"
            ? triggerRect.left + triggerRect.width - panelWidth
            : triggerRect.left,
        ),
        Math.max(
          VIEWPORT_PADDING,
          window.innerWidth - panelWidth - VIEWPORT_PADDING,
        ),
      )
    : 0;
  const panelAnchorTop = triggerRect
    ? placement === "top"
      ? triggerRect.top - sideOffset
      : triggerRect.top + triggerRect.height + sideOffset
    : 0;
  const availablePanelHeight = triggerRect
    ? placement === "top"
      ? triggerRect.top - sideOffset - VIEWPORT_PADDING
      : window.innerHeight -
        triggerRect.top -
        triggerRect.height -
        sideOffset -
        VIEWPORT_PADDING
    : PANEL_MAX_HEIGHT;

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusModelButton.current = true;
      if (!open) setOpen(true);
      else {
        focusModelButton.current = false;
        modelButtonRef.current?.focus();
      }
      return;
    }
    if (event.key === "Tab" && open && !event.shiftKey) {
      event.preventDefault();
      modelButtonRef.current?.focus();
    }
  };

  const handleModelKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    selectedValue: string,
  ) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusActiveModel.current = true;
      move(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      focusActiveModel.current = true;
      move(event.key === "Home" ? "first" : "last");
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(selectedValue);
    }
  };

  const effortView = (
    <PresenceGate key="effort">
      {({ gate, isPresent }) => (
        <motion.div
          inert={gate.inert}
          aria-hidden={!isPresent}
          style={gate.style}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduce
              ? { duration: 0.1 }
              : { duration: 0.18, ease: EASE_OUT }
          }
          className={cn(
            "relative px-3 pt-3",
            currentEfforts.some((option) => option.description)
              ? "pb-11"
              : "pb-3",
          )}
        >
      <div className="grid grid-cols-[2rem_1fr_2rem] items-start gap-1">
        <span
          aria-hidden="true"
          className="block size-8"
        />

        <div className="min-w-0 text-center">
          <div className="relative h-5 overflow-hidden">
              <motion.div
                key={currentEffortValue ?? "automatic"}
                initial={reduce ? false : { opacity: 0.65, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.12, ease: EASE_OUT }
                }
                className="absolute inset-0 text-sm font-medium text-accent"
              >
                {currentEffort?.label ?? "Automatic"}
              </motion.div>
          </div>
          <button
            ref={modelButtonRef}
            type="button"
            onClick={showModels}
            aria-label={`Change model: ${currentText ?? "None selected"}`}
            className="group/model mt-0.5 inline-flex max-w-full items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-xs text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="truncate">
              {currentModel?.label ?? placeholder}
            </span>
            <ChevronRight className="size-3 shrink-0 transition-transform group-hover/model:translate-x-0.5" />
          </button>
        </div>

        <motion.button
          type="button"
          aria-label="Reset effort"
          disabled={!resetEffortValue || currentEffortValue === resetEffortValue}
          onClick={() => {
            if (resetEffortValue) commitEffort(resetEffortValue);
          }}
          whileTap={reduce ? undefined : { rotate: -35, scale: 0.92 }}
          transition={SPRING_PRESS}
          className="grid size-8 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-35"
        >
          <RotateCcw className="size-3.5" />
        </motion.button>
      </div>

          <EffortSlider
            key={currentValue ?? "no-model"}
            efforts={currentEfforts}
            value={currentEffortValue}
            onValueChange={commitEffort}
            label={effortLabel}
            disabled={disabled}
            reduce={reduce}
          />
        </motion.div>
      )}
    </PresenceGate>
  );

  const modelView = (
    <PresenceGate key="models">
      {({ gate, isPresent }) => (
        <motion.div
          inert={gate.inert}
          aria-hidden={!isPresent}
          style={gate.style}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative"
          transition={
            reduce
              ? { duration: 0.1 }
              : { duration: 0.18, ease: EASE_OUT }
          }
        >
      <button
        type="button"
        onClick={showEffort}
        className="group/back mx-1.5 mt-1.5 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronLeft className="size-3.5 transition-transform group-hover/back:-translate-x-0.5" />
        {modelListLabel}
      </button>
      <motion.div
        id={listId}
        role="listbox"
        aria-label={modelListLabel}
        style={{ maxHeight: Math.max(48, Math.min(352, availablePanelHeight - 44)) }}
        className="max-h-[min(22rem,calc(100vh-5rem))] overflow-y-auto overscroll-contain px-1.5 pb-1.5 [scrollbar-color:var(--color-border-strong)_transparent] [scrollbar-width:thin]"
      >
        {models.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">
            No models available.
          </p>
        ) : (
          models.map((model, index) => {
            const selected = model.value === currentValue;
            const active = model.value === activeValue;
            const text = optionText(model);
            return (
              <motion.button
                key={model.value}
                id={`${baseId}-option-${index}`}
                type="button"
                role="option"
                tabIndex={active ? 0 : -1}
                aria-selected={selected}
                aria-label={text}
                disabled={model.disabled}
                data-active={active ? "true" : "false"}
                data-selected={selected ? "true" : "false"}
                onFocus={() => {
                  if (!model.disabled) moveTo(model.value);
                }}
                onPointerMove={() => {
                  if (!model.disabled) moveTo(model.value);
                }}
                onKeyDown={(event) => handleModelKeyDown(event, model.value)}
                onClick={() => choose(model.value)}
                className="relative flex min-h-8 w-full items-center gap-2 rounded-xl px-2.5 py-1 text-left outline-none disabled:pointer-events-none disabled:opacity-40"
              >
                {active ? (
                  <motion.span
                    layoutId={`${baseId}-active-row`}
                    aria-hidden="true"
                    transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
                    className="absolute inset-0 rounded-xl bg-background"
                  />
                ) : null}
                {model.icon ? (
                  <span
                    aria-hidden="true"
                    className="relative grid size-7 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground [&_svg]:size-3.5"
                  >
                    {model.icon}
                  </span>
                ) : null}
                <span className="relative min-w-0 flex-1">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {model.label}
                    </span>
                    {model.badge ? (
                      <span className="shrink-0 rounded-md bg-background px-1.5 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
                        {model.badge}
                      </span>
                    ) : null}
                  </span>
                  {model.description ? (
                    <span className="mt-0.5 block truncate text-xs leading-4 text-muted-foreground">
                      {model.description}
                    </span>
                  ) : null}
                </span>
                <span className="relative grid size-5 shrink-0 place-items-center text-foreground">
                  <AnimatePresence initial={false}>
                    {selected ? (
                      <motion.span
                        initial={
                          reduce
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.5, rotate: -18 }
                        }
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={
                          reduce
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.65, rotate: 12 }
                        }
                        transition={reduce ? { duration: 0.1 } : SPRING_SWAP}
                      >
                        <Check className="size-3.5" />
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>
              </motion.button>
            );
          })
        )}
          </motion.div>
        </motion.div>
      )}
    </PresenceGate>
  );

  const panel = portalReady
    ? createPortal(
        <AnimatePresence>
          {open ? (
            <PresenceGate>
              {({ gate }) => (
                <motion.div
                  data-model-selector-portal=""
                  data-side={placement}
                  inert={gate.inert}
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: placement === "top" ? 7 : -7,
                          scale: 0.97,
                        }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: placement === "top" ? 4 : -4,
                          scale: 0.985,
                        }
                  }
                  transition={reduce ? { duration: 0.12 } : SPRING_PANEL}
                  style={{
                    ...gate.style,
                    left: panelLeft,
                    top: panelAnchorTop,
                    visibility: triggerRect ? "visible" : "hidden",
                    transformOrigin: "0 0",
                  }}
                  className="fixed z-[9999] size-0"
                >
                  <div
                    ref={panelRef}
                    id={panelId}
                    role="dialog"
                    aria-label={label}
                    className={cn(
                      "absolute left-0 w-[min(17rem,calc(100vw-1.5rem))] rounded-2xl text-popover-foreground",
                      placement === "top" ? "bottom-0" : "top-0",
                      contentClassName,
                    )}
                  >
                    <motion.div
                      aria-hidden="true"
                      layout={reduce ? undefined : true}
                      layoutDependency={view}
                      transition={{ layout: SPRING_PANEL }}
                      className="pointer-events-none absolute inset-0 rounded-2xl border border-border bg-popover shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
                    />
                    {view === "effort" ? effortView : modelView}
                  </div>
                </motion.div>
              )}
            </PresenceGate>
          ) : null}
        </AnimatePresence>,
        document.body,
      )
    : null;

  return (
    <>
      <div ref={anchorRef} className={cn("relative inline-flex", className)}>
        <motion.button
          ref={triggerRef}
          id={triggerId}
          type="button"
          disabled={disabled}
          aria-label={`${label}: ${currentText ?? "None selected"}, ${currentEffort?.label ?? "automatic"} effort`}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={(event) => {
            const next = !open;
            setOpen(next);
            if (next && event.detail === 0) {
              focusModelButton.current = true;
            }
          }}
          onKeyDown={handleTriggerKeyDown}
          whileTap={reduce || disabled ? undefined : { scale: 0.97 }}
          transition={SPRING_SWAP}
          className={cn(
            "group flex h-8 min-w-40 max-w-56 items-center gap-1.5 rounded-xl px-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            open && "bg-muted text-foreground",
            triggerClassName,
          )}
        >
          <span
            aria-hidden="true"
            className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden"
          >
            {currentModel?.icon ? (
              <span
                aria-hidden="true"
                className="grid size-4 shrink-0 place-items-center [&_svg]:size-3.5"
              >
                {currentModel.icon}
              </span>
            ) : null}
            <span className="min-w-0 flex-1 truncate text-left">
              {currentModel?.label ?? placeholder}
            </span>
            {currentEffort ? (
              <span className="w-12 shrink-0 text-left text-muted-foreground/65">
                {currentEffort.label}
              </span>
            ) : null}
          </span>
          <motion.span
            aria-hidden="true"
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduce ? { duration: 0 } : SPRING_SWAP}
            className="shrink-0 text-muted-foreground/70"
          >
            <ChevronDown className="size-3.5" />
          </motion.span>
        </motion.button>
      </div>
      {panel}
    </>
  );
}
