# Mason Vector - Real-Time Message Alert System (v1)

## 🧠 Overview

The Real-Time Message Alert System provides instant, persistent notifications for new messages across all user types (Admin, Contractor, Client). The system combines database triggers, Supabase Realtime, and React components to deliver a seamless notification experience.

## 🏗️ Architecture

### Database Layer
- **`message_alerts`** table tracks unread message notifications
- **`notification_preferences`** table stores user notification settings  
- **Database triggers** automatically create alerts when new messages are inserted
- **RLS policies** ensure users only see their own alerts
- **Cleanup functions** prevent alert table bloat

### Backend Layer
- **Supabase Realtime** subscription for instant alert delivery
- **API endpoints** for alert management (`/api/message-alerts`)
- **Database functions** for efficient bulk operations
- **Sentinel monitoring** for alert spam detection

### Frontend Layer
- **React hooks** for real-time alert management
- **Persistent popup** notifications with role-based styling
- **Notification center** for viewing all alerts
- **Preferences panel** for user customization
- **Sound notifications** with quiet hours support

## 📊 Implementation Details

### 1. Database Schema

```sql
-- Main alerts table
CREATE TABLE message_alerts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message_id UUID NOT NULL REFERENCES messages(id),
  is_read BOOLEAN DEFAULT FALSE,
  alert_type VARCHAR(50) DEFAULT 'message',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE NULL,
  UNIQUE(user_id, message_id)
);

-- User preferences
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email_alerts BOOLEAN DEFAULT TRUE,
  sound_alerts BOOLEAN DEFAULT TRUE,
  popup_alerts BOOLEAN DEFAULT TRUE,
  digest_frequency VARCHAR(20) DEFAULT 'daily',
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00'
);
```

### 2. Automatic Alert Creation

```sql
-- Trigger function creates alerts for new messages
CREATE OR REPLACE FUNCTION create_message_alert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO message_alerts (user_id, message_id, alert_type)
  VALUES (
    NEW.recipient_id, 
    NEW.id,
    CASE 
      WHEN NEW.priority = 'urgent' THEN 'urgent'
      WHEN NEW.sender_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin') THEN 'system'
      ELSE 'message'
    END
  )
  ON CONFLICT (user_id, message_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_alert_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_alert();
```

### 3. Real-Time Subscription

```typescript
// Subscribe to new alerts
const channel = supabase
  .channel('message_alerts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'message_alerts',
      filter: `user_id=eq.${session.user.id}`
    },
    (payload) => {
      // Show popup notification
      showAlert(payload.new);
      
      // Play sound if enabled
      if (preferences?.sound_alerts) {
        playNotificationSound(payload.new.alert_type);
      }
    }
  )
  .subscribe();
```

### 4. Popup Alert Component

