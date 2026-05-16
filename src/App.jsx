import '@google/model-viewer';
import { useEffect, useRef, useState } from 'react';

const INITIAL_ORBIT = '0deg 75deg auto';

const DEFAULT_PHI_RAD = 75 * (Math.PI / 180);
const PHI_TOLERANCE_RAD = 8 * (Math.PI / 180);
const RADIUS_TOLERANCE = 0.15;
const PICKER_ENABLED = false;

const HOTSPOTS = [
  { id: 'hotspot-0', label: 'Easy Hanging Hole',                          position: '-0.08820363997923071m 0.1330505706409948m 0.01053139539244927m',    normal: '0m 1m 0m' },
  { id: 'hotspot-1', label: ['SoftGrip™ Handles', 'FiberComp™ material'],  position: '-0.11401243987972315m 0.17121708808881353m -0.0005243283139042768m', normal: '0m 1m 0m' },
  { id: 'hotspot-2', label: 'Intuitive slide button for seamless control', position: '-0.13372830779794828m 0.21176265774860228m -0.0004058819852548651m', normal: '0m 1m 0m' },
  { id: 'hotspot-3', label: 'Anti-Slip Dots for All Orientations',        position: '-0.23014763760993087m 0.2830008615274004m -0.00594343462928309m',   normal: '0m 1m 0m' },
  { id: 'hotspot-4', label: 'Flat Top Surface for Positioning Flexibility', position: '-0.1730719759456261m 0.2916334742824711m 0.00014578209239937082m',  normal: '0m 1m 0m' },
];

export default function App() {
  const viewerRef = useRef(null);
  const initialRadiusRef = useRef(null);
  const checkTimerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [pickerMode, setPickerMode] = useState(false);
  const [pickerHit, setPickerHit] = useState(null);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Camera / rotation logic
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const startRotation = () => viewer.setAttribute('auto-rotate', '');
    const stopRotation = () => viewer.removeAttribute('auto-rotate');

    const isAtDefault = () => {
      const { phi, radius } = viewer.getCameraOrbit();
      const r0 = initialRadiusRef.current;
      return (
        Math.abs(phi - DEFAULT_PHI_RAD) < PHI_TOLERANCE_RAD &&
        (r0 == null || Math.abs(radius - r0) / r0 < RADIUS_TOLERANCE)
      );
    };

    const onLoad = () => {
      setLoaded(true);
      initialRadiusRef.current = viewer.getCameraOrbit().radius;
    };

    const onCameraChange = (e) => {
      if (e.detail.source !== 'user-interaction') return;
      stopRotation();
      clearTimeout(checkTimerRef.current);
      checkTimerRef.current = setTimeout(() => {
        if (isAtDefault()) { startRotation(); setShowReset(false); }
        else setShowReset(true);
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

  // Picker — attach/detach based on pickerMode
  useEffect(() => {
    if (!pickerMode) return;
    const viewer = viewerRef.current;
    if (!viewer) return;

    const onClick = (e) => {
      const rect = viewer.getBoundingClientRect();
      const hit = viewer.positionAndNormalFromPoint(e.clientX - rect.left, e.clientY - rect.top);
      if (hit) setPickerHit(hit);
    };

    viewer.addEventListener('click', onClick);
    return () => viewer.removeEventListener('click', onClick);
  }, [pickerMode]);

  const handleReset = () => {
    const v = viewerRef.current;
    if (!v) return;
    setActiveHotspot(null);
    v.cameraTarget = 'auto auto auto';
    v.cameraOrbit = INITIAL_ORBIT;
    v.resetTurntableRotation();
    v.setAttribute('auto-rotate', '');
    setShowReset(false);
  };

  const togglePicker = () => {
    setPickerMode(p => !p);
    setPickerHit(null);
  };

  const handleHotspotClick = (id, position) => {
    const v = viewerRef.current;
    if (!v) return;

    if (activeHotspot === id) {
      // Second tap — return to default
      setActiveHotspot(null);
      v.cameraTarget = 'auto auto auto';
      v.cameraOrbit = INITIAL_ORBIT;
      v.resetTurntableRotation();
      v.setAttribute('auto-rotate', '');
      setShowReset(false);
    } else {
      setActiveHotspot(id);
      v.removeAttribute('auto-rotate');
      v.cameraTarget = position;
      const { theta, phi } = v.getCameraOrbit();
      const r0 = initialRadiusRef.current ?? 1;
      v.cameraOrbit = `${theta}rad ${phi}rad ${r0 * 0.6}m`;
      setShowReset(true);
    }
  };

  const copyPickerRow = (key, value) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
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
        exposure="0.6"
        shadow-intensity="0.6"
      >
        {HOTSPOTS.map(h => (
          <button
            key={h.id}
            slot={h.id}
            data-position={h.position}
            data-normal={h.normal}
            className={`hotspot${activeHotspot === h.id ? ' active' : ''}`}
            onClick={() => handleHotspotClick(h.id, h.position)}
            aria-label={h.label}
          >
            <span className="hotspot-label">
              {Array.isArray(h.label)
                ? h.label.map((line, i) => <span key={i} className="hotspot-line">{line}</span>)
                : h.label}
            </span>
          </button>
        ))}
      </model-viewer>

      <button
        id="reset-btn"
        className={showReset ? 'visible' : ''}
        aria-label="Reset camera view"
        onClick={handleReset}
      >
        Reset View
      </button>

      {PICKER_ENABLED && (
        <button
          id="picker-btn"
          className={pickerMode ? 'active' : ''}
          onClick={togglePicker}
        >
          {pickerMode ? 'Picking…' : 'Picker'}
        </button>
      )}

      {PICKER_ENABLED && pickerMode && pickerHit && (
        <div id="picker-readout">
          <span className="picker-row" onClick={() => copyPickerRow('pos', pickerHit.position.toString())}>
            <span className="picker-key">{copiedKey === 'pos' ? '✓' : 'pos'}</span>
            {pickerHit.position.toString()}
          </span>
          <span className="picker-row" onClick={() => copyPickerRow('nrm', pickerHit.normal.toString())}>
            <span className="picker-key">{copiedKey === 'nrm' ? '✓' : 'nrm'}</span>
            {pickerHit.normal.toString()}
          </span>
        </div>
      )}
    </>
  );
}
