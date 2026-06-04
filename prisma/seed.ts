import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── US STATES ────────────────────────────────────────────────────────────────
const STATES = [
  { name: "Alabama", abbreviation: "AL", slug: "alabama" },
  { name: "Alaska", abbreviation: "AK", slug: "alaska" },
  { name: "Arizona", abbreviation: "AZ", slug: "arizona" },
  { name: "Arkansas", abbreviation: "AR", slug: "arkansas" },
  { name: "California", abbreviation: "CA", slug: "california" },
  { name: "Colorado", abbreviation: "CO", slug: "colorado" },
  { name: "Connecticut", abbreviation: "CT", slug: "connecticut" },
  { name: "Delaware", abbreviation: "DE", slug: "delaware" },
  { name: "District of Columbia", abbreviation: "DC", slug: "district-of-columbia" },
  { name: "Florida", abbreviation: "FL", slug: "florida" },
  { name: "Georgia", abbreviation: "GA", slug: "georgia" },
  { name: "Hawaii", abbreviation: "HI", slug: "hawaii" },
  { name: "Idaho", abbreviation: "ID", slug: "idaho" },
  { name: "Illinois", abbreviation: "IL", slug: "illinois" },
  { name: "Indiana", abbreviation: "IN", slug: "indiana" },
  { name: "Iowa", abbreviation: "IA", slug: "iowa" },
  { name: "Kansas", abbreviation: "KS", slug: "kansas" },
  { name: "Kentucky", abbreviation: "KY", slug: "kentucky" },
  { name: "Louisiana", abbreviation: "LA", slug: "louisiana" },
  { name: "Maine", abbreviation: "ME", slug: "maine" },
  { name: "Maryland", abbreviation: "MD", slug: "maryland" },
  { name: "Massachusetts", abbreviation: "MA", slug: "massachusetts" },
  { name: "Michigan", abbreviation: "MI", slug: "michigan" },
  { name: "Minnesota", abbreviation: "MN", slug: "minnesota" },
  { name: "Mississippi", abbreviation: "MS", slug: "mississippi" },
  { name: "Missouri", abbreviation: "MO", slug: "missouri" },
  { name: "Montana", abbreviation: "MT", slug: "montana" },
  { name: "Nebraska", abbreviation: "NE", slug: "nebraska" },
  { name: "Nevada", abbreviation: "NV", slug: "nevada" },
  { name: "New Hampshire", abbreviation: "NH", slug: "new-hampshire" },
  { name: "New Jersey", abbreviation: "NJ", slug: "new-jersey" },
  { name: "New Mexico", abbreviation: "NM", slug: "new-mexico" },
  { name: "New York", abbreviation: "NY", slug: "new-york" },
  { name: "North Carolina", abbreviation: "NC", slug: "north-carolina" },
  { name: "North Dakota", abbreviation: "ND", slug: "north-dakota" },
  { name: "Ohio", abbreviation: "OH", slug: "ohio" },
  { name: "Oklahoma", abbreviation: "OK", slug: "oklahoma" },
  { name: "Oregon", abbreviation: "OR", slug: "oregon" },
  { name: "Pennsylvania", abbreviation: "PA", slug: "pennsylvania" },
  { name: "Rhode Island", abbreviation: "RI", slug: "rhode-island" },
  { name: "South Carolina", abbreviation: "SC", slug: "south-carolina" },
  { name: "South Dakota", abbreviation: "SD", slug: "south-dakota" },
  { name: "Tennessee", abbreviation: "TN", slug: "tennessee" },
  { name: "Texas", abbreviation: "TX", slug: "texas" },
  { name: "Utah", abbreviation: "UT", slug: "utah" },
  { name: "Vermont", abbreviation: "VT", slug: "vermont" },
  { name: "Virginia", abbreviation: "VA", slug: "virginia" },
  { name: "Washington", abbreviation: "WA", slug: "washington" },
  { name: "West Virginia", abbreviation: "WV", slug: "west-virginia" },
  { name: "Wisconsin", abbreviation: "WI", slug: "wisconsin" },
  { name: "Wyoming", abbreviation: "WY", slug: "wyoming" },
];

