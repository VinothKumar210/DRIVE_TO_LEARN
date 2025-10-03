import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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
    const { sessionId, stats } = req.body;
    
    // Here you could store the final results
    // For now, just return success
    res.json({ 
      success: true, 
      message: "Game session ended",
      finalScore: stats?.score || 0
    });
  });

  // Questions generation endpoint (fallback)
  app.post("/api/questions/generate", async (req, res) => {
    const { studyMaterial, difficulty = 'medium' } = req.body;
    
    if (!studyMaterial || studyMaterial.trim().length === 0) {
      return res.status(400).json({ 
        error: "Study material is required" 
      });
    }

    try {
      // This is a fallback - the frontend should use Gemini API directly
      // But we can provide server-side generation as backup
      
      const words = studyMaterial.split(/\s+/).filter((word: string) => word.length > 3);
      const sentences = studyMaterial.split(/[.!?]+/).filter((s: string) => s.trim().length > 10);
      
      const questions = [];
      
      for (let i = 0; i < Math.min(5, sentences.length); i++) {
        const sentence = sentences[i].trim();
        const keyWords = words.slice(i * 3, (i + 1) * 3);
        
        if (keyWords.length >= 2) {
          questions.push({
            id: `server_q${i + 1}`,
            question: `Based on the study material, what is the main focus of: "${sentence.substring(0, 60)}..."?`,
            options: [
              `${keyWords[0]} is the primary concept`,
              `${keyWords[1] || 'Secondary concepts'} are more important`,
              `This relates to ${keyWords[2] || 'general knowledge'}`,
              `None of the above statements are accurate`
            ],
            correctAnswer: 0,
            explanation: `According to the study material, ${keyWords[0]} appears to be a central topic discussed in this context.`,
            difficulty
          });
        }
      }
      
      // Ensure minimum questions
      while (questions.length < 3) {
        questions.push({
          id: `server_q${questions.length + 1}`,
          question: "What type of content does this study material represent?",
          options: [
            "Educational or academic content",
            "Creative or fictional writing", 
            "Technical documentation",
            "Personal correspondence"
          ],
          correctAnswer: 0,
          explanation: "Based on the structure and content, this appears to be educational material designed for learning.",
          difficulty: 'easy'
        });
      }
      
      res.json({ questions });
      
    } catch (error) {
      console.error('Error generating questions:', error);
      res.status(500).json({ 
        error: "Failed to generate questions",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
