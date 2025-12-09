import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, Environment, Html, Bvh } from '@react-three/drei';

const Model = React.memo(({ url, isWireframe, meshColor, addHotspot }) => {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.wireframe = isWireframe;
        if (!isWireframe) {
          child.material.color.set(meshColor);
        }
      }
    });
  }, [scene, isWireframe, meshColor]);

  return (
    <primitive 
      object={scene} 
      onClick={(e) => {
        e.stopPropagation(); 
        addHotspot(e.point); 
      }}
    />
  );
});

const Viewer3D = ({ modelUrl, backgroundColor, isWireframe, meshColor, envPreset }) => {
  const [hotspots, setHotspots] = useState([]);

  const addHotspot = useCallback((point) => {
    setHotspots((prevHotspots) => [
      ...prevHotspots,
      {
        id: Date.now(),
        position: [point.x, point.y, point.z],
        text: `Point ${prevHotspots.length + 1}`
      }
    ]);
  }, []);

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #333', position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
      
 
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, background: 'rgba(255, 255, 255, 0.9)', padding: '8px 12px', borderRadius: '6px', pointerEvents: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'}}>
        <small style={{color: '#000', fontWeight: 'bold' }}>🖱️ Click model to annotate</small>
      </div>

      <Canvas shadows dpr={[1, 2]} camera={{ fov: 45 }}>
        <color attach="background" args={[backgroundColor]} />
        <Environment preset={envPreset} />

        <Bvh firstHitOnly>
          {modelUrl && (
            <Stage environment={null} intensity={0.6} castShadow={false}>
              <Model 
                url={modelUrl} 
                isWireframe={isWireframe} 
                meshColor={meshColor}
                addHotspot={addHotspot}
              />
            </Stage>
          )}
        </Bvh>

        {hotspots.map((h) => (
          <Html key={h.id} position={h.position}>
            <div style={{ 
              background: 'rgba(0,0,0,0.85)', 
              color: 'white', 
              padding: '6px 10px', 
              borderRadius: '6px', 
              fontSize: '11px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              transform: 'translate3d(-50%, -140%, 0)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              {h.text}
            </div>
            
            <div style={{ 
              width: '12px', 
              height: '12px', 
              background: '#00f2fe', 
              border: '2px solid white',
              borderRadius: '50%', 
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 10px #00f2fe'
            }}></div>
          </Html>
        ))}

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
};

export default Viewer3D;