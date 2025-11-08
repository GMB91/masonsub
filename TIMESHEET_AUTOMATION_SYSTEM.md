# Mason Vector — Timesheet Automation System (v1)

## 🎯 Overview

**Purpose**: Automatically log work sessions for users and managers based on real app activity, allow daily edits, and submit weekly to Admin for approval and payment.

**Core Tables**: `timesheets`, `timesheet_entries`, `audit_logs`

**Integration Points**: Xero Payroll API, Supabase RLS, ACM enforcement

---

## 🔄 System Workflow

### 1️⃣ **Event-Based Time Capture**

**Trigger**: When a user or manager logs in and opens a client file (claimants or claims page)

**Automatic Actions**:
1. Create `timesheet_entries` record if none exists for that day
2. Log activity every time they open/close a client file
3. Update finish time on logout or session timeout
4. Calculate total hours automatically

**SQL Operations**:
```sql
-- Create daily entry
INSERT INTO timesheet_entries (user_id, date, start_time)
VALUES (:user_id, CURRENT_DATE, NOW())
ON CONFLICT (user_id, date) DO NOTHING;

-- Log client file access
INSERT INTO audit_logs (actor_id, action, entity, created_at)
VALUES (:user_id, 'ACCESS_CLIENT_FILE', :client_id, NOW());

-- Update finish time on logout
UPDATE timesheet_entries
SET finish_time = NOW(), 
    total_hours = EXTRACT(EPOCH FROM (NOW() - start_time)) / 3600
WHERE user_id = :user_id AND date = CURRENT_DATE;
```

### 2️⃣ **User/Manager Adjustment Window**

**UI Panel**: `/timesheets`

**Capabilities**:
- View all auto-captured start and finish times
- Manually edit start/finish times (for offline work or calls)
- Add daily notes ("Worked from home", "Phone follow-up", etc.)
- Real-time total hours calculation

**Audit Trail**:
```sql
INSERT INTO audit_logs (actor_id, action, entity, details)
VALUES (:user_id, 'TIMESHEET_EDIT', 'timesheet_entries', 
        '{"field":"finish_time", "old_value":"17:30", "new_value":"18:00"}');
```

### 3️⃣ **Weekly Roll-Up (Auto-Submission)**

**Schedule**: Cron job runs every Monday 08:00 AEST

**Process**:
1. Collate all unsubmitted entries for previous week
2. Create summary timesheet records
3. Mark individual entries as submitted
4. Send notification to Admin

**SQL Workflow**:
```sql
-- Create weekly summary
INSERT INTO timesheets (user_id, week_start, total_hours, claim_count, approved)
SELECT user_id, 
       date_trunc('week', date) AS week_start,
       SUM(total_hours), 
       COUNT(DISTINCT client_id), 
       FALSE
FROM timesheet_entries
WHERE submitted = FALSE
GROUP BY user_id, week_start;

-- Mark entries as submitted
UPDATE timesheet_entries 
SET submitted = TRUE 
WHERE submitted = FALSE;
```

### 4️⃣ **Admin Approval Stage**

**Interface**: `/admin/timesheets`

**Admin Actions**:
- Review weekly submissions
- Approve timesheets
- Trigger Xero integration
- Download audit reports

**Approval Process**:
```sql
-- Approve timesheet
UPDATE timesheets 
SET approved = TRUE, approved_at = NOW() 
WHERE id = :id;

-- Log approval
INSERT INTO audit_logs (actor_id, action, entity, details)
VALUES (:admin_id, 'TIMESHEET_APPROVED', 'timesheets', '{"id":":id"}');
```

### 5️⃣ **Xero Integration (Payment Automation)**

**Trigger**: `TIMESHEET_APPROVED` event

**Payload Format**:
```json
{
  "employeeEmail": "casey@masonvector.ai",
  "date": "2025-11-03",
  "hours": 32.5,
  "description": "Mason Vector Portal Activity Week 45"
}
```

**API Endpoint**: `/payroll.xero.com/api.xro/2.0/Timesheets`

**Error Handling**: Failed API calls logged and retried automatically

---

## 📊 Data Model

