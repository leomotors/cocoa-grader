import { CogSlash } from "cocoa-discord-utils/slash";

import { aboutme } from "./aboutme";
import { getstatement } from "./getstatement";

export const Cocoa: CogSlash = {
    name: "Cocoa",
    commands: {
        aboutme,
        getstatement,
    },
};
