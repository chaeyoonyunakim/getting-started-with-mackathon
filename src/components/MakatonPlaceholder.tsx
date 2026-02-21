/**
 * High-contrast Makaton-style line-art placeholder.
 * Renders the first letter of the label inside a bordered square
 * mimicking the look of official Makaton symbol cards.
 */
const MakatonPlaceholder = ({ label }: { label: string }) => (
  <div className="w-full h-full flex items-center justify-center bg-white rounded-xl border-[3px] border-foreground/80">
    <span className="text-foreground font-black text-4xl sm:text-5xl md:text-6xl leading-none select-none">
      {label.charAt(0).toUpperCase()}
    </span>
  </div>
);

export default MakatonPlaceholder;
