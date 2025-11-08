# Mason Vector — System Access Control Matrix (ACM) v1

## 🔒 Complete Role-Based Access Control System

This document defines the comprehensive access control matrix for the Mason Vector platform, serving as the definitive reference for all security policies, database constraints, and API permissions.

---

## 📋 Access Control Matrix

| System Area | Function / Endpoint / Table | Admin | Manager | Contractor | Client | Notes |
|------------|----------------------------|-------|---------|------------|--------|-------|
| **Users** | `/api/users`, `users` table | R/W/D | R/W | R (self) | R (self) | Admins manage all users; managers can update non-admins |
| **Auth / Sessions** | `/api/auth`, `sessions` table | R/W/D | R/W | R/W (own session) | R/W (own session) | All roles can log in/out; only admins view sessions |
| **Claimants** | `/api/claimants`, `claimants` table | R/W/D | R/W | R (assigned_to=self), W (notes/status) | R (self only) | Row-level security enforced by role |
| **Claims** | `/api/claims`, `claims` table | R/W/D | R/W | R (linked to assigned claimants) | R (linked to own claimant record) | Sensitive data hidden from non-admins |
| **Tasks** | `/api/tasks`, `tasks` table | R/W/D | R/W | R/W (own tasks) | ❌ | Contractors can update progress; clients can't see tasks |
| **Timesheets** | `/api/timesheets`, `timesheets` table | R/W/D | R/W | R/W (own) | ❌ | Contractors record hours; admins approve |
| **Documents** | `/api/documents`, `client_documents` table | R/W/D | R/W | ❌ | R/W (own) | Clients upload ID, proof of address, etc. |
| **Messages / Chat** | `/api/messages`, `messages` table | R/W/D | R/W | R/W (with admin only) | R/W (with admin only) | Cross-portal chat restricted; all messages logged |
| **Email Templates** | `/api/email-templates`, `email_templates` table | R/W | R | ❌ | ❌ | Controlled repository of system-approved templates |
| **SMS Templates** | `/api/sms-templates`, `sms_templates` table | R/W | R | R (read only) | ❌ | Contractors use pre-approved templates only |
| **Audit Logs** | `/api/audit`, `audit_logs` table | R/W | R | ❌ | ❌ | Admins see everything; clients and contractors cannot |
| **Admin Chat Audit** | `/api/admin-chat`, `admin_chat_audit` | R/W | R | ❌ | ❌ | System logging for Admin Chat queries |
| **Policies / Docs** | `/api/policies`, `public/docs` | R/W | R | R | R | Clients view; admins maintain |
| **Portal Creation** | `/api/create-portal` | R/W | ❌ | ❌ | ❌ | Only admins can issue or revoke invites |
| **Invite Verification** | `/invite/[token]` | — | — | — | — | Public route with token check and enforced expiry |
| **Sentinel Logs** | `/api/sentinel` | R | R | ❌ | ❌ | Read-only access for monitoring security incidents |
| **System Tester Hooks** | `/api/tester` | R/W | R/W | — | — | Used for automated validation of role enforcement |

---

## 🔒 Legend

- **R** = Read
- **W** = Write / Update  
- **D** = Delete
- **❌** = No access
- **All table-level access is subject to RLS (Row-Level Security) enforcement**

---

## 🧠 Cross-System Role Definitions

### 👑 Admin
- **Full system control** - Complete access to all functions and data
- **Can impersonate lower-level roles** for testing (audited)
- **Override access** to Sentinel reports and configuration
- **Portal creation authority** - Issue and revoke user invites
- **System configuration** - Modify templates, policies, and settings

### 👔 Manager  
- **Operational oversight** but cannot modify roles or create portals
- **Approves timesheets**, updates claim statuses, manages staff communications
- **Read access to audit logs** for operational monitoring
- **Cannot delete users** or modify admin-level settings
- **Limited to non-admin user management**

### 🔧 Contractor
- **Limited to contact verification** and updates on assigned claimants
- **May use messaging, SMS, or email templates** but cannot view financial data
- **Cannot access audit logs** or administrative functions
- **Session management** limited to own sessions only
- **Task management** for assigned work only

### 👤 Client
- **Limited to their own data** - strict data isolation enforced
- **Can upload documents**, view claim progress, message admin
- **Cannot see internal workflow** or other users' data
- **No access to system administration** or operational data
- **Document management** for verification materials only

---

## 🧩 Multi-Layer Enforcement Architecture

| Layer | Mechanism | Responsibility |
|-------|-----------|----------------|
| **Frontend** | Role-based routing middleware (`/middleware.ts`) | Prevents UI access to restricted pages |
| **Backend API** | JWT claims + session role verification | Denies unauthorized API calls |
| **Database** | Row-Level Security (RLS) policies | Prevents direct data access |
| **Sentinel AI** | Real-time packet & API monitoring | Flags suspicious or forbidden access |
| **System Tester AI** | Scheduled test suite | Ensures all endpoints respect ACM rules |

---

## 🛡️ Security Implementation Patterns

### Frontend Route Protection
```typescript
// middleware/roleGuard.ts
export function withRoleAccess(allowedRoles: Role[]) {
  return (req: NextRequest) => {
    const userRole = getUserRole(req);
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect('/unauthorized');
    }
  };
}
```

