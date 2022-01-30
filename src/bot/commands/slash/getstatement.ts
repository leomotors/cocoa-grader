import { CocoaSlash } from "cocoa-discord-utils/slash";
import { Author } from "cocoa-discord-utils/template";

import { Embed, SlashCommandBuilder } from "@discordjs/builders";

import { getProblems } from "../../../grader/problems";
import { Cocoa } from "../../shared";

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
            await ctx.reply(
                "That problem doesn't exist! See all available problems here: https://leomotors.github.io/stupid-problems/"
            );
            return;
        }

        if (Problem.statement)
            await ctx.reply({
                embeds: [
                    new Embed()
                        .setAuthor(Author(ctx))
                        .setTitle(Problem.title)
                        .setDescription(
                            `ID: ${problem_name}\nDescription: ${
                                Problem.description
                            }\nStatement: ${
                                Problem.statement
                                    ? `[Click Here](${Problem.statement}`
                                    : "Does not exist"
                            })`
                        )
                        .setColor(Cocoa.Color)
                        .setThumbnail(Cocoa.GIF.CoffeeNomu)
                        .setFooter(Cocoa.Footer(ctx))
                        .toJSON(),
                ],
            });
        else await ctx.reply("Sorry, this problem doesn't have statement");
    },
};
