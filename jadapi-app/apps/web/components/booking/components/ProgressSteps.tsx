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
    <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = index < currentStepIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-black text-white' :
                  isCompleted ? 'bg-gray-900 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  <StepIcon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] mt-1.5 font-medium ${
                  isActive ? 'text-gray-900' :
                  isCompleted ? 'text-gray-600' :
                  'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-[1px] flex-1 mx-2 transition-all ${
                  isCompleted ? 'bg-gray-900' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
