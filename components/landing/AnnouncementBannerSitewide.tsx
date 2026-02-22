"use client";

import { usePathname } from "next/navigation";
import { AnnouncementBanner } from "./AnnouncementBanner";

const EXCLUDED_PATHS = ["/dashboard", "/checkout"];

function isExcluded(pathname: string): boolean {
  return EXCLUDED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function AnnouncementBannerSitewide() {
  const pathname = usePathname() ?? "";
  if (isExcluded(pathname)) return null;
  return <AnnouncementBanner />;
}
