const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

/**
 * GET /api/employees
 * Get all employees with optional filters
 * Query params:
 * - department_id: filter by department
 * - search: search in employee_code or name
 */
router.get('/', async (req, res) => {
    try {
        const { department_id, search } = req.query;

        // Build filter object
        const filter = {};

        if (department_id) {
            filter.department_id = department_id;
        }

        if (search) {
            filter.$or = [
                { employee_code: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        const employees = await Employee.find(filter)
            .populate('department_id', 'name')
            .sort({ employee_code: 1 });

        res.json({
            success: true,
            data: employees
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employees',
            error: error.message
        });
    }
});

/**
 * GET /api/employees/:id
 * Get a single employee by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate('department_id', 'name');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employee',
            error: error.message
        });
    }
});

/**
 * POST /api/employees
 * Create a new employee
 */
router.post('/', async (req, res) => {
    try {
        const { employee_code, name, department_id } = req.body;

        // Validation
        const errors = [];

        if (!employee_code || employee_code.trim() === '') {
            errors.push('Employee code is required');
        }

        if (!name || name.trim() === '') {
            errors.push('Employee name is required');
        }

        if (!department_id) {
            errors.push('Department ID is required');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Check if employee code already exists
        const existingEmployee = await Employee.findOne({ employee_code: employee_code.trim() });
        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: 'Employee code already exists'
            });
        }

        const employee = new Employee({
            employee_code: employee_code.trim(),
            name: name.trim(),
            department_id
        });

        await employee.save();
        await employee.populate('department_id', 'name');

        res.status(201).json({
            success: true,
            data: employee,
            message: 'Employee created successfully'
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating employee',
            error: error.message
        });
    }
});

module.exports = router;
