const Audio = require('../models/Audio');
const path = require('path');

// Get all audio files
exports.getAllAudio = async (req, res) => {
    try {
        const audioFiles = await Audio.find();
        res.json(audioFiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get audio by category
exports.getAudioByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const audioFiles = await Audio.find({ category });
        res.json(audioFiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single audio file
exports.getAudioById = async (req, res) => {
    try {
        const audio = await Audio.findById(req.params.id);
        if (!audio) {
            return res.status(404).json({ message: 'Audio file not found' });
        }
        res.json(audio);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Stream audio file
exports.streamAudio = async (req, res) => {
    try {
        const audio = await Audio.findById(req.params.id);
        if (!audio) {
            return res.status(404).json({ message: 'Audio file not found' });
        }

        const filePath = path.join(__dirname, '../../public/audio', audio.filePath);
        res.sendFile(filePath);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 