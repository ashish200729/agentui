import type { Testimonial } from "@/components/app/landing/testimonials-data";
import { cn } from "@/lib/utils";

export function TestimonialCard({
  testimonial,
  compact = false,
}: {
  testimonial: Testimonial;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "group block rounded-3xl border border-border bg-card transition-colors duration-200 hover:border-border-strong",
        // No forced height: a short note keeps its own rhythm instead of
        // inheriting a tall neighbor's dead gap.
        compact ? "w-[330px] whitespace-normal p-4" : "p-5",
      )}
    >
      <div className="flex items-center gap-3">
        {/* biome-ignore lint/performance/noImgElement: remote sample avatar URLs stay outside the app bundle */}
        <img
          src={testimonial.user.avatar}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          referrerPolicy="no-referrer"
          className={cn(
            "shrink-0 rounded-full object-cover",
            compact ? "h-9 w-9" : "h-10 w-10",
          )}
        />
        <div className="min-w-0">
          <span className="block truncate font-medium text-foreground">
            {testimonial.user.name}
          </span>
          <span className="block truncate text-sm text-muted-foreground">
            {testimonial.user.role}
          </span>
        </div>
      </div>

      <p
        className={cn(
          "mt-3 whitespace-pre-wrap text-foreground",
          compact
            ? "line-clamp-4 text-sm leading-relaxed"
            : "mt-4 text-[15px] leading-relaxed",
        )}
      >
        {testimonial.text}
      </p>
    </article>
  );
}
