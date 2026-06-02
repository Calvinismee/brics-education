import { Link, router, usePage } from "@inertiajs/react";
import BricsLogo from "@/Components/BricsLogo";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: "Beranda", to: "/" },
  { label: "Katalog", to: "/#katalog" },
  { label: "Tentang Kami", to: "/#tentang" },
  { label: "Tutor Kami", to: "/tutors" },
];

function currentLocation(pageUrl) {
  if (typeof window === "undefined") {
    const url = new URL(pageUrl ?? "/", "http://localhost");

    return { path: url.pathname, hash: url.hash };
  }

  const url = pageUrl
    ? new URL(pageUrl, window.location.origin)
    : new URL(window.location.href);

  return {
    path: url.pathname,
    hash: window.location.hash || url.hash,
  };
}

function isActiveNavItem(item, path, hash) {
  if (item.to === "/tutors") return path === "/tutors";
  if (item.to === "/") return path === "/" && !hash;
  if (item.to === "/#katalog") return path === "/" && hash === "#katalog";
  if (item.to === "/#tentang") return path === "/" && hash === "#tentang";

  return false;
}

function sectionHashFromScroll(headerHeight = 0) {
  if (typeof window === "undefined" || window.location.pathname !== "/") return null;

  const offset = headerHeight + 40;
  const sections = [
    { hash: "", id: "landing-page-top" },
    { hash: "#katalog", id: "katalog" },
    { hash: "#tentang", id: "tentang" },
  ];

  return sections.reduce((activeHash, section) => {
    const element = document.getElementById(section.id);
    if (!element) return activeHash;

    const sectionTop = element.getBoundingClientRect().top + window.scrollY;

    return window.scrollY >= sectionTop - offset ? section.hash : activeHash;
  }, "");
}

