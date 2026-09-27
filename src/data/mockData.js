export const currentManager = {
  id: 'EMP-002',
  name: 'Jane Doe',
  initials: 'JD',
  role: 'IT Manager',
  email: 'jane.doe@company.com',
  group: 'Operations',
  scopeLabel: 'Operations + Warehouse',
  workingPattern: 'Mon–Fri',
  workingDays: [1,2,3,4,5],
  whatsapp: 'Linked',
}

export const kpis = {
  peopleScheduledToday: 38,
  onLeaveToday: { total: 5, annual: 3, mc: 2 },
  pendingApprovals: 8,
  coverageAlerts: 2,
}

export const weekAtAGlance = [
  { day: 'Mon', offCount: 2, status: 'Coverage OK', tone: 'good' },
  { day: 'Tue', offCount: 3, status: '1 conflict', tone: 'warn' },
  { day: 'Wed', offCount: 4, status: 'Coverage OK', tone: 'good' },
  { day: 'Thu', offCount: 5, status: 'Coverage alert', tone: 'bad' },
  { day: 'Fri', offCount: 2, status: 'Coverage OK', tone: 'good' },
]

export const coverageSettings = {
  minStaffingPerTeam: 5,
  maxPeopleOffAtOnce: 3,
  warnWhenCoverageLow: true,
  blockLeaveWhenLimitExceeded: true,
}

export const leaveRequests = [
  { id: 'LR-2026-01040', employee: 'Amanda Lee', role: 'Senior Executive', team: 'Operations / Team A', dates: ['12 Oct 2026', '13 Oct 2026', '14 Oct 2026'], type: 'Annual', impact: 'Low', status: 'Pending Approval' },
  { id: 'LR-2026-01041', employee: 'Kumar Ravi', role: 'Operations Executive', team: 'Operations / Team A', dates: ['13 Oct 2026'], type: 'MC', impact: 'Medium', status: 'Pending Approval' },
  { id: 'LR-2026-01042', employee: 'Nora Smith', role: 'Team Lead', team: 'Operations / Team A', dates: ['15 Oct 2026', '16 Oct 2026', '17 Oct 2026', '18 Oct 2026'], type: 'Emergency', impact: 'High', status: 'Pending Approval', minStaffingRequired: 8, currentAvailable: 7, shortageIfApproved: 1, coverageStatus: 'Amber', primaryBackup: 'Amanda Lee', secondaryBackup: 'Kumar Ravi' },
  { id: 'LR-2026-01043', employee: 'Jason Lim', role: 'Operations Executive', team: 'Operations / Team A', dates: ['20 Oct 2026'], type: 'Unpaid', impact: 'Low', status: 'Pending Approval' },
]

export const coverageHierarchy = {
  name: 'Nora Smith', role: 'Team Lead', status: 'Working', team: 'Operations / Team A',
  children: [
    {
      name: 'Amanda Lee', role: 'Senior Executive', status: 'Available', canCover: 'Yes', workload: 'Medium',
      children: [
        { name: 'Kumar Ravi', role: 'Operations Executive', status: 'Available', canCover: 'Partial', workload: 'High', children: [] },
        {
          name: 'Jason Lim', role: 'Operations Executive', status: 'On Leave', onLeaveDate: '13 Oct 2026', canCover: 'No',
          children: [{ name: 'Mia Tan', role: 'Support Executive', status: 'Available', canCover: 'Support Tasks', workload: 'Low', children: [] }],
        },
      ],
    },
  ],
}

export const coverageReplacementAnalysis = [
  { employee: 'Amanda Lee', role: 'Senior Executive', canCover: 'Yes', coverageType: 'Full Replacement', availability: 'Available', notes: 'Best replacement' },
  { employee: 'Kumar Ravi', role: 'Operations Executive', canCover: 'Partial', coverageType: 'Shared Coverage', availability: 'Available', notes: 'High workload' },
  { employee: 'Jason Lim', role: 'Operations Executive', canCover: 'No', coverageType: 'Not Available', availability: 'On Leave', notes: 'On leave 13 Oct 2026' },
  { employee: 'Mia Tan', role: 'Support Executive', canCover: 'Partial', coverageType: 'Support Tasks', availability: 'Available', notes: 'Can help with routine tasks' },
]

export const teamStaffingImpact = [
  { date: '15 Oct 2026', required: 8, available: 7, ifApproved: 6, result: -1, status: 'Amber' },
  { date: '16 Oct 2026', required: 8, available: 7, ifApproved: 5, result: -3, status: 'Red' },
  { date: '17 Oct 2026', required: 8, available: 7, ifApproved: 6, result: -1, status: 'Amber' },
]

