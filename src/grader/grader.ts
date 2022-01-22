import { exec as execCb } from "child_process";
import { promisify } from "util";
import { writeFile } from "fs/promises";
import { v4 as uuid } from "uuid";

import { getProblems } from "./problems";
import { wCmp } from "./compare/wcmp";

const exec = promisify(execCb);

export interface Verdict {
    status: "Compilation Error" | "Rejected" | "Accepted";
    score: number;
}

export type CaseVerdict =
    | "Correct Answer"
    | "Wrong Answer"
    | "Time Limit Exceeded"
    | "Runtime Error";

export default async function Grade(
    problemID: string,
    code: string
): Promise<Verdict> {
    const problem = getProblems(problemID);
    const submissionId = uuid();

    try {
        await writeFile(`temp/${submissionId}.cpp`, code);
        await exec(
            `g++ temp/${submissionId}.cpp -o temp/${submissionId} -std=c++17 -O2 -lm`
        );
    } catch (error) {
        return { status: "Compilation Error", score: 0 };
    }

    let totalScore = 0;
    for (const [subtaskName, subtaskScore] of Object.entries(
        problem.subtasks
    )) {
        const subtaskRes =
            (await GradeCase(
                `./temp/${submissionId}`,
                `./problems/${problemID}/testcase/${subtaskName}`
            )) == "Correct Answer";

        totalScore += subtaskRes ? subtaskScore : 0;
    }

    return {
        status:
            totalScore == (problem.maxScore ?? 100) ? "Accepted" : "Rejected",
        score: totalScore,
    };
}

async function GradeCase(
    execloc: string,
    caseloc: string
): Promise<CaseVerdict> {
    try {
        const runRes = await exec(`cat ${caseloc}.in | ${execloc}`);
        if (await wCmp(runRes.stdout, `${caseloc}.out`)) {
            return "Correct Answer";
        } else {
            return "Wrong Answer";
        }
    } catch (error) {
        console.log(error);
        return "Runtime Error";
    }
}
