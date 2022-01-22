import { CocoaSlash } from "cocoa-discord-utils/slash";
import { SlashCommandBuilder } from "@discordjs/builders";

export const aboutme: CocoaSlash = {
    command: new SlashCommandBuilder()
        .setName("aboutme")
        .setDescription("Get Info about me!")
        .toJSON(),
    func: async (ctx) => {
        await ctx.reply(
            `I am Cocoa Grader! Who will carefully grade your code! 💖💖\nVersion: ${process.env.npm_package_version}`
        );
    },
};
