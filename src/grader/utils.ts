import { CaseVerdict, VerdictDict } from "./grader";

export function shortenVerdicts(verdicts: CaseVerdict[]): string {
    const verdictsShort = verdicts.map((verdict) => VerdictDict[verdict]);
    return verdictsShort.join("");
}
