import chalk from "chalk";
import fs from "fs/promises";

import { CompareType } from "./check";
import { exec } from "./grader";

export interface Subtask {
    grouped?: boolean;
    scores: number[];
}

export const ProblemTypes = ["normal", "interactive"] as const;

export interface Problem {
    title: string;
    description: string;
    // * Time Limit in Seconds
    timelimit: number;
    // * Memory Limit in MB
    memorylimit: number;
    type?: typeof ProblemTypes[number];
    subtasks: { [name: string]: number | Subtask };
    // * Default = 100
    // TODO Auto Infer maxScore from subtasks
    maxScore?: number;
    statement?: string;
    // * Default = "W"
    compare?: CompareType;
}

let problemsList: { [id: string]: Problem } = {};

export async function loadProblems() {
    const problems = (await exec("ls problems")).stdout
        .split("\n")
        .filter((l) => !l.includes(".") && l.length > 0);

    if (!problems?.length) {
        console.log(
            chalk.red("Error, No Problems, I mean.. no problems exist!")
        );
    }

    const problemsLoaded: { [id: string]: Problem } = {};
    for (const problemID of problems) {
        try {
            const buffer = await fs.readFile(
                `problems/${problemID}/manifest.json`
            );
            const problem: Problem = JSON.parse(buffer.toString());
            problemsLoaded[problemID] = problem;
        } catch (err) {
            console.log(chalk.red(`Cannot load ${problemID}: ${err}`));
        }
    }

    problemsList = problemsLoaded;

    console.log(
        chalk.green(
            `Successfully loaded ${Object.keys(problemsList).length} problems`
        )
    );
}

export function getProblems(id: string) {
    return problemsList[id];
}

export function problemExists(id: string): boolean {
    return id in problemsList;
}

export function isInteractive(id: string) {
    return getProblems(id).type == "interactive";
}
