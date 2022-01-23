import chalk from "chalk";
import { Message } from "discord.js";
import fetch from "node-fetch";
import { problemExists } from "../../../grader/problems";
import Grade from "../../../grader/grader";
import { getLang } from "../../../grader/compile";

// * Accept Submission and Print Result
export default async function submit(message: Message) {
    let problem = message.content
        .split(" ")
        .filter((s) => s.length > 0)[2]
        ?.split("\n")[0];

    if (!problemExists(problem)) {
        await message.reply(`That Problem does not exist!`);
        return;
    }

    let userCode = "";
    let userLang = "";

    if (message.attachments.size > 0) {
        const attachment = message.attachments.first()!;
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
        const tokens = message.content.split("```");
        if (tokens.length != 3) {
            await message.reply("Invalid Format");
            return;
        }

        userCode = tokens[1].split("\n").slice(1).join("\n");
        userLang = tokens[1].split("\n")[0];
    }

    if (userCode.length < 1) {
        await message.reply("Where Code?");
        return;
    }
    if (userLang.length < 1) {
        await message.reply("Please Specify Language");
        return;
    }

    const lang = getLang(userLang);
    if (lang == "Unsupported") {
        await message.reply("Unsupported Language");
        return;
    }

    const msg = await message.reply("Grading...");

    const start = performance.now();
    const result = await Grade(problem, userCode, lang, message.author.tag);
    const end = performance.now();

    msg.edit(
        `Finished in ${Math.round(end - start) / 1000} seconds\n${
            result.status
        } ${result.score} [${result.subtasks}]`
    );
}
