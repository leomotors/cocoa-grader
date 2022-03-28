import chalk from "chalk";
import { writeFile } from "fs/promises";

import { exec } from "./grader";

export const supportedLang = [
    "C",
    "C++",
    "Python",
    "JavaScript",
    "Haskell",
] as const;
export type SupportedLang = typeof supportedLang[number];

function _getLang(str: string): SupportedLang | "Unsupported" {
    if (str == "cpp" || str == "c++" || str == "cc") return "C++";
    if (str == "c") return "C";
    if (str == "hs" || str == "haskell") return "Haskell";
    if (str == "js" || str == "javascript") return "JavaScript";
    if (str.startsWith("py")) return "Python";
    return "Unsupported";
}

export function getLang(
    str: string,
    isInteractive: boolean
): SupportedLang | "Unsupported" {
    const lang = _getLang(str);

    if (isInteractive) {
        if (lang != "C++") return "Unsupported";
    }

    return lang;
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
): Promise<true | string> {
    if (lang == "C++" && process.env.CLANG) {
        lang.replace(
            /#include *<bits\/stdc\+\+\.h>/,
            '#include "../vendor/stdc++.h"'
        );
    }

    try {
        await writeFile(`temp/${id}.${extensions[lang]}`, content);
    } catch (error) {
        console.log(chalk.red(`ERROR while writing file: ${error}`));
        return `${error}`;
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
        return `${error}`;
    }

    return true;
}

export async function CompileInteractive(
    problem: string,
    content: string,
    id: string
): Promise<true | string> {
    try {
        await writeFile(`temp/${id}.cpp`, content);
    } catch (error) {
        console.log(chalk.red(`ERROR while writing file: ${error}`));
        return `${error}`;
    }

    try {
        await exec(
            `g++ problems/${problem}/public/grader.cpp temp/${id}.cpp -Iproblems/${problem}/public -o temp/${id} -std=c++17 -O2 -lm`
        );
        return true;
    } catch (error) {
        return `${error}`;
    }
}

export function getECmd(lang: keyof typeof extensions, id: string) {
    if (lang == "JavaScript") return `node ./temp/${id}.js`;
    if (lang == "Python") return `python3 ./temp/${id}.py`;
    return `./temp/${id}`;
}
