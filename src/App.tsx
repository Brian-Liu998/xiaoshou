import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BookOpen, Sparkles, Loader2, AlignLeft, Type, PenTool } from 'lucide-react';
import Markdown from 'react-markdown';

const GENRES = [
  { id: 'scifi', label: '科幻题材', desc: '星际、未来、赛博朋克' },
  { id: 'xianxia', label: '修仙题材', desc: '修真、飞升、法宝' },
  { id: 'postapoc', label: '末世题材', desc: '废土、丧尸、生存' },
  { id: 'fantasy', label: '奇幻魔法', desc: '剑与魔法、异世界' },
  { id: 'urban', label: '现代都市', desc: '职场、恋爱、日常' },
  { id: 'mystery', label: '悬疑推理', desc: '探案、惊悚、解谜' },
];

const WORD_COUNTS = [
  { id: 'short', label: '短篇 (~5000字)', value: 5000 },
  { id: 'medium', label: '中篇 (~20000字)', value: 20000 },
  { id: 'long', label: '长篇 (~50000字)', value: 50000 },
];

export default function App() {
  const [outline, setOutline] = useState('');
  const [genre, setGenre] = useState(GENRES[0].id);
  const [wordCount, setWordCount] = useState(WORD_COUNTS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!outline.trim()) {
      setError('请输入故事大纲');
      return;
    }
    
    setError('');
    setIsGenerating(true);
    setResult('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const selectedGenre = GENRES.find(g => g.id === genre)?.label;
      const selectedWordCount = WORD_COUNTS.find(w => w.id === wordCount)?.value;

      const prompt = `你是一位顶级的畅销书小说家。请根据以下要求创作一篇小说：

题材：${selectedGenre}
目标字数：大约 ${selectedWordCount} 字
故事大纲：
${outline}

要求：
1. **必须包含一个吸引人的小说标题**（放在最开头，使用一级标题格式）。
2. **必须按照章节结构进行创作**（例如：第一章、第二章等，使用二级标题格式）。
3. 文笔流畅，富有感染力，符合所选题材的风格。
4. 结构完整，包含起承转合。
5. 人物形象生动，对话自然。
6. 请直接输出小说内容，不需要任何额外的解释或开场白。`;

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: '你是一位专业的小说家，擅长各种题材的文学创作。',
          temperature: 0.8,
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          setResult(prev => prev + chunk.text);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '生成过程中发生错误，请重试。');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col md:flex-row">
      {/* Sidebar / Controls */}
      <aside className="w-full md:w-[400px] lg:w-[440px] bg-white border-r border-stone-200 md:h-screen flex flex-col shadow-sm z-10 shrink-0">
        <div className="p-6 border-b border-stone-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <PenTool size={20} />
          </div>
          <div>
            <h1 className="font-semibold text-lg tracking-tight">AI 小说创作助手</h1>
            <p className="text-xs text-stone-500">输入大纲，一键生成精彩故事</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Outline */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <AlignLeft size={16} className="text-indigo-500" />
              故事大纲
            </label>
            <textarea
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              placeholder="例如：一个普通的程序员在加班时意外发现了一段可以修改现实世界的代码，从此卷入了一场跨越维度的危机..."
              className="w-full h-40 p-4 bg-stone-50 border border-stone-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm leading-relaxed"
            />
          </div>

          {/* Genre */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <BookOpen size={16} className="text-indigo-500" />
              小说类型
            </label>
            <div className="grid grid-cols-2 gap-3">
              {GENRES.map(g => (
                <button
                  key={g.id}
                  onClick={() => setGenre(g.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    genre === g.id 
                      ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' 
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className={`text-sm font-medium ${genre === g.id ? 'text-indigo-700' : 'text-stone-700'}`}>
                    {g.label}
                  </div>
                  <div className="text-xs text-stone-500 mt-1">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Word Count */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <Type size={16} className="text-indigo-500" />
              字数限制
            </label>
            <div className="flex bg-stone-100 p-1 rounded-xl">
              {WORD_COUNTS.map(w => (
                <button
                  key={w.id}
                  onClick={() => setWordCount(w.id)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    wordCount === w.id
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {w.label.split(' ')[0]}
                </button>
              ))}
            </div>
            <p className="text-xs text-stone-500 text-center">
              目标生成字数：{WORD_COUNTS.find(w => w.id === wordCount)?.label}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-stone-100 bg-stone-50/50">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-sm shadow-indigo-200"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                正在创作中...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                开始创作
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content / Output */}
      <main className="flex-1 h-[50vh] md:h-screen overflow-y-auto bg-[#fdfbf7] relative">
        {result ? (
          <div className="max-w-3xl mx-auto py-12 px-6 md:py-16 md:px-12">
            <div className="prose prose-stone prose-lg max-w-none prose-p:leading-relaxed prose-p:text-stone-800 font-serif">
              <Markdown>{result}</Markdown>
            </div>
            {isGenerating && (
              <div className="mt-8 flex items-center gap-2 text-stone-400 text-sm">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                AI 正在奋笔疾书...
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 p-8 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-stone-100 flex items-center justify-center">
              <BookOpen size={40} className="text-stone-300" />
            </div>
            <h2 className="text-xl font-medium text-stone-600 mb-2">等待灵感降临</h2>
            <p className="max-w-md text-stone-500">
              在左侧输入你的故事大纲，选择题材和字数，AI 将为你生成一篇精彩的小说。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
