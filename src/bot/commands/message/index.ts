import { CogMessage } from "cocoa-discord-utils/message";

import { submit } from "./submit";

export const CocoaMsg: CogMessage = {
    name: "Cocoa",
    commands: {
        submit,
    },
};
