import chalk from "chalk";
import { writeFile } from "fs/promises";

import { exec } from "./grader";

export type SupportedLang = "C" | "C++" | "Python" | "JavaScript" | "Haskell";

export function getLang(str: string): SupportedLang | "Unsupported" {
    if (str == "cpp" || str == "c++" || str == "cc") return "C++";
    if (str == "c") return "C";
    if (str == "hs" || str == "haskell") return "Haskell";
    if (str == "js" || str == "javascript") return "JavaScript";
    if (str.startsWith("py")) return "Python";
    return "Unsupported";
}

const extensions = {
    C: "c",
    "C++": "cpp",
    Haskell: "hs",
    JavaScript: "js",
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
            case "Haskell":
                await exec(`ghc temp/${id}.hs -o temp/${id}`);
                break;
            case "JavaScript":
                // Do Nothing Lmao
                break;
            case "Python":
                // Do Nothing too Lmao
                break;
        }
    } catch (error) {
        return false;
    }

    return true;
}

export function getECmd(lang: keyof typeof extensions, id: string) {
    if (lang == "JavaScript") return `node ./temp/${id}.js`;
    if (lang == "Python") return `python3 ./temp/${id}.py`;
    return `./temp/${id}`;
}
