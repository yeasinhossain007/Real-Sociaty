import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("smartmind.db");
const JWT_SECRET = process.env.JWT_SECRET || "smartmind-secret-key-2026";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    bio TEXT,
    profile_photo TEXT,
    role TEXT DEFAULT 'user',
    plan TEXT DEFAULT 'Free', -- Free, Pro, VIP
    ai_usage_count INTEGER DEFAULT 0,
    youtube_channel TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    content TEXT,
    is_secret INTEGER DEFAULT 0,
    password TEXT,
    type TEXT DEFAULT 'note', -- note, todo, file
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    friend_id INTEGER,
    status TEXT DEFAULT 'pending', -- pending, accepted
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(friend_id) REFERENCES users(id)
  );
`);

// Migration: Add missing columns if they don't exist
const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
const columns = tableInfo.map(c => c.name);
if (!columns.includes('plan')) {
  db.prepare("ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'Free'").run();
}
if (!columns.includes('ai_usage_count')) {
  db.prepare("ALTER TABLE users ADD COLUMN ai_usage_count INTEGER DEFAULT 0").run();
}
if (!columns.includes('youtube_channel')) {
  db.prepare("ALTER TABLE users ADD COLUMN youtube_channel TEXT").run();
}

// Migration for notes table
const notesTableInfo = db.prepare("PRAGMA table_info(notes)").all() as any[];
const notesColumns = notesTableInfo.map(c => c.name);
if (!notesColumns.includes('type')) {
  db.prepare("ALTER TABLE notes ADD COLUMN type TEXT DEFAULT 'note'").run();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Admin Middleware
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    next();
  };

  // --- Auth Routes ---
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const result = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, hashedPassword, name);
      const token = jwt.sign({ id: result.lastInsertRowid, email, role: 'user' }, JWT_SECRET);
      res.json({ token, user: { id: result.lastInsertRowid, email, name, role: 'user' } });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, bio: user.bio, profile_photo: user.profile_photo, plan: user.plan, ai_usage_count: user.ai_usage_count, youtube_channel: user.youtube_channel } });
  });

  // --- Subscription Routes ---
  app.post("/api/user/upgrade", authenticateToken, (req: any, res) => {
    const { plan } = req.body;
    db.prepare("UPDATE users SET plan = ? WHERE id = ?").run(plan, req.user.id);
    res.json({ success: true, plan });
  });

  app.get("/api/user/usage", authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT plan, ai_usage_count FROM users WHERE id = ?").get(req.user.id) as any;
    const notes = db.prepare("SELECT content FROM notes WHERE user_id = ?").all(req.user.id) as any[];
    
    // Calculate storage (simplified: 1 char = 1 byte)
    const storageUsed = notes.reduce((acc, note) => acc + (note.content?.length || 0), 0);
    
    res.json({
      plan: user.plan,
      aiUsage: user.ai_usage_count,
      storageUsed,
      limits: {
        ai: user.plan === 'Free' ? 10 : Infinity,
        storage: user.plan === 'Free' ? 500 * 1024 * 1024 : 10 * 1024 * 1024 * 1024
      }
    });
  });

  // --- User Routes ---
  app.get("/api/user/profile", authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT id, email, name, bio, profile_photo, role FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  app.put("/api/user/profile", authenticateToken, (req: any, res) => {
    const { name, bio, profile_photo, youtube_channel } = req.body;
    db.prepare("UPDATE users SET name = ?, bio = ?, profile_photo = ?, youtube_channel = ? WHERE id = ?").run(name, bio, profile_photo, youtube_channel, req.user.id);
    res.json({ success: true });
  });

  // --- YouTube Routes ---
  app.get("/api/youtube/videos", authenticateToken, async (req: any, res) => {
    const user = db.prepare("SELECT youtube_channel FROM users WHERE id = ?").get(req.user.id) as any;
    if (!user?.youtube_channel) {
      return res.json({ videos: [] });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      // Mock data if no API key is provided
      return res.json({ 
        videos: [
          { id: '1', title: 'Mock Video 1', thumbnail: 'https://picsum.photos/seed/yt1/320/180', url: 'https://youtube.com' },
          { id: '2', title: 'Mock Video 2', thumbnail: 'https://picsum.photos/seed/yt2/320/180', url: 'https://youtube.com' },
        ],
        isMock: true
      });
    }

    try {
      // Extract channel ID from URL or use as is
      let channelId = user.youtube_channel;
      if (channelId.includes('channel/')) {
        channelId = channelId.split('channel/')[1].split('/')[0];
      } else if (channelId.includes('@')) {
        // Handle handles - this requires an extra API call to search for the channel
        const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${channelId}&key=${apiKey}`);
        const searchData = await searchRes.json();
        if (searchData.items?.length > 0) {
          channelId = searchData.items[0].id.channelId;
        }
      }

      const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10&type=video`);
      const data = await videoRes.json();
      
      const videos = data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      })) || [];

      res.json({ videos });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch YouTube videos" });
    }
  });

  // --- Notes Routes ---
  app.get("/api/notes", authenticateToken, (req: any, res) => {
    const notes = db.prepare("SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
    res.json(notes);
  });

  app.post("/api/notes", authenticateToken, (req: any, res) => {
    const { title, content, is_secret, password, type } = req.body;
    const result = db.prepare("INSERT INTO notes (user_id, title, content, is_secret, password, type) VALUES (?, ?, ?, ?, ?, ?)")
      .run(req.user.id, title, content, is_secret ? 1 : 0, password || null, type || 'note');
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/notes/:id", authenticateToken, (req: any, res) => {
    db.prepare("DELETE FROM notes WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // --- Admin Routes ---
  app.get("/api/admin/users", authenticateToken, isAdmin, (req, res) => {
    const users = db.prepare("SELECT id, email, name, role, created_at FROM users").all();
    res.json(users);
  });

  app.get("/api/admin/stats", authenticateToken, isAdmin, (req, res) => {
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    const noteCount = db.prepare("SELECT COUNT(*) as count FROM notes").get() as any;
    const activityCount = db.prepare("SELECT COUNT(*) as count FROM activities").get() as any;
    res.json({ users: userCount.count, notes: noteCount.count, activities: activityCount.count });
  });

  app.delete("/api/admin/users/:id", authenticateToken, isAdmin, (req, res) => {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/activities", authenticateToken, (req: any, res) => {
    const { action, details } = req.body;
    db.prepare("INSERT INTO activities (user_id, action, details) VALUES (?, ?, ?)").run(req.user.id, action, details);
    
    if (action === 'AI Chat') {
      db.prepare("UPDATE users SET ai_usage_count = ai_usage_count + 1 WHERE id = ?").run(req.user.id);
    }
    
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
