const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');

// Get all audio files
router.get('/', audioController.getAllAudio);

// Get audio by category
router.get('/category/:category', audioController.getAudioByCategory);

// Get single audio file
router.get('/:id', audioController.getAudioById);

// Stream audio file
router.get('/stream/:id', audioController.streamAudio);

module.exports = router; 