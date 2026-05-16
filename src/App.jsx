import '@google/model-viewer';
import { useEffect, useRef, useState } from 'react';

const INITIAL_ORBIT = '0deg 75deg auto';

// Only phi (vertical tilt) and radius (zoom) define "default view".
// Theta (horizontal) is intentionally ignored — auto-rotate changes it constantly.
const DEFAULT_PHI_RAD = 75 * (Math.PI / 180);
const PHI_TOLERANCE_RAD = 8 * (Math.PI / 180); // ±8 degrees
const RADIUS_TOLERANCE = 0.15;                  // ±15% zoom

export default function App() {
  const viewerRef = useRef(null);
  const initialRadiusRef = useRef(null);
  const checkTimerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const startRotation = () => viewer.setAttribute('auto-rotate', '');
    const stopRotation = () => viewer.removeAttribute('auto-rotate');

    const isAtDefault = () => {
      const { phi, radius } = viewer.getCameraOrbit();
      const r0 = initialRadiusRef.current;
      const atPhi = Math.abs(phi - DEFAULT_PHI_RAD) < PHI_TOLERANCE_RAD;
      const atRadius = r0 == null || Math.abs(radius - r0) / r0 < RADIUS_TOLERANCE;
      return atPhi && atRadius;
    };

    const onLoad = () => {
      setLoaded(true);
      initialRadiusRef.current = viewer.getCameraOrbit().radius;
    };

    const onCameraChange = (e) => {
      if (e.detail.source !== 'user-interaction') return;

      // Stop rotation the instant the user moves the camera.
      stopRotation();

      // After they settle, decide whether to resume.
      clearTimeout(checkTimerRef.current);
      checkTimerRef.current = setTimeout(() => {
        if (isAtDefault()) {
          startRotation();
          setShowReset(false);
        } else {
          setShowReset(true);
        }
      }, 400);
    };

    viewer.addEventListener('load', onLoad);
    viewer.addEventListener('camera-change', onCameraChange);
    return () => {
      viewer.removeEventListener('load', onLoad);
      viewer.removeEventListener('camera-change', onCameraChange);
      clearTimeout(checkTimerRef.current);
    };
  }, []);

  useEffect(() => {
    viewerRef.current?.classList.toggle('loaded', loaded);
  }, [loaded]);

  const handleReset = () => {
    const v = viewerRef.current;
    if (!v) return;
    v.cameraOrbit = INITIAL_ORBIT;
    v.resetTurntableRotation();
    v.setAttribute('auto-rotate', '');
    setShowReset(false);
  };

  return (
    <>
      {!loaded && <div id="spinner" />}

      <p id="title">Craft Heat Gun</p>
      <p id="subtitle">By Marva Armon</p>

      <model-viewer
        ref={viewerRef}
        src="/model.glb"
        alt="Product 3D model"
        loading="eager"
        camera-controls
        auto-rotate
        rotation-per-second="8deg"
        auto-rotate-delay="0"
        camera-orbit={INITIAL_ORBIT}
        environment-image="neutral"
        exposure="0.7"
        shadow-intensity="0.6"
      />

      <button
        id="reset-btn"
        className={showReset ? 'visible' : ''}
        aria-label="Reset camera view"
        onClick={handleReset}
      >
        Reset View
      </button>
    </>
  );
}
