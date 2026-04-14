
interface DisplayProps {
    expression: string;
    result: string | null;
}

export function Display({ expression, result }: DisplayProps) {
    return (
        <div className="bg-gray-700 p-4 text-right font-mono rounded-t-xl">
            <div className="text-lg text-white/70">
                {expression ? expression : "0"}
            </div>

            {result && (
            <div className="text-2xl font-bold text-white overflow-x-auto">
                {result}
            </div>
            )}
        </div>
    )
}