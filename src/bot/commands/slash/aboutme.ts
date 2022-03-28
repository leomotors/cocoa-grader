import { CocoaVersion } from "cocoa-discord-utils/meta";
import { CocoaSlash } from "cocoa-discord-utils/slash";
import {
    CocoaBuilder,
    Ephemeral,
    getEphemeral,
} from "cocoa-discord-utils/template";

import { Cocoa, style } from "../../shared";

export const aboutme: CocoaSlash = {
    command: CocoaBuilder("aboutme", "Get Info about me!")
        .addBooleanOption(Ephemeral())
        .toJSON(),
    func: async (ctx) => {
        const ephemeral = getEphemeral(ctx);
        const embed = style
            .use(ctx)
            .setTitle("Cocoa Grader")

            .setDescription(
                "I am Cocoa Grader! Who will carefully grade your code! 💖💖"
            )
            .setThumbnail(Cocoa.GIF.お姉ちゃんに任せなさい)
            .addInlineFields(
                {
                    name: "Bot Version",
                    value: process.env.npm_package_version ?? "Unknown",
                },
                {
                    name: "Cocoa Utils Version",
                    value: CocoaVersion,
                },
                {
                    name: "Time Compensation",
                    value: `${process.env.EXTRA_TIME ?? "1"}x`,
                },
                {
                    name: "GitHub Project",
                    value: "[Click](https://github.com/Leomotors/cocoa-grader)",
                },
                {
                    name: "Problem Statements",
                    value: "[Click](https://leomotors.github.io/stupid-problems/)",
                }
            );

        await ctx.reply({
            embeds: [embed.toJSON()],
            ephemeral,
        });
    },
};
