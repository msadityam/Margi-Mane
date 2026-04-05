INSERT INTO reward_config (id, rupees_per_unit, points_per_unit, updated_by) VALUES (1, 100, 5, NULL);

INSERT INTO users (name, mobile_number, role, points_balance) VALUES
('Admin', '9886025999', 'ADMIN', 0),
('Aditya', '7019445175', 'USER', 50);

INSERT INTO announcements (title, message, active, created_by) VALUES
('Welcome', 'Welcome to Margi Mane rewards app.', TRUE, 1);

INSERT INTO menu_items (name, price, category, active) VALUES
('Tea', 15, 'TEA', TRUE),
('Coffee', 15, 'TEA', TRUE),
('Idly (2)', 30, 'MEALS', TRUE),
('Vada', 20, 'MEALS', TRUE),
('Rice Bath', 40, 'BATH', TRUE),
('Shavige Bath', 40, 'BATH', TRUE),
('Khara Bath', 25, 'BATH', TRUE),
('Kesari Bath', 30, 'BATH', TRUE),
('Chow Chow Bath', 50, 'BATH', TRUE),
('Masala Dosa', 50, 'DOSA', TRUE),
('Onion Dosa', 60, 'DOSA', TRUE),
('Open Dosa', 60, 'DOSA', TRUE),
('Khali Dosa', 40, 'DOSA', TRUE),
('Plain Dosa', 50, 'DOSA', TRUE),
('Chapati (2)', 45, 'MEALS', TRUE),
('Anna Sambar', 50, 'MEALS', TRUE);
