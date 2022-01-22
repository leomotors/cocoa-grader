import chalk from "chalk";
import { Message } from "discord.js";

import submit from "./message/submit";

const commands = {
    submit,
};

export async function processMessageCommand(message: Message) {
    const rawCmd = message.content
        .split(" ")
        .filter((s) => s.length > 0)
        .slice(1)
        .join(" ");

    const cmd = rawCmd.split(" ")[0];

    for (const [cmdName, cmdFunc] of Object.entries(commands)) {
        if (cmdName === cmd) {
            try {
                await cmdFunc(message);
            } catch (error) {
                console.log(chalk.red(`Error Processing Command: ${error}`));
            }
            return;
        }
    }
}
