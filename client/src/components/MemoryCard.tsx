import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

interface MemoryCardProps {
  front: {
    title: string;
    content: string | JSX.Element;
  };
  back: {
    title: string;
    content: string | JSX.Element;
  };
  category: string;
}

export default function MemoryCard({ front, back, category }: MemoryCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="perspective-1000 relative w-full aspect-[3/4] cursor-pointer"
      onClick={flipCard}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={isFlipped ? "back" : "front"}
          initial={{ rotateY: isFlipped ? -180 : 180 }}
          animate={{ rotateY: 0 }}
          exit={{ rotateY: isFlipped ? 180 : -180 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="absolute inset-0"
        >
          <Card className="w-full h-full p-6 flex flex-col bg-card hover:shadow-lg transition-shadow">
            <div className="text-xs text-muted-foreground mb-2">{category}</div>
            <h3 className="text-xl font-bold mb-4">
              {isFlipped ? back.title : front.title}
            </h3>
            <div className="flex-1 flex items-center justify-center text-center">
              {isFlipped ? back.content : front.content}
            </div>
            <div className="text-sm text-muted-foreground mt-4 text-center">
              Click to {isFlipped ? "show question" : "reveal answer"}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
