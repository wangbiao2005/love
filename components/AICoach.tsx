
import React, { useState, useRef, useEffect } from 'react';
import { Goal, Task, ChatMessage, JournalEntry, UserStats, CoachMode, AITaskPlan, AIGoalPlan } from '../types';
import { getCoachAdvice } from '../services/geminiService';
import { Send, Bot, User, Sparkles, Heart, Sword, BrainCircuit, ListPlus, CheckCircle2, Target, PlusCircle } from 'lucide-react';

interface AICoachProps {
  goals: Goal[];
  tasks: Task[];
  journalEntries: JournalEntry[];
  focusMinutes: number;
  userStats: UserStats;
  onAcceptTaskPlan: (plan: AITaskPlan) => void;
  onAcceptGoalPlan: (plan: AIGoalPlan) => void;
}

const MODES: { id: CoachMode; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'empathetic', label: '治愈系', icon: Heart, color: 'text-rose-500 bg-rose-50 border-rose-100', desc: '温柔倾听，心理疏导' },
    { id: 'strict', label: '斯巴达', icon: Sword, color: 'text-red-600 bg-red-50 border-red-100', desc: '严厉鞭策，拒绝借口' },
    { id: 'strategic', label: '战略家', icon: BrainCircuit, color: 'text-indigo-600 bg-indigo-50 border-indigo-100', desc: '理性分析，方法至上' },
];

const QUICK_PROMPTS = [
    "📅 生成今天的行动计划",
    "😫 我不想动，骂醒我",
    "🧠 帮我深度复盘这一周",
    "⚡️ 给我一点能量和鼓励",
    "🎯 我想学一项新技能，帮我规划",
    "🧘 我很焦虑，怎么缓解？"
];

