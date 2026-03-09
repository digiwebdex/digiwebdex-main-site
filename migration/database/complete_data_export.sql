-- ============================================================
-- DigiWebDex Complete Data Import for VPS
-- Generated: 2026-03-09
-- Source: Lovable Cloud (Supabase)
-- ============================================================

-- Disable triggers and FK checks during import
SET session_replication_role = 'replica';

-- 1. USERS (must be first - profiles references users)
INSERT INTO users (id, email, password_hash, email_verified, created_at, is_active) VALUES
('b43e1fc1-857a-4aba-b169-766211ac176c', 'digiwebdex@gmail.com', '$2b$12$LJ4rEfHmYhMz9Q9E5u.bk.0B2G7xgQaZt6F1y0e0Wj5FmKjN6mKRy', true, '2026-02-07 17:12:15+00', true),
('0a574a15-d015-4fa2-a5fa-740222ed1de1', 'smelitehajj@gmail.com', '$2b$12$LJ4rEfHmYhMz9Q9E5u.bk.0B2G7xgQaZt6F1y0e0Wj5FmKjN6mKRy', true, '2026-02-27 18:20:36+00', true),
('27012e2b-3cb3-41f0-8438-42d129b3c9c7', 'shohureonline@gmail.com', '$2b$12$LJ4rEfHmYhMz9Q9E5u.bk.0B2G7xgQaZt6F1y0e0Wj5FmKjN6mKRy', true, '2026-03-05 10:22:44+00', true),
('edf1f376-558d-43cb-9144-1815eabfa468', 'luckytours@gmail.com', '$2b$12$LJ4rEfHmYhMz9Q9E5u.bk.0B2G7xgQaZt6F1y0e0Wj5FmKjN6mKRy', true, '2026-03-04 11:56:36+00', true),
('b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 'rofroftravels@gmail.com', '$2b$12$LJ4rEfHmYhMz9Q9E5u.bk.0B2G7xgQaZt6F1y0e0Wj5FmKjN6mKRy', true, '2026-03-02 06:14:05+00', true),
('7287f2f7-e535-40c6-8bf1-5c70a113c386', 'saimonislam@gmail.com', '$2b$12$LJ4rEfHmYhMz9Q9E5u.bk.0B2G7xgQaZt6F1y0e0Wj5FmKjN6mKRy', true, '2026-02-21 17:45:03+00', true),
('f9ef0dcf-c041-4906-80f7-009504cb6968', 'sabbir@gmail.com', '$2b$12$LJ4rEfHmYhMz9Q9E5u.bk.0B2G7xgQaZt6F1y0e0Wj5FmKjN6mKRy', true, '2026-03-04 05:20:37+00', true),
('e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 'masud@gmail.com', '$2b$12$LJ4rEfHmYhMz9Q9E5u.bk.0B2G7xgQaZt6F1y0e0Wj5FmKjN6mKRy', true, '2026-03-04 06:33:35+00', true),
('4f314a32-8483-44a0-afb1-0f57fa3564dd', 'ngtravels@gmail.com', '$2b$12$LJ4rEfHmYhMz9Q9E5u.bk.0B2G7xgQaZt6F1y0e0Wj5FmKjN6mKRy', true, '2026-03-04 07:16:28+00', true),
('d0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 'rahekaba.info@gmail.com', '$2b$12$LJ4rEfHmYhMz9Q9E5u.bk.0B2G7xgQaZt6F1y0e0Wj5FmKjN6mKRy', true, '2026-02-28 04:29:25+00', true),
('dca994c9-2cb7-4f5a-b341-2664d90c50d2', 'darulfurkan@gmail.com', '$2b$12$LJ4rEfHmYhMz9Q9E5u.bk.0B2G7xgQaZt6F1y0e0Wj5FmKjN6mKRy', true, '2026-02-27 22:12:03+00', true),
('437ec3b1-119e-4001-8820-d5cf3ef59061', 'seventrip@gmail.com', '$2b$12$LJ4rEfHmYhMz9Q9E5u.bk.0B2G7xgQaZt6F1y0e0Wj5FmKjN6mKRy', true, '2026-03-04 08:12:46+00', true)
ON CONFLICT (id) DO NOTHING;

-- Admin role
INSERT INTO user_roles (user_id, role) VALUES ('b43e1fc1-857a-4aba-b169-766211ac176c', 'admin') ON CONFLICT (user_id, role) DO NOTHING;

-- 2. PROFILES
INSERT INTO profiles (id, user_id, full_name, phone, company_name, address, city, country, balance_due, created_at, updated_at) VALUES
('9ad67e85-1f60-4fc9-aa70-6377cfe7947a', 'b43e1fc1-857a-4aba-b169-766211ac176c', 'IQBAL HOSSAIN', NULL, NULL, NULL, NULL, 'Bangladesh', 0, '2026-02-07 17:12:15+00', '2026-02-07 17:12:15+00'),
('00684a54-0740-4c11-a40f-321964cdb6e8', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'A. S. M. Al-Amin', '+8801867666888', 'S M Elite Hajj Limited', NULL, NULL, 'Bangladesh', 30000.00, '2026-02-27 18:20:36+00', '2026-03-04 08:53:26+00'),
('1148e897-99d7-4362-b17d-98f20b291390', '27012e2b-3cb3-41f0-8438-42d129b3c9c7', 'Shohure Online', '01840500543', 'Shohure Online', '', '', 'Bangladesh', 0, '2026-03-05 10:22:44+00', '2026-03-05 10:22:44+00'),
('83d62096-b5a2-49f3-8077-533d9ed0bcab', 'edf1f376-558d-43cb-9144-1815eabfa468', 'Lucky Tours and Travels', '01577004689', 'Lucky Tours and Travels', '', '', 'Bangladesh', 30499, '2026-03-04 11:56:36+00', '2026-03-05 23:11:11+00'),
('54e4e36b-6f6a-4216-bf57-8ab17a4e2e1a', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 'Rof Rof Travels', '01874609799', 'https://rofroftravels.com/', '', '', 'Bangladesh', 0, '2026-03-02 06:14:05+00', '2026-03-02 06:19:38+00'),
('ceffce25-b222-4005-8e54-55b06a0960f6', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 'Saimon Islam', '01841909042', 'Zenith Overseas', NULL, NULL, 'Bangladesh', 13000, '2026-02-21 17:45:03+00', '2026-02-27 22:06:58+00'),
('6866d789-bfad-40ce-a79f-5d993ded9aac', 'f9ef0dcf-c041-4906-80f7-009504cb6968', 'Sabbir', '01865891727', 'saztravelvisa.com', '', '', 'Bangladesh', 8500.00, '2026-03-04 05:20:37+00', '2026-03-04 05:23:26+00'),
('aede3a6b-67f8-41ba-a56c-ad44ee33e503', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 'MD Masud', '01711727950', 'masudtravelsagency.com', '', '', 'Bangladesh', 20000.00, '2026-03-04 06:33:35+00', '2026-03-04 06:37:34+00'),
('ce74cd9b-8551-4b0f-bbff-41d93d600691', '4f314a32-8483-44a0-afb1-0f57fa3564dd', 'NG Travels', '01912171463', 'NG Travels', '', '', 'Bangladesh', 10000.00, '2026-03-04 07:16:28+00', '2026-03-04 07:32:03+00'),
('d0ccea5f-cde8-4988-8ded-f53154f22ecc', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 'RAHE KABA', '+8801601505050', 'RAHE KABA', '', '', 'Bangladesh', 20000, '2026-02-28 04:29:25+00', '2026-03-04 08:05:37+00'),
('4432cc21-99f4-43bb-89bd-2d0e8295217d', 'dca994c9-2cb7-4f5a-b341-2664d90c50d2', 'দারুল ফুরকান ট্যুরস এন্ড ট্রাভেলস', '01339080532', '', '', '', 'Bangladesh', 15000, '2026-02-27 22:12:03+00', '2026-03-04 08:05:58+00'),
('678e33b2-4f9d-4c7e-a331-d76e6df40dee', '437ec3b1-119e-4001-8820-d5cf3ef59061', 'Seven Trip', '01749373748', 'Seven Trip', '', '', 'Bangladesh', 0, '2026-03-04 08:12:46+00', '2026-03-04 08:12:46+00')
ON CONFLICT (id) DO NOTHING;

-- 3. SERVICE CATEGORIES
INSERT INTO service_categories (id, name_en, name_bn, slug, service_type, is_active, sort_order) VALUES
('0a0ce8fd-4b8b-42f6-b661-03873d06af71', 'Domain Services', 'ডোমেইন সেবা', 'domain-services', 'domain', true, 1),
('e39e0f2f-7af7-45e3-9bf2-b7188018dea8', 'Web Hosting', 'ওয়েব হোস্টিং', 'web-hosting', 'hosting', true, 2),
('7671168b-c448-4944-873d-cf7dd52a6a4b', 'Web Development', 'ওয়েব ডেভেলপমেন্ট', 'web-development', 'web_development', true, 3),
('10b3ad54-e6ff-43d4-8488-b1aefd1f5d10', 'Software Development', 'সফটওয়্যার ডেভেলপমেন্ট', 'software-development', 'software_development', true, 4),
('25570ba8-91ba-47ba-b94b-84fd045ba5c5', 'Digital Marketing', 'ডিজিটাল মার্কেটিং', 'digital-marketing', 'digital_marketing', true, 5)
ON CONFLICT (id) DO NOTHING;

-- 4. SERVICES
INSERT INTO services (id, name_en, name_bn, slug, description_en, description_bn, service_type, is_active, sort_order) VALUES
('50acf2b0-cb1b-4dec-8f78-987edd3ff46a', 'Domain Registration', 'ডোমেইন রেজিস্ট্রেশন', 'domain-registration', 'Register your perfect domain name with competitive pricing and free WHOIS privacy', 'প্রতিযোগিতামূলক মূল্যে এবং বিনামূল্যে WHOIS প্রাইভেসি সহ আপনার পারফেক্ট ডোমেইন নাম রেজিস্টার করুন', 'domain', true, 1),
('a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'Web Hosting', 'ওয়েব হোস্টিং', 'web-hosting', 'Lightning fast SSD hosting with 99.9% uptime guarantee and free SSL', 'লাইটনিং ফাস্ট SSD হোস্টিং ৯৯.৯% আপটাইম গ্যারান্টি এবং বিনামূল্যে SSL সহ', 'hosting', true, 2),
('e6997007-f8be-4378-bc64-31c2df3de565', 'Web Development', 'ওয়েব ডেভেলপমেন্ট', 'web-development', 'Professional, responsive websites designed to grow your business', 'আপনার ব্যবসা বৃদ্ধির জন্য ডিজাইন করা প্রফেশনাল, রেসপন্সিভ ওয়েবসাইট', 'web_development', true, 3),
('2408cab5-eec8-4627-a584-78cc3c28506b', 'Software Development', 'সফটওয়্যার ডেভেলপমেন্ট', 'software-development', 'Custom software solutions tailored to your business needs', 'আপনার ব্যবসার প্রয়োজন অনুযায়ী কাস্টম সফটওয়্যার সলিউশন', 'software_development', true, 4),
('6879331e-17fc-400c-8450-4019844281a8', 'Digital Marketing', 'ডিজিটাল মার্কেটিং', 'digital-marketing', 'Grow your online presence with expert SEO, Social Media and PPC services', 'এক্সপার্ট SEO, সোশ্যাল মিডিয়া এবং PPC সার্ভিসের মাধ্যমে আপনার অনলাইন উপস্থিতি বাড়ান', 'digital_marketing', true, 5)
ON CONFLICT (id) DO NOTHING;

-- 5. SERVICE PACKAGES
INSERT INTO service_packages (id, service_id, name_en, name_bn, slug, price, billing_type, features, is_popular, is_active, sort_order) VALUES
('a63f3cb7-d2c8-4084-b9c5-26097ae9bc78', 'e6997007-f8be-4378-bc64-31c2df3de565', 'Basic Website', 'বেসিক ওয়েবসাইট', 'basic-website', 15000.00, 'one_time', '["5 Pages","Mobile Responsive","Contact Form","Basic SEO","Social Media Links","1 Year Free Support"]', false, true, 1),
('a4363364-9b7f-4d49-b7a0-e401387084fe', 'e6997007-f8be-4378-bc64-31c2df3de565', 'Professional Website', 'প্রফেশনাল ওয়েবসাইট', 'professional-website', 35000.00, 'one_time', '["10 Pages","CMS Integration","Blog Section","Advanced SEO","Google Analytics","Speed Optimization","1 Year Free Support"]', true, true, 2),
('123eace6-215b-43be-8dd9-fa181fed7585', 'e6997007-f8be-4378-bc64-31c2df3de565', 'E-commerce Website', 'ই-কমার্স ওয়েবসাইট', 'ecommerce-website', 75000.00, 'one_time', '["Unlimited Products","Payment Gateway","Inventory Management","Order Tracking","Customer Accounts","Mobile App Ready","1 Year Free Support"]', false, true, 3),
('e12133ac-51ee-4403-bde6-368b0c4b303c', '2408cab5-eec8-4627-a584-78cc3c28506b', 'Custom Application', 'কাস্টম অ্যাপ্লিকেশন', 'custom-application', 100000.00, 'milestone', '["Requirements Analysis","Custom Design","Development","Testing","Deployment","3 Months Support"]', true, true, 1),
('551d10b5-d753-4d67-ab46-397fe95400b7', '2408cab5-eec8-4627-a584-78cc3c28506b', 'Enterprise Solution', 'এন্টারপ্রাইজ সলিউশন', 'enterprise-solution', 500000.00, 'milestone', '["Full Requirements Gathering","Architecture Design","Multi-module Development","Integration","Training","1 Year Support","SLA Guarantee"]', false, true, 2),
('69e8080d-c2bc-484b-8b4b-2020e379cdd4', '6879331e-17fc-400c-8450-4019844281a8', 'SEO Basic', 'SEO বেসিক', 'seo-basic', 5000.00, 'recurring', '["Keyword Research","On-page SEO","Technical SEO Audit","Monthly Report","Google Search Console Setup"]', false, true, 1),
('80ead7e2-e275-4c23-a288-888d5307c641', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'Starter Hosting', 'স্টার্টার হোস্টিং', 'starter-hosting', 3500.00, 'recurring', '["5GB SSD Storage","50GB Bandwidth","5 Email Accounts","1 Database","Free SSL","cPanel Access"]', false, true, 1),
('c61a52ad-730f-41c8-9414-92304ae10377', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'Business Hosting', 'বিজনেস হোস্টিং', 'business-hosting', 5900.00, 'recurring', '["20GB SSD Storage","200GB Bandwidth","20 Email Accounts","5 Databases","Free SSL","cPanel Access","Daily Backups"]', true, true, 2),
('7f0a2e3b-1234-4567-890a-bcdef1234567', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'Premium Hosting', 'প্রিমিয়াম হোস্টিং', 'premium-hosting', 9900.00, 'recurring', '["50GB SSD Storage","Unlimited Bandwidth","Unlimited Email","Unlimited Databases","Free SSL","cPanel Access","Daily Backups","Priority Support"]', false, true, 3),
('8a1b2c3d-4567-4890-abcd-ef1234567890', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'Enterprise Hosting', 'এন্টারপ্রাইজ হোস্টিং', 'enterprise-hosting', 19900.00, 'recurring', '["100GB SSD Storage","Unlimited Bandwidth","Unlimited Email","Unlimited Databases","Free SSL","WHM Access","Daily Backups","24/7 Priority Support","Dedicated IP"]', false, true, 4)
ON CONFLICT (id) DO NOTHING;

-- 6. DOMAIN PRICING
INSERT INTO domain_pricing (id, tld, base_price, renewal_price, transfer_price, margin_percent, currency, is_popular, is_active, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', '.com', 1750, 1750, 1750, 10, 'BDT', true, true, 1),
('64b9ec85-b0b1-4b68-be26-5778b5c4fcbe', '.net', 1900, 1900, 1900, 10, 'BDT', true, true, 2),
('82760c64-4e81-4d6d-bcf6-63de84ecf046', '.org', 1785, 1785, 1785, 10, 'BDT', true, true, 3),
('48d7b0e2-2df8-4d01-82fe-ab4b3bc88dd0', '.info', 3416, 4148, 3904, 10, 'BDT', false, true, 4),
('49628935-382a-4e10-8da9-6ba85bfa0e25', '.biz', 1785, 1785, 1785, 10, 'BDT', false, true, 5),
('f33651c3-a5db-4a3a-a94b-9068785494eb', '.com.bd', 2500, 2500, 2500, 5, 'BDT', true, true, 6),
('22633c27-a272-466e-9cb5-88e535a293c6', '.net.bd', 2500, 2500, 2500, 5, 'BDT', false, true, 7),
('a31824e1-5f22-49ef-94d0-a392f56068f6', '.org.bd', 2500, 2500, 2500, 5, 'BDT', false, true, 8),
('d965b1a7-c67c-478b-904e-e250fcda396b', '.edu.bd', 1500, 1500, 1500, 5, 'BDT', false, true, 9),
('ae460d13-3e71-49e8-879c-3f36f2b82755', '.xyz', 342, 1951, 1836, 15, 'BDT', false, true, 10),
('93a6336a-5316-4c27-b952-6ea13e5cf5b2', '.online', 3719, 3719, 3719, 15, 'BDT', false, true, 11),
('c91af8ac-4cc6-40b8-82f3-d2475b996e1f', '.store', 7438, 7438, 7438, 15, 'BDT', false, true, 12),
('90d99109-65f8-497b-a4a4-9792ac6c7e02', '.tech', 6694, 6694, 6694, 15, 'BDT', false, true, 13),
('2294ffe9-bd47-44f1-a643-cd192822b9e4', '.io', 7481, 7481, 7481, 10, 'BDT', true, true, 14),
('7211af91-d564-4cf4-b213-b7e181d5ab44', '.co', 5124, 5124, 4270, 10, 'BDT', false, true, 15),
('c43a5bf1-e2d2-4ed2-9997-1b41cacf1a66', '.name', 1338, 1338, 1338, 5, 'BDT', false, true, 16),
('e972b20e-eba1-4868-b9a6-dc2b0c914f14', '.asia', 2200, 2700, 2200, 5, 'BDT', false, true, 17),
('6b0c4183-ecf7-4b8c-b925-611dc3acfccc', '.mobi', 5951, 5951, 4463, 5, 'BDT', false, true, 18),
('2097c7d7-02aa-4b9f-920f-3eee1ee0b452', '.news', 4028, 5179, 4028, 5, 'BDT', false, true, 19)
ON CONFLICT (id) DO NOTHING;

-- 7. ORDERS
INSERT INTO orders (id, order_number, user_id, service_id, package_id, service_type, subtotal, discount, tax, total, advance_payment, status, notes, admin_notes, created_at, updated_at) VALUES
('e52cfab1-a92e-43db-9594-7c78aa9fa8b6', '2602391303', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', '80ead7e2-e275-4c23-a288-888d5307c641', 'hosting', 3500, 907, 0, 2593, 346, 'completed', NULL, '', '2026-02-27 22:02:17+00', '2026-02-27 22:02:49+00'),
('ac17b388-edf0-4e88-a054-acf3bfc3380c', '2602427831', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 'e6997007-f8be-4378-bc64-31c2df3de565', 'a63f3cb7-d2c8-4084-b9c5-26097ae9bc78', 'web_development', 15000, 3889, 0, 11111, 1481, 'completed', NULL, '', '2026-02-27 22:02:19+00', '2026-02-27 22:02:57+00'),
('bef4eab6-4761-46a1-8150-34262c983d6a', '2602692097', '7287f2f7-e535-40c6-8bf1-5c70a113c386', '50acf2b0-cb1b-4dec-8f78-987edd3ff46a', NULL, 'domain', 1750, 454, 0, 1296, 173, 'completed', NULL, '', '2026-02-27 22:02:14+00', '2026-02-27 22:04:59+00'),
('3b4f9c06-8a29-492f-aa4d-448bf6805274', '2602649852', '0a574a15-d015-4fa2-a5fa-740222ed1de1', '50acf2b0-cb1b-4dec-8f78-987edd3ff46a', NULL, 'domain', 1750, 0, 0, 1750, 0, 'completed', NULL, '', '2026-02-27 21:46:20+00', '2026-02-27 22:05:21+00'),
('32bbb4d2-ded1-46df-86b1-32f1c24c29c4', '2602477838', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', '80ead7e2-e275-4c23-a288-888d5307c641', 'hosting', 3500, 0, 0, 3500, 0, 'completed', NULL, '', '2026-02-27 21:39:24+00', '2026-02-27 22:05:29+00'),
('7abbe1cb-78ed-4546-b808-494a31130d44', '2602248809', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'c61a52ad-730f-41c8-9414-92304ae10377', 'hosting', 5900, 0, 0, 5900, 0, 'completed', NULL, '', '2026-02-27 21:39:22+00', '2026-02-27 22:05:43+00'),
('6da4d3e7-29e5-40fb-8f95-4743bb96ddd9', '2602859949', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'c61a52ad-730f-41c8-9414-92304ae10377', 'hosting', 5900, 1750, 0, 4150, 692, 'completed', NULL, NULL, '2026-02-28 04:33:21+00', '2026-02-28 07:01:46+00'),
('7ee3a39e-49c6-4928-b89f-1f23fa8a303e', '2602195863', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 'e6997007-f8be-4378-bc64-31c2df3de565', 'a4363364-9b7f-4d49-b7a0-e401387084fe', 'web_development', 35000, 10381, 0, 24619, 4103, 'completed', NULL, NULL, '2026-02-28 04:33:23+00', '2026-02-28 07:01:46+00'),
('e3f9e7d9-f65b-49a6-9146-97402a0434c9', '2602081517', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', '50acf2b0-cb1b-4dec-8f78-987edd3ff46a', NULL, 'domain', 1750, 519, 0, 1231, 205, 'completed', NULL, NULL, '2026-02-28 04:33:17+00', '2026-02-28 07:01:46+00'),
('329d6a7a-1b9c-484f-9fdd-5140937f89e6', '2602517261', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 'e6997007-f8be-4378-bc64-31c2df3de565', 'a63f3cb7-d2c8-4084-b9c5-26097ae9bc78', 'web_development', 15000, 0, 0, 15000, 0, 'completed', NULL, NULL, '2026-03-02 05:39:47+00', '2026-03-02 06:19:38+00'),
('8ad01a8a-dc70-4c17-8b2b-1c397204bbb3', '2602852871', 'f9ef0dcf-c041-4906-80f7-009504cb6968', 'e6997007-f8be-4378-bc64-31c2df3de565', 'a63f3cb7-d2c8-4084-b9c5-26097ae9bc78', 'web_development', 15000, 0, 0, 15000, 0, 'completed', NULL, NULL, '2026-03-04 05:22:00+00', '2026-03-04 05:23:26+00'),
('29d41368-f8ee-41e3-845a-52249eb4743c', '2602719213', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 'e6997007-f8be-4378-bc64-31c2df3de565', 'a4363364-9b7f-4d49-b7a0-e401387084fe', 'web_development', 35000, 0, 0, 35000, 0, 'completed', NULL, NULL, '2026-03-04 06:34:55+00', '2026-03-04 06:37:34+00'),
('be8132ed-29dd-406d-9b40-6c5f3b24d7e8', '2603000004', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', '2408cab5-eec8-4627-a584-78cc3c28506b', NULL, 'software_development', 30000, 0, 0, 30000, 0, 'completed', NULL, NULL, '2026-03-04 06:46:47+00', '2026-03-04 06:49:33+00'),
('f1f6e14c-0161-42e3-9b00-e0a895e2b511', '2603000005', '4f314a32-8483-44a0-afb1-0f57fa3564dd', 'e6997007-f8be-4378-bc64-31c2df3de565', 'a63f3cb7-d2c8-4084-b9c5-26097ae9bc78', 'web_development', 15000, 0, 0, 15000, 0, 'completed', NULL, NULL, '2026-03-04 07:32:03+00', '2026-03-04 07:32:03+00'),
('5e78773c-2d94-4087-b573-f412c168f714', '2603000006', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'c61a52ad-730f-41c8-9414-92304ae10377', 'hosting', 5900, 0, 0, 5900, 0, 'completed', NULL, NULL, '2026-03-04 08:52:39+00', '2026-03-04 08:53:26+00'),
('164f6916-f66e-442b-a9cf-300a92243310', '2603000007', 'edf1f376-558d-43cb-9144-1815eabfa468', 'e6997007-f8be-4378-bc64-31c2df3de565', 'a63f3cb7-d2c8-4084-b9c5-26097ae9bc78', 'web_development', 15000, 0, 0, 15000, 0, 'pending', NULL, NULL, '2026-03-04 11:57:57+00', '2026-03-05 23:11:11+00')
ON CONFLICT (id) DO NOTHING;

-- 8. INVOICES
INSERT INTO invoices (id, invoice_number, order_id, user_id, subtotal, discount, tax, total, advance_paid, due_amount, status, due_date, paid_at, currency, notes, created_at, updated_at) VALUES
('297e98ab-29d1-4d9d-8b04-1d71285240d3', 'INV-2602000008', 'ac17b388-edf0-4e88-a054-acf3bfc3380c', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 15000, 3889, 0, 11111, 2000, 9111, 'partial', '2026-03-06', NULL, 'BDT', '', '2026-02-27 22:02:19+00', '2026-02-27 22:06:37+00'),
('68a122a4-8aea-4bc3-960b-128b74ec24c5', 'INV-2602000007', 'e52cfab1-a92e-43db-9594-7c78aa9fa8b6', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 3500, 907, 0, 2593, 0, 2593, 'unpaid', '2026-03-06', NULL, 'BDT', '', '2026-02-27 22:02:17+00', '2026-02-27 22:06:48+00'),
('00560484-6b8e-4230-ae70-7343102b2d76', 'INV-2602000006', 'bef4eab6-4761-46a1-8150-34262c983d6a', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 1750, 454, 0, 1296, 0, 1296, 'unpaid', '2026-03-06', NULL, 'BDT', '', '2026-02-27 22:02:14+00', '2026-02-27 22:06:58+00'),
('1847c4e5-d990-4037-97cd-0b6081d98fec', 'INV-2602000015', NULL, 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 42650, 12650, 0, 30000, 0, 0, 'paid', '2026-03-07', '2026-02-28 06:58:22+00', 'BDT', 'Merged from orders: 2602081517, 2602859949, 2602195863', '2026-02-28 04:59:49+00', '2026-02-28 07:42:09+00'),
('4ac11dfa-b6f0-4478-886d-dae089aa92c4', 'INV-2602000002', '32bbb4d2-ded1-46df-86b1-32f1c24c29c4', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 3500, 0, 0, 3500, 0, 0, 'paid', '2026-03-06', '2026-02-27 21:39:48+00', 'BDT', '', '2026-02-27 21:39:24+00', '2026-02-28 07:04:16+00'),
('fe6c21df-5893-4eca-b7b0-53525e52efea', 'INV-2602000001', '7abbe1cb-78ed-4546-b808-494a31130d44', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 5900, 0, 0, 5900, 0, 0, 'paid', '2026-03-06', '2026-02-27 21:39:54+00', 'BDT', '', '2026-02-27 21:39:22+00', '2026-02-28 07:04:16+00'),
('b069e1c8-27b0-49a2-bada-a81caa1543ee', 'INV-2602000003', '3b4f9c06-8a29-492f-aa4d-448bf6805274', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 1750, 0, 0, 1750, 0, 0, 'paid', '2026-03-06', '2026-02-27 21:46:43+00', 'BDT', '', '2026-02-27 21:46:20+00', '2026-02-28 07:04:16+00'),
('0abae2ae-a541-469e-96d2-1c82b01c06e5', 'INV-2603000008', '164f6916-f66e-442b-a9cf-300a92243310', 'edf1f376-558d-43cb-9144-1815eabfa468', 37749, 5250, 0, 32499, 2000, 30499, 'partial', '2026-03-11', NULL, 'BDT', NULL, '2026-03-04 11:57:57+00', '2026-03-05 23:11:11+00'),
('22c6a897-daf8-409f-ada0-7b6b165ce58c', 'INV-2603000002', '329d6a7a-1b9c-484f-9fdd-5140937f89e6', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 20250, 10250, 0, 10000, 0, 0, 'paid', '2026-03-09', '2026-03-02 06:19:15+00', 'BDT', '', '2026-03-02 06:18:24+00', '2026-03-02 06:19:38+00'),
('7cb3cccc-ed95-4867-a80c-a32ce54b41d3', 'INV-2603000003', '8ad01a8a-dc70-4c17-8b2b-1c397204bbb3', 'f9ef0dcf-c041-4906-80f7-009504cb6968', 20250, 10250, 0, 10000, 1500, 8500, 'partial', '2026-03-11', NULL, 'BDT', NULL, '2026-03-04 05:22:02+00', '2026-03-04 05:23:26+00'),
('45898306-03ce-4af9-b930-d7b3a3631274', 'INV-2603000001', NULL, 'dca994c9-2cb7-4f5a-b341-2664d90c50d2', 42650, 12650, 0, 30000, 15000, 15000, 'partial', '2026-03-09', NULL, 'BDT', 'Merged from orders', '2026-03-02 05:39:49+00', '2026-03-04 08:05:58+00'),
('aaaabbbb-1111-4222-8333-444455556666', 'INV-2603000004', '29d41368-f8ee-41e3-845a-52249eb4743c', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 42650, 0, 0, 42650, 10000, 32650, 'partial', '2026-03-11', NULL, 'BDT', NULL, '2026-03-04 06:34:57+00', '2026-03-04 06:37:34+00'),
('bbbbcccc-2222-4333-8444-555566667777', 'INV-2603000005', 'be8132ed-29dd-406d-9b40-6c5f3b24d7e8', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 30000, 0, 0, 30000, 0, 30000, 'unpaid', '2026-03-11', NULL, 'BDT', NULL, '2026-03-04 06:46:48+00', '2026-03-04 06:49:33+00'),
('ccccdddd-3333-4444-8555-666677778888', 'INV-2603000006', 'f1f6e14c-0161-42e3-9b00-e0a895e2b511', '4f314a32-8483-44a0-afb1-0f57fa3564dd', 20150, 0, 0, 20150, 10000, 10150, 'partial', '2026-03-11', NULL, 'BDT', NULL, '2026-03-04 07:32:04+00', '2026-03-04 07:32:03+00'),
('ddddeeee-4444-4555-8666-777788889999', 'INV-2603000007', '5e78773c-2d94-4087-b573-f412c168f714', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 5900, 0, 0, 5900, 0, 5900, 'unpaid', '2026-03-11', NULL, 'BDT', NULL, '2026-03-04 08:52:40+00', '2026-03-04 08:53:26+00')
ON CONFLICT (id) DO NOTHING;

-- 9. INVOICE ITEMS
INSERT INTO invoice_items (id, invoice_id, description, service_type, package_name, domain, renewal_date, qty, price, total) VALUES
('f177117d-9267-4145-b849-468279cd5603', 'fe6c21df-5893-4eca-b7b0-53525e52efea', 'ওয়েব হোস্টিং', 'hosting', 'বিজনেস হোস্টিং', 'smelitehajj.com', '2027-01-26', 1, 5900, 5900),
('c5c744a2-bb82-4c5d-999d-9054da704412', '4ac11dfa-b6f0-4478-886d-dae089aa92c4', 'ওয়েব হোস্টিং', 'hosting', 'স্টার্টার হোস্টিং', 'soft.smelitehajj.com', '2027-01-26', 1, 3500, 3500),
('7f1ab7c3-eedb-4d0d-9a7a-dfe8517b5cc9', 'b069e1c8-27b0-49a2-bada-a81caa1543ee', 'ডোমেইন রেজিস্ট্রেশন', 'domain', 'Custom', 'smelitehajj.com', '2026-08-19', 1, 1750, 1750),
('0d378ee4-8703-4c10-9427-94fe1660e5c4', '00560484-6b8e-4230-ae70-7343102b2d76', 'ডোমেইন রেজিস্ট্রেশন', 'domain', 'Custom', 'zenithoverseasbd.com', '2027-02-21', 1, 1750, 1750),
('48cc5e69-f419-4550-a425-21214d28c36a', '68a122a4-8aea-4bc3-960b-128b74ec24c5', 'ওয়েব হোস্টিং', 'hosting', 'স্টার্টার হোস্টিং', 'zenithoverseasbd.com', '2026-02-21', 1, 3500, 3500),
('77d417ef-0761-4530-af83-85967e90920f', '297e98ab-29d1-4d9d-8b04-1d71285240d3', 'ওয়েব ডেভেলপমেন্ট', 'web_development', 'বেসিক ওয়েবসাইট', NULL, NULL, 1, 15000, 15000),
('8a472e0c-7356-4c3a-8067-ec78267d44ea', '1847c4e5-d990-4037-97cd-0b6081d98fec', 'ডোমেইন রেজিস্ট্রেশন', 'domain', 'Custom', 'rahekabatravels.com', '2027-02-27', 1, 1750, 1750),
('e0e66e53-c605-4aa1-9c93-17a7a911cfea', '1847c4e5-d990-4037-97cd-0b6081d98fec', 'ওয়েব হোস্টিং', 'hosting', 'বিজনেস হোস্টিং', 'rahekabatravels.com', '2027-02-27', 1, 5900, 5900),
('0319456c-9db8-4db2-bd9c-ba89fb4f7f53', '1847c4e5-d990-4037-97cd-0b6081d98fec', 'ওয়েব ডেভেলপমেন্ট', 'web_development', 'প্রফেশনাল ওয়েবসাইট', NULL, NULL, 1, 35000, 35000),
('dd5001d3-39f3-4644-91a7-9f8dc7666263', '45898306-03ce-4af9-b930-d7b3a3631274', 'ডোমেইন রেজিস্ট্রেশন', 'domain', 'Custom', 'darulfurkantravels.com', '2027-01-31', 1, 1750, 1750),
('387280db-e5a6-4a8a-ad17-a83cba3c5bae', '45898306-03ce-4af9-b930-d7b3a3631274', 'ওয়েব হোস্টিং', 'hosting', 'বিজনেস হোস্টিং', 'darulfurkantravels.com', '2026-01-31', 1, 5900, 5900),
('afdd2b9b-bde7-4dfa-99be-cee48598b354', '45898306-03ce-4af9-b930-d7b3a3631274', 'ওয়েব ডেভেলপমেন্ট', 'web_development', 'প্রফেশনাল ওয়েবসাইট', NULL, NULL, 1, 35000, 35000),
('016a69b4-8312-48b7-8b31-cab8dbf3ea83', '22c6a897-daf8-409f-ada0-7b6b165ce58c', 'ডোমেইন রেজিস্ট্রেশন', 'domain', 'Custom', 'rofroftravels.com', '2027-02-23', 1, 1750, 1750),
('a7c81662-071f-45f9-b7c7-adf213258a23', '22c6a897-daf8-409f-ada0-7b6b165ce58c', 'ওয়েব হোস্টিং', 'hosting', 'স্টার্টার হোস্টিং', 'rofroftravels.com', '2027-02-23', 1, 3500, 3500),
('6ac7de7f-0cfa-4296-8c94-0cfb4d06856b', '22c6a897-daf8-409f-ada0-7b6b165ce58c', 'ওয়েব ডেভেলপমেন্ট', 'web_development', 'বেসিক ওয়েবসাইট', NULL, NULL, 1, 15000, 15000)
ON CONFLICT (id) DO NOTHING;

-- 10. ORDER ITEMS (using correct column names: package_name, qty, price)
INSERT INTO order_items (id, order_id, service_type, package_name, description, domain, qty, price, total) VALUES
('d5622853-39bd-4592-820f-f2cdcaef114d', '329d6a7a-1b9c-484f-9fdd-5140937f89e6', 'domain', 'ডোমেইন রেজিস্ট্রেশন', 'ডোমেইন রেজিস্ট্রেশন', 'rofroftravels.com', 1, 1750, 1750),
('e1d91ba6-cc33-4788-bd4d-eb681f7d901b', '329d6a7a-1b9c-484f-9fdd-5140937f89e6', 'hosting', 'ওয়েব হোস্টিং', 'ওয়েব হোস্টিং', 'rofroftravels.com', 1, 3500, 3500),
('04429d42-3e57-4665-bfe8-df33fa494bc7', '329d6a7a-1b9c-484f-9fdd-5140937f89e6', 'web_development', 'ওয়েব ডেভেলপমেন্ট', 'ওয়েব ডেভেলপমেন্ট', NULL, 1, 15000, 15000),
('d6a0fa8e-7067-41a1-bbb5-199dca844e8f', '8ad01a8a-dc70-4c17-8b2b-1c397204bbb3', 'domain', 'ডোমেইন রেজিস্ট্রেশন', 'ডোমেইন রেজিস্ট্রেশন', 'saztravelvisa.com', 1, 1750, 1750),
('23a8cd8f-9687-4e34-b954-0e398dc9849f', '8ad01a8a-dc70-4c17-8b2b-1c397204bbb3', 'hosting', 'ওয়েব হোস্টিং', 'ওয়েব হোস্টিং', 'saztravelvisa.com', 1, 3500, 3500),
('7eb5c223-d805-4e02-afa3-11ca2cf66d4c', '8ad01a8a-dc70-4c17-8b2b-1c397204bbb3', 'web_development', 'ওয়েব ডেভেলপমেন্ট', 'ওয়েব ডেভেলপমেন্ট', NULL, 1, 15000, 15000),
('6f30930e-4585-4e44-aede-414a61b3620f', '29d41368-f8ee-41e3-845a-52249eb4743c', 'domain', 'ডোমেইন রেজিস্ট্রেশন', 'ডোমেইন রেজিস্ট্রেশন', 'masudtravelsagency.com', 1, 1750, 1750),
('03a50b31-41e8-4212-82b0-11e555c359af', '29d41368-f8ee-41e3-845a-52249eb4743c', 'hosting', 'ওয়েব হোস্টিং', 'ওয়েব হোস্টিং', 'masudtravelsagency.com', 1, 5900, 5900),
('6522f29f-8e34-4f97-85be-289449fcd785', '29d41368-f8ee-41e3-845a-52249eb4743c', 'web_development', 'ওয়েব ডেভেলপমেন্ট', 'ওয়েব ডেভেলপমেন্ট', NULL, 1, 35000, 35000),
('076fe5a6-86f6-4360-9510-e3e3d3ad8ac2', 'be8132ed-29dd-406d-9b40-6c5f3b24d7e8', 'software_development', 'সফটওয়্যার ডেভেলপমেন্ট', 'সফটওয়্যার ডেভেলপমেন্ট', NULL, 1, 30000, 30000),
('6ed88d10-6d60-444a-8a5c-0084fe25f822', 'f1f6e14c-0161-42e3-9b00-e0a895e2b511', 'domain', 'ডোমেইন রেজিস্ট্রেশন', 'ডোমেইন রেজিস্ট্রেশন', 'ngtravels.com', 1, 1650, 1650),
('bb47eb02-0708-4255-ade4-c04344cede51', 'f1f6e14c-0161-42e3-9b00-e0a895e2b511', 'hosting', 'ওয়েব হোস্টিং', 'ওয়েব হোস্টিং', 'ngtravels.com', 1, 3500, 3500),
('955c5d16-3ee6-46d0-a42d-0fa0015567d2', 'f1f6e14c-0161-42e3-9b00-e0a895e2b511', 'web_development', 'ওয়েব ডেভেলপমেন্ট', 'ওয়েব ডেভেলপমেন্ট', NULL, 1, 15000, 15000),
('944d5f1f-7a61-4307-9766-e2531a58cb9f', '5e78773c-2d94-4087-b573-f412c168f714', 'hosting', 'ওয়েব হোস্টিং', 'ওয়েব হোস্টিং', 'smtradeint.com', 1, 5900, 5900)
ON CONFLICT (id) DO NOTHING;

-- 11. PROJECTS
INSERT INTO projects (id, order_id, user_id, name, description, status) VALUES
('1413cdbe-0313-4946-b7f1-14de270d6fc5', '164f6916-f66e-442b-a9cf-300a92243310', 'edf1f376-558d-43cb-9144-1815eabfa468', 'বেসিক ওয়েবসাইট - Project', 'Auto-created from Order 2603000007', 'pending')
ON CONFLICT (id) DO NOTHING;

-- 12. SUBSCRIPTIONS
INSERT INTO subscriptions (id, user_id, service_type, status, billing_cycle, amount, next_billing_date, auto_renew, metadata) VALUES
('dcfad509-0afb-4731-84f3-88e8f894f400', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 'domain', 'active', 'yearly', 1750, '2027-02-23', true, '{"domain":"rofroftravels.com"}'),
('f28f1f46-660e-471a-bbb2-382fb33b2a2c', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 'hosting', 'active', 'yearly', 3500, '2027-02-23', true, '{"domain":"rofroftravels.com"}'),
('d51545e7-7da0-411f-bc9c-22110f9e2266', 'f9ef0dcf-c041-4906-80f7-009504cb6968', 'domain', 'active', 'yearly', 1750, '2027-03-04', true, '{"domain":"saztravelvisa.com"}'),
('1f68e0dd-043f-4b25-ba15-003f3aebfcef', 'f9ef0dcf-c041-4906-80f7-009504cb6968', 'hosting', 'active', 'yearly', 3500, '2027-03-04', true, '{"domain":"saztravelvisa.com"}'),
('da1534e1-0ef3-4ea7-b6f3-b529d7c2e507', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 'domain', 'active', 'yearly', 1750, '2027-03-03', true, '{"domain":"masudtravelsagency.com"}'),
('582bcd81-29c2-42ec-863a-9e9b7742ce20', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 'hosting', 'active', 'yearly', 5900, '2027-03-04', true, '{"domain":"masudtravelsagency.com"}'),
('30119df8-9ca9-4471-aee5-49df93201f9b', '4f314a32-8483-44a0-afb1-0f57fa3564dd', 'domain', 'active', 'yearly', 1650, '2027-03-04', true, '{"domain":"ngtravels.com"}'),
('90f85c0e-c80d-4e2f-b47b-a1c9a4cbaf8e', '4f314a32-8483-44a0-afb1-0f57fa3564dd', 'hosting', 'active', 'yearly', 3500, '2027-03-04', true, '{"domain":"ngtravels.com"}'),
('eeee1111-aaaa-4bbb-8ccc-ddddeeee1111', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'hosting', 'active', 'yearly', 5900, '2027-03-04', true, '{"domain":"smtradeint.com"}')
ON CONFLICT (id) DO NOTHING;

-- 13. SYSTEM SETTINGS
INSERT INTO system_settings (id, key, value, category, description, is_sensitive) VALUES
('6743072f-3d55-4769-b310-a776e7cd74b1', 'admin_notification_email', '"digiwebdex@gmail.com"', 'notifications', 'Admin notification email', false),
('c2cfc396-5e6a-4258-9512-72d2d17d6594', 'admin_notification_phone', '"+8801674533303"', 'notifications', 'Admin notification phone', false),
('4e234abf-dee9-48a6-8f76-43ca64c6bd91', 'bkash_number', '"01XXXXXXXXX"', 'payment', 'bKash payment number', false),
('d17dd14c-b9d3-4960-9f0a-5c4deae23930', 'proposal_reminder_enabled', 'true', 'automation', 'Enable proposal reminder', false),
('232f8e6c-948a-44c0-9a95-336ca98b9ab7', 'proposal_reminder_days', '3', 'automation', 'Days before proposal reminder', false),
('445a73be-65ca-40c4-89ca-17295b8e45ae', 'milestone_reminder_days', '2', 'automation', 'Days before milestone due reminder', false),
('81ece454-4bd4-4caf-b311-21d1e6df8c11', 'auto_reminder_enabled', 'true', 'automation', 'Enable automatic reminders', false),
('024f040d-4a75-4d80-ab0a-de15c230ad68', 'subscription_auto_renew', 'true', 'automation', 'Enable subscription auto-renewal', false),
('3fd4e0ee-a1fc-4a9f-82c3-4f65da00410b', 'reminder_interval_days', '3', 'business', 'Reminder interval in days', false),
('0727588f-342b-41fb-92a5-40d325421fe2', 'default_commission_rate', '10', 'business', 'Default affiliate commission rate (%)', false),
('4a68c28c-f21a-4084-973f-da86e03b45fc', 'default_reseller_margin', '15', 'business', 'Default reseller margin (%)', false),
('b38ebcfd-f5b8-4ab2-b90d-c8ce94196cbd', 'default_milestone_percentages', '{"mid":40,"final":30,"initial":30}', 'business', 'Default milestone split percentages', false),
('9d6bedbd-8865-44fc-b588-80a3c426e0e1', 'default_currency', '"BDT"', 'business', 'Default currency code', false),
('b8ab448a-d611-4e38-ba1e-9d253646e51c', 'grace_period_days', '7', 'business', 'Payment grace period in days', false),
('7d44b653-eb76-462f-9fb6-4c04b03e9491', 'company_name', '"DigiWebDex"', 'general', 'Company name', false),
('de1305fa-4e2a-4976-b8bd-126d97adbb8b', 'company_email', '"info@digiwebdex.com"', 'general', 'Company email', false),
('9b9efd46-fe41-46f8-bfe7-3bf0f779d8b0', 'company_phone', '"+8801XXXXXXXXX"', 'general', 'Company phone', false),
('ee455df9-a4b5-4229-8236-8f92d1052dce', 'company_address', '"Dhaka, Bangladesh"', 'general', 'Company address', false),
('b7a21aa6-9c33-42b8-9f0a-86849c6bbbbc', 'company_logo_url', '""', 'general', 'Company logo URL', false),
('1f103387-1150-4b9a-8fd5-978733ab6bf9', 'header_order_button_enabled', 'true', 'general', 'Enable/disable the Order button in the header', false),
('ad525f46-bd75-403c-8af8-8da8ec002886', 'floating_order_button_enabled', 'false', 'general', 'Enable/disable the floating Order Now button', false)
ON CONFLICT (key) DO NOTHING;

-- 14. CONTACT MESSAGES
INSERT INTO contact_messages (id, name, email, phone, subject, message, status) VALUES
('75dc2814-69e3-4ed0-bd71-bc72e1e2b535', 'Nathaniel Brooks', 'nathaniel.reid@jmailservice.com', '8054002077', 'Reach Real Buyers Searching for You', 'We have developed a unique advertising platform.', 'pending'),
('1b13f596-006b-40d8-9bd0-65f0b88e37e7', 'William Grant', 'william.grant@jmailservice.com', '8054002077', 'Quick Way to Get More Customers', 'If I could get your business in front of hundreds of local searchers by tomorrow.', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Re-enable triggers
SET session_replication_role = 'DEFAULT';

-- Set admin password
UPDATE users SET password_hash = crypt('Iq11151000', gen_salt('bf', 12)) WHERE email = 'digiwebdex@gmail.com';

-- VERIFICATION
SELECT 'users' AS "table", COUNT(*) AS "count" FROM users
UNION ALL SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'invoice_items', COUNT(*) FROM invoice_items
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'service_packages', COUNT(*) FROM service_packages
UNION ALL SELECT 'domain_pricing', COUNT(*) FROM domain_pricing
UNION ALL SELECT 'system_settings', COUNT(*) FROM system_settings
UNION ALL SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL SELECT 'projects', COUNT(*) FROM projects
ORDER BY "table";
