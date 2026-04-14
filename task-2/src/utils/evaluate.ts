import { sanitizeExpression } from "./sanitize";
import { evaluate } from "mathjs";

export type EvalResult =
    | { success: true; value: string }
    | { success: false; error: string };

export function evaluateExpression(expr: string): EvalResult {
    try {
        const sanitizedExpr = sanitizeExpression(expr);
        const result = evaluate(sanitizedExpr);

        if (typeof result !== 'number' || !isFinite(result)) {
            return { success: false, error: "Error" };
        }

        return { success: true, value: parseFloat(result.toFixed(10)).toString() };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        return { success: false, error: message };
    }
}