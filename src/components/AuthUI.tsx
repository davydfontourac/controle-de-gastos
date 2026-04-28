import React from 'react';
import { ArrowLeft, Menu, Chrome, Github } from 'lucide-react';

export function AuthHeader({ onBack, onOpenMenu, title, subtitle }: { onBack?: () => void, onOpenMenu: () => void, title: string, subtitle: string }) {
  return (
    <>
      <header className="flex items-center justify-between mb-8">
        {onBack ? (
          <button onClick={onBack} className="p-2 -mr-2 text-gray-900 dark:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <img src="/logo-expense-tracker.png" alt="Logo" className="w-6 h-6 rounded-lg" />
            <span className="text-sm font-bold dark:text-white">Expense Tracker</span>
          </div>
        )}
        <button onClick={onOpenMenu} className="p-2 -mr-2 text-gray-900 dark:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <div className="mb-8">
        <h1 className="text-[32px] font-bold leading-tight text-gray-900 dark:text-white mb-2">{title}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{subtitle}</p>
      </div>
    </>
  );
}

export function SocialAuth({ t, onSocialLogin, isLoading }: { t: any, onSocialLogin: (provider: 'google' | 'github') => void, isLoading?: boolean }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-6 w-full">
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-white/5"></div></div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 bg-white dark:bg-[#0c0c1d] px-4">{t.register.or}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <SocialButton 
          icon={<Chrome className="w-5 h-5 text-gray-500" />} 
          label="Google" 
          onClick={() => onSocialLogin('google')}
          disabled={isLoading}
        />
        <SocialButton 
          icon={<Github className="w-5 h-5 text-gray-500" />} 
          label="GitHub" 
          onClick={() => onSocialLogin('github')}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

export function AuthFooter({ text, linkText, onClick }: { text: string, linkText: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-sm font-medium text-gray-500 mt-8">
      {text.split(linkText).map((part: string, i: number) => (
        <React.Fragment key={i}>
          {part}
          {i === 0 && <span className="text-gray-900 dark:text-white font-bold">{linkText}</span>}
        </React.Fragment>
      ))}
    </button>
  );
}

function SocialButton({ icon, label, onClick, disabled }: { icon: React.ReactNode, label: string, onClick?: () => void, disabled?: boolean }) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className="flex items-center justify-center gap-3 px-4 py-4 bg-white dark:bg-[#161629] border border-gray-100 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm active:scale-[0.98] disabled:opacity-50"
    >
      {icon}
      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{label}</span>
    </button>
  );
}

export const Input = React.forwardRef<HTMLInputElement, any>(({ label, error, ...props }, ref) => (
  <div className="space-y-2 w-full">
    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest font-mono">{label}</label>
    <input
      ref={ref}
      className={`w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border ${error ? 'border-red-500' : 'border-gray-100 dark:border-white/10'} rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-700`}
      {...props}
    />
    {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">{error}</p>}
  </div>
));

export function StrengthMeter({ score, segments = 4, mode = 'strength' }: { score: number, segments?: number, mode?: 'strength' | 'match' }) {
  return (
    <div className="flex gap-1.5 mt-2">
      {Array.from({ length: segments }).map((_, i) => {
        let active = i < score;
        let colorClass = 'bg-gray-100 dark:bg-white/5';
        
        if (active) {
          if (mode === 'match') {
            colorClass = score === segments ? 'bg-green-500' : 'bg-red-500';
          } else {
            if (score <= 1) colorClass = 'bg-red-500';
            else if (score <= 2) colorClass = 'bg-orange-500';
            else if (score <= 3) colorClass = 'bg-yellow-500';
            else colorClass = 'bg-green-500';
          }
        }
        
        return (
          <div 
            key={i} 
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${colorClass} ${active ? 'opacity-100' : 'opacity-100'}`} 
          />
        );
      })}
    </div>
  );
}
