// app/generate/route.ts
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

function safeParseJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch (firstError) {
    console.log('【直接解析失敗，嘗試清理】');
    let clean = text;
    clean = clean.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      console.error('【無法找到 JSON 物件】:', clean.substring(0, 500));
      throw new Error('Gemini 回傳內容不包含有效的 JSON');
    }
    clean = clean.substring(firstBrace, lastBrace + 1);
    clean = clean.replace(/,\s*}/g, '}');
    clean = clean.replace(/,\s*\]/g, ']');
    clean = clean.replace(/,\s*$/, '');
    try {
      return JSON.parse(clean);
    } catch (secondError: any) {
      console.error('【清理後仍無法解析】:', clean.substring(0, 500));
      console.error('【錯誤資訊】:', secondError.message);
      try {
        console.log('【嘗試修復截斷的 JSON】');
        let fixed = clean;
        const openBraces = (fixed.match(/{/g) || []).length;
        const closeBraces = (fixed.match(/}/g) || []).length;
        const openBrackets = (fixed.match(/\[/g) || []).length;
        const closeBrackets = (fixed.match(/\]/g) || []).length;
        for (let i = 0; i < openBraces - closeBraces; i++) fixed += '}';
        for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += ']';
        fixed = fixed.replace(/,\s*$/, '');
        return JSON.parse(fixed);
      } catch (thirdError: any) {
        console.error('【修復截斷仍失敗】:', thirdError.message);
        throw new Error(`JSON 解析失敗: ${secondError.message}`);
      }
    }
  }
}

export async function POST(request: Request) {
  try {
    const { level, topic, weakSkill, isFirst, mode } = await request.json();
    const prompt = buildPrompt(level, topic, weakSkill, isFirst, mode);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 4096,
      }
    });

    let text = response.text;
    if (!text) {
      return NextResponse.json({ error: 'Gemini API 回傳內容為空' }, { status: 500 });
    }

    console.log('【Gemini 原始回應長度】:', text.length);
    console.log('【Gemini 原始回應（前 200 字）】:', text.substring(0, 200));
    console.log('【Gemini 原始回應（最後 100 字）】:', text.substring(Math.max(0, text.length - 100)));

    const articleData = safeParseJSON(text);
    
    if (!articleData.title || !articleData.body || !articleData.questions || !Array.isArray(articleData.questions)) {
      console.error('【缺少必要欄位】:', Object.keys(articleData));
      return NextResponse.json({ 
        error: 'AI 回傳格式不完整', 
        details: '缺少 title、body 或 questions 欄位' 
      }, { status: 500 });
    }

    // 如果是 fill 模式，檢查 fillBlanks 是否存在
    if (mode === 'fill' && (!articleData.fillBlanks || !Array.isArray(articleData.fillBlanks) || articleData.fillBlanks.length === 0)) {
      console.error('【fill 模式缺少 fillBlanks】');
      return NextResponse.json({ 
        error: 'AI 回傳格式不完整', 
        details: '缺少 fillBlanks 欄位或陣列為空' 
      }, { status: 500 });
    }

    return NextResponse.json(articleData);

  } catch (error: any) {
    console.error('【後端詳細錯誤日誌】:', error);
    return NextResponse.json({ 
      error: 'AI 老師目前無法回應，請重試', 
      details: error?.message || '未知錯誤' 
    }, { status: 500 });
  }
}

