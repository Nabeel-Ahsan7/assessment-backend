const mongoose = require('mongoose');
const Department = require('./models/Department');
const Employee = require('./models/Employee');
const Notice = require('./models/Notice');
require('dotenv').config();

// Sample data
const departments = [
    { name: 'Engineering' },
    { name: 'Human Resources' },
    { name: 'Finance' },
    { name: 'Marketing' },
    { name: 'Sales' },
    { name: 'Operations' },
    { name: 'IT Support' },
    { name: 'Administration' }
];

const employees = [
    { employee_code: 'EMP001', name: 'John Doe' },
    { employee_code: 'EMP002', name: 'Jane Smith' },
    { employee_code: 'EMP003', name: 'Michael Johnson' },
    { employee_code: 'EMP004', name: 'Emily Davis' },
    { employee_code: 'EMP005', name: 'David Wilson' },
    { employee_code: 'EMP006', name: 'Sarah Brown' },
    { employee_code: 'EMP007', name: 'Robert Taylor' },
    { employee_code: 'EMP008', name: 'Lisa Anderson' },
    { employee_code: 'EMP009', name: 'James Martinez' },
    { employee_code: 'EMP010', name: 'Jennifer Garcia' }
];

const noticeTypes = [
    'Holiday',
    'Policy Update',
    'Event',
    'Training',
    'Meeting',
    'Announcement',
    'Emergency'
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Department.deleteMany({});
        await Employee.deleteMany({});
        await Notice.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Insert departments
        const createdDepartments = await Department.insertMany(departments);
        console.log(`✅ Created ${createdDepartments.length} departments`);

        // Insert employees with random departments
        const employeesWithDept = employees.map((emp, index) => ({
            ...emp,
            department_id: createdDepartments[index % createdDepartments.length]._id
        }));
        const createdEmployees = await Employee.insertMany(employeesWithDept);
        console.log(`✅ Created ${createdEmployees.length} employees`);

        // Create sample notices
        const notices = [
            {
                title: 'Year End Holiday Notice',
                type: ['Holiday', 'Announcement'],
                published_date: new Date('2025-12-20'),
                target: 1,
                department_id: createdDepartments[0]._id,
                notice_body: 'Please be informed that the office will be closed from December 24th to January 1st for the year-end holidays. We wish everyone a Merry Christmas and Happy New Year!',
                attachments: [],
                status: 1
            },
            {
                title: 'New Company Policy Update',
                type: ['Policy Update'],
                published_date: new Date('2025-12-15'),
                target: 1,
                department_id: createdDepartments[1]._id,
                notice_body: 'We have updated our remote work policy. Please review the new guidelines in the employee handbook.',
                attachments: [],
                status: 1
            },
            {
                title: 'Team Building Event - January 2026',
                type: ['Event'],
                published_date: new Date('2025-12-10'),
                target: 1,
                department_id: createdDepartments[3]._id,
                notice_body: 'Join us for our annual team building event on January 15th, 2026. Location and time details to follow.',
                attachments: [],
                status: 1
            },
            {
                title: 'Mandatory Cybersecurity Training',
                type: ['Training', 'Policy Update'],
                published_date: new Date('2025-12-18'),
                target: 1,
                department_id: createdDepartments[6]._id,
                notice_body: 'All employees must complete the cybersecurity training module by December 31st, 2025.',
                attachments: [],
                status: 1
            },
            {
                title: 'Quarterly Review Meeting',
                type: ['Meeting'],
                published_date: new Date('2025-12-22'),
                target: 0,
                employee_id: createdEmployees[0]._id,
                notice_body: 'Your quarterly performance review is scheduled for January 5th at 2:00 PM. Please prepare your self-assessment.',
                attachments: [],
                status: 1
            },
            {
                title: 'New Benefits Package Available',
                type: ['Announcement'],
                published_date: new Date('2025-12-12'),
                target: 1,
                department_id: createdDepartments[1]._id,
                notice_body: 'We are pleased to announce an enhanced benefits package for 2026. Review the details and make your selections by December 31st.',
                attachments: [],
                status: 1
            },
            {
                title: 'Draft: Server Maintenance Notice',
                type: ['Announcement', 'Emergency'],
                published_date: null,
                target: 1,
                department_id: createdDepartments[6]._id,
                notice_body: 'Scheduled server maintenance will occur on January 10th from 12:00 AM to 4:00 AM. Services will be temporarily unavailable.',
                attachments: [],
                status: 0
            },
            {
                title: 'Project Deadline Extension',
                type: ['Announcement'],
                published_date: new Date('2025-12-19'),
                target: 0,
                employee_id: createdEmployees[2]._id,
                notice_body: 'The deadline for your current project has been extended to January 20th, 2026. Please ensure all deliverables are met by the new date.',
                attachments: [],
                status: 1
            },
            {
                title: 'Employee Recognition Awards',
                type: ['Event', 'Announcement'],
                published_date: new Date('2025-12-08'),
                target: 1,
                department_id: createdDepartments[4]._id,
                notice_body: 'Join us in celebrating our outstanding team members at the Employee Recognition Awards ceremony on January 8th.',
                attachments: [],
                status: 1
            },
            {
                title: 'Draft: Q1 Sales Strategy Meeting',
                type: ['Meeting'],
                published_date: null,
                target: 1,
                department_id: createdDepartments[4]._id,
                notice_body: 'Preparing agenda for Q1 sales strategy meeting. All sales team members are expected to attend.',
                attachments: [],
                status: 0
            },
            {
                title: 'Health and Safety Workshop',
                type: ['Training', 'Event'],
                published_date: new Date('2025-12-16'),
                target: 1,
                department_id: createdDepartments[5]._id,
                notice_body: 'Mandatory health and safety workshop for all operations staff on January 12th. Topics include workplace safety and emergency procedures.',
                attachments: [],
                status: 1
            },
            {
                title: 'Personal Development Plan Review',
                type: ['Meeting'],
                published_date: new Date('2025-12-21'),
                target: 0,
                employee_id: createdEmployees[5]._id,
                notice_body: 'Time to review your personal development plan and set goals for 2026. Meeting scheduled for January 7th at 10:00 AM.',
                attachments: [],
                status: 1
            }
        ];

        const createdNotices = await Notice.insertMany(notices);
        console.log(`✅ Created ${createdNotices.length} notices`);

        console.log('\n📊 Database seeded successfully!');
        console.log(`\nSummary:
- Departments: ${createdDepartments.length}
- Employees: ${createdEmployees.length}
- Notices: ${createdNotices.length} (${notices.filter(n => n.status === 1).length} published, ${notices.filter(n => n.status === 0).length} draft)
        `);

        // Disconnect
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
