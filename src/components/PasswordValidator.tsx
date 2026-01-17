import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Eye, EyeOff } from 'lucide-react';

interface PasswordValidatorProps {
  value: string;
  onChange: (value: string) => void;
}

const SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/g;

export const PasswordValidator = ({ value, onChange }: PasswordValidatorProps) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const validations = useMemo(() => {
    // Check sum of digits equals 25
    const digits: string[] = value.match(/\d/g) ?? [];
    const digitSum = digits.reduce((sum, d) => sum + parseInt(d, 10), 0);
    const hasCorrectSum = digitSum === 25;
    
    // Check for exactly 4 special characters
    const specialChars = value.match(SPECIAL_CHARS) ?? [];
    const specialCount = specialChars.length;
    const hasExactlyFourSpecial = specialCount === 4;
    
    // Check for odd number of characters
    const charCount = [...value].length;
    const hasOddLength = charCount > 0 && charCount % 2 === 1;
    
    return {
      hasCorrectSum,
      hasExactlyFourSpecial,
      hasOddLength,
      digitSum,
      specialCount,
      charCount,
      allValid: hasCorrectSum && hasExactlyFourSpecial && hasOddLength
    };
  }, [value]);

  const ValidationItem = ({ valid, children }: { valid: boolean; children: React.ReactNode }) => (
    <motion.div 
      className={`validation-item ${valid ? 'valid' : 'invalid'}`}
      initial={false}
      animate={{ x: valid ? 0 : [0, -3, 3, -3, 0] as number[] }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={false}
        animate={{
          scale: valid ? [1, 1.2, 1] : 1,
          rotate: valid ? [0, 10, -10, 0] : 0 
        }}
        transition={{ duration: 0.3 }}
      >
        {valid ? (
          <Check className="w-4 h-4 text-success" />
        ) : (
          <X className="w-4 h-4 text-destructive" />
        )}
      </motion.div>
      <span>{children}</span>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <label className="corporate-label">
        Password
        <span className="text-muted-foreground font-normal ml-2">(Enhanced Security)</span>
      </label>
      
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your secure password"
          className="corporate-input pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <div className="corporate-card !p-4 space-y-1">
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
          Password Requirements
        </p>
        
        <ValidationItem valid={validations.hasCorrectSum}>
          Sum of all digits must equal exactly 25 
          <span className="text-muted-foreground ml-1">
            (current: {validations.digitSum})
          </span>
        </ValidationItem>
        
        <ValidationItem valid={validations.hasExactlyFourSpecial}>
          Must contain exactly 4 special characters
          <span className="text-muted-foreground ml-1">
            (current: {validations.specialCount})
          </span>
        </ValidationItem>
        
        <ValidationItem valid={validations.hasOddLength}>
          Must have an odd number of characters
          <span className="text-muted-foreground ml-1">
            (current: {validations.charCount})
          </span>
        </ValidationItem>
      </div>

      <AnimatePresence>
        {validations.allValid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-success text-sm flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Password meets all requirements!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