export default function PublicNavbar() {
  const page = usePage();
  const { auth } = page.props;
  const user = auth?.user;
  const headerRef = useRef(null);
  const scrollSpyLockedRef = useRef(false);
  const scrollUnlockFrameRef = useRef(null);
  const scrollUnlockTimerRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useState(() => currentLocation(page.url));
  const { path, hash } = location;

  const scrollToHash = (targetHash, behavior = "smooth") => {
    if (typeof window === "undefined") return null;

    const targetId = targetHash ? targetHash.slice(1) : "landing-page-top";
    const target = document.getElementById(targetId);
    const headerHeight = headerRef.current?.offsetHeight ?? 0;

    if (!target) return null;

    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
    const nextTop = Math.max(targetTop, 0);

    window.scrollTo({ top: nextTop, behavior });

    return nextTop;
  };

  const unlockScrollSpy = () => {
    scrollSpyLockedRef.current = false;

    if (scrollUnlockFrameRef.current) {
      window.cancelAnimationFrame(scrollUnlockFrameRef.current);
      scrollUnlockFrameRef.current = null;
    }

    if (scrollUnlockTimerRef.current) {
      window.clearTimeout(scrollUnlockTimerRef.current);
      scrollUnlockTimerRef.current = null;
    }
  };

  const lockScrollSpyUntilSettled = (targetTop) => {
    if (typeof window === "undefined") return;

    unlockScrollSpy();
    scrollSpyLockedRef.current = true;

    if (targetTop === null) {
      scrollUnlockTimerRef.current = window.setTimeout(unlockScrollSpy, 600);
      return;
    }

    const startedAt = window.performance.now();
    const waitForScroll = () => {
      const isNearTarget = Math.abs(window.scrollY - targetTop) <= 2;
      const timedOut = window.performance.now() - startedAt > 1600;

      if (isNearTarget || timedOut) {
        unlockScrollSpy();
        return;
      }

      scrollUnlockFrameRef.current = window.requestAnimationFrame(waitForScroll);
    };

    scrollUnlockFrameRef.current = window.requestAnimationFrame(waitForScroll);
    scrollUnlockTimerRef.current = window.setTimeout(unlockScrollSpy, 1800);
  };

  useEffect(() => {
    const syncLocation = () => setLocation(currentLocation(page.url));
    const refreshAuth = () => {
      window.setTimeout(() => {
        router.reload({
          only: ["auth"],
          preserveScroll: true,
          preserveState: true,
        });
      }, 0);
    };

    const handlePageShow = (event) => {
      syncLocation();
      if (event.persisted) refreshAuth();
    };
    const handleHistoryChange = () => {
      syncLocation();
      refreshAuth();
    };
    const handleScroll = () => {
      if (scrollSpyLockedRef.current) return;

      const nextHash = sectionHashFromScroll(headerRef.current?.offsetHeight ?? 0);

      if (nextHash === null) return;

      setLocation((current) => (
        current.path === "/" && current.hash === nextHash
          ? current
          : { path: "/", hash: nextHash }
      ));
    };

    window.addEventListener("hashchange", syncLocation);
    window.addEventListener("popstate", handleHistoryChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("scroll", handleScroll, { passive: true });
    syncLocation();
    handleScroll();
    refreshAuth();

    return () => {
      window.removeEventListener("hashchange", syncLocation);
      window.removeEventListener("popstate", handleHistoryChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("scroll", handleScroll);
      unlockScrollSpy();
    };
  }, [page.url]);

  useEffect(() => {
    const nextLocation = currentLocation(page.url);

    setLocation(nextLocation);

    if (nextLocation.path !== "/" || !nextLocation.hash) return;

    window.setTimeout(() => {
      setLocation(nextLocation);
      lockScrollSpyUntilSettled(scrollToHash(nextLocation.hash, "smooth"));
    }, 0);
  }, [page.url]);

  const logout = () => {
    router.post(route("logout"));
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleNavClick = (event, item) => {
    if (typeof window === "undefined") return;

    const targetUrl = new URL(item.to, window.location.origin);
    const samePage = targetUrl.pathname === window.location.pathname;

    closeMobileMenu();

    if (!samePage) return;

    event.preventDefault();

    const nextHash = targetUrl.hash;
    const nextUrl = nextHash ? `${targetUrl.pathname}${nextHash}` : targetUrl.pathname;

    window.history.pushState({}, "", nextUrl);
    setLocation({ path: targetUrl.pathname, hash: nextHash });
    lockScrollSpyUntilSettled(scrollToHash(nextHash));
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-[#D8D7BE] bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex-shrink-0" aria-label="BRICS Education">
          <BricsLogo size="lg" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = isActiveNavItem(item, path, hash);

            return (
              <Link
                key={item.label}
                href={item.to}
                onClick={(event) => handleNavClick(event, item)}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[#F7F2E7] text-[#691D1B]"
                    : "text-gray-700 hover:bg-[#F7F2E7] hover:text-[#691D1B]"
                }`}
                style={{ fontWeight: active ? 700 : 500 }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-xl border border-[#691D1B] px-4 py-2 text-sm text-[#691D1B] transition-colors hover:bg-[#F7F2E7] md:inline-flex"
                style={{ fontWeight: 700 }}
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden items-center gap-1.5 rounded-xl px-4 py-2 text-sm text-white transition-all hover:opacity-90 md:inline-flex"
                style={{ background: "#691D1B", fontWeight: 700 }}
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href={route("register")}
                className="hidden rounded-xl border border-[#691D1B] px-4 py-2 text-sm text-[#691D1B] transition-colors hover:bg-[#F7F2E7] md:inline-flex"
                style={{ fontWeight: 700 }}
              >
                Daftar
              </Link>
              <Link
                href={route("login")}
                className="hidden rounded-xl px-5 py-2 text-sm text-white transition-all hover:opacity-90 md:inline-flex"
                style={{ background: "#691D1B", fontWeight: 700 }}
              >
                Masuk
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#D8D7BE] text-[#691D1B] transition-colors hover:bg-[#F7F2E7] md:hidden"
            aria-label="Buka menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 md:hidden ${isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/35 transition-opacity ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={closeMobileMenu}
          aria-label="Tutup menu"
        />

        <div
          className={`absolute right-0 top-0 flex h-full w-[min(82vw,320px)] flex-col bg-white shadow-2xl transition-transform duration-200 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#E7DFC9] px-5 py-4">
            <BricsLogo size="md" />
            <button
              type="button"
              onClick={closeMobileMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#691D1B] transition-colors hover:bg-[#F7F2E7]"
              aria-label="Tutup menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
            {navItems.map((item) => {
              const active = isActiveNavItem(item, path, hash);

              return (
                <Link
                  key={item.label}
                  href={item.to}
                  onClick={(event) => handleNavClick(event, item)}
                  onSuccess={closeMobileMenu}
                  className={`block rounded-xl px-4 py-3 text-base font-semibold transition-colors visited:text-gray-800 active:text-gray-800 ${
                    active
                      ? "bg-[#F7F2E7] text-[#691D1B]"
                      : "text-gray-800 hover:bg-[#F7F2E7] hover:text-[#691D1B]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[#E7DFC9] p-4">
            {user ? (
              <div className="grid gap-3">
                <Link
                  href="/dashboard"
                  onSuccess={closeMobileMenu}
                  className="rounded-xl border border-[#691D1B] px-4 py-3 text-center text-sm font-semibold text-[#691D1B] transition-colors hover:bg-[#F7F2E7]"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "#691D1B" }}
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={route("register")}
                  onSuccess={closeMobileMenu}
                  className="rounded-xl border border-[#691D1B] px-4 py-3 text-center text-sm font-semibold text-[#691D1B] transition-colors hover:bg-[#F7F2E7]"
                >
                  Daftar
                </Link>
                <Link
                  href={route("login")}
                  onSuccess={closeMobileMenu}
                  className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "#691D1B" }}
                >
                  Masuk
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
