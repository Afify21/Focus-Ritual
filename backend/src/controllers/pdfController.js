const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for PDF file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        console.log('Upload directory:', uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        console.log('Received file:', file.originalname);
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log('File type:', file.mimetype);
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed'));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
}).single('pdf');

// Controller functions
const uploadPDF = (req, res) => {
    console.log('Upload request received');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            console.error('Multer error code:', err.code);
            console.error('Multer error field:', err.field);
            console.error('Multer error message:', err.message);

            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    error: 'File size exceeds 10MB limit',
                    details: {
                        code: err.code,
                        field: err.field,
                        message: err.message
                    }
                });
            }
            return res.status(400).json({
                error: err.message,
                details: {
                    code: err.code,
                    field: err.field
                }
            });
        } else if (err) {
            console.error('Upload error:', err);
            console.error('Error stack:', err.stack);
            return res.status(400).json({
                error: err.message,
                details: {
                    name: err.name,
                    stack: err.stack
                }
            });
        }

        if (!req.file) {
            console.error('No file received');
            return res.status(400).json({
                error: 'No file uploaded',
                details: {
                    headers: req.headers,
                    body: req.body
                }
            });
        }

        // Verify file exists after upload
        const filePath = path.join(__dirname, '../../uploads', req.file.filename);
        if (!fs.existsSync(filePath)) {
            console.error('File not found after upload:', filePath);
            return res.status(500).json({
                error: 'File upload failed',
                details: {
                    path: filePath,
                    file: req.file
                }
            });
        }

        console.log('File uploaded successfully:', req.file);
        console.log('File path:', filePath);
        console.log('File exists:', fs.existsSync(filePath));
        console.log('File size:', fs.statSync(filePath).size);

        res.json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                path: `/uploads/${req.file.filename}`,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    });
};

const getPDF = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads', filename);
    console.log('Attempting to serve file:', filePath);

    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(filePath);
};

const deletePDF = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads', filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            return res.status(500).json({ error: 'Error deleting file' });
        }
        res.json({ message: 'File deleted successfully' });
    });
};

module.exports = {
    uploadPDF,
    getPDF,
    deletePDF
}; 