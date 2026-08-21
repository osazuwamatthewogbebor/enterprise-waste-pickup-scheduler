"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useId,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";

type FocusDirection = "first" | "last" | "next" | "prev";

type DropdownContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  close: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  focusItem: (dir: FocusDirection) => void;
  menuId: string;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) {
    throw new Error("Dropdown components must be used within <Dropdown>");
  }
  return ctx;
}

export function Dropdown({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = `dropdown-menu-${useId()}`;

  const focusItem = (dir: FocusDirection) => {
    const menu = menuRef.current;
    if (!menu) return;
    const items = Array.from(
      menu.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    ).filter((item) => !item.hasAttribute("disabled"));
    if (items.length === 0) return;

    const current = document.activeElement;
    let idx = items.findIndex((item) => item === current);
    if (idx === -1) idx = -1;

    let next: HTMLElement | undefined;
    if (dir === "first") {
      next = items[0];
    } else if (dir === "last") {
      next = items[items.length - 1];
    } else {
      const step = dir === "next" ? 1 : -1;
      idx = (idx + step + items.length) % items.length;
      next = items[idx];
    }
    next?.focus();
  };

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: globalThis.PointerEvent) => {
      const target = e.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      focusItem("first");
    }
  }, [open]);

  return (
    <DropdownContext.Provider
      value={{ open, setOpen, close, triggerRef, menuRef, focusItem, menuId }}
    >
      <div className={`relative inline-flex ${className ?? ""}`}>{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({
  children,
  variant = "ghost",
  size = "",
}: {
  children?: ReactNode;
  variant?: "ghost" | "outline" | "solid";
  size?: string;
}) {
  const { open, setOpen, triggerRef, menuId } = useDropdown();

  const base =
    "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500";
  const styles =
    variant === "outline"
      ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      : variant === "solid"
      ? "bg-emerald-600 text-white hover:bg-emerald-700"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900";

  return (
    <button
      type="button"
      ref={triggerRef}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      className={`${base} ${styles} ${size}`}
      onClick={() => setOpen(!open)}
      onKeyDown={(e: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (
          e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === " " ||
          e.key === "Enter"
        ) {
          e.preventDefault();
          setOpen(true);
        }
      }}
    >
      {children}
      <svg
        className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        role="none"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9l-6 6-6-6" />
      </svg>
    </button>
  );
}

export function DropdownMenu({
  children,
  align = "right",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  const { open, close, menuRef, focusItem, menuId } = useDropdown();
  if (!open) return null;

  const alignClass = align === "left" ? "left-0" : "right-0";

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem("next");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem("prev");
    } else if (e.key === "Home") {
      e.preventDefault();
      focusItem("first");
    } else if (e.key === "End") {
      e.preventDefault();
      focusItem("last");
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close();
    }
  };

  return (
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className={`absolute z-50 mt-2 min-w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] ${alignClass} focus:outline-none`}
    >
      {children}
    </div>
  );
}

export function DropdownItem({
  children,
  href,
  icon,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
}) {
  const { close } = useDropdown();

  const handleSelect = () => {
    close();
    onClick?.();
  };

  const className =
    "flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-disabled:cursor-not-allowed data-disabled:opacity-50";

  if (href) {
    return (
      <Link href={href} onClick={handleSelect} className={className}>
        {icon}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleSelect} className={className}>
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  const { menuId } = useDropdown();
  return (
    <p
      className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
      id={`${menuId}-label`}
    >
      {children}
    </p>
  );
}
