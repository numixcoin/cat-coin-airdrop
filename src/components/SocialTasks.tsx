import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { ExternalLink, Twitter, MessageCircle, Share2 } from 'lucide-react';

interface SocialTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  url: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface SocialTasksProps {
  wallet: string;
  onTasksComplete: (completed: boolean) => void;
}

const SocialTasks: React.FC<SocialTasksProps> = ({ wallet, onTasksComplete }) => {
  const [tasks, setTasks] = useState<SocialTask[]>([
    {
      id: 'twitter-follow',
      title: 'Follow Twitter',
      description: 'Follow @CatdotCoin on Twitter',
      reward: 15000,
      url: 'https://x.com/CatdotCoin',
      icon: <Twitter className="w-5 h-5" />,
      completed: false
    },
    {
      id: 'telegram-join',
      title: 'Join Telegram',
      description: 'Join the CAT COIN Telegram group',
      reward: 15000,
      url: 'https://t.me/CatdotCoin',
      icon: <MessageCircle className="w-5 h-5" />,
      completed: false
    },
    {
      id: 'tweet-about',
      title: 'Tweet About Airdrop',
      description: 'Tweet about CAT COIN Airdrop',
      reward: 20000,
      url: 'https://twitter.com/intent/tweet?text=🐱%20Claiming%20my%2020,000%20$CAT%20CAT%20COIN%20airdrop!%20Join%20the%20cats%20are%20better%20then%20dogs%20@CatdotCoin%20%0A%20%20%23CATCOIN%20%23Airdrop%20%23Crypto%20%23Solana',
      icon: <Share2 className="w-5 h-5" />,
      completed: false
    }
  ]);

  const [allTasksCompleted, setAllTasksCompleted] = useState(false);

  useEffect(() => {
    // Load completed tasks from localStorage
    const savedTasks = localStorage.getItem(`social-tasks-${wallet}`);
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      setTasks(parsedTasks);
      checkAllTasksCompleted(parsedTasks);
    }
  }, [wallet]);

  const checkAllTasksCompleted = (currentTasks: SocialTask[]) => {
    const completed = currentTasks.every(task => task.completed);
    setAllTasksCompleted(completed);
    onTasksComplete(completed);
  };

  const handleTaskClick = (taskId: string, url: string) => {
    // Open the social media link
    window.open(url, '_blank');
    
    // Mark task as completed after a short delay
    setTimeout(() => {
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      );
      setTasks(updatedTasks);
      
      // Save to localStorage
      localStorage.setItem(`social-tasks-${wallet}`, JSON.stringify(updatedTasks));
      
      // Check if all tasks are completed
      checkAllTasksCompleted(updatedTasks);
      
      const completedTask = updatedTasks.find(task => task.id === taskId);
      if (completedTask) {
        toast.success(`✅ Task completed! +${completedTask.reward.toLocaleString()} $CAT earned! 🐱`);
      }
    }, 2000); // 2 second delay to allow user to complete the task
  };

  const getTotalReward = () => {
    return tasks.reduce((total, task) => task.completed ? total + task.reward : total, 0);
  };

  const getTaskStatusIcon = (completed: boolean) => {
    return completed ? '✅' : '⏳';
  };

  return (
    <Card className="bg-black/80 border-green-400 border-2 matrix-font">
      <CardHeader>
        <CardTitle className="text-green-400 text-lg matrix-font flex items-center gap-2">
          <span className="text-2xl">🐱</span>
          {'>'} SOCIAL MEDIA TASKS
        </CardTitle>
        <div className="text-green-300 text-sm">
          {'>'} Complete all tasks to unlock your 50,000 $CAT airdrop
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-black/50 border-2 border-green-400 p-3 rounded-lg">
          <div className="text-green-400 font-bold text-lg">
            {'>'} PROGRESS: {tasks.filter(t => t.completed).length}/{tasks.length} TASKS
          </div>
          <div className="text-green-300 text-sm">
            {'>'} EARNED: {getTotalReward().toLocaleString()} / 50,000 $CAT 🐱
          </div>
          <div className="w-full bg-black border border-green-400 rounded-full h-2 mt-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(getTotalReward() / 50000) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className={`border-2 rounded-lg p-4 transition-all ${
                task.completed 
                  ? 'border-green-400 bg-green-900/20' 
                  : 'border-green-400/50 bg-black/50 hover:border-green-400 hover:bg-green-900/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-green-400">
                    {task.icon}
                  </div>
                  <div>
                    <div className="text-green-400 font-bold flex items-center gap-2">
                      {getTaskStatusIcon(task.completed)} {task.title}
                    </div>
                    <div className="text-green-300 text-sm">
                      {task.description}
                    </div>
                    <div className="text-green-400 text-sm font-bold">
                      {'>'} REWARD: +{task.reward.toLocaleString()} $CAT 🐱
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleTaskClick(task.id, task.url)}
                  disabled={task.completed}
                  className={`matrix-button ${task.completed ? 'opacity-50' : ''}`}
                  size="sm"
                >
                  {task.completed ? '✅ DONE' : (
                    <>
                      {'>'} GO <ExternalLink className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {allTasksCompleted && (
          <div className="bg-black/50 border-2 border-green-400 p-4 rounded-lg text-center animate-pulse">
            <div className="text-green-400 text-xl font-bold glitch-text">
              🎉 ALL TASKS COMPLETED! 🎉
            </div>
            <div className="text-green-300 text-sm mt-2">
              {'>'} You've earned 50,000 $CAT tokens! 🐱<br />
              {'>'} Proceed to claim your airdrop below
            </div>
          </div>
        )}

        {!allTasksCompleted && (
          <div className="bg-black/50 border-2 border-yellow-400 p-3 rounded-lg text-center">
            <div className="text-yellow-400 text-sm matrix-font">
              ⚠️ COMPLETE ALL SOCIAL TASKS TO UNLOCK AIRDROP ⚠️<br />
              {'>'} {3 - tasks.filter(t => t.completed).length} tasks remaining
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialTasks;