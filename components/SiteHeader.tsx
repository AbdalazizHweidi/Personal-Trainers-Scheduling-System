import Link from "next/link";
import Logo from "./Logo";
import Button from "./Button";

type NavKey = "home" | "trainers" | "dashboard";

const navItems: { key: NavKey; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "trainers", label: "Trainers", href: "/trainers" },
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
];

const SiteHeader = ({ current }: { current?: NavKey }) => {
  return (
    <header className="bg-paper border-b border-line px-10 py-[18px] flex items-center justify-between">
      <Link href="/">
        <Logo />
      </Link>
      <nav className="flex items-center gap-8">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`text-sm font-medium py-1.5 border-b-2 ${
              current === item.key
                ? "text-ink border-flame"
                : "text-ink-soft border-transparent hover:text-ink hover:border-steel-line"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3.5">
        <Button href="/login" variant="ghost">
          Log in
        </Button>
        <Button href="/booking" variant="primary">
          Book a session
        </Button>
      </div>
    </header>
  );
};

export default SiteHeader;
