import { useState } from "react";
import { motion } from "framer-motion";
import MemoryCard from "@/components/MemoryCard";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Minus, 
  Divide, 
  X,
  Split,
  BarChart3
} from "lucide-react";

const CARD_CATEGORIES = [
  {
    name: "Addition",
    icon: <Plus className="w-4 h-4" />,
    cards: [
      {
        front: {
          title: "Carrying in Addition",
          content: "When do you need to carry a number in addition?"
        },
        back: {
          title: "The Rule",
          content: "When the sum of digits in any place value is 10 or greater, carry the tens digit to the next place value."
        }
      },
      {
        front: {
          title: "Place Values",
          content: "Why is place value important in addition?"
        },
        back: {
          title: "Understanding Place Values",
          content: "Place values help us line up numbers correctly. Always add digits in the same place value: ones with ones, tens with tens, etc."
        }
      }
    ]
  },
  {
    name: "Multiplication",
    icon: <X className="w-4 h-4" />,
    cards: [
      {
        front: {
          title: "Basic Multiplication",
          content: "What is multiplication really doing?"
        },
        back: {
          title: "The Concept",
          content: "Multiplication is repeated addition. 5 × 3 means adding 5 three times: 5 + 5 + 5 = 15"
        }
      },
      {
        front: {
          title: "Multiplying by 10",
          content: "What's the quick way to multiply by 10?"
        },
        back: {
          title: "The Rule",
          content: "Add a zero to the end of the number. This works because each place value is 10 times the one to its right."
        }
      }
    ]
  },
  {
    name: "Division",
    icon: <Divide className="w-4 h-4" />,
    cards: [
      {
        front: {
          title: "Division Concept",
          content: "What does division really mean?"
        },
        back: {
          title: "Understanding Division",
          content: "Division is sharing equally or making equal groups. 12 ÷ 3 means splitting 12 into 3 equal groups."
        }
      }
    ]
  },
  {
    name: "Fractions",
    icon: <Split className="w-4 h-4" />,
    cards: [
      {
        front: {
          title: "What is a Fraction?",
          content: "What do the top and bottom numbers mean?"
        },
        back: {
          title: "Parts of a Whole",
          content: "The bottom number (denominator) shows how many equal parts make a whole. The top number (numerator) shows how many parts we're talking about."
        }
      }
    ]
  }
];

export default function MemoryCards() {
  const [selectedCategory, setSelectedCategory] = useState(CARD_CATEGORIES[0].name);

  const currentCards = CARD_CATEGORIES.find(
    cat => cat.name === selectedCategory
  )?.cards || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Math Concept Cards
        </h1>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CARD_CATEGORIES.map((category) => (
            <Button
              key={category.name}
              variant={selectedCategory === category.name ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.name)}
              className="gap-2"
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MemoryCard
                front={card.front}
                back={card.back}
                category={selectedCategory}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}