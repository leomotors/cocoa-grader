import { CocoaSlash } from "cocoa-discord-utils/slash";
import { Embed, SlashCommandBuilder } from "@discordjs/builders";

export const aboutme: CocoaSlash = {
    command: new SlashCommandBuilder()
        .setName("aboutme")
        .setDescription("Get Info about me!")
        .toJSON(),
    func: async (ctx) => {
        const embed = new Embed()
            .setAuthor({
                name: ctx.user.username,
                iconURL: ctx.user.avatarURL() ?? "",
            })
            .setTitle("Cocoa Grader")
            .setColor(0xe0beab)
            .setDescription(
                "I am Cocoa Grader! Who will carefully grade your code! 💖💖"
            )
            .addFields(
                {
                    name: "Version",
                    value: process.env.npm_package_version ?? "Unknown",
                    inline: true,
                },
                {
                    name: "Extra Time",
                    value: `${process.env.EXTRA_TIME ?? "1"}x`,
                    inline: true,
                },
                {
                    name: "GitHub",
                    value: "[Click](https://github.com/Leomotors/cocoa-grader)",
                    inline: true,
                },
                {
                    name: "Problem Statements",
                    value: "[Click](https://leomotors.github.io/stupid-problems/)",
                    inline: true,
                }
            )
            .setFooter({ text: "お姉ちゃんに任せなさ～い! ✨🌟" });

        await ctx.reply({
            embeds: [embed.toJSON()],
        });
    },
};
