interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export async function generateQuestions(studyMaterial: string, difficulty: string = 'medium'): Promise<any[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'fallback_key';
  
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

  try {
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
      return generateFallbackQuestions(studyMaterial);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('No text in Gemini response');
      return generateFallbackQuestions(studyMaterial);
    }

    // Clean the response to extract JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON found in response');
      return generateFallbackQuestions(studyMaterial);
    }

    const questions = JSON.parse(jsonMatch[0]);
    return Array.isArray(questions) ? questions : generateFallbackQuestions(studyMaterial);
    
  } catch (error) {
    console.error('Error generating questions:', error);
    return generateFallbackQuestions(studyMaterial);
  }
}

function generateFallbackQuestions(studyMaterial: string) {
  // Generate basic questions from the study material
  const words = studyMaterial.split(/\s+/).filter(word => word.length > 3);
  const sentences = studyMaterial.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
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
        difficulty: 'medium'
      });
    }
  }
  
  // Ensure we have at least 3 questions
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
