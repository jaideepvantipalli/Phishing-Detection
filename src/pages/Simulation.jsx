import { useState, useCallback } from 'react';
import {
  Gamepad2, Mail, MessageSquare, ShieldCheck, ShieldAlert,
  ChevronRight, RotateCcw, Trophy, Target, AlertTriangle,
  Check, X, Info, Sparkles,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { simulationScenarios } from '../data/mockData';

export default function Simulation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState(null); // 'safe' | 'phishing' | null
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);

  const scenario = simulationScenarios[currentIndex];

  const handleAnswer = useCallback(
    (userAnswer) => {
      const isCorrect =
        (userAnswer === 'phishing' && scenario.isPhishing) ||
        (userAnswer === 'safe' && !scenario.isPhishing);

      setAnswer(userAnswer);
      setShowResult(true);
      setScore((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
    },
    [scenario]
  );

  const handleNext = () => {
    if (currentIndex + 1 >= simulationScenarios.length) {
      setCompleted(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setAnswer(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswer(null);
    setScore({ correct: 0, total: 0 });
    setShowResult(false);
    setCompleted(false);
  };

  const isCorrect =
    answer &&
    ((answer === 'phishing' && scenario.isPhishing) ||
     (answer === 'safe' && !scenario.isPhishing));

  if (completed) {
    const percentage = Math.round((score.correct / score.total) * 100);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-12rem)] flex items-center justify-center">
        <Card glow className="max-w-2xl w-full text-center py-16 px-10 relative overflow-hidden">
          {/* Decorative background for success */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-cyber-accent to-transparent" />
          
          <div className="space-y-8 animate-fade-in-up">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-cyber-accent/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative p-6 rounded-full bg-cyber-accent/10 border border-cyber-accent/20 shadow-[0_0_40px_rgba(0,255,136,0.1)]">
                <Trophy className="w-16 h-16 text-cyber-accent" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white tracking-tight">Deployment Complete</h2>
              <p className="text-cyber-muted font-mono text-sm tracking-widest uppercase">Simulation Results Processed</p>
            </div>

            <div className="grid grid-cols-3 gap-6 p-6 rounded-2xl bg-cyber-darker/50 border border-cyber-border/50">
              <div className="space-y-1">
                <p className="text-4xl font-bold font-mono text-cyber-accent">{score.correct}</p>
                <p className="text-[10px] font-bold text-cyber-muted uppercase tracking-wider">Intercepted</p>
              </div>
              <div className="space-y-1 border-x border-cyber-border/50">
                <p className="text-4xl font-bold font-mono text-white">{score.total}</p>
                <p className="text-[10px] font-bold text-cyber-muted uppercase tracking-wider">Total Drills</p>
              </div>
              <div className="space-y-1">
                <p className={`text-4xl font-bold font-mono ${percentage >= 70 ? 'text-cyber-safe' : percentage >= 50 ? 'text-cyber-warning' : 'text-cyber-danger'}`}>
                  {percentage}%
                </p>
                <p className="text-[10px] font-bold text-cyber-muted uppercase tracking-wider">Accuracy</p>
              </div>
            </div>

            <p className="text-lg text-cyber-muted max-w-md mx-auto leading-relaxed">
              {percentage >= 80
                ? 'Exceptional situational awareness. Your threat detection pattern recognition is within enterprise standards.'
                : percentage >= 60
                ? 'Standard operational readiness achieved. Some tactical vulnerabilities remain in social engineering detection.'
                : 'Security protocols breached. Remedial training recommended to identify advanced spear-phishing signatures.'}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleRestart} icon={RotateCcw} size="lg" className="px-10">
                Re-initialize Drills
              </Button>
              <Button variant="secondary" onClick={() => navigate('/')} size="lg" className="px-10">
                Return to HQ
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyber-accent/10">
              <Gamepad2 className="w-6 h-6 text-cyber-accent" />
            </div>
            Phishing Simulation
          </h1>
          <p className="text-cyber-muted mt-1 ml-14">
            Test your ability to identify phishing attempts in real-world scenarios
          </p>
        </div>

        {/* Score */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 px-4 py-2 rounded-xl bg-cyber-card border border-cyber-border">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyber-accent" />
              <span className="text-sm text-cyber-muted">Score:</span>
              <span className="font-bold font-mono text-white">
                {score.correct}/{score.total}
              </span>
            </div>
            <div className="text-xs text-cyber-muted">
              {currentIndex + 1} of {simulationScenarios.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-cyber-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyber-accent to-cyber-info rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex + (showResult ? 1 : 0)) / simulationScenarios.length) * 100}%` }}
        />
      </div>

      {/* Scenario */}
      <Card>
        <div className="space-y-6">
          {/* Scenario type badge */}
          <div className="flex items-center gap-2">
            {scenario.type === 'email' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-info/10 text-cyber-info text-xs font-medium border border-cyber-info/20">
                <Mail className="w-3 h-3" /> Email
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-warning/10 text-cyber-warning text-xs font-medium border border-cyber-warning/20">
                <MessageSquare className="w-3 h-3" /> SMS
              </span>
            )}
            <span className="text-xs text-cyber-muted">Scenario #{currentIndex + 1}</span>
          </div>

          {/* Email/SMS content */}
          <div className="bg-cyber-darker rounded-xl border border-cyber-border overflow-hidden">
            {scenario.type === 'email' ? (
              <div>
                <div className="px-4 py-3 border-b border-cyber-border space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-cyber-muted w-14">From:</span>
                    <span className="text-cyber-text font-mono text-xs">{scenario.content.from}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-cyber-muted w-14">Subject:</span>
                    <span className="text-white font-medium">{scenario.content.subject}</span>
                  </div>
                </div>
                <div className="p-4 text-sm text-cyber-text font-mono leading-relaxed whitespace-pre-wrap">
                  {scenario.content.body}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3 text-sm">
                  <span className="text-cyber-muted">From:</span>
                  <span className="text-cyber-text font-mono">{scenario.content.from}</span>
                </div>
                <div className="p-3 rounded-lg bg-cyber-card border border-cyber-border text-sm text-cyber-text leading-relaxed">
                  {scenario.content.body}
                </div>
              </div>
            )}
          </div>

          {/* Question */}
          {!showResult && (
            <div className="text-center space-y-4 animate-fade-in-up">
              <p className="text-lg font-semibold text-white">
                Is this <span className="text-cyber-accent">Safe</span> or{' '}
                <span className="text-cyber-danger">Phishing</span>?
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={ShieldCheck}
                  onClick={() => handleAnswer('safe')}
                  className="min-w-[140px] hover:border-cyber-safe/50 hover:text-cyber-safe"
                >
                  Safe
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  icon={ShieldAlert}
                  onClick={() => handleAnswer('phishing')}
                  className="min-w-[140px]"
                >
                  Phishing
                </Button>
              </div>
            </div>
          )}

          {/* Result */}
          {showResult && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Correct/Wrong banner */}
              <div
                className={`flex items-center gap-3 p-4 rounded-xl border ${
                  isCorrect
                    ? 'bg-cyber-safe/10 border-cyber-safe/30'
                    : 'bg-cyber-danger/10 border-cyber-danger/30'
                }`}
              >
                <div className={`p-2 rounded-lg ${isCorrect ? 'bg-cyber-safe/20' : 'bg-cyber-danger/20'}`}>
                  {isCorrect ? (
                    <Check className="w-5 h-5 text-cyber-safe" />
                  ) : (
                    <X className="w-5 h-5 text-cyber-danger" />
                  )}
                </div>
                <div>
                  <p className={`font-semibold ${isCorrect ? 'text-cyber-safe' : 'text-cyber-danger'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </p>
                  <p className="text-sm text-cyber-muted">
                    This was{' '}
                    <span className={scenario.isPhishing ? 'text-cyber-danger font-medium' : 'text-cyber-safe font-medium'}>
                      {scenario.isPhishing ? 'a phishing attempt' : 'legitimate content'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-4 rounded-xl bg-cyber-darker/50 border border-cyber-border/50">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyber-accent" />
                  Explanation
                </h4>
                <p className="text-sm text-cyber-muted leading-relaxed">{scenario.explanation}</p>
              </div>

              {/* Traps */}
              {scenario.traps.length > 0 && (
                <div className="p-4 rounded-xl bg-cyber-darker/50 border border-cyber-border/50">
                  <h4 className="text-sm font-semibold text-cyber-warning mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Red Flags Identified
                  </h4>
                  <div className="space-y-2">
                    {scenario.traps.map((trap, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-2.5 rounded-lg bg-cyber-card/50"
                      >
                        <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cyber-danger bg-cyber-danger/10 border border-cyber-danger/20 rounded-full flex-shrink-0 mt-0.5">
                          {trap.type}
                        </span>
                        <div>
                          <p className="text-sm font-mono text-cyber-danger">{trap.text}</p>
                          <p className="text-xs text-cyber-muted mt-0.5">{trap.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next button */}
              <div className="flex justify-center pt-2">
                <Button onClick={handleNext} icon={ChevronRight} size="lg">
                  {currentIndex + 1 >= simulationScenarios.length ? 'View Results' : 'Next Scenario'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