export const coverageRecommendation = 'Approve with Amanda Lee assigned as primary replacement. Keep Mia Tan as support coverage and flag the highest-risk day for staffing review.'

export const calendarWeek = {
  weekLabel: 'Mon 12 — Sun 18 Oct 2026',
  days: ['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16', 'Sat 17', 'Sun 18'],
  rows: [
    { employee: 'Amanda Lee', team: 'Operations', entries: { 'Tue 13': 'Annual leave', 'Wed 14': 'Annual leave', 'Thu 15': 'Annual leave' } },
    { employee: 'Kumar Ravi', team: 'Operations', entries: { 'Thu 15': 'MC leave', 'Fri 16': 'MC leave' } },
    { employee: 'Nora Smith', team: 'Operations', entries: { 'Mon 12': 'Pending', 'Tue 13': 'Pending' } },
    { employee: 'Jason Lim', team: 'Operations', entries: { 'Thu 15': 'Unpaid' } },
    { employee: 'Priya Menon', team: 'Warehouse', entries: { 'Wed 14': 'Maternity', 'Thu 15': 'Maternity', 'Fri 16': 'Maternity' } },
  ],
}

export const employees = [
  { id:'EMP-001', name:'Sarah Lim', role:'Operations Manager', department:'Operations', reportsTo:'Director', workPattern:'Mon–Fri', availability:'Available', annual:[8,18], mc:[1.5,14], maternity:[0,12], unpaid:[0,12], balance:8.5, level:1 },
  { id:'EMP-014', name:'Nora Smith', role:'Team Lead', department:'Operations', reportsTo:'Sarah Lim', workPattern:'Mon–Fri', availability:'Working', annual:[10,18], mc:[1,14], maternity:[0,12], unpaid:[0.5,12], balance:6.5, level:2 },
  { id:'EMP-015', name:'Amanda Lee', role:'Senior Executive', department:'Operations', reportsTo:'Nora Smith', workPattern:'Mon–Fri', availability:'Working', annual:[6,18], mc:[2,14], maternity:[1.5,12], unpaid:[1,12], balance:7.5, level:3 },
  { id:'EMP-016', name:'Kumar Ravi', role:'Operations Executive', department:'Operations', reportsTo:'Amanda Lee', workPattern:'Mon–Fri', availability:'Working', annual:[12.5,18], mc:[2,14], maternity:[0,12], unpaid:[0,12], balance:3.5, level:4 },
  { id:'EMP-017', name:'Jason Lim', role:'Operations Executive', department:'Operations', reportsTo:'Amanda Lee', workPattern:'Mon–Fri', availability:'On Leave', annual:[8,18], mc:[3,14], maternity:[0,12], unpaid:[1,12], balance:6, level:4 },
  { id:'EMP-018', name:'Mia Tan', role:'Support Executive', department:'Operations', reportsTo:'Jason Lim', workPattern:'Mon–Fri', availability:'Working', annual:[7,18], mc:[1,14], maternity:[0,12], unpaid:[0,12], balance:10, level:5 },
  { id:'EMP-020', name:'Raj Kumar', role:'Warehouse Manager', department:'Warehouse', reportsTo:'Director', workPattern:'Mon–Fri', availability:'Available', annual:[12,18], mc:[0.5,14], maternity:[0,12], unpaid:[0,12], balance:5.5, level:1 },
  { id:'EMP-021', name:'Priya Menon', role:'Shift Lead', department:'Warehouse', reportsTo:'Raj Kumar', workPattern:'Rotating Shift', availability:'Working', annual:[6,18], mc:[1,14], maternity:[0,12], unpaid:[0,12], balance:11, level:2 },
  { id:'EMP-022', name:'Arjun Das', role:'Technician', department:'Warehouse', reportsTo:'Priya Menon', workPattern:'Shift A', availability:'On Leave', annual:[8,18], mc:[2,14], maternity:[0,12], unpaid:[0,12], balance:8, level:3 },
  { id:'EMP-023', name:'Kavitha Rao', role:'Technician', department:'Warehouse', reportsTo:'Priya Menon', workPattern:'Shift B', availability:'Working', annual:[5,18], mc:[1,14], maternity:[0,12], unpaid:[0,12], balance:12, level:3 },
]

