import { CocoaSlash } from "cocoa-discord-utils/slash";
import { SlashCommandBuilder } from "@discordjs/builders";

import { getProblems } from "../../../grader/problems";

export const getstatement: CocoaSlash = {
    command: new SlashCommandBuilder()
        .setName("getstatement")
        .setDescription("Get Statement of a Problem")
        .addStringOption((option) =>
            option
                .setName("problem_name")
                .setDescription("Name of the problem")
                .setRequired(true)
        )
        .toJSON(),
    func: async (ctx) => {
        const problem_name = ctx.options.getString("problem_name", true);
        const Problem = getProblems(problem_name);

        if (!problem_name || !Problem) {
            await ctx.reply("That problem doesn't exist!");
            return;
        }

        if (Problem.statement)
            await ctx.reply(
                `Here is statement for ${Problem.title}\n${Problem.statement}`
            );
        else await ctx.reply("Sorry, this problem doesn't have statement");
    },
};
