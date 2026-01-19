-- Create Admin Account (Copy-Paste into MySQL)

-- First, let's check if you have any admins
SELECT * FROM admins;

-- If empty, create a super admin
-- Note: This uses a pre-hashed password for "admin123"
INSERT INTO admins (id, first_name, last_name, email, password, role, hotel_id, created_at, updated_at)
VALUES (
  UUID(),
  'Super',
  'Admin',
  'admin@hotelbook.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- Password: "password"
  'super_admin',
  NULL,
  NOW(),
  NOW()
);

-- Verify it was created
SELECT id, first_name, last_name, email, role FROM admins;

-- Then login with:
-- Email: admin@hotelbook.com
-- Password: password
