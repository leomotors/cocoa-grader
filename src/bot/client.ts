import "dotenv/config";

import {
    ActivityGroupLoader,
    setConsoleEvent,
    useActivityGroup,
} from "cocoa-discord-utils";
import { MessageCenter } from "cocoa-discord-utils/message";
import { SlashCenter } from "cocoa-discord-utils/slash";
import { CocoaOptions } from "cocoa-discord-utils/template";

import { Client } from "discord.js";

import chalk from "chalk";

import { loadProblems } from "../grader/problems";

import { CocoaMsg } from "./commands/message";
import { Cocoa } from "./commands/slash";

loadProblems();

const client = new Client(CocoaOptions);

const msgcenter = new MessageCenter(client, { mention: true });
msgcenter.addCog(CocoaMsg);
msgcenter.validateCommands();
msgcenter.on("error", async (err, msg) => {
    await msg.reply(`Ara, Error Occured: ${err}`);
});

const slashcenter = new SlashCenter(
    client,
    process.env.GUILD_IDS?.split(",") ?? []
);
slashcenter.addCog(Cocoa);
slashcenter.validateCommands();
slashcenter.on("error", async (err, ctx) => {
    await ctx.reply(`Error Occured: ${err}`);
});

const groupLoader = new ActivityGroupLoader("data/activities.json");

client.on("ready", (cli) => {
    console.log(
        chalk.cyan(
            `ココアお姉ちゃん 「${cli.user.tag}」 ${process
                .uptime()
                .toFixed(2)}秒で 準備完了です!`
        )
    );
    slashcenter.syncCommands();
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
