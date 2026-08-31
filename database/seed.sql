-- NishandhiniMart demo data
-- Safe sample account for local development

INSERT INTO public.users
    (name, username, email, password_hash, role)
VALUES
    ('Demo User', 'demo_user', 'demo@example.com', 'demo123', 'buyer')
ON CONFLICT (username) DO NOTHING;
