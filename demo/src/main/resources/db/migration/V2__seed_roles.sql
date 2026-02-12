-- Seed default roles used by the application
INSERT INTO roles (name)
VALUES
  ('ROLE_USER'),
  ('ROLE_MODERATOR'),
  ('ROLE_ADMIN')
ON CONFLICT (name) DO NOTHING;
