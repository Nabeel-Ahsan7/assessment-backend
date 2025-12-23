const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Notice = require('../models/Notice');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../notices/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and documents are allowed.'));
        }
    }
});

/**
 * GET /api/notices
 * Get all notices with pagination and filters
 * Query params:
 * - page: page number (default: 1)
 * - limit: items per page (default: 10)
 * - status: filter by status (0=draft, 1=published)
 * - target: filter by target (0=individual, 1=department)
 * - department_id: filter by department
 * - employee_id: filter by employee
 * - published_date: filter by published date
 * - search: search in title and notice_body
 */
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            target,
            department_id,
            employee_id,
            published_date,
            search,
            publishStatus
        } = req.query;

        // Build filter object
        const filter = {};

        if (status !== undefined) {
            filter.status = parseInt(status);
        }

        if (target !== undefined) {
            filter.target = parseInt(target);
        }

        if (department_id) {
            filter.department_id = department_id;
        }

        if (employee_id) {
            filter.employee_id = employee_id;
        }

        if (published_date) {
            const date = new Date(published_date);
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            filter.published_date = {
                $gte: date,
                $lt: nextDay
            };
        }

        // Handle publishStatus filter (published vs unpublished)
        if (publishStatus === 'published') {
            // Published means status=1 AND (no date OR date <= today)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            filter.$and = [
                { status: 1 },
                {
                    $or: [
                        { published_date: { $exists: false } },
                        { published_date: null },
                        { published_date: { $lte: today } }
                    ]
                }
            ];
        } else if (publishStatus === 'unpublished') {
            // Unpublished means status=1 AND date > today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            filter.$and = [
                { status: 1 },
                { published_date: { $gte: tomorrow } }
            ];
        }

        // Handle search across multiple fields including employee
        let notices;
        let total;
        if (search) {
            // First, find matching employees
            const Employee = require('../models/Employee');
            const matchingEmployees = await Employee.find({
                $or: [
                    { employee_code: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');

            const employeeIds = matchingEmployees.map(emp => emp._id);

            // Search in notices with employee match included
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { notice_body: { $regex: search, $options: 'i' } },
                { employee_id: { $in: employeeIds } }
            ];
        }

        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get total count for pagination
        total = await Notice.countDocuments(filter);

        // Get notices with population
        notices = await Notice.find(filter)
            .populate('department_id', 'name')
            .populate('employee_id', 'employee_code name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({
            success: true,
            data: notices,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching notices:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notices',
            error: error.message
        });
    }
});

/**
 * GET /api/notices/:id
 * Get a single notice by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id)
            .populate('department_id', 'name')
            .populate('employee_id', 'employee_code name');

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        res.json({
            success: true,
            data: notice
        });
    } catch (error) {
        console.error('Error fetching notice:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notice',
            error: error.message
        });
    }
});

/**
 * POST /api/notices/upload
 * Upload files for notice attachments
 */
router.post('/upload', upload.array('files', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const fileUrls = req.files.map(file => `/uploads/${file.filename}`);

        res.json({
            success: true,
            data: fileUrls,
            message: 'Files uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading files',
            error: error.message
        });
    }
});

/**
 * POST /api/notices
 * Create a new notice with validation
 */
router.post('/', async (req, res) => {
    try {
        const {
            title,
            type,
            published_date,
            target,
            employee_id,
            department_id,
            notice_body,
            attachments,
            status
        } = req.body;

        // Validation
        const errors = [];

        if (!title || title.trim() === '') {
            errors.push('Title is required');
        }

        if (!type || !Array.isArray(type) || type.length === 0) {
            errors.push('At least one notice type is required');
        }

        if (!notice_body || notice_body.trim() === '') {
            errors.push('Notice body is required');
        }

        if (target === undefined || (target !== 0 && target !== 1)) {
            errors.push('Target must be 0 (Individual) or 1 (Department)');
        }

        if (target === 0 && !employee_id) {
            errors.push('Employee ID is required when target is Individual');
        }

        if (target === 1 && !department_id) {
            errors.push('Department ID is required when target is Department');
        }

        if (status === undefined || (status !== 0 && status !== 1)) {
            errors.push('Status must be 0 (Draft) or 1 (Published)');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Create notice data
        const noticeData = {
            title: title.trim(),
            type,
            published_date: published_date || null,
            target,
            employee_id: target === 0 ? employee_id : null,
            department_id: target === 1 ? department_id : null,
            notice_body: notice_body.trim(),
            attachments: attachments || [],
            status
        };

        // Create new notice
        const notice = new Notice(noticeData);
        await notice.save();

        // Populate references before sending response
        await notice.populate('department_id', 'name');
        await notice.populate('employee_id', 'employee_code name');

        res.status(201).json({
            success: true,
            data: notice,
            message: 'Notice created successfully'
        });
    } catch (error) {
        console.error('Error creating notice:', error);

        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating notice',
            error: error.message
        });
    }
});

/**
 * PUT /api/notices/:id
 * Update an existing notice
 */
router.put('/:id', async (req, res) => {
    try {
        const {
            title,
            type,
            published_date,
            target,
            employee_id,
            department_id,
            notice_body,
            attachments,
            status
        } = req.body;

        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        // Validation
        const errors = [];

        if (title !== undefined && title.trim() === '') {
            errors.push('Title cannot be empty');
        }

        if (type !== undefined && (!Array.isArray(type) || type.length === 0)) {
            errors.push('At least one notice type is required');
        }

        if (notice_body !== undefined && notice_body.trim() === '') {
            errors.push('Notice body cannot be empty');
        }

        if (target !== undefined) {
            if (target !== 0 && target !== 1) {
                errors.push('Target must be 0 (Individual) or 1 (Department)');
            }
            if (target === 0 && !employee_id) {
                errors.push('Employee ID is required when target is Individual');
            }
            if (target === 1 && !department_id) {
                errors.push('Department ID is required when target is Department');
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Update fields
        if (title) notice.title = title.trim();
        if (type) notice.type = type;
        if (published_date !== undefined) notice.published_date = published_date;
        if (target !== undefined) {
            notice.target = target;
            notice.employee_id = target === 0 ? employee_id : null;
            notice.department_id = target === 1 ? department_id : null;
        }
        if (notice_body) notice.notice_body = notice_body.trim();
        if (attachments !== undefined) notice.attachments = attachments;
        if (status !== undefined) notice.status = status;

        await notice.save();

        // Populate references
        await notice.populate('department_id', 'name');
        await notice.populate('employee_id', 'employee_code name');

        res.json({
            success: true,
            data: notice,
            message: 'Notice updated successfully'
        });
    } catch (error) {
        console.error('Error updating notice:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating notice',
            error: error.message
        });
    }
});

/**
 * DELETE /api/notices/:id
 * Delete a notice
 */
router.delete('/:id', async (req, res) => {
    try {
        const notice = await Notice.findByIdAndDelete(req.params.id);

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        // Optionally delete associated files
        if (notice.attachments && notice.attachments.length > 0) {
            notice.attachments.forEach(attachment => {
                const filePath = path.join(uploadDir, path.basename(attachment));
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        res.json({
            success: true,
            message: 'Notice deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notice:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting notice',
            error: error.message
        });
    }
});

module.exports = router;
