"use client";

import React from "react";
export function useRouter() {

    function replace(path: string, options?: { scroll?: boolean, backTo?: string }) {
        window.history.pushState({ backTo: options?.backTo }, "", path);
        window.dispatchEvent(new Event("popstate"));
        if (options?.scroll !== false) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    function push(path: string, options?: { scroll?: boolean, backTo?: string }) {
        window.history.pushState({ backTo: options?.backTo }, "", path);
        window.location.href = path; // Ez biztosítja, hogy a router frissüljön és a middleware lefusson
        window.dispatchEvent(new Event("popstate"));
    }

    function refresh() {
        window.dispatchEvent(new Event("popstate"));
    }

    function back() {
        window.history.back();
    }

    return { push, refresh, replace, back };
}

interface CustomLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    replace?: boolean; // Opcionális: Push helyett Replace (nem kerül be a History-ba)
}

export default function Link({
    href,
    replace = false,
    children,
    onClick,
    target,
    ...rest
}: CustomLinkProps) {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (onClick) onClick(e);

        if (e.defaultPrevented) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        if (e.button !== 0) return;

        if (target === "_blank") return;

        const isExternal = href.startsWith('http://') || href.startsWith('https://');
        if (isExternal) return;

        e.preventDefault();

        if (replace) {
            router.replace(href);
        } else {
            router.push(href);
        }
    };

    return (
        <a href={href} onClick={handleClick} target={target} {...rest}>
            {children}
        </a>
    );
}