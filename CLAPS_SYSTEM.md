# Claps System (Like Medium)

Your blog now uses a **claps system** inspired by Medium, replacing the traditional like/unlike toggle.

## How It Works

### User Experience
- Users can clap **up to 50 times** per post
- Each click adds one clap
- **No "unlike"** - only positive engagement!
- Love parrot 🦜 appears on every clap
- Heart icon fills red when you've clapped at least once

### Backend
- Database tracks `clap_count` per user/IP per post
- Total claps = sum of all users' claps on a post
- Rate limit: 50 actions per 5 minutes (allows full clap experience)
- At 50 claps: friendly message "Maximum claps reached (50). You really love this post! 🎉"

## Database Schema

The `likes` table now has:
```sql
CREATE TABLE likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  clap_count INTEGER DEFAULT 1,  -- 1-50 claps
  created_at INTEGER NOT NULL,
  updated_at INTEGER,             -- When they last clapped
  UNIQUE(post_slug, ip_address)
);
```

## Migration

### Local Development
```bash
./apply-claps-migration.sh
```

This adds the `clap_count` column and sets existing likes to `1`.

### Production (Cloudflare)
Run the migration via Wrangler:
```bash
npx wrangler d1 execute DB --remote --file=MIGRATE_TO_CLAPS.sql
```

## API Changes

### `getLikes` → Returns:
```typescript
{
  count: number,      // Total claps across all users
  userClaps: number   // Current user's claps (0-50)
}
```

### `toggleLike` → Now `addClap`:
```typescript
{
  clapped: true,
  userClaps: number,    // User's new clap count
  totalClaps: number    // Total for the post
}
```

## Frontend Changes

- Replaced `isLiked` boolean with `userClaps` counter (0-50)
- Always increments (no toggle)
- Only shows love parrot (removed sad parrot)
- Disabled at 50 claps with friendly alert

## Why This Is Better

1. **More expressive** - Users can show varying levels of enthusiasm
2. **Only positive** - No negativity from "unliking"
3. **Engagement boost** - People love clicking multiple times
4. **Viral potential** - More interactions = better metrics
5. **Fun!** - Party parrot every time 🦜

---

*This matches Medium's proven engagement model while keeping your unique parrot personality!*

