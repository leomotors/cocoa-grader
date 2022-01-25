import chalk from "chalk";
import fetch from "node-fetch";
import { CocoaMessage } from "cocoa-discord-utils/message";

import { problemExists } from "../../../grader/problems";
import Grade from "../../../grader/grader";
import { getLang } from "../../../grader/compile";

// * Accept Submission and Print Result
export const submit: CocoaMessage = {
    command: {
        name: "submit",
        description: "Submit your code to the problem",
    },
    func: async (msg, strp) => {
        let problem = strp.split(/\s+/).filter((s) => s.length > 0)[0];

        if (!problemExists(problem)) {
            await msg.reply(`That Problem does not exist!`);
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
        const end = performance.now();

        sentmsg.edit(
            `Finished in ${Math.round(end - start) / 1000} seconds\n${
                result.status
            } ${result.score} [${result.subtasks}]`
        );
    },
};
