import chalk from "chalk";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { v4 as uuid } from "uuid";

import { check } from "./check";
import { Compile, CompileInteractive, getECmd, SupportedLang } from "./compile";
import { getProblems, Problem } from "./problems";
import { numberToAlphabet, shortenVerdicts } from "./utils";

export const exec = promisify(execCb);

export type Limits = { time: number; mem: number };

export interface Verdict {
    status: "Compilation Error" | "Rejected" | "Accepted";
    score: number;
    problem: Problem;
    subtasks: string;
    submissionId: string;
    limits: Limits;
    compileMessage?: string;
}

export const VerdictDict = {
    "Correct Answer": "P",
    "Wrong Answer": "-",
    "Time Limit Exceeded": "T",
    "Runtime Error": "x",
};

export type CaseVerdict = keyof typeof VerdictDict | number;

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

    const limits = {
        time: 0,
        mem: 0,
    };

    const res =
        problem.type == "interactive"
            ? await CompileInteractive(problemID, code, submissionId)
            : await Compile(lang, code, submissionId);
    if (typeof res == "string") {
        console.log(`${tag} Graded ${problem.title} [COMPILATION ERROR]`);
        return {
            status: "Compilation Error",
            score: 0,
            problem,
            subtasks: "E".repeat(Object.keys(problem.subtasks).length),
            submissionId,
            limits,
            compileMessage: res,
        };
    }

    const isInteractive = problem.type == "interactive";
    let totalScore = 0;
    const ecmd = getECmd(lang, submissionId);
    const subtaskVerdicts: string[] = [];
    for (const [subtaskName, subtaskScore] of Object.entries(
        problem.subtasks
    )) {
        if (typeof subtaskScore == "number") {
            const subtaskVerdict = await GradeCase(
                ecmd,
                `./problems/${problemID}/testcase/${subtaskName}`,
                problem,
                limits
            );

            totalScore +=
                isInteractive && typeof subtaskVerdict == "number"
                    ? subtaskVerdict
                    : subtaskVerdict == "Correct Answer"
                    ? subtaskScore
                    : 0;
            subtaskVerdicts.push(
                typeof subtaskVerdict == "number"
                    ? ` ${subtaskVerdict} `
                    : VerdictDict[subtaskVerdict]
            );
            continue;
        }

        let subtasksVerdict = "";
        let subtasksScore = 0;
        let maxsubtaskScore = 0;
        for (const [id, subtask] of Object.entries(subtaskScore.scores)) {
            const subtaskVerdict = await GradeCase(
                ecmd,
                `./problems/${problemID}/testcase/${subtaskName}${numberToAlphabet(
                    +id
                )}`,
                problem,
                limits
            );

            subtasksScore +=
                isInteractive && typeof subtaskVerdict == "number"
                    ? subtaskVerdict
                    : subtaskVerdict == "Correct Answer"
                    ? subtask
                    : 0;
            maxsubtaskScore += subtask;
            subtasksVerdict +=
                typeof subtaskVerdict == "number"
                    ? ` ${subtaskVerdict} `
                    : VerdictDict[subtaskVerdict];
        }

        subtaskVerdicts.push(`[${subtasksVerdict}]`);
        if (!subtaskScore.grouped || subtasksScore == maxsubtaskScore) {
            totalScore += subtasksScore;
        }
    }

    const subtaskStr = shortenVerdicts(subtaskVerdicts);
    console.log(`${tag} Graded ${problem.title} [${subtaskStr}]`);
    return {
        status:
            totalScore == (problem.maxScore ?? 100) ? "Accepted" : "Rejected",
        score: Math.floor(totalScore * 100) / 100,
        problem,
        subtasks: subtaskStr,
        submissionId,
        limits,
    };
}

async function GradeCase(
    execloc: string,
    caseloc: string,
    problem: Problem,
    limits: Limits
): Promise<CaseVerdict> {
    try {
        const runRes = await exec(
            `cat ${caseloc}.in | timeout -t ${
                problem.timelimit *
                (parseInt(process.env.EXTRA_TIME ?? "") || 1)
            } -m ${problem.memorylimit * 1000} ${execloc}`
        );

        const toTok = runRes.stderr.split(" ").filter((s) => s.length > 0);
        const time = +toTok[2] * 1000;
        const mem = +toTok[6];

        limits.time = Math.max(limits.time, isNaN(time) ? 0 : time);
        limits.mem = Math.max(limits.mem, isNaN(mem) ? 0 : mem);

        if (toTok[0] == "TIMEOUT") return "Time Limit Exceeded";
        if (toTok[0] != "FINISHED") return "Runtime Error";

        if (problem.type == "interactive") {
            const casted = +runRes.stdout;

            return isNaN(casted) ? 0 : casted;
        }

        if (
            await check(runRes.stdout, `${caseloc}.out`, problem.compare ?? "W")
        ) {
            return "Correct Answer";
        } else {
            return "Wrong Answer";
        }
    } catch (error) {
        if (`${error}`.includes("timeout --help")) {
            console.log(
                chalk.yellow(
                    "You probably did not installed pshved/timeout, do you?"
                )
            );
        }
        return "Runtime Error";
    }
}
