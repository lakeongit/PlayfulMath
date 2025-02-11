import { motion } from "framer-motion";

export default function CelebrationOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none flex items-center justify-center"
    >
      <div className="relative">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-primary rounded-full"
            initial={{
              x: 0,
              y: 0,
              scale: 0,
            }}
            animate={{
              x: Math.random() * 400 - 200,
              y: Math.random() * 400 - 200,
              scale: Math.random() * 2,
              opacity: 0,
            }}
            transition={{
              duration: 1,
              ease: "easeOut",
              delay: i * 0.02,
            }}
          />
        ))}
        <motion.div
          className="text-4xl font-bold text-primary"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          Excellent!
        </motion.div>
      </div>
    </motion.div>
  );
}
