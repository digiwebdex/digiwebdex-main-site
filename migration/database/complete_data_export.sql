-- ============================================================
-- DigiWebDex Complete Database Data Export
-- Generated from Lovable Cloud on 2026-03-08
-- Import order matters due to foreign key constraints
-- ============================================================

BEGIN;

-- ============================================================
-- 1. PROFILES (no FK dependencies)
-- ============================================================
INSERT INTO profiles (id, user_id, full_name, company_name, phone, address, city, country, avatar_url, balance_due, created_at, updated_at) VALUES
('9ad67e85-1f60-4fc9-aa70-6377cfe7947a', 'b43e1fc1-857a-4aba-b169-766211ac176c', 'IQBAL HOSSAIN', NULL, NULL, NULL, NULL, 'Bangladesh', NULL, 0, '2026-02-07T17:12:15.404813+00:00', '2026-02-07T17:12:15.404813+00:00'),
('00684a54-0740-4c11-a40f-321964cdb6e8', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'A. S. M. Al-Amin', 'S M Elite Hajj Limited', '+8801867666888', NULL, NULL, 'Bangladesh', NULL, 30000, '2026-02-27T18:20:36.781887+00:00', '2026-03-04T08:53:26.426599+00:00'),
('1148e897-99d7-4362-b17d-98f20b291390', '27012e2b-3cb3-41f0-8438-42d129b3c9c7', 'Shohure Online', 'Shohure Online', '01840500543', '', '', 'Bangladesh', NULL, 0, '2026-03-05T10:22:44.150429+00:00', '2026-03-05T10:22:44.469007+00:00'),
('83d62096-b5a2-49f3-8077-533d9ed0bcab', 'edf1f376-558d-43cb-9144-1815eabfa468', 'Lucky Tours and Travels', 'Lucky Tours and Travels', '01577004689', '', '', 'Bangladesh', NULL, 30499, '2026-03-04T11:56:36.99978+00:00', '2026-03-05T23:11:11.505502+00:00'),
('54e4e36b-6f6a-4216-bf57-8ab17a4e2e1a', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 'Rof Rof Travels', 'https://rofroftravels.com/', '01874609799', '', '', 'Bangladesh', NULL, 0, '2026-03-02T06:14:05.117443+00:00', '2026-03-02T06:19:38.75497+00:00'),
('ceffce25-b222-4005-8e54-55b06a0960f6', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 'Saimon Islam', 'Zenith Overseas', '01841909042', NULL, NULL, 'Bangladesh', NULL, 13000, '2026-02-21T17:45:03.250056+00:00', '2026-02-27T22:06:58.17137+00:00'),
('6866d789-bfad-40ce-a79f-5d993ded9aac', 'f9ef0dcf-c041-4906-80f7-009504cb6968', 'Sabbir', 'saztravelvisa.com', '01865891727', '', '', 'Bangladesh', NULL, 8500, '2026-03-04T05:20:37.178132+00:00', '2026-03-04T05:23:26.966055+00:00'),
('aede3a6b-67f8-41ba-a56c-ad44ee33e503', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 'MD Masud', 'masudtravelsagency.com', '01711727950', '', '', 'Bangladesh', NULL, 20000, '2026-03-04T06:33:35.219179+00:00', '2026-03-04T06:37:34.853309+00:00'),
('ce74cd9b-8551-4b0f-bbff-41d93d600691', '4f314a32-8483-44a0-afb1-0f57fa3564dd', 'NG Travels', 'NG Travels', ' 01912171463', '', '', 'Bangladesh', NULL, 10000, '2026-03-04T07:16:28.891877+00:00', '2026-03-04T07:32:03.444207+00:00'),
('d0ccea5f-cde8-4988-8ded-f53154f22ecc', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 'RAHE KABA', 'RAHE KABA', '+880 1601-505050', '', '', 'Bangladesh', NULL, 20000, '2026-02-28T04:29:25.907795+00:00', '2026-03-04T08:05:37.316027+00:00'),
('4432cc21-99f4-43bb-89bd-2d0e8295217d', 'dca994c9-2cb7-4f5a-b341-2664d90c50d2', 'দারুল ফুরকান ট্যুরস এন্ড ট্রাভেলস', '', '01339080532', '', '', 'Bangladesh', NULL, 15000, '2026-02-27T22:12:03.520815+00:00', '2026-03-04T08:05:58.896678+00:00'),
('678e33b2-4f9d-4c7e-a331-d76e6df40dee', '437ec3b1-119e-4001-8820-d5cf3ef59061', 'Seven Trip', 'Seven Trip', '01749373748', '', '', 'Bangladesh', NULL, 0, '2026-03-04T08:12:46.378598+00:00', '2026-03-04T08:12:46.658991+00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. USER_ROLES
-- ============================================================
INSERT INTO user_roles (id, user_id, role, created_at) VALUES
('78f5703e-54c9-40bb-b032-e0bce4a857cf', 'b43e1fc1-857a-4aba-b169-766211ac176c', 'admin', '2026-02-07T17:12:15.404813+00:00'),
('238d2efe-960d-4551-b714-ba81726e3189', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 'client', '2026-02-21T17:45:03.250056+00:00'),
('aef43781-91a8-4edc-9a9c-37114677aa0b', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'client', '2026-02-27T18:20:36.781887+00:00'),
('528454f6-726d-447c-8a80-d76eb0ea957a', 'dca994c9-2cb7-4f5a-b341-2664d90c50d2', 'client', '2026-02-27T22:12:03.520815+00:00'),
('cd42b6c0-c0cc-4c1f-8c08-eb698bd28fa9', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 'client', '2026-02-28T04:29:25.907795+00:00'),
('99f0e575-157b-4b84-979c-71db6a62d0c6', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 'client', '2026-03-02T06:14:05.117443+00:00'),
('c0290ca6-4a9d-48ad-9d4c-234f23a50545', 'f9ef0dcf-c041-4906-80f7-009504cb6968', 'client', '2026-03-04T05:20:37.178132+00:00'),
('64b86c2a-1c5d-4e9d-9e4d-fad569c4a152', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 'client', '2026-03-04T06:33:35.219179+00:00'),
('8aa09cc2-fa7c-4b05-94e7-e05ee0988157', '4f314a32-8483-44a0-afb1-0f57fa3564dd', 'client', '2026-03-04T07:16:28.891877+00:00'),
('02ad628c-ad88-4dfd-a758-c8b30d3c759d', '437ec3b1-119e-4001-8820-d5cf3ef59061', 'client', '2026-03-04T08:12:46.378598+00:00'),
('c9ac6edc-e2a6-4664-9056-e344e27cf779', 'edf1f376-558d-43cb-9144-1815eabfa468', 'client', '2026-03-04T11:56:36.99978+00:00'),
('8a471ee2-6696-4e8b-9f3d-0009591c8f02', '27012e2b-3cb3-41f0-8438-42d129b3c9c7', 'client', '2026-03-05T10:22:44.150429+00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. SERVICE_CATEGORIES
-- ============================================================
INSERT INTO service_categories (id, name_en, name_bn, slug, description_en, description_bn, icon, is_active, sort_order, created_at, updated_at) VALUES
('0a0ce8fd-4b8b-42f6-b661-03873d06af71', 'Domain Services', 'ডোমেইন সেবা', 'domain-services', 'Complete domain registration and management services', 'সম্পূর্ণ ডোমেইন রেজিস্ট্রেশন এবং ম্যানেজমেন্ট সেবা', NULL, true, 1, '2026-02-07T17:34:29.43851+00:00', '2026-02-07T17:34:29.43851+00:00'),
('e39e0f2f-7af7-45e3-9bf2-b7188018dea8', 'Web Hosting', 'ওয়েব হোস্টিং', 'web-hosting', 'Fast, secure and reliable web hosting solutions', 'দ্রুত, সুরক্ষিত এবং নির্ভরযোগ্য ওয়েব হোস্টিং সলিউশন', NULL, true, 2, '2026-02-07T17:34:29.43851+00:00', '2026-02-07T17:34:29.43851+00:00'),
('7671168b-c448-4944-873d-cf7dd52a6a4b', 'Web Development', 'ওয়েব ডেভেলপমেন্ট', 'web-development', 'Professional website design and development', 'প্রফেশনাল ওয়েবসাইট ডিজাইন এবং ডেভেলপমেন্ট', NULL, true, 3, '2026-02-07T17:34:29.43851+00:00', '2026-02-07T17:34:29.43851+00:00'),
('10b3ad54-e6ff-43d4-8488-b1aefd1f5d10', 'Software Development', 'সফটওয়্যার ডেভেলপমেন্ট', 'software-development', 'Custom software and application development', 'কাস্টম সফটওয়্যার এবং অ্যাপ্লিকেশন ডেভেলপমেন্ট', NULL, true, 4, '2026-02-07T17:34:29.43851+00:00', '2026-02-07T17:34:29.43851+00:00'),
('25570ba8-91ba-47ba-b94b-84fd045ba5c5', 'Digital Marketing', 'ডিজিটাল মার্কেটিং', 'digital-marketing', 'SEO, Social Media and PPC marketing services', 'SEO, সোশ্যাল মিডিয়া এবং PPC মার্কেটিং সেবা', NULL, true, 5, '2026-02-07T17:34:29.43851+00:00', '2026-02-07T17:34:29.43851+00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. SERVICES (depends on service_categories)
-- ============================================================
INSERT INTO services (id, name_en, name_bn, slug, description_en, description_bn, service_type, category_id, features_en, features_bn, is_active, sort_order, image_url, meta_title, meta_description, created_at, updated_at) VALUES
('50acf2b0-cb1b-4dec-8f78-987edd3ff46a', 'Domain Registration', 'ডোমেইন রেজিস্ট্রেশন', 'domain-registration', 'Register your perfect domain name with competitive pricing and free WHOIS privacy', 'প্রতিযোগিতামূলক মূল্যে এবং বিনামূল্যে WHOIS প্রাইভেসি সহ আপনার পারফেক্ট ডোমেইন নাম রেজিস্টার করুন', 'domain', '0a0ce8fd-4b8b-42f6-b661-03873d06af71', ARRAY['Free WHOIS Privacy','Free DNS Management','Domain Forwarding','Easy Transfer','24/7 Support'], ARRAY['বিনামূল্যে WHOIS প্রাইভেসি','বিনামূল্যে DNS ম্যানেজমেন্ট','ডোমেইন ফরওয়ার্ডিং','সহজ ট্রান্সফার','২৪/৭ সাপোর্ট'], true, 1, NULL, NULL, NULL, '2026-02-07T17:37:35.363021+00:00', '2026-02-21T17:13:57.959872+00:00'),
('a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'Web Hosting', 'ওয়েব হোস্টিং', 'web-hosting', 'Lightning fast SSD hosting with 99.9% uptime guarantee and free SSL', 'লাইটনিং ফাস্ট SSD হোস্টিং ৯৯.৯% আপটাইম গ্যারান্টি এবং বিনামূল্যে SSL সহ', 'hosting', 'e39e0f2f-7af7-45e3-9bf2-b7188018dea8', ARRAY['Free SSL Certificate','SSD Storage','99.9% Uptime','Daily Backups','cPanel Access','24/7 Support'], ARRAY['বিনামূল্যে SSL সার্টিফিকেট','SSD স্টোরেজ','৯৯.৯% আপটাইম','দৈনিক ব্যাকআপ','cPanel অ্যাক্সেস','২৪/৭ সাপোর্ট'], true, 2, NULL, NULL, NULL, '2026-02-07T17:37:35.363021+00:00', '2026-02-21T17:13:57.959872+00:00'),
('e6997007-f8be-4378-bc64-31c2df3de565', 'Web Development', 'ওয়েব ডেভেলপমেন্ট', 'web-development', 'Professional, responsive websites designed to grow your business', 'আপনার ব্যবসা বৃদ্ধির জন্য ডিজাইন করা প্রফেশনাল, রেসপন্সিভ ওয়েবসাইট', 'web_development', '7671168b-c448-4944-873d-cf7dd52a6a4b', ARRAY['Custom Design','Mobile Responsive','SEO Optimized','Fast Loading','CMS Integration','Free Support (1 Year)'], ARRAY['কাস্টম ডিজাইন','মোবাইল রেসপন্সিভ','SEO অপ্টিমাইজড','ফাস্ট লোডিং','CMS ইন্টিগ্রেশন','বিনামূল্যে সাপোর্ট (১ বছর)'], true, 3, NULL, NULL, NULL, '2026-02-07T17:37:35.363021+00:00', '2026-02-21T17:13:57.959872+00:00'),
('2408cab5-eec8-4627-a584-78cc3c28506b', 'Software Development', 'সফটওয়্যার ডেভেলপমেন্ট', 'software-development', 'Custom software solutions tailored to your business needs', 'আপনার ব্যবসার প্রয়োজন অনুযায়ী কাস্টম সফটওয়্যার সলিউশন', 'software_development', '10b3ad54-e6ff-43d4-8488-b1aefd1f5d10', ARRAY['Custom Development','API Integration','Database Design','Mobile Apps','Cloud Deployment','Ongoing Support'], ARRAY['কাস্টম ডেভেলপমেন্ট','API ইন্টিগ্রেশন','ডাটাবেজ ডিজাইন','মোবাইল অ্যাপস','ক্লাউড ডিপ্লয়মেন্ট','চলমান সাপোর্ট'], true, 4, NULL, NULL, NULL, '2026-02-07T17:37:35.363021+00:00', '2026-02-21T17:13:57.959872+00:00'),
('6879331e-17fc-400c-8450-4019844281a8', 'Digital Marketing', 'ডিজিটাল মার্কেটিং', 'digital-marketing', 'Grow your online presence with expert SEO, Social Media and PPC services', 'এক্সপার্ট SEO, সোশ্যাল মিডিয়া এবং PPC সার্ভিসের মাধ্যমে আপনার অনলাইন উপস্থিতি বাড়ান', 'digital_marketing', '25570ba8-91ba-47ba-b94b-84fd045ba5c5', ARRAY['SEO Optimization','Social Media Management','PPC Campaigns','Content Marketing','Analytics & Reporting','Monthly Reports'], ARRAY['SEO অপ্টিমাইজেশন','সোশ্যাল মিডিয়া ম্যানেজমেন্ট','PPC ক্যাম্পেইন','কন্টেন্ট মার্কেটিং','অ্যানালিটিক্স ও রিপোর্টিং','মাসিক রিপোর্ট'], true, 5, NULL, NULL, NULL, '2026-02-07T17:37:35.363021+00:00', '2026-02-21T17:13:57.959872+00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. SERVICE_PACKAGES (depends on services)
-- ============================================================
INSERT INTO service_packages (id, service_id, name_en, name_bn, price, currency, billing_type, billing_cycle_months, features_en, features_bn, is_active, is_popular, sort_order, setup_fee, created_at, updated_at) VALUES
('a63f3cb7-d2c8-4084-b9c5-26097ae9bc78', 'e6997007-f8be-4378-bc64-31c2df3de565', 'Basic Website', 'বেসিক ওয়েবসাইট', 15000, 'BDT', 'one_time', NULL, ARRAY['5 Pages','Mobile Responsive','Contact Form','Basic SEO','Social Media Links','1 Year Free Support'], ARRAY['৫টি পেজ','মোবাইল রেসপন্সিভ','কন্টাক্ট ফর্ম','বেসিক SEO','সোশ্যাল মিডিয়া লিংক','১ বছর বিনামূল্যে সাপোর্ট'], true, false, 1, 0, '2026-02-07T17:40:32.455864+00:00', '2026-02-07T17:40:32.455864+00:00'),
('a4363364-9b7f-4d49-b7a0-e401387084fe', 'e6997007-f8be-4378-bc64-31c2df3de565', 'Professional Website', 'প্রফেশনাল ওয়েবসাইট', 35000, 'BDT', 'one_time', NULL, ARRAY['10 Pages','CMS Integration','Blog Section','Advanced SEO','Google Analytics','Speed Optimization','1 Year Free Support'], ARRAY['১০টি পেজ','CMS ইন্টিগ্রেশন','ব্লগ সেকশন','অ্যাডভান্সড SEO','গুগল অ্যানালিটিক্স','স্পিড অপ্টিমাইজেশন','১ বছর বিনামূল্যে সাপোর্ট'], true, true, 2, 0, '2026-02-07T17:40:32.455864+00:00', '2026-02-07T17:40:32.455864+00:00'),
('123eace6-215b-43be-8dd9-fa181fed7585', 'e6997007-f8be-4378-bc64-31c2df3de565', 'E-commerce Website', 'ই-কমার্স ওয়েবসাইট', 75000, 'BDT', 'one_time', NULL, ARRAY['Unlimited Products','Payment Gateway','Inventory Management','Order Tracking','Customer Accounts','Mobile App Ready','1 Year Free Support'], ARRAY['আনলিমিটেড প্রোডাক্ট','পেমেন্ট গেটওয়ে','ইনভেন্টরি ম্যানেজমেন্ট','অর্ডার ট্র্যাকিং','কাস্টমার অ্যাকাউন্ট','মোবাইল অ্যাপ রেডি','১ বছর বিনামূল্যে সাপোর্ট'], true, false, 3, 0, '2026-02-07T17:40:32.455864+00:00', '2026-02-07T17:40:32.455864+00:00'),
('e12133ac-51ee-4403-bde6-368b0c4b303c', '2408cab5-eec8-4627-a584-78cc3c28506b', 'Custom Application', 'কাস্টম অ্যাপ্লিকেশন', 100000, 'BDT', 'milestone', NULL, ARRAY['Requirements Analysis','Custom Design','Development','Testing','Deployment','3 Months Support'], ARRAY['প্রয়োজনীয়তা বিশ্লেষণ','কাস্টম ডিজাইন','ডেভেলপমেন্ট','টেস্টিং','ডিপ্লয়মেন্ট','৩ মাস সাপোর্ট'], true, true, 1, 0, '2026-02-07T17:40:32.455864+00:00', '2026-02-07T17:40:32.455864+00:00'),
('551d10b5-d753-4d67-ab46-397fe95400b7', '2408cab5-eec8-4627-a584-78cc3c28506b', 'Enterprise Solution', 'এন্টারপ্রাইজ সলিউশন', 500000, 'BDT', 'milestone', NULL, ARRAY['Full Requirements Gathering','Architecture Design','Multi-module Development','Integration','Training','1 Year Support','SLA Guarantee'], ARRAY['সম্পূর্ণ প্রয়োজনীয়তা সংগ্রহ','আর্কিটেকচার ডিজাইন','মাল্টি-মডিউল ডেভেলপমেন্ট','ইন্টিগ্রেশন','ট্রেনিং','১ বছর সাপোর্ট','SLA গ্যারান্টি'], true, false, 2, 0, '2026-02-07T17:40:32.455864+00:00', '2026-02-07T17:40:32.455864+00:00'),
('69e8080d-c2bc-484b-8b4b-2020e379cdd4', '6879331e-17fc-400c-8450-4019844281a8', 'SEO Basic', 'SEO বেসিক', 5000, 'BDT', 'recurring', 1, ARRAY['Keyword Research','On-page SEO','Technical SEO Audit','Monthly Report','Google Search Console Setup'], ARRAY['কীওয়ার্ড রিসার্চ','অন-পেজ SEO','টেকনিক্যাল SEO অডিট','মাসিক রিপোর্ট','গুগল সার্চ কনসোল সেটআপ'], true, false, 1, 0, '2026-02-07T17:40:32.455864+00:00', '2026-02-07T17:40:32.455864+00:00'),
('80ead7e2-e275-4c23-a288-888d5307c641', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'Starter Hosting', 'স্টার্টার হোস্টিং', 3500, 'BDT', 'recurring', 12, ARRAY['5GB SSD Storage','50GB Bandwidth','Free SSL','5 Email Accounts','cPanel Access','24/7 Support'], ARRAY['৫GB SSD স্টোরেজ','৫০GB ব্যান্ডউইথ','বিনামূল্যে SSL','৫টি ইমেইল অ্যাকাউন্ট','cPanel অ্যাক্সেস','২৪/৭ সাপোর্ট'], true, true, 1, 0, '2026-02-07T17:40:32.455864+00:00', '2026-02-07T17:40:32.455864+00:00'),
('c61a52ad-730f-41c8-9414-92304ae10377', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'Business Hosting', 'বিজনেস হোস্টিং', 5900, 'BDT', 'recurring', 12, ARRAY['20GB SSD Storage','Unlimited Bandwidth','Free SSL','Unlimited Email','cPanel Access','Daily Backup','Priority Support'], ARRAY['২০GB SSD স্টোরেজ','আনলিমিটেড ব্যান্ডউইথ','বিনামূল্যে SSL','আনলিমিটেড ইমেইল','cPanel অ্যাক্সেস','দৈনিক ব্যাকআপ','প্রায়োরিটি সাপোর্ট'], true, false, 2, 0, '2026-02-07T17:40:32.455864+00:00', '2026-02-07T17:40:32.455864+00:00'),
('74b7ee3f-ea10-41f1-8fdc-1e94f9d8e9ce', 'a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'Premium Hosting', 'প্রিমিয়াম হোস্টিং', 9900, 'BDT', 'recurring', 12, ARRAY['50GB NVMe Storage','Unlimited Bandwidth','Free SSL','Unlimited Email','LiteSpeed Server','Daily Backup','SSH Access','Staging Environment','Dedicated Support'], ARRAY['৫০GB NVMe স্টোরেজ','আনলিমিটেড ব্যান্ডউইথ','বিনামূল্যে SSL','আনলিমিটেড ইমেইল','LiteSpeed সার্ভার','দৈনিক ব্যাকআপ','SSH অ্যাক্সেস','স্টেজিং এনভায়রনমেন্ট','ডেডিকেটেড সাপোর্ট'], true, false, 3, 0, '2026-02-07T17:40:32.455864+00:00', '2026-02-07T17:40:32.455864+00:00'),
('bb5da4d8-b291-47e2-b77e-f37df2ed5b07', '6879331e-17fc-400c-8450-4019844281a8', 'SEO Pro', 'SEO প্রো', 15000, 'BDT', 'recurring', 1, ARRAY['Advanced Keyword Research','On-page & Off-page SEO','Technical SEO','Link Building','Content Strategy','Competitor Analysis','Monthly Report','Google Ads Management'], ARRAY['অ্যাডভান্সড কীওয়ার্ড রিসার্চ','অন-পেজ ও অফ-পেজ SEO','টেকনিক্যাল SEO','লিংক বিল্ডিং','কন্টেন্ট স্ট্র্যাটেজি','প্রতিযোগী বিশ্লেষণ','মাসিক রিপোর্ট','গুগল অ্যাডস ম্যানেজমেন্ট'], true, true, 2, 0, '2026-02-07T17:40:32.455864+00:00', '2026-02-07T17:40:32.455864+00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. DOMAIN_PRICING
-- ============================================================
INSERT INTO domain_pricing (id, tld, base_price, renewal_price, transfer_price, currency, is_active, is_popular, margin_percent, sort_order, created_at, updated_at) VALUES
('f33651c3-a5db-4a3a-a94b-9068785494eb', '.com.bd', 2500, 2500, 2500, 'BDT', true, true, 5, 6, '2026-02-06T18:55:19.037003+00:00', '2026-02-06T18:55:19.037003+00:00'),
('22633c27-a272-466e-9cb5-88e535a293c6', '.net.bd', 2500, 2500, 2500, 'BDT', true, false, 5, 7, '2026-02-06T18:55:19.037003+00:00', '2026-02-06T18:55:19.037003+00:00'),
('a31824e1-5f22-49ef-94d0-a392f56068f6', '.org.bd', 2500, 2500, 2500, 'BDT', true, false, 5, 8, '2026-02-06T18:55:19.037003+00:00', '2026-02-06T18:55:19.037003+00:00'),
('d965b1a7-c67c-478b-904e-e250fcda396b', '.edu.bd', 1500, 1500, 1500, 'BDT', true, false, 5, 9, '2026-02-06T18:55:19.037003+00:00', '2026-02-06T18:55:19.037003+00:00'),
('64b9ec85-b0b1-4b68-be26-5778b5c4fcbe', '.net', 1900, 1900, 1900, 'BDT', true, true, 10, 2, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('82760c64-4e81-4d6d-bcf6-63de84ecf046', '.org', 1785, 1785, 1785, 'BDT', true, true, 10, 3, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('48d7b0e2-2df8-4d01-82fe-ab4b3bc88dd0', '.info', 3416, 4148, 3904, 'BDT', true, false, 10, 4, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('49628935-382a-4e10-8da9-6ba85bfa0e25', '.biz', 1785, 1785, 1785, 'BDT', true, false, 10, 5, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('ae460d13-3e71-49e8-879c-3f36f2b82755', '.xyz', 342, 1951, 1836, 'BDT', true, false, 15, 10, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('93a6336a-5316-4c27-b952-6ea13e5cf5b2', '.online', 3719, 3719, 3719, 'BDT', true, false, 15, 11, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('c91af8ac-4cc6-40b8-82f3-d2475b996e1f', '.store', 7438, 7438, 7438, 'BDT', true, false, 15, 12, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('90d99109-65f8-497b-a4a4-9792ac6c7e02', '.tech', 6694, 6694, 6694, 'BDT', true, false, 15, 13, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('2294ffe9-bd47-44f1-a643-cd192822b9e4', '.io', 7481, 7481, 7481, 'BDT', true, true, 10, 14, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('7211af91-d564-4cf4-b213-b7e181d5ab44', '.co', 5124, 5124, 4270, 'BDT', true, false, 10, 15, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('c43a5bf1-e2d2-4ed2-9997-1b41cacf1a66', '.name', 1338, 1338, 1338, 'BDT', true, false, 5, 16, '2026-02-07T11:52:29.564459+00:00', '2026-02-08T13:43:55.317861+00:00'),
('e972b20e-eba1-4868-b9a6-dc2b0c914f14', '.asia', 2200, 2700, 2200, 'BDT', true, false, 5, 17, '2026-02-07T11:52:29.564459+00:00', '2026-02-07T11:52:29.564459+00:00'),
('6b0c4183-ecf7-4b8c-b925-611dc3acfccc', '.mobi', 5951, 5951, 5951, 'BDT', true, false, 5, 18, '2026-02-07T11:52:29.564459+00:00', '2026-02-07T11:52:29.564459+00:00'),
('6ef2e4b2-1a31-4b3c-a56a-fcc94b2b8c91', '.me', 4270, 4270, 4270, 'BDT', true, false, 5, 19, '2026-02-07T11:52:29.564459+00:00', '2026-02-07T11:52:29.564459+00:00'),
('97c73a81-33a4-4afc-b74f-3bc6cbfafbd1', '.com', 1650, 1650, 1650, 'BDT', true, true, 10, 1, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('c8b6e3d1-1234-4567-890a-bcdef1234567', '.bd', 3000, 3000, 3000, 'BDT', true, true, 5, 20, '2026-02-06T18:55:19.037003+00:00', '2026-02-06T18:55:19.037003+00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. ROLE_PERMISSIONS  
-- ============================================================
-- Admin gets all permissions for all modules
INSERT INTO role_permissions (id, role, module, action, allowed, created_at, updated_at)
SELECT gen_random_uuid(), 'admin', m.module, a.action, true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'
FROM (VALUES ('orders'),('invoices'),('customers'),('domains'),('hosting'),('leads'),('tickets'),('proposals'),('blog'),('services'),('settings'),('analytics'),('backup'),('users')) AS m(module)
CROSS JOIN (VALUES ('view'),('edit'),('delete'),('export')) AS a(action)
ON CONFLICT DO NOTHING;

-- Staff gets view/edit for most modules
INSERT INTO role_permissions (id, role, module, action, allowed, created_at, updated_at)
SELECT gen_random_uuid(), 'staff', m.module, a.action, true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'
FROM (VALUES ('orders'),('invoices'),('customers'),('domains'),('hosting'),('leads'),('tickets'),('proposals'),('blog'),('services')) AS m(module)
CROSS JOIN (VALUES ('view'),('edit')) AS a(action)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. HOMEPAGE_SECTIONS
-- ============================================================
INSERT INTO homepage_sections (id, section_key, title_en, title_bn, subtitle_en, subtitle_bn, is_active, sort_order, metadata, created_at, updated_at) VALUES
('da9ef8b4-f835-4ac5-a87f-c38db8e001af', 'hero', 'Build Your Digital Presence', 'আপনার ডিজিটাল উপস্থিতি তৈরি করুন', 'Professional web solutions for your business', 'আপনার ব্যবসার জন্য পেশাদার ওয়েব সমাধান', true, 1, '{}', '2026-02-08T05:04:07.679538+00:00', '2026-02-08T05:04:07.679538+00:00'),
('42803f6d-e55b-444b-a7a7-939bb191cf60', 'services', 'Our Services', 'আমাদের সেবাসমূহ', 'Comprehensive digital solutions', 'সম্পূর্ণ ডিজিটাল সমাধান', true, 2, '{}', '2026-02-08T05:04:07.679538+00:00', '2026-02-08T05:04:07.679538+00:00'),
('36dc6c9e-2ff1-4198-9860-211645108c83', 'features', 'Why Choose Us', 'কেন আমাদের বেছে নিবেন', 'What makes us different', 'আমাদের বিশেষত্ব', true, 3, '{}', '2026-02-08T05:04:07.679538+00:00', '2026-02-08T05:04:07.679538+00:00'),
('a3744274-7231-4c9a-9a22-b5dec2912164', 'portfolio', 'Our Work', 'আমাদের কাজ', 'Projects we are proud of', 'আমাদের গর্বের প্রজেক্ট', true, 4, '{}', '2026-02-08T05:04:07.679538+00:00', '2026-02-08T05:04:07.679538+00:00'),
('a5fa880d-ffa5-42b4-b2d5-b2b7e42a9ddd', 'testimonials', 'Client Testimonials', 'ক্লায়েন্ট প্রশংসাপত্র', 'What our clients say', 'আমাদের ক্লায়েন্টদের মতামত', true, 5, '{}', '2026-02-08T05:04:07.679538+00:00', '2026-02-08T05:04:07.679538+00:00'),
('aee1cc7c-d965-4cc7-9919-b17741eeaa32', 'pricing', 'Pricing', 'মূল্য', 'Transparent pricing for all services', 'সব সেবার স্বচ্ছ মূল্য', true, 6, '{}', '2026-02-08T05:04:07.679538+00:00', '2026-02-08T05:04:07.679538+00:00'),
('44e1b224-ccc8-4d13-9742-6213016d1fb9', 'cta', 'Get Started Today', 'আজই শুরু করুন', 'Transform your business with us', 'আমাদের সাথে আপনার ব্যবসা রূপান্তর করুন', true, 7, '{}', '2026-02-08T05:04:07.679538+00:00', '2026-02-08T05:04:07.679538+00:00'),
('a05b3f74-b219-45e4-b2e3-a5e08b9e398c', 'faq', 'Frequently Asked Questions', 'সচরাচর জিজ্ঞাসিত প্রশ্ন', 'Find answers to common questions', 'সাধারণ প্রশ্নের উত্তর পান', true, 8, '{}', '2026-02-08T05:04:07.679538+00:00', '2026-02-08T05:04:07.679538+00:00'),
('7019a2e9-29ec-49bc-9bf3-72ff0a9308d8', 'offer_banner', 'Special Offer', 'বিশেষ অফার', 'Limited time discount', 'সীমিত সময়ের জন্য ছাড়', true, 9, '{}', '2026-02-08T05:04:07.679538+00:00', '2026-02-08T05:04:07.679538+00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 9. AFFILIATES
-- ============================================================
INSERT INTO affiliates (id, user_id, referral_code, commission_rate, status, total_clicks, total_conversions, total_earnings, pending_earnings, withdrawable_earnings, withdrawn_earnings, grace_period_days, min_withdrawal_amount, payment_details, created_at, updated_at) VALUES
('65d1ac15-b5f1-46d3-a1bb-8aaaec942ad1', 'b43e1fc1-857a-4aba-b169-766211ac176c', '251269C7', 10, 'pending', 0, 0, 0, 0, 0, 0, 30, 500, '{}', '2026-02-07T17:13:55.04687+00:00', '2026-02-07T17:13:55.04687+00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 10. PROPOSAL_TEMPLATES
-- ============================================================
INSERT INTO proposal_templates (id, name, is_default, primary_color, secondary_color, accent_color, header_text_en, header_text_bn, footer_text_en, footer_text_bn, terms_conditions_en, terms_conditions_bn, payment_instructions_en, payment_instructions_bn, show_company_details, show_bank_details, show_mobile_payment, created_at, updated_at) VALUES
('767ac07b-1a91-4b05-8d0a-84fddad05bb3', 'Default Template', true, '#2563eb', '#1e40af', '#3b82f6', 'Thank you for considering DigiWebDex for your project.', 'আপনার প্রজেক্টের জন্য DigiWebDex বিবেচনা করার জন্য ধন্যবাদ।', 'We look forward to working with you.', 'আপনার সাথে কাজ করার জন্য অপেক্ষায় রইলাম।', E'1. 50% advance payment required to start.\n2. Remaining 50% upon project completion.\n3. Revisions limited to project scope.\n4. Timeline starts after advance payment.', E'১. শুরুতে ৫০% অগ্রিম পেমেন্ট প্রয়োজন।\n২. প্রজেক্ট সম্পন্ন হলে বাকি ৫০%।\n৩. সংশোধন প্রজেক্ট স্কোপের মধ্যে সীমাবদ্ধ।\n৪. অগ্রিম পেমেন্টের পর টাইমলাইন শুরু।', 'Please make payment via bKash/Nagad or bank transfer.', 'অনুগ্রহ করে বিকাশ/নগদ অথবা ব্যাংক ট্রান্সফারের মাধ্যমে পেমেন্ট করুন।', true, true, true, '2026-02-08T05:04:07.679538+00:00', '2026-02-08T05:04:07.679538+00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- NOTE: Orders, invoices, order_items, invoice_items, subscriptions,
-- notifications, manual_payments, order_meta, projects, system_settings,
-- notification_templates, contact_messages, landing_pages, blog_posts,
-- and sitemap_entries data is available but extremely large.
-- 
-- To import the FULL dataset, run the export script on your LOCAL machine:
--   cd migration/scripts
--   SUPABASE_PASSWORD='your-db-password' ./export_supabase_data.sh
--
-- This SQL file contains the essential reference/config data.
-- Transactional data (orders/invoices) should be exported via pg_dump.
-- ============================================================

COMMIT;
