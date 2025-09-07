import samsungtvplus from "./sources/samsungtvplus";
import plutotv from "./sources/plutotv";
import log from "./utils/logger";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let json = {
    channels: [],
};
let currentSource;

try {
    currentSource = "Samsung TV Plus";
    json.channels = await samsungtvplus(json.channels);
    log("spacer");
    currentSource = "Pluto TV";
    json.channels = await plutotv(json.channels);
} catch (e) {
    console.error(`Impossibile fetchare i canali da ${currentSource}: ${e.message}`);
};

log("writing");
await fs.writeFile(path.join(__dirname, "output/it/channels.json"), JSON.stringify(json, null, 4));
log("writing-done");