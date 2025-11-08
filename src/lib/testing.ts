export const TESTING_MODE = process.env.NODE_ENV === 'development';

export const mockData = {
  users: [
    {
      id: '1',
      email: 'admin@masonvector.com',
      role: 'admin',
      full_name: 'System Administrator',
      status: 'active'
    },
    {
      id: '2', 
      email: 'john.doe@example.com',
      role: 'user',
      full_name: 'John Doe',
      status: 'active'
    }
  ],
  claimants: [
    {
      id: '1',
      full_name: 'Sarah Johnson',
      address: '123 Main St, Sydney NSW 2000',
      amount: 1250.00,
      status: 'contacted',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      full_name: 'Michael Chen',
      address: '456 Oak Ave, Melbourne VIC 3000',
      amount: 890.50,
      status: 'in_progress',
      created_at: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: '1',
      title: 'Follow up with Sarah Johnson',
      description: 'Check document submission status',
      priority: 'high',
      due_date: new Date().toISOString(),
      status: 'pending'
    }
  ],
  metrics: {
    totalClaimants: 2145,
    openClaims: 348,
    totalValue: 12750000,
    successRate: 78.5
  },
  reminders: [
    {
      id: '1',
      title: 'Review Johnson case documents',
      date: 'Tomorrow 2:00 PM',
      type: 'Document'
    },
    {
      id: '2', 
      title: 'Follow up with Chen family',
      date: 'Friday 10:00 AM',
      type: 'Contact'
    }
  ]
};