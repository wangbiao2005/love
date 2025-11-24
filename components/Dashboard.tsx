
import React, { useMemo } from 'react';
import { Goal, Task, UserStats, DailyQuote, JournalEntry } from '../types';
import { CheckCircle2, Target, Activity, Zap, Crown, Sparkles, CheckSquare, Trophy, ArrowRight, Flame, Compass } from 'lucide-react';

interface DashboardProps {
  goals: Goal[];
  tasks: Task[];
  focusMinutes: number;
  userStats: UserStats;
  dailyQuote: DailyQuote | null;
  journalEntries: JournalEntry[];
  onToggleTask: (taskId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ goals, tasks, focusMinutes, userStats, dailyQuote, journalEntries, onToggleTask }) => {
  
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.progress === 100).length;
  
  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(t => t.date === today);
  const completedTasksToday = todaysTasks.filter(t => t.completed).length;
  const completionRate = todaysTasks.length > 0 ? Math.round((completedTasksToday / todaysTasks.length) * 100) : 0;

  // "Next Up" Logic: Top 3 priority tasks, uncompleted, today or overdue
  const nextUpTasks = useMemo(() => {
    return tasks
      .filter(t => !t.completed && t.date <= today)
      .sort((a, b) => {
         // Sort by priority first
         const pMap = { high: 3, medium: 2, low: 1 };
         const pDiff = pMap[b.priority] - pMap[a.priority];
         if (pDiff !== 0) return pDiff;
<<<<<<< HEAD
         // Then by difficulty
=======
         // Then by difficulty (easier first for momentum? or hard first? Let's go with hard first for impact)
>>>>>>> 30a54e1a86f36ae55c759fe561dde835c23905be
         const dMap = { hard: 3, medium: 2, easy: 1 };
         return dMap[b.difficulty] - dMap[a.difficulty];
      })
      .slice(0, 3);
  }, [tasks, today]);

  // "North Star" Logic: Highest progress goal that isn't finished
  const northStarGoal = useMemo(() => {
      return goals
        .filter(g => g.progress < 100)
        .sort((a, b) => b.progress - a.progress)[0];
  }, [goals]);

  // "Activity Heatmap" Logic: Last 7 days activity
  const activityData = useMemo(() => {
      const data = [];
      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const completedCount = tasks.filter(t => t.date === dateStr && t.completed).length;
          // Intensity: 0 (0), 1 (1-2), 2 (3-4), 3 (5+)
          let intensity = 0;
          if (completedCount >= 5) intensity = 3;
          else if (completedCount >= 3) intensity = 2;
          else if (completedCount >= 1) intensity = 1;
          
          data.push({ 
              date: d, 
              label: i === 0 ? '今天' : d.toLocaleDateString('zh-CN', { weekday: 'short' }).replace('周', ''),
              intensity,
              count: completedCount 
          });
      }
      return data;
  }, [tasks]);

  // Smart Insight Logic
  const getSmartInsight = () => {
      const mood = journalEntries.length > 0 ? journalEntries[0].mood : 'neutral';
      
<<<<<<< HEAD
      if (focusMinutes > 60 && completedTasksToday > 3) return "状态绝佳！心流力量。";
      if (focusMinutes > 30) return "专注积累中，继续保持。";
      if (mood === 'bad' || mood === 'terrible') return "完成一件小事也是胜利。";
      if (todaysTasks.length > 5 && completionRate < 20) return "任务多？先做最重要的。";
      if (completedGoals > 0) return "离梦想又近了一步。";
=======
      if (focusMinutes > 60 && completedTasksToday > 3) return "状态绝佳！这就是心流的力量。";
      if (focusMinutes > 30) return "专注力正在积累，继续保持。";
      if (mood === 'bad' || mood === 'terrible') return "哪怕只完成一件小事，也是胜利。";
      if (todaysTasks.length > 5 && completionRate < 20) return "任务有点多？试着先做最重要的那件。";
      if (completedGoals > 0) return "离梦想又近了一步，为你骄傲。";
>>>>>>> 30a54e1a86f36ae55c759fe561dde835c23905be
      return "每一天都是新的开始。";
  };

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
<<<<<<< HEAD
    <div className="bg-white/60 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-sm border border-white/60 flex items-center gap-3 md:gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
      <div className={`p-2 md:p-3 rounded-xl bg-white shadow-sm ${color}`}>
        <Icon size={18} className="md:w-5 md:h-5" />
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
        <p className="text-[10px] md:text-xs text-slate-500 font-medium">{label}</p>
