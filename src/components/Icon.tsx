import type { ServiceIcon } from "@/lib/types";

type Name =
  | ServiceIcon
  | "arrow"
  | "chevron"
  | "phone"
  | "whatsapp"
  | "mail"
  | "pin"
  | "clock"
  | "image"
  | "check";

const paths: Record<Name, React.ReactNode> = {
  generator: (
    <>
      <rect x="3" y="7" width="18" height="11" rx="1" />
      <path d="M3 18v2M21 18v2M7 7V4h10v3" />
      <path d="M13 9.5 10.5 13H14l-2.5 3.5" />
      <path d="M17 11v3" />
    </>
  ),
  stabilizer: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <rect x="7" y="6" width="10" height="5" />
      <path d="M8.5 9h1.5l1-1.5 2 3 1-1.5h1.5" />
      <circle cx="9" cy="16" r="1.5" />
      <circle cx="15" cy="16" r="1.5" />
    </>
  ),
  repair: (
    <>
      <path d="M14.5 5.5a4 4 0 0 0-5.3 5.2L3.5 16.4a1.4 1.4 0 0 0 0 2l2.1 2.1a1.4 1.4 0 0 0 2 0l5.7-5.7a4 4 0 0 0 5.2-5.3l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />
    </>
  ),
  regulator: (
    <>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 13 15.5 9.5" />
      <path d="M12 3v2M4.5 13h-1M20.5 13h-1M6.7 7.7l-.8-.8M17.3 7.7l.8-.8" />
      <circle cx="12" cy="13" r="1" />
    </>
  ),
  consult: (
    <>
      <path d="M4 5h16v11H9l-5 4V5Z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  bolt: <path d="M13 3 5 13.5h6L10 21l9-11h-6l1-7Z" />,
  other: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="0.5" />
      <rect x="13" y="4" width="7" height="7" rx="0.5" />
      <rect x="4" y="13" width="7" height="7" rx="0.5" />
      <path d="M16.5 13.5v6M13.5 16.5h6" />
    </>
  ),
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  phone: (
    <path d="M5 4h3.5l1.5 4-2 1.3a10 10 0 0 0 6.7 6.7L16 14l4 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
  ),
  whatsapp: (
    <>
      <path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.3 18.6L4.5 19.5Z" />
      <path d="M9.2 8.6c.2-.4.5-.4.8-.4h.5l.9 2.1-.6.8c.5 1 1.3 1.8 2.3 2.3l.8-.6 2.1.9v.5c0 .3 0 .6-.4.8-.6.4-1.5.5-2.3.2a7 7 0 0 1-4.3-4.3c-.3-.8-.2-1.7.2-2.3Z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="m4 6 8 6.5L20 6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <circle cx="9" cy="9.5" r="1.8" />
      <path d="m3.5 17.5 5-5 4 4 3-3 5 5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
};

export function Icon({ name, className }: { name: Name; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={name === "arrow" ? `icon-arrow ${className ?? ""}` : className}
    >
      {paths[name]}
    </svg>
  );
}
