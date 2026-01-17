import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { PhoneSlider } from './PhoneSlider';
import { PasswordValidator } from './PasswordValidator';
import { BiometricNod } from './BiometricNod';
import { HydraButton } from './HydraButton';
import { Shield } from 'lucide-react';

interface PrankLoginProps {
  onComplete: () => void;
}

export const PrankLogin = ({ onComplete }: PrankLoginProps) => {
  const [phoneValue, setPhoneValue] = useState(0);
  const [password, setPassword] = useState('');
  const [nodVerified, setNodVerified] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        setTimeout(onComplete, 500);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleFinalSubmit = () => {
    triggerConfetti();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4"
          >
            <Shield className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Secure Access Portal
          </h1>
          <p className="text-muted-foreground">
            Enhanced verification for your protection
          </p>
        </div>

        {/* Form */}
        <div className="corporate-card space-y-8">
          {/* Phone Slider */}
          <PhoneSlider value={phoneValue} onChange={setPhoneValue} />

          {/* Password */}
          <PasswordValidator value={password} onChange={setPassword} />

          {/* Biometric */}
          <BiometricNod 
            onVerified={() => setNodVerified(true)} 
            streamRef={streamRef}
          />

          {/* Hydra Submit */}
          <HydraButton 
            onFinalClick={handleFinalSubmit}
            disabled={!nodVerified}
          />

          {!nodVerified && (
            <p className="text-center text-sm text-muted-foreground">
              Complete biometric verification to enable submit
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Protected by Advanced Security™ • Trusted by 0 users worldwide</p>
        </div>
      </motion.div>
    </div>
  );
};
