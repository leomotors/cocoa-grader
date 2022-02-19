export function shortenVerdicts(verdicts: string[]): string {
    return verdicts.join("");
}

const alp = "abcdefghijklmnopqrstuvwxyz";

/**
 * **Note**: Only work in range of [0, 701]
 *
 * You probably don't have more than 702 subtasks
 */
export function numberToAlphabet(num: number) {
    if (num < 26) return alp[num];

    return alp[Math.floor(num / 26) - 1] + alp[num % 26];
}
