import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

type ShareDataType = "string" | "base64" | "url" | "file";

interface ShareOptions {
    data: string | File;
    dataType: ShareDataType;
    fileName?: string;
    title?: string;
    setIsError: (value: boolean) => void;
}

export async function unknownShare({
    data,
    dataType,
    fileName = "megosztas.png",
    title = "Megosztás",
    setIsError
}: ShareOptions) {
    try {
        if (dataType === "string") {
            await Share.share({
                title,
                text: data as string,
            });
            return;
        }

        if (Capacitor.isNativePlatform()) {
            let base64Data = "";

            if (dataType === "base64") {
                base64Data = (data as string).split(",")[1] || (data as string);
            } else if (dataType === "url") {
                const response = await fetch(data as string);
                const blob = await response.blob();
                base64Data = await blobToBase64(blob);
            } else if (dataType === "file" && data instanceof File) {
                base64Data = await blobToBase64(data);
            }

            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Cache,
            });

            await Share.share({
                title,
                url: savedFile.uri,
            });
        } else {
            if (dataType === "url") {
                await navigator.share({ title, url: data as string });
            } else {
                let fileToShare: File;

                if (data instanceof File) {
                    fileToShare = data;
                } else {
                    const res = await fetch(data as string);
                    const blob = await res.blob();
                    fileToShare = new File([blob], fileName, { type: blob.type });
                }

                if (navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
                    await navigator.share({
                        title,
                        files: [fileToShare],
                    });
                } else {
                    const link = document.createElement("a");
                    link.href = data instanceof File ? URL.createObjectURL(data) : (data as string);
                    link.download = fileName;
                    link.click();
                }
            }
        }
    } catch (err) {
        console.error("Hiba történt a megosztáskor", err);
        setIsError(true);
    }
}

async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}