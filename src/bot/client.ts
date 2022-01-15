import { config } from "dotenv";
config();

import { Client, Intents } from "discord.js";
import { processMessageCommand } from "./commands/messageCmd";
import chalk from "chalk";
import readline from "readline";
import { loadProblems } from "../grader/problems";

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    ],
});

client.login(process.env.DISCORD_TOKEN);

client.on("ready", (cli) => {
    console.log(
        chalk.green(`ココアお姉ちゃん 「${cli.user.tag}」 は準備完了です`)
    );
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    if (message.mentions.has(client.user!)) {
        processMessageCommand(message);
    }
});

client.on("interactionCreate", (interaction) => {
    if (interaction.isCommand()) {
        // * do smth
    }
});

loadProblems();

// * Console Zone
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on("line", (cmd: string) => {
    if (cmd.startsWith("logout")) {
        client.destroy();
        console.log(chalk.cyan("Logged out Successfully!"));
        process.exit(0);
    }
});
