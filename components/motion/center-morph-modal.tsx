"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { EASE_OUT, SPRING_PANEL } from "@/lib/ease";
import { PresenceGate } from "@/lib/presence-gate";
import { cn } from "@/lib/utils";

type CenterMorphModalContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
  contentId: string;
};

const CenterMorphModalContext =
  createContext<CenterMorphModalContextValue | null>(null);

function useCenterMorphModalContext(component: string) {
  const context = useContext(CenterMorphModalContext);
  if (!context) {
    throw new Error(`${component} must be used within <CenterMorphModal>`);
  }
  return context;
}

export interface CenterMorphModalProps {
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial state when used uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A modal whose full-size surface unfolds outward from its exact center.
 * Supports controlled and uncontrolled state through composable primitives.
 */
export function CenterMorphModal({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: CenterMorphModalProps) {
  const id = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const value = useMemo<CenterMorphModalContextValue>(
    () => ({
      open,
      setOpen,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
    }),
    [id, open, setOpen],
  );

  return (
    <CenterMorphModalContext.Provider value={value}>
      {children}
    </CenterMorphModalContext.Provider>
  );
}

export interface CenterMorphModalTriggerProps {
  children: ReactElement;
}

/** Wraps one interactive element and opens or closes the modal. */
export function CenterMorphModalTrigger({
  children,
}: CenterMorphModalTriggerProps) {
  const context = useCenterMorphModalContext("CenterMorphModalTrigger");
  if (!isValidElement(children)) return children;

  const child = children as ReactElement<Record<string, unknown>>;
  const childOnClick = child.props.onClick as
    | ((event: React.MouseEvent<HTMLElement>) => void)
    | undefined;

  return cloneElement(child, {
    id: context.triggerId,
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      childOnClick?.(event);
      if (!event.defaultPrevented) context.setOpen(!context.open);
    },
    "aria-haspopup": "dialog",
    "aria-expanded": context.open,
    "aria-controls": context.open ? context.contentId : undefined,
  });
}

export interface CenterMorphModalCloseProps {
  children: ReactElement;
}

/** Wraps one interactive element and closes the modal. */
export function CenterMorphModalClose({
  children,
}: CenterMorphModalCloseProps) {
  const context = useCenterMorphModalContext("CenterMorphModalClose");
  if (!isValidElement(children)) return children;

  const child = children as ReactElement<Record<string, unknown>>;
  const childOnClick = child.props.onClick as
    | ((event: React.MouseEvent<HTMLElement>) => void)
    | undefined;

  return cloneElement(child, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      childOnClick?.(event);
      if (!event.defaultPrevented) context.setOpen(false);
    },
  });
}

export interface CenterMorphModalContentProps {
  children: ReactNode;
  /** Accessible name announced by screen readers. */
  ariaLabel: string;
  /** Optional id of descriptive content inside the modal. */
  ariaDescribedBy?: string;
  /** Close on Escape or backdrop press. Default true. */
  dismissible?: boolean;
  /** Render the close control inside the panel's top-right corner. Default true. */
  showCloseButton?: boolean;
  closeButtonLabel?: string;
  className?: string;
  backdropClassName?: string;
  /** Surface colour and border for the panel animation. */
  surfaceClassName?: string;
  /** Keep the default center unfold or move the complete, opaque panel. */
  animation?: "unfold" | "panel";
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const CENTER_FOLDED_CLIP =
  "inset(48% 48% 48% 48% round 30px)";
const CENTER_OPEN_CLIP = "inset(0% 0% 0% 0% round 30px)";

// Complex clip-path strings can snap when a spring resolves its final distance.
// Keep the radius constant so the whole duration reads as surface unfolding,
// rather than finishing early and spending its last frames rounding corners.
const CENTER_UNFOLD_EASE = [0.2, 0, 0.2, 1] as const;
const CENTER_UNFOLD_TRANSITION = {
  duration: 0.43,
  ease: CENTER_UNFOLD_EASE,
} as const;

function getFocusableElements(root: HTMLElement | null) {
  if (!root) return [];
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => element.tabIndex >= 0);
}

