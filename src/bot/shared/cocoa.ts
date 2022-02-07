import { createEmbedStyle } from "cocoa-discord-utils";
import { getElapsed } from "cocoa-discord-utils/meta";

import { CommandInteraction, Message } from "discord.js";

export namespace Cocoa {
    export const Color = 0xe0beab;

    export namespace GIF {
        export const お姉ちゃんに任せなさい =
            "https://c.tenor.com/M8oRDrKLlUoAAAAC/gochiusa-cocoa.gif";
        export const Nigerundayo =
            "https://c.tenor.com/82-e-VM5qNwAAAAC/gochiusa-cocoa.gif";
        export const CoffeeNomu =
            "https://c.tenor.com/Opn-i9gh6fsAAAAC/%E3%81%93%E3%81%93%E3%81%82-%E3%81%94%E3%81%A1%E3%81%86%E3%81%95.gif";
        export const NoPoi =
            "https://c.tenor.com/EnFZ1mgZBFYAAAAC/gochiusa-cocoa.gif";
        export const ThumbsUp =
            "https://c.tenor.com/O46FOm38idkAAAAC/thumbs-up-cocoa.gif";
    }

    export function Footer(ctx: CommandInteraction | Message) {
        return {
            text: `Action took ${getElapsed(
                ctx.createdAt
            )} ms・お姉ちゃんに任せなさ～い! ✨🌟`,
        };
    }
}

export const style = createEmbedStyle({
    author: "invoker",
    color: Cocoa.Color,
    footer: (ctx) => Cocoa.Footer(ctx),
});
