import "dotenv/config";
import chalk from "chalk";
import { Client, Intents } from "discord.js";

import { SlashCenter } from "cocoa-discord-utils/slash";
import { setConsoleEvent } from "cocoa-discord-utils";

import { processMessageCommand } from "./commands/messageCmd";
import { loadProblems } from "../grader/problems";
import { Cocoa } from "./commands/slash";

loadProblems();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    ],
});

const center = new SlashCenter(client, process.env.GUILD_IDS?.split(",") ?? []);
center.addCog(Cocoa);

client.login(process.env.DISCORD_TOKEN);

client.on("ready", (cli) => {
    console.log(
        chalk.cyan(`ココアお姉ちゃん 「${cli.user.tag}」 は準備完了です`)
    );
    center.syncCommands();
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    if (message.mentions.has(client.user!)) {
        processMessageCommand(message);
    }
});

// * Console Zone
setConsoleEvent((cmd: string) => {
    if (cmd.startsWith("logout")) {
        client.destroy();
        console.log(chalk.cyan("Logged out Successfully!"));
        process.exit(0);
    }
});
