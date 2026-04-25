CREATE TABLE IF NOT EXISTS public.savings_goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    target_amount decimal(12,2) NOT NULL DEFAULT 0,
    current_amount decimal(12,2) NOT NULL DEFAULT 0,
    target_date date,
    icon text DEFAULT '💰',
    color text DEFAULT '#3B82F6',
    created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own savings goals"
    ON public.savings_goals
    FOR ALL
    USING (auth.uid() = user_id);

-- Add savings_goal_id to transactions for better tracking (optional but good)
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS savings_goal_id uuid REFERENCES public.savings_goals(id) ON DELETE SET NULL;
