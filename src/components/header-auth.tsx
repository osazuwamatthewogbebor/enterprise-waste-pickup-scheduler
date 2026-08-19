"use client";

import Link from "next/link";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@/src/components/ui/dropdown";

const driverIcon = (
  <svg
    className="h-4 w-4 text-slate-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    role="none"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12l2-2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10l2 2M9 9l3-3 3 3m-6 0V5a3 3 0 1 1 6 0v4"
    />
  </svg>
);

const companyIcon = (
  <svg
    className="h-4 w-4 text-slate-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    role="none"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 21h18M6 7V3h12v4M9 7V7c0-1.66-1.34-3-3-3S3 5.34 3 7v0h6Zm6 0v0c0-1.66-1.34-3-3-3S9 5.34 9 7v0h6Zm6 0h-6"
    />
    <circle cx={5} cy={16} r={2} fill="currentColor" />
    <circle cx={19} cy={16} r={2} fill="currentColor" />
  </svg>
);

type Align = "left" | "right";

export function SignInDropdown({
  variant = "ghost",
  align = "right",
  size = "",
  label = "Sign in",
  className,
}: {
  variant?: "ghost" | "outline";
  align?: Align;
  size?: string;
  label?: string;
  className?: string;
}) {
  return (
    <Dropdown className={className}>
      <DropdownTrigger variant={variant} size={size}>
        {label}
      </DropdownTrigger>
      <DropdownMenu align={align}>
        <DropdownItem href="/login?role=company" icon={companyIcon}>
          Company sign in
        </DropdownItem>
        <DropdownItem href="/login?role=driver" icon={driverIcon}>
          Driver sign in
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

const createOrgLink =
  "w-full rounded-full bg-slate-950 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800";

export function HeaderAuth({
  stack = false,
  align = "right",
}: {
  stack?: boolean;
  align?: Align;
}) {
  if (stack) {
    return (
      <div className="flex w-full flex-col items-stretch gap-3">
        <SignInDropdown variant="outline" align={align} />
        <Link href="/signup" className={createOrgLink}>
          Create organization
        </Link>
      </div>
    );
  }

  return (
    <>
      <SignInDropdown variant="ghost" align={align} />
      <Link href="/signup" className={createOrgLink.replace("w-full ", "")}>
        Create organization
      </Link>
    </>
  );
}
