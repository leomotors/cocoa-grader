import { CocoaMessage } from "cocoa-discord-utils/message";

import { Message } from "discord.js";

import chalk from "chalk";
import fetch from "node-fetch";

import { getLang, supportedLang } from "../../../grader/compile";
import Grade, { Verdict } from "../../../grader/grader";
import { isInteractive, problemExists } from "../../../grader/problems";
import { Cocoa, style } from "../../shared";

function trim(str: string, len: number) {
    if (str.length > len) return str.slice(0, len - 3) + "...";

    return str;
}

function EmbedGen(msg: Message, result: Verdict, perf: number, lang: string) {
    const pb = result.problem;

    const e = style
        .use(msg)
        .setTitle(pb.title)
        .setDescription(
            `Description: ${pb.description}\nTime Limit: ${
                pb.timelimit
            } seconds\nMemory Limit: ${pb.memorylimit} MB\nType: ${
                pb.type ?? "normal"
            }\nSubmission Status: **${result.status}**\nSubtasks Verdict: [${
                result.subtasks
            }]${
                result.compileMessage
                    ? `\`\`\`${trim(result.compileMessage, 1024)}\`\`\``
                    : ""
            }`
        )
        .setThumbnail(
            result.status == "Accepted" ? Cocoa.GIF.ThumbsUp : Cocoa.GIF.NoPoi
        )
        .addInlineFields(
            {
                name: "Submission ID",
                value: "#" + result.submissionId.split("-")[0],
            },
            {
                name: "Language",
                value: lang,
            },
            {
                name: "Your Score",
                value: `${result.score}/${pb.maxScore ?? 100}`,
            },

            {
                name: "Graded on",
                value: `${process.platform} ${process.arch}`,
            },
            {
                name: "Grader Version",
                value: process.env.npm_package_version ?? "Unknown",
            },
            {
                name: "Time Compensation",
                value: `${process.env.EXTRA_TIME ?? 1}x`,
            },
            {
                name: "Time Used",
                value: `${result.limits.time} ms`,
            },
            {
                name: "Memory Used",
                value: `${result.limits.mem} KB`,
            },
            {
                name: "Total Grading Time",
                value: `${Math.round(perf)} ms`,
            }
        );

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

        const isInter = isInteractive(problem);
        const lang = getLang(userLang, isInter);
        if (lang == "Unsupported") {
            await msg.reply(
                isInter
                    ? "Unsupported Language! The only supported language for Interactive is C++"
                    : `Unsupported Language! The supported languages are ${supportedLang}`
            );
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