export function CenterMorphModalContent({
  children,
  ariaLabel,
  ariaDescribedBy,
  dismissible = true,
  showCloseButton = true,
  closeButtonLabel = "Close modal",
  className,
  backdropClassName,
  surfaceClassName,
  animation = "unfold",
}: CenterMorphModalContentProps) {
  const context = useCenterMorphModalContext("CenterMorphModalContent");
  const reduce = useReducedMotion() ?? false;
  const panelAnimation = animation === "panel";
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!context.open) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";

    const focusFrame = requestAnimationFrame(() => {
      const [firstFocusable] = getFocusableElements(panelRef.current);
      (firstFocusable ?? panelRef.current)?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        context.setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      } else {
        document.getElementById(context.triggerId)?.focus();
      }
    };
  }, [context, dismissible]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {context.open ? (
        <PresenceGate>
          {({ isPresent, gate }) => (
            <>
              <motion.button
                type="button"
                aria-label="Dismiss modal"
                tabIndex={-1}
                disabled={!dismissible}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: {
                    duration: reduce ? 0.1 : panelAnimation ? 0.14 : 0.28,
                    ease: EASE_OUT,
                  },
                }}
                {...gate}
                transition={{
                  duration: reduce ? 0.1 : panelAnimation ? 0.16 : 0.28,
                  ease: EASE_OUT,
                }}
                onClick={() => context.setOpen(false)}
                className={cn(
                  "pointer-events-auto fixed inset-0 z-[100] h-full w-full cursor-default bg-background/10 backdrop-blur-sm",
                  backdropClassName,
                )}
              />

              {/* `inset-4` rather than `inset-0 p-4`: same content box, but the
                  layer stays off the viewport edges. It never takes pointer
                  events, so it carries `inert` alone. See
                  tests/fixed-overlay-edge-sampling.test.tsx. */}
              <div
                inert={!isPresent}
                className={cn(
                  "pointer-events-none fixed inset-4 z-[100] flex overflow-y-auto",
                  panelAnimation ? "items-start" : "items-center justify-center drop-shadow-2xl",
                )}
              >
                {/* The default drop shadow follows its clipped silhouette. The
                    sign-in panel keeps its shadow on the card itself. */}
                <div className={cn(
                  "flex w-full flex-col items-center py-8",
                  panelAnimation && "min-h-full justify-center",
                )}>
                  <motion.div
                    ref={panelRef}
                    id={context.contentId}
                    role="dialog"
                    aria-modal="true"
                    aria-label={ariaLabel}
                    aria-describedby={ariaDescribedBy}
                    tabIndex={-1}
                    initial={
                      panelAnimation
                        ? reduce
                          ? false
                          : { opacity: 1, scale: 0.96, y: 8 }
                        : reduce
                          ? { opacity: 0, clipPath: CENTER_OPEN_CLIP }
                          : { opacity: 1, clipPath: CENTER_FOLDED_CLIP }
                    }
                    animate={
                      panelAnimation
                        ? reduce
                          ? { opacity: 1 }
                          : { opacity: 1, scale: 1, y: 0 }
                        : { opacity: 1, clipPath: CENTER_OPEN_CLIP }
                    }
                    exit={
                      panelAnimation
                        ? reduce
                          ? { opacity: 1, transition: { duration: 0 } }
                          : {
                              opacity: 1,
                              scale: 0.9,
                              y: 16,
                              transition: { duration: 0.16, ease: EASE_OUT },
                            }
                        : reduce
                          ? { opacity: 0, clipPath: CENTER_OPEN_CLIP }
                          : { opacity: 1, clipPath: CENTER_FOLDED_CLIP }
                    }
                    {...gate}
                    transition={
                      panelAnimation
                        ? reduce
                          ? { duration: 0 }
                          : SPRING_PANEL
                        : reduce
                          ? { duration: 0.14, ease: EASE_OUT }
                          : CENTER_UNFOLD_TRANSITION
                    }
                    className={cn(
                      "pointer-events-auto relative w-full max-w-[26rem] origin-center overflow-hidden rounded-[30px] border border-border bg-background",
                      panelAnimation ? "shadow-2xl will-change-transform" : "will-change-[clip-path]",
                      className,
                      panelAnimation && surfaceClassName,
                    )}
                  >
                    {children}

                    {showCloseButton ? (
                      <motion.button
                        type="button"
                        aria-label={closeButtonLabel}
                        onClick={() => context.setOpen(false)}
                        initial={
                          panelAnimation ? false : reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }
                        }
                        animate={{ opacity: panelAnimation || isPresent ? 1 : 0, scale: 1 }}
                        exit={{
                          opacity: panelAnimation ? 1 : 0,
                          scale: panelAnimation || reduce ? 1 : 0.88,
                          transition: { duration: panelAnimation ? 0 : 0.1, ease: EASE_OUT },
                        }}
                        transition={{
                          delay: panelAnimation || reduce ? 0 : 0.16,
                          duration: panelAnimation ? 0 : reduce ? 0.12 : 0.2,
                          ease: EASE_OUT,
                        }}
                        className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground/[0.05] text-muted-foreground transition-colors hover:bg-foreground/[0.08] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </motion.button>
                    ) : null}
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </PresenceGate>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