// ─── CITIES ───────────────────────────────────────────────────────────────────
const CITIES: { name: string; slug: string; stateAbbr: string; population?: number; latitude?: number; longitude?: number }[] = [
  { name: "New York", slug: "new-york", stateAbbr: "NY", population: 8336817, latitude: 40.7128, longitude: -74.006 },
  { name: "Los Angeles", slug: "los-angeles", stateAbbr: "CA", population: 3979576, latitude: 34.0522, longitude: -118.2437 },
  { name: "Chicago", slug: "chicago", stateAbbr: "IL", population: 2693976, latitude: 41.8781, longitude: -87.6298 },
  { name: "Houston", slug: "houston", stateAbbr: "TX", population: 2304580, latitude: 29.7604, longitude: -95.3698 },
  { name: "Phoenix", slug: "phoenix", stateAbbr: "AZ", population: 1608139, latitude: 33.4484, longitude: -112.074 },
  { name: "Philadelphia", slug: "philadelphia", stateAbbr: "PA", population: 1584064, latitude: 39.9526, longitude: -75.1652 },
  { name: "San Antonio", slug: "san-antonio", stateAbbr: "TX", population: 1434625, latitude: 29.4241, longitude: -98.4936 },
  { name: "San Diego", slug: "san-diego", stateAbbr: "CA", population: 1386932, latitude: 32.7157, longitude: -117.1611 },
  { name: "Dallas", slug: "dallas", stateAbbr: "TX", population: 1304379, latitude: 32.7767, longitude: -96.797 },
  { name: "San Jose", slug: "san-jose", stateAbbr: "CA", population: 1013240, latitude: 37.3382, longitude: -121.8863 },
  { name: "Austin", slug: "austin", stateAbbr: "TX", population: 961855, latitude: 30.2672, longitude: -97.7431 },
  { name: "Jacksonville", slug: "jacksonville", stateAbbr: "FL", population: 911507, latitude: 30.3322, longitude: -81.6557 },
  { name: "San Francisco", slug: "san-francisco", stateAbbr: "CA", population: 883305, latitude: 37.7749, longitude: -122.4194 },
  { name: "Columbus", slug: "columbus", stateAbbr: "OH", population: 898553, latitude: 39.9612, longitude: -82.9988 },
  { name: "Charlotte", slug: "charlotte", stateAbbr: "NC", population: 885708, latitude: 35.2271, longitude: -80.8431 },
  { name: "Fort Worth", slug: "fort-worth", stateAbbr: "TX", population: 874168, latitude: 32.7555, longitude: -97.3308 },
  { name: "Indianapolis", slug: "indianapolis", stateAbbr: "IN", population: 867125, latitude: 39.7684, longitude: -86.1581 },
  { name: "Seattle", slug: "seattle", stateAbbr: "WA", population: 737255, latitude: 47.6062, longitude: -122.3321 },
  { name: "Denver", slug: "denver", stateAbbr: "CO", population: 715522, latitude: 39.7392, longitude: -104.9903 },
  { name: "Nashville", slug: "nashville", stateAbbr: "TN", population: 689447, latitude: 36.1627, longitude: -86.7816 },
  { name: "Oklahoma City", slug: "oklahoma-city", stateAbbr: "OK", population: 649021, latitude: 35.4676, longitude: -97.5164 },
  { name: "Baltimore", slug: "baltimore", stateAbbr: "MD", population: 585708, latitude: 39.2904, longitude: -76.6122 },
  { name: "Louisville", slug: "louisville", stateAbbr: "KY", population: 633045, latitude: 38.2527, longitude: -85.7585 },
  { name: "Portland", slug: "portland", stateAbbr: "OR", population: 652503, latitude: 45.5051, longitude: -122.675 },
  { name: "Las Vegas", slug: "las-vegas", stateAbbr: "NV", population: 641903, latitude: 36.1699, longitude: -115.1398 },
  { name: "Milwaukee", slug: "milwaukee", stateAbbr: "WI", population: 590157, latitude: 43.0389, longitude: -87.9065 },
  { name: "Albuquerque", slug: "albuquerque", stateAbbr: "NM", population: 564559, latitude: 35.0853, longitude: -106.6056 },
  { name: "Tucson", slug: "tucson", stateAbbr: "AZ", population: 542629, latitude: 32.2226, longitude: -110.9747 },
  { name: "Fresno", slug: "fresno", stateAbbr: "CA", population: 542107, latitude: 36.7378, longitude: -119.7871 },
  { name: "Sacramento", slug: "sacramento", stateAbbr: "CA", population: 513624, latitude: 38.5816, longitude: -121.4944 },
  { name: "Mesa", slug: "mesa", stateAbbr: "AZ", population: 496401, latitude: 33.4152, longitude: -111.8315 },
  { name: "Kansas City", slug: "kansas-city", stateAbbr: "MO", population: 495327, latitude: 39.0997, longitude: -94.5786 },
  { name: "Atlanta", slug: "atlanta", stateAbbr: "GA", population: 498715, latitude: 33.749, longitude: -84.388 },
  { name: "Omaha", slug: "omaha", stateAbbr: "NE", population: 478192, latitude: 41.2565, longitude: -95.9345 },
  { name: "Colorado Springs", slug: "colorado-springs", stateAbbr: "CO", population: 472688, latitude: 38.8339, longitude: -104.8214 },
  { name: "Raleigh", slug: "raleigh", stateAbbr: "NC", population: 467665, latitude: 35.7796, longitude: -78.6382 },
  { name: "Long Beach", slug: "long-beach", stateAbbr: "CA", population: 466742, latitude: 33.7701, longitude: -118.1937 },
  { name: "Virginia Beach", slug: "virginia-beach", stateAbbr: "VA", population: 459470, latitude: 36.8529, longitude: -75.978 },
  { name: "Minneapolis", slug: "minneapolis", stateAbbr: "MN", population: 429606, latitude: 44.9778, longitude: -93.265 },
  { name: "Tampa", slug: "tampa", stateAbbr: "FL", population: 399700, latitude: 27.9506, longitude: -82.4572 },
  { name: "New Orleans", slug: "new-orleans", stateAbbr: "LA", population: 383997, latitude: 29.9511, longitude: -90.0715 },
  { name: "Arlington", slug: "arlington", stateAbbr: "TX", population: 394266, latitude: 32.7357, longitude: -97.1081 },
  { name: "Bakersfield", slug: "bakersfield", stateAbbr: "CA", population: 380874, latitude: 35.3733, longitude: -119.0187 },
  { name: "Honolulu", slug: "honolulu", stateAbbr: "HI", population: 347397, latitude: 21.3069, longitude: -157.8583 },
  { name: "Anaheim", slug: "anaheim", stateAbbr: "CA", population: 346824, latitude: 33.8366, longitude: -117.9143 },
  { name: "Aurora", slug: "aurora", stateAbbr: "CO", population: 366623, latitude: 39.7294, longitude: -104.8319 },
  { name: "Santa Ana", slug: "santa-ana", stateAbbr: "CA", population: 310227, latitude: 33.7455, longitude: -117.8677 },
  { name: "Corpus Christi", slug: "corpus-christi", stateAbbr: "TX", population: 326586, latitude: 27.8006, longitude: -97.3964 },
  { name: "Riverside", slug: "riverside", stateAbbr: "CA", population: 331360, latitude: 33.9806, longitude: -117.3755 },
  { name: "Lexington", slug: "lexington", stateAbbr: "KY", population: 323780, latitude: 38.0406, longitude: -84.5037 },
  { name: "St. Louis", slug: "st-louis", stateAbbr: "MO", population: 301578, latitude: 38.627, longitude: -90.1994 },
  { name: "Pittsburgh", slug: "pittsburgh", stateAbbr: "PA", population: 302971, latitude: 40.4406, longitude: -79.9959 },
  { name: "Stockton", slug: "stockton", stateAbbr: "CA", population: 311526, latitude: 37.9577, longitude: -121.2908 },
  { name: "Saint Paul", slug: "saint-paul", stateAbbr: "MN", population: 308096, latitude: 44.9537, longitude: -93.09 },
  { name: "Cincinnati", slug: "cincinnati", stateAbbr: "OH", population: 309317, latitude: 39.1031, longitude: -84.512 },
  { name: "Anchorage", slug: "anchorage", stateAbbr: "AK", population: 291247, latitude: 61.2181, longitude: -149.9003 },
  { name: "Henderson", slug: "henderson", stateAbbr: "NV", population: 320189, latitude: 36.0395, longitude: -114.9817 },
  { name: "Greensboro", slug: "greensboro", stateAbbr: "NC", population: 299035, latitude: 36.0726, longitude: -79.792 },
  { name: "Plano", slug: "plano", stateAbbr: "TX", population: 288061, latitude: 33.0198, longitude: -96.6989 },
  { name: "Newark", slug: "newark", stateAbbr: "NJ", population: 281944, latitude: 40.7357, longitude: -74.1724 },
  { name: "Toledo", slug: "toledo", stateAbbr: "OH", population: 270871, latitude: 41.6639, longitude: -83.5552 },
  { name: "Orlando", slug: "orlando", stateAbbr: "FL", population: 307573, latitude: 28.5383, longitude: -81.3792 },
  { name: "Chula Vista", slug: "chula-vista", stateAbbr: "CA", population: 274492, latitude: 32.6401, longitude: -117.0842 },
  { name: "Irvine", slug: "irvine", stateAbbr: "CA", population: 307670, latitude: 33.6846, longitude: -117.8265 },
  { name: "Fort Wayne", slug: "fort-wayne", stateAbbr: "IN", population: 270402, latitude: 41.1306, longitude: -85.1289 },
  { name: "Jersey City", slug: "jersey-city", stateAbbr: "NJ", population: 292449, latitude: 40.7178, longitude: -74.0431 },
  { name: "Laredo", slug: "laredo", stateAbbr: "TX", population: 255205, latitude: 27.5064, longitude: -99.5075 },
  { name: "Madison", slug: "madison", stateAbbr: "WI", population: 269074, latitude: 43.0731, longitude: -89.4012 },
  { name: "Chandler", slug: "chandler", stateAbbr: "AZ", population: 261165, latitude: 33.3062, longitude: -111.8413 },
  { name: "Lubbock", slug: "lubbock", stateAbbr: "TX", population: 258862, latitude: 33.5779, longitude: -101.8552 },
  { name: "Scottsdale", slug: "scottsdale", stateAbbr: "AZ", population: 258069, latitude: 33.4942, longitude: -111.9261 },
  { name: "Reno", slug: "reno", stateAbbr: "NV", population: 255601, latitude: 39.5296, longitude: -119.8138 },
  { name: "Buffalo", slug: "buffalo", stateAbbr: "NY", population: 256304, latitude: 42.8864, longitude: -78.8784 },
  { name: "Gilbert", slug: "gilbert", stateAbbr: "AZ", population: 267918, latitude: 33.3528, longitude: -111.789 },
  { name: "Glendale", slug: "glendale", stateAbbr: "AZ", population: 248325, latitude: 33.5387, longitude: -112.1859 },
  { name: "North Las Vegas", slug: "north-las-vegas", stateAbbr: "NV", population: 262527, latitude: 36.1989, longitude: -115.1175 },
  { name: "Winston-Salem", slug: "winston-salem", stateAbbr: "NC", population: 247945, latitude: 36.0999, longitude: -80.2442 },
  { name: "Chesapeake", slug: "chesapeake", stateAbbr: "VA", population: 249422, latitude: 36.7682, longitude: -76.2875 },
  { name: "Norfolk", slug: "norfolk", stateAbbr: "VA", population: 238005, latitude: 36.8508, longitude: -76.2859 },
  { name: "Fremont", slug: "fremont", stateAbbr: "CA", population: 241110, latitude: 37.5485, longitude: -121.9886 },
  { name: "Garland", slug: "garland", stateAbbr: "TX", population: 239928, latitude: 32.9126, longitude: -96.6389 },
  { name: "Irving", slug: "irving", stateAbbr: "TX", population: 239798, latitude: 32.814, longitude: -96.9489 },
  { name: "Hialeah", slug: "hialeah", stateAbbr: "FL", population: 233339, latitude: 25.8576, longitude: -80.2781 },
  { name: "Richmond", slug: "richmond", stateAbbr: "VA", population: 226610, latitude: 37.5407, longitude: -77.436 },
  { name: "Baton Rouge", slug: "baton-rouge", stateAbbr: "LA", population: 220236, latitude: 30.4515, longitude: -91.1871 },
  { name: "Spokane", slug: "spokane", stateAbbr: "WA", population: 222081, latitude: 47.6588, longitude: -117.426 },
  { name: "Des Moines", slug: "des-moines", stateAbbr: "IA", population: 214237, latitude: 41.5868, longitude: -93.625 },
  { name: "Tacoma", slug: "tacoma", stateAbbr: "WA", population: 213418, latitude: 47.2529, longitude: -122.4443 },
  { name: "San Bernardino", slug: "san-bernardino", stateAbbr: "CA", population: 222101, latitude: 34.1083, longitude: -117.2898 },
  { name: "Modesto", slug: "modesto", stateAbbr: "CA", population: 218464, latitude: 37.6391, longitude: -120.9969 },
  { name: "Fontana", slug: "fontana", stateAbbr: "CA", population: 214547, latitude: 34.0922, longitude: -117.435 },
  { name: "Moreno Valley", slug: "moreno-valley", stateAbbr: "CA", population: 213517, latitude: 33.9425, longitude: -117.2297 },
  { name: "Fayetteville", slug: "fayetteville", stateAbbr: "NC", population: 208501, latitude: 35.0527, longitude: -78.8784 },
  { name: "Columbus", slug: "columbus-ga", stateAbbr: "GA", population: 194058, latitude: 32.4610, longitude: -84.9877 },
  { name: "Glendale", slug: "glendale-ca", stateAbbr: "CA", population: 196543, latitude: 34.1425, longitude: -118.2551 },
  { name: "Worcester", slug: "worcester", stateAbbr: "MA", population: 206518, latitude: 42.2626, longitude: -71.8023 },
  { name: "Little Rock", slug: "little-rock", stateAbbr: "AR", population: 202591, latitude: 34.7465, longitude: -92.2896 },
  { name: "Salt Lake City", slug: "salt-lake-city", stateAbbr: "UT", population: 200567, latitude: 40.7608, longitude: -111.891 },
  { name: "Tallahassee", slug: "tallahassee", stateAbbr: "FL", population: 196169, latitude: 30.4383, longitude: -84.2807 },
  { name: "Huntington Beach", slug: "huntington-beach", stateAbbr: "CA", population: 198711, latitude: 33.6595, longitude: -117.9988 },
  { name: "Fort Lauderdale", slug: "fort-lauderdale", stateAbbr: "FL", population: 182437, latitude: 26.1224, longitude: -80.1373 },
  { name: "Savannah", slug: "savannah", stateAbbr: "GA", population: 147780, latitude: 32.0835, longitude: -81.0998 },
  { name: "Miami", slug: "miami", stateAbbr: "FL", population: 467963, latitude: 25.7617, longitude: -80.1918 },
  { name: "Boston", slug: "boston", stateAbbr: "MA", population: 675647, latitude: 42.3601, longitude: -71.0589 },
  { name: "Memphis", slug: "memphis", stateAbbr: "TN", population: 651073, latitude: 35.1495, longitude: -90.0490 },
  { name: "San Tan Valley", slug: "san-tan-valley", stateAbbr: "AZ", population: 100000, latitude: 33.1881, longitude: -111.5537 },
  { name: "American Fork", slug: "american-fork", stateAbbr: "UT", population: 33696, latitude: 40.3769, longitude: -111.7957 },
  { name: "Downers Grove", slug: "downers-grove", stateAbbr: "IL", population: 50271, latitude: 41.8081, longitude: -88.0109 },
  { name: "Great Falls", slug: "great-falls", stateAbbr: "VA", population: 17000, latitude: 39.0048, longitude: -77.2869 },
  { name: "Uniondale", slug: "uniondale", stateAbbr: "NY", population: 24759, latitude: 40.7026, longitude: -73.5932 },
  { name: "Cheshire", slug: "cheshire", stateAbbr: "CT", population: 29261, latitude: 41.499, longitude: -72.9042 },
  { name: "Canton", slug: "canton", stateAbbr: "OH", population: 70447, latitude: 40.7989, longitude: -81.3784 },
  { name: "Tulsa", slug: "tulsa", stateAbbr: "OK", population: 413066, latitude: 36.154, longitude: -95.9928 },
  { name: "Syracuse", slug: "syracuse", stateAbbr: "NY", population: 148620, latitude: 43.0481, longitude: -76.1474 },
  { name: "Sioux Falls", slug: "sioux-falls", stateAbbr: "SD", population: 192517, latitude: 43.5446, longitude: -96.7311 },
  { name: "Edison", slug: "edison", stateAbbr: "NJ", population: 107588, latitude: 40.5188, longitude: -74.4121 },
  { name: "Springfield", slug: "springfield", stateAbbr: "IL", population: 114394, latitude: 39.7817, longitude: -89.6501 },
];

