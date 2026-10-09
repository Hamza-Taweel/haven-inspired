const LINE_TOP_CLOSED = "M0 1 L60 1";
const LINE_BOTTOM_CLOSED = "M0 11 L60 11";

const LINE_TOP_OPEN = "M8 11 L52 1";
const LINE_BOTTOM_OPEN = "M8 1 L52 11";


export default function MenuIcon({
  isOpen,
  className = "",
  strokeClassName = "stroke-black",
}: {
  isOpen: boolean;
  className?: string;
  strokeClassName?: string;
}) {
  return (
    <span className={`relative inline-block h-[12px] w-[56px] me-2 ${className}`}>
      <svg
        viewBox="0 0 60 12"
        className="absolute inset-0 h-full w-full overflow-visible"
        fill="none"
      >
        <path
          d={isOpen ? LINE_TOP_OPEN : LINE_TOP_CLOSED}
          strokeWidth="1.2"
          strokeLinecap="round"
          className={`transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${strokeClassName}`}
        />
        <path
          d={isOpen ? LINE_BOTTOM_OPEN : LINE_BOTTOM_CLOSED}
          strokeWidth="1.2"
          strokeLinecap="round"
          className={`transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${strokeClassName}`}
        />
      </svg>
    </span>
  );
}
