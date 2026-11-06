import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'resumes');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Disk Storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req: any, file, cb) => {
    const userId = req.user?.id || 'anon';
    const timestamp = Date.now();
    const cleanOrigName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(cleanOrigName) || '.pdf';
    const base = path.basename(cleanOrigName, ext);
    cb(null, `${userId}_${base}_${timestamp}${ext}`);
  },
});

// File filter for PDF, DOC, DOCX
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream', // Some browsers send octet-stream for pdf
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf', '.doc', '.docx'];

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, DOC, and DOCX documents are permitted.'));
  }
};

// 10MB max limit
export const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
