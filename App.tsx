
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import GoalManager from './components/GoalManager';
import DailyPlanner from './components/DailyPlanner';
import AICoach from './components/AICoach';
import FocusTimer from './components/FocusTimer';
import Journal from './components/Journal';
import { ViewState, Goal, Task, JournalEntry, AIConfig, AIProvider, UserStats, DailyQuote, ToastMessage, Difficulty, AITaskPlan, AIGoalPlan } from './types';
import { X, Key, Download, Upload, Camera, Unlock, Lock, CheckCircle2, Globe, Zap, Database, HelpCircle, Sparkles, Compass, ArrowRight, PenLine } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateDailyQuote } from './services/geminiService';

const INITIAL_TASKS: Task[] = [{ id: 'welcome-1', title: '👋 欢迎来到 LifeFlow！探索你的成长系统', completed: false, date: new Date().toISOString().split('T')[0], priority: 'high', difficulty: 'easy' }];
const INITIAL_STATS: UserStats = { level: 1, currentXP: 0, totalXP: 0, streakDays: 1, lastActiveDate: new Date().toISOString().split('T')[0], lifeVision: '' };
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

const XP_RATES = {
  task_easy: 10,
  task_medium: 30,
  task_hard: 50,
  milestone: 20,
  goal_easy: 100,
  goal_medium: 250,
  goal_hard: 500,
  focus_session: 25,
  journal_entry: 15
};

const LEVEL_TITLES = [
    { level: 1, title: "初学者", desc: "踏上旅程，一切皆有可能" }, 
    { level: 2, title: "实践者", desc: "知行合一，迈出坚实步伐" }, 
    { level: 3, title: "探索者", desc: "保持好奇，寻找内心热情" },
    { level: 4, title: "进取者", desc: "勇于突破，挑战自我极限" }, 
    { level: 5, title: "破壁人", desc: "打破常规，重塑思维认知" }, 
    { level: 6, title: "坚毅者", desc: "风雨无阻，保持深度专注" },
    { level: 7, title: "远见者", desc: "登高望远，布局长远未来" }, 
    { level: 8, title: "追光者", desc: "心有光芒，成为他人榜样" }, 
    { level: 9, title: "贤者", desc: "智慧从容，洞察世间万物" }, 
    { level: 10, title: "大师", desc: "行云流水，人生即是艺术" },
    { level: 11, title: "宗师", desc: "登峰造极，开创一代宗风" },
    { level: 12, title: "传奇", desc: "你的故事，将被世人传颂" },
    { level: 13, title: "半神", desc: "超越凡俗，触碰神性边缘" },
    { level: 14, title: "星灵", desc: "如星辰般，指引迷途旅人" },
    { level: 15, title: "光辉", desc: "自身即光，照亮无尽黑暗" },
    { level: 16, title: "永恒", desc: "精神不朽，跨越时间长河" },
    { level: 17, title: "创世", desc: "心念一动，创造崭新世界" },
    { level: 18, title: "虚空", desc: "包容万有，归于无尽虚空" },
    { level: 19, title: "奇点", desc: "万物归一，也是万物起源" },
    { level: 20, title: "LifeFlow", desc: "与生命之流合二为一" }
];

const WARMTH_MESSAGES = {
  complete: [
    "干得漂亮！", "离梦想又近了一步。", "今天的你闪闪发光。", "积跬步以至千里。", "太棒了，保持这个节奏！", 
    "为你的坚持点赞。", "效率满分！", "小确幸：又搞定一件。", "你的努力，时间看得到。", "优秀是一种习惯。", 
    "今天的汗水是未来的礼物。", "势如破竹！"
  ],
  add: [
    "好的开始是成功的一半。", "不仅是计划，更是承诺。", "让我们把想法变成现实。", "新的挑战，新的机遇。", 
    "专注于当下的每一小步。", "写下它，然后实现它。", "种下一棵树最好的时间是现在。", "明确的目标是动力的源泉。"
  ],
  milestone: [
    "里程碑达成！为你骄傲。", "这一步至关重要。", "正在重塑更好的自己。", "坚持就是胜利。", 
    "你的努力没有白费。", "离终点更近了！", "这一刻值得铭记。"
  ],
  focus: [
    "专注的时光最迷人。", "心流状态达成。", "享受这段宁静的奋斗时光。", "你的专注力正在提升。", 
    "世界很吵，保持内心安静。", "沉浸其中，乐在其中。", "高质量的时间投入。"
  ],
  encouragement: [
    "没关系，休息是为了更好地出发。", "明天又是新的一天。", "接纳不完美的自己。", "慢慢来，比较快。", 
    "允许自己暂停，但不要停止。", "调整呼吸，重新找回节奏。", "别太苛求自己，你已经做得很好了。"
  ]
};

