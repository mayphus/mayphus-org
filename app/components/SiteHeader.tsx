import { Link, useLocation } from "@remix-run/react";
import { SITE_NAVIGATION } from "~/lib/site";


export function SiteHeader() {
    const location = useLocation();

    return (
        <header>
            <div>
                <nav>
                    {SITE_NAVIGATION.map((link) => {
                        const isActive = link.href === "/"
                            ? location.pathname === "/"
                            : location.pathname.startsWith(link.href);

                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                            >
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </header>
    );
}
