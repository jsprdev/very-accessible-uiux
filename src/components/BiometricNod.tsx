import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, X, AlertCircle } from 'lucide-react';

interface BiometricNodProps {
  onVerified: () => void;
  streamRef?: React.MutableRefObject<MediaStream | null>;
}

export const BiometricNod = ({ onVerified, streamRef }: BiometricNodProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let mounted = true;
    let currentStream: MediaStream | null = null;
    
    const startCamera = async () => {
      console.log('[Camera] Starting camera initialization...');
      
      // Stop any existing streams first
      if (streamRef?.current) {
        console.log('[Camera] Cleaning up existing streamRef before starting new one');
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        // Give browser time to fully release the camera
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        
        console.log('[Camera] Stream obtained:', stream.id);
        currentStream = stream;
        

        // Only update if component is still mounted
        if (!mounted) {
          console.log('[Camera] Component unmounted, cleaning up stream');
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        if (videoRef.current) {
          console.log('[Camera] Setting video source...');
          videoRef.current.srcObject = stream;
          
          // Wait for video metadata to load before playing
          videoRef.current.onloadedmetadata = async () => {
            if (!mounted || !videoRef.current) {
              console.log('[Camera] Component unmounted during metadata load');
              return;
            }
            
            console.log('[Camera] Metadata loaded, attempting to play...');
            try {
              await videoRef.current.play();
              console.log('[Camera] ✓ Camera started successfully');
            } catch (playError) {
              console.error('[Camera] Error playing video:', playError);
              // Try again after a short delay
              setTimeout(async () => {
                if (mounted && videoRef.current) {
                  console.log('[Camera] Retrying play...');
                  try {
                    await videoRef.current.play();
                    console.log('[Camera] ✓ Retry successful');
                  } catch (retryError) {
                    console.error('[Camera] Retry failed:', retryError);
                  }
                }
              }, 100);
            }
          };
          
          // Add error handler for video element
          videoRef.current.onerror = (e) => {
            console.error('[Camera] Video element error:', e);
          };
        }
        
        if (streamRef) {
          streamRef.current = stream;
        }
        
        setHasPermission(true);
      } catch (err) {
        console.error('[Camera] Failed to get camera access:', err);
        if (mounted) {
          setHasPermission(false);
        }
      }
    };

    // Handle page unload to ensure camera is released
    const handleBeforeUnload = () => {
      console.log('[Camera] Page unloading, releasing camera...');
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (streamRef?.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    startCamera();

    return () => {
      console.log('[Camera] Cleanup starting...');
      mounted = false;
      
      // Remove beforeunload listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Clean up current stream from this effect
      if (currentStream) {
        console.log('[Camera] Stopping current stream:', currentStream.id);
        currentStream.getTracks().forEach(track => {
          console.log('[Camera] Stopping track:', track.kind, track.label);
          track.stop();
        });
      }
      
      
      // Clean up video element stream
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = null;
        videoRef.current.onerror = null;
        if (videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          console.log('[Camera] Stopping video element stream');
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      }
      
      // Clean up streamRef
      if (streamRef?.current) {
        console.log('[Camera] Stopping streamRef');
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      console.log('[Camera] Cleanup complete');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNodDetection = useCallback(() => {
    if (isProcessing || isVerified) return;
    
    setIsProcessing(true);
    setMessage({ type: 'info', text: 'Analyzing head movement...' });

    setTimeout(() => {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts < 3) {
        setMessage({ type: 'error', text: 'Nod not detected. Please try again.' });
        setIsProcessing(false);
      } else {
        setMessage({ type: 'success', text: 'Nod verified! Terms accepted.' });
        setIsVerified(true);
        setIsProcessing(false);
        onVerified();
      }
    }, 1500);
  }, [attempts, isProcessing, isVerified, onVerified]);

  const fakeTerms = [
    "I agree to let the AI judge my facial expressions during video calls",
    "I consent to having my typing patterns analyzed for 'security purposes'",
    "I acknowledge that my coffee consumption may be monitored",
    "I accept that my screen time data will be shared with my houseplants",
    "I understand that sighing heavily counts as feedback"
  ];

  if (hasPermission === null) {
    return (
      <div className="space-y-4">
        <label className="corporate-label">Terms Confirmation</label>
        <div className="webcam-container aspect-video bg-muted flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-muted-foreground flex flex-col items-center gap-2"
          >
            <Camera className="w-8 h-8" />
            <span className="text-sm">Requesting camera access...</span>
          </motion.div>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="space-y-4">
        <label className="corporate-label">Terms Confirmation</label>
        <div className="webcam-container aspect-video bg-muted flex items-center justify-center">
          <div className="text-destructive flex flex-col items-center gap-2 p-4 text-center">
            <AlertCircle className="w-8 h-8" />
            <span className="text-sm font-medium">Camera access denied</span>
            <span className="text-xs text-muted-foreground">
              Please enable camera permissions to continue
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="corporate-label">
        Terms Confirmation
        <span className="text-muted-foreground font-normal ml-2">(Biometric Agreement)</span>
      </label>
      
      {/* Fake Terms */}
      <div className="corporate-card !p-3 space-y-2 text-xs">
        <p className="font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Terms & Conditions
        </p>
        {fakeTerms.map((term, i) => (
          <div key={i} className="flex items-start gap-2 text-muted-foreground">
            <span className="text-primary">•</span>
            <span>{term}</span>
          </div>
        ))}
      </div>

      <div className="webcam-container">
        <div className="relative aspect-video bg-muted">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            key="webcam-video"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-between p-4">
            {/* Face guide */}
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                className="w-32 h-40 border-2 border-dashed border-primary/50 rounded-full"
                animate={{ 
                  scale: isProcessing ? [1, 1.05, 1] : 1,
                  borderColor: isVerified 
                    ? 'hsl(var(--success))' 
                    : isProcessing 
                      ? 'hsl(var(--primary))' 
                      : 'hsl(var(--primary) / 0.5)'
                }}
                transition={{ duration: 1, repeat: isProcessing ? Infinity : 0 }}
              />
            </div>
            
            {/* Status area */}
            <div className="w-full">
              <AnimatePresence mode="wait">
                {message && (
                  <motion.div
                    key={message.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`text-center py-2 px-4 rounded-lg backdrop-blur-sm ${
                      message.type === 'error' 
                        ? 'bg-destructive/90 text-destructive-foreground' 
                        : message.type === 'success'
                          ? 'bg-success/90 text-success-foreground'
                          : 'bg-primary/90 text-primary-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {message.type === 'error' && <X className="w-4 h-4" />}
                      {message.type === 'success' && <Check className="w-4 h-4" />}
                      <span className="text-sm font-medium">{message.text}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Nod</span> to accept terms
        </div>
        
        <button
          onClick={handleNodDetection}
          disabled={isProcessing || isVerified}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isVerified
              ? 'bg-success text-success-foreground'
              : isProcessing
                ? 'bg-muted text-muted-foreground cursor-wait'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {isVerified ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> Accepted
            </span>
          ) : isProcessing ? (
            'Detecting...'
          ) : (
            'Verify Agreement'
          )}
        </button>
      </div>
    </div>
  );
};
