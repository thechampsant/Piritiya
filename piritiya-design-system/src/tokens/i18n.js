// ─── PIRITIYA LANGUAGE SYSTEM ─────────────────────────────────────────────────
// All 8 supported languages with AWS service capability flags.

export const LANGUAGES = [
  { code: "hi-IN", short: "hi", script: "हिन्दी",   roman: "Hindi",     instant: true,  polly: true,  transcribeRT: true  },
  { code: "en-IN", short: "en", script: "English",   roman: "English",   instant: true,  polly: true,  transcribeRT: true  },
  { code: "bn-IN", short: "bn", script: "বাংলা",     roman: "Bengali",   instant: false, polly: false, transcribeRT: false },
  { code: "gu-IN", short: "gu", script: "ગુજરાતી",   roman: "Gujarati",  instant: false, polly: false, transcribeRT: false },
  { code: "kn-IN", short: "kn", script: "ಕನ್ನಡ",     roman: "Kannada",   instant: false, polly: false, transcribeRT: false },
  { code: "ml-IN", short: "ml", script: "മലയാളം",    roman: "Malayalam", instant: false, polly: false, transcribeRT: false },
  { code: "ta-IN", short: "ta", script: "தமிழ்",     roman: "Tamil",     instant: false, polly: false, transcribeRT: false },
  { code: "te-IN", short: "te", script: "తెలుగు",    roman: "Telugu",    instant: false, polly: false, transcribeRT: false },
];

// AWS Transcribe notes:
//   Real-time streaming: hi-IN, en-IN only
//   Batch (async):       all 8 languages
// AWS Polly notes:
//   Supported:           hi-IN (Kajal — Neural, best), en-IN (Aditi — bilingual hi+en)
//   Not supported:       bn, gu, kn, ml, ta, te → use Google TTS or Azure Cognitive
// AWS Translate:        all 8 languages supported

// ─── UI STRING TRANSLATIONS ───────────────────────────────────────────────────
// Add full translations for all 8 languages in production.
// Non-hi/en languages currently fall back to English UI strings.

