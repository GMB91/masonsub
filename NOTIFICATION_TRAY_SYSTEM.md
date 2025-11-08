# Notification Tray System Documentation

## Overview

The Notification Tray System provides a comprehensive notification experience with:
- **Notification Bell** - Header icon with badge counter
- **Sliding Tray** - Right-side panel showing notification list 
- **Popup Alerts** - Corner notifications for immediate alerts
- **Real-time Updates** - Supabase Realtime subscriptions
- **User Preferences** - Customizable notification behavior

## Architecture

### Database Layer
```sql
-- Enhanced message_alerts table
message_alerts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  message_id UUID REFERENCES messages(id),
  preview_text TEXT,          -- First 80 chars of message
  sender_name TEXT,           -- Display name
  sender_avatar_url TEXT,     -- Profile picture
  action_type VARCHAR(50),    -- 'message', 'system', 'alert', etc.
  action_url TEXT,            -- Navigation target
  is_read BOOLEAN,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);

-- User notification preferences
notification_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  show_previews BOOLEAN,      -- Show message previews
  play_sound BOOLEAN,         -- Audio notifications
  tray_auto_open BOOLEAN,     -- Auto-open tray on new alerts
  max_tray_items INTEGER,     -- Tray display limit
  quiet_hours_start TIME,     -- No sound period start
  quiet_hours_end TIME        -- No sound period end
);
```

### Frontend Components

#### 1. NotificationBell
**Location**: `src/components/notifications/NotificationBell.tsx`

Header bell icon with badge counter and tray toggle functionality.

```tsx
import { NotificationBell } from '@/components/notifications';

// Basic usage
<NotificationBell />

// With customization
<NotificationBell 
  variant="outline" 
  size="lg" 
  className="custom-styles" 
/>

// Compact version for mobile
<NotificationBellCompact />

// With tooltip
<NotificationBellWithTooltip tooltip="Messages" />
```

**Features**:
- Badge counter showing unread count
- Animation on new notifications
- Keyboard accessibility (Enter/Space to toggle)
- Multiple size and style variants
- Audit tracking when tray is opened

#### 2. NotificationTray
**Location**: `src/components/notifications/NotificationTray.tsx`

Sliding tray panel displaying notification list with management actions.

```tsx
import { NotificationTray } from '@/components/notifications';

<NotificationTray 
  onClose={() => setOpen(false)}
  maxHeight={400}
/>
```

**Features**:
- Grouped by priority and date
- Click to navigate to message/action
- Mark individual/all as read
- Clear all notifications
- Real-time updates
- Keyboard navigation (Escape to close)
- Outside click detection

#### 3. NotificationProvider
**Location**: `src/components/notifications/NotificationProvider.tsx`

Global provider for popup notifications and system management.

```tsx
import { NotificationProvider } from '@/components/notifications';

function App() {
  return (
    <NotificationProvider
      enablePopups={true}
      popupDuration={5000}
      maxPopups={3}
      position="top-right"
    >
      {/* Your app content */}
    </NotificationProvider>
  );
}
```

**Features**:
- Auto-dismissing popup notifications
- Progress bars showing time remaining
- Role-based styling (colors by alert type)
- Position configuration
- Batch popup management

### State Management

#### useNotifications Hook
**Location**: `src/lib/hooks/useNotifications.ts`

Zustand-based state management with Supabase Realtime integration.

```tsx
import { useNotifications } from '@/lib/hooks/useNotifications';

function Component() {
  const {
    alerts,
    unreadCount,
    isTrayOpen,
    setTrayOpen,
    markRead,
    markAllRead,
    preferences,
    updatePreferences
  } = useNotifications();

  // Handle new notification
  useEffect(() => {
    if (unreadCount > 0) {
      // Play sound, show popup, etc.
    }
  }, [unreadCount]);
}
```

