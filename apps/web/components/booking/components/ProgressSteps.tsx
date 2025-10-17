import { LucideIcon } from 'lucide-react';

export type BookingStep = 'sender' | 'recipient' | 'review' | 'payment';

interface Step {
  id: BookingStep;
  label: string;
  icon: LucideIcon;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: BookingStep;
}

export default function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = index < currentStepIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${
                  isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                  isCompleted ? 'bg-green-600 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className={`text-xs sm:text-sm font-medium transition-colors ${
                  isActive ? 'text-blue-600' :
                  isCompleted ? 'text-green-600' :
                  'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 sm:mx-3 transition-all ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
