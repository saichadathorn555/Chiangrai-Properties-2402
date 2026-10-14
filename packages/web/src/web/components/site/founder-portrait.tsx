/** Circular founder portrait with a soft peach ring. `className` controls the width. */
export function FounderPortrait({ className = "w-[55%]", alt = "" }: { className?: string; alt?: string }) {
  return (
    <div className={`aspect-square rounded-full border border-sand p-2 ${className}`}>
      <div className="size-full overflow-hidden rounded-full bg-peach/40">
        <img src="/images/founder.jpg" alt={alt} loading="lazy" className="size-full object-cover object-[50%_8%]" />
      </div>
    </div>
  );
}