const getRandomWarmth = (type: keyof typeof WARMTH_MESSAGES) => {
  const msgs = WARMTH_MESSAGES[type];
  return msgs[Math.floor(Math.random() * msgs.length)];
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [lifeVisionInput, setLifeVisionInput] = useState('');

  const [aiConfig, setAiConfig] = useState<AIConfig>({ provider: 'gemini', apiKey: '', baseUrl: '', modelName: DEFAULT_GEMINI_MODEL });
  
  const [goals, setGoals] = useState<Goal[]>(() => JSON.parse(localStorage.getItem('unigrow_goals') || '[]'));
  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem('unigrow_tasks') || JSON.stringify(INITIAL_TASKS)));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => JSON.parse(localStorage.getItem('unigrow_journal') || '[]'));
  const [focusMinutes, setFocusMinutes] = useState<number>(() => parseInt(localStorage.getItem('unigrow_focus_minutes') || '0'));
  const [userStats, setUserStats] = useState<UserStats>(() => JSON.parse(localStorage.getItem('unigrow_user_stats') || JSON.stringify(INITIAL_STATS)));
  
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
      const storedConfig = localStorage.getItem('unigrow_ai_config');
      if (storedConfig) setAiConfig(JSON.parse(storedConfig));
      else { const old = localStorage.getItem('unigrow_api_key'); if (old) setAiConfig(p => ({...p, apiKey: old})); }
      
      // Check for Life Vision Onboarding
      if (!userStats.lifeVision) {
          setIsOnboardingOpen(true);
      }
  }, []);

  useEffect(() => { localStorage.setItem('unigrow_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('unigrow_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('unigrow_journal', JSON.stringify(journalEntries)); }, [journalEntries]);
  useEffect(() => { localStorage.setItem('unigrow_focus_minutes', focusMinutes.toString()); }, [focusMinutes]);
  useEffect(() => { localStorage.setItem('unigrow_user_stats', JSON.stringify(userStats)); }, [userStats]);

  useEffect(() => {
      const loadQuote = async () => {
          const today = new Date().toISOString().split('T')[0];
          const saved = localStorage.getItem('unigrow_daily_quote');
          if (saved && JSON.parse(saved).date === today) { setDailyQuote(JSON.parse(saved)); return; }
          
          const quote = await generateDailyQuote(goals);
          if (quote) {
              const newQuote = { ...quote, date: today };
              setDailyQuote(newQuote);
              localStorage.setItem('unigrow_daily_quote', JSON.stringify(newQuote));
          }
      };
      loadQuote();
  }, [goals]);

  const triggerToast = (text: string, type: 'success' | 'info' | 'encouragement') => {
      const id = Date.now().toString() + Math.random();
      
      // Clean up any potentially stuck timers immediately
      if (Object.keys(toastTimersRef.current).length > 5) {
          Object.values(toastTimersRef.current).forEach(clearTimeout);
          toastTimersRef.current = {};
          setToasts([]);
      }

      setToasts(prev => {
          const newState = [...prev, { id, text, type }];
          // Limit max toasts to 3 to prevent clutter
          if (newState.length > 3) return newState.slice(newState.length - 3);
          return newState;
      });

      // Set a robust timer
      const timer = setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
          delete toastTimersRef.current[id];
      }, 3000); // 3 seconds duration
      
      toastTimersRef.current[id] = timer;
  };

  // Cleanup timers on unmount
  useEffect(() => {
      return () => Object.values(toastTimersRef.current).forEach(clearTimeout);
  }, []);

  const addXp = (amount: number) => {
    setUserStats(prev => {
      const newTotal = prev.totalXP + amount;
      // NEW QUADRATIC FORMULA: TotalXP = 250 * (Level-1)^2
      // Inverse: Level = sqrt(TotalXP / 250) + 1
      const newLevel = Math.floor(Math.sqrt(newTotal / 250)) + 1;
      
      const maxLevel = LEVEL_TITLES.length;
      const finalLevel = Math.min(newLevel, maxLevel);

      if (finalLevel > prev.level) {
         confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
         triggerToast(`升级了！Lv.${finalLevel} ${LEVEL_TITLES[finalLevel-1]?.title}`, "success");
      }
      return { ...prev, level: finalLevel, currentXP: newTotal, totalXP: newTotal };
    });
  };

  const handleGoalAction = (action: 'create' | 'milestone' | 'complete', difficulty?: Difficulty) => {
    if (action === 'create') {
        addXp(5);
        triggerToast(getRandomWarmth('add'), 'success');
    } else if (action === 'milestone') {
        addXp(XP_RATES.milestone);
        triggerToast(getRandomWarmth('milestone'), 'success');
    } else if (action === 'complete') {
        const diff = difficulty || 'medium';
        const xpAmount = XP_RATES[`goal_${diff}` as keyof typeof XP_RATES];
        addXp(xpAmount);
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        triggerToast(`目标达成！获得 ${xpAmount} XP！`, 'encouragement');
    }
  };

  const handleAddToDailyPlan = (goalId: string, milestoneId: string, title: string, difficulty: Difficulty) => {
    setTasks(prev => [...prev, {
      id: Date.now().toString(),
      title: title,
      completed: false,
      date: new Date().toISOString().split('T')[0],
      priority: 'medium',
      relatedGoalId: goalId,
      relatedMilestoneId: milestoneId,
      difficulty: difficulty
    }]);
    triggerToast(getRandomWarmth('add'), "info");
    setCurrentView('planner');
  };

  const handleAcceptAITaskPlan = (plan: AITaskPlan) => {
      const today = new Date().toISOString().split('T')[0];
      const newTasks: Task[] = plan.items.map((item, idx) => ({
          id: `${Date.now()}-${idx}`,
          title: item.title,
          completed: false,
          date: today,
          priority: item.priority,
          difficulty: item.difficulty,
          relatedGoalId: undefined
      }));
      setTasks(prev => [...prev, ...newTasks]);
      triggerToast(`已添加 ${newTasks.length} 个任务到今日计划`, 'success');
      setCurrentView('planner');
  };

  const handleAcceptAIGoal = (plan: AIGoalPlan) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: plan.title,
      description: plan.description,
      category: plan.category || 'skill',
      difficulty: plan.difficulty || 'medium',
      progress: 0,
      milestones: plan.milestones.map((m, idx) => ({
        id: `${Date.now()}-milestone-${idx}`,
        title: m,
        completed: false
      }))
    };
    setGoals(prev => [...prev, newGoal]);
    triggerToast(`目标 "${plan.title}" 已创建！`, 'success');
    setCurrentView('goals');
    handleGoalAction('create');
  };

  const handleTaskToggle = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const newStatus = !t.completed;
      
      // Bidirectional Sync: If task is linked to a goal milestone
      if (t.relatedGoalId && t.relatedMilestoneId) {
         setGoals(prevGoals => prevGoals.map(g => {
             if (g.id !== t.relatedGoalId) return g;
             
             // Update the specific milestone
             const updatedMilestones = g.milestones.map(m => 
                 m.id === t.relatedMilestoneId ? { ...m, completed: newStatus } : m
             );
             
             const completedCount = updatedMilestones.filter(m => m.completed).length;
             const progress = Math.round((completedCount / updatedMilestones.length) * 100);
             
             // Trigger Completion Logic ONLY if transitioning to 100% (not if unchecking)
             if (newStatus && progress === 100 && g.progress !== 100) {
                 handleGoalAction('complete', g.difficulty);
             } else if (newStatus) {
                 // Only trigger milestone XP if we are checking it (not unchecking)
                 handleGoalAction('milestone');
             }
             
             return { ...g, milestones: updatedMilestones, progress };
         }));
      }

      if (newStatus) {
        const xpGain = XP_RATES[`task_${t.difficulty}` as keyof typeof XP_RATES] || 10;
        addXp(xpGain);
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
        triggerToast(`${getRandomWarmth('complete')} (+${xpGain} XP)`, "success");
      }
      return { ...t, completed: newStatus };
    }));
  };

  const handleSaveConfig = () => { localStorage.setItem('unigrow_ai_config', JSON.stringify(aiConfig)); setIsSettingsOpen(false); triggerToast("设置已保存", "success"); };
  const handleProviderChange = (p: AIProvider) => {
      if (p === 'deepseek') setAiConfig(prev => ({ ...prev, provider: p, baseUrl: 'https://api.deepseek.com', modelName: 'deepseek-chat' }));
      else if (p === 'gemini') setAiConfig(prev => ({ ...prev, provider: p, baseUrl: '', modelName: DEFAULT_GEMINI_MODEL }));
      else setAiConfig(prev => ({ ...prev, provider: p }));
  };
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]; if (!f || f.size > 2097152) return;
      const r = new FileReader(); r.onloadend = () => setUserStats(p => ({...p, avatar: r.result as string})); r.readAsDataURL(f);
  };
  const exportData = () => {
      const blob = new Blob([JSON.stringify({ goals, tasks, journalEntries, focusMinutes, userStats, aiConfig })], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `lifeflow_backup_${new Date().toISOString().split('T')[0]}.json`; a.click();
  };
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]; if (!f) return;
      const r = new FileReader(); r.onload = (ev) => { try { const d = JSON.parse(ev.target?.result as string); if(d.goals) setGoals(d.goals); if(d.tasks) setTasks(d.tasks); if(d.userStats) setUserStats(d.userStats); if(d.aiConfig) setAiConfig(d.aiConfig); alert('导入成功'); setIsSettingsOpen(false); } catch(err){alert('文件无效');}}; r.readAsText(f);
  };
  
  const handleSaveLifeVision = () => {
      if (!lifeVisionInput.trim()) return;
      setUserStats(prev => ({ ...prev, lifeVision: lifeVisionInput }));
      setIsOnboardingOpen(false);
      triggerToast("愿景已设定。LifeFlow 将全力辅助你实现它。", "success");
      confetti({ particleCount: 100, spread: 120, origin: { y: 0.6 } });
  };

  const ProviderButton = ({ id, label, icon: Icon }: any) => (
      <button 
          onClick={() => handleProviderChange(id)}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 ${aiConfig.provider === id ? 'border-teal-600 bg-teal-50 text-teal-700 ring-1 ring-teal-600' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
      >
          <Icon size={20} />
          <span className="text-xs font-bold">{label}</span>
          {aiConfig.provider === id && <CheckCircle2 size={14} className="text-teal-600 mt-1" />}
      </button>
  );

  const currentLevelStartXP = 250 * Math.pow(userStats.level - 1, 2);
  const nextLevelStartXP = 250 * Math.pow(userStats.level, 2);
  const xpNeededForNextLevel = nextLevelStartXP - currentLevelStartXP;
  const levelProgress = Math.min(((userStats.totalXP - currentLevelStartXP) / xpNeededForNextLevel) * 100, 100);

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView} onOpenSettings={() => setIsSettingsOpen(true)} onOpenProfile={() => setIsProfileOpen(true)} userStats={userStats} dailyQuote={dailyQuote} toasts={toasts}>
      <div className="animate-in fade-in duration-300">
        {currentView === 'dashboard' && <Dashboard goals={goals} tasks={tasks} focusMinutes={focusMinutes} userStats={userStats} dailyQuote={dailyQuote} journalEntries={journalEntries} onToggleTask={handleTaskToggle} />}
        {currentView === 'planner' && <DailyPlanner tasks={tasks} setTasks={setTasks} goals={goals} onToggleTask={handleTaskToggle} triggerToast={(m, t) => triggerToast(m, t)} />}
        {currentView === 'goals' && <GoalManager goals={goals} setGoals={setGoals} onAddToDailyPlan={handleAddToDailyPlan} onGoalAction={handleGoalAction} triggerToast={triggerToast} />}
        {currentView === 'focus' && <FocusTimer tasks={tasks} onToggleTask={handleTaskToggle} onComplete={(m) => { addXp(XP_RATES.focus_session); setFocusMinutes(p => p + m); triggerToast(getRandomWarmth('focus'), 'success'); }} triggerToast={triggerToast} />}
        {currentView === 'journal' && <Journal entries={journalEntries} setEntries={setJournalEntries} onEntrySaved={() => { addXp(XP_RATES.journal_entry); triggerToast("日志已保存 (+15 XP)", "success"); }} goals={goals} tasks={tasks} focusMinutes={focusMinutes} userStats={userStats} />}
        {currentView === 'coach' && <AICoach goals={goals} tasks={tasks} journalEntries={journalEntries} focusMinutes={focusMinutes} userStats={userStats} onAcceptTaskPlan={handleAcceptAITaskPlan} onAcceptGoalPlan={handleAcceptAIGoal} />}
      </div>
      
      {/* Onboarding Modal */}
      {isOnboardingOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-700">
              <div className="w-full max-w-lg text-center text-white space-y-8 animate-in zoom-in-95 delay-100">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(45,212,191,0.5)] mb-6">
                      <Compass size={48} className="text-white animate-pulse" />
                  </div>
                  <div className="space-y-4">
                      <h1 className="text-3xl font-bold tracking-tight">欢迎开启 LifeFlow 之旅</h1>
                      <p className="text-lg text-slate-300 max-w-md mx-auto leading-relaxed">
                          每一段伟大的旅程，都始于一个方向。<br/>
                          请告诉我们，<span className="text-teal-300 font-bold">你的终极梦想</span> 是什么？<br/>
                          或者，你想成为一个什么样的人？
                      </p>
                  </div>
                  <div className="max-w-md mx-auto relative">
                      <input 
                          type="text" 
                          value={lifeVisionInput}
                          onChange={(e) => setLifeVisionInput(e.target.value)}
                          placeholder="例如：成为一名独立开发者、环游世界、内心平静的人..."
                          className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-center text-lg placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white/20 transition-all text-white"
                          autoFocus
                      />
                  </div>
                  <button 
                      onClick={handleSaveLifeVision}
                      disabled={!lifeVisionInput.trim()}
                      className="bg-white text-teal-900 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-teal-50 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:scale-100 flex items-center gap-2 mx-auto"
                  >
                      开启我的旅程 <ArrowRight size={20} />
                  </button>
              </div>
          </div>
      )}

      {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="bg-slate-900 text-white p-8 relative shrink-0">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                      <button onClick={() => setIsProfileOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white z-20"><X size={24}/></button>
                      <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="relative group mb-4">
                              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl overflow-hidden">{userStats.avatar ? <img src={userStats.avatar} className="w-full h-full rounded-full object-cover"/> : <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400"><Camera size={32}/></div>}</div>
                              <label className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full cursor-pointer shadow-lg"><Camera size={16}/><input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload}/></label>
                          </div>
                          <h2 className="text-2xl font-bold">Lv.{userStats.level} {LEVEL_TITLES[userStats.level-1]?.title}</h2>
                          <div className="w-full max-w-xs mt-4"><div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all" style={{width: `${levelProgress}%`}}></div></div><div className="text-[10px] text-white/60 mt-1 flex justify-between"><span>当前: {userStats.totalXP} XP</span><span>下级: {nextLevelStartXP} XP</span></div></div>
                          
                          {/* Life Vision Edit in Profile */}
                          <div className="mt-6 w-full bg-white/10 rounded-xl p-3 border border-white/10">
                              <p className="text-[10px] uppercase tracking-widest text-teal-300 font-bold mb-1">MY VISION</p>
                              <div className="flex items-center gap-2">
                                  <input 
                                      className="bg-transparent border-none text-center w-full text-white font-serif italic focus:ring-0 p-0 text-sm"
                                      value={userStats.lifeVision || ''}
                                      onChange={(e) => setUserStats(prev => ({...prev, lifeVision: e.target.value}))}
                                      placeholder="点击设置座右铭"
                                  />
                                  <PenLine size={12} className="text-white/40"/>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-3">
                      {LEVEL_TITLES.map(i => (
                          <div key={i.level} className={`p-4 rounded-xl border flex items-center gap-4 ${userStats.level >= i.level ? 'bg-white border-teal-100 shadow-sm' : 'bg-slate-100 opacity-50'}`}>
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${userStats.level >= i.level ? 'bg-teal-100 text-teal-600' : 'bg-slate-200 text-slate-400'}`}>{userStats.level >= i.level ? <Unlock size={20}/> : <Lock size={20}/>}</div>
                              <div><span className="font-bold">Lv.{i.level} {i.title}</span><p className="text-xs text-slate-500">{i.desc}</p></div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in zoom-in-95 duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b flex justify-between items-center bg-white relative z-10">
                      <h3 className="font-bold flex items-center gap-2 text-slate-800"><Key size={20} className="text-teal-600"/> 设置与服务</h3>
                      <button onClick={()=>setIsSettingsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400"/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                      <section className="space-y-4">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider"><Zap size={14}/> 1. 选择 AI 服务商</div>
                          <div className="grid grid-cols-3 gap-3">
                              <ProviderButton id="deepseek" label="DeepSeek" icon={Globe} />
                              <ProviderButton id="gemini" label="Gemini" icon={Sparkles} />
                              <ProviderButton id="custom" label="自定义" icon={Key} />
                          </div>
                          
                          <div className="bg-teal-50/80 rounded-xl p-4 text-sm text-slate-700 border border-teal-100">
                              <div className="flex items-start gap-2">
                                  <HelpCircle size={16} className="text-teal-600 shrink-0 mt-0.5"/>
                                  <div className="space-y-2">
                                      <p className="font-bold text-teal-800">
                                          {aiConfig.provider === 'deepseek' ? '如何获取 DeepSeek Key (推荐国内)' : 
                                           aiConfig.provider === 'gemini' ? '如何获取 Google Gemini Key (免费)' : 
                                           '自定义服务商配置'}
                                      </p>
                                      {aiConfig.provider === 'deepseek' && (
                                          <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-600">
                                              <li>访问 <a href="https://platform.deepseek.com/api_keys" target="_blank" className="text-teal-600 underline font-bold">platform.deepseek.com</a></li>
                                              <li>注册并登录账号</li>
                                              <li>点击 "创建 API Key"，复制 sk- 开头的字符串</li>
                                              <li>粘贴到下方输入框</li>
                                          </ol>
                                      )}
                                      {aiConfig.provider === 'gemini' && (
                                          <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-600">
                                               <li>访问 <a href="https://aistudiocdn.google.com/app/apikey" target="_blank" className="text-teal-600 underline font-bold">Google AI Studio</a></li>
                                               <li>点击 "Get API key" → "Create API key"</li>
                                               <li>复制 AIza 开头的字符串</li>
                                               <li>粘贴到下方输入框 (需魔法上网)</li>
                                          </ol>
                                      )}
                                      {aiConfig.provider === 'custom' && (
                                          <p className="text-xs text-slate-600">请输入兼容 OpenAI 格式的 API 接口地址和密钥。</p>
                                      )}
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-3">
                              <div>
                                  <label className="text-xs font-semibold text-slate-500 mb-1 block">API 密钥 (Key)</label>
                                  <input 
                                    type="password" 
                                    value={aiConfig.apiKey} 
                                    onChange={e=>setAiConfig({...aiConfig,apiKey:e.target.value})} 
                                    placeholder={aiConfig.provider === 'deepseek' ? "sk-..." : aiConfig.provider === 'gemini' ? "AIza..." : "Key..."} 
                                    className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-mono"
                                  />
                              </div>
                              
                              {aiConfig.provider !== 'gemini' && (
                                  <div>
                                      <label className="text-xs font-semibold text-slate-500 mb-1 block">代理地址 (Base URL)</label>
                                      <input 
                                        value={aiConfig.baseUrl} 
                                        onChange={e=>setAiConfig({...aiConfig,baseUrl:e.target.value})} 
                                        placeholder="https://api.deepseek.com" 
                                        className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none font-mono"
                                      />
                                  </div>
                              )}
                          </div>
                      </section>

                      <section className="space-y-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider"><Database size={14}/> 2. 数据安全 & 迁移</div>
                          <div className="grid grid-cols-2 gap-4">
                              <button onClick={exportData} className="flex flex-col items-center justify-center gap-2 p-4 bg-teal-50 border border-teal-100 text-teal-700 rounded-xl hover:bg-teal-100 transition-colors group">
                                  <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform"><Download size={20}/></div>
                                  <span className="text-xs font-bold">导出数据备份</span>
                              </button>
                              <label className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                  <div className="bg-slate-100 p-2 rounded-full group-hover:scale-110 transition-transform"><Upload size={20}/></div>
                                  <span className="text-xs font-bold">恢复数据文件</span>
                                  <input type="file" onChange={importData} className="hidden" accept=".json"/>
                              </label>
                          </div>
                      </section>
                  </div>
                  <div className="p-5 bg-white border-t flex justify-end shadow-[0_-4px_20px_rgba(0,0,0,0.05)] relative z-20">
                      <button onClick={handleSaveConfig} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                          <CheckCircle2 size={18}/> 保存所有配置
                      </button>
                  </div>
              </div>
          </div>
      )}
    </Layout>
  );
};
export default App;