```typescript
export function MessageAlertPopup({ alert, onDismiss, onOpenMessage }) {
  return (
    <div className={`fixed bottom-4 right-4 text-white shadow-xl rounded-xl p-4 w-80 z-50 
                    ${getAlertStyle(alert.alert_type)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getIcon(alert.alert_type)}
          <span className="font-semibold">New Message from Mason Vector</span>
        </div>
        <button onClick={onDismiss}>
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="mb-3">
        <div className="text-sm opacity-90">
          {alert.message?.content?.substring(0, 100)}...
        </div>
      </div>
      
      <button
        onClick={() => onOpenMessage(alert.message_id)}
        className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 rounded-lg"
      >
        Open Message
      </button>
    </div>
  );
}
```

## 🎨 Role-Based Styling

### Alert Colors by Type
- **Message** (default): Indigo (`bg-indigo-600`)
- **Urgent**: Red (`bg-red-600`) with pulse animation
- **System** (from admin): Blue (`bg-blue-600`) 
- **Reminder**: Yellow (`bg-yellow-600`)

### Portal Integration
- **Admin Portal**: Standard styling with gray theme
- **Contractor Portal**: Blue accent theme with limit indicators
- **Client Portal**: Green accent theme with simplified UI

## ⚙️ Features

### Core Functionality
✅ **Instant Delivery**: Sub-second notification delivery via Supabase Realtime  
✅ **Persistent Alerts**: Alerts remain until user acknowledges them  
✅ **Offline Recovery**: Unread alerts reappear on next login  
✅ **Auto-dismiss**: Popups auto-close after 10 seconds  
✅ **Sound Notifications**: Different sounds for different alert types  

### User Preferences
✅ **Popup Control**: Enable/disable desktop popup alerts  
✅ **Sound Control**: Enable/disable notification sounds  
✅ **Email Digest**: Configurable digest frequency (immediate, hourly, daily, weekly, never)  
✅ **Quiet Hours**: No sound/popup alerts during specified hours  
✅ **Browser Permissions**: Automatic browser notification permission requests  

### Management Features
✅ **Mark as Read**: Single and bulk read operations  
✅ **Notification Center**: View all recent alerts with filtering  
✅ **Analytics**: Track alert volumes, peak hours, and response times  
✅ **Cleanup**: Automatic removal of old read alerts (30+ days)  

## 🔒 Security & Compliance

### Row Level Security (RLS)
- Users can only see their own alerts via `user_id = auth.uid()` policy
- Service role can access all alerts for system operations
- No cross-user alert leakage possible

### Sentinel Monitoring
```sql
-- Detect unusual alert volumes for spam prevention
CREATE OR REPLACE FUNCTION detect_alert_anomalies()
RETURNS TABLE(user_id UUID, alert_count BIGINT, anomaly_type TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT ma.user_id, COUNT(*), 'HIGH_VOLUME'
  FROM message_alerts ma
  WHERE ma.created_at > NOW() - INTERVAL '1 hour'
  GROUP BY ma.user_id
  HAVING COUNT(*) > 50;  -- More than 50 alerts in 1 hour
END;
$$;
```

### Audit Logging
- All alert read/unread operations logged to `audit_logs` table
- Bulk operations include affected record counts
- System cleanup operations tracked with deletion counts

## 📱 Integration Guide

### 1. Basic Setup
```typescript
// Wrap your app with AlertProvider
import { AlertProvider } from '@/components/notifications/MessageAlertManager';

export default function App() {
  return (
    <AlertProvider>
      <YourAppContent />
    </AlertProvider>
  );
}
```

### 2. Add Alert Bell to Navigation
```typescript
import { MessageAlertManager } from '@/components/notifications/MessageAlertManager';

function Header() {
  return (
    <header>
      <nav>
        {/* Your navigation */}
        <MessageAlertManager 
          showBell={true}
          onOpenMessage={(messageId) => {
            router.push(`/messages/${messageId}`);
          }}
        />
      </nav>
    </header>
  );
}
```

### 3. Handle Message Reading
```typescript
import { useMessageAlerts } from '@/lib/hooks/useMessageAlerts';

function MessagePage({ messageId }) {
  const { markAlertRead } = useMessageAlerts();
  
  useEffect(() => {
    // Mark alert as read when viewing message
    markAlertRead(messageId);
  }, [messageId, markAlertRead]);
  
  return <MessageContent messageId={messageId} />;
}
```

## 🚀 API Endpoints

### GET `/api/message-alerts`
Fetch user alerts with optional filtering:
```typescript
// Get unread alerts only
GET /api/message-alerts?include_read=false&limit=20

// Response
{
  "success": true,
  "data": {
    "alerts": [...],
    "unreadCount": 5,
    "preferences": {...}
  }
}
```

### POST `/api/message-alerts`
Manage alerts and preferences:
```typescript
// Mark single alert as read
POST /api/message-alerts
{
  "action": "mark_read",
  "messageId": "uuid-here"
}

// Update notification preferences
POST /api/message-alerts
{
  "action": "update_preferences",
  "preferences": {
    "sound_alerts": false,
    "quiet_hours_start": "23:00:00"
  }
}

// Get analytics
POST /api/message-alerts
{
  "action": "get_analytics",
  "timeRange": "week"
}
```

### DELETE `/api/message-alerts`
Clean up old alerts:
```typescript
// Delete specific alert
DELETE /api/message-alerts?alert_id=123

// Cleanup old read alerts (30+ days)
DELETE /api/message-alerts?cleanup_old=true
```

## 🎯 User Experience

### The Experience Flow
1. **Admin sends message** → Database trigger creates alert record
2. **Realtime delivery** → Alert appears within 1-2 seconds via WebSocket
3. **Popup notification** → Slides in from bottom-right with role-based colors
4. **Persistent display** → Remains until user clicks "Open Message" or dismisses
5. **Navigation** → Clicking opens message and marks alert as read
6. **Offline recovery** → Unread alerts reappear on next login

### Behavioral Differences by Portal

| Feature | Admin | Contractor | Client |
|---------|-------|------------|--------|
| **Alert Colors** | Standard (indigo/red) | Blue accent theme | Green accent theme |
| **Sound** | All alert types | Limited to work hours | Gentle tones only |
| **Popup Limit** | Unlimited | Max 3 concurrent | Max 2 concurrent |
| **Auto-dismiss** | 10 seconds | 15 seconds | 8 seconds |
| **Analytics** | Full access | Limited to own data | None |

## 🔧 Configuration Options

### Environment Variables
```env
# Supabase Realtime
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Alert system settings
ALERT_CLEANUP_INTERVAL=86400  # 24 hours
ALERT_RETENTION_DAYS=30       # Keep read alerts for 30 days
MAX_ALERTS_PER_HOUR=50        # Spam detection threshold
```

### Feature Flags
```typescript
// In your config
export const alertConfig = {
  enableSounds: true,
  enableBrowserNotifications: true,
  enableEmailDigest: true,
  maxConcurrentPopups: {
    admin: -1,      // Unlimited
    contractor: 3,  // Max 3
    client: 2       // Max 2
  },
  autoDismissDelay: {
    admin: 10000,     // 10 seconds
    contractor: 15000, // 15 seconds
    client: 8000      // 8 seconds
  }
};
```

## 🐛 Troubleshooting

### Common Issues

**Alerts not appearing:**
- Check browser notification permissions
- Verify Supabase Realtime connection
- Check user authentication status
- Confirm RLS policies allow access

**Sounds not playing:**
- Check user preferences (`sound_alerts: true`)
- Verify not in quiet hours
- Check browser autoplay policy
- Ensure audio files exist in `/public/sounds/`

**Performance issues:**
- Monitor alert table size (cleanup old alerts)
- Check for Realtime connection leaks
- Verify database indexes are present
- Monitor for alert spam patterns

### Debug Commands
```sql
-- Check alert counts per user
SELECT user_id, COUNT(*), COUNT(*) FILTER (WHERE is_read = false) as unread
FROM message_alerts 
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY user_id;

-- Find users with high alert volumes
SELECT * FROM detect_alert_anomalies();

-- Check notification preferences
SELECT user_id, popup_alerts, sound_alerts, quiet_hours_start, quiet_hours_end
FROM notification_preferences
WHERE user_id = 'specific-user-id';
```

## 📈 Performance Metrics

### Expected Performance
- **Alert Delivery**: < 2 seconds from message creation
- **Database Load**: < 10ms per alert creation
- **Popup Render**: < 100ms animation time
- **Cleanup Efficiency**: Process 10k+ old alerts in < 5 seconds

### Monitoring Queries
```sql
-- Alert delivery latency (should be < 2 seconds)
SELECT 
  AVG(EXTRACT(EPOCH FROM (created_at - message.created_at))) as avg_delay_seconds
FROM message_alerts ma
JOIN messages m ON ma.message_id = m.id
WHERE ma.created_at > NOW() - INTERVAL '1 hour';

-- Alert volume by hour
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as alert_count,
  COUNT(DISTINCT user_id) as unique_users
FROM message_alerts
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

## 🎉 Success Criteria

✅ **Real-time delivery**: Alerts appear within 1-2 seconds  
✅ **Persistence**: Unread alerts survive page refreshes and logouts  
✅ **User control**: Comprehensive preference management  
✅ **Role-based UX**: Appropriate styling and behavior per user type  
✅ **Performance**: No impact on app responsiveness  
✅ **Security**: Full RLS compliance with audit logging  
✅ **Scalability**: Handles 1000+ concurrent users efficiently  

The Real-Time Message Alert System provides a production-ready, enterprise-grade notification solution that enhances user engagement while maintaining security and performance standards.