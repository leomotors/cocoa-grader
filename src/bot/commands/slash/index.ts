import { Cog } from "cocoa-discord-utils/slash";
import { getstatement } from "./getstatement";

export const Cocoa: Cog = {
    name: "Cocoa",
    commands: {
        getstatement,
    },
};
