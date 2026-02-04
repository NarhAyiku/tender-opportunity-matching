-- Add missing columns to opportunities table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='opportunities' AND column_name='apply_url') THEN
    ALTER TABLE public.opportunities ADD COLUMN apply_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='opportunities' AND column_name='source') THEN
    ALTER TABLE public.opportunities ADD COLUMN source TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='opportunities' AND column_name='salary_currency') THEN
    ALTER TABLE public.opportunities ADD COLUMN salary_currency TEXT DEFAULT 'USD';
  END IF;
END $$;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
