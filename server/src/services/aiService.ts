import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { logger } from '../utils/logger';

let genAI: GoogleGenerativeAI | null = null;
if (config.geminiApiKey) {
  genAI = new GoogleGenerativeAI(config.geminiApiKey);
}

export class AIService {
  static async reviewResume(resumeText: string): Promise<{
    score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    suggestedKeywords: string[];
  }> {
    try {
      if (genAI) {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Analyze this resume and provide structured JSON review:
        Format:
        {
          "score": number between 0 and 100,
          "summary": "overall summary",
          "strengths": ["point 1", "point 2"],
          "improvements": ["suggestion 1", "suggestion 2"],
          "suggestedKeywords": ["keyword1", "keyword2"]
        }
        Resume Content: ${resumeText.substring(0, 3000)}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (err: any) {
      logger.warn(`AI Resume Review falling back to template analyzer: ${err.message}`);
    }

    // Fallback Mock AI Engine for immediate local execution
    const wordsCount = resumeText.split(/\s+/).length;
    const score = Math.min(95, Math.max(65, Math.floor(wordsCount / 5) + 60));

    return {
      score: score,
      summary: "Strong candidate profile with relevant experience in modern tech stacks.",
      strengths: [
        "Clear professional experience timeline",
        "Demonstrated technical skills in modern frameworks",
        "Good impact statements and metrics"
      ],
      improvements: [
        "Add more quantifiable business metrics (e.g. % performance increase)",
        "Highlight leadership or cross-functional team collaboration",
        "Include links to live projects or GitHub repositories"
      ],
      suggestedKeywords: ["React", "TypeScript", "Node.js", "Docker", "CI/CD", "PostgreSQL", "Cloud Architecture"]
    };
  }

  static async generateBio(skills: string[], role: string, experience: string): Promise<string> {
    try {
      if (genAI) {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Generate an impressive, engaging, and professional 3-sentence bio for a social networking platform (like LinkedIn/Twitter). 
        Target Role: ${role}
        Skills: ${skills.join(', ')}
        Background/Experience: ${experience}`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      }
    } catch (err: any) {
      logger.warn(`AI Bio Generator fallback: ${err.message}`);
    }

    return `Passionate ${role} specialized in ${skills.slice(0, 4).join(', ')}. Driven by building scalable, human-centric software solutions that deliver high impact. Always exploring next-gen AI technologies and networking with tech innovators.`;
  }

  static async generatePost(topic: string, tone: 'professional' | 'casual' | 'inspirational' | 'tech'): Promise<string> {
    try {
      if (genAI) {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Write a viral, high-engagement social media post for tech professionals on ConnectHub AI.
        Topic: ${topic}
        Tone: ${tone}
        Include appropriate emojis and 3-4 trending hashtags.`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      }
    } catch (err: any) {
      logger.warn(`AI Post Generator fallback: ${err.message}`);
    }

    return `🚀 Exciting insights on ${topic}!\n\nAs we scale modern tech architectures, focusing on clean code, automated testing, and developer experience is paramount.\n\nKey takeaways:\n1. Prioritize developer workflow efficiency.\n2. Embrace AI-assisted tools responsibly.\n3. Measure real user impact.\n\nWhat are your thoughts on this? Let's discuss in the comments below! 👇\n\n#TechLeadership #${topic.replace(/\s+/g, '')} #ConnectHubAI #SoftwareEngineering`;
  }

  static async recommendSkills(currentSkills: string[], targetRole: string): Promise<string[]> {
    try {
      if (genAI) {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Given target role "${targetRole}" and current skills [${currentSkills.join(', ')}], return a JSON array of 5 recommended skills to learn next. Format: ["Skill1", "Skill2", ...]`;
        const result = await model.generateContent(prompt);
        const jsonMatch = result.response.text().match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
    } catch (err: any) {
      logger.warn(`AI Skill recommender fallback: ${err.message}`);
    }

    const pool = ['GraphQL', 'Kubernetes', 'System Design', 'Redis', 'AWS Cloud Architect', 'Rust', 'WebAssembly', 'Tailwind CSS', 'AI Engineering'];
    return pool.filter(s => !currentSkills.includes(s)).slice(0, 5);
  }

  static async moderateContent(text: string): Promise<{ isSafe: boolean; flagReason?: string }> {
    const prohibitedKeywords = ['spam_scam_xyz', 'toxic_hate_speech_keyword', 'malware_link_fake'];
    const containsProhibited = prohibitedKeywords.some(k => text.toLowerCase().includes(k));

    if (containsProhibited) {
      return { isSafe: false, flagReason: 'Content violates community guidelines (spam/harmful text).' };
    }
    return { isSafe: true };
  }
}
