import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "../server/storage";
import { users, gameSessions, userProgress, type InsertUser } from "../shared/schema";
import { eq } from "drizzle-orm";

function generateFallbackQuestions(studyMaterial: string, difficulty: string) {
  const words = studyMaterial.split(/\s+/).filter((word: string) => word.length > 3);
  const sentences = studyMaterial.split(/[.!?]+/).filter((s: string) => s.trim().length > 10);
  
  const questions = [];
  
  for (let i = 0; i < Math.min(5, sentences.length); i++) {
    const sentence = sentences[i].trim();
    const keyWords = words.slice(i * 3, (i + 1) * 3);
    
    if (keyWords.length >= 2) {
      questions.push({
        id: `fallback_q${i + 1}`,
        question: `Based on the study material, which statement is most accurate about: "${sentence.substring(0, 50)}..."?`,
        options: [
          `${keyWords[0]} is the primary focus`,
          `${keyWords[1] || 'The concept'} is not relevant`,
          `This relates to ${keyWords[2] || 'general knowledge'}`,
          `None of the above statements are correct`
        ],
        correctAnswer: 0,
        explanation: `Based on the context in the study material, ${keyWords[0]} appears to be a key concept.`,
        difficulty
      });
    }
  }
  
  while (questions.length < 3) {
    questions.push({
      id: `fallback_q${questions.length + 1}`,
      question: "What is the main topic of the provided study material?",
      options: [
        "Educational content",
        "Technical documentation", 
        "Creative writing",
        "Random text"
      ],
      correctAnswer: 0,
      explanation: "Based on the context, this appears to be educational content for learning purposes.",
      difficulty: 'easy'
    });
  }
  
  return questions;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
      
      if (existingUser.length > 0) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Create user (password should be hashed in production)
      const [newUser] = await db.insert(users).values({
        username,
        password, // In production, use bcrypt to hash
      }).returning();

      // Create initial progress record
      await db.insert(userProgress).values({
        userId: newUser.id,
        totalGamesPlayed: 0,
        totalScore: 0,
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        averageAccuracy: 0,
        highestScore: 0,
        highestLevel: 1,
      });

      res.json({ 
        success: true, 
        user: { id: newUser.id, username: newUser.username }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ 
        success: true, 
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // User progress endpoints
  app.get("/api/user/:userId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId)).limit(1);
      
      if (!progress) {
        return res.status(404).json({ error: "User progress not found" });
      }

      res.json({ progress });
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.get("/api/user/:userId/sessions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const sessions = await db.select().from(gameSessions)
        .where(eq(gameSessions.userId, userId))
        .orderBy(gameSessions.completedAt)
        .limit(50);

      res.json({ sessions });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Game session endpoints (for future use)
  app.post("/api/game/start", async (req, res) => {
    const { studyMaterial } = req.body;
    
    // Here you could store the game session
    // For now, just return success
    res.json({ 
      success: true, 
      sessionId: Date.now().toString(),
      message: "Game session started" 
    });
  });

  app.post("/api/game/end", async (req, res) => {
    try {
      const { userId, stats, studyMaterial } = req.body;
      
      if (!stats) {
        return res.status(400).json({ error: "Stats required" });
      }

      // Save game session
      const [session] = await db.insert(gameSessions).values({
        userId: userId || null,
        score: stats.score,
        questionsAnswered: stats.questionsAnswered,
        correctAnswers: stats.correctAnswers,
        accuracy: stats.accuracy,
        maxLevel: stats.level,
        totalTime: stats.totalTime,
        studyMaterial: studyMaterial || null,
      }).returning();

      // Update user progress if user is logged in
      if (userId) {
        const [currentProgress] = await db.select().from(userProgress)
          .where(eq(userProgress.userId, userId))
          .limit(1);

        if (currentProgress) {
          const newTotalGames = currentProgress.totalGamesPlayed + 1;
          const newTotalScore = currentProgress.totalScore + stats.score;
          const newTotalQuestions = currentProgress.totalQuestionsAnswered + stats.questionsAnswered;
          const newTotalCorrect = currentProgress.totalCorrectAnswers + stats.correctAnswers;
          const newAverageAccuracy = newTotalQuestions > 0 
            ? (newTotalCorrect / newTotalQuestions) * 100 
            : 0;

          await db.update(userProgress)
            .set({
              totalGamesPlayed: newTotalGames,
              totalScore: newTotalScore,
              totalQuestionsAnswered: newTotalQuestions,
              totalCorrectAnswers: newTotalCorrect,
              averageAccuracy: newAverageAccuracy,
              highestScore: Math.max(currentProgress.highestScore, stats.score),
              highestLevel: Math.max(currentProgress.highestLevel, stats.level),
              lastPlayedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(userProgress.userId, userId));
        }
      }

      res.json({ 
        success: true, 
        message: "Game session saved",
        sessionId: session.id,
        finalScore: stats.score
      });
    } catch (error) {
      console.error('Error saving game session:', error);
      res.status(500).json({ error: "Failed to save game session" });
    }
  });

  // Questions generation endpoint with Gemini AI
  app.post("/api/questions/generate", async (req, res) => {
    const { studyMaterial, difficulty = 'medium' } = req.body;
    
    if (!studyMaterial || studyMaterial.trim().length === 0) {
      return res.status(400).json({ 
        error: "Study material is required" 
      });
    }

    const apiKey = process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('Gemini API key not configured, using fallback questions');
      return res.json({ questions: generateFallbackQuestions(studyMaterial, difficulty) });
    }

    try {
      const prompt = `
Generate 10 multiple-choice questions from the following study material. 
Make the questions ${difficulty} difficulty level.

Study Material:
${studyMaterial}

Format your response as a JSON array where each question has:
- id: unique string
- question: the question text
- options: array of exactly 4 answer choices [A, B, C, D]
- correctAnswer: index (0-3) of the correct answer
- explanation: brief explanation of why the answer is correct
- difficulty: "${difficulty}"

Example format:
[
  {
    "id": "q1",
    "question": "What is the main concept discussed?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 1,
    "explanation": "Option B is correct because...",
    "difficulty": "${difficulty}"
  }
]

Return only the JSON array, no additional text.
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        console.error('Gemini API error:', response.status);
        return res.json({ questions: generateFallbackQuestions(studyMaterial, difficulty) });
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        console.error('No text in Gemini response');
        return res.json({ questions: generateFallbackQuestions(studyMaterial, difficulty) });
      }

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('No JSON found in response');
        return res.json({ questions: generateFallbackQuestions(studyMaterial, difficulty) });
      }

      const questions = JSON.parse(jsonMatch[0]);
      res.json({ questions: Array.isArray(questions) ? questions : generateFallbackQuestions(studyMaterial, difficulty) });
      
    } catch (error) {
      console.error('Error generating questions:', error);
      res.json({ questions: generateFallbackQuestions(studyMaterial, difficulty) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
