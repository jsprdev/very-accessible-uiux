import { useState, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

interface HydraButtonProps {
  onFinalClick: () => void;
  disabled?: boolean;
}

interface ButtonNode {
  id: string;
  stage: number;
}

export const HydraButton = ({ onFinalClick, disabled }: HydraButtonProps) => {
  const [buttons, setButtons] = useState<ButtonNode[]>([{ id: '0', stage: 0 }]);
  const [stage, setStage] = useState(0);

  const handleClick = useCallback((clickedId: string) => {
    if (disabled) return;
    
    if (stage >= 3) {
      onFinalClick();
      return;
    }

    setButtons(prev => {
      const newButtons: ButtonNode[] = [];
      
      prev.forEach(btn => {
        if (btn.id === clickedId) {
          // Split this button into two
          newButtons.push(
            { id: `${btn.id}-0`, stage: stage + 1 },
            { id: `${btn.id}-1`, stage: stage + 1 }
          );
        } else {
          newButtons.push(btn);
        }
      });
      
      return newButtons;
    });
    
    setStage(prev => prev + 1);
  }, [stage, disabled, onFinalClick]);

  const getButtonSize = () => {
    switch (stage) {
      case 0: return 'text-lg px-8 py-4';
      case 1: return 'text-base px-6 py-3';
      case 2: return 'text-sm px-4 py-2';
      case 3: return 'text-xs px-3 py-2';
      default: return 'text-lg px-8 py-4';
    }
  };

  const getButtonText = () => {
    if (stage >= 3) return 'SUBMIT!';
    return 'Submit';
  };

  return (
    <LayoutGroup>
      <motion.div 
        className="flex flex-wrap gap-2 justify-center p-4 rounded-lg bg-muted/30 min-h-[80px]"
        layout
      >
        <AnimatePresence mode="popLayout">
          {buttons.map((btn) => (
            <motion.button
              key={btn.id}
              layoutId={btn.id}
              onClick={() => handleClick(btn.id)}
              disabled={disabled}
              className={`hydra-button ${getButtonSize()} ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              } ${stage >= 3 ? 'animate-pulse bg-success' : ''}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
              }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={!disabled ? { scale: 1.05 } : undefined}
              whileTap={!disabled ? { scale: 0.95 } : undefined}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
                layout: { type: 'spring', stiffness: 300, damping: 30 }
              }}
            >
              {getButtonText()}
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
};
