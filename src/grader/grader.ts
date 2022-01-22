import { exec as execCb } from "child_process";
import { promisify } from "util";
import { writeFile } from "fs/promises";
import { v4 as uuid } from "uuid";

import { getProblems, Problem } from "./problems";
import { wCmp } from "./compare/wcmp";
import { shortenVerdicts } from "./utils";
import { Compile, getECmd, SupportedLang } from "./compile";

export const exec = promisify(execCb);

export interface Verdict {
    status: "Compilation Error" | "Rejected" | "Accepted";
    score: number;
    subtasks: string;
}

export const VerdictDict = {
    "Correct Answer": "P",
    "Wrong Answer": "-",
    "Time Limit Exceeded": "T",
    "Runtime Error": "x",
};

export type CaseVerdict = keyof typeof VerdictDict;

export default async function Grade(
    problemID: string,
    code: string,
    lang: SupportedLang,
    submitter: string
): Promise<Verdict> {
    const problem = getProblems(problemID);
    const submissionId = uuid();

    const tag = `[#${submissionId.split("-")[0]} by ${submitter}]`;
    console.log(`${tag} Working on ${problem.title} (Language: ${lang})`);

    const res = await Compile(lang, code, submissionId);
    if (!res) {
        return {
            status: "Compilation Error",
            score: 0,
            subtasks: "E",
        };
    }

    let totalScore = 0;
    const subtaskVerdicts: CaseVerdict[] = [];
    for (const [subtaskName, subtaskScore] of Object.entries(
        problem.subtasks
    )) {
        const subtaskVerdict = await GradeCase(
            getECmd(lang, submissionId),
            `./problems/${problemID}/testcase/${subtaskName}`,
            problem
        );

        totalScore += subtaskVerdict == "Correct Answer" ? subtaskScore : 0;
        subtaskVerdicts.push(subtaskVerdict);
    }

    const subtaskStr = shortenVerdicts(subtaskVerdicts);
    console.log(`${tag} Graded ${problem.title} [${subtaskStr}]`);
    return {
        status:
            totalScore == (problem.maxScore ?? 100) ? "Accepted" : "Rejected",
        score: totalScore,
        subtasks: subtaskStr,
    };
}

async function GradeCase(
    execloc: string,
    caseloc: string,
    problem: Problem
): Promise<CaseVerdict> {
    try {
        const runRes = await exec(
            `cat ${caseloc}.in | timeout -t ${problem.timelimit} -m ${
                problem.memorylimit * 1000
            } ${execloc}`
        );

        if (runRes.stderr.startsWith("TIMEOUT")) return "Time Limit Exceeded";
        if (runRes.stderr.startsWith("MEM")) return "Runtime Error";

        if (await wCmp(runRes.stdout, `${caseloc}.out`)) {
            return "Correct Answer";
        } else {
            return "Wrong Answer";
        }
    } catch (error) {
        console.log(`Error while grading ${caseloc} : ${error}`);
        return "Runtime Error";
    }
}
