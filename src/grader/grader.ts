import { exec as execCb } from "child_process";
import { promisify } from "util";
import { v4 as uuid } from "uuid";

import { check } from "./check";
import { Compile, getECmd, SupportedLang } from "./compile";
import { getProblems, Problem } from "./problems";
import { shortenVerdicts } from "./utils";

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
            `cat ${caseloc}.in | timeout -t ${
                problem.timelimit *
                (parseInt(process.env.EXTRA_TIME ?? "") || 1)
            } -m ${problem.memorylimit * 1000} ${execloc}`
        );

        if (runRes.stderr.startsWith("TIMEOUT")) return "Time Limit Exceeded";
        if (!runRes.stderr.startsWith("FINISHED")) return "Runtime Error";

        if (
            await check(runRes.stdout, `${caseloc}.out`, problem.compare ?? "W")
        ) {
            return "Correct Answer";
        } else {
            return "Wrong Answer";
        }
    } catch (error) {
        return "Runtime Error";
    }
}