// ─── SERVICE CATEGORIES ───────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Insurance Billing", slug: "insurance-billing", icon: "Shield", color: "#06B6D4", sortOrder: 1 },
  { name: "Revenue Cycle Management", slug: "revenue-cycle-management", icon: "TrendingUp", color: "#10B981", sortOrder: 2 },
  { name: "Insurance Verification", slug: "insurance-verification", icon: "CheckCircle", color: "#3B82F6", sortOrder: 3 },
  { name: "Claims Processing", slug: "claims-processing", icon: "FileText", color: "#8B5CF6", sortOrder: 4 },
  { name: "AR Recovery", slug: "ar-recovery", icon: "DollarSign", color: "#F59E0B", sortOrder: 5 },
  { name: "Credentialing", slug: "credentialing", icon: "Award", color: "#EF4444", sortOrder: 6 },
  { name: "Denial Management", slug: "denial-management", icon: "AlertCircle", color: "#EC4899", sortOrder: 7 },
  { name: "Patient Billing", slug: "patient-billing", icon: "Users", color: "#14B8A6", sortOrder: 8 },
  { name: "Dental Coding", slug: "dental-coding", icon: "Code", color: "#6366F1", sortOrder: 9 },
  { name: "Practice Management", slug: "practice-management", icon: "Building2", color: "#0F172A", sortOrder: 10 },
  { name: "Payment Posting", slug: "payment-posting", icon: "CreditCard", color: "#059669", sortOrder: 11 },
  { name: "Accounting & Bookkeeping", slug: "accounting-bookkeeping", icon: "BookOpen", color: "#7C3AED", sortOrder: 12 },
];