const T = {
  hi: {
    appName:             "पिरितिया",
    onboardTitle:        "नमस्ते,\nकिसान भाई।",
    onboardSub:          "अपनी किसान आईडी डालें",
    onboardPlaceholder:  "जैसे: KSN-2024-001",
    onboardBtn:          "शुरू करें",
    onboardSkip:         "बिना ID के जारी रखें",
    onboardError:        "कृपया सही किसान ID डालें",
    placeholder:         "यहाँ टाइप करें...",
    voiceLabel:          "आवाज़",
    typeLabel:           "टाइप",
    send:                "भेजें",
    listening:           "सुन रहा हूँ…",
    speaking:            "बोल रहा हूँ…",
    online:              "ऑनलाइन",
    offline:             "ऑफलाइन",
    syncing:             "सिंक हो रहा है…",
    pendingBadge:        (n) => `${n} प्रतीक्षारत`,
    failedSync:          "सिंक विफल",
    batchDelay:          "भाषा परिवर्तन में 4 सेकंड लगेंगे",
    sessionRestored:     "पिछला सत्र वापस लाया गया",
    sessionExpired:      "नया सत्र शुरू हुआ",
    voiceUnsupportedFallback: "आवाज़ उपलब्ध नहीं — टाइप करें",
    voiceErrorRetry:     "ठीक है",
    quickActions:        ["मिट्टी की नमी", "फसल सलाह", "बाज़ार भाव", "मौसम"],
    navToday:            "आज",
    navExplore:          "खोजें",
    navEntries:          "रिकॉर्ड",
    navSettings:         "सेटिंग",
    settingsTitle:       "सेटिंग",
    settingsFarmerID:    "किसान ID",
    settingsSave:        "सहेजें",
    settingsLang:        "भाषा",
    settingsVoiceIn:     "आवाज़ इनपुट",
    settingsVoiceOut:    "आवाज़ आउटपुट",
    settingsStorage:     "स्टोरेज",
    settingsVersion:     "संस्करण",
    settingsClearCache:  "कैश साफ़ करें",
    settingsClearAll:    "सारा डेटा हटाएं",
    resetApp:            "ऐप रीसेट करें",
    settingsConfirmClear:"क्या आप सारा डेटा हटाना चाहते हैं?",
    confirmYes:          "हाँ, हटाएं",
    confirmNo:           "रद्द करें",
    soilMoisture:        "मिट्टी की नमी",
    cropRec:             "फसल सुझाव",
    marketPrices:        "बाज़ार भाव",
    perKg:               "प्रति किलो",
    exploreTitle:        "ज्ञान",
    exploreSubtitle:     "खेती की जानकारी",
    exploreAlertLabel:   "चेतावनी",
    exploreTrendingLabel:"ट्रेंडिंग",
    exploreTipLabel:     "सुझाव",
    exploreMinRead:      "मिनट",
    exploreReadMore:     "पढ़ें",
    exploreCategories:   ["सभी", "मिट्टी", "फसलें", "बाज़ार", "मौसम", "कीट"],
    newChat:             "नई बात",
    loading:             "सोच रहा हूँ…",
    diveBack:            "वापस जहाँ छोड़ा था",
    soilStatus:          ["बहुत कम", "कम", "सही", "अधिक"],
    online_status:       "ऑनलाइन",
  },

  en: {
    appName:             "Piritiya",
    onboardTitle:        "Hello,\nFarmer Friend.",
    onboardSub:          "Enter your Farmer ID",
    onboardPlaceholder:  "e.g. KSN-2024-001",
    onboardBtn:          "Get Started",
    onboardSkip:         "Continue without ID",
    onboardError:        "Please enter a valid Farmer ID",
    placeholder:         "Type here...",
    voiceLabel:          "Voice",
    typeLabel:           "Type",
    send:                "Send",
    listening:           "Listening…",
    speaking:            "Speaking…",
    online:              "Online",
    offline:             "Offline",
    syncing:             "Syncing…",
    pendingBadge:        (n) => `${n} pending`,
    failedSync:          "Sync failed",
    batchDelay:          "Language change takes ~4 seconds",
    sessionRestored:     "Session restored",
    sessionExpired:      "New session started",
    voiceUnsupportedFallback: "Voice unavailable — type instead",
    voiceErrorRetry:     "OK",
    quickActions:        ["soil moisture", "crop advice", "market prices", "weather"],
    navToday:            "today",
    navExplore:          "explore",
    navEntries:          "entries",
    navSettings:         "settings",
    settingsTitle:       "Settings",
    settingsFarmerID:    "Farmer ID",
    settingsSave:        "Save",
    settingsLang:        "Language",
    settingsVoiceIn:     "Voice Input",
    settingsVoiceOut:    "Voice Output",
    settingsStorage:     "Storage Used",
    settingsVersion:     "Version",
    settingsClearCache:  "Clear Cache",
    settingsClearAll:    "Clear All Data",
    resetApp:            "Reset App",
    settingsConfirmClear:"Delete all data?",
    confirmYes:          "Yes, delete",
    confirmNo:           "Cancel",
    soilMoisture:        "Soil Moisture",
    cropRec:             "Crop Recommendations",
    marketPrices:        "Market Prices",
    perKg:               "per kg",
    exploreTitle:        "Explore",
    exploreSubtitle:     "Farming knowledge",
    exploreAlertLabel:   "Alert",
    exploreTrendingLabel:"Trending",
    exploreTipLabel:     "Tip",
    exploreMinRead:      "min",
    exploreReadMore:     "Read more",
    exploreCategories:   ["All", "Soil", "Crops", "Market", "Weather", "Pests"],
    newChat:             "New chat",
    loading:             "Thinking…",
    diveBack:            "Continue where you left off",
    soilStatus:          ["Too dry", "Low", "Optimal", "Waterlogged"],
    online_status:       "Online",
  },
};

// Fallback: non-hi/en languages use English UI until translations are added
export const getTranslation = (lang) => T[lang] || T["en"];

// Devanagari numeral conversion (for Hindi UI)
export const toLocalNum = (n, lang) => {
  if (lang !== "hi") return String(n);
  return String(n).replace(/[0-9]/g, d => "०१२३४५६७८९"[d]);
};

export default T;
