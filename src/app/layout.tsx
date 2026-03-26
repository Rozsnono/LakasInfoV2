import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { AppearanceProvider } from "@/contexts/appearance.context";
import "./globals.css";
import { ProfileProvider } from "@/contexts/user.context";
import { StartupProvider } from "@/contexts/startup.context";
import NativeBackButton from "@/components/NativeBackButton";

export const metadata: Metadata = {
  title: "LakasInfo",
  description: "Intelligent Utility Ecosystem",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Sütik kiolvasása a szerver oldalon
  const cookieStore = await cookies();

  const initialValues = {
    theme: cookieStore.get("app_theme")?.value || undefined,
    accent: cookieStore.get("app_accent")?.value || undefined,
    animations: cookieStore.get("app_animations")?.value || undefined,
    wallpaper: cookieStore.get("app_wallpaper")?.value || undefined,
    widgets: JSON.parse(cookieStore.get("app_widgets")?.value || "null") || undefined
  };

  return (
    <html
      lang="hu"
      className={initialValues.theme === "light" ? "" : "dark"}
      style={{ colorScheme: initialValues.theme === "light" ? "light" : "dark" }}
    >
      <body className=" text-text-primary min-h-screen flex flex-col overflow-x-hidden bg-no-repeat bg-cover bg-fixed" style={{
        background: "var(--app-wallpaper)",
        backgroundSize: "var(--app-bg-size, cover)",        // <--- EZT ADD HOZZÁ
        animation: "var(--app-bg-animation, none)",         // <--- ÉS EZT IS!
        backgroundAttachment: "fixed"
      }}>
        <StartupProvider>
          <AppearanceProvider initialValues={initialValues}>
            <ProfileProvider >
              <main className="flex-1 w-full max-w-md mx-auto relative flex flex-col shadow-2xl shadow-black/50  border-x border-white/5">
                {children}
              </main>
              <NativeBackButton />
            </ProfileProvider>
          </AppearanceProvider>
        </StartupProvider>
      </body>
    </html >
  );
}