**State Structure**:
```typescript
interface NotificationState {
  alerts: NotificationAlert[];
  unreadCount: number;
  isLoading: boolean;
  isTrayOpen: boolean;
  preferences: NotificationPreferences;
  isSubscribed: boolean;
  lastSync: string | null;
  error: string | null;
}
```

### API Endpoints

#### GET /api/notifications/tray
Fetch user's notification alerts and preferences.

**Query Parameters**:
- `userId` (required) - User UUID
- `limit` (optional) - Max alerts to return (default: 20, max: 50)
- `onlyUnread` (optional) - Filter to unread only

**Response**:
```json
{
  "alerts": [...],
  "preferences": {
    "show_previews": true,
    "play_sound": true,
    "tray_auto_open": false,
    "max_tray_items": 20
  },
  "unreadCount": 3,
  "totalCount": 15
}
```

#### POST /api/notifications/tray
Handle notification operations.

**Actions**:

1. **Mark Read**
```json
{
  "action": "markRead",
  "alertId": "uuid"
}
```

2. **Mark All Read**
```json
{
  "action": "markAllRead", 
  "userId": "uuid"
}
```

3. **Update Preferences**
```json
{
  "action": "updatePreferences",
  "userId": "uuid",
  "preferences": {
    "play_sound": false,
    "quiet_hours_start": "22:00",
    "quiet_hours_end": "07:00"
  }
}
```

4. **Create System Alert**
```json
{
  "action": "createSystemAlert",
  "userId": "uuid",
  "title": "System Update",
  "preview": "New features available",
  "actionType": "system",
  "actionUrl": "/updates"
}
```

5. **Bulk Create**
```json
{
  "action": "bulkCreate",
  "userIds": ["uuid1", "uuid2"],
  "title": "Maintenance Notice",
  "preview": "System maintenance tonight",
  "actionType": "warning"
}
```

#### DELETE /api/notifications/tray
Clear or cleanup notifications.

**Query Parameters**:
- `userId` (required) - User UUID
- `action` (optional) - 'clear' or 'cleanup' (default: 'clear')

## User Experience Flow

### 1. New Message Arrives
1. **Database Trigger** - `create_message_alert()` fires on message insert
2. **Realtime Event** - Supabase publishes to subscribed clients
3. **State Update** - Hook receives event and updates local state
4. **UI Updates**:
   - Bell icon turns blue and shows badge
   - Popup appears in corner (if enabled)
   - Sound plays (if enabled and not quiet hours)
   - Tray auto-opens (if enabled)

### 2. User Clicks Bell
1. **Tray Opens** - Slides in from right side
2. **Audit Log** - `mark_alerts_viewed()` called for tracking
3. **Display Alerts** - Grouped by priority and date
4. **Real-time Updates** - New alerts appear instantly

### 3. User Clicks Alert
1. **Mark Read** - Optimistic update + database call
2. **Navigation** - Redirect to `action_url` if provided
3. **Tray Closes** - Automatic close after navigation
4. **Badge Update** - Unread count decrements

### 4. User Manages Notifications
1. **Mark All Read** - Batch update all unread alerts
2. **Clear All** - Remove all alerts from database
3. **Update Preferences** - Modify sound, popup, quiet hours settings

## Integration Examples

### Basic Header Integration
```tsx
// In your main header component
import { NotificationBell } from '@/components/notifications';

export function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1>Mason Vector</h1>
      
      <div className="flex items-center gap-4">
        <UserMenu />
        <NotificationBell />
      </div>
    </header>
  );
}
```

### App-wide Provider Setup
```tsx
// In your root layout or app component
import { NotificationProvider } from '@/components/notifications';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NotificationProvider
          enablePopups={true}
          popupDuration={5000}
          position="top-right"
        >
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
```

### Creating System Notifications
```tsx
// For system alerts, policy updates, etc.
import { createSystemNotification } from '@/components/notifications';

async function notifyPolicyUpdate(userIds: string[]) {
  await createBulkNotifications(
    userIds,
    'Policy Update',
    'New privacy policy available for review',
    'system',
    '/policies/privacy'
  );
}

// Single user notification
async function notifyClaimUpdate(userId: string, claimId: string) {
  await createSystemNotification(
    userId,
    'Claim Update',
    'Your claim status has been updated',
    'alert',
    `/claims/${claimId}`
  );
}
```

