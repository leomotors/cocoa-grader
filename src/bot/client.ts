import "dotenv/config";

import chalk from "chalk";
import { Client, Intents } from "discord.js";

import {
    ActivityGroupLoader,
    setConsoleEvent,
    useActivityGroup,
} from "cocoa-discord-utils";
import { SlashCenter } from "cocoa-discord-utils/slash";

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

const groupLoader = new ActivityGroupLoader("data/activities.json");

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    if (message.mentions.has(client.user!)) {
        processMessageCommand(message);
    }
});

client.on("ready", (cli) => {
    console.log(
        chalk.cyan(`ココアお姉ちゃん 「${cli.user.tag}」 は準備完了です`)
    );
    center.syncCommands();
    useActivityGroup(client, groupLoader);
});

client.login(process.env.DISCORD_TOKEN);

// * Console Zone
setConsoleEvent((cmd: string) => {
    if (cmd.startsWith("logout")) {
        client.destroy();
        console.log(chalk.cyan("Logged out Successfully!"));
        process.exit(0);
    }

    if (cmd.startsWith("reload")) {
        loadProblems();
        groupLoader.reload();
        return;
    }

    console.log(
        chalk.yellow(`[Console WARN] Unknown Command ${cmd.split(" ")[0]}`)
    );
});