const AICoach: React.FC<AICoachProps> = ({ goals, tasks, journalEntries, focusMinutes, userStats, onAcceptTaskPlan, onAcceptGoalPlan }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'model', text: '你好！我是 LifeFlow 人生教练。我会综合你的专注时长、日记心情和目标进度，为你提供最贴心的建议。请选择上面的模式，或者直接告诉我你的烦恼。', timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<CoachMode>('empathetic');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const parseAIResponse = (text: string): { cleanText: string; taskPlan?: AITaskPlan; goalPlan?: AIGoalPlan } => {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
          try {
              const data = JSON.parse(jsonMatch[1]);
              const cleanText = text.replace(jsonMatch[0], "").trim();
              if (data.taskPlan && Array.isArray(data.taskPlan.items)) {
                  return { cleanText, taskPlan: data.taskPlan };
              }
              if (data.goalPlan && Array.isArray(data.goalPlan.milestones)) {
                  return { cleanText, goalPlan: data.goalPlan };
              }
          } catch (e) {
              console.error("Failed to parse AI Plan JSON", e);
          }
      }
      return { cleanText: text };
  };

  const handleSendMessage = async (e: React.FormEvent, overrideText?: string) => {
    e.preventDefault();
    const textToSend = overrideText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const rawResponse = await getCoachAdvice(userMsg.text, { goals, tasks, journalEntries, focusMinutes, userStats }, mode);
    const { cleanText, taskPlan, goalPlan } = parseAIResponse(rawResponse);

    setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: cleanText, 
        timestamp: Date.now(),
        taskPlan,
        goalPlan
    }]);
    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col glass-panel rounded-3xl shadow-2xl overflow-hidden border border-white/60">
      {/* Header & Persona Switcher */}
      <div className="p-4 border-b border-slate-100/50 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg"><Bot size={20} /></div>
            <div><h3 className="font-bold text-slate-800">AI 人生教练</h3><p className="text-xs text-slate-500">当前模式: {MODES.find(m => m.id === mode)?.label}</p></div>
        </div>
        <div className="flex gap-2 bg-slate-100/50 p-1 rounded-xl">
            {MODES.map(m => (
                <button 
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${mode === m.id ? 'bg-white shadow-sm ring-1 ring-black/5 ' + m.color.split(' ')[0] : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                >
                    <m.icon size={14} /> {m.label}
                </button>
            ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-slate-50/30">
        {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-100 text-teal-600'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-sm' : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100'}`}>
                    {msg.text}
                </div>
              </div>

              {/* AI Task Plan Card */}
              {msg.taskPlan && (
                  <div className="mt-2 ml-10 max-w-[85%] w-64 bg-white rounded-2xl border border-teal-100 shadow-md overflow-hidden animate-in zoom-in-95 origin-top-left">
                      <div className="bg-teal-50/80 px-4 py-3 border-b border-teal-100 flex items-center justify-between">
                          <h4 className="font-bold text-teal-800 text-sm flex items-center gap-2"><Sparkles size={14}/> {msg.taskPlan.title}</h4>
                      </div>
                      <div className="p-3 space-y-2">
                          {msg.taskPlan.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                                  <div className={`w-1.5 h-1.5 rounded-full ${item.priority === 'high' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                                  <span className="truncate">{item.title}</span>
                              </div>
                          ))}
                          {msg.taskPlan.items.length > 3 && <p className="text-[10px] text-slate-400 pl-3">...还有 {msg.taskPlan.items.length - 3} 项</p>}
                      </div>
                      <button 
                        onClick={() => onAcceptTaskPlan(msg.taskPlan!)}
                        className="w-full py-3 bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-1"
                      >
                          <ListPlus size={14} /> 采纳并加入今日计划
                      </button>
                  </div>
              )}

              {/* AI Goal Plan Card */}
              {msg.goalPlan && (
                  <div className="mt-2 ml-10 max-w-[85%] w-64 bg-white rounded-2xl border border-indigo-100 shadow-md overflow-hidden animate-in zoom-in-95 origin-top-left">
                      <div className="bg-indigo-50/80 px-4 py-3 border-b border-indigo-100 flex items-center justify-between">
                          <h4 className="font-bold text-indigo-800 text-sm flex items-center gap-2"><Target size={14}/> 长期目标蓝图</h4>
                      </div>
                      <div className="p-4 space-y-3">
                          <div>
                            <h5 className="font-bold text-slate-800 text-sm">{msg.goalPlan.title}</h5>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{msg.goalPlan.description}</p>
                          </div>
                          <div className="flex gap-2">
                             <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">难度: {msg.goalPlan.difficulty}</span>
                             <span className="text-[10px] px-2 py-0.5 bg-indigo-100 rounded-full text-indigo-600">{msg.goalPlan.milestones.length} 个阶段</span>
                          </div>
                      </div>
                      <button 
                        onClick={() => onAcceptGoalPlan(msg.goalPlan!)}
                        className="w-full py-3 bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
                      >
                          <PlusCircle size={14} /> 创建此目标
                      </button>
                  </div>
              )}

            </div>
        ))}
        {isLoading && <div className="flex gap-2 ml-2"><div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center"><Bot size={14} className="text-teal-600"/></div><div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div></div></div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/60 backdrop-blur-md border-t border-white/50">
        {/* Quick Prompts */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
            {QUICK_PROMPTS.map((prompt, idx) => (
                <button 
                    key={idx} 
                    onClick={(e) => handleSendMessage(e, prompt)}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-teal-400 hover:text-teal-600 whitespace-nowrap shadow-sm transition-colors"
                >
                    {prompt}
                </button>
            ))}
        </div>
        
        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={`向${MODES.find(m => m.id === mode)?.label}提问...`} className="flex-1 border-0 bg-white ring-1 ring-slate-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm shadow-sm" />
          <button type="submit" disabled={!inputValue.trim() || isLoading} className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center transition-all"><Send size={16} /></button>
        </form>
      </div>
    </div>
  );
};
export default AICoach;
