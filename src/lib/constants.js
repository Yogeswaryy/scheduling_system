// Static configuration + the mock roster. In production the roster, leave types and
// holidays come from the HR / Employee dashboards (see src/api/README in the zip notes).

export const MANAGER = {
  id: 'mgr',
  code: 'IT0000',
  name: 'Daniel Doe',
  first: 'Daniel',
  role: 'IT Manager',
  dept: 'IT',
  email: 'daniel.doe@company.com',
};

export const ENTITLEMENT = { annual: 18, sick: 10 };

// Team rule shown on the Home page: at most this many people may be off at once.
export const MAX_OFF = 3;

// HR can add leave types for everyone (wireframe note), so types are data, not code.
export const LEAVE_TYPES = [
  { id: 'annual', name: 'Annual Leave', short: 'Annual', chip: 'Annual leave', analytics: 'Annual', color: '#3b82f6', bg: '#cfe1ff', balanceKey: 'annual', requiresAttachment: false, calendarDays: false, backdate: false },
  { id: 'sick', name: 'Sick Leave', short: 'Sick', chip: 'Sick leave', analytics: 'MC', color: '#5fd400', bg: '#d9f99d', balanceKey: 'sick', requiresAttachment: true, calendarDays: false, backdate: true },
  { id: 'emergency', name: 'Emergency Leave', short: 'Emergency', chip: 'Emergency', analytics: 'Emergency', color: '#f97316', bg: '#fed7aa', balanceKey: null, requiresAttachment: false, calendarDays: false, backdate: true },
  { id: 'unpaid', name: 'Unpaid Leave', short: 'Unpaid', chip: 'Unpaid', analytics: 'Unpaid', color: '#8b97ad', bg: '#e2e6ee', balanceKey: null, requiresAttachment: false, calendarDays: false, backdate: false },
  { id: 'maternity', name: 'Parental Leave', short: 'Parental', chip: 'Parental', analytics: 'Parental', color: '#d946ef', bg: '#f5c6f7', balanceKey: null, requiresAttachment: true, calendarDays: true, backdate: false },
];

export const typeById = (id) => LEAVE_TYPES.find((t) => t.id === id) || LEAVE_TYPES[0];

export const HOLIDAYS = [
  { date: '2026-01-01', name: 'Public Holiday', note: "New Year's Day" },
  { date: '2026-05-01', name: 'Public Holiday', note: 'Labour Day' },
  { date: '2026-08-31', name: 'Public Holiday', note: 'Merdeka Day' },
  { date: '2026-09-16', name: 'Public Holiday', note: 'Malaysia Day' },
  { date: '2026-10-24', name: 'Public Holiday', note: 'Company Holiday' },
  { date: '2026-12-25', name: 'Public Holiday', note: 'Christmas Day' },
];

export const DEPT_SHORT = { Support: 'Support', Operations: 'Ops', Warehouse: 'Warehouse' };

// annualLeft = target remaining annual days (the seed generator backfills past leave to match).
export const BASE_EMPLOYEES = [
  { id: 'e1', code: 'IT0001', name: 'Ethan Koh', role: 'Support Executive', dept: 'Support', covers: ['Support'], annualLeft: 12 },
  { id: 'e2', code: 'IT0002', name: 'Priya Nair', role: 'Operations Executive', dept: 'Operations', covers: ['Operations', 'Support'], annualLeft: 8 },
  { id: 'e3', code: 'IT0003', name: 'Mia Tan', role: 'Support Executive', dept: 'Support', covers: ['Support'], annualLeft: 11 },
  { id: 'e4', code: 'IT0004', name: 'Sarah Ong', role: 'Support Executive', dept: 'Support', covers: ['Support'], annualLeft: 3 },
  { id: 'e5', code: 'IT0005', name: 'Kumar Ravi', role: 'Operations Executive', dept: 'Operations', covers: ['Operations'], annualLeft: 10 },
  { id: 'e6', code: 'IT0006', name: 'Arjun Das', role: 'Operations Executive', dept: 'Operations', covers: ['Operations'], annualLeft: 1 },
  { id: 'e7', code: 'IT0007', name: 'Arjit Singh', role: 'Warehouse Associate', dept: 'Warehouse', covers: ['Warehouse'], annualLeft: 5 },
  { id: 'e8', code: 'IT0008', name: 'Amanda Lee', role: 'Support Executive', dept: 'Support', covers: ['Support'], annualLeft: 9 },
  { id: 'e9', code: 'IT0009', name: 'Jason Lim', role: 'Warehouse Associate', dept: 'Warehouse', covers: ['Warehouse'], annualLeft: 7 },
  { id: 'e10', code: 'IT0010', name: 'Nader Hassan', role: 'Support Executive', dept: 'Support', covers: ['Support'], annualLeft: 6 },
];

export const POLICY = {
  title: 'Code of Conduct',
  updated: 'April 11, 2023',
  blocks: [
    { p: 'This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.' },
    { p: 'We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.' },
    { h: 'Interpretation and Definitions' },
    { h: 'Interpretation', p: 'The words of which the initial letter is capitalised have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.' },
    {
      h: 'Definitions',
      p: 'For the purposes of this Privacy Policy:',
      list: [
        'Account means a unique account created for You to access our Service or parts of our Service.',
        'Company (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Intaniaga Sdn Bhd, Lot 4, Jalan CJ 1/4, Kawasan Perusahaan Cheras Jaya, 43200 Cheras, Selangor, Malaysia.',
        'Cookies are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.',
        'Country refers to: Malaysia',
        'Device means any device that can access the Service such as a computer, a cell phone or a digital tablet.',
        'Personal Data is any information that relates to an identified or identifiable individual.',
        'Service refers to the Website.',
      ],
    },
  ],
};
