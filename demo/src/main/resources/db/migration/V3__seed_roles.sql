-- V3: Seed default roles used by the application
-- Ensure role names are inserted only once
INSERT INTO roles (name)
VALUES
  ('ROLE_USER'),
  ('ROLE_MODERATOR'),
  ('ROLE_ADMIN')
ON CONFLICT (name) DO NOTHING;
