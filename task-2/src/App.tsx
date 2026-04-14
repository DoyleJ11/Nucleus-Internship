import { useCalculator } from "./hooks/useCalculator"
import { Display } from "./components/Display"
import { ButtonGrid } from "./components/ButtonGrid"
import { History } from "./components/History"

function App() {
  const { display, result, history, loadHistoryEntry, appendToDisplay, clearDisplay, deleteLast, calculateResult } = useCalculator()

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-sm">
          <Display expression={display} result={result} />
          <ButtonGrid 
            onAppend={appendToDisplay}
            onCalculate={calculateResult}
            onClear={clearDisplay}
            onDelete={deleteLast}
          />
          <History history={history} onSelect={loadHistoryEntry} />
      </div>
    </div>
  )
}

export default App