// ─── PLANS ────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Free", slug: "free", tier: "FREE" as const, price: 0, billingCycle: "monthly",
    features: ["Basic listing", "3 service categories", "1 gallery photo", "Contact form"],
    maxGalleryImages: 1, maxServices: 3, sortOrder: 1,
  },
  {
    name: "Basic", slug: "basic", tier: "BASIC" as const, price: 29, billingCycle: "monthly",
    features: ["All Free features", "10 gallery photos", "All service categories", "Priority listing", "Analytics dashboard", "Email support"],
    maxGalleryImages: 10, maxServices: 99, sortOrder: 2,
  },
  {
    name: "Premium", slug: "premium", tier: "PREMIUM" as const, price: 79, billingCycle: "monthly",
    features: ["All Basic features", "Unlimited photos", "Verified badge", "Top of search results", "Response tracking", "Lead notifications", "Priority support"],
    maxGalleryImages: 999, maxServices: 99, isPopular: true, sortOrder: 3,
  },
  {
    name: "Featured", slug: "featured", tier: "FEATURED" as const, price: 149, billingCycle: "monthly",
    features: ["All Premium features", "Homepage featured placement", "Gold border highlight", "Social media promotion", "Dedicated account manager", "Monthly performance report"],
    maxGalleryImages: 999, maxServices: 99, sortOrder: 4,
  },
];

// ─── DEFAULT SETTINGS ─────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = [
  { key: "site_name", value: "DentalBillingCompany.us", group: "general", label: "Site Name" },
  { key: "site_tagline", value: "Find the Best Dental Billing Company Near You", group: "general", label: "Site Tagline" },
  { key: "site_description", value: "The trusted directory of dental billing and revenue cycle management companies across all 50 US states.", group: "general", label: "Site Description" },
  { key: "site_logo", value: "", group: "general", label: "Site Logo" },
  { key: "site_favicon", value: "", group: "general", label: "Site Favicon" },
  { key: "contact_email", value: "admin@dentalbillingcompany.us", group: "general", label: "Contact Email" },
  { key: "google_analytics_id", value: "", group: "seo", label: "Google Analytics ID" },
  { key: "google_search_console", value: "", group: "seo", label: "Google Search Console Verification" },
  { key: "sitemap_enabled", value: "true", type: "boolean", group: "seo", label: "Sitemap Enabled" },
  { key: "robots_txt", value: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /dashboard/\nDisallow: /api/\nSitemap: https://dentalbillingcompany.us/sitemap.xml", group: "seo", label: "robots.txt Content" },
  { key: "stripe_public_key", value: "", group: "payments", label: "Stripe Publishable Key" },
  { key: "paypal_client_id", value: "", group: "payments", label: "PayPal Client ID" },
  { key: "payoneer_instructions", value: "To pay via Payoneer, send payment to billing@dentalbillingcompany.us and email us your transaction ID.", group: "payments", label: "Payoneer Payment Instructions" },
  { key: "primary_color", value: "#0F1F3D", group: "appearance", label: "Primary Color" },
  { key: "accent_color", value: "#06B6D4", group: "appearance", label: "Accent Color" },
  { key: "custom_css", value: "", group: "appearance", label: "Custom CSS" },
  { key: "header_scripts", value: "", group: "appearance", label: "Header Scripts" },
  { key: "footer_scripts", value: "", group: "appearance", label: "Footer Scripts" },
  { key: "maintenance_mode", value: "false", type: "boolean", group: "general", label: "Maintenance Mode" },
  { key: "reviews_require_approval", value: "true", type: "boolean", group: "general", label: "Reviews Require Approval" },
  { key: "allow_anonymous_reviews", value: "true", type: "boolean", group: "general", label: "Allow Anonymous Reviews" },
];

