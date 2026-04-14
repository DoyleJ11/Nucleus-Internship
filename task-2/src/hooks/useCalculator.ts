import { useState } from "react";
import { evaluateExpression } from "../utils/evaluate";
import type { HistoryEntry } from "../types/calculator";

export function useCalculator() {
    const [display, setDisplay] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>(() => {
        try {
            const saved = localStorage.getItem('calculator-history');
            if (saved) {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed)) return parsed;
            }
        } catch {
            // corrupted data, start fresh
        }
        return [];
    })

    function appendToDisplay(value: string) {
        // If the user types a number after we got a result, start fresh
        // If the user types an oprator, continue from result
        if (result !== null) {
            const isOperator = ['+', '-', '*', '/'].includes(value);
            if (isOperator) {
                setDisplay(result + value);
            } else {
                setDisplay(value);
            }
            setResult(null);
            return;
        }

        setDisplay(display + value);
    }

    function clearDisplay() {
        setDisplay('');
        setResult(null);
    }

    function deleteLast() {
        if (display.length > 0) {
            setDisplay(display.slice(0, -1));
        }
    }

    function calculateResult() {
        if (display === '') return;

        const evalResult = evaluateExpression(display);

        if (!evalResult.success) {
            setResult(evalResult.error);
            return;
        }

        setResult(evalResult.value);

        const historyItem: HistoryEntry = {
            expression: display,
            result: evalResult.value,
            timestamp: Date.now()
        }
        const updatedHistory = [...history, historyItem].slice(-50); // Cap history at 50
        setHistory(updatedHistory);
        localStorage.setItem('calculator-history', JSON.stringify(updatedHistory));
    }

    function loadHistoryEntry(entry: HistoryEntry) {
        setDisplay(entry.expression);
        setResult(entry.result);
    }

    return { display, result, history, appendToDisplay, clearDisplay, deleteLast, calculateResult, loadHistoryEntry }
}