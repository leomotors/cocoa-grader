import fs from "fs/promises";

function convertToW(s: string): string[] {
    return s.split(/\s+/).filter((s) => s.length > 0);
}

export async function wCmp(user: string, file: string): Promise<boolean> {
    const buffer = await fs.readFile(file);
    const ans = buffer.toString();

    const userAns = convertToW(user);
    const correctAns = convertToW(ans);

    if (userAns.length !== correctAns.length) {
        return false;
    }

    for (let i = 0; i < userAns.length; i++) {
        if (userAns[i] !== correctAns[i]) {
            return false;
        }
    }

    return true;
}
