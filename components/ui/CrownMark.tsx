import type { SVGProps } from "react";

type CrownMarkProps = SVGProps<SVGSVGElement> & {
  size?: number;
  crownedLetter?: boolean;
};

export default function CrownMark({
  size = 34,
  crownedLetter = false,
  className,
  ...props
}: CrownMarkProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox={crownedLetter ? "0 0 80 98" : "0 0 64 58"}
      width={size}
      height={crownedLetter ? Math.round(size * 1.225) : Math.round(size * 0.91)}
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="nexus-crown-gold" x1="3" y1="2" x2="59" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF2CA" />
          <stop offset=".43" stopColor="#E4BD76" />
          <stop offset=".75" stopColor="#A87634" />
          <stop offset="1" stopColor="#F8D897" />
        </linearGradient>
      </defs>
      {crownedLetter && <text x="40" y="91" textAnchor="middle" fontFamily="Georgia, serif" fontSize="64" fontWeight="bold" fill="url(#nexus-crown-gold)">N</text>}
      <g transform={crownedLetter ? "translate(12 0)" : "translate(0 0)"}>
        <path d="M9 43 3 15 19 25 32 4 45 25 61 15 55 43Z" fill="url(#nexus-crown-gold)" stroke="#F3D69D" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 44H54V51H10Z" fill="#C59750" stroke="#F4D18A" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M11 47H53" stroke="#FFF2CA" strokeOpacity=".65" strokeWidth="1.3"/>
        <path d="m32 23 5 8-5 8-5-8Z" fill="#35250F" stroke="#FFF1BC" strokeWidth="1.1"/>
        <circle cx="3" cy="14" r="3" fill="#FFE4A5"/>
        <circle cx="32" cy="4" r="3" fill="#FFE4A5"/>
        <circle cx="61" cy="14" r="3" fill="#FFE4A5"/>
        <path d="M18 31 11 26l3 13h36l3-13-7 5-14-13Z" fill="#FFF1BF" fillOpacity=".14"/>
      </g>
    </svg>
  );
}