export const orgTree = [
  {
    id:'operations', label:'Operations', type:'department', children:[
      { id:'sarah', label:'Sarah Lim', role:'Operations Manager', children:[
        { id:'nora', label:'Nora Smith', role:'Team Lead', children:[
          { id:'amanda', label:'Amanda Lee', role:'Senior Executive', children:[
            { id:'kumar', label:'Kumar Ravi', role:'Operations Executive', children:[] },
            { id:'jason', label:'Jason Lim', role:'Operations Executive', children:[
              { id:'mia', label:'Mia Tan', role:'Support Executive', children:[] },
            ] },
          ] },
        ] },
      ] },
    ]
  },
  {
    id:'warehouse', label:'Warehouse', type:'department', children:[
      { id:'raj', label:'Raj Kumar', role:'Warehouse Manager', children:[
        { id:'priya', label:'Priya Menon', role:'Shift Lead', children:[
          { id:'arjun', label:'Arjun Das', role:'Technician', children:[] },
          { id:'kavitha', label:'Kavitha Rao', role:'Technician', children:[] },
        ] },
      ] },
    ]
  },
]

export const leaveDashboardSummary = {
  totalLeaveTaken: 48.5,
  averageLeavePerEmployee: 6.1,
  employeesOnLeave: 4,
  pendingLeave: 3,
  lowBalanceEmployees: 2,
  highestMc: { employee: 'Jason Lim', days: 3.0 },
  unpaidTotal: 4.5,
  highestUtilisation: { employee: 'Kumar Ravi', percent: 83 },
}

export const leaveTakenByEmployee = [
  { employee:'Amanda Lee', role:'Senior Executive', annual:5, mc:1, other:0, totalTaken:6, pending:2, available:10, utilisation:38 },
  { employee:'Kumar Ravi', role:'Operations Executive', annual:9.5, mc:2, other:1, totalTaken:12.5, pending:0, available:2.5, utilisation:83 },
  { employee:'Nora Smith', role:'Team Lead', annual:6.5, mc:1, other:0, totalTaken:7.5, pending:3, available:8.5, utilisation:47 },
  { employee:'Jason Lim', role:'Operations Executive', annual:4, mc:3, other:1, totalTaken:8, pending:1, available:6, utilisation:57 },
]

export const leaveTypeDistribution = [
  { type:'Annual Leave', days:28.5 },
  { type:'MC Leave', days:8.5 },
  { type:'Emergency Leave', days:3.5 },
  { type:'Maternity Leave', days:3.5 },
  { type:'Unpaid Leave', days:4.5 },
]

export const monthlyLeaveTrend = [
  { month:'Jan', days:8 }, { month:'Feb', days:10 }, { month:'Mar', days:9 },
  { month:'Apr', days:11 }, { month:'May', days:13 }, { month:'Jun', days:17 },
]

export const upcomingLeaveOverview = [
  { employee:'Nora Smith', dates:'15–18 Oct 2026', duration:2.0, type:'Annual', status:'Pending' },
  { employee:'Jason Lim', dates:'20 Oct 2026', duration:1.0, type:'MC', status:'Approved' },
  { employee:'Amanda Lee', dates:'22–23 Oct 2026', duration:2.0, type:'Annual', status:'Approved' },
]

export const lowBalanceHighUsage = [
  { employee:'Kumar Ravi', available:2.5, utilisation:83, alert:'High usage' },
  { employee:'Jason Lim', available:1.0, utilisation:92, alert:'Low balance' },
]

export const myLeaveSummary = {
  annualLeave:{ available:12, total:18 },
  mcLeave:{ available:8, total:10 },
  upcomingLeave:{ days:3, dates:'12, 13, 14 Oct 2026' },
  pendingRequests:1,
}

export const myLeaveHistory = [
  { type:'Annual Leave', dates:'12, 13, 14 Oct', duration:'3 days', status:'Pending', requestId:'LR-2026-02001' },
  { type:'MC Leave', dates:'2 Sep', duration:'1 day', status:'Completed', requestId:'LR-2026-00981' },
  { type:'Annual Leave', dates:'18, 19 Aug', duration:'2 days', status:'Rejected', requestId:'LR-2026-00873' },
]

export const myPendingRequestDetail = {
  requestId:'LR-2026-02001', type:'Annual Leave', dates:'12, 13, 14 Oct', duration:'3 working days', submitted:'8 Oct 2026',
  currentBalance:12, balanceIfApproved:9, status:'Pending Higher-Level Approval', submittedAt:'8 Oct · 9:42 AM',
}
