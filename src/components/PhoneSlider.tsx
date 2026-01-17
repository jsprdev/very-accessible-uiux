import { useState } from 'react';
import { motion } from 'framer-motion';

interface PhoneSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const PhoneSlider = ({ value, onChange }: PhoneSliderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const displayNumber = value.toString().padStart(8, '0');
  const isValidLength = value >= 10000000 && value <= 99999999;
  const startsWithValidDigit = displayNumber[0] === '8' || displayNumber[0] === '9';
  const isValid = isValidLength && startsWithValidDigit;

  return (
    <div className="space-y-4">
      <label className="corporate-label">
        Mobile Number
        <span className="text-muted-foreground font-normal ml-2">(Singapore)</span>
      </label>
      
      <div className="space-y-3">
        <motion.div 
          className="text-center py-6 rounded-lg bg-muted/50"
          animate={{ 
            backgroundColor: isDragging ? 'hsl(var(--muted))' : 'hsl(var(--muted) / 0.5)'
          }}
        >
          <motion.span 
            className={`text-4xl font-mono font-bold tracking-wider ${
              isValid ? 'text-foreground' : 'text-destructive'
            }`}
            animate={{ scale: isDragging ? 1.05 : 1 }}
          >
            +65 {displayNumber.slice(0, 4)} {displayNumber.slice(4)}
          </motion.span>
        </motion.div>

        <input
          type="range"
          min="0"
          max="99999999"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="slider-track"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>~100,000,000</span>
        </div>

        {!isValid && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-destructive text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Invalid: Must be a standard SG mobile number (starts with 8 or 9)
          </motion.p>
        )}

        {isValid && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-success text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Valid Singapore mobile number
          </motion.p>
        )}
      </div>
    </div>
  );
};