## Security & Compliance

### Row Level Security (RLS)
```sql
-- Users can only access own alerts
CREATE POLICY "Users can access own notification alerts"
ON message_alerts FOR ALL
USING (user_id = auth.uid());

-- Users can only manage own preferences  
CREATE POLICY "Users can manage own notification preferences"
ON notification_preferences FOR ALL
USING (user_id = auth.uid());
```

### Sentinel Integration
- **Spam Detection** - `detect_notification_anomalies()` monitors excessive alerts
- **Rate Limiting** - Automatic throttling for users with >50 alerts/hour
- **Audit Logging** - All tray views and alert interactions logged

### Data Privacy
- **Encrypted Storage** - Message previews limited to 80 characters
- **Automatic Cleanup** - Alerts older than 30 days automatically removed
- **User Control** - Users can disable previews via preferences

## Performance Optimization

### Database Indexes
```sql
-- Fast unread queries
CREATE INDEX idx_message_alerts_user_unread 
ON message_alerts(user_id, is_read, created_at DESC)
WHERE is_read = false;

-- Efficient cleanup
CREATE INDEX idx_message_alerts_created_at 
ON message_alerts(created_at);
```

### Frontend Optimizations
- **Selective Subscriptions** - Only subscribe when user is active
- **Optimistic Updates** - Immediate UI feedback before database confirmation
- **Efficient Selectors** - Individual Zustand selectors prevent unnecessary re-renders
- **Lazy Loading** - Components only load when needed

### Realtime Scaling
- **Channel Filtering** - User-specific filters reduce unnecessary events
- **Connection Management** - Automatic reconnection on network changes
- **Batching** - Multiple updates batched into single UI update

## Troubleshooting

### Common Issues

1. **Notifications Not Appearing**
   - Check browser notification permissions
   - Verify Supabase Realtime connection
   - Confirm user is subscribed to correct channel

2. **Tray Not Opening**
   - Check for JavaScript errors in console
   - Verify `useNotifications` hook is properly initialized
   - Confirm user authentication status

3. **Sounds Not Playing**
   - Check user preferences (play_sound setting)
   - Verify quiet hours configuration
   - Test browser audio permissions

4. **Performance Issues**
   - Monitor database query performance
   - Check for excessive Realtime events
   - Review notification cleanup schedule

### Debug Tools

```tsx
// Debug hook to monitor notification state
import { useNotifications } from '@/lib/hooks/useNotifications';

function DebugPanel() {
  const state = useNotifications();
  
  return (
    <pre>{JSON.stringify(state, null, 2)}</pre>
  );
}

// Test notification creation
import { testNotificationSystem } from '@/components/notifications';

async function testSystem() {
  const result = await testNotificationSystem('user-uuid');
  console.log('Test result:', result);
}
```

## Migration Guide

### From Existing Alert System
1. **Run Migration** - Apply `20251107001000_notification_tray_enhancements.sql`
2. **Update Components** - Replace existing notification components
3. **Update State** - Migrate to new `useNotifications` hook
4. **Test Integration** - Verify popup and tray functionality

### Breaking Changes
- Old `useMessageAlerts` hook replaced with `useNotifications`
- Popup component now part of `NotificationProvider`
- New database schema requires migration

## Future Enhancements

### Planned Features
- **Push Notifications** - PWA support for offline notifications
- **Notification Templates** - Predefined alert templates
- **Advanced Filtering** - User-defined notification filters
- **Analytics Dashboard** - Notification engagement metrics
- **Mobile App Integration** - React Native compatibility

### Performance Improvements
- **WebSocket Optimization** - More efficient Realtime protocol
- **Caching Strategy** - Redis-based notification caching
- **Batch Processing** - Bulk notification delivery optimization