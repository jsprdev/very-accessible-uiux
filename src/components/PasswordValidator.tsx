import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Eye, EyeOff } from 'lucide-react';

interface PasswordValidatorProps {
  value: string;
  onChange: (value: string) => void;
}

export const PasswordValidator = ({ value, onChange }: PasswordValidatorProps) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const validations = useMemo(() => {
    // Check if password equals "password"
    const isPassword = value === 'password';
    
    return {
      isPassword,
      allValid: isPassword
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
        
        <ValidationItem valid={validations.isPassword}>
          Password must equal "password"
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
