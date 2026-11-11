import React, { useState, useEffect } from 'react';

interface LiveStopwatchProps {
  startedAt: string | null | undefined;
}

export const LiveStopwatch: React.FC<LiveStopwatchProps> = ({ startedAt }) => {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }

    const startTime = new Date(startedAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffInSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsed(diffInSeconds);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const formatElapsed = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(secs)}`;
    }
    return `${pad(minutes)}:${pad(secs)}`;
  };

  return (
    <div className="inline-flex items-center space-x-1.5 font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded text-sm font-semibold shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>{formatElapsed(elapsed)}</span>
    </div>
  );
};
