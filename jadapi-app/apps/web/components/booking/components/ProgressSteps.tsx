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
    <div className="bg-white border-b border-gray-200 px-3 py-2">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = index < currentStepIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-blue-600 text-white' :
                  isCompleted ? 'bg-green-600 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  <StepIcon className="w-3 h-3" />
                </div>
                <span className={`text-[8px] mt-0.5 font-medium ${
                  isActive ? 'text-blue-600' :
                  isCompleted ? 'text-green-600' :
                  'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-[1px] flex-1 mx-1.5 transition-all ${
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
