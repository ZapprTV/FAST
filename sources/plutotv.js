import log from "../utils/logger";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const host = "https://fast.zappr.stream";

export default async function fetchChannels(channels) {
    const token = await fetch("https://boot.pluto.tv/v4/start?appName=web&appVersion=9.15.0-eb7e53f132160fea7492a1ba2db9044b730c24cc&clientID=1634bc91-acf1-40f2-ada1-c731446c0afb&clientModelNumber=1.0.0", {
        headers: {
            "X-Forwarded-For": "131.114.130.239"
        }
    })
        .then(response => response.json())
        .then(json => json.sessionToken);

    let newChannelsList = [...channels, {
        categorySeparator: "Pluto TV",
        id: "plutotv"
    }];
    await fetch("https://service-channels.clusters.pluto.tv/v2/guide/channels?channelIds=&offset=0&limit=1000&sort=number%3Aasc", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(async json => {
            await new Promise(r => setTimeout(r, 50));
            const spacerPadding = json.data.sort((a, b) => b.name.length - a.name.length)[0].name.length;
            const channels = json.data.sort((a, b) => a.number - b.number);

            for (const channel of channels) {
                log("adding", { source: "Pluto TV", channel: channel.name, padding: spacerPadding });
                
                const logo = await fetch(channel.images.filter(el => el.type === "colorLogoPNG")[0].url)
                    .then(response => response.arrayBuffer())
                    .then(arrayBuffer => Buffer.from(arrayBuffer));
                
                await sharp(logo).trim().toFile(path.join(__dirname, `../output/it/logos/${channel.slug}.webp`));

                newChannelsList.push({
                    lcn: channel.number + 5000,
                    logo: `${host}/it/logos/${channel.slug}.webp`,
                    name: channel.name,
                    type: "iframe",
                    url: "https://app-philipsnovatek.pluto.tv/live-tv/watch/" + channel.slug,
                    epg: {
                        source: "plutotv",
                        id: channel.id
                    }
                });
                log("added", { source: "Pluto TV", channel: channel.name, padding: spacerPadding });
            };
        });

    return newChannelsList;
};