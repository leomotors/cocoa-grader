import { CocoaBuildTime, CocoaVersion } from "cocoa-discord-utils/meta";
import { CocoaSlash } from "cocoa-discord-utils/slash";
import {
    Author,
    CocoaBuilder,
    ephemeral,
    getStatusFields,
} from "cocoa-discord-utils/template";

import { Embed } from "@discordjs/builders";

import { Cocoa } from "../../shared";

export const status: CocoaSlash = {
    command: CocoaBuilder("status", "Get Cocoa's Status")
        .addBooleanOption(ephemeral())
        .toJSON(),
    func: async (ctx) => {
        const ephe = ctx.options.getBoolean("ephemeral") ?? false;

        const e = new Embed()
            .setAuthor(Author(ctx))
            .setTitle("Cocoa's Status")
            .setDescription(
                `Cocoa Grader Version: ${process.env.npm_package_version}\nCocoa Utils Version: ${CocoaVersion} / ${CocoaBuildTime}`
            )
            .setColor(Cocoa.Color)
            .setThumbnail(Cocoa.GIF.Nigerundayo)
            .addFields(...(await getStatusFields(ctx)))
            .setFooter(Cocoa.Footer(ctx));

        await ctx.reply({ embeds: [e.toJSON()], ephemeral: ephe });
    },
};