### API Access Control
```typescript
// middleware/apiAccessGuard.ts
if (role === "contractor" && !endpoint.startsWith("/api/contractor")) {
  return NextResponse.json({ error: "Access denied" }, { status: 403 });
}

if (role === "client" && !isOwnResource(userId, resourceId)) {
  return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
}
```

### Database Row-Level Security
```sql
-- Client claims access policy
CREATE POLICY client_claims_policy
ON claims
FOR SELECT
USING (
  current_setting('app.current_role') = 'client'
  AND claimant_id IN (SELECT id FROM claimants WHERE email = current_setting('app.current_email'))
);

-- Contractor claimant access policy
CREATE POLICY contractor_claimants_policy
ON claimants
FOR SELECT
USING (
  current_setting('app.current_role') = 'contractor'
  AND assigned_to::text = current_setting('app.current_user_id')
);

-- Admin full access policy
CREATE POLICY admin_full_access
ON ALL TABLES
FOR ALL
USING (current_setting('app.current_role') = 'admin');
```

---

## 📊 Access Matrix Implementation Status

### ✅ Implemented Components
- [x] **User Management APIs** - Role-based CRUD with admin/manager restrictions
- [x] **Authentication System** - JWT with role verification
- [x] **Contractor Portal** - Assigned claimant access only
- [x] **Admin Portal** - Full system control and audit access
- [x] **Database RLS Policies** - Contractor and admin table-level security
- [x] **Audit Logging** - Admin/manager access with role restrictions

### 🔄 In Progress
- [ ] **Client Portal** - Self-data access with document upload
- [ ] **Manager Portal** - Operational oversight without admin privileges
- [ ] **Template Management** - Role-based email/SMS template access
- [ ] **Task Management System** - Contractor task assignment and tracking
- [ ] **Timesheet System** - Contractor hour recording with admin approval

### ⏳ Pending Implementation
- [ ] **Document Management** - Client document upload with admin access
- [ ] **Cross-Portal Messaging** - Restricted admin-only communication
- [ ] **Sentinel Integration** - Real-time access monitoring
- [ ] **System Tester Hooks** - Automated ACM validation
- [ ] **Policy Document System** - Role-based document access

---

## 🔐 Security Validation Framework

### Automated Testing Matrix
```json
{
  "testSuites": {
    "roleAccess": {
      "admin": ["ALL_ENDPOINTS"],
      "manager": ["USER_MGMT", "AUDIT_READ", "OPERATIONAL"],
      "contractor": ["ASSIGNED_CLAIMANTS", "OWN_TASKS", "TEMPLATES_READ"],
      "client": ["OWN_DATA", "DOCUMENT_UPLOAD", "CLAIM_VIEW"]
    },
    "restrictedAccess": {
      "contractor": ["AUDIT_LOGS", "USER_CREATION", "ADMIN_SETTINGS"],
      "client": ["ALL_ADMIN", "OTHER_USERS", "SYSTEM_CONFIG"],
      "manager": ["PORTAL_CREATION", "ADMIN_OVERRIDE", "ROLE_MODIFICATION"]
    }
  }
}
```

### Compliance Monitoring
- **Real-time access logging** - Every API call logged with role verification
- **Failed access attempts** - Security event generation for blocked requests  
- **Role escalation detection** - Sentinel monitoring for privilege violations
- **Audit trail integrity** - Tamper-proof logging with cryptographic signatures

---

## 🎯 Integration Points

### Sentinel AI Integration
- **Policy enforcement engine** ingests ACM as reference model
- **Real-time monitoring** flags violations against matrix rules
- **Behavioral analysis** detects unusual access patterns
- **Automated response** blocks suspicious activity immediately

### System Tester AI Integration  
- **Automated validation** tests every endpoint against ACM permissions
- **Role simulation** verifies access boundaries work correctly
- **Regression testing** ensures updates don't break security model
- **Compliance reporting** generates evidence for security audits

### Future Enhancement Hooks
- **Dynamic role assignment** - Temporary elevated access with audit
- **Context-aware permissions** - Location/time-based access controls
- **Multi-factor gate** - Additional verification for sensitive operations
- **API rate limiting** - Role-based request throttling and quotas

---

## 📈 Business Impact

### Security Benefits
- **Zero-trust architecture** - Verify every request at multiple layers
- **Compliance ready** - Audit-grade access control and logging
- **Scalable permissions** - Role-based system grows with organization
- **Automated enforcement** - Reduces human error in access management

### Operational Benefits
- **Clear responsibility boundaries** - Roles define exact capabilities
- **Reduced support burden** - Users can't access what they shouldn't
- **Audit efficiency** - Complete access trail for compliance reviews
- **System reliability** - Prevents data corruption from unauthorized changes

### Technical Benefits
- **Performance optimization** - Database queries filtered by role automatically
- **Integration simplicity** - ACM serves as single source of truth
- **Testing automation** - Systematic validation of all access patterns
- **Maintenance efficiency** - Centralized permission management

---

**Status**: Foundation implemented, comprehensive ACM ready for Sentinel AI and System Tester AI integration.

**Next Phase**: Template management system, client portal implementation, and automated compliance validation.