const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

/**
 * GET /api/departments
 * Get all departments
 */
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });

        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching departments',
            error: error.message
        });
    }
});

/**
 * GET /api/departments/:id
 * Get a single department by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.json({
            success: true,
            data: department
        });
    } catch (error) {
        console.error('Error fetching department:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching department',
            error: error.message
        });
    }
});

/**
 * POST /api/departments
 * Create a new department
 */
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Department name is required'
            });
        }

        const department = new Department({ name: name.trim() });
        await department.save();

        res.status(201).json({
            success: true,
            data: department,
            message: 'Department created successfully'
        });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating department',
            error: error.message
        });
    }
});

module.exports = router;
