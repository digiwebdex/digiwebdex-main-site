-- DigiWebDex Complete Data Import for VPS
-- Generated from Supabase on 2026-03-09
-- IMPORTANT: Run AFTER schema, functions, triggers are created
-- This script disables triggers during import to avoid auto-generation conflicts

BEGIN;

-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- =============================================
-- 1. USERS TABLE (for auth - create basic entries)
-- =============================================
-- Note: Your VPS uses JWT auth, not Supabase auth
-- Users need to be created via the backend registration endpoint
-- or inserted directly into the users table

INSERT INTO users (id, email, password_hash, full_name, phone, created_at) VALUES
('b43e1fc1-857a-4aba-b169-766211ac176c', 'digiwebdex@gmail.com', '$2b$10$placeholder_admin_hash', 'IQBAL HOSSAIN', NULL, '2026-02-07 17:12:15.404813+00'),
('0a574a15-d015-4fa2-a5fa-740222ed1de1', 'smelitehajj@gmail.com', '$2b$10$placeholder_hash', 'A. S. M. Al-Amin', '+8801867666888', '2026-02-27 18:20:36.781887+00'),
('7287f2f7-e535-40c6-8bf1-5c70a113c386', 'zenith@gmail.com', '$2b$10$placeholder_hash', 'Saimon Islam', '01841909042', '2026-02-21 17:45:03.250056+00'),
('dca994c9-2cb7-4f5a-b341-2664d90c50d2', 'darulfurkan@gmail.com', '$2b$10$placeholder_hash', 'দারুল ফুরকান ট্যুরস এন্ড ট্রাভেলস', '01339080532', '2026-02-27 22:12:03.520815+00'),
('d0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 'rahekaba@gmail.com', '$2b$10$placeholder_hash', 'RAHE KABA', '+880 1601-505050', '2026-02-28 04:29:25.907795+00'),
('b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 'rofrof@gmail.com', '$2b$10$placeholder_hash', 'Rof Rof Travels', '01874609799', '2026-03-02 06:14:05.117443+00'),
('f9ef0dcf-c041-4906-80f7-009504cb6968', 'sabbir@gmail.com', '$2b$10$placeholder_hash', 'Sabbir', '01865891727', '2026-03-04 05:20:37.178132+00'),
('e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 'masud@gmail.com', '$2b$10$placeholder_hash', 'MD Masud', '01711727950', '2026-03-04 06:33:35.219179+00'),
('4f314a32-8483-44a0-afb1-0f57fa3564dd', 'ngtravels@gmail.com', '$2b$10$placeholder_hash', 'NG Travels', ' 01912171463', '2026-03-04 07:16:28.891877+00'),
('437ec3b1-119e-4001-8820-d5cf3ef59061', 'seventrip@gmail.com', '$2b$10$placeholder_hash', 'Seven Trip', '01749373748', '2026-03-04 08:12:46.378598+00'),
('edf1f376-558d-43cb-9144-1815eabfa468', 'lucky@gmail.com', '$2b$10$placeholder_hash', 'Lucky Tours and Travels', '01577004689', '2026-03-04 11:56:36.99978+00'),
('27012e2b-3cb3-41f0-8438-42d129b3c9c7', 'shohure@gmail.com', '$2b$10$placeholder_hash', 'Shohure Online', '01840500543', '2026-03-05 10:22:44.150429+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 2. PROFILES
-- =============================================
INSERT INTO profiles (id, user_id, full_name, phone, company_name, address, city, country, avatar_url, balance_due, created_at, updated_at) VALUES
('9ad67e85-1f60-4fc9-aa70-6377cfe7947a', 'b43e1fc1-857a-4aba-b169-766211ac176c', 'IQBAL HOSSAIN', NULL, NULL, NULL, NULL, 'Bangladesh', NULL, 0, '2026-02-07 17:12:15.404813+00', '2026-02-07 17:12:15.404813+00'),
('ceffce25-b222-4005-8e54-55b06a0960f6', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 'Saimon Islam', '01841909042', 'Zenith Overseas', NULL, NULL, 'Bangladesh', NULL, 13000, '2026-02-21 17:45:03.250056+00', '2026-02-27 22:06:58.17137+00'),
('00684a54-0740-4c11-a40f-321964cdb6e8', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'A. S. M. Al-Amin', '+8801867666888', 'S M Elite Hajj Limited', NULL, NULL, 'Bangladesh', NULL, 30000.00, '2026-02-27 18:20:36.781887+00', '2026-03-04 08:53:26.426599+00'),
('4432cc21-99f4-43bb-89bd-2d0e8295217d', 'dca994c9-2cb7-4f5a-b341-2664d90c50d2', 'দারুল ফুরকান ট্যুরস এন্ড ট্রাভেলস', '01339080532', '', '', '', 'Bangladesh', NULL, 15000, '2026-02-27 22:12:03.520815+00', '2026-03-04 08:05:58.896678+00'),
('d0ccea5f-cde8-4988-8ded-f53154f22ecc', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 'RAHE KABA', '+880 1601-505050', 'RAHE KABA', '', '', 'Bangladesh', NULL, 20000, '2026-02-28 04:29:25.907795+00', '2026-03-04 08:05:37.316027+00'),
('54e4e36b-6f6a-4216-bf57-8ab17a4e2e1a', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 'Rof Rof Travels', '01874609799', 'https://rofroftravels.com/', '', '', 'Bangladesh', NULL, 0, '2026-03-02 06:14:05.117443+00', '2026-03-02 06:19:38.75497+00'),
('6866d789-bfad-40ce-a79f-5d993ded9aac', 'f9ef0dcf-c041-4906-80f7-009504cb6968', 'Sabbir', '01865891727', 'saztravelvisa.com', '', '', 'Bangladesh', NULL, 8500.00, '2026-03-04 05:20:37.178132+00', '2026-03-04 05:23:26.966055+00'),
('aede3a6b-67f8-41ba-a56c-ad44ee33e503', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 'MD Masud', '01711727950', 'masudtravelsagency.com', '', '', 'Bangladesh', NULL, 20000.00, '2026-03-04 06:33:35.219179+00', '2026-03-04 06:37:34.853309+00'),
('ce74cd9b-8551-4b0f-bbff-41d93d600691', '4f314a32-8483-44a0-afb1-0f57fa3564dd', 'NG Travels', ' 01912171463', 'NG Travels', '', '', 'Bangladesh', NULL, 10000.00, '2026-03-04 07:16:28.891877+00', '2026-03-04 07:32:03.444207+00'),
('678e33b2-4f9d-4c7e-a331-d76e6df40dee', '437ec3b1-119e-4001-8820-d5cf3ef59061', 'Seven Trip', '01749373748', 'Seven Trip', '', '', 'Bangladesh', NULL, 0, '2026-03-04 08:12:46.378598+00', '2026-03-04 08:12:46.658991+00'),
('83d62096-b5a2-49f3-8077-533d9ed0bcab', 'edf1f376-558d-43cb-9144-1815eabfa468', 'Lucky Tours and Travels', '01577004689', 'Lucky Tours and Travels', '', '', 'Bangladesh', NULL, 30499, '2026-03-04 11:56:36.99978+00', '2026-03-05 23:11:11.505502+00'),
('1148e897-99d7-4362-b17d-98f20b291390', '27012e2b-3cb3-41f0-8438-42d129b3c9c7', 'Shohure Online', '01840500543', 'Shohure Online', '', '', 'Bangladesh', NULL, 0, '2026-03-05 10:22:44.150429+00', '2026-03-05 10:22:44.469007+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 3. USER ROLES
-- =============================================
INSERT INTO user_roles (id, user_id, role, created_at) VALUES
('78f5703e-54c9-40bb-b032-e0bce4a857cf', 'b43e1fc1-857a-4aba-b169-766211ac176c', 'admin', '2026-02-07 17:12:15.404813+00'),
('238d2efe-960d-4551-b714-ba81726e3189', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 'client', '2026-02-21 17:45:03.250056+00'),
('aef43781-91a8-4edc-9a9c-37114677aa0b', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'client', '2026-02-27 18:20:36.781887+00'),
('528454f6-726d-447c-8a80-d76eb0ea957a', 'dca994c9-2cb7-4f5a-b341-2664d90c50d2', 'client', '2026-02-27 22:12:03.520815+00'),
('cd42b6c0-c0cc-4c1f-8c08-eb698bd28fa9', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 'client', '2026-02-28 04:29:25.907795+00'),
('99f0e575-157b-4b84-979c-71db6a62d0c6', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 'client', '2026-03-02 06:14:05.117443+00'),
('c0290ca6-4a9d-48ad-9d4c-234f23a50545', 'f9ef0dcf-c041-4906-80f7-009504cb6968', 'client', '2026-03-04 05:20:37.178132+00'),
('64b86c2a-1c5d-4e9d-9e4d-fad569c4a152', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 'client', '2026-03-04 06:33:35.219179+00'),
('8aa09cc2-fa7c-4b05-94e7-e05ee0988157', '4f314a32-8483-44a0-afb1-0f57fa3564dd', 'client', '2026-03-04 07:16:28.891877+00'),
('02ad628c-ad88-4dfd-a758-c8b30d3c759d', '437ec3b1-119e-4001-8820-d5cf3ef59061', 'client', '2026-03-04 08:12:46.378598+00'),
('c9ac6edc-e2a6-4664-9056-e344e27cf779', 'edf1f376-558d-43cb-9144-1815eabfa468', 'client', '2026-03-04 11:56:36.99978+00'),
('8a471ee2-6696-4e8b-9f3d-0009591c8f02', '27012e2b-3cb3-41f0-8438-42d129b3c9c7', 'client', '2026-03-05 10:22:44.150429+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 4. SERVICE CATEGORIES
-- =============================================
INSERT INTO service_categories (id, name_en, name_bn, slug, description_en, description_bn, icon, is_active, sort_order, created_at, updated_at) VALUES
('0a0ce8fd-4b8b-42f6-b661-03873d06af71', 'Domain Services', 'ডোমেইন সেবা', 'domain-services', 'Complete domain registration and management services', 'সম্পূর্ণ ডোমেইন রেজিস্ট্রেশন এবং ম্যানেজমেন্ট সেবা', NULL, true, 1, '2026-02-07 17:34:29.43851+00', '2026-02-07 17:34:29.43851+00'),
('e39e0f2f-7af7-45e3-9bf2-b7188018dea8', 'Web Hosting', 'ওয়েব হোস্টিং', 'web-hosting', 'Fast, secure and reliable web hosting solutions', 'দ্রুত, সুরক্ষিত এবং নির্ভরযোগ্য ওয়েব হোস্টিং সলিউশন', NULL, true, 2, '2026-02-07 17:34:29.43851+00', '2026-02-07 17:34:29.43851+00'),
('7671168b-c448-4944-873d-cf7dd52a6a4b', 'Web Development', 'ওয়েব ডেভেলপমেন্ট', 'web-development', 'Professional website design and development', 'প্রফেশনাল ওয়েবসাইট ডিজাইন এবং ডেভেলপমেন্ট', NULL, true, 3, '2026-02-07 17:34:29.43851+00', '2026-02-07 17:34:29.43851+00'),
('10b3ad54-e6ff-43d4-8488-b1aefd1f5d10', 'Software Development', 'সফটওয়্যার ডেভেলপমেন্ট', 'software-development', 'Custom software and application development', 'কাস্টম সফটওয়্যার এবং অ্যাপ্লিকেশন ডেভেলপমেন্ট', NULL, true, 4, '2026-02-07 17:34:29.43851+00', '2026-02-07 17:34:29.43851+00'),
('25570ba8-91ba-47ba-b94b-84fd045ba5c5', 'Digital Marketing', 'ডিজিটাল মার্কেটিং', 'digital-marketing', 'SEO, Social Media and PPC marketing services', 'SEO, সোশ্যাল মিডিয়া এবং PPC মার্কেটিং সেবা', NULL, true, 5, '2026-02-07 17:34:29.43851+00', '2026-02-07 17:34:29.43851+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 5. SERVICES
-- =============================================
INSERT INTO services (id, name_en, name_bn, slug, description_en, description_bn, service_type, category_id, features_en, features_bn, image_url, is_active, meta_title, meta_description, sort_order, created_at, updated_at) VALUES
('50acf2b0-cb1b-4dec-8f78-987edd3ff46a', 'Domain Registration', 'ডোমেইন রেজিস্ট্রেশন', 'domain-registration', 'Register your perfect domain name with competitive pricing and free WHOIS privacy', 'প্রতিযোগিতামূলক মূল্যে এবং বিনামূল্যে WHOIS প্রাইভেসি সহ আপনার পারফেক্ট ডোমেইন নাম রেজিস্টার করুন', 'domain', '0a0ce8fd-4b8b-42f6-b661-03873d06af71', ARRAY['Free WHOIS Privacy','Free DNS Management','Domain Forwarding','Easy Transfer','24/7 Support'], ARRAY['বিনামূল্যে WHOIS প্রাইভেসি','বিনামূল্যে DNS ম্যানেজমেন্ট','ডোমেইন ফরওয়ার্ডিং','সহজ ট্রান্সফার','২৪/৭ সাপোর্ট'], NULL, true, NULL, NULL, 1, '2026-02-07 17:37:35.363021+00', '2026-02-21 17:13:57.959872+00'),
('a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'Web Hosting', 'ওয়েব হোস্টিং', 'web-hosting', 'Lightning fast SSD hosting with 99.9% uptime guarantee and free SSL', 'লাইটনিং ফাস্ট SSD হোস্টিং ৯৯.৯% আপটাইম গ্যারান্টি এবং বিনামূল্যে SSL সহ', 'hosting', 'e39e0f2f-7af7-45e3-9bf2-b7188018dea8', ARRAY['Free SSL Certificate','SSD Storage','99.9% Uptime','Daily Backups','cPanel Access','24/7 Support'], ARRAY['বিনামূল্যে SSL সার্টিফিকেট','SSD স্টোরেজ','৯৯.৯% আপটাইম','দৈনিক ব্যাকআপ','cPanel অ্যাক্সেস','২৪/৭ সাপোর্ট'], NULL, true, NULL, NULL, 2, '2026-02-07 17:37:35.363021+00', '2026-02-21 17:13:57.959872+00'),
('e6997007-f8be-4378-bc64-31c2df3de565', 'Web Development', 'ওয়েব ডেভেলপমেন্ট', 'web-development', 'Professional, responsive websites designed to grow your business', 'আপনার ব্যবসা বৃদ্ধির জন্য ডিজাইন করা প্রফেশনাল, রেসপন্সিভ ওয়েবসাইট', 'web_development', '7671168b-c448-4944-873d-cf7dd52a6a4b', ARRAY['Custom Design','Mobile Responsive','SEO Optimized','Fast Loading','CMS Integration','Free Support (1 Year)'], ARRAY['কাস্টম ডিজাইন','মোবাইল রেসপন্সিভ','SEO অপ্টিমাইজড','ফাস্ট লোডিং','CMS ইন্টিগ্রেশন','বিনামূল্যে সাপোর্ট (১ বছর)'], NULL, true, NULL, NULL, 3, '2026-02-07 17:37:35.363021+00', '2026-02-21 17:13:57.959872+00'),
('2408cab5-eec8-4627-a584-78cc3c28506b', 'Software Development', 'সফটওয়্যার ডেভেলপমেন্ট', 'software-development', 'Custom software solutions tailored to your business needs', 'আপনার ব্যবসার প্রয়োজন অনুযায়ী কাস্টম সফটওয়্যার সলিউশন', 'software_development', '10b3ad54-e6ff-43d4-8488-b1aefd1f5d10', ARRAY['Custom Development','API Integration','Database Design','Mobile Apps','Cloud Deployment','Ongoing Support'], ARRAY['কাস্টম ডেভেলপমেন্ট','API ইন্টিগ্রেশন','ডাটাবেজ ডিজাইন','মোবাইল অ্যাপস','ক্লাউড ডিপ্লয়মেন্ট','চলমান সাপোর্ট'], NULL, true, NULL, NULL, 4, '2026-02-07 17:37:35.363021+00', '2026-02-21 17:13:57.959872+00'),
('6879331e-17fc-400c-8450-4019844281a8', 'Digital Marketing', 'ডিজিটাল মার্কেটিং', 'digital-marketing', 'Grow your online presence with expert SEO, Social Media and PPC services', 'এক্সপার্ট SEO, সোশ্যাল মিডিয়া এবং PPC সার্ভিসের মাধ্যমে আপনার অনলাইন উপস্থিতি বাড়ান', 'digital_marketing', '25570ba8-91ba-47ba-b94b-84fd045ba5c5', ARRAY['SEO Optimization','Social Media Management','Google Ads','Facebook Ads','Content Marketing','Monthly Reports'], ARRAY['SEO অপ্টিমাইজেশন','সোশ্যাল মিডিয়া ম্যানেজমেন্ট','গুগল অ্যাডস','ফেসবুক অ্যাডস','কন্টেন্ট মার্কেটিং','মাসিক রিপোর্ট'], NULL, true, NULL, NULL, 5, '2026-02-07 17:37:35.363021+00', '2026-02-21 17:13:57.959872+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 6. SERVICE PACKAGES
-- =============================================
INSERT INTO service_packages (id, service_id, name_en, name_bn, price, currency, billing_type, billing_cycle_months, features_en, features_bn, is_active, is_popular, setup_fee, sort_order, created_at, updated_at) VALUES
('a63f3cb7-d2c8-4084-b9c5-26097ae9bc78', 'e6997007-f8be-4378-bc64-31c2df3de565', 'Basic Website', 'বেসিক ওয়েবসাইট', 15000.00, 'BDT', 'one_time', NULL, ARRAY['5 Pages','Mobile Responsive','Contact Form','Basic SEO','Social Media Links','1 Year Free Support'], ARRAY['৫টি পেজ','মোবাইল রেসপন্সিভ','কন্টাক্ট ফর্ম','বেসিক SEO','সোশ্যাল মিডিয়া লিংক','১ বছর বিনামূল্যে সাপোর্ট'], true, false, 0.00, 1, '2026-02-07 17:40:32.455864+00', '2026-02-07 17:40:32.455864+00'),
('a4363364-9b7f-4d49-b7a0-e401387084fe', 'e6997007-f8be-4378-bc64-31c2df3de565', 'Professional Website', 'প্রফেশনাল ওয়েবসাইট', 35000.00, 'BDT', 'one_time', NULL, ARRAY['10 Pages','CMS Integration','Blog Section','Advanced SEO','Google Analytics','Speed Optimization','1 Year Free Support'], ARRAY['১০টি পেজ','CMS ইন্টিগ্রেশন','ব্লগ সেকশন','অ্যাডভান্সড SEO','গুগল অ্যানালিটিক্স','স্পিড অপ্টিমাইজেশন','১ বছর বিনামূল্যে সাপোর্ট'], true, true, 0.00, 2, '2026-02-07 17:40:32.455864+00', '2026-02-07 17:40:32.455864+00'),
('123eace6-215b-43be-8dd9-fa181fed7585', 'e6997007-f8be-4378-bc64-31c2df3de565', 'E-commerce Website', 'ই-কমার্স ওয়েবসাইট', 75000.00, 'BDT', 'one_time', NULL, ARRAY['Unlimited Products','Payment Gateway','Inventory Management','Order Tracking','Customer Accounts','Mobile App Ready','1 Year Free Support'], ARRAY['আনলিমিটেড প্রোডাক্ট','পেমেন্ট গেটওয়ে','ইনভেন্টরি ম্যানেজমেন্ট','অর্ডার ট্র্যাকিং','কাস্টমার অ্যাকাউন্ট','মোবাইল অ্যাপ রেডি','১ বছর বিনামূল্যে সাপোর্ট'], true, false, 0.00, 3, '2026-02-07 17:40:32.455864+00', '2026-02-07 17:40:32.455864+00'),
('e12133ac-51ee-4403-bde6-368b0c4b303c', '2408cab5-eec8-4627-a584-78cc3c28506b', 'Custom Application', 'কাস্টম অ্যাপ্লিকেশন', 100000.00, 'BDT', 'milestone', NULL, ARRAY['Requirements Analysis','Custom Design','Development','Testing','Deployment','3 Months Support'], ARRAY['প্রয়োজনীয়তা বিশ্লেষণ','কাস্টম ডিজাইন','ডেভেলপমেন্ট','টেস্টিং','ডিপ্লয়মেন্ট','৩ মাস সাপোর্ট'], true, true, 0.00, 1, '2026-02-07 17:40:32.455864+00', '2026-02-07 17:40:32.455864+00'),
('551d10b5-d753-4d67-ab46-397fe95400b7', '2408cab5-eec8-4627-a584-78cc3c28506b', 'Enterprise Solution', 'এন্টারপ্রাইজ সলিউশন', 500000.00, 'BDT', 'milestone', NULL, ARRAY['Full Requirements Gathering','Architecture Design','Multi-module Development','Integration','Training','1 Year Support','SLA Guarantee'], ARRAY['সম্পূর্ণ প্রয়োজনীয়তা সংগ্রহ','আর্কিটেকচার ডিজাইন','মাল্টি-মডিউল ডেভেলপমেন্ট','ইন্টিগ্রেশন','ট্রেনিং','১ বছর সাপোর্ট','SLA গ্যারান্টি'], true, false, 0.00, 2, '2026-02-07 17:40:32.455864+00', '2026-02-07 17:40:32.455864+00'),
('69e8080d-c2bc-484b-8b4b-2020e379cdd4', '6879331e-17fc-400c-8450-4019844281a8', 'SEO Basic', 'SEO বেসিক', 5000.00, 'BDT', 'recurring', 1, ARRAY['Keyword Research','On-page SEO','Technical SEO Audit','Monthly Report','Google Search Console Setup'], ARRAY['কীওয়ার্ড রিসার্চ','অন-পেজ SEO','টেকনিক্যাল SEO অডিট','মাসিক রিপোর্ট','গুগল সার্চ কনসোল সেটআপ'], true, false, 0.00, 1, '2026-02-07 17:40:32.455864+00', '2026-02-07 17:40:32.455864+00'),
('feeee09a-eaa0-486f-8083-97dc6dee3427', '6879331e-17fc-400c-8450-4019844281a8', 'Social Media Management', 'সোশ্যাল মিডিয়া ম্যানেজমেন্ট', 8000.00, 'BDT', 'recurring', 1, ARRAY['3 Platforms','15 Posts/Month','Content Calendar','Engagement Management','Monthly Analytics'], ARRAY['৩টি প্ল্যাটফর্ম','১৫টি পোস্ট/মাস','কন্টেন্ট ক্যালেন্ডার','এনগেজমেন্ট ম্যানেজমেন্ট','মাসিক অ্যানালিটিক্স'], true, true, 0.00, 2, '2026-02-07 17:40:32.455864+00', '2026-02-07 17:40:32.455864+00'),
('4a0bd3c7-8a9b-4e2c-ad9c-81a46c60af79', '6879331e-17fc-400c-8450-4019844281a8', 'Complete Digital Package', 'কমপ্লিট ডিজিটাল প্যাকেজ', 15000.00, 'BDT', 'recurring', 1, ARRAY['Full SEO','Social Media (All Platforms)','Google Ads Management','Facebook Ads','Content Marketing','Weekly Reports','Dedicated Manager'], ARRAY['সম্পূর্ণ SEO','সোশ্যাল মিডিয়া (সব প্ল্যাটফর্ম)','গুগল অ্যাডস ম্যানেজমেন্ট','ফেসবুক অ্যাডস','কন্টেন্ট মার্কেটিং','সাপ্তাহিক রিপোর্ট','ডেডিকেটেড ম্যানেজার'], true, false, 0.00, 3, '2026-02-07 17:40:32.455864+00', '2026-02-07 17:40:32.455864+00'),
('80ead7e2-e275-4c23-a288-888d5307c641', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'Starter Hosting', 'স্টার্টার হোস্টিং', 3500.00, 'BDT', 'recurring', 12, ARRAY['1 GB SSD Storage','10 GB Bandwidth','1 Email Account','Free SSL','cPanel Access','24/7 Support'], ARRAY['১ GB SSD স্টোরেজ','১০ GB ব্যান্ডউইথ','১টি ইমেইল অ্যাকাউন্ট','বিনামূল্যে SSL','cPanel অ্যাক্সেস','২৪/৭ সাপোর্ট'], true, false, 0.00, 1, '2026-02-07 17:38:17.431164+00', '2026-02-27 18:02:16.86414+00'),
('c61a52ad-730f-41c8-9414-92304ae10377', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'Business Hosting', 'বিজনেস হোস্টিং', 5900.00, 'BDT', 'recurring', 12, ARRAY['5 GB SSD Storage','Unlimited Bandwidth','10 Email Accounts','Free SSL','cPanel Access','Daily Backups','Priority Support'], ARRAY['৫ GB SSD স্টোরেজ','আনলিমিটেড ব্যান্ডউইথ','১০টি ইমেইল অ্যাকাউন্ট','বিনামূল্যে SSL','cPanel অ্যাক্সেস','দৈনিক ব্যাকআপ','প্রায়োরিটি সাপোর্ট'], true, true, 0.00, 2, '2026-02-07 17:38:17.431164+00', '2026-02-27 18:02:16.86414+00'),
('292e1982-934a-4e20-b98e-bbeacf711b26', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'Premium Hosting', 'প্রিমিয়াম হোস্টিং', 14500.00, 'BDT', 'recurring', 12, ARRAY['20 GB SSD Storage','Unlimited Bandwidth','Unlimited Emails','Free SSL','cPanel Access','Daily Backups','Staging Environment','Dedicated Support'], ARRAY['২০ GB SSD স্টোরেজ','আনলিমিটেড ব্যান্ডউইথ','আনলিমিটেড ইমেইল','বিনামূল্যে SSL','cPanel অ্যাক্সেস','দৈনিক ব্যাকআপ','স্টেজিং এনভায়রনমেন্ট','ডেডিকেটেড সাপোর্ট'], true, false, 0.00, 3, '2026-02-07 17:38:17.431164+00', '2026-02-27 18:02:16.86414+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 7. DOMAIN PRICING
-- =============================================
INSERT INTO domain_pricing (id, tld, base_price, renewal_price, transfer_price, currency, is_active, is_popular, margin_percent, sort_order, created_at, updated_at) VALUES
('098d8e69-5ceb-4734-8c8f-d2df525b4b25', '.com', 999, 1750, 1750, 'BDT', true, true, 10, 1, '2026-02-06 18:55:19.037003+00', '2026-02-25 15:13:38.81459+00'),
('64b9ec85-b0b1-4b68-be26-5778b5c4fcbe', '.net', 1900, 1900, 1900, 'BDT', true, true, 10, 2, '2026-02-06 18:55:19.037003+00', '2026-02-08 13:43:55.317861+00'),
('82760c64-4e81-4d6d-bcf6-63de84ecf046', '.org', 1785, 1785, 1785, 'BDT', true, true, 10, 3, '2026-02-06 18:55:19.037003+00', '2026-02-08 13:43:55.317861+00'),
('48d7b0e2-2df8-4d01-82fe-ab4b3bc88dd0', '.info', 3416, 4148, 3904, 'BDT', true, false, 10, 4, '2026-02-06 18:55:19.037003+00', '2026-02-08 13:43:55.317861+00'),
('49628935-382a-4e10-8da9-6ba85bfa0e25', '.biz', 1785, 1785, 1785, 'BDT', true, false, 10, 5, '2026-02-06 18:55:19.037003+00', '2026-02-08 13:43:55.317861+00'),
('f33651c3-a5db-4a3a-a94b-9068785494eb', '.com.bd', 2500, 2500, 2500, 'BDT', true, true, 5, 6, '2026-02-06 18:55:19.037003+00', '2026-02-06 18:55:19.037003+00'),
('22633c27-a272-466e-9cb5-88e535a293c6', '.net.bd', 2500, 2500, 2500, 'BDT', true, false, 5, 7, '2026-02-06 18:55:19.037003+00', '2026-02-06 18:55:19.037003+00'),
('a31824e1-5f22-49ef-94d0-a392f56068f6', '.org.bd', 2500, 2500, 2500, 'BDT', true, false, 5, 8, '2026-02-06 18:55:19.037003+00', '2026-02-06 18:55:19.037003+00'),
('d965b1a7-c67c-478b-904e-e250fcda396b', '.edu.bd', 1500, 1500, 1500, 'BDT', true, false, 5, 9, '2026-02-06 18:55:19.037003+00', '2026-02-06 18:55:19.037003+00'),
('ae460d13-3e71-49e8-879c-3f36f2b82755', '.xyz', 342, 1951, 1836, 'BDT', true, false, 15, 10, '2026-02-06 18:55:19.037003+00', '2026-02-08 13:43:55.317861+00'),
('93a6336a-5316-4c27-b952-6ea13e5cf5b2', '.online', 3719, 3719, 3719, 'BDT', true, false, 15, 11, '2026-02-06 18:55:19.037003+00', '2026-02-08 13:43:55.317861+00'),
('c91af8ac-4cc6-40b8-82f3-d2475b996e1f', '.store', 7438, 7438, 7438, 'BDT', true, false, 15, 12, '2026-02-06 18:55:19.037003+00', '2026-02-08 13:43:55.317861+00'),
('90d99109-65f8-497b-a4a4-9792ac6c7e02', '.tech', 6694, 6694, 6694, 'BDT', true, false, 15, 13, '2026-02-06 18:55:19.037003+00', '2026-02-08 13:43:55.317861+00'),
('2294ffe9-bd47-44f1-a643-cd192822b9e4', '.io', 7481, 7481, 7481, 'BDT', true, true, 10, 14, '2026-02-06 18:55:19.037003+00', '2026-02-08 13:43:55.317861+00'),
('7211af91-d564-4cf4-b213-b7e181d5ab44', '.co', 5124, 5124, 4270, 'BDT', true, false, 10, 15, '2026-02-06 18:55:19.037003+00', '2026-02-08 13:43:55.317861+00'),
('c43a5bf1-e2d2-4ed2-9997-1b41cacf1a66', '.name', 1338, 1338, 1338, 'BDT', true, false, 5, 16, '2026-02-07 11:52:29.564459+00', '2026-02-08 13:43:55.317861+00'),
('e972b20e-eba1-4868-b9a6-dc2b0c914f14', '.asia', 2200, 2700, 2200, 'BDT', true, false, 5, 17, '2026-02-07 11:52:29.564459+00', '2026-02-07 11:52:29.564459+00'),
('6b0c4183-ecf7-4b8c-b925-611dc3acfccc', '.mobi', 5951, 5951, 4463, 'BDT', true, false, 5, 18, '2026-02-07 11:52:29.564459+00', '2026-02-08 13:43:55.317861+00'),
('2097c7d7-02aa-4b9f-920f-3eee1ee0b452', '.news', 4028, 5179, 4028, 'BDT', true, false, 5, 19, '2026-02-07 11:52:29.564459+00', '2026-02-08 13:43:55.317861+00'),
('09707179-8a73-4f2a-8712-69e8dc618ba6', '.live', 5058, 5058, 5058, 'BDT', true, false, 5, 20, '2026-02-07 11:52:29.564459+00', '2026-02-08 13:43:55.317861+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 8. ORDERS (disable auto invoice trigger)
-- =============================================
INSERT INTO orders (id, order_number, user_id, service_id, service_type, package_id, billing_type, subtotal, discount, tax, total, advance_payment, currency, status, paid_at, completed_at, merged_invoice_id, coupon_code, notes, admin_notes, created_at, updated_at) VALUES
('e52cfab1-a92e-43db-9594-7c78aa9fa8b6', '2602391303', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'hosting', '80ead7e2-e275-4c23-a288-888d5307c641', 'recurring', 3500.00, 907.00, 0.00, 2593.00, 346, 'BDT', 'completed', NULL, '2026-02-27 22:02:49.288+00', NULL, NULL, NULL, '', '2026-02-27 22:02:17.195266+00', '2026-02-27 22:02:49.464499+00'),
('ac17b388-edf0-4e88-a054-acf3bfc3380c', '2602427831', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 'e6997007-f8be-4378-bc64-31c2df3de565', 'web_development', 'a63f3cb7-d2c8-4084-b9c5-26097ae9bc78', 'one_time', 15000.00, 3889.00, 0.00, 11111.00, 1481, 'BDT', 'completed', NULL, '2026-02-27 22:02:57.2+00', NULL, NULL, NULL, '', '2026-02-27 22:02:19.335845+00', '2026-02-27 22:02:57.363708+00'),
('bef4eab6-4761-46a1-8150-34262c983d6a', '2602692097', '7287f2f7-e535-40c6-8bf1-5c70a113c386', '50acf2b0-cb1b-4dec-8f78-987edd3ff46a', 'domain', NULL, 'recurring', 1750.00, 454.00, 0.00, 1296.00, 173, 'BDT', 'completed', NULL, '2026-02-27 22:04:58.832+00', NULL, NULL, NULL, '', '2026-02-27 22:02:14.605427+00', '2026-02-27 22:04:59.278215+00'),
('3b4f9c06-8a29-492f-aa4d-448bf6805274', '2602649852', '0a574a15-d015-4fa2-a5fa-740222ed1de1', '50acf2b0-cb1b-4dec-8f78-987edd3ff46a', 'domain', NULL, 'recurring', 1750.00, 0.00, 0.00, 1750.00, 0, 'BDT', 'completed', '2026-02-27 21:46:31.215+00', '2026-02-27 22:05:21.008+00', NULL, NULL, NULL, '', '2026-02-27 21:46:20.959325+00', '2026-02-27 22:05:21.182914+00'),
('32bbb4d2-ded1-46df-86b1-32f1c24c29c4', '2602477838', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'hosting', '80ead7e2-e275-4c23-a288-888d5307c641', 'recurring', 3500.00, 0.00, 0.00, 3500.00, 0, 'BDT', 'completed', '2026-02-27 21:40:29.735+00', '2026-02-27 22:05:29.288+00', NULL, NULL, NULL, '', '2026-02-27 21:39:24.570053+00', '2026-02-27 22:05:29.454809+00'),
('7abbe1cb-78ed-4546-b808-494a31130d44', '2602248809', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'hosting', 'c61a52ad-730f-41c8-9414-92304ae10377', 'recurring', 5900.00, 0.00, 0.00, 5900.00, 0, 'BDT', 'completed', '2026-02-27 21:40:41.07+00', '2026-02-27 22:05:43.512+00', NULL, NULL, NULL, '', '2026-02-27 21:39:22.414464+00', '2026-02-27 22:05:43.678553+00'),
('6da4d3e7-29e5-40fb-8f95-4743bb96ddd9', '2602859949', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'hosting', 'c61a52ad-730f-41c8-9414-92304ae10377', 'recurring', 5900.00, 1750.00, 0.00, 4150.00, 692, 'BDT', 'completed', NULL, '2026-02-28 07:01:46.461+00', '1847c4e5-d990-4037-97cd-0b6081d98fec', NULL, NULL, NULL, '2026-02-28 04:33:21.192743+00', '2026-02-28 07:01:46.477719+00'),
('7ee3a39e-49c6-4928-b89f-1f23fa8a303e', '2602195863', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 'e6997007-f8be-4378-bc64-31c2df3de565', 'web_development', 'a4363364-9b7f-4d49-b7a0-e401387084fe', 'one_time', 35000.00, 10381.00, 0.00, 24619.00, 4103, 'BDT', 'completed', NULL, '2026-02-28 07:01:46.461+00', '1847c4e5-d990-4037-97cd-0b6081d98fec', NULL, NULL, NULL, '2026-02-28 04:33:23.582931+00', '2026-02-28 07:01:46.768074+00'),
('e3f9e7d9-f65b-49a6-9146-97402a0434c9', '2602081517', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', '50acf2b0-cb1b-4dec-8f78-987edd3ff46a', 'domain', NULL, 'recurring', 1750.00, 519.00, 0.00, 1231.00, 205, 'BDT', 'completed', NULL, '2026-02-28 07:01:46.461+00', '1847c4e5-d990-4037-97cd-0b6081d98fec', NULL, NULL, NULL, '2026-02-28 04:33:17.521417+00', '2026-02-28 07:01:47.116222+00'),
('a3111a11-a2a9-4fba-af48-1e722e6777be', '2602517261', 'dca994c9-2cb7-4f5a-b341-2664d90c50d2', 'e6997007-f8be-4378-bc64-31c2df3de565', 'web_development', 'a4363364-9b7f-4d49-b7a0-e401387084fe', 'one_time', 35000.00, 6278.00, 0.00, 28722.00, 12309, 'BDT', 'merged', NULL, '2026-02-27 22:16:07.985+00', '45898306-03ce-4af9-b930-d7b3a3631274', NULL, NULL, '', '2026-02-27 22:15:22.726359+00', '2026-03-02 05:39:49.787562+00'),
('f5ae47d8-fab3-4e4e-8744-2abeceda6b1c', '2602852871', 'dca994c9-2cb7-4f5a-b341-2664d90c50d2', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'hosting', 'c61a52ad-730f-41c8-9414-92304ae10377', 'recurring', 5900.00, 1058.00, 0.00, 4842.00, 2075, 'BDT', 'merged', NULL, '2026-02-27 22:16:13.497+00', '45898306-03ce-4af9-b930-d7b3a3631274', NULL, NULL, '', '2026-02-27 22:15:20.836562+00', '2026-03-02 05:39:50.098156+00'),
('2a3e6976-509d-46a7-800e-fbf87f972b6c', '2602719213', 'dca994c9-2cb7-4f5a-b341-2664d90c50d2', '50acf2b0-cb1b-4dec-8f78-987edd3ff46a', 'domain', NULL, 'recurring', 1750.00, 314.00, 0.00, 1436.00, 615, 'BDT', 'merged', NULL, '2026-02-27 22:16:19.777+00', '45898306-03ce-4af9-b930-d7b3a3631274', NULL, NULL, '', '2026-02-27 22:15:18.721356+00', '2026-03-02 05:39:50.411325+00'),
('329d6a7a-1b9c-484f-9fdd-5140937f89e6', '2603000001', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', '50acf2b0-cb1b-4dec-8f78-987edd3ff46a', 'domain', NULL, 'one_time', 20250.00, 10250.00, 0.00, 10000.00, 0, 'BDT', 'completed', NULL, '2026-03-02 06:18:51.927+00', NULL, NULL, NULL, '', '2026-03-02 06:18:24.890413+00', '2026-03-02 06:18:51.032673+00'),
('8ad01a8a-dc70-4c17-8b2b-1c397204bbb3', '2603000002', 'f9ef0dcf-c041-4906-80f7-009504cb6968', '50acf2b0-cb1b-4dec-8f78-987edd3ff46a', 'domain', NULL, 'one_time', 20250.00, 10250.00, 0.00, 10000.00, 1500, 'BDT', 'completed', NULL, '2026-03-04 05:22:38.236+00', NULL, NULL, NULL, '', '2026-03-04 05:22:02.221649+00', '2026-03-04 05:22:37.256006+00'),
('29d41368-f8ee-41e3-845a-52249eb4743c', '2603000003', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', '50acf2b0-cb1b-4dec-8f78-987edd3ff46a', 'domain', NULL, 'one_time', 42650.00, 12650.00, 0.00, 30000.00, 10000, 'BDT', 'completed', NULL, '2026-03-04 06:37:10.098+00', NULL, NULL, NULL, '', '2026-03-04 06:34:55.266011+00', '2026-03-04 06:37:09.157974+00'),
('be8132ed-29dd-406d-9b40-6c5f3b24d7e8', '2603000004', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', '2408cab5-eec8-4627-a584-78cc3c28506b', 'software_development', NULL, 'one_time', 30000.00, 0.00, 0.00, 30000.00, 0, 'BDT', 'completed', NULL, '2026-03-04 06:46:58.161+00', NULL, NULL, NULL, '', '2026-03-04 06:46:47.930343+00', '2026-03-04 06:46:57.183821+00'),
('f1f6e14c-0161-42e3-9b00-e0a895e2b511', '2603000005', '4f314a32-8483-44a0-afb1-0f57fa3564dd', '50acf2b0-cb1b-4dec-8f78-987edd3ff46a', 'domain', NULL, 'one_time', 20150.00, 10150.00, 0.00, 10000.00, 0, 'BDT', 'completed', NULL, '2026-03-04 07:32:14.661+00', NULL, NULL, NULL, '', '2026-03-04 07:32:03.444207+00', '2026-03-04 07:32:13.698681+00'),
('5e78773c-2d94-4087-b573-f412c168f714', '2603000006', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'hosting', 'c61a52ad-730f-41c8-9414-92304ae10377', 'one_time', 40900.00, 10900.00, 0.00, 30000.00, 0, 'BDT', 'completed', NULL, '2026-03-04 08:52:53.915+00', NULL, NULL, NULL, '', '2026-03-04 08:52:38.526327+00', '2026-03-04 08:52:53.009714+00'),
('164f6916-f66e-442b-a9cf-300a92243310', '2603000007', 'edf1f376-558d-43cb-9144-1815eabfa468', '50acf2b0-cb1b-4dec-8f78-987edd3ff46a', 'domain', NULL, 'one_time', 37749.00, 5250.00, 0.00, 32499.00, 2000, 'BDT', 'processing', NULL, NULL, NULL, NULL, NULL, '', '2026-03-04 11:57:57.46929+00', '2026-03-05 23:11:10.973489+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 9. INVOICES
-- =============================================
INSERT INTO invoices (id, invoice_number, order_id, user_id, subtotal, discount, tax, total, advance_paid, due_amount, status, due_date, paid_at, pdf_url, notes, currency, created_at, updated_at) VALUES
('fe6c21df-5893-4eca-b7b0-53525e52efea', 'INV-2602000001', '7abbe1cb-78ed-4546-b808-494a31130d44', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 5900.00, 0.00, 0.00, 5900.00, 0, 0, 'paid', '2026-03-06', '2026-02-27 21:39:54.862+00', NULL, '', 'BDT', '2026-02-27 21:39:22.414464+00', '2026-02-28 07:04:16.534591+00'),
('4ac11dfa-b6f0-4478-886d-dae089aa92c4', 'INV-2602000002', '32bbb4d2-ded1-46df-86b1-32f1c24c29c4', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 3500.00, 0.00, 0.00, 3500.00, 0, 0, 'paid', '2026-03-06', '2026-02-27 21:39:48.415+00', NULL, '', 'BDT', '2026-02-27 21:39:24.570053+00', '2026-02-28 07:04:16.534591+00'),
('b069e1c8-27b0-49a2-bada-a81caa1543ee', 'INV-2602000003', '3b4f9c06-8a29-492f-aa4d-448bf6805274', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 1750.00, 0.00, 0.00, 1750.00, 0, 0, 'paid', '2026-03-06', '2026-02-27 21:46:43.407+00', NULL, '', 'BDT', '2026-02-27 21:46:20.959325+00', '2026-02-28 07:04:16.534591+00'),
('00560484-6b8e-4230-ae70-7343102b2d76', 'INV-2602000006', 'bef4eab6-4761-46a1-8150-34262c983d6a', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 1750.00, 454.00, 0.00, 1296.00, 0, 1296, 'unpaid', '2026-03-06', NULL, NULL, '', 'BDT', '2026-02-27 22:02:14.605427+00', '2026-02-27 22:06:58.17137+00'),
('68a122a4-8aea-4bc3-960b-128b74ec24c5', 'INV-2602000007', 'e52cfab1-a92e-43db-9594-7c78aa9fa8b6', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 3500.00, 907.00, 0.00, 2593.00, 0, 2593, 'unpaid', '2026-03-06', NULL, NULL, '', 'BDT', '2026-02-27 22:02:17.195266+00', '2026-02-27 22:06:48.872692+00'),
('297e98ab-29d1-4d9d-8b04-1d71285240d3', 'INV-2602000008', 'ac17b388-edf0-4e88-a054-acf3bfc3380c', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 15000.00, 3889.00, 0.00, 11111.00, 2000, 9111, 'partial', '2026-03-06', NULL, NULL, '', 'BDT', '2026-02-27 22:02:19.335845+00', '2026-02-27 22:06:37.7753+00'),
('1847c4e5-d990-4037-97cd-0b6081d98fec', 'INV-2602000015', NULL, 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 42650.00, 12650.00, 0.00, 30000.00, 0, 0, 'paid', '2026-03-07', '2026-02-28 06:58:22.588+00', 'https://qszmmysnwjvywpsofbgs.supabase.co/storage/v1/object/public/invoices/INV-2602000015.pdf', 'Merged from orders: 2602081517, 2602859949, 2602195863', 'BDT', '2026-02-28 04:59:49.606995+00', '2026-02-28 07:42:09.727931+00'),
('45898306-03ce-4af9-b930-d7b3a3631274', 'INV-2603000001', NULL, 'dca994c9-2cb7-4f5a-b341-2664d90c50d2', 42650.00, 12650.00, 0.00, 30000.00, 15000, 15000, 'unpaid', '2026-03-09', NULL, 'https://qszmmysnwjvywpsofbgs.supabase.co/storage/v1/object/public/invoices/INV-2603000001.pdf', 'Merged from orders: 2602517261, 2602852871, 2602719213', 'BDT', '2026-03-02 05:39:49.149353+00', '2026-03-04 06:27:09.13063+00'),
('22c6a897-daf8-409f-ada0-7b6b165ce58c', 'INV-2603000002', '329d6a7a-1b9c-484f-9fdd-5140937f89e6', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 20250.00, 10250.00, 0.00, 10000.00, 0, 0, 'paid', '2026-03-09', '2026-03-02 06:19:15.311+00', 'https://qszmmysnwjvywpsofbgs.supabase.co/storage/v1/object/public/invoices/INV-2603000002.pdf', '', 'BDT', '2026-03-02 06:18:24.890413+00', '2026-03-02 06:19:38.75497+00'),
('7cb3cccc-ed95-4867-a80c-a32ce54b41d3', 'INV-2603000003', '8ad01a8a-dc70-4c17-8b2b-1c397204bbb3', 'f9ef0dcf-c041-4906-80f7-009504cb6968', 20250.00, 10250.00, 0.00, 10000.00, 1500, 8500.00, 'partial', '2026-03-11', NULL, 'https://qszmmysnwjvywpsofbgs.supabase.co/storage/v1/object/public/invoices/INV-2603000003.pdf', NULL, 'BDT', '2026-03-04 05:22:02.221649+00', '2026-03-04 05:23:26.966055+00'),
('06c554d4-d6a1-40b4-b488-deb685ea1ce1', 'INV-2603000004', '29d41368-f8ee-41e3-845a-52249eb4743c', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 42650.00, 12650.00, 0.00, 30000.00, 10000, 20000.00, 'partial', '2026-03-11', NULL, 'https://qszmmysnwjvywpsofbgs.supabase.co/storage/v1/object/public/invoices/INV-2603000004.pdf', NULL, 'BDT', '2026-03-04 06:34:55.266011+00', '2026-03-04 06:37:34.853309+00'),
('1c5f8f5b-0f9d-4f3b-b68d-1a3c30af83ac', 'INV-2603000005', 'be8132ed-29dd-406d-9b40-6c5f3b24d7e8', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 20000.00, 0.00, 0.00, 20000.00, 0, 20000, 'unpaid', '2026-03-11', NULL, NULL, E'Add 4 modules\n1. Moallem\n2. Supplier Agent\n3. Familly Pack Add\n4. Account leager ( Autometic)', 'BDT', '2026-03-04 06:46:47.930343+00', '2026-03-04 06:49:05.187956+00'),
('c86ed994-67eb-49bb-8fb6-e9de9a2e4b1d', 'INV-2603000006', 'f1f6e14c-0161-42e3-9b00-e0a895e2b511', '4f314a32-8483-44a0-afb1-0f57fa3564dd', 20150.00, 10150.00, 0.00, 10000.00, 0, 10000.00, 'unpaid', '2026-03-11', NULL, NULL, NULL, 'BDT', '2026-03-04 07:32:03.444207+00', '2026-03-04 07:32:03.444207+00'),
('ed3889a2-3f3e-41d8-a05b-5a9d57ffb864', 'INV-2603000007', '5e78773c-2d94-4087-b573-f412c168f714', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 40900.00, 10900.00, 0.00, 30000.00, 0, 30000.00, 'unpaid', '2026-03-11', NULL, 'https://qszmmysnwjvywpsofbgs.supabase.co/storage/v1/object/public/invoices/INV-2603000007.pdf', NULL, 'BDT', '2026-03-04 08:52:38.526327+00', '2026-03-04 08:53:26.426599+00'),
('0abae2ae-a541-469e-96d2-1c82b01c06e5', 'INV-2603000008', '164f6916-f66e-442b-a9cf-300a92243310', 'edf1f376-558d-43cb-9144-1815eabfa468', 37749.00, 5250.00, 0.00, 32499.00, 2000, 30499, 'partial', '2026-03-11', NULL, NULL, NULL, 'BDT', '2026-03-04 11:57:57.46929+00', '2026-03-05 23:11:11.505502+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 10. HOMEPAGE SECTIONS
-- =============================================
INSERT INTO homepage_sections (id, section_key, title_en, title_bn, subtitle_en, subtitle_bn, is_active, sort_order, metadata, created_at, updated_at) VALUES
('da9ef8b4-f835-4ac5-a87f-c38db8e001af', 'hero', 'Build Your Digital Presence', 'আপনার ডিজিটাল উপস্থিতি তৈরি করুন', 'Professional web solutions for your business', 'আপনার ব্যবসার জন্য পেশাদার ওয়েব সমাধান', true, 1, '{}', '2026-02-08 05:04:07.679538+00', '2026-02-08 05:04:07.679538+00'),
('42803f6d-e55b-444b-a7a7-939bb191cf60', 'services', 'Our Services', 'আমাদের সেবাসমূহ', 'Comprehensive digital solutions', 'সম্পূর্ণ ডিজিটাল সমাধান', true, 2, '{}', '2026-02-08 05:04:07.679538+00', '2026-02-08 05:04:07.679538+00'),
('36dc6c9e-2ff1-4198-9860-211645108c83', 'features', 'Why Choose Us', 'কেন আমাদের বেছে নিবেন', 'What makes us different', 'আমাদের বিশেষত্ব', true, 3, '{}', '2026-02-08 05:04:07.679538+00', '2026-02-08 05:04:07.679538+00'),
('a3744274-7231-4c9a-9a22-b5dec2912164', 'portfolio', 'Our Work', 'আমাদের কাজ', 'Projects we are proud of', 'আমাদের গর্বের প্রজেক্ট', true, 4, '{}', '2026-02-08 05:04:07.679538+00', '2026-02-08 05:04:07.679538+00'),
('a5fa880d-ffa5-42b4-b2d5-b2b7e42a9ddd', 'testimonials', 'Client Testimonials', 'ক্লায়েন্ট প্রশংসাপত্র', 'What our clients say', 'আমাদের ক্লায়েন্টদের মতামত', true, 5, '{}', '2026-02-08 05:04:07.679538+00', '2026-02-08 05:04:07.679538+00'),
('aee1cc7c-d965-4cc7-9919-b17741eeaa32', 'pricing', 'Pricing', 'মূল্য', 'Transparent pricing for all services', 'সব সেবার স্বচ্ছ মূল্য', true, 6, '{}', '2026-02-08 05:04:07.679538+00', '2026-02-08 05:04:07.679538+00'),
('44e1b224-ccc8-4d13-9742-6213016d1fb9', 'cta', 'Get Started Today', 'আজই শুরু করুন', 'Transform your business with us', 'আমাদের সাথে আপনার ব্যবসা রূপান্তর করুন', true, 7, '{}', '2026-02-08 05:04:07.679538+00', '2026-02-08 05:04:07.679538+00'),
('a05b3f74-b219-45e4-b2e3-a5e08b9e398c', 'faq', 'Frequently Asked Questions', 'সচরাচর জিজ্ঞাসিত প্রশ্ন', 'Find answers to common questions', 'সাধারণ প্রশ্নের উত্তর পান', true, 8, '{}', '2026-02-08 05:04:07.679538+00', '2026-02-08 05:04:07.679538+00'),
('7019a2e9-29ec-49bc-9bf3-72ff0a9308d8', 'offer_banner', 'Special Offer', 'বিশেষ অফার', 'Limited time discount', 'সীমিত সময়ের জন্য ছাড়', true, 9, '{}', '2026-02-08 05:04:07.679538+00', '2026-02-08 05:04:07.679538+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 11. CONTACT MESSAGES
-- =============================================
INSERT INTO contact_messages (id, name, email, phone, subject, message, status, created_at, updated_at) VALUES
('75dc2814-69e3-4ed0-bd71-bc72e1e2b535', 'Nathaniel Brooks', 'nathaniel.reid@jmailservice.com', '8054002077', 'Reach Real Buyers Searching for You', E'We''ve developed a unique advertising platform that places your business directly in front of people searching for your service - no waiting, no complex setup.\nCampaigns usually go live in one day, and you can update your keywords anytime at no extra cost.\nWould you like me to show you a few examples from your industry?', 'pending', '2026-02-16 09:53:43.57718+00', '2026-02-16 09:53:43.57718+00'),
('1b13f596-006b-40d8-9bd0-65f0b88e37e7', 'William Grant', 'william.grant@jmailservice.com', '8054002077', 'Quick Way to Get More Customers', 'If I could get your business in front of hundreds of local searchers by tomorrow - would you be open to a short call today?', 'pending', '2026-02-26 04:56:12.463355+00', '2026-02-26 04:56:12.463355+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 12. MANUAL PAYMENTS
-- =============================================
INSERT INTO manual_payments (id, user_id, order_id, invoice_id, amount, method, transaction_id, sender_number, screenshot_url, notes, status, rejection_reason, verified_by, verified_at, created_at, updated_at) VALUES
('a0652f1c-0593-4ed3-925c-59499bddb343', 'b43e1fc1-857a-4aba-b169-766211ac176c', NULL, NULL, 36999, 'bank_transfer', 'PENDING-2602000001', NULL, NULL, E'Domain: rahekabatravels.com, Bundles: Business Hosting, Business Website\nCustomer: Rahe Kaba Travels, Phone: +8801601505050, Email: rahekaba.info@gmail.com', 'rejected', 'will new create', 'b43e1fc1-857a-4aba-b169-766211ac176c', '2026-02-27 20:18:16.646+00', '2026-02-27 08:34:32.484718+00', '2026-02-27 20:18:16.853579+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 13. PROJECTS
-- =============================================
INSERT INTO projects (id, title, description, user_id, order_id, service_type, status, deadline, start_date, completed_at, assigned_to, requirements, total_milestones, completed_milestones, created_at, updated_at) VALUES
('1413cdbe-0313-4946-b7f1-14de270d6fc5', 'বেসিক ওয়েবসাইট - Project', 'Auto-created from Order 2603000007', 'edf1f376-558d-43cb-9144-1815eabfa468', '164f6916-f66e-442b-a9cf-300a92243310', 'web_development', 'pending', '2026-04-03', NULL, NULL, NULL, '{}', 0, 0, '2026-03-04 11:57:58.615884+00', '2026-03-04 11:57:58.615884+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 14. SUBSCRIPTIONS
-- =============================================
INSERT INTO subscriptions (id, user_id, plan_name, service_type, amount, currency, billing_cycle, status, next_billing_date, last_billing_date, auto_renew, grace_period_days, failed_billing_attempts, domain_id, hosting_account_id, metadata, cancelled_at, cancellation_reason, suspended_at, created_at, updated_at) VALUES
('dcfad509-0afb-4731-84f3-88e8f894f400', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 'Custom', 'domain', 1750.00, 'BDT', 'yearly', 'active', '2027-02-23', NULL, true, 7, 0, NULL, NULL, '{"domain":"https://rofroftravels.com/","order_id":"329d6a7a-1b9c-484f-9fdd-5140937f89e6"}', NULL, NULL, NULL, '2026-03-02 06:18:25.716695+00', '2026-03-02 06:18:25.716695+00'),
('f28f1f46-660e-471a-bbb2-382fb33b2a2c', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 'স্টার্টার হোস্টিং', 'hosting', 3500.00, 'BDT', 'yearly', 'active', '2027-02-23', NULL, true, 7, 0, NULL, NULL, '{"domain":"https://rofroftravels.com/","order_id":"329d6a7a-1b9c-484f-9fdd-5140937f89e6"}', NULL, NULL, NULL, '2026-03-02 06:18:26.09513+00', '2026-03-02 06:18:26.09513+00'),
('d51545e7-7da0-411f-bc9c-22110f9e2266', 'f9ef0dcf-c041-4906-80f7-009504cb6968', 'Custom', 'domain', 1750.00, 'BDT', 'yearly', 'active', '2027-03-04', NULL, true, 7, 0, NULL, NULL, '{"domain":"saztravelvisa.com","order_id":"8ad01a8a-dc70-4c17-8b2b-1c397204bbb3"}', NULL, NULL, NULL, '2026-03-04 05:22:03.163866+00', '2026-03-04 05:22:03.163866+00'),
('1f68e0dd-043f-4b25-ba15-003f3aebfcef', 'f9ef0dcf-c041-4906-80f7-009504cb6968', 'স্টার্টার হোস্টিং', 'hosting', 3500.00, 'BDT', 'yearly', 'active', '2027-03-04', NULL, true, 7, 0, NULL, NULL, '{"domain":"saztravelvisa.com","order_id":"8ad01a8a-dc70-4c17-8b2b-1c397204bbb3"}', NULL, NULL, NULL, '2026-03-04 05:22:03.523905+00', '2026-03-04 05:22:03.523905+00'),
('da1534e1-0ef3-4ea7-b6f3-b529d7c2e507', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 'Custom', 'domain', 1750.00, 'BDT', 'yearly', 'active', '2027-03-03', NULL, true, 7, 0, NULL, NULL, '{"domain":"masudtravelsagency.com","order_id":"29d41368-f8ee-41e3-845a-52249eb4743c"}', NULL, NULL, NULL, '2026-03-04 06:34:56.198035+00', '2026-03-04 06:34:56.198035+00'),
('582bcd81-29c2-42ec-863a-9e9b7742ce20', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 'বিজনেস হোস্টিং', 'hosting', 5900.00, 'BDT', 'yearly', 'active', '2027-03-04', NULL, true, 7, 0, NULL, NULL, '{"domain":"masudtravelsagency.com","order_id":"29d41368-f8ee-41e3-845a-52249eb4743c"}', NULL, NULL, NULL, '2026-03-04 06:34:56.639038+00', '2026-03-04 06:34:56.639038+00'),
('30119df8-9ca9-4471-aee5-49df93201f9b', '4f314a32-8483-44a0-afb1-0f57fa3564dd', 'Custom', 'domain', 1650.00, 'BDT', 'yearly', 'active', '2027-03-04', NULL, true, 7, 0, NULL, NULL, '{"domain":"ngtravels.com","order_id":"f1f6e14c-0161-42e3-9b00-e0a895e2b511"}', NULL, NULL, NULL, '2026-03-04 07:32:04.27607+00', '2026-03-04 07:32:04.27607+00'),
('90f85c0e-c80d-4e2f-b47b-a1c9a4cbaf8e', '4f314a32-8483-44a0-afb1-0f57fa3564dd', 'স্টার্টার হোস্টিং', 'hosting', 3500.00, 'BDT', 'yearly', 'active', '2027-03-04', NULL, true, 7, 0, NULL, NULL, '{"domain":"ngtravels.com","order_id":"f1f6e14c-0161-42e3-9b00-e0a895e2b511"}', NULL, NULL, NULL, '2026-03-04 07:32:04.596466+00', '2026-03-04 07:32:04.596466+00'),
('1cd0a766-d9ea-4984-bcfd-ad5fa847e0b4', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'বিজনেস হোস্টিং', 'hosting', 5900.00, 'BDT', 'yearly', 'active', '2027-02-06', NULL, true, 7, 0, NULL, NULL, '{"domain":"smtradeint.com","order_id":"5e78773c-2d94-4087-b573-f412c168f714"}', NULL, NULL, NULL, '2026-03-04 08:52:39.728044+00', '2026-03-04 08:52:39.728044+00'),
('3b703c8f-9c1a-49da-9e2f-495d06f6ef03', 'edf1f376-558d-43cb-9144-1815eabfa468', 'Custom', 'domain', 1750.00, 'BDT', 'yearly', 'active', '2027-03-04', NULL, true, 7, 0, NULL, NULL, '{"domain":"luckytoursandtravels.com","order_id":"164f6916-f66e-442b-a9cf-300a92243310"}', NULL, NULL, NULL, '2026-03-04 11:57:58.065989+00', '2026-03-04 11:57:58.065989+00'),
('2d8ffe2a-a9a4-45b2-a56e-ec25b96ec4fc', 'edf1f376-558d-43cb-9144-1815eabfa468', 'স্টার্টার হোস্টিং', 'hosting', 3500.00, 'BDT', 'yearly', 'active', '2027-03-04', NULL, true, 7, 0, NULL, NULL, '{"domain":"luckytoursandtravels.com","order_id":"164f6916-f66e-442b-a9cf-300a92243310"}', NULL, NULL, NULL, '2026-03-04 11:57:58.333735+00', '2026-03-04 11:57:58.333735+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 15. ORDER ITEMS
-- =============================================
INSERT INTO order_items (id, order_id, service_type, package_name, description, domain, price, qty, total, billing_type, renewal_date, created_at) VALUES
('d5622853-39bd-4592-820f-f2cdcaef114d', '329d6a7a-1b9c-484f-9fdd-5140937f89e6', 'domain', 'Custom', 'ডোমেইন রেজিস্ট্রেশন', 'https://rofroftravels.com/', 1750, 1, 1750, 'recurring', '2027-02-23', '2026-03-02 06:18:26.816422+00'),
('e1d91ba6-cc33-4788-bd4d-eb681f7d901b', '329d6a7a-1b9c-484f-9fdd-5140937f89e6', 'hosting', 'স্টার্টার হোস্টিং', 'ওয়েব হোস্টিং', 'https://rofroftravels.com/', 3500, 1, 3500, 'recurring', '2027-02-23', '2026-03-02 06:18:26.816422+00'),
('04429d42-3e57-4665-bfe8-df33fa494bc7', '329d6a7a-1b9c-484f-9fdd-5140937f89e6', 'web_development', 'বেসিক ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 15000, 1, 15000, 'one_time', NULL, '2026-03-02 06:18:26.816422+00'),
('d6a0fa8e-7067-41a1-bbb5-199dca844e8f', '8ad01a8a-dc70-4c17-8b2b-1c397204bbb3', 'domain', 'Custom', 'ডোমেইন রেজিস্ট্রেশন', 'saztravelvisa.com', 1750, 1, 1750, 'recurring', '2027-03-04', '2026-03-04 05:22:04.394738+00'),
('23a8cd8f-9687-4e34-b954-0e398dc9849f', '8ad01a8a-dc70-4c17-8b2b-1c397204bbb3', 'hosting', 'স্টার্টার হোস্টিং', 'ওয়েব হোস্টিং', 'saztravelvisa.com', 3500, 1, 3500, 'recurring', '2027-03-04', '2026-03-04 05:22:04.394738+00'),
('7eb5c223-d805-4e02-afa3-11ca2cf66d4c', '8ad01a8a-dc70-4c17-8b2b-1c397204bbb3', 'web_development', 'বেসিক ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 15000, 1, 15000, 'one_time', NULL, '2026-03-04 05:22:04.394738+00'),
('6f30930e-4585-4e44-aede-414a61b3620f', '29d41368-f8ee-41e3-845a-52249eb4743c', 'domain', 'Custom', 'ডোমেইন রেজিস্ট্রেশন', 'masudtravelsagency.com', 1750, 1, 1750, 'recurring', '2027-03-03', '2026-03-04 06:34:57.448706+00'),
('03a50b31-41e8-4212-82b0-11e555c359af', '29d41368-f8ee-41e3-845a-52249eb4743c', 'hosting', 'বিজনেস হোস্টিং', 'ওয়েব হোস্টিং', 'masudtravelsagency.com', 5900, 1, 5900, 'recurring', '2027-03-04', '2026-03-04 06:34:57.448706+00'),
('6522f29f-8e34-4f97-85be-289449fcd785', '29d41368-f8ee-41e3-845a-52249eb4743c', 'web_development', 'প্রফেশনাল ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 35000, 1, 35000, 'one_time', NULL, '2026-03-04 06:34:57.448706+00'),
('076fe5a6-86f6-4360-9510-e3e3d3ad8ac2', 'be8132ed-29dd-406d-9b40-6c5f3b24d7e8', 'software_development', 'Custom', 'সফটওয়্যার ডেভেলপমেন্ট', NULL, 30000, 1, 30000, 'one_time', NULL, '2026-03-04 06:46:48.874419+00'),
('6ed88d10-6d60-444a-8a5c-0084fe25f822', 'f1f6e14c-0161-42e3-9b00-e0a895e2b511', 'domain', 'Custom', 'ডোমেইন রেজিস্ট্রেশন', 'ngtravels.com', 1650, 1, 1650, 'recurring', '2027-03-04', '2026-03-04 07:32:05.233605+00'),
('bb47eb02-0708-4255-ade4-c04344cede51', 'f1f6e14c-0161-42e3-9b00-e0a895e2b511', 'hosting', 'স্টার্টার হোস্টিং', 'ওয়েব হোস্টিং', 'ngtravels.com', 3500, 1, 3500, 'recurring', '2027-03-04', '2026-03-04 07:32:05.233605+00'),
('955c5d16-3ee6-46d0-a42d-0fa0015567d2', 'f1f6e14c-0161-42e3-9b00-e0a895e2b511', 'web_development', 'বেসিক ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 15000, 1, 15000, 'one_time', NULL, '2026-03-04 07:32:05.233605+00'),
('944d5f1f-7a61-4307-9766-e2531a58cb9f', '5e78773c-2d94-4087-b573-f412c168f714', 'hosting', 'বিজনেস হোস্টিং', 'ওয়েব হোস্টিং', 'smtradeint.com', 5900, 1, 5900, 'recurring', '2027-02-06', '2026-03-04 08:52:40.690717+00'),
('caaab099-f017-459e-b12b-884bea3e18fa', '5e78773c-2d94-4087-b573-f412c168f714', 'web_development', 'প্রফেশনাল ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 35000, 1, 35000, 'one_time', NULL, '2026-03-04 08:52:40.690717+00'),
('4f9d5ddf-1ce6-4e14-ab0a-dcb5c44d4b3a', '164f6916-f66e-442b-a9cf-300a92243310', 'domain', 'Custom', 'ডোমেইন রেজিস্ট্রেশন', 'luckytoursandtravels.com', 1750, 1, 1750, 'recurring', '2027-03-04', '2026-03-04 11:57:59.163791+00'),
('c1b82c85-a802-4307-ae13-cabf6ab3d29f', '164f6916-f66e-442b-a9cf-300a92243310', 'hosting', 'স্টার্টার হোস্টিং', 'ওয়েব হোস্টিং', 'luckytoursandtravels.com', 5999, 1, 5999, 'recurring', '2027-03-04', '2026-03-04 11:57:59.163791+00'),
('9fda461d-f991-4da4-91f4-add5e00293d8', '164f6916-f66e-442b-a9cf-300a92243310', 'web_development', 'বেসিক ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 30000, 1, 30000, 'one_time', NULL, '2026-03-04 11:57:59.163791+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 16. INVOICE ITEMS
-- =============================================
INSERT INTO invoice_items (id, invoice_id, service_type, package_name, description, domain, price, qty, total, renewal_date, created_at) VALUES
('f177117d-9267-4145-b849-468279cd5603', 'fe6c21df-5893-4eca-b7b0-53525e52efea', 'hosting', 'বিজনেস হোস্টিং', 'ওয়েব হোস্টিং', 'smelitehajj.com', 5900, 1, 5900, '2027-01-26', '2026-02-27 21:39:23.580798+00'),
('c5c744a2-bb82-4c5d-999d-9054da704412', '4ac11dfa-b6f0-4478-886d-dae089aa92c4', 'hosting', 'স্টার্টার হোস্টিং', 'ওয়েব হোস্টিং', 'soft.smelitehajj.com', 3500, 1, 3500, '2027-01-26', '2026-02-27 21:39:25.655037+00'),
('7f1ab7c3-eedb-4d0d-9a7a-dfe8517b5cc9', 'b069e1c8-27b0-49a2-bada-a81caa1543ee', 'domain', 'Custom', 'ডোমেইন রেজিস্ট্রেশন', 'smelitehajj.com', 1750, 1, 1750, '2026-08-19', '2026-02-27 21:46:22.352357+00'),
('0d378ee4-8703-4c10-9427-94fe1660e5c4', '00560484-6b8e-4230-ae70-7343102b2d76', 'domain', 'Custom', 'ডোমেইন রেজিস্ট্রেশন', 'zenithoverseasbd.com', 1750, 1, 1750, '2027-02-21', '2026-02-27 22:02:16.118952+00'),
('48cc5e69-f419-4550-a425-21214d28c36a', '68a122a4-8aea-4bc3-960b-128b74ec24c5', 'hosting', 'স্টার্টার হোস্টিং', 'ওয়েব হোস্টিং', 'zenithoverseasbd.com', 3500, 1, 3500, '2026-02-21', '2026-02-27 22:02:18.413656+00'),
('77d417ef-0761-4530-af83-85967e90920f', '297e98ab-29d1-4d9d-8b04-1d71285240d3', 'web_development', 'বেসিক ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 15000, 1, 15000, NULL, '2026-02-27 22:02:20.243628+00'),
('8a472e0c-7356-4c3a-8067-ec78267d44ea', '1847c4e5-d990-4037-97cd-0b6081d98fec', 'domain', 'Custom', 'ডোমেইন রেজিস্ট্রেশন', 'rahekabatravels.com', 1750, 1, 1750, '2027-02-27', '2026-02-28 04:59:49.944858+00'),
('e0e66e53-c605-4aa1-9c93-17a7a911cfea', '1847c4e5-d990-4037-97cd-0b6081d98fec', 'hosting', 'বিজনেস হোস্টিং', 'ওয়েব হোস্টিং', 'rahekabatravels.com', 5900, 1, 5900, '2027-02-27', '2026-02-28 04:59:49.944858+00'),
('0319456c-9db8-4db2-bd9c-ba89fb4f7f53', '1847c4e5-d990-4037-97cd-0b6081d98fec', 'web_development', 'প্রফেশনাল ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 35000, 1, 35000, NULL, '2026-02-28 04:59:49.944858+00'),
('dd5001d3-39f3-4644-91a7-9f8dc7666263', '45898306-03ce-4af9-b930-d7b3a3631274', 'domain', 'Custom', 'ডোমেইন রেজিস্ট্রেশন', 'darulfurkantravels.com', 1750, 1, 1750, '2027-01-31', '2026-03-02 05:39:49.471089+00'),
('387280db-e5a6-4a8a-ad17-a83cba3c5bae', '45898306-03ce-4af9-b930-d7b3a3631274', 'hosting', 'বিজনেস হোস্টিং', 'ওয়েব হোস্টিং', 'darulfurkantravels.com', 5900, 1, 5900, '2026-01-31', '2026-03-02 05:39:49.471089+00'),
('afdd2b9b-bde7-4dfa-99be-cee48598b354', '45898306-03ce-4af9-b930-d7b3a3631274', 'web_development', 'প্রফেশনাল ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 35000, 1, 35000, NULL, '2026-03-02 05:39:49.471089+00'),
('016a69b4-8312-48b7-8b31-cab8dbf3ea83', '22c6a897-daf8-409f-ada0-7b6b165ce58c', 'domain', 'Custom', 'ডোমেইন রেজিস্ট্রেশন', 'https://rofroftravels.com/', 1750, 1, 1750, '2027-02-23', '2026-03-02 06:18:26.401596+00'),
('a7c81662-071f-45f9-b7c7-adf213258a23', '22c6a897-daf8-409f-ada0-7b6b165ce58c', 'hosting', 'স্টার্টার হোস্টিং', 'ওয়েব হোস্টিং', 'https://rofroftravels.com/', 3500, 1, 3500, '2027-02-23', '2026-03-02 06:18:26.401596+00'),
('6ac7de7f-0cfa-4296-8c94-0cfb4d06856b', '22c6a897-daf8-409f-ada0-7b6b165ce58c', 'web_development', 'বেসিক ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 15000, 1, 15000, NULL, '2026-03-02 06:18:26.401596+00'),
('775fe939-8727-4c4f-867c-34b848fce574', '7cb3cccc-ed95-4867-a80c-a32ce54b41d3', 'domain', 'Custom', 'ডোমেইন রেজিস্ট্রেশন', 'saztravelvisa.com', 1750, 1, 1750, '2027-03-04', '2026-03-04 05:22:03.992698+00'),
('953d50de-dd4f-42be-94a2-d98e9fc68802', '7cb3cccc-ed95-4867-a80c-a32ce54b41d3', 'hosting', 'স্টার্টার হোস্টিং', 'ওয়েব হোস্টিং', 'saztravelvisa.com', 3500, 1, 3500, '2027-03-04', '2026-03-04 05:22:03.992698+00'),
('ade8f153-2bd6-48f5-ae04-57ffa09c8048', '7cb3cccc-ed95-4867-a80c-a32ce54b41d3', 'web_development', 'বেসিক ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 15000, 1, 15000, NULL, '2026-03-04 05:22:03.992698+00'),
('5ece6707-b9db-4288-9a47-c36fc8a88eb0', '06c554d4-d6a1-40b4-b488-deb685ea1ce1', 'domain', 'Custom', 'ডোমেইন রেজিস্ট্রেশন', 'masudtravelsagency.com', 1750, 1, 1750, '2027-03-03', '2026-03-04 06:34:57.032832+00'),
('d77fce0d-c268-46fa-b0d7-72d2e2a30b76', '06c554d4-d6a1-40b4-b488-deb685ea1ce1', 'hosting', 'বিজনেস হোস্টিং', 'ওয়েব হোস্টিং', 'masudtravelsagency.com', 5900, 1, 5900, '2027-03-04', '2026-03-04 06:34:57.032832+00'),
('6c761cef-0499-440f-ae9d-5e6ed12dafbf', '06c554d4-d6a1-40b4-b488-deb685ea1ce1', 'web_development', 'প্রফেশনাল ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 35000, 1, 35000, NULL, '2026-03-04 06:34:57.032832+00'),
('3cbc7021-6502-467d-90cb-7e9f4a10551f', '1c5f8f5b-0f9d-4f3b-b68d-1a3c30af83ac', 'software_development', 'Custom', 'সফটওয়্যার ডেভেলপমেন্ট', NULL, 30000, 1, 30000, NULL, '2026-03-04 06:46:48.582906+00'),
('27b9b8c3-5159-41c4-923b-f5c71ff2e3a9', 'c86ed994-67eb-49bb-8fb6-e9de9a2e4b1d', 'domain', 'Custom', 'ডোমেইন রেজিস্ট্রেশন', 'ngtravels.com', 1650, 1, 1650, '2027-03-04', '2026-03-04 07:32:04.911067+00'),
('7f8a803d-3923-4d69-9fc0-4561974b8d2a', 'c86ed994-67eb-49bb-8fb6-e9de9a2e4b1d', 'hosting', 'স্টার্টার হোস্টিং', 'ওয়েব হোস্টিং', 'ngtravels.com', 3500, 1, 3500, '2027-03-04', '2026-03-04 07:32:04.911067+00'),
('e76fce12-b50e-4c09-acae-ee1b7ae7185e', 'c86ed994-67eb-49bb-8fb6-e9de9a2e4b1d', 'web_development', 'বেসিক ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 15000, 1, 15000, NULL, '2026-03-04 07:32:04.911067+00'),
('6a2b5c12-9b14-4a1f-a4af-087142382412', 'ed3889a2-3f3e-41d8-a05b-5a9d57ffb864', 'hosting', 'বিজনেস হোস্টিং', 'ওয়েব হোস্টিং', 'smtradeint.com', 5900, 1, 5900, '2027-02-06', '2026-03-04 08:52:40.175334+00'),
('695b671f-1c99-4ff3-8c6e-d2bd47769193', 'ed3889a2-3f3e-41d8-a05b-5a9d57ffb864', 'web_development', 'প্রফেশনাল ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 35000, 1, 35000, NULL, '2026-03-04 08:52:40.175334+00'),
('204b3fd5-99bb-40d8-96f0-0c135e13725b', '0abae2ae-a541-469e-96d2-1c82b01c06e5', 'domain', 'Custom', 'ডোমেইন রেজিস্ট্রেশন', 'luckytoursandtravels.com', 1750, 1, 1750, '2027-03-04', '2026-03-04 11:57:58.893982+00'),
('93e1488f-5f0d-4079-8b32-be870eb7f6d0', '0abae2ae-a541-469e-96d2-1c82b01c06e5', 'hosting', 'স্টার্টার হোস্টিং', 'ওয়েব হোস্টিং', 'luckytoursandtravels.com', 5999, 1, 5999, '2027-03-04', '2026-03-04 11:57:58.893982+00'),
('1657f5f7-256d-4d34-b1be-0e5be186049d', '0abae2ae-a541-469e-96d2-1c82b01c06e5', 'web_development', 'বেসিক ওয়েবসাইট', 'ওয়েব ডেভেলপমেন্ট', NULL, 30000, 1, 30000, NULL, '2026-03-04 11:57:58.893982+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 17. ROLE PERMISSIONS (abbreviated - all admin true)
-- =============================================
-- Admin permissions for all modules
INSERT INTO role_permissions (id, role, module, action, allowed, created_at, updated_at)
SELECT gen_random_uuid(), r.role, m.module, a.action, 
  CASE WHEN r.role = 'admin' THEN true
       WHEN r.role = 'staff' AND a.action IN ('view','edit') THEN true
       WHEN r.role = 'support' AND a.action = 'view' THEN true
       ELSE false END,
  '2026-02-27 16:16:41.389208+00', '2026-02-27 16:16:41.389208+00'
FROM (VALUES ('admin'), ('staff'), ('support')) AS r(role)
CROSS JOIN (VALUES ('orders'), ('invoices'), ('customers'), ('domains'), ('hosting'), ('leads'), ('payments'), ('subscriptions'), ('settings'), ('users'), ('audit'), ('financial')) AS m(module)
CROSS JOIN (VALUES ('view'), ('edit'), ('delete'), ('export')) AS a(action)
ON CONFLICT DO NOTHING;

-- =============================================
-- 18. SYSTEM SETTINGS (key settings)
-- =============================================
INSERT INTO system_settings (id, key, value, category, description, is_sensitive, updated_at) VALUES
('7d44b653-eb76-462f-9fb6-4c04b03e9491', 'company_name', '"DigiWebDex"', 'general', 'Company name', false, '2026-02-11 05:37:52.502848+00'),
('de1305fa-4e2a-4976-b8bd-126d97adbb8b', 'company_email', '"info@digiwebdex.com"', 'general', 'Company email', false, '2026-02-11 05:37:52.923821+00'),
('9b9efd46-fe41-46f8-bfe7-3bf0f779d8b0', 'company_phone', '"+8801XXXXXXXXX"', 'general', 'Company phone', false, '2026-02-11 05:37:53.422235+00'),
('ee455df9-a4b5-4229-8236-8f92d1052dce', 'company_address', '"Dhaka, Bangladesh"', 'general', 'Company address', false, '2026-02-11 05:37:53.741925+00'),
('6743072f-3d55-4769-b310-a776e7cd74b1', 'admin_notification_email', '"digiwebdex@gmail.com"', 'notifications', 'Admin notification email', false, '2026-02-11 05:38:03.866254+00'),
('c2cfc396-5e6a-4258-9512-72d2d17d6594', 'admin_notification_phone', '"+8801674533303"', 'notifications', 'Admin notification phone', false, '2026-02-11 05:38:04.365724+00'),
('9d6bedbd-8865-44fc-b588-80a3c426e0e1', 'default_currency', '"BDT"', 'business', 'Default currency code', false, '2026-02-11 05:37:50.381986+00'),
('b8ab448a-d611-4e38-ba1e-9d253646e51c', 'grace_period_days', '7', 'business', 'Payment grace period in days', false, '2026-02-11 05:37:50.865812+00'),
('0727588f-342b-41fb-92a5-40d325421fe2', 'default_commission_rate', '10', 'business', 'Default affiliate commission rate (%)', false, '2026-02-11 05:37:48.993612+00'),
('4a68c28c-f21a-4084-973f-da86e03b45fc', 'default_reseller_margin', '15', 'business', 'Default reseller margin (%)', false, '2026-02-11 05:37:49.425525+00'),
('b38ebcfd-f5b8-4ab2-b90d-c8ce94196cbd', 'default_milestone_percentages', '{"mid":40,"final":30,"initial":30}', 'business', 'Default milestone split percentages', false, '2026-02-11 05:37:49.924421+00'),
('f551b9dc-5b3e-4114-a55b-b9fb3172048b', 'smtp_from_email', '"noreply@digiwebdex.com"', 'notifications', 'From email address', false, '2026-02-11 05:38:01.281712+00'),
('22428175-449b-44ae-9cd3-849eb5182c5a', 'smtp_from_name', '"DigiWebDex"', 'notifications', 'From name', false, '2026-02-11 05:38:01.705357+00'),
('40c7d3cb-9e1f-4ee0-8323-7bee9559e0cd', 'smtp_host', '"smtp.gmail.com"', 'notifications', 'SMTP server host', false, '2026-02-11 05:37:59.884226+00'),
('61963899-2d70-4c51-b107-6acf9355dcbe', 'smtp_port', '587', 'notifications', 'SMTP server port', false, '2026-02-11 05:38:00.382367+00'),
('d3e6313c-b9c2-4912-9980-186853980bb7', 'bank_name', '"Dutch Bangla Bank"', 'payment', 'Bank name', false, '2026-02-11 05:38:08.062656+00'),
('50841b83-e2b5-4d64-ae48-dcd0abb147d0', 'bank_account_name', '"DigiWebDex"', 'payment', 'Bank account name', false, '2026-02-11 05:38:07.556989+00'),
('1f103387-1150-4b9a-8fd5-978733ab6bf9', 'header_order_button_enabled', 'true', 'general', 'Enable/disable the Order button in the header', false, '2026-02-11 05:37:55.040826+00'),
('ad525f46-bd75-403c-8af8-8da8ec002886', 'floating_order_button_enabled', 'false', 'general', 'Enable/disable the floating Order Now button', false, '2026-02-11 05:37:55.470016+00'),
('2a4de17c-ee34-4420-8b77-14f1ff08c40e', 'discount_system_enabled', 'true', 'pricing', 'Enable discount/coupon system', false, '2026-02-11 05:38:08.474693+00'),
('902de913-125d-4e19-bfc5-f44793cac17a', 'max_discount_percentage', '50', 'pricing', 'Maximum allowed discount percentage', false, '2026-02-11 05:38:08.784312+00'),
('19028e32-21fd-4421-a7b3-4d157b15ae35', 'audit_log_enabled', 'true', 'security', 'Enable audit logging', false, '2026-02-11 05:38:14.094528+00'),
('d574ce40-411b-408b-80c6-b2fe15247005', 'rate_limit_enabled', 'true', 'security', 'Enable API rate limiting', false, '2026-02-11 05:38:12.706723+00'),
('81ece454-4bd4-4caf-b311-21d1e6df8c11', 'auto_reminder_enabled', 'true', 'automation', 'Enable automatic reminders', false, '2026-02-11 05:37:47.605009+00'),
('024f040d-4a75-4d80-ab0a-de15c230ad68', 'subscription_auto_renew', 'true', 'automation', 'Enable subscription auto-renewal', false, '2026-02-11 05:37:47.989921+00'),
('8a504dc6-2960-4296-9098-d9c3c547726b', 'sms_api_url', '"https://bulksmsbd.net/api/smsapi"', 'notifications', 'SMS API endpoint URL', false, '2026-02-11 05:38:02.824047+00'),
('871fec92-fa42-49f2-ac53-97c2f4153bd0', 'sms_sender_id', '"DigiWebDex"', 'notifications', 'SMS sender ID', false, '2026-02-11 05:37:58.404479+00')
ON CONFLICT (id) DO NOTHING;

-- Re-enable triggers
SET session_replication_role = 'origin';

COMMIT;

-- Verify counts
SELECT 'profiles' as tbl, count(*) as cnt FROM profiles
UNION ALL SELECT 'user_roles', count(*) FROM user_roles
UNION ALL SELECT 'services', count(*) FROM services
UNION ALL SELECT 'service_packages', count(*) FROM service_packages
UNION ALL SELECT 'domain_pricing', count(*) FROM domain_pricing
UNION ALL SELECT 'orders', count(*) FROM orders
UNION ALL SELECT 'invoices', count(*) FROM invoices
UNION ALL SELECT 'order_items', count(*) FROM order_items
UNION ALL SELECT 'invoice_items', count(*) FROM invoice_items
UNION ALL SELECT 'subscriptions', count(*) FROM subscriptions
UNION ALL SELECT 'system_settings', count(*) FROM system_settings
UNION ALL SELECT 'homepage_sections', count(*) FROM homepage_sections
ORDER BY tbl;
