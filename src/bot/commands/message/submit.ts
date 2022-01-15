import chalk from "chalk";
import { Message } from "discord.js";
import fetch from "node-fetch";
import { problemExists } from "../../../grader/problems";
import Grade from "../../../grader/grader";

// * Accept Submission and Print Result
export default async function submit(message: Message) {
    let problem = message.content.split(" ")[2]?.split("\n")[0];

    if (!problemExists(problem)) {
        message.reply(`That Problem does not exist!`);
        return;
    }

    let userCode = "";

    if (message.attachments.size > 0) {
        const attachment = message.attachments.first()!;
        const url = attachment.url;
        const fname = attachment.name;

        try {
            const res = await fetch(url);
            userCode = await res.text();
        } catch (error) {
            console.log(chalk.red(`Error Reading File: ${error}`));
        }
    } else {
        const tokens = message.content.split("```");
        if (tokens.length != 3) {
            message.reply("Invalid Format");
            return;
        }

        userCode = tokens[1].split("\n").slice(1).join("\n");
    }

    if (userCode.length < 1) {
        message.reply("Where Code?");
        return;
    }

    const result = await Grade(problem, userCode);
    message.reply(`${result.status} ${result.score}`);
}
