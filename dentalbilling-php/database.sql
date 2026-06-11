-- ============================================================
--  DentalBilling.us — full schema + seed data
--  Import this once via cPanel → phpMyAdmin (select your DB → Import).
--  Safe to re-import: it drops and recreates the tables.
--  Admin login after import:  admin@dentalbillingcompany.us / admin123!
-- ============================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS company_owner_claims;
DROP TABLE IF EXISTS company_gallery;
DROP TABLE IF EXISTS company_services;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS service_categories;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS states;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS blog_categories;
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS settings;

-- ---------- Reference / geo ----------
CREATE TABLE states (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  slug VARCHAR(80) NOT NULL UNIQUE,
  abbreviation CHAR(2) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  state_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  INDEX (state_id),
  UNIQUE KEY uniq_city (state_id, slug),
  CONSTRAINT fk_city_state FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Users ----------
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','COMPANY_OWNER','USER') NOT NULL DEFAULT 'USER',
  banned TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Categories ----------
CREATE TABLE service_categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL,
  icon VARCHAR(16) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Companies ----------
CREATE TABLE companies (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id INT UNSIGNED DEFAULT NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  status ENUM('PENDING','ACTIVE','SUSPENDED','REJECTED') NOT NULL DEFAULT 'PENDING',
  tier ENUM('FREE','BASIC','PREMIUM','FEATURED') NOT NULL DEFAULT 'FREE',
  short_description VARCHAR(255) DEFAULT NULL,
  description TEXT,
  logo VARCHAR(255) DEFAULT NULL,
  website VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(40) DEFAULT NULL,
  email VARCHAR(190) DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  founded_year SMALLINT DEFAULT NULL,
  team_size VARCHAR(40) DEFAULT NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  review_count INT NOT NULL DEFAULT 0,
  featured_until DATE DEFAULT NULL,
  city_id INT UNSIGNED NOT NULL,
  state_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (city_id), INDEX (state_id), INDEX (status), INDEX (tier),
  CONSTRAINT fk_company_city  FOREIGN KEY (city_id)  REFERENCES cities(id),
  CONSTRAINT fk_company_state FOREIGN KEY (state_id) REFERENCES states(id),
  CONSTRAINT fk_company_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE company_services (
  company_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (company_id, category_id),
  CONSTRAINT fk_cs_company  FOREIGN KEY (company_id)  REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_cs_category FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE company_gallery (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id INT UNSIGNED NOT NULL,
  image VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_gallery_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Reviews & leads ----------
CREATE TABLE reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED DEFAULT NULL,
  author_name VARCHAR(120) NOT NULL,
  rating TINYINT NOT NULL,
  title VARCHAR(160) DEFAULT NULL,
  body TEXT,
  status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (company_id), INDEX (status),
  CONSTRAINT fk_review_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE leads (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40) DEFAULT NULL,
  message TEXT,
  status ENUM('NEW','CONTACTED','CONVERTED','ARCHIVED') NOT NULL DEFAULT 'NEW',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (company_id), INDEX (status),
  CONSTRAINT fk_lead_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Claims & payments ----------
CREATE TABLE company_owner_claims (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  message VARCHAR(500) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_claim_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_claim_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE plans (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  slug VARCHAR(80) NOT NULL UNIQUE,
  price DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  tier ENUM('FREE','BASIC','PREMIUM','FEATURED') NOT NULL DEFAULT 'FREE',
  features TEXT,
  active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payment_transactions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED DEFAULT NULL,
  company_id INT UNSIGNED DEFAULT NULL,
  plan_id INT UNSIGNED DEFAULT NULL,
  provider ENUM('STRIPE','PAYPAL','PAYONEER','MANUAL') NOT NULL DEFAULT 'MANUAL',
  status ENUM('PENDING','COMPLETED','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  amount DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  reference VARCHAR(190) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Content ----------
CREATE TABLE blog_categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE blog_posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED DEFAULT NULL,
  author_id INT UNSIGNED DEFAULT NULL,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  excerpt VARCHAR(300) DEFAULT NULL,
  body MEDIUMTEXT,
  image VARCHAR(255) DEFAULT NULL,
  status ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  published_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  body MEDIUMTEXT,
  status ENUM('DRAFT','PUBLISHED') NOT NULL DEFAULT 'PUBLISHED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE media (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(190) NOT NULL,
  path VARCHAR(255) NOT NULL,
  mime VARCHAR(100) DEFAULT NULL,
  size INT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE settings (
  `key` VARCHAR(120) NOT NULL PRIMARY KEY,
  `value` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  SEED DATA
-- ============================================================

-- Users (admin + a demo company owner). Password for both: admin123!
INSERT INTO users (id, name, email, password, role) VALUES
(1,'Site Admin','admin@dentalbillingcompany.us','$2b$10$Ek.nFXzjzuKGPg31k802Ie8Hp2z1T6hdHTKfHVk/zNRsYYcNHaCry','ADMIN'),
(2,'Demo Owner','owner@dentalbillingcompany.us','$2b$10$Ek.nFXzjzuKGPg31k802Ie8Hp2z1T6hdHTKfHVk/zNRsYYcNHaCry','COMPANY_OWNER');

-- 50 states
INSERT INTO states (id,name,slug,abbreviation) VALUES
(1,'Alabama','alabama','AL'),(2,'Alaska','alaska','AK'),(3,'Arizona','arizona','AZ'),
(4,'Arkansas','arkansas','AR'),(5,'California','california','CA'),(6,'Colorado','colorado','CO'),
(7,'Connecticut','connecticut','CT'),(8,'Delaware','delaware','DE'),(9,'Florida','florida','FL'),
(10,'Georgia','georgia','GA'),(11,'Hawaii','hawaii','HI'),(12,'Idaho','idaho','ID'),
(13,'Illinois','illinois','IL'),(14,'Indiana','indiana','IN'),(15,'Iowa','iowa','IA'),
(16,'Kansas','kansas','KS'),(17,'Kentucky','kentucky','KY'),(18,'Louisiana','louisiana','LA'),
(19,'Maine','maine','ME'),(20,'Maryland','maryland','MD'),(21,'Massachusetts','massachusetts','MA'),
(22,'Michigan','michigan','MI'),(23,'Minnesota','minnesota','MN'),(24,'Mississippi','mississippi','MS'),
(25,'Missouri','missouri','MO'),(26,'Montana','montana','MT'),(27,'Nebraska','nebraska','NE'),
(28,'Nevada','nevada','NV'),(29,'New Hampshire','new-hampshire','NH'),(30,'New Jersey','new-jersey','NJ'),
(31,'New Mexico','new-mexico','NM'),(32,'New York','new-york','NY'),(33,'North Carolina','north-carolina','NC'),
(34,'North Dakota','north-dakota','ND'),(35,'Ohio','ohio','OH'),(36,'Oklahoma','oklahoma','OK'),
(37,'Oregon','oregon','OR'),(38,'Pennsylvania','pennsylvania','PA'),(39,'Rhode Island','rhode-island','RI'),
(40,'South Carolina','south-carolina','SC'),(41,'South Dakota','south-dakota','SD'),(42,'Tennessee','tennessee','TN'),
(43,'Texas','texas','TX'),(44,'Utah','utah','UT'),(45,'Vermont','vermont','VT'),
(46,'Virginia','virginia','VA'),(47,'Washington','washington','WA'),(48,'West Virginia','west-virginia','WV'),
(49,'Wisconsin','wisconsin','WI'),(50,'Wyoming','wyoming','WY');

-- Cities (subset that hosts our seeded companies)
INSERT INTO cities (id,state_id,name,slug) VALUES
(1,5,'Los Angeles','los-angeles'),(2,5,'San Diego','san-diego'),(3,5,'San Francisco','san-francisco'),(4,5,'Sacramento','sacramento'),
(5,43,'Houston','houston'),(6,43,'Dallas','dallas'),(7,43,'Austin','austin'),(8,43,'San Antonio','san-antonio'),
(9,9,'Miami','miami'),(10,9,'Orlando','orlando'),(11,9,'Tampa','tampa'),(12,9,'Jacksonville','jacksonville'),
(13,32,'New York','new-york'),(14,32,'Buffalo','buffalo'),(15,32,'Rochester','rochester'),
(16,13,'Chicago','chicago'),(17,13,'Naperville','naperville'),
(18,10,'Atlanta','atlanta'),(19,10,'Savannah','savannah'),
(20,3,'Phoenix','phoenix'),(21,3,'Tucson','tucson'),
(22,38,'Philadelphia','philadelphia'),(23,38,'Pittsburgh','pittsburgh'),
(24,35,'Columbus','columbus'),(25,35,'Cleveland','cleveland'),
(26,33,'Charlotte','charlotte'),(27,33,'Raleigh','raleigh'),
(28,47,'Seattle','seattle'),(29,47,'Spokane','spokane'),
(30,6,'Denver','denver'),(31,6,'Colorado Springs','colorado-springs');

-- 12 service categories
INSERT INTO service_categories (id,name,slug,description,icon,sort_order) VALUES
(1,'Insurance Verification','insurance-verification','Confirm patient coverage before treatment','🔍',1),
(2,'Claims Submission','claims-submission','Accurate, timely electronic claims','📤',2),
(3,'Payment Posting','payment-posting','Post insurance and patient payments','💳',3),
(4,'Accounts Receivable','accounts-receivable','Follow up and recover aging claims','📊',4),
(5,'Denial Management','denial-management','Appeal and resolve denied claims','🛡️',5),
(6,'Patient Billing','patient-billing','Statements and patient balance support','🧾',6),
(7,'Credentialing','credentialing','Provider enrollment and credentialing','📋',7),
(8,'Coding & Audits','coding-audits','CDT coding accuracy and audits','🧮',8),
(9,'Eligibility Checks','eligibility-checks','Real-time eligibility verification','✅',9),
(10,'Out-of-Network Billing','out-of-network-billing','Maximize OON reimbursements','🌐',10),
(11,'Practice Analytics','practice-analytics','Revenue dashboards and reporting','📈',11),
(12,'Full-Service RCM','full-service-rcm','End-to-end revenue cycle management','⚙️',12);

-- 4 plans
INSERT INTO plans (id,name,slug,price,tier,features,active) VALUES
(1,'Free','free',0.00,'FREE','Basic listing|1 service category|Standard placement',1),
(2,'Basic','basic',29.00,'BASIC','Everything in Free|Up to 5 categories|Company logo|Contact button',1),
(3,'Premium','premium',79.00,'PREMIUM','Everything in Basic|Unlimited categories|Photo gallery|Lead capture|Priority placement',1),
(4,'Featured','featured',149.00,'FEATURED','Everything in Premium|Featured badge|Top of search results|Homepage spotlight|Analytics',1);

-- Companies
INSERT INTO companies (id,owner_id,name,slug,status,tier,short_description,description,website,phone,email,founded_year,team_size,rating,review_count,city_id,state_id) VALUES
(1,2,'Apex Dental Billing Solutions','apex-dental-billing-solutions','ACTIVE','FEATURED','Full-service dental RCM for growing practices','Apex Dental Billing Solutions delivers end-to-end revenue cycle management for dental practices, from insurance verification to denial management. Our certified team helps practices collect more, faster.','https://example.com','(213) 555-0101','hello@apexdental.example',2014,'25-50','4.9',128,1,5),
(2,NULL,'PrecisionRCM Dental','precisionrcm-dental','ACTIVE','PREMIUM','Accuracy-first dental claims management','PrecisionRCM specializes in clean claim submission and aggressive A/R follow-up so your practice gets paid on the first pass.','https://example.com','(619) 555-0102','team@precisionrcm.example',2017,'10-25','4.7',86,2,5),
(3,NULL,'BrightClaim Dental Billing','brightclaim-dental-billing','ACTIVE','FEATURED','Brighter cash flow for Texas practices','BrightClaim handles the entire billing cycle so dentists can focus on patients. Verification, coding, submission, and appeals under one roof.','https://example.com','(713) 555-0103','info@brightclaim.example',2012,'25-50','4.8',102,5,43),
(4,NULL,'Lone Star Dental Billing','lone-star-dental-billing','ACTIVE','BASIC','Dependable billing for Dallas-area offices','Lone Star Dental Billing provides reliable claims and patient billing services with a personal touch.','https://example.com','(214) 555-0104','contact@lonestardb.example',2019,'1-10','4.5',54,6,43),
(5,NULL,'Sunshine Dental Billing Co.','sunshine-dental-billing-co','ACTIVE','PREMIUM','Florida’s friendly dental billing partner','Sunshine Dental Billing helps practices across Florida reduce aging A/R and improve collections with transparent reporting.','https://example.com','(305) 555-0105','hello@sunshinedb.example',2016,'10-25','4.6',73,9,9),
(6,NULL,'Empire Dental RCM','empire-dental-rcm','ACTIVE','FEATURED','Premium revenue cycle for NY practices','Empire Dental RCM offers white-glove revenue cycle management for high-volume dental groups across New York.','https://example.com','(212) 555-0106','accounts@empirercm.example',2011,'50-100','4.9',154,13,32),
(7,NULL,'Windy City Dental Billing','windy-city-dental-billing','ACTIVE','PREMIUM','Chicago’s dental billing experts','Windy City Dental Billing combines technology and expertise to maximize reimbursements for Midwest practices.','https://example.com','(312) 555-0107','team@windycitydb.example',2015,'10-25','4.7',91,16,13),
(8,NULL,'Peachtree Dental Billing','peachtree-dental-billing','ACTIVE','BASIC','Southern service, serious results','Peachtree Dental Billing supports Georgia practices with friendly, accurate billing and clear monthly reporting.','https://example.com','(404) 555-0108','hello@peachtreedb.example',2018,'1-10','4.4',40,18,10),
(9,NULL,'Desert Dental Billing','desert-dental-billing','ACTIVE','FREE','Straightforward billing in Arizona','Desert Dental Billing offers core claims and verification services for solo and small dental practices.','https://example.com','(602) 555-0109','info@desertdb.example',2020,'1-10','4.3',28,20,3),
(10,NULL,'Liberty Dental Billing','liberty-dental-billing','ACTIVE','PREMIUM','Independence from billing headaches','Liberty Dental Billing manages the full revenue cycle for Pennsylvania practices with a focus on denial prevention.','https://example.com','(215) 555-0110','team@libertydb.example',2013,'25-50','4.6',65,22,38),
(11,NULL,'Buckeye Dental Billing','buckeye-dental-billing','ACTIVE','BASIC','Ohio’s practical billing partner','Buckeye Dental Billing delivers dependable claims management and patient billing for practices across Ohio.','https://example.com','(614) 555-0111','hello@buckeyedb.example',2017,'1-10','4.5',47,24,35),
(12,NULL,'Carolina Dental RCM','carolina-dental-rcm','ACTIVE','PREMIUM','Revenue cycle made simple','Carolina Dental RCM helps North Carolina practices improve collections with proactive A/R and analytics.','https://example.com','(704) 555-0112','contact@carolinarcm.example',2016,'10-25','4.7',70,26,33),
(13,2,'Emerald City Dental Billing','emerald-city-dental-billing','ACTIVE','FEATURED','Pacific Northwest dental billing leaders','Emerald City Dental Billing provides premium revenue cycle management with real-time dashboards for Washington practices.','https://example.com','(206) 555-0113','hello@emeraldcitydb.example',2014,'25-50','4.8',110,28,47),
(14,NULL,'Mile High Dental Billing','mile-high-dental-billing','ACTIVE','BASIC','Elevated billing for Colorado','Mile High Dental Billing supports Denver-area practices with accurate claims and friendly patient billing.','https://example.com','(303) 555-0114','team@milehighdb.example',2019,'1-10','4.5',52,30,6),
(15,NULL,'Bay Area Dental Billing','bay-area-dental-billing','ACTIVE','PREMIUM','Tech-forward dental RCM','Bay Area Dental Billing pairs experienced billers with modern tooling to maximize reimbursements for Northern California practices.','https://example.com','(415) 555-0115','hello@bayareadb.example',2015,'10-25','4.7',88,3,5),
(16,NULL,'Capital Dental Billing','capital-dental-billing','ACTIVE','FREE','Essential billing for Austin practices','Capital Dental Billing offers core verification and claims submission for small practices in Central Texas.','https://example.com','(512) 555-0116','info@capitaldb.example',2021,'1-10','4.2',22,7,43),
(17,NULL,'Orlando Dental Billing Group','orlando-dental-billing-group','ACTIVE','BASIC','Central Florida billing specialists','Orlando Dental Billing Group helps practices reduce write-offs and improve collections with hands-on service.','https://example.com','(407) 555-0117','hello@orlandodbg.example',2018,'1-10','4.4',38,10,9),
(18,NULL,'Metro Dental Billing','metro-dental-billing','ACTIVE','FREE','Simple billing for San Antonio','Metro Dental Billing provides straightforward claims management for solo dentists in South Texas.','https://example.com','(210) 555-0118','team@metrodb.example',2021,'1-10','4.1',19,8,43),
(19,NULL,'Summit Dental RCM','summit-dental-rcm','ACTIVE','BASIC','Reach the summit of collections','Summit Dental RCM offers reliable revenue cycle support for practices in the Sacramento region.','https://example.com','(916) 555-0119','hello@summitrcm.example',2017,'1-10','4.5',44,4,5),
(20,NULL,'Coastal Dental Billing','coastal-dental-billing','ACTIVE','PREMIUM','Smooth billing along the Gulf Coast','Coastal Dental Billing delivers premium revenue cycle services with transparent reporting for Tampa-area practices.','https://example.com','(813) 555-0120','info@coastaldb.example',2016,'10-25','4.6',61,11,9);

-- Company services (a representative spread)
INSERT INTO company_services (company_id,category_id) VALUES
(1,1),(1,2),(1,4),(1,5),(1,12),
(2,2),(2,3),(2,4),(2,9),
(3,1),(3,2),(3,5),(3,12),
(4,2),(4,3),(4,6),
(5,1),(5,4),(5,6),(5,11),
(6,1),(6,2),(6,4),(6,5),(6,7),(6,12),
(7,2),(7,3),(7,4),(7,11),
(8,2),(8,6),(8,9),
(9,1),(9,2),
(10,2),(10,5),(10,8),(10,12),
(11,2),(11,3),(11,6),
(12,1),(12,4),(12,11),(12,12),
(13,1),(13,2),(13,4),(13,5),(13,11),(13,12),
(14,2),(14,3),(14,6),
(15,2),(15,4),(15,9),(15,11),
(16,1),(16,2),
(17,2),(17,6),(17,8),
(18,1),(18,2),
(19,2),(19,3),(19,4),
(20,1),(20,4),(20,5),(20,11);

-- A few approved reviews
INSERT INTO reviews (company_id,author_name,rating,title,body,status) VALUES
(1,'Dr. Lauren M.',5,'Collections up 22%','Apex took over our billing and within three months our collections jumped. Communication is excellent.','APPROVED'),
(1,'Office Manager, Westside Dental',5,'Hands-off and reliable','We barely think about billing anymore. They handle denials fast.','APPROVED'),
(3,'Dr. Raj P.',5,'Best decision we made','BrightClaim cleaned up our aging A/R and our first-pass acceptance is way up.','APPROVED'),
(6,'Dr. Steven K.',5,'White-glove service','Empire treats our group like a partner. Worth every penny.','APPROVED'),
(13,'Dr. Anita S.',5,'Love the dashboards','Real-time reporting from Emerald City keeps us in control of our numbers.','APPROVED');

-- CMS pages
INSERT INTO pages (title,slug,body,status) VALUES
('About Us','about','<p>DentalBilling.us is the trusted directory connecting dental practices with vetted dental billing companies across the United States.</p>','PUBLISHED'),
('Contact','contact','<p>Questions? Email us at hello@dentalbillingcompany.us and we will get back to you within one business day.</p>','PUBLISHED'),
('Privacy Policy','privacy-policy','<p>This Privacy Policy describes how we collect, use, and protect your information when you use DentalBilling.us.</p>','PUBLISHED'),
('Terms of Service','terms','<p>By using DentalBilling.us you agree to these Terms of Service.</p>','PUBLISHED');

-- Blog
INSERT INTO blog_categories (id,name,slug) VALUES
(1,'Billing Tips','billing-tips'),(2,'Practice Growth','practice-growth');

INSERT INTO blog_posts (category_id,author_id,title,slug,excerpt,body,status,published_at) VALUES
(1,1,'5 Ways to Reduce Dental Claim Denials','reduce-dental-claim-denials','Practical steps any practice can take to get claims paid on the first submission.','<p>Claim denials drain time and cash flow. Here are five proven ways to reduce them...</p>','PUBLISHED','2026-01-15 09:00:00'),
(2,1,'When Should a Dental Practice Outsource Billing?','when-to-outsource-dental-billing','Signs it is time to hand your revenue cycle to specialists.','<p>Outsourcing billing can transform a practice. Here is how to know when the time is right...</p>','PUBLISHED','2026-02-02 09:00:00');

-- Settings
INSERT INTO settings (`key`,`value`) VALUES
('site_name','DentalBilling.us'),
('site_tagline','Find trusted dental billing companies in the US'),
('contact_email','hello@dentalbillingcompany.us'),
('currency','USD'),
('reviews_require_approval','1');
