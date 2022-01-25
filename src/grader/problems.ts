import chalk from "chalk";
import fs from "fs/promises";

import { CompareType } from "./check";

export interface Problem {
    title: string;
    description: string;
    timelimit: number;
    memorylimit: number;
    subtasks: { [name: string]: number };
    maxScore?: number;
    statement?: string;
    compare?: CompareType;
}

let problemsList: { [id: string]: Problem } = {};

export async function loadProblems() {
    const buffer = await fs.readFile("problems/manifest.json");
    const problems: string[] = JSON.parse(buffer.toString()).problemLists;

    if (!problems?.length) {
        console.log(
            chalk.red("Error, No Problems, I mean.. no problems exist!")
        );
    }

    const problemsLoaded: { [id: string]: Problem } = {};
    for (const problemID of problems) {
        const buffer = await fs.readFile(`problems/${problemID}/manifest.json`);
        const problem: Problem = JSON.parse(buffer.toString());
        problemsLoaded[problemID] = problem;
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
    return problemsList[id] !== undefined;
}
