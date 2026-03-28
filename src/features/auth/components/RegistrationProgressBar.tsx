interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function RegistrationProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  if (currentStep > totalSteps) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="w-full absolute top-1/2 left-0 transform -translate-y-1/2 h-1 bg-gray-200 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 transform -translate-y-1/2 h-1 bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: currentStep === 1 ? '50%' : '100%' }}
        ></div>
        
        <div className={`relative z-10 flex flex-col items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${currentStep >= 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
            1
          </div>
          <span className="mt-2 text-xs font-medium">Entidad</span>
        </div>
        
        <div className={`relative z-10 flex flex-col items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${currentStep >= 2 ? 'bg-blue-600 text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-500'}`}>
            2
          </div>
          <span className="mt-2 text-xs font-medium">Administrador</span>
        </div>
      </div>
    </div>
  );
}
