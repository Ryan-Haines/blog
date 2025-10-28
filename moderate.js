#!/usr/bin/env node

/**
 * Comment Moderation CLI Tool
 * 
 * Usage:
 *   node moderate.js stats          - Show moderation statistics
 *   node moderate.js list [status]  - List comments (all, pending, approved, spam)
 *   node moderate.js approve <id>   - Approve a comment
 *   node moderate.js reject <id>    - Mark comment as spam
 *   node moderate.js delete <id>    - Delete a comment permanently
 * 
 * Requires: ADMIN_KEY environment variable or in .dev.vars
 */

const https = require('https');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:4321';
const ADMIN_KEY = process.env.ADMIN_KEY;

if (!ADMIN_KEY) {
  console.error('❌ Error: ADMIN_KEY environment variable not set');
  console.error('Set it in .dev.vars or export it:');
  console.error('  export ADMIN_KEY="your-secret-key-here"');
  process.exit(1);
}

// Helper: Make API request
async function apiRequest(action, data) {
  const url = `${API_URL}/_actions/${action}`;
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const protocol = urlObj.protocol === 'https:' ? https : require('http');
    
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.error) {
            reject(new Error(response.error.message || 'API Error'));
          } else {
            resolve(response.data);
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Helper: Format date
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

// Helper: Truncate text
function truncate(text, length = 60) {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

// Command: Show stats
async function showStats() {
  try {
    const stats = await apiRequest('adminGetStats', { adminKey: ADMIN_KEY });
    
    console.log('\n📊 Comment Moderation Statistics\n');
    console.log(`Total Comments:    ${stats.comments.total}`);
    console.log(`✅ Approved:       ${stats.comments.approved}`);
    console.log(`⏳ Pending:        ${stats.comments.pending}`);
    console.log(`🚫 Spam:           ${stats.comments.spam}`);
    console.log(`❤️  Total Likes:    ${stats.likes}\n`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Command: List comments
async function listComments(status = 'all') {
  try {
    const result = await apiRequest('adminGetAllComments', { 
      adminKey: ADMIN_KEY, 
      status,
      limit: 50,
    });

    if (!result.comments || result.comments.length === 0) {
      console.log(`\nNo ${status} comments found.\n`);
      return;
    }

    const statusEmoji = { 1: '✅', 0: '⏳', '-1': '🚫' };
    
    console.log(`\n📝 Comments (${status}):\n`);
    console.log('ID'.padEnd(6) + 'Status'.padEnd(8) + 'Post'.padEnd(25) + 'Author'.padEnd(20) + 'Content'.padEnd(40) + 'Date');
    console.log('─'.repeat(120));

    result.comments.forEach(c => {
      const emoji = statusEmoji[c.approved] || '?';
      console.log(
        String(c.id).padEnd(6) +
        emoji.padEnd(8) +
        truncate(c.post_slug, 23).padEnd(25) +
        truncate(c.author_name, 18).padEnd(20) +
        truncate(c.content, 38).padEnd(40) +
        formatDate(c.created_at)
      );
    });
    
    console.log('\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Command: Update comment
async function updateComment(id, action) {
  try {
    const result = await apiRequest('adminUpdateComment', {
      adminKey: ADMIN_KEY,
      commentId: parseInt(id),
      action,
    });

    console.log(`\n✅ ${result.message}\n`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Main
const command = process.argv[2];
const arg = process.argv[3];

(async () => {
  switch (command) {
    case 'stats':
      await showStats();
      break;
    
    case 'list':
      await listComments(arg || 'all');
      break;
    
    case 'approve':
      if (!arg) {
        console.error('❌ Error: Comment ID required');
        process.exit(1);
      }
      await updateComment(arg, 'approve');
      break;
    
    case 'reject':
      if (!arg) {
        console.error('❌ Error: Comment ID required');
        process.exit(1);
      }
      await updateComment(arg, 'reject');
      break;
    
    case 'delete':
      if (!arg) {
        console.error('❌ Error: Comment ID required');
        process.exit(1);
      }
      await updateComment(arg, 'delete');
      break;
    
    default:
      console.log(`
Comment Moderation CLI

Usage:
  node moderate.js stats              - Show statistics
  node moderate.js list [status]      - List comments (all, pending, approved, spam)
  node moderate.js approve <id>       - Approve a comment
  node moderate.js reject <id>        - Mark comment as spam
  node moderate.js delete <id>        - Delete a comment

Examples:
  node moderate.js stats
  node moderate.js list pending
  node moderate.js approve 42
  node moderate.js delete 13
      `);
      break;
  }
})();

