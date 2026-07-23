import Link from "next/link";
import Logo from "./Logo";

export type NavLink = {
  label: string;
  href?: string;
  current?: boolean;
};

const AppSidebar = ({ links }: { links: NavLink[] }) => {
  return (
    <aside className="bg-ink text-[#c7ccd1] px-[18px] py-[26px]">
      <Logo light />
      <nav className="mt-9 flex flex-col gap-0.5">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href ?? "#"}
            className={`px-3 py-2.5 text-[13px] font-medium rounded flex items-center gap-2.5 ${
              link.current
                ? "bg-flame text-white"
                : "hover:bg-[#22262b] hover:text-white"
            } ${link.label === "Log out" ? "mt-4 text-[#8b9198]" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AppSidebar;
