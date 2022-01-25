import fs from "fs/promises";

function convertToTokens(s: string): string[] {
    return s.split(/\s+/).filter((s) => s.length > 0);
}

export type CompareType = "W" | "F4" | "F6" | "FA4" | "FA6";

function compare(user: string, file: string, type: CompareType): boolean {
    if (type == "W") {
        return user == file;
    }

    const n1 = Number(user);
    const n2 = Number(file);

    if (isNaN(n1)) return false;

    // * Absolute Error
    if (type == "FA4" || type == "FA6") {
        return Math.abs(n1 - n2) <= Math.pow(10, -type[2]);
    }

    // * Relative Error
    if (type == "F4" || type == "F6") {
        return Math.abs(n1 - n2) <= Math.pow(10, -type[1]) * Math.abs(n2);
    }

    return false;
}

export async function check(
    user: string,
    file: string,
    type: CompareType
): Promise<boolean> {
    const buffer = await fs.readFile(file);
    const ans = buffer.toString();

    const userAns = convertToTokens(user);
    const correctAns = convertToTokens(ans);

    if (userAns.length !== correctAns.length) {
        return false;
    }

    for (let i = 0; i < userAns.length; i++) {
        if (!compare(userAns[i], correctAns[i], type)) {
            return false;
        }
    }

    return true;
}
