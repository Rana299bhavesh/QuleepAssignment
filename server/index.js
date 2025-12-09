const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: "*" }));

const SettingsSchema = new mongoose.Schema({
  modelData: { type: String, required: true }, // Stores the Base64 string
  backgroundColor: { type: String, default: '#1a1a2e' },
  isWireframe: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Settings = mongoose.model('Settings', SettingsSchema);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('model'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    const base64Data = req.file.buffer.toString('base64');
    const fileType = req.file.mimetype; 
    const dataURI = `data:${fileType};base64,${base64Data}`;
    res.json({ url: dataURI });
});

app.post('/api/settings', async (req, res) => {
    try {
        const { modelUrl, backgroundColor, isWireframe } = req.body;
        
        const sizeInMB = (new TextEncoder().encode(JSON.stringify(req.body)).length) / (1024 * 1024);
        console.log(`Attempting to save payload of size: ${sizeInMB.toFixed(2)} MB`);

        const newSettings = new Settings({ 
            modelData: modelUrl, 
            backgroundColor, 
            isWireframe 
        });
        await newSettings.save();
        res.status(201).json(newSettings);
    } catch (err) {
        console.error("SAVE ERROR:", err.message); 
        res.status(500).json({ error: err.message, detailed: err.toString() }); 
    }
});

app.get('/api/settings', async (req, res) => {
    try {
        const latest = await Settings.findOne().sort({ createdAt: -1 });
        if (latest) {
            res.json({
                modelUrl: latest.modelData, 
                backgroundColor: latest.backgroundColor,
                isWireframe: latest.isWireframe
            });
        } else {
            res.json({});
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;