import type { SVGProps } from "react";

export function KindPlateLogo(props: SVGProps<HTMLDivElement>) {
  return (
    <div className="flex items-center gap-2" {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <path d="M14.5 2H18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3.5v10" />
        <path d="M7 20.7a2.4 2.4 0 0 0 2.4-2.4c0-2.4-2.4-4.3-2.4-4.3s-2.4 1.9-2.4 4.3a2.4 2.4 0 0 0 2.4 2.4Z" />
        <path d="M12 11.2a2.4 2.4 0 0 0-2.4 2.4c0 2.4 2.4 4.3 2.4 4.3s2.4-1.9 2.4-4.3a2.4 2.4 0 0 0-2.4-2.4Z" />
        <path d="M7 2a2.4 2.4 0 0 0-2.4 2.4C4.6 6.8 7 8.7 7 8.7s2.4-1.9 2.4-4.3A2.4 2.4 0 0 0 7 2Z" />
      </svg>
      <span className="font-headline font-bold text-xl text-primary">
        KindPlate
      </span>
    </div>
  );
}
