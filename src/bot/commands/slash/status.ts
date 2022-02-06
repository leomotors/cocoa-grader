import { CocoaBuildTime, CocoaVersion } from "cocoa-discord-utils/meta";
import { CocoaSlash } from "cocoa-discord-utils/slash";
import {
    CocoaBuilder,
    ephemeral,
    getStatusFields,
} from "cocoa-discord-utils/template";

import { Cocoa, style } from "../../shared";

export const status: CocoaSlash = {
    command: CocoaBuilder("status", "Get Cocoa's Status")
        .addBooleanOption(ephemeral())
        .toJSON(),
    func: async (ctx) => {
        const ephe = ctx.options.getBoolean("ephemeral") ?? false;

        const e = style
            .use(ctx)
            .setTitle("Cocoa's Status")
            .setDescription(
                `Cocoa Grader Version: ${process.env.npm_package_version}\nCocoa Utils Version: ${CocoaVersion} / ${CocoaBuildTime}`
            )
            .setThumbnail(Cocoa.GIF.Nigerundayo)
            .addFields(...(await getStatusFields(ctx)));

        await ctx.reply({ embeds: [e.toJSON()], ephemeral: ephe });
    },
};
