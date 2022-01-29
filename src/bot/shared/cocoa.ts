import { getElapsed } from "cocoa-discord-utils/meta";

import { CommandInteraction, Message } from "discord.js";

export namespace Cocoa {
    export const Color = 0xe0beab;

    export namespace GIF {
        export const お姉ちゃんに任せなさい =
            "https://c.tenor.com/M8oRDrKLlUoAAAAC/gochiusa-cocoa.gif";
        export const Nigerundayo =
            "https://c.tenor.com/82-e-VM5qNwAAAAC/gochiusa-cocoa.gif";
    }

    export function Footer(ctx: CommandInteraction | Message) {
        return {
            text: `Action took ${getElapsed(
                ctx.createdAt
            )} ms・お姉ちゃんに任せなさ～い! ✨🌟`,
        };
    }
}
