const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employee_code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
