import { type HistoryEntry } from "../types/calculator";

interface HistoryProps {
    history: HistoryEntry[];
    onSelect: (entry: HistoryEntry) => void;
}

export function History({ history, onSelect }: HistoryProps) {
    return (
        <div className="mt-4 rounded-xl bg-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700">
                <h2 className="text-sm text-white/50 font-semibold uppercase tracking-wide">
                    History ({history.length})
                </h2>
            </div>
            <div className="max-h-48 overflow-y-auto">
                {history.length > 0 ? (
                    [...history].reverse().map(entry => (
                        <button
                            className="w-full text-left px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700/50 last:border-b-0"
                            onClick={() => onSelect(entry)}
                            key={entry.timestamp}
                        >
                            <span className="text-sm text-white/50 font-mono">{entry.expression}</span>
                            <span className="text-sm text-white/30 mx-2">=</span>
                            <span className="text-base text-white font-semibold font-mono">{entry.result}</span>
                        </button>
                    ))
                ) : (
                    <div className="px-4 py-6 text-center">
                        <p className="text-sm text-white/30">No history yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}