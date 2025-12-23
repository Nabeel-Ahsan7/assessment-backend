const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    type: {
        type: [String],
        required: [true, 'At least one notice type is required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'At least one notice type must be selected'
        }
    },
    published_date: {
        type: Date,
        default: null
    },
    target: {
        type: Number,
        required: true,
        enum: [0, 1], // 0 = Individual, 1 = Department
        default: 0
    },
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null,
        validate: {
            validator: function (v) {
                // If target is individual (0), employee_id must be provided
                if (this.target === 0) {
                    return v !== null && v !== undefined;
                }
                return true;
            },
            message: 'Employee ID is required when target is Individual'
        }
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null,
        validate: {
            validator: function (v) {
                // If target is department (1), department_id must be provided
                if (this.target === 1) {
                    return v !== null && v !== undefined;
                }
                return true;
            },
            message: 'Department ID is required when target is Department'
        }
    },
    notice_body: {
        type: String,
        required: [true, 'Notice body is required'],
        trim: true
    },
    attachments: {
        type: [String],
        default: []
    },
    status: {
        type: Number,
        required: true,
        enum: [0, 1], // 0 = Draft, 1 = Published
        default: 0
    }
}, {
    timestamps: true
});

// Index for better query performance
noticeSchema.index({ status: 1, published_date: -1 });
noticeSchema.index({ target: 1, department_id: 1 });
noticeSchema.index({ target: 1, employee_id: 1 });

module.exports = mongoose.model('Notice', noticeSchema);
