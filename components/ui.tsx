import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-slate-50 text-navy-900">{children}</main>;
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-slate-200 bg-white shadow-soft ${className}`}>{children}</section>;
}

export function Button({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({ children, className = "", ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <Link
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-900 ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

export function FieldLabel({ children, required = false }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-navy-900">
      {children}
      {required ? <span className="ml-1 text-red-600">*</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-navy-900 outline-none transition placeholder:text-slate-400 focus:border-navy-700 focus:ring-2 focus:ring-navy-100";

export function MutedNotice({ children }: { children: ReactNode }) {
  return <div className="rounded-md border border-gold-300 bg-gold-100 px-4 py-3 text-sm leading-7 text-navy-900">{children}</div>;
}
