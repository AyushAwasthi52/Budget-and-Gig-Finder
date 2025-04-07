interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex flex-1 items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              index + 1 <= currentStep ? "bg-purple-600 text-white" : "border border-gray-300 bg-white text-gray-500"
            }`}
          >
            {index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div className={`h-1 flex-1 ${index + 1 < currentStep ? "bg-purple-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  )
}

