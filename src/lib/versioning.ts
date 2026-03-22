// Bárhol a kódodban (komponensben vagy szerver akcióban)
import packageInfo from "../../package.json"; // Az útvonalat igazítsd a fájlod helyéhez!

export const getVersionNumber = () => {
    return packageInfo.version;
};