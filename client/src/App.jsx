import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaPalette, FaPaintBrush, FaSave, FaCube } from 'react-icons/fa';
import { MdGridOn, MdWbSunny } from 'react-icons/md';
import Viewer3D from './components/Viewer3D';
import { Toaster, toast } from 'react-hot-toast';
import config from '../config'; 

const API_URL = config.API_URL;

function App() {
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const [bgColor, setBgColor] = useState('#1a1a2e'); 
  const [isWireframe, setIsWireframe] = useState(false);

  const [meshColor, setMeshColor] = useState('#ffffff');
  const [envPreset, setEnvPreset] = useState('city');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/settings`);
      if (res.data && res.data.modelUrl) {
        setModelUrl(res.data.modelUrl);
        setBgColor(res.data.backgroundColor);
        setIsWireframe(res.data.isWireframe);
      }
    } catch (error) { console.error(error); }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('model', file);
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setModelUrl(res.data.url);
      toast.success('Model uploaded successfully!'); 
    } catch (error) { 
      toast.error("Upload failed! Please try again.");
    } 
    finally { setLoading(false); }
  };

  const saveSettings = async () => {
    if (!modelUrl) return toast.error("Please upload a model first!");
    
    try {
      await axios.post(`${API_URL}/settings`, {
        modelUrl,
        backgroundColor: bgColor,
        isWireframe
      });
      toast.success('Configuration Saved Successfully!');
    } catch (error) { 
      console.error(error); 
      const serverMessage = error.response?.data?.error || error.message;
      toast.error(`Save Failed: ${serverMessage}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
      color: '#ffffff',
      fontFamily: "'Inter', sans-serif",
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>

      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#334155',
            color: '#fff',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          },
          success: {
            style: {
              border: '1px solid #2ecc71',
              color: '#2ecc71',
            },
            iconTheme: {
              primary: '#2ecc71',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              border: '1px solid #e74c3c',
              color: '#e74c3c',
            },
            iconTheme: {
              primary: '#e74c3c',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ type: 'spring', stiffness: 100 }}
        style={{ marginBottom: '30px', textAlign: 'center' }}
      >
        <h1 style={{ 
          fontSize: '3rem', 
          margin: 0, 
          background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0px 0px 10px rgba(79, 172, 254, 0.5))'
        }}>
          3D Product Studio
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '10px' }}>Interactive GLB/GLTF Viewer</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
          gap: '15px', 
          width: '100%',
          maxWidth: '1200px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          padding: '25px', 
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          marginBottom: '30px'
        }}
      >
        
        {/* 1. Upload */}
        <ControlCard title="Upload Model" icon={<FaCloudUploadAlt color="#4facfe"/>}>
          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '10px', background: 'rgba(79, 172, 254, 0.1)', 
            border: '1px dashed #4facfe', borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', color: '#4facfe', fontWeight: 'bold', width: '100%'
          }}>
            <input type="file" accept=".glb,.gltf" onChange={handleFileUpload} style={{display: 'none'}}/>
            Click to Browse
          </label>
        </ControlCard>

        {/* 2. Background Color */}
        <ControlCard title="Background" icon={<FaPalette color="#f6d365"/>}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <input 
              type="color" 
              value={bgColor} 
              onChange={(e) => setBgColor(e.target.value)} 
              style={{
                border: 'none', width: '40px', height: '40px', cursor: 'pointer', 
                background: 'none', borderRadius: '50%', overflow: 'hidden'
              }}
            />
            <span style={{fontSize: '12px', color: '#ccc'}}>{bgColor}</span>
          </div>
        </ControlCard>

        {/* 3. Mesh Color */}
        <ControlCard title="Mesh Tint" icon={<FaPaintBrush color="#ff9a9e"/>}>
           <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <input 
              type="color" 
              value={meshColor} 
              onChange={(e) => setMeshColor(e.target.value)} 
              style={{
                border: 'none', width: '40px', height: '40px', cursor: 'pointer', 
                background: 'none', borderRadius: '50%', overflow: 'hidden'
              }}
            />
             <span style={{fontSize: '12px', color: '#ccc'}}>{meshColor}</span>
          </div>
        </ControlCard>

        {/* 4. Environment */}
        <ControlCard title="Lighting" icon={<MdWbSunny color="#84fab0"/>}>
          <select 
            value={envPreset} 
            onChange={(e) => setEnvPreset(e.target.value)} 
            style={{
              width: '100%', padding: '8px', borderRadius: '6px', border: 'none',
              background: '#1e293b', color: 'white', fontSize: '12px', outline: 'none'
            }}
          >
            <option value="city">City</option>
            <option value="sunset">Sunset</option>
            <option value="dawn">Dawn</option>
            <option value="apartment">Apartment</option>
            <option value="studio">Studio</option>
          </select>
        </ControlCard>

        {/* 5. Toggles */}
        <ControlCard title="View Mode" icon={<MdGridOn color="#a18cd1"/>}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsWireframe(!isWireframe)}
            style={{ 
              width: '100%', padding: '8px', 
              background: isWireframe ? 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%)' : 'rgba(255,255,255,0.1)', 
              color: isWireframe ? '#000' : '#fff', border: 'none', borderRadius: '6px', 
              cursor: 'pointer', fontSize:'12px', fontWeight: 'bold'
            }}
          >
            {isWireframe ? 'Wireframe ON' : 'Standard View'}
          </motion.button>
        </ControlCard>

        {/* 6. Save */}
        <ControlCard title="Actions" icon={<FaSave color="#52c41a"/>}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveSettings}
            style={{ 
              width: '100%', padding: '8px', 
              background: 'linear-gradient(to right, #11998e, #38ef7d)', 
              color: 'white', border: 'none', borderRadius: '6px', 
              cursor: 'pointer', fontSize:'12px', fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(56, 239, 125, 0.4)'
            }}
          >
            Save Config
          </motion.button>
        </ControlCard>
      </motion.div>

      {/* --- 3D Viewer Area --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '1200px',
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#000'
        }}
      >
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)', zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                 <FaCube size={50} color="#4facfe" />
              </motion.div>
              <p style={{marginTop: '15px', color: '#4facfe'}}>Uploading Model...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <Viewer3D 
          modelUrl={modelUrl} 
          backgroundColor={bgColor} 
          isWireframe={isWireframe} 
          meshColor={meshColor}
          envPreset={envPreset}
        />
        
        {!modelUrl && !loading && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            pointerEvents: 'none', textAlign: 'center', opacity: 0.7
          }}>
            <FaCube size={80} color="rgba(255,255,255,0.2)" />
            <p style={{color: 'rgba(255,255,255,0.5)', marginTop: '10px'}}>No Model Loaded</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}


const ControlCard = ({ title, icon, children }) => (
  <motion.div 
    variants={{
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    }}
    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
      {icon}
      <span style={{ fontWeight: '600', fontSize: '14px', color: '#e2e8f0' }}>{title}</span>
    </div>
    <div style={{ 
      background: 'rgba(0,0,0,0.2)', 
      padding: '10px', 
      borderRadius: '10px',
      flex: 1,
      display: 'flex',
      alignItems: 'center'
    }}>
      {children}
    </div>
  </motion.div>
);

export default App;