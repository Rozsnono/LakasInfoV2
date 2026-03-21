"use client";

import React from "react";
import NextLink from "next/link";
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

    return (
        <NextLink href={href} replace={replace} onClick={onClick} target={target} {...rest}>
            {children}
        </NextLink>
    )
}