// ─── 50 REAL COMPANIES ────────────────────────────────────────────────────────
const COMPANIES_DATA = [
  {
    name: "eAssist Dental Solutions", slug: "eassist-dental-solutions",
    tagline: "The nation's largest dental billing company",
    description: "eAssist Dental Solutions is the nation's largest dental billing company, having collected over $19 billion from insurance companies for dental practices across the US. Founded in 2011, they specialize in insurance billing, patient statement services, dental accounting, and bookkeeping.",
    website: "https://dentalbilling.com", phone: "(844) 327-7478",
    citySlug: "american-fork", stateAbbr: "UT", yearFounded: 2011, employeeCount: "2000+",
    services: ["insurance-billing", "accounting-bookkeeping", "claims-processing", "patient-billing"],
  },
  {
    name: "Capline Dental Services", slug: "capline-dental-services",
    tagline: "Expert dental billing with 4.9 Google rating",
    description: "Capline Dental Services is a leading dental billing and revenue cycle management company based in Houston, TX. With a 4.9 Google rating and 12+ years of experience, they serve dental practices nationwide with comprehensive billing, credentialing, and collections services.",
    website: "https://caplinedentalservices.com", phone: "(888) 666-0604",
    citySlug: "houston", stateAbbr: "TX", yearFounded: 2015, employeeCount: "51-200",
    services: ["insurance-billing", "revenue-cycle-management", "credentialing", "ar-recovery"],
  },
  {
    name: "Dental Claim Support", slug: "dental-claim-support",
    tagline: "AI-powered dental billing with 99% first-pass clean claim rate",
    description: "Dental Claim Support (DCS) is a Savannah, GA-based dental billing company known for their AI-powered approach and industry-leading 99% first-pass clean claim rate. They offer insurance verification, credentialing, and special AR recovery projects.",
    website: "https://dentalclaimsupport.com", phone: "(912) 355-6100",
    citySlug: "savannah", stateAbbr: "GA", yearFounded: 2012, employeeCount: "51-200",
    services: ["insurance-billing", "insurance-verification", "credentialing", "ar-recovery", "revenue-cycle-management"],
  },
  {
    name: "Transcure", slug: "transcure",
    tagline: "1,100+ certified billers serving 40+ dental specialties",
    description: "Transcure is a comprehensive dental and medical billing company with over 1,100 certified billers and coders. Founded in 2002, they serve dental practices in California, Texas, New Jersey, New York, Florida, and Pennsylvania with a 99%+ first-pass clean claim rate.",
    website: "https://transcure.net", phone: "(888) 505-0582",
    citySlug: "dallas", stateAbbr: "TX", yearFounded: 2002, employeeCount: "1001-5000",
    services: ["insurance-billing", "dental-coding", "revenue-cycle-management", "claims-processing", "insurance-verification"],
  },
  {
    name: "Dental Revenue Group", slug: "dental-revenue-group",
    tagline: "Serving dental practices in all 50 US states since 2008",
    description: "Dental Revenue Group (DRG) is a comprehensive dental billing company with 1,000 dental billing experts. Based in Downers Grove, IL, they have served dental practices in all US states since 2008, specializing in revenue cycle management and AR recovery.",
    website: "https://mydentalrevenue.com", phone: "(630) 339-2714",
    citySlug: "downers-grove", stateAbbr: "IL", yearFounded: 2008, employeeCount: "1001-5000",
    services: ["revenue-cycle-management", "claims-processing", "ar-recovery", "insurance-billing", "insurance-verification"],
  },
  {
    name: "MedStates", slug: "medstates",
    tagline: "Trusted dental billing partner serving all US states",
    description: "MedStates is a New York-based dental billing and revenue cycle management company serving dental practices across all US states. They provide comprehensive billing, insurance verification, and accounts receivable management services.",
    website: "https://medstates.com",
    citySlug: "new-york", stateAbbr: "NY", yearFounded: 2017, employeeCount: "11-50",
    services: ["insurance-billing", "revenue-cycle-management", "insurance-verification", "claims-processing"],
  },
  {
    name: "Wisdom", slug: "wisdom-dental",
    tagline: "AI-powered dental revenue cycle management — $28M funded",
    description: "Wisdom is an AI-powered dental revenue cycle management platform that has raised $28 million in funding. Based in San Francisco, they use advanced AI to automate insurance verification, claims submission, patient billing, and denial management, helping practices increase revenue by 98%+.",
    website: "https://withwisdom.com",
    citySlug: "san-francisco", stateAbbr: "CA", yearFounded: 2023, employeeCount: "11-50",
    services: ["insurance-verification", "claims-processing", "denial-management", "patient-billing", "revenue-cycle-management"],
  },
  {
    name: "Medusind Solutions", slug: "medusind-solutions",
    tagline: "20+ years of dental billing expertise with 3,000+ professionals",
    description: "Medusind Solutions is a Miami-based dental and medical billing company with over 3,000 employees and 20+ years of expertise. They offer both onshore and offshore options for dental billing, coding, credentialing, and full revenue cycle management services.",
    website: "https://medusind.com", phone: "(877) 284-7362",
    citySlug: "miami", stateAbbr: "FL", yearFounded: 2002, employeeCount: "1001-5000",
    services: ["insurance-billing", "dental-coding", "credentialing", "revenue-cycle-management", "claims-processing"],
  },
  {
    name: "EZ Dental Billing", slug: "ez-dental-billing",
    tagline: "Serving 1,000+ dentists with 25% average revenue increase",
    description: "EZ Dental Billing is a Boston-based dental billing company serving over 1,000 dentists across the United States. Founded in 2010, they have consistently delivered a 25% average revenue increase for their dental practice clients through comprehensive billing and payment processing services.",
    website: "https://ezdentalbilling.com", phone: "(833) 368-9468",
    citySlug: "boston", stateAbbr: "MA", yearFounded: 2010, employeeCount: "51-200",
    services: ["insurance-billing", "payment-posting", "claims-processing", "insurance-verification"],
  },
  {
    name: "Dentistry Support", slug: "dentistry-support",
    tagline: "Flat-rate dental billing with 24/7 support",
    description: "Dentistry Support is an Arizona-based dental billing company known for their transparent flat-rate pricing model and round-the-clock customer support. They specialize in dental billing, eligibility verification, and claims cleanup for practices of all sizes.",
    website: "https://dentistrysupport.com",
    citySlug: "san-tan-valley", stateAbbr: "AZ", yearFounded: 2005, employeeCount: "11-50",
    services: ["insurance-billing", "insurance-verification", "claims-processing", "ar-recovery"],
  },
  {
    name: "Outsource Strategies International", slug: "outsource-strategies-international",
    tagline: "Comprehensive dental billing since 2002 covering all specialties",
    description: "Outsource Strategies International (OSI) is a Tulsa, OK-based dental billing company founded in 2002. They provide comprehensive dental billing, AR management, and credentialing services covering all dental specialties including orthodontics, periodontics, endodontics, and oral surgery.",
    website: "https://outsourcestrategies.com", phone: "(800) 670-2809",
    citySlug: "tulsa", stateAbbr: "OK", yearFounded: 2002, employeeCount: "51-200",
    services: ["insurance-billing", "ar-recovery", "credentialing", "claims-processing", "revenue-cycle-management"],
  },
  {
    name: "Prospa Billing", slug: "prospa-billing",
    tagline: "Connecticut dental billing specialists since 2011",
    description: "Prospa Billing is a Cheshire, CT-based dental billing company founded in 2011. They provide insurance verification, dental billing, insurance collections, and AR follow-up services for dental practices throughout the Northeast and nationwide.",
    website: "https://prospabilling.com", phone: "(844) 663-3686",
    citySlug: "cheshire", stateAbbr: "CT", yearFounded: 2011, employeeCount: "11-50",
    services: ["insurance-verification", "insurance-billing", "ar-recovery", "claims-processing"],
  },
  {
    name: "Dental Support Specialties", slug: "dental-support-specialties",
    tagline: "100+ practices supported with full billing and scheduling",
    description: "Dental Support Specialties (DSS) is based in Canton, OH, supporting 100+ dental practices with comprehensive billing, eligibility verification, accounts receivable recovery, call answering, and scheduling services. They serve practices in both the USA and Canada.",
    website: "https://dentalsupportspecialties.com",
    citySlug: "canton", stateAbbr: "OH", yearFounded: 2006, employeeCount: "51-200",
    services: ["insurance-billing", "insurance-verification", "ar-recovery", "practice-management"],
  },
  {
    name: "HMS USA", slug: "hms-usa",
    tagline: "99% claims success ratio with full RCM services",
    description: "HMS USA is a Virginia-based dental billing company with a 99% claims success ratio. They provide comprehensive dental billing, revenue cycle management, credentialing, and denial management services for dental practices across the United States.",
    website: "https://hmsgroupinc.com",
    citySlug: "great-falls", stateAbbr: "VA", yearFounded: 2010, employeeCount: "11-50",
    services: ["insurance-billing", "revenue-cycle-management", "credentialing", "denial-management"],
  },
  {
    name: "MedsDental", slug: "medsdental",
    tagline: "New York-based dental billing and credentialing experts",
    description: "MedsDental is a dental billing company founded in 2014 in Uniondale, New York. They specialize in dental billing, provider credentialing, and patient support services for dental practices throughout the New York metropolitan area and nationwide.",
    website: "https://medsdental.com",
    citySlug: "uniondale", stateAbbr: "NY", yearFounded: 2014, employeeCount: "11-50",
    services: ["insurance-billing", "credentialing", "patient-billing", "claims-processing"],
  },
  {
    name: "Dental Robot", slug: "dental-robot",
    tagline: "AI automation — 93% end-to-end, 400% ROI, 50-70% cost savings",
    description: "Dental Robot is a Miami-based AI-powered robotic process automation company for dental practices. They automate 93% of end-to-end revenue cycle processes, delivering 400% ROI and 50-70% cost savings through intelligent insurance verification, billing automation, and payment posting.",
    website: "https://dentalrobot.ai",
    citySlug: "miami", stateAbbr: "FL", yearFounded: 2019, employeeCount: "11-50",
    services: ["insurance-verification", "insurance-billing", "payment-posting", "claims-processing", "revenue-cycle-management"],
  },
  {
    name: "Accurio Health", slug: "accurio-health",
    tagline: "CFO-founded with 98% collections rate for multi-provider practices",
    description: "Accurio Health is an Austin, TX-based dental RCM company founded by experienced CFOs. They achieve a 98% collections rate for multi-provider practices and provide comprehensive revenue cycle management including insurance verification, claims, AR follow-up, accounting, and credentialing.",
    website: "https://accuriohealth.com",
    citySlug: "austin", stateAbbr: "TX", yearFounded: 2016, employeeCount: "11-50",
    services: ["revenue-cycle-management", "insurance-verification", "claims-processing", "ar-recovery", "credentialing", "accounting-bookkeeping"],
  },
  {
    name: "Medheave", slug: "medheave",
    tagline: "99% claim acceptance rate — Boston's dental billing experts",
    description: "Medheave is a Boston-based dental billing and revenue cycle management company with a 99% claim acceptance rate. They provide specialized dental billing, dental coding, and comprehensive revenue cycle management for dental practices nationwide.",
    website: "https://medheave.com", phone: "(888) 487-1178",
    citySlug: "boston", stateAbbr: "MA", yearFounded: 2015, employeeCount: "11-50",
    services: ["insurance-billing", "dental-coding", "revenue-cycle-management", "claims-processing"],
  },
  {
    name: "TransDental Billing", slug: "transdental-billing",
    tagline: "98%+ first-pass claim rate serving 14+ states",
    description: "TransDental Billing is a Texas-based dental billing company with a 98%+ first-pass claim rate. They serve dental practices in 14+ states, providing comprehensive dental billing, revenue cycle management, and claims processing services.",
    website: "https://transdentalbilling.com",
    citySlug: "dallas", stateAbbr: "TX", yearFounded: 2014, employeeCount: "11-50",
    services: ["insurance-billing", "revenue-cycle-management", "claims-processing", "ar-recovery"],
  },
  {
    name: "Operant Billing", slug: "operant-billing",
    tagline: "20+ years of outsourced dental billing excellence",
    description: "Operant Billing is a Charlotte, NC-based dental billing company with over 20 years of experience. They provide outsourced dental billing, credentialing, eligibility verification, and denial management services for dental practices of all sizes.",
    website: "https://operantbilling.com",
    citySlug: "charlotte", stateAbbr: "NC", yearFounded: 2004, employeeCount: "11-50",
    services: ["insurance-billing", "credentialing", "insurance-verification", "denial-management"],
  },
  {
    name: "Dental Billing Expert LLC", slug: "dental-billing-expert",
    tagline: "Remote dental insurance billing with nationwide coverage",
    description: "Dental Billing Expert LLC is a New Jersey-based dental billing company founded in 2017. They provide remote dental insurance billing, practice management consulting, and staff training services for dental practices in NJ, NY, VA, and nationwide.",
    website: "https://dentalbillingexpert.com",
    citySlug: "edison", stateAbbr: "NJ", yearFounded: 2017, employeeCount: "1-10",
    services: ["insurance-billing", "practice-management", "insurance-verification", "claims-processing"],
  },
  {
    name: "StafGo Health", slug: "stafgo-health",
    tagline: "15+ years of medical and dental billing expertise",
    description: "StafGo Health is a South Dakota-based revenue cycle management company with 15+ years of experience in medical and dental billing. They serve dental and medical practices across multiple states including South Dakota, Michigan, and Rhode Island.",
    website: "https://stafgo.com",
    citySlug: "sioux-falls", stateAbbr: "SD", yearFounded: 2009, employeeCount: "11-50",
    services: ["insurance-billing", "revenue-cycle-management", "claims-processing", "payment-posting"],
  },
  {
    name: "AnnexMed", slug: "annexmed",
    tagline: "20+ years serving solo practices, groups, and DSOs",
    description: "AnnexMed is a Nashville, TN-based dental RCM services company with over 20 years of experience. They provide comprehensive claims management, patient billing, and collections services for solo dental practices, group practices, and dental service organizations (DSOs).",
    website: "https://annexmed.com",
    citySlug: "nashville", stateAbbr: "TN", yearFounded: 2003, employeeCount: "51-200",
    services: ["revenue-cycle-management", "claims-processing", "patient-billing", "ar-recovery"],
  },
  {
    name: "Sirius Solutions Global", slug: "sirius-solutions-global",
    tagline: "AI-powered billing with 98%+ clean claims and predictable cash flow",
    description: "Sirius Solutions Global is a Phoenix-based dental billing company leveraging AI agents to deliver 98%+ clean claims and predictable cash flow. They specialize in AI-powered billing, claims submission, and denial recovery for modern dental practices.",
    website: "https://siriussolutionsglobal.com",
    citySlug: "phoenix", stateAbbr: "AZ", yearFounded: 2018, employeeCount: "11-50",
    services: ["insurance-billing", "claims-processing", "denial-management", "revenue-cycle-management"],
  },
  {
    name: "DayDream Dental", slug: "daydream-dental",
    tagline: "Full-service billing with automation and special project services",
    description: "DayDream Dental is a Portland, OR-based full-service dental billing company with a focus on automation and streamlined workflows. They provide comprehensive dental billing, insurance verification, and special project services for dental practices.",
    website: "https://daydream.dental",
    citySlug: "portland", stateAbbr: "OR", yearFounded: 2016, employeeCount: "11-50",
    services: ["insurance-billing", "insurance-verification", "claims-processing", "payment-posting"],
  },
  {
    name: "MediBillMD", slug: "medibillmd",
    tagline: "98% clean claims rate, 96% collection ratio, 50-state coverage",
    description: "MediBillMD is a Chicago-based dental billing company providing services across all 50 states. With a 98% clean claims rate and 96% collection ratio, they deliver up to 15% revenue growth for dental practices through comprehensive billing and revenue cycle management.",
    website: "https://medibillmd.com",
    citySlug: "chicago", stateAbbr: "IL", yearFounded: 2012, employeeCount: "51-200",
    services: ["insurance-billing", "revenue-cycle-management", "claims-processing", "patient-billing", "ar-recovery"],
  },
  {
    name: "Dental Billing Assist", slug: "dental-billing-assist",
    tagline: "No contracts, U.S.-based service with clean claim submission",
    description: "Dental Billing Assist is a Denver-based dental billing company that offers insurance verification, clean claim submission, payment posting, and denial reduction with no long-term contracts and US-based customer service. They serve dental practices nationwide.",
    website: "https://dentalbillingassist.com",
    citySlug: "denver", stateAbbr: "CO", yearFounded: 2015, employeeCount: "11-50",
    services: ["insurance-verification", "claims-processing", "payment-posting", "denial-management"],
  },
  {
    name: "iCoreConnect", slug: "icoreconnect",
    tagline: "Powering dental claims for 15,000+ practices nationwide",
    description: "iCoreConnect is an Orlando-based dental claims and billing platform powering over 15,000 dental practices. They provide comprehensive dental claims processing, insurance verification, e-prescribing, and analytics services through their iCoreClaims platform.",
    website: "https://icoreconnect.com",
    citySlug: "orlando", stateAbbr: "FL", yearFounded: 2013, employeeCount: "51-200",
    services: ["claims-processing", "insurance-verification", "insurance-billing", "payment-posting"],
  },
  {
    name: "DentalXChange", slug: "dentalxchange",
    tagline: "Nationwide network connectivity to all dental payers",
    description: "DentalXChange is a Los Angeles-based dental RCM platform with nationwide network connectivity to all dental payers. They provide dental claims submission, payment posting, claim follow-up, and comprehensive revenue cycle management services.",
    website: "https://dentalxchange.com",
    citySlug: "los-angeles", stateAbbr: "CA", yearFounded: 2001, employeeCount: "51-200",
    services: ["revenue-cycle-management", "claims-processing", "payment-posting", "insurance-billing"],
  },
  {
    name: "Vyne Dental", slug: "vyne-dental",
    tagline: "Bridging patients, practices, payers, and partners",
    description: "Vyne Dental is an Atlanta-based dental RCM platform that bridges patients, practices, payers, and partners. Through their Vyne Trellis revenue acceleration platform, they provide claims management, clearinghouse services, and comprehensive revenue cycle solutions.",
    website: "https://vynedental.com",
    citySlug: "atlanta", stateAbbr: "GA", yearFounded: 2014, employeeCount: "51-200",
    services: ["revenue-cycle-management", "claims-processing", "insurance-billing", "payment-posting"],
  },
  {
    name: "tab32", slug: "tab32",
    tagline: "Inc. 5000 cloud dental billing for 1,000+ practices",
    description: "tab32 is a San Jose-based cloud-native dental practice management company serving over 1,000 dental practices. As an Inc. 5000 honoree, they provide cloud-based scheduling, imaging, billing, and claims submission services.",
    website: "https://tab32.com",
    citySlug: "san-jose", stateAbbr: "CA", yearFounded: 2012, employeeCount: "51-200",
    services: ["insurance-billing", "claims-processing", "practice-management", "revenue-cycle-management"],
  },
  {
    name: "Dental Accounts at Ease", slug: "dental-accounts-at-ease",
    tagline: "Expanding globally — trusted dental billing from Las Vegas",
    description: "Dental Accounts at Ease is a Las Vegas-based dental billing company expanding internationally to Canada, UK, Australia, and New Zealand. They provide dental billing, practice management, and insurance verification services for dental practices.",
    website: "https://dentalbillingcompany.com",
    citySlug: "las-vegas", stateAbbr: "NV", yearFounded: 2008, employeeCount: "11-50",
    services: ["insurance-billing", "practice-management", "insurance-verification", "claims-processing"],
  },
  {
    name: "MedCare MSO", slug: "medcare-mso",
    tagline: "$105.7M revenue — 1,200+ billers with 98% first-pass claim rate",
    description: "MedCare MSO is a New York-based dental and medical billing company with over 1,200 billers and coders generating $105.7M in annual revenue. They deliver a 98% first-pass clean claim rate and 35% AR reduction for dental practices nationwide.",
    website: "https://medcaremso.com",
    citySlug: "new-york", stateAbbr: "NY", yearFounded: 2006, employeeCount: "1001-5000",
    services: ["insurance-billing", "revenue-cycle-management", "ar-recovery", "claims-processing"],
  },
  {
    name: "Zee Medical Billing", slug: "zee-medical-billing",
    tagline: "Medical and dental billing across 19 states",
    description: "Zee Medical Billing is a Philadelphia-based medical and dental billing company serving practices in 19 states including Pennsylvania, Ohio, Georgia, and Arizona. They provide comprehensive billing services for both medical and dental practices.",
    website: "https://zeemedical.com",
    citySlug: "philadelphia", stateAbbr: "PA", yearFounded: 2010, employeeCount: "11-50",
    services: ["insurance-billing", "claims-processing", "revenue-cycle-management", "payment-posting"],
  },
  {
    name: "Access Healthcare", slug: "access-healthcare",
    tagline: "25,000+ professionals — comprehensive healthcare RCM since 1998",
    description: "Access Healthcare is a Dallas-based healthcare revenue cycle management company with 25,000+ professionals. Since 1998, they have provided comprehensive RCM, appointment scheduling, eligibility verification, and claims filing services for healthcare and dental practices.",
    website: "https://accesshealthcare.net",
    citySlug: "dallas", stateAbbr: "TX", yearFounded: 1998, employeeCount: "10000+",
    services: ["revenue-cycle-management", "insurance-verification", "claims-processing", "ar-recovery"],
  },
  {
    name: "Dental Claim Cleanup", slug: "dental-claim-cleanup",
    tagline: "25+ years of dental billing and claims cleanup expertise",
    description: "Dental Claim Cleanup (DCC) is a Syracuse, NY-based dental billing company with 25+ years in the healthcare industry. They specialize in dental billing, claims cleanup, and revenue cycle management for dental practices with outstanding AR.",
    website: "https://dentalclaimcleanup.com",
    citySlug: "syracuse", stateAbbr: "NY", yearFounded: 1999, employeeCount: "11-50",
    services: ["insurance-billing", "claims-processing", "ar-recovery", "revenue-cycle-management"],
  },
  {
    name: "I-Med Claims", slug: "i-med-claims",
    tagline: "Affordable dental billing serving Illinois, Washington, and Colorado",
    description: "I-Med Claims is a Springfield, IL-based dental billing company offering affordable dental billing services primarily in Illinois, Washington, and Colorado. They provide comprehensive billing and claims processing for dental practices at competitive rates.",
    citySlug: "springfield", stateAbbr: "IL", yearFounded: 2011, employeeCount: "1-10",
    services: ["insurance-billing", "claims-processing", "payment-posting"],
  },
  {
    name: "Dental Billing Solutions Inc.", slug: "dental-billing-solutions-inc",
    tagline: "Minneapolis dental billing and revenue cycle specialists",
    description: "Dental Billing Solutions Inc. is a Minneapolis-based dental billing and revenue cycle management company serving dental practices in Minnesota and nationwide. Founded in 2013, they provide comprehensive billing solutions for dental practices of all sizes.",
    citySlug: "minneapolis", stateAbbr: "MN", yearFounded: 2013, employeeCount: "11-50",
    services: ["insurance-billing", "revenue-cycle-management", "claims-processing", "ar-recovery"],
  },
  {
    name: "Bond Dental Billing", slug: "bond-dental-billing",
    tagline: "Seattle dental billing with 600% growth in two years",
    description: "Bond Dental Billing is a Seattle-based dental billing company that achieved remarkable 600% growth in two years. They provide dental billing, revenue cycle management, and insurance follow-up services for dental practices in the Pacific Northwest and nationwide.",
    citySlug: "seattle", stateAbbr: "WA", yearFounded: 2019, employeeCount: "11-50",
    services: ["insurance-billing", "revenue-cycle-management", "insurance-verification", "denial-management"],
  },
  {
    name: "Star Billing Solutions", slug: "star-billing-solutions",
    tagline: "San Antonio medical and dental billing specialists",
    description: "Star Billing Solutions is a San Antonio, TX-based billing company specializing in both medical and dental practices. They provide revenue cycle management, billing software management, and practice management services for dental and medical practices throughout Texas.",
    website: "https://starbillingsolutions.com",
    citySlug: "san-antonio", stateAbbr: "TX", yearFounded: 2010, employeeCount: "11-50",
    services: ["insurance-billing", "revenue-cycle-management", "practice-management", "claims-processing"],
  },
  {
    name: "Dental Billing Company of Maryland", slug: "dental-billing-company-maryland",
    tagline: "Baltimore dental billing with comprehensive insurance verification",
    description: "Dental Billing Company of Maryland is a Baltimore-based dental billing company providing insurance billing, verification, and claims submission services for dental practices in Maryland, Virginia, and Washington DC area.",
    citySlug: "baltimore", stateAbbr: "MD", yearFounded: 2009, employeeCount: "11-50",
    services: ["insurance-billing", "insurance-verification", "claims-processing", "payment-posting"],
  },
  {
    name: "HMS Billing Services", slug: "hms-billing-services",
    tagline: "Sacramento dental billing with expert AR recovery",
    description: "HMS Billing Services is a Sacramento-based dental billing company providing dental billing, accounts receivable recovery, and credentialing services for dental practices throughout Northern California and beyond.",
    citySlug: "sacramento", stateAbbr: "CA", yearFounded: 2012, employeeCount: "11-50",
    services: ["insurance-billing", "ar-recovery", "credentialing", "claims-processing"],
  },
  {
    name: "Pacific Dental Billing", slug: "pacific-dental-billing",
    tagline: "Seattle dental billing and RCM specialists",
    description: "Pacific Dental Billing is a Seattle-based dental billing and revenue cycle management company serving dental practices in Washington, Oregon, and beyond since 2007. They specialize in insurance verification and comprehensive billing services.",
    citySlug: "seattle", stateAbbr: "WA", yearFounded: 2007, employeeCount: "11-50",
    services: ["insurance-billing", "revenue-cycle-management", "insurance-verification", "claims-processing"],
  },
  {
    name: "Premier Dental Billing", slug: "premier-dental-billing",
    tagline: "Memphis dental billing with full credentialing and AR management",
    description: "Premier Dental Billing is a Memphis, TN-based dental billing company providing full-service billing, credentialing, and accounts receivable management for dental practices throughout Tennessee and the Mid-South region.",
    citySlug: "memphis", stateAbbr: "TN", yearFounded: 2011, employeeCount: "11-50",
    services: ["insurance-billing", "credentialing", "ar-recovery", "claims-processing"],
  },
  {
    name: "Clarity Dental Billing", slug: "clarity-dental-billing",
    tagline: "St. Louis dental billing with transparent reporting",
    description: "Clarity Dental Billing is a St. Louis, MO-based dental billing company focused on transparent billing and detailed reporting. They provide billing, eligibility verification, payment posting, and comprehensive reporting for dental practices in Missouri and nationwide.",
    citySlug: "st-louis", stateAbbr: "MO", yearFounded: 2014, employeeCount: "11-50",
    services: ["insurance-billing", "insurance-verification", "payment-posting", "revenue-cycle-management"],
  },
  {
    name: "Apex Dental Revenue", slug: "apex-dental-revenue",
    tagline: "San Diego RCM with claims, AR recovery, and compliance",
    description: "Apex Dental Revenue is a San Diego-based dental revenue cycle management company specializing in claims processing, accounts receivable recovery, and billing compliance for dental practices throughout Southern California and nationwide.",
    citySlug: "san-diego", stateAbbr: "CA", yearFounded: 2016, employeeCount: "11-50",
    services: ["revenue-cycle-management", "claims-processing", "ar-recovery", "insurance-billing"],
  },
  {
    name: "Midwest Dental Billing", slug: "midwest-dental-billing",
    tagline: "Columbus, Ohio dental billing and denial management experts",
    description: "Midwest Dental Billing is a Columbus, OH-based dental billing company providing comprehensive billing, insurance verification, and denial management services for dental practices throughout Ohio and the Midwest region.",
    citySlug: "columbus", stateAbbr: "OH", yearFounded: 2008, employeeCount: "11-50",
    services: ["insurance-billing", "insurance-verification", "denial-management", "claims-processing"],
  },
  {
    name: "SunCoast Dental Billing", slug: "suncoast-dental-billing",
    tagline: "Tampa dental billing specialists with credentialing expertise",
    description: "SunCoast Dental Billing is a Tampa, FL-based dental billing company providing dental billing, credentialing, and patient billing services for dental practices throughout Florida. Founded in 2013, they serve solo and multi-location practices.",
    citySlug: "tampa", stateAbbr: "FL", yearFounded: 2013, employeeCount: "11-50",
    services: ["insurance-billing", "credentialing", "patient-billing", "claims-processing"],
  },
  {
    name: "Rocky Mountain Dental Billing", slug: "rocky-mountain-dental-billing",
    tagline: "Salt Lake City dental billing, coding, and RCM specialists",
    description: "Rocky Mountain Dental Billing is a Salt Lake City, UT-based dental billing company founded in 2015. They provide comprehensive dental billing, dental coding, revenue cycle management, and accounts receivable recovery services for dental practices in Utah and the Mountain West.",
    citySlug: "salt-lake-city", stateAbbr: "UT", yearFounded: 2015, employeeCount: "11-50",
    services: ["insurance-billing", "dental-coding", "revenue-cycle-management", "ar-recovery"],
  },
];