function buildPrompt(level: string, topic: string, weak: string | null, isFirst: boolean, mode: string): string {
  const levelGuides: Record<string, { words: string; sentences: string; vocab: string }> = {
    A1: { words: '80-100', sentences: 'Very short and simple sentences.', vocab: 'Basic CEFR A1 vocabulary.' },
    A2: { words: '100-130', sentences: 'Short, clear sentences.', vocab: 'CEFR A2 vocabulary.' },
    'B1': { words: '130-160', sentences: 'Medium-length sentences.', vocab: 'CEFR B1 vocabulary.' },
    'B1+': { words: '160-190', sentences: 'Longer sentences with varied structures.', vocab: 'CEFR B1-B2 vocabulary.' },
    B2: { words: '190-220', sentences: 'Complex sentences.', vocab: 'CEFR B2 vocabulary.' }
  };

  const g = levelGuides[level] || levelGuides['A2'];
  const weakNote = weak ? `The student is weakest at "${weak}" questions — include at least 2 questions of that type.` : `Include a balanced mix of all 4 question types.`;
  const firstNote = isFirst ? `This is the student's FIRST article — use the LOWER end of the word count range.` : '';

  let modeInstructions = '';
  let extraFields = '';

  if (mode === 'listening') {
    modeInstructions = `
=== LISTENING MODE ===
- The article will be read aloud, so the body text must be suitable for spoken English (clear, conversational).
- Do NOT include any markdown or HTML tags (like <u>) in the body.
- The student will NOT see the article text on screen. Only the questions will be displayed.
- Keep the length at the lower end of the word range.
`;
  } else if (mode === 'fill') {
    modeInstructions = `
=== FILL-IN-THE-BLANK MODE ===
- The article text will be displayed on screen, but **4 to 6 key words** (nouns, verbs, adjectives, or phrases) will be replaced with "____".
- You must select words that are important for understanding the text and are at an appropriate difficulty for the level.
- For A1/A2 levels, use 4 blanks; for B1 and above, use 5-6 blanks.
- Provide a list of fill-in-the-blank items (fillBlanks) in the JSON output.
- Each item must include:
  - "id": a sequential number starting from 1.
  - "sentence": the exact sentence from the article where the blank occurs, with "____" in place of the keyword.
  - "correctWord": the original word that was removed.
  - "options": an array of 4 words (strings), including the correct word and 3 plausible distractors (same part of speech, similar meaning or common confusion).
  - "hint": (optional) a Chinese hint to help the student, e.g., "這裡需要一個名詞，表示...".
- The article's "body" field must contain the full text with the keywords replaced by "____".
- Keep the article length at the lower end of the word range.
- Additionally, still generate the 4 reading comprehension questions as usual (main, detail, inference, vocabulary).
`;
    extraFields = `, "fillBlanks": [ ... ]`; // 僅用於提示，實際 JSON 會包含
  } else {
    // reading mode
    modeInstructions = `
=== READING MODE ===
- The article will be displayed on screen for reading.
- You may include <u> tags for challenging vocabulary for B1 and above.
`;
  }

  return `You are writing an English reading comprehension exercise for Taiwanese junior high students preparing for CAP (會考).
Level: ${level}
Topic: ${topic}
${firstNote}
${modeInstructions}

=== ARTICLE REQUIREMENTS ===
- Length: ${g.words} words (be concise and precise)
- Sentences: ${g.sentences}
- Vocabulary: ${g.vocab}
- The article must be INTERESTING and ENGAGING. Write 3-4 short paragraphs.

=== QUESTION REQUIREMENTS ===
Write EXACTLY 4 questions in CAP multiple-choice format:
1. Main Idea question (type: main, label: 主旨題)
2. Detail question (type: detail, label: 細節題)
3. Inference question (type: inference, label: 推論題)
4. Vocabulary question (type: vocabulary, label: 詞彙題)
${weakNote}

Each question must have 4 options labeled A/B/C/D, one correct answer index (0-3), and a 1-2 sentence Chinese explanation (解析).

=== OUTPUT FORMAT ===
IMPORTANT: Respond ONLY with valid JSON. No markdown fences, no extra text before or after. 
The response must start with { and end with }.
Keep the body text CONCISE to avoid truncation.

The JSON must include: "title", "topic", "body", "questions"${mode === 'fill' ? ', and "fillBlanks"' : ''}.

Example format for fill mode:
{
  "title": "...",
  "topic": "...",
  "body": "First paragraph with a ____ here.\\n\\nSecond paragraph with another ____.",
  "questions": [ ... ],
  "fillBlanks": [
    {
      "id": 1,
      "sentence": "First paragraph with a ____ here.",
      "correctWord": "blank",
      "options": ["blank", "empty", "hole", "space"],
      "hint": "表示空位的名詞"
    },
    ...
  ]
}`;
}