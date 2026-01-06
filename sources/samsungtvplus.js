import log from "../utils/logger";
import overrides from "../overrides.json";

export default async function fetchChannels(channels) {
    let blacklist = ["ITBA1500001R6"];
    let newChannelsList = [...channels, {
        categorySeparator: "Samsung TV Plus",
        id: "samsungtvplus"
    }];

    await fetch("https://raw.githubusercontent.com/matthuisman/i.mjh.nz/refs/heads/master/SamsungTVPlus/.channels.json.gz")
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => new Uint8Array(arrayBuffer))
        .then(uintArray => Bun.gunzipSync(uintArray))
        .then(result => JSON.parse(new TextDecoder().decode(result)))
        .then(async json => {
            const spacerPadding = Object.keys(json.regions.it.channels).map(channel => json.regions.it.channels[channel]).sort((a, b) => b.name.length - a.name.length)[0].name.length;

            const channels = Object.keys(json.regions.it.channels)
                .map(channel => { let result = json.regions.it.channels[channel]; result.id = channel; return result })
                .sort((a, b) => a.chno - b.chno);
                
            for (const channel of channels) {
                await new Promise(r => setTimeout(r, 100));
                log("adding", { source: "Samsung TV Plus", channel: channel.name, padding: spacerPadding });
                if (!overrides["samsungtvplus"][channel.id] || (overrides["samsungtvplus"][channel.id] && !overrides["samsungtvplus"][channel.id].url)) {
                    if (!blacklist.includes(channel.id)) {
                        if (!channel.license_url) {
                            const url = await fetch(`https://jmp2.uk/stvp-${channel.id}`, { redirect: "manual" }).then(response => response.headers.get("Location"));
                            if (!new URL(url).hostname.includes("pluto.tv")) {
                                if (!overrides["samsungtvplus"][channel.id]) {
                                    newChannelsList.push({
                                        lcn: channel.chno,
                                        logo: "https://tvpdotcomdynamiclogopeu.samsungcloud.tv/resize?url=" + channel.logo + "&h=250",
                                        name: channel.name,
                                        type: "hls",
                                        url: url,
                                        epg: {
                                            source: "samsungtvplus",
                                            id: channel.id
                                        }
                                    });
                                    log("added", { source: "Samsung TV Plus", channel: channel.name, padding: spacerPadding });
                                } else {
                                    let channelValue = {
                                        lcn: channel.chno,
                                        logo: "https://tvpdotcomdynamiclogopeu.samsungcloud.tv/resize?url=" + channel.logo + "&h=250",
                                        name: channel.name,
                                        type: "hls",
                                        url: url,
                                        epg: {
                                            source: "samsungtvplus",
                                            id: channel.id
                                        }
                                    };
                                    if (overrides["samsungtvplus"][channel.id].type) channelValue.type = overrides["samsungtvplus"][channel.id].type;
                                    if (overrides["samsungtvplus"][channel.id].url) channelValue.url = overrides["samsungtvplus"][channel.id].url;
                                    if (overrides["samsungtvplus"][channel.id].license) channelValue.license = overrides["samsungtvplus"][channel.id].license;
                                    newChannelsList.push(channelValue);
                                    log("added", { source: "Samsung TV Plus", channel: channel.name, padding: spacerPadding, reason: "con proprietà aggiuntive" });
                                };
                            } else {
                                log("not-added", { source: "Samsung TV Plus", channel: channel.name, padding: spacerPadding, reason: "CORS - Pluto TV" });
                            };
                        } else {
                            log("not-added", { source: "Samsung TV Plus", channel: channel.name, padding: spacerPadding, reason: "DRM" });
                        };
                    } else {
                        log("not-added", { source: "Samsung TV Plus", channel: channel.name, padding: spacerPadding, reason: "Blacklist" });
                    };
                } else {
                    newChannelsList.push({
                        lcn: channel.chno,
                        logo: "https://tvpdotcomdynamiclogopeu.samsungcloud.tv/resize?url=" + channel.logo + "&h=250",
                        name: channel.name,
                        type: overrides["samsungtvplus"][channel.id].type,
                        url: overrides["samsungtvplus"][channel.id].url,
                        epg: {
                            source: "samsungtvplus",
                            id: channel.id
                        }
                    });
                    log("added", { source: "Samsung TV Plus", channel: channel.name, padding: spacerPadding, reason: "Override" });
                };
            };
        });

    return newChannelsList;
};