
const express = require('express');
const cors = require('cors');
const {
    MOCK_DOCUMENTS,
    MOCK_TICKETS,
    MOCK_CIRCULARS,
    MOCK_DIRECTORY_USERS
} = require('./data');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let currentCirculars = [...MOCK_CIRCULARS];

app.get('/api/dashboard-analytics', (req, res) => {
    res.json({
        activeTickets: MOCK_TICKETS.filter(t => t.status === 'Open' || t.status === 'In Progress').length,
        documentsInReview: 5,
        pendingCirculars: currentCirculars.filter(c => c.acknowledgedBy.length < c.totalRecipients).length,
        onlineUsers: MOCK_DIRECTORY_USERS.filter(u => u.isOnline).length,
        ticketStatusData: [{
            name: 'Open',
            value: MOCK_TICKETS.filter(t => t.status === 'Open').length
        }, {
            name: 'In Progress',
            value: MOCK_TICKETS.filter(t => t.status === 'In Progress').length
        }, {
            name: 'Resolved',
            value: MOCK_TICKETS.filter(t => t.status === 'Resolved').length
        }, ],
        documentTypeData: [{
            name: 'PDF',
            value: MOCK_DOCUMENTS.filter(d => d.type === 'pdf').length
        }, {
            name: 'DOCX',
            value: MOCK_DOCUMENTS.filter(d => d.type === 'docx').length
        }, {
            name: 'XLSX',
            value: MOCK_DOCUMENTS.filter(d => d.type === 'xlsx').length
        }, {
            name: 'PNG',
            value: MOCK_DOCUMENTS.filter(d => d.type === 'png').length
        }, ],
    });
});

app.get('/api/recent-activity', (req, res) => {
    res.json([{
        user: 'Alice Johnson',
        action: 'uploaded a new document',
        subject: 'Annual_Report_2023.pdf',
        time: '2h ago'
    }, {
        user: 'Dr. Carol White',
        action: 'submitted a new ticket',
        subject: 'Projector not working...',
        time: '5h ago'
    }, {
        user: 'Admin User',
        action: 'published a new circular',
        subject: 'Holiday Schedule',
        time: '1d ago'
    }, {
        user: 'Frank Blue',
        action: 'resolved a ticket',
        subject: 'Cannot access shared drive',
        time: '2d ago'
    }, ]);
});

app.get('/api/documents', (req, res) => {
    res.json(MOCK_DOCUMENTS);
});

app.get('/api/tickets', (req, res) => {
    res.json(MOCK_TICKETS);
});

app.get('/api/circulars', (req, res) => {
    res.json(currentCirculars);
});

app.post('/api/circulars', (req, res) => {
    const circular = req.body;
    currentCirculars = [circular, ...currentCirculars];
    res.json(circular);
});

app.put('/api/circulars/:id', (req, res) => {
    const updatedCircular = req.body;
    currentCirculars = currentCirculars.map(c => c.id === updatedCircular.id ? updatedCircular : c);
    res.json(updatedCircular);
});

app.get('/api/directory-users', (req, res) => {
    res.json(MOCK_DIRECTORY_USERS);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
