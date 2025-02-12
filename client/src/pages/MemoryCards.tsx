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
  Triangle,
  Variable,
  Ruler,
  MessageSquare
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
      },
      {
        front: {
          title: "Mental Math Tips",
          content: "What's an easy way to add numbers mentally?"
        },
        back: {
          title: "Strategy",
          content: "Break numbers into friendly numbers. For example, 28 + 47 can be solved as (30 + 45) = 75, then subtract 2 = 73"
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
      },
      {
        front: {
          title: "Times Tables Tricks",
          content: "How can you multiply by 9 easily?"
        },
        back: {
          title: "The Pattern",
          content: "For 9×N: First digit is N-1, second digit adds up to 9. Example: 9×7=63 (6 is 7-1, 6+3=9)"
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
      },
      {
        front: {
          title: "Division Rules",
          content: "When is a number divisible by 3?"
        },
        back: {
          title: "Divisibility Rule",
          content: "If the sum of all digits is divisible by 3, then the whole number is divisible by 3. Example: 126 (1+2+6=9, divisible by 3)"
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
      },
      {
        front: {
          title: "Equivalent Fractions",
          content: "What makes fractions equivalent?"
        },
        back: {
          title: "Same Value, Different Forms",
          content: "Multiply or divide both top and bottom by the same number. 1/2 = 2/4 = 3/6"
        }
      }
    ]
  },
  {
    name: "Geometry",
    icon: <Triangle className="w-4 h-4" />,
    cards: [
      {
        front: {
          title: "Types of Angles",
          content: "What are the different types of angles?"
        },
        back: {
          title: "Angle Classifications",
          content: "Acute: < 90°\nRight: = 90°\nObtuse: > 90° but < 180°\nStraight: = 180°"
        }
      },
      {
        front: {
          title: "Area vs Perimeter",
          content: "What's the difference between area and perimeter?"
        },
        back: {
          title: "Understanding Space",
          content: "Perimeter: Distance around the shape (length of the boundary)\nArea: Space inside the shape (how much space it covers)"
        }
      }
    ]
  },
  {
    name: "Word Problems",
    icon: <MessageSquare className="w-4 h-4" />,
    cards: [
      {
        front: {
          title: "Problem Solving Steps",
          content: "What steps should you follow to solve word problems?"
        },
        back: {
          title: "The Strategy",
          content: "1. Read carefully\n2. Identify important information\n3. Choose the operation\n4. Solve\n5. Check if answer makes sense"
        }
      },
      {
        front: {
          title: "Key Words",
          content: "What words help you identify the operation needed?"
        },
        back: {
          title: "Operation Clues",
          content: "Addition: sum, total, in all\nSubtraction: difference, less, remain\nMultiplication: times, product\nDivision: share, each, per"
        }
      }
    ]
  },
  {
    name: "Algebra",
    icon: <Variable className="w-4 h-4" />,
    cards: [
      {
        front: {
          title: "Variables",
          content: "What is a variable in algebra?"
        },
        back: {
          title: "Understanding Variables",
          content: "A variable is a letter or symbol that represents an unknown number. For example, in x + 5 = 12, x is the variable."
        }
      },
      {
        front: {
          title: "Solving Equations",
          content: "What's the basic rule for solving equations?"
        },
        back: {
          title: "Balance Method",
          content: "Whatever you do to one side of the equation, you must do to the other side to keep it balanced. Example: If you add 3 to the left side, add 3 to the right side."
        }
      },
      {
        front: {
          title: "Like Terms",
          content: "What are like terms and how do you combine them?"
        },
        back: {
          title: "Combining Like Terms",
          content: "Like terms have the same variables raised to the same powers. Example: 3x and 5x are like terms, you can combine them: 3x + 5x = 8x"
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