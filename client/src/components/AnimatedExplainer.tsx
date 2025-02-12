import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Step {
  text: string;
  visual?: JSX.Element;
}

interface AnimatedExplainerProps {
  steps: Step[];
  onClose: () => void;
}

export default function AnimatedExplainer({ steps, onClose }: AnimatedExplainerProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="min-h-[200px] flex flex-col items-center justify-center">
            {steps[currentStep].visual}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg text-center mt-4"
            >
              {steps[currentStep].text}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </span>
        {currentStep < steps.length - 1 ? (
          <Button onClick={goToNextStep} className="gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        )}
      </div>
    </Card>
  );
}

export function AdditionVisual({ num1, num2, currentStep }: { 
  num1: number;
  num2: number;
  currentStep: number;
}) {
  const num1Str = num1.toString();
  const num2Str = num2.toString();
  const maxLength = Math.max(num1Str.length, num2Str.length);
  const sum = num1 + num2;

  return (
    <div className="font-mono text-2xl">
      <motion.div className="grid grid-cols-[auto,1fr] gap-4 items-center">
        <div className="text-right space-y-1">
          <motion.div>{num1}</motion.div>
          <motion.div>+{num2}</motion.div>
          <motion.div className="border-t">{sum}</motion.div>
        </div>
        <div className="text-left space-y-1">
          <motion.div className="text-primary text-sm">
            {currentStep === 0 && "Start with the ones place"}
            {currentStep === 1 && "Move to the tens place"}
            {currentStep === 2 && "Finally, the hundreds place"}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export function MultiplicationVisual({ num1, num2, currentStep }: {
  num1: number;
  num2: number;
  currentStep: number;
}) {
  const product = num1 * num2;
  const steps = num2.toString().split('').reverse();
  
  return (
    <div className="font-mono text-2xl">
      <motion.div className="grid grid-cols-[auto,1fr] gap-4 items-center">
        <div className="text-right space-y-1">
          <motion.div>{num1}</motion.div>
          <motion.div>×{num2}</motion.div>
          <motion.div className="border-t">{product}</motion.div>
        </div>
        <div className="text-left space-y-1">
          <motion.div className="text-primary text-sm">
            {currentStep === 0 && `Multiply ${num1} by ${steps[0]}`}
            {currentStep === 1 && steps[1] && `Then multiply ${num1} by ${steps[1]} tens`}
            {currentStep === 2 && "Add the partial products"}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