=======
    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/60 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
      <div className={`p-3 rounded-xl bg-white shadow-sm ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
>>>>>>> 30a54e1a86f36ae55c759fe561dde835c23905be
      </div>
    </div>
  );

  const getLevelTitle = (level: number) => {
    const titles = ["初学者", "实践者", "探索者", "进取者", "破壁人", "坚毅者", "远见者", "追光者", "贤者", "大师"];
    return titles[Math.min(level - 1, titles.length - 1)];
  };

  return (
<<<<<<< HEAD
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Mobile Visibility: Vision Banner */}
      <div className="md:hidden bg-teal-50 border border-teal-100 rounded-xl p-3 flex items-center gap-3 mb-2 shadow-sm">
         <div className="bg-teal-100 text-teal-600 p-1.5 rounded-full shrink-0"><Compass size={16}/></div>
         <div className="min-w-0">
             <p className="text-[9px] font-bold text-teal-500 uppercase tracking-widest">MY VISION</p>
             <p className="text-xs font-serif font-medium text-slate-700 italic truncate">"{userStats.lifeVision || '寻找更好的自己'}"</p>
         </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-2 md:gap-4 mb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">概览</h2>
          <div className="flex items-center gap-2 mt-0.5">
             <Sparkles size={14} className="text-teal-500 shrink-0" />
             <p className="text-slate-500 text-xs md:text-sm font-medium truncate max-w-[250px] md:max-w-none">{getSmartInsight()}</p>
          </div>
        </div>
=======
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Mobile Visibility: Vision Banner */}
      <div className="md:hidden bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-center gap-3 mb-2">
         <div className="bg-teal-100 text-teal-600 p-2 rounded-full"><Compass size={18}/></div>
         <div>
             <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">MY VISION</p>
             <p className="text-sm font-serif font-medium text-slate-700 italic">"{userStats.lifeVision || '寻找更好的自己'}"</p>
         </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">概览</h2>
          <div className="flex items-center gap-2 mt-1">
             <Sparkles size={14} className="text-teal-500" />
             <p className="text-slate-500 text-sm font-medium">{getSmartInsight()}</p>
          </div>
        </div>
        <div className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-wider bg-white/40 px-4 py-2 rounded-full border border-white/50">
            {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
>>>>>>> 30a54e1a86f36ae55c759fe561dde835c23905be
      </div>

      {/* Level Banner */}
      <div className="bg-white rounded-3xl p-1 shadow-xl shadow-slate-200/50">
<<<<<<< HEAD
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[1.4rem] p-4 md:p-6 text-white relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -mr-10 -mt-20"></div>
            <div className="relative z-10 flex items-center gap-4 md:gap-5">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center ring-1 ring-white/10 shrink-0">
                    <Crown size={20} className="md:w-7 md:h-7 text-amber-300" />
                </div>
                <div>
                    <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-0.5 md:mb-1">Current Level</p>
                    <h3 className="text-xl md:text-2xl font-bold flex items-baseline gap-2 md:gap-3">
                        Lv.{userStats.level} <span className="text-sm md:text-base font-medium text-teal-400">{getLevelTitle(userStats.level)}</span>
=======
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[1.4rem] p-6 text-white relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -mr-10 -mt-20"></div>
            <div className="relative z-10 flex items-center gap-5">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center ring-1 ring-white/10">
                    <Crown size={28} className="text-amber-300" />
                </div>
                <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Current Level</p>
                    <h3 className="text-2xl font-bold flex items-baseline gap-3">
                        Lv.{userStats.level} <span className="text-base font-medium text-teal-400">{getLevelTitle(userStats.level)}</span>
>>>>>>> 30a54e1a86f36ae55c759fe561dde835c23905be
                    </h3>
                </div>
            </div>
            <div className="relative z-10 text-right hidden sm:block">
                <div className="text-xl font-bold tabular-nums">{userStats.totalXP} XP</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Experience</div>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
<<<<<<< HEAD
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
=======
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
>>>>>>> 30a54e1a86f36ae55c759fe561dde835c23905be
        <StatCard label="今日任务" value={`${completedTasksToday}/${todaysTasks.length}`} icon={CheckCircle2} color="text-emerald-600" />
        <StatCard label="目标进度" value={totalGoals - completedGoals} icon={Target} color="text-teal-600" />
        <StatCard label="完成率" value={`${completionRate}%`} icon={Activity} color="text-cyan-600" />
        <StatCard label="专注分钟" value={focusMinutes} icon={Zap} color="text-amber-500" />
      </div>

      {/* Main Grid: Action & Vision */}
<<<<<<< HEAD
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Next Up (Action) */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md rounded-3xl p-4 md:p-6 shadow-sm border border-white/60 flex flex-col">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
                <div className="p-1.5 md:p-2 bg-rose-100 text-rose-600 rounded-lg"><Zap size={16} className="md:w-[18px] md:h-[18px]"/></div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base">Next Up: 当下最重要</h3>
=======
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Up (Action) */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/60 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Zap size={18}/></div>
                <h3 className="font-bold text-slate-800">Next Up: 当下最重要</h3>
>>>>>>> 30a54e1a86f36ae55c759fe561dde835c23905be
            </div>
            
            <div className="flex-1 space-y-3">
                {nextUpTasks.length === 0 ? (
<<<<<<< HEAD
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6">
                        <CheckSquare size={24} className="mb-2 opacity-50"/>
                        <p className="text-xs md:text-sm">今日重要任务已清空！</p>
                    </div>
                ) : (
                    nextUpTasks.map(task => (
                        <div key={task.id} className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-teal-200">
                             <button onClick={() => onToggleTask(task.id)} className="shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-slate-300 group-hover:border-teal-500 flex items-center justify-center transition-colors">
                                 <div className="w-2.5 h-2.5 rounded-full bg-teal-500 scale-0 group-active:scale-100 transition-transform"></div>
                             </button>
                             <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-slate-700 text-sm md:text-base truncate">{task.title}</h4>
                                 <div className="flex items-center gap-2 mt-1">
                                     <span className={`text-[9px] md:text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${task.priority === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>{task.priority} Priority</span>
                                     <span className="text-[9px] md:text-[10px] text-slate-400">+{task.difficulty === 'hard' ? 50 : task.difficulty === 'medium' ? 30 : 10} XP</span>
                                 </div>
                             </div>
                             <button onClick={() => onToggleTask(task.id)} className="p-1.5 md:p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                 <ArrowRight size={14} className="md:w-4 md:h-4" />
=======
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                        <CheckSquare size={32} className="mb-2 opacity-50"/>
                        <p className="text-sm">今日重要任务已清空，享受生活吧！</p>
                    </div>
                ) : (
                    nextUpTasks.map(task => (
                        <div key={task.id} className="group flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-teal-200">
                             <button onClick={() => onToggleTask(task.id)} className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-teal-500 flex items-center justify-center transition-colors">
                                 <div className="w-3 h-3 rounded-full bg-teal-500 scale-0 group-active:scale-100 transition-transform"></div>
                             </button>
                             <div className="flex-1">
                                 <h4 className="font-bold text-slate-700">{task.title}</h4>
                                 <div className="flex items-center gap-2 mt-1">
                                     <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${task.priority === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>{task.priority} Priority</span>
                                     <span className="text-[10px] text-slate-400">+{task.difficulty === 'hard' ? 50 : task.difficulty === 'medium' ? 30 : 10} XP</span>
                                 </div>
                             </div>
                             <button onClick={() => onToggleTask(task.id)} className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                 <ArrowRight size={16} />
>>>>>>> 30a54e1a86f36ae55c759fe561dde835c23905be
                             </button>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Right Column: Vision & Trends */}
<<<<<<< HEAD
        <div className="space-y-4 md:space-y-6">
            
            {/* North Star (Vision) */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:p-6 rounded-3xl border border-indigo-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Target size={60} className="md:w-20 md:h-20"/></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 text-indigo-800">
                        <Trophy size={16} className="md:w-[18px] md:h-[18px]" />
                        <h3 className="font-bold text-xs md:text-sm uppercase tracking-wider">North Star</h3>
                    </div>
                    {northStarGoal ? (
                        <div>
                            <h4 className="text-base md:text-xl font-bold text-slate-800 mb-2 leading-tight truncate">{northStarGoal.title}</h4>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex-1 h-1.5 md:h-2 bg-white/60 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{width: `${northStarGoal.progress}%`}}></div>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-indigo-600">{northStarGoal.progress}%</span>
                            </div>
                            {northStarGoal.milestones.find(m => !m.completed) && (
                                <div className="bg-white/60 rounded-xl p-2 md:p-3 text-[10px] md:text-xs text-indigo-900 font-medium flex items-center gap-2">
                                    <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
=======
        <div className="space-y-6">
            
            {/* North Star (Vision) */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-3xl border border-indigo-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Target size={80}/></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-indigo-800">
                        <Trophy size={18} />
                        <h3 className="font-bold text-sm uppercase tracking-wider">North Star</h3>
                    </div>
                    {northStarGoal ? (
                        <div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{northStarGoal.title}</h4>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{width: `${northStarGoal.progress}%`}}></div>
                                </div>
                                <span className="text-xs font-bold text-indigo-600">{northStarGoal.progress}%</span>
                            </div>
                            {northStarGoal.milestones.find(m => !m.completed) && (
                                <div className="bg-white/60 rounded-xl p-3 text-xs text-indigo-900 font-medium flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
>>>>>>> 30a54e1a86f36ae55c759fe561dde835c23905be
                                    <span className="truncate">下一步: {northStarGoal.milestones.find(m => !m.completed)?.title}</span>
                                </div>
                            )}
                        </div>
                    ) : (
<<<<<<< HEAD
                        <div className="py-2 text-indigo-400 text-xs md:text-sm">暂无进行中的目标</div>
=======
                        <div className="py-4 text-indigo-400 text-sm">暂无进行中的目标</div>
>>>>>>> 30a54e1a86f36ae55c759fe561dde835c23905be
                    )}
                </div>
            </div>

            {/* Activity Heatmap (Trends) */}
<<<<<<< HEAD
            <div className="bg-white/60 backdrop-blur-sm p-4 md:p-6 rounded-3xl shadow-sm border border-white/60">
                <div className="flex items-center gap-2 mb-3 text-slate-500">
                    <Flame size={16} className="text-orange-500 md:w-[18px] md:h-[18px]"/>
                    <h3 className="font-bold text-xs md:text-sm uppercase tracking-wider">7 Days Activity</h3>
                </div>
                <div className="flex justify-between items-end">
                    {activityData.map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5 md:gap-2 group cursor-default">
                            <div 
                                className={`w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg transition-all duration-500 ${
=======
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-white/60">
                <div className="flex items-center gap-2 mb-4 text-slate-500">
                    <Flame size={18} className="text-orange-500"/>
                    <h3 className="font-bold text-sm uppercase tracking-wider">7 Days Activity</h3>
                </div>
                <div className="flex justify-between items-end">
                    {activityData.map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 group cursor-default">
                            <div 
                                className={`w-8 h-8 rounded-lg transition-all duration-500 ${
>>>>>>> 30a54e1a86f36ae55c759fe561dde835c23905be
                                    day.intensity === 0 ? 'bg-slate-100' :
                                    day.intensity === 1 ? 'bg-emerald-200' :
                                    day.intensity === 2 ? 'bg-emerald-400' :
                                    'bg-emerald-600 shadow-md shadow-emerald-200'
                                }`}
                                title={`${day.count} tasks completed`}
                            ></div>
<<<<<<< HEAD
                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">{day.label}</span>
=======
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">{day.label}</span>
>>>>>>> 30a54e1a86f36ae55c759fe561dde835c23905be
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
