import { Cog } from "cocoa-discord-utils/slash";

import { aboutme } from "./aboutme";
import { getstatement } from "./getstatement";

export const Cocoa: Cog = {
    name: "Cocoa",
    commands: {
        aboutme,
        getstatement,
    },
};
