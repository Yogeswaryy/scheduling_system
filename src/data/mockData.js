// Mock data for the Manager Portal.
// Replace these exports with real API calls (e.g. React Query / fetch to the
// HR / Employee / IT system APIs) when this is wired up to the backend.

export const currentManager = {
  id: 'EMP-002',
  name: 'Jane Doe',
  role: 'IT Manager',
  email: 'jane.doe@company.com',
  group: 'Operations',
  reportsTo: 'Director',
}

export const kpis = {
  peopleScheduledToday: 38,
  onLeaveToday: { total: 5, annual: 3, sick: 2 },
  pendingApprovals: 8,
  coverageAlerts: 2,
}

export const weekAtAGlance = [
  { day: 'Mon', offCount: 2, status: 'Coverage OK' },
  { day: 'Tue', offCount: 3, status: '1 conflict' },
  { day: 'Wed', offCount: 4, status: 'Coverage OK' },
  { day: 'Thu', offCount: 5, status: 'Alert' },
  { day: 'Fri', offCount: 2, status: 'Coverage OK' },
]

export const coverageSettings = {
  minStaffingPerTeam: 5,
  maxPeopleOffAtOnce: 3,
  warnWhenCoverageLow: true,
  blockLeaveWhenLimitExceeded: true,
}

export const leaveRequests = [
  {
    id: 'LR-2026-01040',
    employee: 'Amanda Lee',
    role: 'Senior Executive',
    team: 'Operations / Team A',
    dates: ['12 Oct 2026', '13 Oct 2026', '14 Oct 2026'],
    type: 'Annual',
    impact: 'Low',
    status: 'Pending Approval',
  },
  {
    id: 'LR-2026-01041',
    employee: 'Kumar Ravi',
    role: 'Operations Executive',
    team: 'Operations / Team A',
    dates: ['13 Oct 2026'],
    type: 'Sick',
    impact: 'Medium',
    status: 'Pending Approval',
  },
  {
    id: 'LR-2026-01042',
    employee: 'Nora Smith',
    role: 'Team Lead',
    team: 'Operations / Team A',
    dates: ['12 Oct 2026', '13 Oct 2026', '14 Oct 2026'],
    type: 'Emergency',
    impact: 'High',
    status: 'Pending Approval',
    minStaffingRequired: 8,
    currentAvailable: 7,
    shortageIfApproved: 1,
    coverageStatus: 'Amber',
    primaryBackup: 'Amanda Lee',
    secondaryBackup: 'Kumar Ravi',
  },
  {
    id: 'LR-2026-01043',
    employee: 'Jason Lim',
    role: 'Operations Executive',
    team: 'Warehouse',
    dates: ['20 Oct 2026'],
    type: 'Unpaid',
    impact: 'Low',
    status: 'Pending Approval',
  },
]

// Detailed hierarchy / coverage data for the selected request (Nora Smith's leave)
export const teamHierarchy = {
  selectedEmployee: {
    name: 'Nora Smith',
    role: 'Team Lead',
    team: 'Operations / Team A',
  },
  reportsTo: 'Sarah Lim',
  directReports: [
    { name: 'Amanda Lee', role: 'Senior Executive', status: 'Available', canCover: 'Yes', workload: 'Medium' },
    { name: 'Kumar Ravi', role: 'Operations Executive', status: 'Available', canCover: 'Partial', workload: 'High' },
    { name: 'Jason Lim', role: 'Operations Executive', status: 'On Leave', onLeaveDate: '13 Oct 2026', canCover: 'No' },
    { name: 'Mia Tan', role: 'Support Executive', status: 'Available', canCover: 'Support Tasks', workload: 'Low' },
  ],
}

export const coverageReplacementAnalysis = [
  { employee: 'Amanda Lee', role: 'Senior Executive', canCover: 'Yes', coverageType: 'Full Replacement', availability: 'Available', notes: 'Best replacement' },
  { employee: 'Kumar Ravi', role: 'Operations Executive', canCover: 'Partial', coverageType: 'Shared Coverage', availability: 'Available', notes: 'High workload' },
  { employee: 'Jason Lim', role: 'Operations Executive', canCover: 'No', coverageType: 'Not Available', availability: 'On Leave', notes: 'On leave 13 Oct 2026' },
  { employee: 'Mia Tan', role: 'Support Executive', canCover: 'Partial', coverageType: 'Support Tasks', availability: 'Available', notes: 'Can help with routine tasks' },
]

export const teamStaffingImpact = [
  { date: '12 Oct 2026', required: 8, available: 7, ifApproved: 6, result: -1, status: 'Amber' },
  { date: '13 Oct 2026', required: 8, available: 7, ifApproved: 5, result: -3, status: 'Red' },
  { date: '14 Oct 2026', required: 8, available: 7, ifApproved: 6, result: -1, status: 'Amber' },
]

export const coverageRecommendation =
  'Approve with replacement assigned to Amanda Lee. Shared support from Mia Tan. Flag 13 October 2026 as higher staffing risk.'

// Weekly team leave calendar
export const calendarWeek = {
  weekLabel: 'Mon 12 — Sun 18 Oct 2026',
  days: ['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16', 'Sat 17', 'Sun 18'],
  rows: [
    {
      employee: 'Amanda Lee',
      team: 'Support',
      entries: { 'Tue 13': 'Annual leave', 'Wed 14': 'Annual leave', 'Thu 15': 'Annual leave' },
    },
    {
      employee: 'Kumar Ravi',
      team: 'Ops',
      entries: { 'Thu 15': 'Sick leave', 'Fri 16': 'Sick leave' },
    },
    {
      employee: 'Nora Smith',
      team: 'Ops',
      entries: { 'Mon 12': 'Pending', 'Tue 13': 'Pending' },
    },
    {
      employee: 'Jason Lim',
      team: 'Warehouse',
      entries: { 'Thu 15': 'Unpaid' },
    },
    {
      employee: 'Sarah Ong',
      team: 'Support',
      entries: {
        'Wed 14': 'Parental',
        'Thu 15': 'Parental',
        'Fri 16': 'Parental',
        'Sat 17': 'Parental',
        'Sun 18': 'Parental',
      },
    },
  ],
}

