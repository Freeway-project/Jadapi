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
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = index < currentStepIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border-2 ${
                  isActive ? 'bg-white text-blue-600 border-white' :
                  isCompleted ? 'bg-blue-500 text-white border-blue-400' :
                  'bg-blue-600/30 text-blue-200 border-blue-400/30'
                }`}>
                  <StepIcon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] mt-1.5 font-medium ${
                  isActive ? 'text-white' :
                  isCompleted ? 'text-blue-100' :
                  'text-blue-300'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-[2px] flex-1 mx-2 transition-all ${
                  isCompleted ? 'bg-blue-400' : 'bg-blue-500/20'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
