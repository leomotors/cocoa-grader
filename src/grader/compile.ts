import chalk from "chalk";
import { writeFile } from "fs/promises";
import { exec } from "./grader";

export type SupportedLang = "C" | "C++" | "Python";

export function getLang(str: string): SupportedLang | "Unsupported" {
    if (str == "cpp" || str == "c++" || str == "cc") return "C++";
    if (str == "c") return "C";
    if (str.startsWith("py")) return "Python";
    return "Unsupported";
}

const extensions = {
    C: "c",
    "C++": "cpp",
    Python: "py",
};

export async function Compile(
    lang: SupportedLang,
    content: string,
    id: string
): Promise<boolean> {
    try {
        await writeFile(`temp/${id}.${extensions[lang]}`, content);
    } catch (error) {
        console.log(chalk.red(`ERROR while writing file: ${error}`));
        return false;
    }

    try {
        switch (lang) {
            case "C":
                await exec(`gcc temp/${id}.c -o temp/${id} -std=c17 -O2 -lm`);
                break;
            case "C++":
                await exec(
                    `g++ temp/${id}.cpp -o temp/${id} -std=c++17 -O2 -lm`
                );
                break;
            case "Python":
                // Do Nothing Lmao
                break;
        }
    } catch (error) {
        return false;
    }

    return true;
}

export function getECmd(lang: string, id: string) {
    if (lang == "Python") return `python3 ./temp/${id}.py`;
    return `./temp/${id}`;
}
