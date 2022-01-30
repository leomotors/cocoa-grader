import { CocoaMessage } from "cocoa-discord-utils/message";
import { Author } from "cocoa-discord-utils/template";

import { Message } from "discord.js";

import { Embed } from "@discordjs/builders";

import chalk from "chalk";
import fetch from "node-fetch";

import { getLang } from "../../../grader/compile";
import Grade, { Verdict } from "../../../grader/grader";
import { problemExists } from "../../../grader/problems";
import { Cocoa } from "../../shared";

function EmbedGen(msg: Message, result: Verdict, perf: number, lang: string) {
    const pb = result.problem;

    const e = new Embed()
        .setAuthor(Author(msg))
        .setTitle(pb.title)
        .setDescription(
            `Description: ${pb.description}\nTime Limit: ${pb.timelimit} seconds\nMemory Limit: ${pb.memorylimit} MB\nSubmission Status: **${result.status}**\nSubtasks Verdict: [${result.subtasks}]`
        )
        .setColor(Cocoa.Color)
        .setThumbnail(Cocoa.GIF.NoPoi)
        .addFields(
            {
                name: "Submission ID",
                value: "#" + result.submissionId.split("-")[0],
                inline: true,
            },
            {
                name: "Language",
                value: lang,
                inline: true,
            },
            {
                name: "Your Score",
                value: `${result.score}/${pb.maxScore ?? 100}`,
                inline: true,
            },

            {
                name: "Graded on",
                value: `${process.platform} ${process.arch}`,
                inline: true,
            },
            {
                name: "Grader Version",
                value: process.env.npm_package_version ?? "Unknown",
                inline: true,
            },
            {
                name: "Time Compensation",
                value: `${process.env.EXTRA_TIME ?? 1}x`,
                inline: true,
            },
            {
                name: "Time Used",
                value: `${result.limits.time} ms`,
                inline: true,
            },
            {
                name: "Memory Used",
                value: `${result.limits.mem} KB`,
                inline: true,
            },
            {
                name: "Total Grading Time",
                value: `${Math.round(perf)} ms`,
                inline: true,
            }
        )
        .setFooter(Cocoa.Footer(msg));

    return pb.statement ? e.setURL(pb.statement) : e;
}

// * Accept Submission and Print Result
export const submit: CocoaMessage = {
    command: {
        name: "submit",
        description: "Submit your code to the problem",
    },
    func: async (msg, strp) => {
        const problem = strp.split(/\s+/).filter((s) => s.length > 0)[0];

        if (!problemExists(problem)) {
            await msg.reply("That Problem does not exist!");
            return;
        }

        let userCode = "";
        let userLang = "";

        if (msg.attachments.size > 0) {
            const attachment = msg.attachments.first()!;
            const url = attachment.url;
            const fname = attachment.name;

            try {
                const res = await fetch(url);
                userCode = await res.text();
                const tokens = fname?.split(".");
                userLang = tokens?.[tokens.length - 1] ?? "";
            } catch (error) {
                console.log(chalk.red(`Error Reading File: ${error}`));
            }
        } else {
            const tokens = strp.split("```");
            if (tokens.length != 3) {
                await msg.reply("Invalid Format");
                return;
            }

            userCode = tokens[1].split("\n").slice(1).join("\n");
            userLang = tokens[1].split("\n")[0];
        }

        if (userCode.length < 1) {
            await msg.reply("Where Code?");
            return;
        }
        if (userLang.length < 1) {
            await msg.reply("Please Specify Language");
            return;
        }

        const lang = getLang(userLang);
        if (lang == "Unsupported") {
            await msg.reply("Unsupported Language");
            return;
        }

        const sentmsg = await msg.reply("Grading...");

        const start = performance.now();
        const result = await Grade(problem, userCode, lang, msg.author.tag);
        const perf = performance.now() - start;

        sentmsg.edit({
            content: "Graded!",
            embeds: [EmbedGen(msg, result, perf, lang).toJSON()],
        });
    },
};
