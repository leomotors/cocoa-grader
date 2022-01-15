import { Message } from "discord.js";

import submit from "./message/submit";

const commands = {
    submit,
};

export function processMessageCommand(message: Message) {
    const rawCmd = message.content.split(" ").slice(1).join(" ");

    const cmd = rawCmd.split(" ")[0];

    for (const [cmdName, cmdFunc] of Object.entries(commands)) {
        if (cmdName === cmd) {
            cmdFunc(message);
            return;
        }
    }
}
