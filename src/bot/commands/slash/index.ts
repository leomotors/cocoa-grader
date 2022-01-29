import { CogSlash } from "cocoa-discord-utils/slash";

import { aboutme } from "./aboutme";
import { getstatement } from "./getstatement";
import { status } from "./status";

export const Cocoa: CogSlash = {
    name: "Cocoa",
    commands: {
        aboutme,
        getstatement,
        status,
    },
};
