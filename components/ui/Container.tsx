import { type ReactNode } from "react";
import clsx from "clsx";

export default function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={clsx("w-full px-4 sm:px-8", className)}>{children}</div>;
}
