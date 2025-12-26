import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useStore } from '../store';
import { AppStep } from '../types';
import { PHOTOS_PER_SESSION, Icons } from '../constants';
import Modal from './ui/Modal';

const CameraBooth: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const { state, dispatch } = useStore();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [photosTaken, setPhotosTaken] = useState<number>(0);
  const [flash, setFlash] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Camera Switching State
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isSwitching, setIsSwitching] = useState(false);

  // Toggle Camera Function
  const toggleCamera = () => {
    // 1. Set switching state to true to unmount/remount clean
    setIsSwitching(true);
    setCameraReady(false);

    // 2. Timeout to allow "unmount" before starting new stream logic
    setTimeout(() => {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
      setIsSwitching(false);
      // CameraReady triggers via onUserMedia callback from Webcam
    }, 500);
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      // Try to get max resolution
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setFlash(true);
        setTimeout(() => setFlash(false), 200);

        const count = photosTaken + 1;
        dispatch({ type: 'ADD_PHOTO', payload: imageSrc });
        setPhotosTaken(count);

        // Show Toast
        setToastMessage(`Photo ${count} Captured`);
        setTimeout(() => setToastMessage(null), 1500);
      }
    }
  }, [dispatch, photosTaken]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (photosTaken >= PHOTOS_PER_SESSION) {
      // Session Complete - Move to Selection Phase
      setTimeout(() => {
        dispatch({ type: 'AUTO_ASSIGN_SLOTS' }); // Pre-fill assignments
        dispatch({ type: 'SET_STEP', payload: AppStep.PHOTO_SELECTION });
      }, 1000);
      return;
    }

    // Start countdown sequence
    const startSequence = () => {
      setCountdown(3);
    };

    // Initial start delay only if camera is ready
    if (cameraReady && countdown === null && photosTaken < PHOTOS_PER_SESSION && !isSwitching) {
      timer = setTimeout(startSequence, 2000); // 2 seconds delay between shots for the toast to be seen
    }

    // Countdown Logic
    if (countdown !== null) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        // Capture moment
        capture();
        setCountdown(null); // Reset for next loop or finish
      }
    }

    return () => clearTimeout(timer);
  }, [countdown, photosTaken, capture, dispatch, cameraReady, isSwitching]);

  // Handle Abort/Back
  const handleBack = () => {
    // If we are in the middle of a session, we should probably reset
    setIsCancelModalOpen(true);
  };

  const confirmCancel = () => {
    dispatch({ type: 'RESET_SESSION' });
    dispatch({ type: 'SET_STEP', payload: AppStep.TEMPLATE_SELECTION });
    setIsCancelModalOpen(false);
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 z-[60] flex items-center gap-2 text-white/50 hover:text-white transition-colors bg-black/20 hover:bg-black/50 px-4 py-2 rounded-full backdrop-blur-md"
      >
        <Icons.CaretLeft weight="bold" />
        <span className="text-sm font-bold tracking-widest uppercase">Back</span>
      </button>

      {/* Switch Camera Button (Visible when camera active & no countdown) */}
      {!isSwitching && cameraReady && countdown === null && (
        <button
          onClick={toggleCamera}
          className="absolute top-6 right-6 z-[60] flex items-center justify-center p-3 rounded-full text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all duration-300 shadow-lg group"
          title="Switch Camera"
        >
          <Icons.CameraRotate
            size={24}
            className={`transition-transform duration-500 group-hover:-rotate-180`}
          />
        </button>
      )}

      {/* Flash Overlay */}
      <div
        className={`absolute inset-0 bg-white pointer-events-none z-50 transition-opacity duration-200 ${flash ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Toast Notification */}
      <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 z-[60] transition-all duration-300 ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="bg-zinc-800/90 text-brand-gold border border-brand-gold px-6 py-2 rounded-full font-bold tracking-widest uppercase flex items-center gap-2 shadow-2xl backdrop-blur-md">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {toastMessage}
        </div>
      </div>

      {/* Camera Feed Container */}
      <div
        className="relative bg-zinc-900 overflow-hidden border-4 border-zinc-800 shadow-2xl flex items-center justify-center transition-all duration-300 ease-out"
        style={{
          aspectRatio: '4/3',
          width: '100%',
          maxWidth: '1200px',
          maxHeight: '75vh'
        }}
      >
        {cameraError ? (
          <div className="text-center p-6 w-full">
            <div className="text-red-500 mb-4 flex justify-center">
              <Icons.X size={48} />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Camera Error</h3>
            <p className="text-zinc-400">{cameraError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {(!cameraReady || isSwitching) && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-900 w-full h-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin text-brand-gold">
                    <Icons.Lightning size={48} weight="fill" />
                  </div>
                  {isSwitching && <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Switching Camera...</span>}
                </div>
              </div>
            )}

            {!isSwitching && (
              <Webcam
                key={facingMode} // Force full remount on mode change
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                width={1920}
                height={1440}
                forceScreenshotSourceSize={true}
                mirrored={facingMode === 'user'} // Only mirror front camera
                screenshotQuality={0.92}
                disablePictureInPicture={true}
                imageSmoothing={false}
                videoConstraints={{
                  width: { ideal: 1920 },
                  height: { ideal: 1440 },
                  facingMode: facingMode
                }}
                onUserMedia={() => setCameraReady(true)}
                onUserMediaError={(err) => setCameraError("Could not access camera. Please check permissions.")}
                className={`absolute inset-0 w-full h-full object-cover transform ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${cameraReady ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
          </>
        )}

        {/* Countdown Overlay */}
        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-40">
            <div className="text-[12rem] font-extrabold text-white drop-shadow-lg animate-ping">
              {countdown}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        {Array.from({ length: PHOTOS_PER_SESSION }).map((_, i) => (
          <div
            key={i}
            className={`w-16 h-12 border-2 ${i < photosTaken ? 'bg-brand-gold border-brand-gold' : 'border-zinc-700 bg-zinc-900'} transition-all`}
          />
        ))}
      </div>

      <p className="mt-4 text-zinc-500 font-mono text-sm uppercase tracking-widest">
        {cameraError ? "Error" : (photosTaken < PHOTOS_PER_SESSION ? (cameraReady && !isSwitching ? "Get Ready..." : "Initializing Camera...") : "Processing...")}
      </p>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Session?"
        confirmText="Yes, Cancel"
        onConfirm={confirmCancel}
        isDestructive={true}
      >
        Are you sure you want to cancel? Any photos taken so far will be lost.
      </Modal>
    </div>
  );
};

export default CameraBooth;