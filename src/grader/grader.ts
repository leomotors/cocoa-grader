import { exec as execCb } from "child_process";
import { promisify } from "util";
import { writeFile } from "fs/promises";
import { v4 as uuid } from "uuid";

const exec = promisify(execCb);

export default async function Grade(problem: string, code: string) {
    console.log(problem);
    console.log(code);

    const submissionId = uuid();

    try {
        await writeFile(`temp/${submissionId}.cpp`, code);
        const compileRes = await exec(
            `g++ temp/${submissionId}.cpp -o temp/${submissionId} -std=c++17 -O2 -lm`
        );
        const runRes = await exec(`./temp/${submissionId}`);
        console.log({ compileRes, runRes });
    } catch (error) {
        console.log(error);
    }

    return {
        score: 100,
    };
}
