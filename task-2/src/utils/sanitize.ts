export function sanitizeExpression(input: string): string {
    const trimmedInput = input.trim();

    if (trimmedInput.length === 0) {
        throw new Error("Input cannot be empty")
    }

    if (trimmedInput.length > 50) {
        throw new Error("Input must be less than 50 characters")
    }
    
    const isValid = /^[0-9+\-*/().]+$/.test(trimmedInput)
    if (!isValid) {
        throw new Error("Invalid characters"); 
    }

    if (hasConsecutiveOperators(trimmedInput)) {
        throw new Error("Cannot have consecutive operators")
    }

    if (hasLeadingOrTrailingOperators(trimmedInput)) {
        throw new Error("Cannot lead or end input with an operator")
    }

    if (!hasBalancedParentheses(trimmedInput)) {
        throw new Error("Parentheses must be balanced")
    }

    if (trimmedInput.includes('()')) {
        throw new Error("Empty parentheses are not allowed")
    }

    return trimmedInput
}

function hasConsecutiveOperators(input: string): boolean {
    const operator = ['+', '-', '*', '/'];

    for (let i = 0; i < input.length; i++) {
        const currentChar = input[i];
        const nextChar = input[i + 1]

        if (operator.includes(currentChar)) {
            if (operator.includes(nextChar)) {
                if (nextChar === '-' && currentChar !== '-') {
                    continue
                }

                return true
            }
        }
    }
    return false
}

function hasLeadingOrTrailingOperators(input: string): boolean {
    const operator = ['+', '-', '*', '/'];
    const firstChar = input[0]
    const lastChar = input[input.length - 1]

    if (operator.includes(firstChar) && firstChar !== '-') {
        return true
    }

    if (operator.includes(lastChar)) {
        return true
    }

    return false
}

function hasBalancedParentheses(input: string): boolean {
    let count = 0;

    for(let i = 0; i < input.length; i++) {
        if (input[i] === '(') count++;
        if (input[i] === ')') count--;
        if (count < 0) return false
    }
    return count === 0;
}