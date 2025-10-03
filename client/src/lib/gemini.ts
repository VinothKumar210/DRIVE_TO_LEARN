export async function generateQuestions(studyMaterial: string, difficulty: string = 'medium'): Promise<any[]> {
  try {
    const response = await fetch('/api/questions/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studyMaterial,
        difficulty
      })
    });

    if (!response.ok) {
      console.error('Server error generating questions:', response.status);
      return generateFallbackQuestions(studyMaterial);
    }

    const data = await response.json();
    
    if (data.questions && Array.isArray(data.questions)) {
      return data.questions;
    }
    
    console.error('Invalid response format from server');
    return generateFallbackQuestions(studyMaterial);
    
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
