import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PrankLogin } from '@/components/PrankLogin';
import { RevealDashboard } from '@/components/RevealDashboard';

const Index = () => {
  const [showReveal, setShowReveal] = useState(false);

  
  return (
    <AnimatePresence mode="wait">
      {!showReveal ? (
        <motion.div
          key="login"
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <PrankLogin onComplete={() => setShowReveal(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="reveal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="dark"
        >
          <RevealDashboard />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
