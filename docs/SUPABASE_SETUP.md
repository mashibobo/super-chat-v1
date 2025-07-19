# Supabase Setup Guide for Anonymous Chat App

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization or use existing
4. Create a new project
5. Choose a database password
6. Select a region close to your users

## 2. Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from:
- Project Settings → API → Project URL
- Project Settings → API → Project API keys → anon public

## 3. Database Setup

### Run Migration

1. Go to SQL Editor in Supabase Dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL

### Enable Realtime

1. Go to Database → Replication
2. Enable realtime for these tables:
   - `messages`
   - `users` (for online status)
   - `chat_rooms`
   - `confessions`

## 4. Authentication Setup

### Enable Email Authentication

1. Go to Authentication → Settings
2. Enable "Enable email confirmations" (optional)
3. Configure email templates if needed

### Configure Auth Policies

The migration already includes Row Level Security (RLS) policies, but verify:

1. Go to Authentication → Policies
2. Ensure all tables have appropriate policies
3. Test with different user roles

## 5. Storage Setup (Optional)

For image messages and profile pictures:

1. Go to Storage
2. Create a new bucket called `chat-images`
3. Set bucket to public if needed
4. Configure upload policies

## 6. Realtime Configuration

### Enable Realtime Features

```sql
-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for user presence
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Enable realtime for confessions
ALTER PUBLICATION supabase_realtime ADD TABLE confessions;
```

### Test Realtime Connection

```javascript
// Test in browser console
import { supabase } from './src/lib/supabase';

const channel = supabase
  .channel('test')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

## 7. Security Considerations

### Row Level Security Policies

The app uses RLS to ensure:
- Users can only see their own private messages
- Room messages are only visible to room members
- Super secret rooms are completely hidden
- Users can only modify their own data

### API Rate Limiting

Configure in Project Settings → API:
- Set appropriate rate limits
- Monitor usage in the dashboard

## 8. Performance Optimization

### Database Indexes

The migration includes optimized indexes for:
- Message conversations
- Room messages
- Confession categories
- User lookups

### Connection Pooling

Supabase automatically handles connection pooling, but monitor:
- Database → Logs for connection issues
- Database → Performance for slow queries

## 9. Monitoring and Analytics

### Enable Logging

1. Go to Logs
2. Monitor API requests
3. Check for errors and performance issues

### Set Up Alerts

1. Go to Project Settings → Integrations
2. Configure webhooks for critical events
3. Set up email notifications

## 10. Deployment Checklist

Before going live:

- [ ] All environment variables set
- [ ] Database migration completed
- [ ] RLS policies tested
- [ ] Realtime features working
- [ ] Authentication flow tested
- [ ] Rate limits configured
- [ ] Monitoring set up
- [ ] Backup strategy in place

## 11. Testing Realtime Features

### Test Private Messages

```javascript
// Send a message
await supabase.from('messages').insert({
  sender_id: 'user1-id',
  receiver_id: 'user2-id',
  content: 'Hello!',
  message_type: 'text'
});

// Should trigger realtime update for receiver
```

### Test Room Messages

```javascript
// Send room message
await supabase.from('messages').insert({
  sender_id: 'user1-id',
  room_id: 'room-id',
  content: 'Hello room!',
  message_type: 'text'
});

// Should trigger realtime update for all room members
```

### Test User Presence

```javascript
// Track user presence
const channel = supabase.channel('room1')
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    console.log('sync', state);
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('join', key, newPresences);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('leave', key, leftPresences);
  })
  .subscribe(async (status) => {
    if (status !== 'SUBSCRIBED') return;
    
    await channel.track({
      user_id: 'user-id',
      online_at: new Date().toISOString(),
    });
  });
```

## Troubleshooting

### Common Issues

1. **RLS Policies Too Restrictive**
   - Check policies in Authentication → Policies
   - Test with different user contexts

2. **Realtime Not Working**
   - Verify tables are added to replication
   - Check network connectivity
   - Monitor browser console for errors

3. **Authentication Issues**
   - Verify JWT tokens
   - Check user session state
   - Review auth policies

4. **Performance Issues**
   - Monitor slow queries in Database → Performance
   - Check if indexes are being used
   - Consider query optimization

### Getting Help

- Supabase Documentation: [docs.supabase.com](https://docs.supabase.com)
- Community Discord: [discord.supabase.com](https://discord.supabase.com)
- GitHub Issues: [github.com/supabase/supabase](https://github.com/supabase/supabase)