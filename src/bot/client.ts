import "dotenv/config";

import {
    ActivityGroupLoader,
    checkLogin,
    ConsoleManager,
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
import { style } from "./shared";

loadProblems();

const client = new Client(CocoaOptions);

const msgcenter = new MessageCenter(client, { mention: true });
msgcenter.addCog(CocoaMsg);
msgcenter.useHelpCommand(style);
msgcenter.on("error", async (name, err, msg) => {
    await msg.reply(`あら？, Error Occured: ${err}`);
});

const slashcenter = new SlashCenter(
    client,
    process.env.GUILD_IDS?.split(",") ?? []
);
slashcenter.addCog(Cocoa);
slashcenter.useHelpCommand(style);
slashcenter.on("error", async (name, err, ctx) => {
    await ctx.reply(`あら？, Error Occured: ${err}`);
});

const groupLoader = new ActivityGroupLoader("data/activities.json");

client.on("ready", (cli) => {
    console.log(
        chalk.cyan(
            `ココアお姉ちゃん 「${cli.user.tag}」 が${process
                .uptime()
                .toFixed(2)}秒で 準備完了です!`
        )
    );
    slashcenter.syncCommands();
    useActivityGroup(client, groupLoader);
});

new ConsoleManager().useLogout(client).useReload(groupLoader, () => {
    loadProblems();
});

checkLogin(client, process.env.DISCORD_TOKEN);
