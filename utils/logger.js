export default async function log(type, options) {
    const colors = {
        gray: "\x1b[90m",
        white: "\x1b[97m",
        green: "\x1b[32m",
        reset: "\x1b[0m",
        red: "\x1b[31m",
    };
    if (type === "adding") process.stdout.write(
        `${colors.gray}Sorgente: ${colors.white}${options.source} ${colors.gray}| ` +
        `${colors.gray}Canale: ${colors.white}${options.channel.toString().padEnd(options.padding ? options.padding : 4, " ")} ${colors.gray}| ` + "\n"
    )
    else if (type === "added") process.stdout.write(
        `\x1b[1A\r` +
        `${colors.gray}Sorgente: ${colors.white}${options.source} ${colors.gray}| ` +
        `${colors.gray}Canale: ${colors.white}${options.channel.toString().padEnd(options.padding ? options.padding : 4, " ")} ${colors.gray}| ` +
        ` ${colors.green}✅  Aggiunto${options.reason ? ` (${options.reason})` : ""}${colors.reset}` + "\n"
    )
    else if (type === "not-added") process.stdout.write(
        `\x1b[1A\r` +
        `${colors.gray}Sorgente: ${colors.white}${options.source} ${colors.gray}| ` +
        `${colors.gray}Canale: ${colors.white}${options.channel.toString().padEnd(options.padding ? options.padding : 4, " ")} ${colors.gray}| ` +
        ` ${colors.red}❌  Non aggiunto (${options.reason})${colors.reset}` + "\n"
    )
    else if (type === "writing") process.stdout.write(
        `${colors.gray}Scrittura JSON${options && options.region ? ` (${options.region})` : ""} > ` + "\n"
    )
    else if (type === "writing-done") process.stdout.write(
        `\x1b[1A\r` +
        `${colors.gray}Scrittura JSON > ${colors.green}✅  Fatto!${colors.reset}` + "\n"
    )
    else if (type === "spacer") console.log(colors.gray + "─".repeat(options && options.width ? options.width : process.stdout.columns) + colors.reset);

};