// Employee leave-taken analytics dashboard
export const leaveDashboardSummary = {
  totalLeaveTaken: 48.5,
  averageLeavePerEmployee: 6.1,
  employeesOnLeave: 4,
  pendingLeave: 3,
  highestUtilisation: { employee: 'Kumar Ravi', percent: 83 },
  lowBalanceEmployees: 2,
}

export const leaveTakenByEmployee = [
  { employee: 'Amanda Lee', role: 'Senior Executive', annual: 5.0, sick: 1.0, other: 0.0, totalTaken: 6.0, pending: 2.0, available: 10.0, utilisation: 38 },
  { employee: 'Kumar Ravi', role: 'Operations Executive', annual: 9.5, sick: 2.0, other: 1.0, totalTaken: 12.5, pending: 0.0, available: 2.5, utilisation: 83 },
  { employee: 'Nora Smith', role: 'Team Lead', annual: 6.5, sick: 1.0, other: 0.0, totalTaken: 7.5, pending: 3.0, available: 8.5, utilisation: 47 },
  { employee: 'Jason Lim', role: 'Operations Executive', annual: 4.0, sick: 3.0, other: 1.0, totalTaken: 8.0, pending: 1.0, available: 6.0, utilisation: 57 },
]

export const leaveTypeDistribution = [
  { type: 'Annual Leave', percent: 62 },
  { type: 'Sick Leave', percent: 21 },
  { type: 'Emergency Leave', percent: 9 },
  { type: 'Unpaid Leave', percent: 8 },
]

export const monthlyLeaveTrend = [
  { month: 'Jan', days: 6 },
  { month: 'Feb', days: 8 },
  { month: 'Mar', days: 7 },
  { month: 'Apr', days: 9 },
  { month: 'May', days: 13 },
  { month: 'Jun', days: 15 },
]

export const upcomingLeaveOverview = [
  { employee: 'Nora Smith', dates: '12, 13, 14 Oct 2026', duration: 3.0, type: 'Annual', status: 'Pending' },
  { employee: 'Jason Lim', dates: '13 Oct 2026', duration: 1.0, type: 'Sick', status: 'Approved' },
  { employee: 'Amanda Lee', dates: '18, 19 Oct 2026', duration: 2.0, type: 'Annual', status: 'Approved' },
]

export const lowBalanceHighUsage = [
  { employee: 'Kumar Ravi', available: 2.5, utilisation: 83, alert: 'High usage' },
  { employee: 'Jason Lim', available: 1.0, utilisation: 92, alert: 'Low balance' },
]

// Employee & role hierarchy (Team page)
export const orgHierarchy = {
  name: 'Sarah Lim',
  role: 'Operations Manager',
  reportsTo: 'Director',
  teamSize: '2 Team Leads',
  availability: 'Available',
  children: [
    {
      name: 'Nora Smith',
      role: 'Team Lead',
      reportsTo: 'Sarah Lim',
      teamSize: '4 Employees',
      availability: 'Leave 12–14 Oct',
      coverage: 'Amber',
      children: [
        { name: 'Amanda Lee', role: 'Senior Executive', reportsTo: 'Nora Smith', teamSize: '0', availability: 'Working', coverage: 'Primary Backup' },
        { name: 'Kumar Ravi', role: 'Operations Executive', reportsTo: 'Nora Smith', teamSize: '0', availability: 'Working', coverage: 'Secondary Backup' },
      ],
    },
  ],
}

export const employeeDetailLookup = {
  'Nora Smith': {
    id: 'EMP-014',
    role: 'Team Lead',
    group: 'Operations / Team A',
    reportsTo: 'Sarah Lim',
    directReports: 4,
    schedule: 'Mon–Fri',
    upcomingLeave: '12, 13, 14 Oct 2026',
    leaveBalance: 8.5,
    backup: 'Amanda Lee',
    staffing: 'Available',
  },
}

// Manager's own leave ("My Leave")
export const myLeaveSummary = {
  annualLeave: { available: 12, total: 18 },
  sickLeave: { available: 8, total: 10 },
  upcomingLeave: { days: 3, dates: '12, 13, 14 Oct 2026' },
  pendingRequests: 1,
}

export const myLeaveHistory = [
  { type: 'Annual Leave', dates: '12, 13, 14 Oct', duration: '3 days', status: 'Pending', requestId: 'LR-2026-01042' },
  { type: 'Sick Leave', dates: '2 Sep', duration: '1 day', status: 'Completed', requestId: 'LR-2026-00981' },
  { type: 'Annual Leave', dates: '18, 19 Aug', duration: '2 days', status: 'Rejected', requestId: 'LR-2026-00873' },
]

export const myPendingRequestDetail = {
  requestId: 'LR-2026-01042',
  type: 'Annual Leave',
  dates: '12, 13, 14 Oct',
  duration: '3 working days',
  submitted: '8 Oct 2026',
  currentBalance: 12,
  balanceIfApproved: 9,
  status: 'Pending Higher-Level Approval',
  approverStep: 'Pending Approval',
  submittedAt: '8 Oct · 9:42 AM',
}