### **timesheet_entries** Table
```sql
CREATE TABLE timesheet_entries (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE,
  start_time TIMESTAMP,
  finish_time TIMESTAMP,
  total_hours NUMERIC,
  client_id UUID REFERENCES claimants(id),
  notes TEXT,
  submitted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **timesheets** Table
```sql
CREATE TABLE timesheets (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  week_start DATE,
  total_hours NUMERIC,
  claim_count INT,
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP,
  exported_to_xero BOOLEAN DEFAULT FALSE,
  xero_timesheet_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🖥️ Dashboard UI Specification

### **User/Manager View** (`/timesheets`)

```
┌─────────────────────────────────────────────┐
│ Mason Vector – Weekly Timesheet             │
├─────────────────────────────────────────────┤
│ [ Current Week Selector ▼ ]   [ Export CSV ]│
├─────────────────────────────────────────────┤
│ Mon | Tue | Wed | Thu | Fri | Sat | Sun     │
│---------------------------------------------│
│ Start Time     Finish Time     Total Hours  │
│---------------------------------------------│
│ Editable cells (auto-filled from activity)  │
│---------------------------------------------│
│ Notes: [text area]                          │
│---------------------------------------------│
│  Total Hours This Week: 34.5                │
│---------------------------------------------│
│  [ Submit to Admin ]  (disabled until Fri)  │
└─────────────────────────────────────────────┘
```

**Features**:
- ✅ Automatic population from `timesheet_entries`
- ✅ Editable start/finish times with validation
- ✅ Real-time total hours calculation
- ✅ Daily notes with audit trail
- ✅ Week navigation and CSV export
- ✅ Visual indicators for missing/overtime entries

### **Admin Approval Panel** (`/admin/timesheets`)

```
┌────────────────────────────────────────────────────┐
│ Weekly Timesheet Submissions                       │
├────────────────────────────────────────────────────┤
│ Filters: [ Week ▼ ] [ Status ▼ ] [ Search User ]  │
│----------------------------------------------------│
│ User         | Week Start | Hours | Claims | Status | Action  │
│----------------------------------------------------│
│ Casey Bennett| 03 Nov 2025| 32.5  | 7      | Pending| ✅ Approve │
│ Jordan Cole  | 03 Nov 2025| 28.0  | 5      | Pending| ✅ Approve │
│ Taylor Rees  | 03 Nov 2025| 41.0  | 10     | Approved| ✔ Paid   │
└────────────────────────────────────────────────────┘
```

**Status Colors**:
- 🟡 **Pending** - Awaiting admin review
- 🟢 **Approved** - Sent to Xero successfully  
- 🔴 **Flagged** - Manual review required (overtime, etc.)

---

## 🔐 Security & Access Control

### **Role-Based Permissions**
| Role | Actions | Interface |
|------|---------|-----------|
| **User** | Edit own timesheets, add notes, submit weekly | `/timesheets` |
| **Manager** | View/edit own + subordinates' timesheets | `/timesheets` |
| **Admin** | View all, approve, export, Xero integration | `/admin/timesheets` |

### **RLS Policies**
```sql
-- Users can only see their own timesheet entries
CREATE POLICY timesheet_entries_user_policy ON timesheet_entries
FOR ALL USING (user_id = get_current_user_id());

-- Admins can see all timesheet entries
CREATE POLICY timesheet_entries_admin_policy ON timesheet_entries
FOR ALL USING (get_current_user_role() = 'admin');

-- Managers can see subordinates' entries
CREATE POLICY timesheet_entries_manager_policy ON timesheet_entries
FOR SELECT USING (
  get_current_user_role() = 'manager' AND
  user_id IN (SELECT id FROM users WHERE manager_id = get_current_user_id())
);
```

### **Automated Monitoring**
- **Sentinel AI**: Monitors for unusual sessions (>12 hrs, duplicates)
- **System Tester AI**: Verifies weekly roll-up and Xero triggers
- **Auto-logout**: Prevents indefinitely open sessions

---

## 🔔 Notifications & Automation

### **Email Notifications**
- **Friday 4 PM**: "Please review and submit your timesheet"
- **Monday 8 AM**: Auto-submission if not manually sent
- **Admin Alert**: "X timesheets pending approval"

### **Cron Jobs**
- **Monday 08:00 AEST**: Weekly submission automation
- **Daily 23:59**: Session cleanup (close open entries)
- **Weekly**: Xero sync verification and retry failed exports

---

## 🚀 Implementation Phases

### **Phase 1**: Database Foundation
- ✅ Create timesheet tables with proper relationships
- ✅ Implement RLS policies for multi-role access
- ✅ Add audit trail integration

### **Phase 2**: Event Capture System
- ✅ Client file access tracking hooks
- ✅ Automatic start/finish time logging
- ✅ Session management integration

### **Phase 3**: User Interface
- ✅ Build `/timesheets` dashboard with edit capabilities
- ✅ Implement week navigation and CSV export
- ✅ Add real-time validation and calculations

### **Phase 4**: Admin Panel
- ✅ Create `/admin/timesheets` approval interface
- ✅ Build filtering and bulk operations
- ✅ Implement approval workflow

### **Phase 5**: Automation & Integration
- ✅ Weekly roll-up cron job
- ✅ Xero API integration and error handling
- ✅ Email notification system

---

## 📈 Benefits Delivered

### **For Users**:
- ✅ **Zero Manual Entry** - Automatic time tracking based on actual work
- ✅ **Flexible Adjustments** - Edit times for calls, offline work
- ✅ **Clear Visibility** - See exactly what will be submitted
- ✅ **Simple Workflow** - Review and submit weekly

### **For Managers**:
- ✅ **Team Oversight** - View subordinate timesheets
- ✅ **Accurate Reporting** - Based on real system activity
- ✅ **Compliance Monitoring** - Overtime and missing day alerts

### **For Admins**:
- ✅ **Streamlined Approval** - Bulk approve with confidence
- ✅ **Automated Payroll** - Direct Xero integration
- ✅ **Complete Audit Trail** - Every change logged and tracked
- ✅ **Compliance Ready** - Export capabilities for reviews

### **For Business**:
- ✅ **Accurate Billing** - Time tied to actual client work
- ✅ **Reduced Administration** - Automated submission and approval
- ✅ **Compliance Assurance** - Complete audit trail and controls
- ✅ **Integrated Workflow** - Seamless payroll processing

---

## 🔧 Optional Enhancements (v2)

- **Live Timer Component** - Shows running session time in UI
- **Per-Task Tracking** - Tie hours directly to specific claims
- **Manager Reports** - Weekly team summary PDFs
- **Mobile App Support** - Clock in/out from mobile devices
- **Project Categories** - Different billing rates per work type
- **Overtime Alerts** - Real-time notifications for compliance
- **Time Visualization** - Charts for productivity trends
- **Approval Workflows** - Multi-level approval for large timesheets

---

This comprehensive timesheet automation system eliminates manual timekeeping while ensuring accuracy, compliance, and seamless integration with existing Mason Vector workflows and payroll systems.