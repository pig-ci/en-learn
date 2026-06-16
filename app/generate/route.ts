// app/generate/route.ts
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// 💡 強制在初始化時傳入 Replit Secrets 的環境變數做防呆
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { level, topic, weakSkill, isFirst } = await request.json();
    const prompt = buildPrompt(level, topic, weakSkill, isFirst);

    // 呼叫 Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // 速度快、極度適合生成短文與選擇題
      contents: prompt,
      config: {
        responseMimeType: "application/json", // 強制要求 Gemini 回傳 JSON 格式
      }
    });

    let text = response.text;
    if (!text) {
      return NextResponse.json({ error: 'Gemini API 回傳內容為空' }, { status: 500 });
    }

    // 💡 終極防呆：過濾掉 Gemini 有時會頑皮夾帶的 Markdown 符號 ```json ... ```
    if (text.includes('```')) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    // 解析乾淨的 JSON 字串
    const articleData = JSON.parse(text);
    return NextResponse.json(articleData);

  } catch (error: any) {
    // 💡 當後端發生崩潰時，這行會把最真實的錯誤原因印在 Replit 下方的 Terminal 中
    console.error('【後端詳細錯誤日誌】:', error);

    // 安全回傳錯誤給前端，不要讓伺服器直接崩潰噴無頭緒的 500 錯誤
    return NextResponse.json({ 
      error: 'AI 老師目前無法回應，請重試', 
      details: error?.message || '未知錯誤' 
    }, { status: 500 });
  }
}

// ── 💡 完美的會考英閱 Prompt 產生器 ──
function buildPrompt(level: string, topic: string, weak: string | null, isFirst: boolean): string {
  const levelGuides: Record<string, { words: string; sentences: string; vocab: string }> = {
    A1: { words: '100-130', sentences: 'Very short and simple sentences.', vocab: 'Basic CEFR A1 vocabulary.' },
    A2: { words: '140-170', sentences: 'Short, clear sentences.', vocab: 'CEFR A2 vocabulary.' },
    'B1': { words: '180-230', sentences: 'Medium-length sentences.', vocab: 'CEFR B1 vocabulary.' },
    'B1+': { words: '220-260', sentences: 'Longer sentences with varied structures.', vocab: 'CEFR B1-B2 vocabulary.' },
    B2: { words: '250-290', sentences: 'Complex sentences.', vocab: 'CEFR B2 vocabulary.' }
  };

  const g = levelGuides[level] || levelGuides['A2'];
  const weakNote = weak ? `The student is weakest at "${weak}" questions — include at least 2 questions of that type.` : `Include a balanced mix of all 4 question types.`;
  const firstNote = isFirst ? `This is the student's FIRST article — use the LOWER end of the word count range.` : '';

  return `You are writing an English reading comprehension exercise for Taiwanese junior high students preparing for CAP (會考).
Level: ${level}
Topic: ${topic}
${firstNote}

=== ARTICLE REQUIREMENTS ===
- Length: ${g.words} words
- Sentences: ${g.sentences}
- Vocabulary: ${g.vocab}
- The article must be INTERESTING. Write 3-4 paragraphs.
${level === 'B1' || level === 'B1+' || level === 'B2' ? '- Underline ONE challenging vocabulary word using <u> tags.' : ''}

=== QUESTION REQUIREMENTS ===
Write EXACTLY 4 questions in CAP multiple-choice format:
1. Main Idea question (type: main, label: 主旨題)
2. Detail question (type: detail, label: 細節題)
3. Inference question (type: inference, label: 推論題)
4. Vocabulary question (type: vocabulary, label: 詞彙題)
${weakNote}

Each question must have 4 options labeled A/B/C/D, one correct answer index (0-3), and a 1-2 sentence Chinese explanation (解析).

=== OUTPUT FORMAT ===
Respond ONLY with valid JSON. No markdown fences:
{
  "title": "...",
  "topic": "...",
  "body": "paragraph1\\n\\nparagraph2",
  "questions": [
    {
      "type": "main",
      "typeLabel": "主旨題",
      "text": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": 0,
      "explanation": "答案是A，因為..."
    }
  ]
}`;
}
