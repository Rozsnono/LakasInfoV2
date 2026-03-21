import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export async function exportFile(
    selectedFile: unknown,
    fileType: string,
    fileName: string,
    isError: boolean,
    setIsError: (value: boolean) => void
) {
    try {
        const response = await fetch(selectedFile as string);
        const blob = await response.blob();

        if (Capacitor.isNativePlatform()) {
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === "string") {
                        const base64 = reader.result.split(",")[1];
                        resolve(base64);
                    } else {
                        reject(new Error("Hibás fájl konverzió"));
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Cache,
            });

            await Share.share({
                title: "Fájl megosztása",
                url: savedFile.uri,
            });
        } else {
            const file = new File([blob], fileName, { type: blob.type || fileType });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: "Fájl megosztása",
                    files: [file]
                });
            } else {
                const link = document.createElement("a");
                link.href = selectedFile as string;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    } catch (err) {
        console.error("Hiba történt a megosztáskor", err);
        setIsError(true);
    }
}