// ─── MAIN SEED FUNCTION ───────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Seed states
  console.log("  → Seeding states...");
  for (const state of STATES) {
    await prisma.state.upsert({
      where: { abbreviation: state.abbreviation },
      update: { name: state.name, slug: state.slug },
      create: { name: state.name, slug: state.slug, abbreviation: state.abbreviation },
    });
  }
  console.log(`  ✓ ${STATES.length} states seeded`);

  // 2. Seed cities
  console.log("  → Seeding cities...");
  for (const city of CITIES) {
    const state = await prisma.state.findUnique({ where: { abbreviation: city.stateAbbr } });
    if (!state) continue;
    await prisma.city.upsert({
      where: { slug_stateId: { slug: city.slug, stateId: state.id } },
      update: { name: city.name, population: city.population, latitude: city.latitude, longitude: city.longitude },
      create: {
        name: city.name, slug: city.slug, stateId: state.id,
        population: city.population, latitude: city.latitude, longitude: city.longitude,
      },
    });
  }
  console.log(`  ✓ ${CITIES.length} cities seeded`);

  // 3. Seed service categories
  console.log("  → Seeding service categories...");
  for (const cat of CATEGORIES) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, color: cat.color, sortOrder: cat.sortOrder },
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, color: cat.color, sortOrder: cat.sortOrder },
    });
  }
  console.log(`  ✓ ${CATEGORIES.length} service categories seeded`);

  // 4. Seed plans
  console.log("  → Seeding plans...");
  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: { name: plan.name, tier: plan.tier, price: plan.price, billingCycle: plan.billingCycle, features: plan.features, maxGalleryImages: plan.maxGalleryImages, maxServices: plan.maxServices, isPopular: plan.isPopular ?? false, sortOrder: plan.sortOrder },
      create: { name: plan.name, slug: plan.slug, tier: plan.tier, price: plan.price, billingCycle: plan.billingCycle, features: plan.features, maxGalleryImages: plan.maxGalleryImages, maxServices: plan.maxServices, isPopular: plan.isPopular ?? false, sortOrder: plan.sortOrder },
    });
  }
  console.log(`  ✓ ${PLANS.length} plans seeded`);

  // 5. Seed default settings
  console.log("  → Seeding settings...");
  for (const setting of DEFAULT_SETTINGS) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: { key: setting.key, value: setting.value, group: setting.group, label: setting.label, type: (setting as { type?: string }).type ?? "string" },
    });
  }
  console.log(`  ✓ ${DEFAULT_SETTINGS.length} settings seeded`);

  // 6. Seed admin user
  console.log("  → Seeding admin user...");
  const adminPassword = await bcrypt.hash("admin123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@dentalbillingcompany.us" },
    update: {},
    create: {
      email: "admin@dentalbillingcompany.us",
      password: adminPassword,
      name: "Admin",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log("  ✓ Admin user seeded (email: admin@dentalbillingcompany.us, password: admin123!)");

  // 7. Seed 50 companies
  console.log("  → Seeding 50 dental billing companies...");
  let companyCount = 0;
  for (const co of COMPANIES_DATA) {
    const state = await prisma.state.findUnique({ where: { abbreviation: co.stateAbbr } });
    if (!state) continue;

    const city = await prisma.city.findFirst({ where: { slug: co.citySlug, stateId: state.id } });

    const company = await prisma.company.upsert({
      where: { slug: co.slug },
      update: {},
      create: {
        slug: co.slug,
        name: co.name,
        tagline: co.tagline,
        description: co.description,
        website: co.website ?? null,
        phone: co.phone ?? null,
        cityId: city?.id ?? null,
        stateId: state.id,
        status: "ACTIVE",
        tier: "FREE",
        isVerified: false,
        isClaimed: false,
        isFeatured: false,
        yearFounded: co.yearFounded ?? null,
        employeeCount: co.employeeCount ?? null,
      },
    });

    // Assign service categories
    for (const svcSlug of co.services) {
      const cat = await prisma.serviceCategory.findUnique({ where: { slug: svcSlug } });
      if (!cat) continue;
      await prisma.companyService.upsert({
        where: { companyId_categoryId: { companyId: company.id, categoryId: cat.id } },
        update: {},
        create: { companyId: company.id, categoryId: cat.id },
      });
    }
    companyCount++;
  }
  console.log(`  ✓ ${companyCount} companies seeded`);

  // 8. Seed default CMS pages
  console.log("  → Seeding CMS pages...");
  const defaultPages = [
    { title: "About Us", slug: "about", content: "<h1>About DentalBillingCompany.us</h1><p>The trusted directory of dental billing and revenue cycle management companies.</p>", status: "PUBLISHED" as const },
    { title: "Contact", slug: "contact", content: "<h1>Contact Us</h1><p>Get in touch with our team.</p>", status: "PUBLISHED" as const },
    { title: "Privacy Policy", slug: "privacy-policy", content: "<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>", status: "PUBLISHED" as const },
    { title: "Terms of Service", slug: "terms", content: "<h1>Terms of Service</h1><p>By using our platform, you agree to these terms.</p>", status: "PUBLISHED" as const },
  ];
  for (const page of defaultPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: { title: page.title, slug: page.slug, content: page.content, status: page.status },
    });
  }
  console.log(`  ✓ ${defaultPages.length} default pages seeded`);

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📋 Summary:");
  console.log(`   Admin login: admin@dentalbillingcompany.us / admin123!`);
  console.log(`   Companies: ${companyCount} active listings ready`);
  console.log(`   To manage: visit /admin/companies`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
