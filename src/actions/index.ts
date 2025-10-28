import { defineAction } from 'astro:actions';
import { z } from 'zod';

// Type for D1 Database binding
type D1Database = any;

interface Env {
  DB: D1Database;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_KEY?: string;
}

// Helper: Verify Turnstile token
async function verifyTurnstile(token: string, secret: string, ip?: string): Promise<boolean> {
  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', token);
  if (ip) {
    formData.append('remoteip', ip);
  }

  try {
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    const data = await result.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

// Helper: Check rate limit
async function checkRateLimit(
  db: D1Database,
  ipAddress: string,
  actionType: string,
  windowMinutes: number = 5,
  maxActions: number = 3
): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - (windowMinutes * 60 * 1000);

  // Clean up old rate limit records
  await db
    .prepare('DELETE FROM rate_limits WHERE created_at < ?')
    .bind(now - (24 * 60 * 60 * 1000)) // Keep 24 hours of history
    .run();

  // Check current rate
  const result = await db
    .prepare('SELECT COUNT(*) as count FROM rate_limits WHERE ip_address = ? AND action_type = ? AND created_at > ?')
    .bind(ipAddress, actionType, windowStart)
    .first();

  if (result && result.count >= maxActions) {
    return false; // Rate limit exceeded
  }

  // Record this action
  await db
    .prepare('INSERT INTO rate_limits (ip_address, action_type, created_at) VALUES (?, ?, ?)')
    .bind(ipAddress, actionType, now)
    .run();

  return true;
}

// Helper: Simple spam detection
function containsSpam(text: string): boolean {
  const spamPatterns = [
    /\b(viagra|cialis|porn|xxx|casino|bitcoin)\b/i,
    /https?:\/\/[^\s]+\.(xyz|top|click|loan|win)/i,
    /<a\s+href/i, // No HTML links
    /\[url=/i, // No BBCode
  ];

  return spamPatterns.some(pattern => pattern.test(text));
}

// Action: Add a comment
export const server = {
  addComment: defineAction({
    accept: 'form',
    input: z.object({
      postSlug: z.string().min(1),
      authorName: z.string().min(2).max(100),
      content: z.string().min(10).max(2000),
      turnstileToken: z.string(),
      honeypot: z.string().optional(), // Honeypot field
    }),
    handler: async (input, context) => {
      const env = context.locals.runtime.env as Env;
      const db = env.DB;
      const request = context.request;
      
      // Get client IP
      const ipAddress = request.headers.get('CF-Connecting-IP') || 
                       request.headers.get('X-Forwarded-For') || 
                       'unknown';
      
      // Honeypot check (bots fill this out)
      if (input.honeypot) {
        throw new Error('Spam detected');
      }

      // Verify Turnstile
      const turnstileValid = await verifyTurnstile(
        input.turnstileToken,
        env.TURNSTILE_SECRET_KEY,
        ipAddress
      );

      if (!turnstileValid) {
        throw new Error('CAPTCHA verification failed');
      }

      // Rate limiting
      const rateLimitOk = await checkRateLimit(db, ipAddress, 'comment', 5, 2);
      if (!rateLimitOk) {
        throw new Error('Too many comments. Please wait a few minutes.');
      }

      // Spam detection
      if (containsSpam(input.content) || containsSpam(input.authorName)) {
        // Mark as spam but don't tell the user
        await db
          .prepare('INSERT INTO comments (post_slug, author_name, content, created_at, ip_address, user_agent, approved) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(
            input.postSlug,
            input.authorName,
            input.content,
            Date.now(),
            ipAddress,
            request.headers.get('User-Agent') || '',
            -1 // Spam
          )
          .run();
        
        // Return success to avoid teaching spammers
        return { success: true, message: 'Comment submitted for moderation' };
      }

      // Insert comment (pending approval)
      const result = await db
        .prepare('INSERT INTO comments (post_slug, author_name, content, created_at, ip_address, user_agent, approved) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(
          input.postSlug,
          input.authorName,
          input.content,
          Date.now(),
          ipAddress,
          request.headers.get('User-Agent') || '',
          1 // Auto-approve for now (you can change to 0 for manual moderation)
        )
        .run();

      return { 
        success: true, 
        message: 'Comment posted successfully!',
        commentId: result.meta.last_row_id 
      };
    },
  }),

  // Action: Get comments for a post
  getComments: defineAction({
    accept: 'json',
    input: z.object({
      postSlug: z.string(),
    }),
    handler: async (input, context) => {
      const env = context.locals.runtime.env as Env;
      const db = env.DB;

      const comments = await db
        .prepare('SELECT id, author_name, content, created_at FROM comments WHERE post_slug = ? AND approved = 1 ORDER BY created_at ASC')
        .bind(input.postSlug)
        .all();

      return { 
        comments: comments.results || [],
        count: comments.results?.length || 0
      };
    },
  }),

  // Action: Add clap (like Medium - up to 50 claps per post)
  toggleLike: defineAction({
    accept: 'json',
    input: z.object({
      postSlug: z.string(),
    }),
    handler: async (input, context) => {
      const env = context.locals.runtime.env as Env;
      const db = env.DB;
      const request = context.request;

      const ipAddress = request.headers.get('CF-Connecting-IP') || 
                       request.headers.get('X-Forwarded-For') || 
                       'unknown';

      // Check if they've already clapped
      const existing = await db
        .prepare('SELECT id, clap_count FROM likes WHERE post_slug = ? AND ip_address = ?')
        .bind(input.postSlug, ipAddress)
        .first();

      if (existing) {
        const currentClaps = (existing.clap_count as number) || 1;
        
        // Check if they've hit the limit
        if (currentClaps >= 50) {
          throw new Error('Maximum claps reached (50). You really love this post! 🎉');
        }

        // Increment clap count
        await db
          .prepare('UPDATE likes SET clap_count = clap_count + 1, updated_at = ? WHERE post_slug = ? AND ip_address = ?')
          .bind(Date.now(), input.postSlug, ipAddress)
          .run();

        // Get new total count for this post (sum of all claps)
        const countResult = await db
          .prepare('SELECT COALESCE(SUM(clap_count), 0) as count FROM likes WHERE post_slug = ?')
          .bind(input.postSlug)
          .first();

        return { 
          clapped: true,
          userClaps: currentClaps + 1,
          totalClaps: countResult?.count || 0 
        };
      } else {
        // Rate limiting (allow 50 actions within 5 minutes for the clapping experience)
        const rateLimitOk = await checkRateLimit(db, ipAddress, 'like', 50, 5);
        if (!rateLimitOk) {
          throw new Error('Too many actions. Please wait a moment.');
        }

        // First clap
        await db
          .prepare('INSERT INTO likes (post_slug, ip_address, clap_count, created_at, updated_at) VALUES (?, ?, 1, ?, ?)')
          .bind(input.postSlug, ipAddress, Date.now(), Date.now())
          .run();

        // Get new total count for this post (sum of all claps)
        const countResult = await db
          .prepare('SELECT COALESCE(SUM(clap_count), 0) as count FROM likes WHERE post_slug = ?')
          .bind(input.postSlug)
          .first();

        return { 
          clapped: true,
          userClaps: 1,
          totalClaps: countResult?.count || 0 
        };
      }
    },
  }),

  // Action: Get clap status and count
  getLikes: defineAction({
    accept: 'json',
    input: z.object({
      postSlug: z.string(),
    }),
    handler: async (input, context) => {
      const env = context.locals.runtime.env as Env;
      const db = env.DB;
      const request = context.request;

      const ipAddress = request.headers.get('CF-Connecting-IP') || 
                       request.headers.get('X-Forwarded-For') || 
                       'unknown';

      // Get total claps for this post (sum of all clap_count)
      const countResult = await db
        .prepare('SELECT COALESCE(SUM(clap_count), 0) as count FROM likes WHERE post_slug = ?')
        .bind(input.postSlug)
        .first();

      // Check user's claps
      const userClaps = await db
        .prepare('SELECT clap_count FROM likes WHERE post_slug = ? AND ip_address = ?')
        .bind(input.postSlug, ipAddress)
        .first();

      return { 
        count: countResult?.count || 0,
        userClaps: (userClaps?.clap_count as number) || 0
      };
    },
  }),

  // ======== ADMIN ACTIONS (Protected by admin key) ========

  // Action: Get all comments (for moderation)
  adminGetAllComments: defineAction({
    accept: 'json',
    input: z.object({
      adminKey: z.string(),
      status: z.enum(['all', 'pending', 'approved', 'spam']).optional(),
      limit: z.number().optional(),
    }),
    handler: async (input, context) => {
      const env = context.locals.runtime.env as Env;
      const db = env.DB;

      // Verify admin key
      const expectedKey = env.ADMIN_KEY;
      if (!expectedKey || input.adminKey !== expectedKey) {
        throw new Error('Unauthorized');
      }

      let query = 'SELECT id, post_slug, author_name, content, created_at, ip_address, approved FROM comments';
      const params: any[] = [];

      // Filter by status
      if (input.status && input.status !== 'all') {
        const statusMap = { pending: 0, approved: 1, spam: -1 };
        query += ' WHERE approved = ?';
        params.push(statusMap[input.status]);
      }

      query += ' ORDER BY created_at DESC';

      if (input.limit) {
        query += ' LIMIT ?';
        params.push(input.limit);
      }

      const result = await db.prepare(query).bind(...params).all();

      return {
        comments: result.results || [],
        count: result.results?.length || 0,
      };
    },
  }),

  // Action: Update comment status (approve/reject/delete)
  adminUpdateComment: defineAction({
    accept: 'json',
    input: z.object({
      adminKey: z.string(),
      commentId: z.number(),
      action: z.enum(['approve', 'reject', 'delete']),
    }),
    handler: async (input, context) => {
      const env = context.locals.runtime.env as Env;
      const db = env.DB;

      // Verify admin key
      const expectedKey = env.ADMIN_KEY;
      if (!expectedKey || input.adminKey !== expectedKey) {
        throw new Error('Unauthorized');
      }

      if (input.action === 'delete') {
        await db
          .prepare('DELETE FROM comments WHERE id = ?')
          .bind(input.commentId)
          .run();
        return { success: true, message: 'Comment deleted' };
      } else if (input.action === 'approve') {
        await db
          .prepare('UPDATE comments SET approved = 1 WHERE id = ?')
          .bind(input.commentId)
          .run();
        return { success: true, message: 'Comment approved' };
      } else if (input.action === 'reject') {
        await db
          .prepare('UPDATE comments SET approved = -1 WHERE id = ?')
          .bind(input.commentId)
          .run();
        return { success: true, message: 'Comment marked as spam' };
      }

      throw new Error('Invalid action');
    },
  }),

  // Action: Get moderation stats
  adminGetStats: defineAction({
    accept: 'json',
    input: z.object({
      adminKey: z.string(),
    }),
    handler: async (input, context) => {
      const env = context.locals.runtime.env as Env;
      const db = env.DB;

      // Verify admin key
      const expectedKey = env.ADMIN_KEY;
      if (!expectedKey || input.adminKey !== expectedKey) {
        throw new Error('Unauthorized');
      }

      const approved = await db
        .prepare('SELECT COUNT(*) as count FROM comments WHERE approved = 1')
        .first();
      
      const pending = await db
        .prepare('SELECT COUNT(*) as count FROM comments WHERE approved = 0')
        .first();
      
      const spam = await db
        .prepare('SELECT COUNT(*) as count FROM comments WHERE approved = -1')
        .first();

      const totalLikes = await db
        .prepare('SELECT COUNT(*) as count FROM likes')
        .first();

      console.log('[DEBUG] adminGetStats raw results:', { approved, pending, spam, totalLikes });

      const result = {
        comments: {
          approved: approved?.count || 0,
          pending: pending?.count || 0,
          spam: spam?.count || 0,
          total: (approved?.count || 0) + (pending?.count || 0) + (spam?.count || 0),
        },
        likes: totalLikes?.count || 0,
      };

      console.log('[DEBUG] adminGetStats returning:', result);
      return result;
    },
  }),
};

