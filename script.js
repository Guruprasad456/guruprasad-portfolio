const rotatingTitles = [
  "Intelligent Product Systems",
  "Machine Learning Workflows",
  "Data-Driven Interfaces",
  "Automation-Focused Solutions"
];

const titleElement = document.getElementById("rotating-role");
const metricElements = document.querySelectorAll("[data-target]");
const revealElements = document.querySelectorAll(".reveal");
const filterButtons = document.querySelectorAll(".filter-chip");
const projectCards = document.querySelectorAll(".project-card");
const navLinks = document.querySelectorAll(".site-nav a");
const sections = document.querySelectorAll("main section[id]");
const formButton = document.getElementById("contactButton");
const formNote = document.getElementById("formNote");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const interactiveElements = document.querySelectorAll("a, button, input, textarea, select, .filter-chip");
const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotClose = document.getElementById("chatbotClose");
const chatbotPanel = document.getElementById("chatbotPanel");
const chatbotWidget = document.getElementById("chatbotWidget");
const chatbotHeader = document.querySelector(".chatbot-header");
const chatbotMessages = document.getElementById("chatbotMessages");
const chatbotForm = document.getElementById("chatbotForm");
const chatbotInput = document.getElementById("chatbotInput");
const suggestionChips = document.querySelectorAll(".suggestion-chip");
const chatbotVoice = document.getElementById("chatbotVoice");
const chatbotPause = document.getElementById("chatbotPause");
const chatbotClear = document.getElementById("chatbotClear");
const voiceIntroButtons = document.querySelectorAll("[data-voice-intro]");
const heartDemoForm = document.getElementById("heartDemoForm");
const heartDemoReset = document.getElementById("heartDemoReset");
const heartFlaskFrame = document.getElementById("heartFlaskFrame");
const heartFlaskStatus = document.getElementById("heartFlaskStatus");
const heartFlaskLaunch = document.getElementById("heartFlaskLaunch");
const heartFlaskReload = document.getElementById("heartFlaskReload");
const heartFlaskFallback = document.getElementById("heartFlaskFallback");
const isLocalPortfolioHost = ["127.0.0.1", "localhost"].includes(window.location.hostname);
const isGitHubPagesHost = /\.github\.io$/i.test(window.location.hostname);
const useServerChat = window.location.protocol.startsWith("http") && !isGitHubPagesHost;
const isStaticPortfolioHost = window.location.protocol.startsWith("http") && isGitHubPagesHost;
const heartFlaskDirectUrl = "/heart-app/";
const themeButtons = document.querySelectorAll(".theme-chip");
const siteLoader = document.getElementById("siteLoader");
const initialChatbotMarkup = chatbotMessages ? chatbotMessages.innerHTML : "";
let latestBotReply = "";
const chatHistory = [];
let preferredVoice = null;
let activeAudioPlayer = null;
let activeAudioUrl = "";
let activeSpeechAbortController = null;
let chatbotDragState = null;
let chatbotResizeState = null;
let suppressChatbotToggleClick = false;
let activeSpeechButton = null;
let activeDragHandle = null;
let activeResizeHandle = null;
let activeSpeechRequestToken = 0;
let chatbotConversationContext = {
  activeProjectId: "",
  activeIntent: ""
};
const chatbotReplyVariantState = new Map();

const CHATBOT_MIN_WIDTH = 320;
const CHATBOT_MAX_WIDTH = 640;
const CHATBOT_MIN_HEIGHT = 360;
const CHATBOT_RESIZE_GUTTER = 18;
const CHATBOT_COMPACT_WIDTH = 390;
const CHATBOT_COMPACT_HEIGHT = 500;
const CHATBOT_MESSAGE_ZOOM_MIN = 0.65;
const CHATBOT_MESSAGE_ZOOM_MAX = 1.55;
const CHATBOT_MESSAGE_ZOOM_STEP = 0.1;
const ALLOWED_THEMES = ["theme-midnight", "theme-aurora", "theme-sunrise"];
const CHATBOT_SIZE_STORAGE_KEY = "portfolio-chatbot-size-v2";
const CHATBOT_MESSAGE_ZOOM_STORAGE_KEY = "portfolio-chatbot-message-zoom";
const CHATBOT_REPLY_CACHE_STORAGE_KEY = "portfolio-chatbot-replies-v3";
const CHATBOT_POSITION_STORAGE_KEY = "portfolio-chatbot-position-mobile-v7";
const CHATBOT_DESKTOP_POSITION_STORAGE_KEY = "portfolio-chatbot-position-desktop-v1";
const DEVICE_LAYOUT_STORAGE_KEY = "portfolio-device-layout";
const DEVICE_LAYOUT_SESSION_KEY = "portfolio-device-layout-session";
const CHATBOT_REPLY_CACHE_LIMIT = 40;
const CHATBOT_SERVER_TIMEOUT_MS = 45000;
const CHATBOT_TTS_TIMEOUT_MS = 45000;
const DEVICE_LAYOUT_BREAKPOINT = 900;
const DEVICE_LAYOUT_OPTIONS = ["layout-mobile-mode", "layout-laptop-mode"];
const CHATBOT_RESIZE_CURSORS = {
  top: "ns-resize",
  bottom: "ns-resize",
  left: "ew-resize",
  right: "ew-resize",
  "top-left": "nwse-resize",
  "bottom-right": "nwse-resize",
  "top-right": "nesw-resize",
  "bottom-left": "nesw-resize",
};
const chatbotReplyCache = loadChatbotReplyCache();
let currentHeartDemoState = null;
let deviceLayoutPrompt = null;
let deviceLayoutTrigger = null;
let demoWalkthroughOverlay = null;
let demoWalkthroughState = null;
const projectImageFallbacks = new Map([
  ["study-mood-app/study-mood-detector.svg", "study-mood-detector.svg"],
  ["diet-planner-app/diet-planner.svg", "diet-planner.svg"],
  ["playlist-generator-app/playlist-generator.svg", "playlist-generator.svg"]
]);

function hideSiteLoader() {
  if (!siteLoader) {
    return;
  }

  siteLoader.classList.add("is-hidden");
}

function initializeProjectImageFallbacks() {
  const projectImages = document.querySelectorAll(".project-image");

  projectImages.forEach((image) => {
    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    const originalSource = image.getAttribute("src") || "";
    const normalizedSource = originalSource.replace(/^\.?\//, "");
    const fallbackSource = projectImageFallbacks.get(normalizedSource);

    if (!fallbackSource) {
      return;
    }

    const applyFallback = () => {
      const currentSource = image.getAttribute("src") || "";
      if (currentSource === fallbackSource) {
        return;
      }
      image.setAttribute("src", fallbackSource);
    };

    image.addEventListener("error", applyFallback, { once: true });

    if (image.complete && image.naturalWidth === 0) {
      applyFallback();
    }
  });
}

if (siteLoader) {
  window.setTimeout(hideSiteLoader, 900);
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      window.setTimeout(hideSiteLoader, 120);
    },
    { once: true }
  );
}

function restorePageVisibilityState() {
  document.body.classList.remove("is-transitioning");
  document.body.style.removeProperty("opacity");
  document.body.style.removeProperty("transform");
  hideSiteLoader();
}

function loadChatbotReplyCache() {
  if (typeof window === "undefined" || !window.localStorage) {
    return new Map();
  }

  try {
    const rawCache = window.localStorage.getItem(CHATBOT_REPLY_CACHE_STORAGE_KEY);

    if (!rawCache) {
      return new Map();
    }

    const parsed = JSON.parse(rawCache);

    if (!Array.isArray(parsed)) {
      return new Map();
    }

    return new Map(parsed.filter((entry) => Array.isArray(entry) && entry.length === 2));
  } catch (error) {
    return new Map();
  }
}

function persistChatbotReplyCache() {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    const trimmedEntries = Array.from(chatbotReplyCache.entries()).slice(-CHATBOT_REPLY_CACHE_LIMIT);
    window.localStorage.setItem(CHATBOT_REPLY_CACHE_STORAGE_KEY, JSON.stringify(trimmedEntries));
  } catch (error) {
    return;
  }
}

function getCachedChatbotReply(input) {
  return "";
}

function setCachedChatbotReply(input, reply) {
  return;
}

function getCurrentPortfolioTheme() {
  if (document.body.classList.contains("theme-aurora")) {
    return "theme-aurora";
  }
  if (document.body.classList.contains("theme-sunrise")) {
    return "theme-sunrise";
  }
  return "theme-midnight";
}

function resolveThemeName(theme) {
  return ALLOWED_THEMES.includes(theme) ? theme : "theme-midnight";
}

function resolveDeviceLayout(layout) {
  return DEVICE_LAYOUT_OPTIONS.includes(layout) ? layout : "";
}

function getRecommendedDeviceLayout() {
  return window.innerWidth <= DEVICE_LAYOUT_BREAKPOINT ? "layout-mobile-mode" : "layout-laptop-mode";
}

function getStoredDeviceLayout() {
  try {
    return resolveDeviceLayout(localStorage.getItem(DEVICE_LAYOUT_STORAGE_KEY));
  } catch (error) {
    return "";
  }
}

function updateDeviceLayoutTrigger() {
  if (!deviceLayoutTrigger) {
    return;
  }

  const isMobileLayout = document.body.classList.contains("layout-mobile-mode");
  deviceLayoutTrigger.textContent = isMobileLayout ? "Mobile View" : "Laptop View";
}

function updateDeviceLayoutPromptSelection() {
  if (!deviceLayoutPrompt) {
    return;
  }

  const currentLayout = document.body.classList.contains("layout-mobile-mode")
    ? "layout-mobile-mode"
    : "layout-laptop-mode";
  const recommendedLayout = getRecommendedDeviceLayout();

  deviceLayoutPrompt.querySelectorAll("[data-layout-choice]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.layoutChoice === currentLayout);
    button.classList.toggle("is-recommended", button.dataset.layoutChoice === recommendedLayout);
  });

  const recommendation = deviceLayoutPrompt.querySelector("[data-layout-recommendation]");
  if (recommendation) {
    recommendation.textContent = recommendedLayout === "layout-mobile-mode"
      ? "Recommended right now: Mobile View"
      : "Recommended right now: Laptop View";
  }
}

function applyDeviceLayout(layout, options = {}) {
  const nextLayout = resolveDeviceLayout(layout) || getRecommendedDeviceLayout();
  document.body.classList.remove(...DEVICE_LAYOUT_OPTIONS);
  document.body.classList.add(nextLayout);
  document.body.dataset.deviceLayout = nextLayout === "layout-mobile-mode" ? "mobile" : "laptop";

  if (!options.skipStorage) {
    try {
      localStorage.setItem(DEVICE_LAYOUT_STORAGE_KEY, nextLayout);
    } catch (error) {
      // Ignore storage failures.
    }
  }

  if (nextLayout === "layout-mobile-mode" && typeof window !== "undefined") {
    document.body.classList.add("is-touch-layout");
  } else {
    document.body.classList.remove("is-touch-layout");
  }

  updateDeviceLayoutTrigger();
  updateDeviceLayoutPromptSelection();
  window.requestAnimationFrame(() => {
    syncChatbotDockState();
  });
  return nextLayout;
}

function closeDeviceLayoutPrompt() {
  if (!deviceLayoutPrompt) {
    return;
  }

  deviceLayoutPrompt.classList.remove("is-visible");
  document.body.classList.remove("has-device-layout-prompt");
  window.setTimeout(() => {
    if (deviceLayoutPrompt) {
      deviceLayoutPrompt.hidden = true;
    }
  }, 180);
}

function openDeviceLayoutPrompt() {
  if (!deviceLayoutPrompt) {
    return;
  }

  updateDeviceLayoutPromptSelection();
  deviceLayoutPrompt.hidden = false;
  document.body.classList.add("has-device-layout-prompt");
  window.requestAnimationFrame(() => {
    deviceLayoutPrompt.classList.add("is-visible");
  });
}

function ensureDeviceLayoutPrompt() {
  if (deviceLayoutPrompt) {
    return;
  }

  deviceLayoutPrompt = document.createElement("div");
  deviceLayoutPrompt.className = "device-layout-overlay";
  deviceLayoutPrompt.hidden = true;
  deviceLayoutPrompt.innerHTML = `
    <div class="device-layout-card" role="dialog" aria-modal="true" aria-labelledby="deviceLayoutTitle">
      <button class="device-layout-close" type="button" data-layout-close aria-label="Close view selection">×</button>
      <p class="device-layout-kicker">Choose your view</p>
      <h2 id="deviceLayoutTitle">How are you opening the portfolio?</h2>
      <p class="device-layout-copy">
        Pick the layout that matches your device. Mobile view keeps every page, section, chatbot, and demo more structured on smaller screens.
      </p>
      <p class="device-layout-recommendation" data-layout-recommendation></p>
      <div class="device-layout-grid">
        <button class="device-layout-choice" type="button" data-layout-choice="layout-mobile-mode">
          <span class="device-layout-icon" aria-hidden="true">📱</span>
          <strong>Mobile View</strong>
          <small>Single-column layout, larger tap targets, cleaner demo stacking.</small>
        </button>
        <button class="device-layout-choice" type="button" data-layout-choice="layout-laptop-mode">
          <span class="device-layout-icon" aria-hidden="true">💻</span>
          <strong>Laptop View</strong>
          <small>Wide layout, denser sections, and fuller desktop spacing.</small>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(deviceLayoutPrompt);

  deviceLayoutPrompt.querySelector("[data-layout-close]")?.addEventListener("click", () => {
    try {
      sessionStorage.setItem(DEVICE_LAYOUT_SESSION_KEY, "1");
    } catch (error) {
      // Ignore storage failures.
    }
    closeDeviceLayoutPrompt();
  });

  deviceLayoutPrompt.addEventListener("click", (event) => {
    if (event.target === deviceLayoutPrompt) {
      try {
        sessionStorage.setItem(DEVICE_LAYOUT_SESSION_KEY, "1");
      } catch (error) {
        // Ignore storage failures.
      }
      closeDeviceLayoutPrompt();
    }
  });

  deviceLayoutPrompt.querySelectorAll("[data-layout-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      applyDeviceLayout(button.dataset.layoutChoice);
      try {
        sessionStorage.setItem(DEVICE_LAYOUT_SESSION_KEY, "1");
      } catch (error) {
        // Ignore storage failures.
      }
      closeDeviceLayoutPrompt();
    });
  });
}

function ensureDeviceLayoutTrigger() {
  const headerActions = document.querySelector(".header-actions");
  if (!headerActions || deviceLayoutTrigger) {
    return;
  }

  deviceLayoutTrigger = document.createElement("button");
  deviceLayoutTrigger.type = "button";
  deviceLayoutTrigger.className = "button button-ghost layout-mode-trigger";
  deviceLayoutTrigger.addEventListener("click", () => {
    ensureDeviceLayoutPrompt();
    openDeviceLayoutPrompt();
  });

  headerActions.appendChild(deviceLayoutTrigger);
  updateDeviceLayoutTrigger();
}

function initializeDeviceLayoutPreference() {
  applyDeviceLayout(getStoredDeviceLayout(), { skipStorage: true });
  ensureDeviceLayoutTrigger();
  ensureDeviceLayoutPrompt();

  let askedThisSession = false;
  try {
    askedThisSession = sessionStorage.getItem(DEVICE_LAYOUT_SESSION_KEY) === "1";
  } catch (error) {
    askedThisSession = false;
  }

  if (!askedThisSession) {
    window.setTimeout(openDeviceLayoutPrompt, 160);
  }
}

function repairMojibakeText() {
  const fixes = [
    ["Ã¢â‚¬â„¢", "'"],
    ["Ã¢â‚¬â€œ", "-"],
    ["Ã¢â‚¬â€", "-"],
    ["Ã¢â‚¬Å“", '"'],
    ["Ã¢â‚¬ï¿½", '"'],
  ];

  document.querySelectorAll("p, li, span, strong, small, h1, h2, h3, h4, a, button").forEach((element) => {
    if (element.children.length) {
      return;
    }

    let nextText = element.textContent;

    fixes.forEach(([from, to]) => {
      nextText = nextText.replaceAll(from, to);
    });

    if (nextText !== element.textContent) {
      element.textContent = nextText;
    }
  });
}

function syncHeartFlaskTheme(theme) {
  if (heartFlaskLaunch) {
    heartFlaskLaunch.href = `${heartFlaskDirectUrl}?theme=${encodeURIComponent(theme)}`;
  }

  if (heartFlaskFrame && heartFlaskFrame.contentWindow) {
    heartFlaskFrame.contentWindow.postMessage(
      { type: "portfolio-theme", theme },
      "*"
    );
  }
}

const portfolioKnowledge = {
  profile: {
    name: "Guruprasad Potdar",
    title: "ML Developer and Data Scientist",
    bio: "Guruprasad Potdar is an ML Developer and Data Scientist passionate about Python, deep learning, and building AI solutions that solve real-world problems. He is currently focused on automated ML pipelines, practical AI systems, and digital products that people can actually use.",
    location: "Latur, Maharashtra, India",
    email: "gurupreasadpotdar1@gmail.com",
    github: "https://github.com/Guruprasad456",
    linkedin: "https://www.linkedin.com/in/guruprasad-potdar-9928173b7/"
  },
  skills: [
    "ML model development",
    "Data science",
    "Data analysis",
    "Advanced Python programming",
    "Deep learning",
    "Mobile application development",
    "Computer vision",
    "Automation workflows",
    "Real-life problem solving"
  ],
  projects: [
    {
      name: "Heart Disease Detection System",
      keywords: ["heart", "heart disease", "heart disease detection", "heart disease prediction", "healthcare", "flask", "random forest", "medical", "cardio", "screening"],
      description: "A clinician-style cardiovascular screening project that converts structured patient inputs into a heart-risk prediction through a real Flask web app.",
      features: [
        "Structured patient intake for clinical features",
        "Machine learning prediction workflow inside Flask",
        "Real-time heart-risk output with reviewable results",
        "Notebook, model, and app proof in one portfolio flow"
      ],
      technologies: ["Python", "Flask", "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "CSV dataset"]
    },
    {
      name: "AI Study Mood Detector",
      keywords: ["study mood", "study mood detector", "mood detector", "study detector", "student", "focus", "productivity", "camera", "computer vision"],
      description: "A productivity-oriented study assistant that maps image-dataset signals into broader focus states and turns them into live coaching guidance.",
      features: [
        "Optional camera-assisted readiness preview",
        "Focus-state mapping for focused, tired, distracted, and stressed sessions",
        "Study-goal parsing and coaching output",
        "Actionable break, sprint, and environment guidance"
      ],
      technologies: ["Python", "Computer Vision", "Image dataset processing", "Browser camera preview", "Visual centroid ensemble", "HTML/CSS/JS demo"]
    },
    {
      name: "AI-Powered Diet Planner",
      keywords: ["diet planner", "diet", "nutrition", "meal plan", "meal", "calorie", "nutrition planner", "food"],
      description: "A recommendation-oriented nutrition planner that turns local diet and food datasets into practical daily meal direction.",
      features: [
        "Goal-aware meal planning",
        "Calorie and preference-aware guidance",
        "Grocery and routine planning output",
        "Dataset-backed recommendation logic"
      ],
      technologies: ["Python", "Nutrition datasets", "Recommendation logic", "Cluster-based planning", "HTML/CSS/JS demo", "JSON and CSV data"]
    },
    {
      name: "Mood-Based Playlist Generator",
      keywords: ["playlist", "playlist generator", "music", "music recommendation", "songs", "audio features", "mood based playlist"],
      description: "A large-dataset recommendation project that maps mood and audio features into playlist-style music handoff flows.",
      features: [
        "Mood and session-aware mix generation",
        "Audio-feature-based recommendation flow",
        "Copy, share, and export actions",
        "Platform handoff for playlist exploration"
      ],
      technologies: ["Python", "Audio feature datasets", "Recommendation logic", "Mood-energy mapping", "HTML/CSS/JS demo", "Export flows"]
    }
  ]
};

const portfolioOnlyRedirectReply = `I am mainly here to help with ${portfolioKnowledge.profile.name}'s portfolio. Ask me about his projects, live demos, resume, skills, education, achievements, or contact details.`;

portfolioKnowledge.education = [
  "Bachelor's Degree in Artificial Intelligence and Data Science (Pursuing, currently in 2nd Year)",
  "Diploma in Artificial Intelligence and Data Science (Completed)"
];

portfolioKnowledge.resumeHighlights = [
  "Python and Java foundation",
  "Machine learning and deep learning workflows",
  "Flask application development",
  "Android and mobile AI concepts",
  "Practical AI problem solving"
];

portfolioKnowledge.competencies = [
  "Problem-solving and analytical thinking",
  "Fast learner and adaptable",
  "Strong interest in AI development",
  "Self-motivated and consistent"
];

portfolioKnowledge.services = [
  "ML prototype development",
  "Portfolio-ready AI demos",
  "Data analysis workflows",
  "Python automation solutions",
  "Mobile AI concept design"
];

portfolioKnowledge.careerObjective = "To begin his career as an AI or ML Engineer, apply his knowledge in real projects, gain practical experience, and contribute to innovative AI-based solutions.";

const detailedProjectMeta = {
  "Heart Disease Detection System": {
    id: "heart-disease",
    category: "Healthcare AI",
    platform: "Flask web application with machine learning inference",
    engine: "Random Forest classification model",
    domainDefinition: "Heart disease is a broad term for conditions that affect the heart and blood vessels. In this portfolio, the project focuses on screening risk patterns from structured clinical data.",
    need: "medical risk patterns are often hidden inside multiple numeric inputs, so the project turns raw clinical fields into a faster screening-style workflow",
    problem: "The project targets early heart disease risk screening by turning medical input fields into a quick prediction workflow.",
    solution: "Guruprasad combined patient clinical parameters, preprocessing, and a Random Forest model inside a Flask web app for real-time prediction.",
    datasets: "the local clinical dataset `pngm/dataset/heart_data_set.csv`, which includes 13 input features and one target label",
    algorithms: ["Logistic Regression", "SVM", "Decision Tree", "Random Forest", "KNN"],
    functionality: [
      "collect clinical input values",
      "prepare those values as model features",
      "score heart-risk probability through the trained model",
      "return a usable screening result in the Flask interface"
    ],
    architecture: [
      "Collect patient medical inputs",
      "Preprocess and normalize the clinical fields",
      "Run the Random Forest prediction model",
      "Return the risk result through the Flask interface"
    ],
    evaluation: "The project is evaluated through multi-algorithm experimentation, saved model artifacts, notebook-backed workflow, and a working Flask delivery path instead of only a single visible score on the page.",
    resultSnapshot: "It stands out because it combines dataset proof, notebook experimentation, multiple algorithms, a saved model file, and a working Flask app in one end-to-end story.",
    proof: [
      "the Heart-Disease-Prediction notebook",
      "the train_models.py workflow",
      "the heart_data_set.csv dataset file",
      "the saved models.pkl artifact",
      "the live Flask app and portfolio demo"
    ],
    limitations: "It is a project-grade screening tool, not a medically certified diagnostic system, and the UI does not yet surface calibration or explainability metrics.",
    outcome: "It demonstrates practical healthcare AI by converting a trained model into a working screening experience that can support faster awareness and triage-style thinking.",
    futureScope: "Add explainable AI, confidence reporting, clinician-friendly exports, and richer validation dashboards.",
    demoHint: "Open the Heart Disease demo page from Projects, or launch the original local Flask app from the heart-disease demo section."
  },
  "AI Study Mood Detector": {
    id: "study-mood",
    category: "Computer Vision + Productivity AI",
    platform: "dataset-backed productivity demo with browser camera preview and coaching output",
    engine: "visual centroid ensemble with broad-state mapping",
    domainDefinition: "Study mood detection means estimating whether a learner is focused, tired, distracted, or stressed so the session can be adjusted in a practical way.",
    need: "students often know they are not working well but do not know whether they need a break, a shorter sprint, a quieter environment, or a simpler task",
    problem: "Students often lose focus without realizing whether they are tired, distracted, stressed, or genuinely ready for deep work.",
    solution: "The project uses mood detection, environment signals, and study-goal understanding to recommend breaks, music, and productivity adjustments.",
    datasets: "the image dataset under `study-mood-app/study mood generator dataset`, mapped from seven emotional labels into four broader study states",
    algorithms: ["Visual centroid ensemble", "broad-state label mapping", "local coaching heuristics"],
    functionality: [
      "estimate the likely study state",
      "parse what the student is working on",
      "suggest the next focus action",
      "turn raw state output into usable coaching guidance"
    ],
    architecture: [
      "Capture camera or local readiness signals",
      "Analyze facial, posture, and environment cues",
      "Combine them with study-intent parsing",
      "Recommend the next best study action"
    ],
    evaluation: "The saved metrics report 28,709 train images, 7,178 test images, a 31.37% broad-state accuracy figure, and a confusion matrix for focused, tired, distracted, and stressed predictions.",
    resultSnapshot: "It is presented as a learning-forward productivity AI system: useful as a portfolio prototype, honest about its current accuracy, and strong in how the result is translated into action.",
    proof: [
      "the study mood training script",
      "the saved study_mood_metrics.json file",
      "local dataset sample images",
      "the live focus-lab demo interface"
    ],
    limitations: "Its current accuracy is modest, so it should be treated as a coaching prototype rather than a production emotion-recognition system.",
    outcome: "It turns a general productivity idea into a more intelligent study companion that can guide session quality in a practical way.",
    futureScope: "Add stronger webcam emotion models, noise analysis, session memory, and adaptive long-term study coaching.",
    demoHint: "Open the Study Mood demo page from Projects to try the focus-lab style experience."
  },
  "AI-Powered Diet Planner": {
    id: "diet-planner",
    category: "Nutrition Intelligence",
    platform: "nutrition recommendation demo with meal-board planning output",
    engine: "nutrition vector recommender with clustered meal logic",
    domainDefinition: "Diet planning is the process of matching meals, calories, and food choices to a person's goals, restrictions, and routine in a way they can actually follow.",
    need: "most people do not need a static chart; they need a practical plan that respects calories, preferences, routine, and adherence",
    problem: "People struggle to build realistic diet plans that fit their goals, calorie needs, food choices, and daily routine.",
    solution: "The project personalizes meal suggestions using health goals, calories, preferences, allergies, and a structured nutrition-planning flow.",
    datasets: "the local files `daily_food_nutrition_dataset.csv` and `diet_recommendations_dataset.csv` inside the diet planner dataset folder",
    algorithms: ["Nutrition vector recommender", "cluster-based recommendation logic", "goal-and-preference routing"],
    functionality: [
      "capture goals and dietary constraints",
      "match recommendations to calorie and food preferences",
      "build a day-plan structure",
      "return grocery and execution guidance"
    ],
    architecture: [
      "Capture goal, calorie target, and diet preferences",
      "Filter meals and ingredients by compatibility",
      "Generate a balanced day plan",
      "Return meal rhythm, calorie guidance, and grocery direction"
    ],
    evaluation: "The saved metrics show 14 structured recommendation records, four clusters, an 85.71% preference match rate, and a 0.6897 cluster separation score.",
    resultSnapshot: "Its strength is not scale but practicality: it turns lightweight recommendation data into a clearer planning board with meals, macros, and routine cues.",
    proof: [
      "two local nutrition datasets",
      "the diet_planner_metrics.json file",
      "the planner demo with export actions",
      "the training script for the recommender"
    ],
    limitations: "The dataset is small, so the current version is best understood as a structured nutrition recommender prototype rather than a clinical nutrition platform.",
    outcome: "It shows how AI-style decision logic can turn nutrition planning into a guided, goal-aware daily routine instead of a static chart.",
    futureScope: "Expand with micronutrient tracking, weekly adherence analytics, and deeper dataset-backed meal optimization.",
    demoHint: "Open the Diet Planner demo from Projects to generate a personalized meal-flow style plan."
  },
  "Mood-Based Playlist Generator": {
    id: "playlist-generator",
    category: "Recommendation Systems",
    platform: "Music recommendation and playlist handoff concept",
    engine: "audio feature centroid classifier with mood-energy routing",
    domainDefinition: "Mood-based playlist generation means translating listening context such as mood, energy, and session type into a believable track flow instead of making the user search from scratch.",
    need: "people often know the vibe they want but still spend too much time searching for tracks that fit the moment, especially for work, study, or mood shifts",
    problem: "Users often know their mood but still spend too much time searching for music that fits the moment or session.",
    solution: "The project maps mood, energy, vibe prompts, and listening intent into a playlist-style recommendation flow with export options.",
    datasets: "the 278k labelled audio-feature dataset inside the playlist generator dataset folder, including `278k_song_labelled.csv` and labelled URI data",
    algorithms: ["Audio feature centroid classifier", "mood-energy mapping", "session-based playlist routing"],
    functionality: [
      "capture mood, vibe, and session type",
      "map those signals into track lanes",
      "generate a playlist arc",
      "let the user export, copy, share, or hand off the mix"
    ],
    architecture: [
      "Capture mood, vibe, and session context",
      "Map them into energy and transition rules",
      "Generate a playlist arc and track lanes",
      "Offer export, copy, share, and music-platform handoff actions"
    ],
    evaluation: "The model metrics report 222,350 train rows, 55,588 test rows, 10 audio-feature columns, and a 77.41% label accuracy value.",
    resultSnapshot: "It feels stronger than a simple music card because the demo turns dataset-backed recommendation logic into a usable mix builder with export and sharing actions.",
    proof: [
      "the 278k labelled CSV dataset",
      "the playlist_metrics.json file",
      "the playlist training script",
      "the standalone mix-builder demo"
    ],
    limitations: "It currently creates playlist handoff flows rather than true account-linked playlist creation inside a streaming service.",
    outcome: "It makes the recommendation experience feel active and practical rather than just returning a random list of songs.",
    futureScope: "Add stronger personalization memory, account-linked playlist creation, and richer real-time recommendation signals.",
    demoHint: "Open the Playlist Generator demo from Projects to create, export, and share a generated mix."
  }
};

portfolioKnowledge.projects = portfolioKnowledge.projects.map((project) => ({
  ...project,
  ...(detailedProjectMeta[project.name] || {})
}));

const PROJECT_FOLLOW_UP_TERMS = [
  "what is",
  "define",
  "meaning",
  "need",
  "why needed",
  "why is it needed",
  "tech stack",
  "stack",
  "technology",
  "technologies",
  "tools",
  "algorithm",
  "algorithms",
  "dataset",
  "data",
  "feature",
  "features",
  "function",
  "functions",
  "how it works",
  "how does it work",
  "working",
  "workflow",
  "architecture",
  "pipeline",
  "mechanism",
  "problem",
  "challenge",
  "purpose",
  "goal",
  "solution",
  "outcome",
  "result",
  "impact",
  "accuracy",
  "model",
  "algorithm",
  "platform",
  "demo",
  "live demo",
  "future",
  "scope",
  "improvement",
  "limitations",
  "limitation",
  "proof",
  "artifacts",
  "files",
  "backend",
  "mobile",
  "web",
  "this project",
  "that project",
  "this one",
  "that one"
];

const PROJECT_COMPARISON_TERMS = ["compare", "difference", "versus", "vs"];

const instantGlossaryReplies = [
  {
    terms: ["what is ai", "artificial intelligence", "define ai"],
    reply: "Artificial intelligence is the field of building systems that can perform tasks that usually require human intelligence, such as learning, reasoning, recognizing patterns, understanding language, and making decisions."
  },
  {
    terms: ["what is machine learning", "define machine learning", "what is ml"],
    reply: "Machine learning is a branch of AI where systems learn patterns from data and make predictions or decisions without being explicitly programmed for every case."
  },
  {
    terms: ["what is deep learning", "define deep learning", "what is dl"],
    reply: "Deep learning is a subset of machine learning that uses multi-layer neural networks to learn complex patterns from large amounts of data such as images, audio, and text."
  },
  {
    terms: ["machine learning vs deep learning", "difference between machine learning and deep learning", "ml vs dl"],
    reply: "Machine learning is the broader field of learning patterns from data. Deep learning is a subset of machine learning that uses multi-layer neural networks and usually works especially well on large, complex data like images, audio, and text."
  },
  {
    terms: ["what is python", "define python"],
    reply: "Python is a popular programming language known for readability and a strong ecosystem for AI, machine learning, automation, web development, and data science."
  },
  {
    terms: ["what is java", "define java"],
    reply: "Java is a widely used object-oriented programming language known for portability, strong tooling, and use in backend systems, Android development, and enterprise software."
  },
  {
    terms: ["what is flask", "define flask"],
    reply: "Flask is a lightweight Python web framework often used for APIs, dashboards, and machine learning web apps because it is simple, flexible, and fast to build with."
  },
  {
    terms: ["what is random forest", "define random forest"],
    reply: "Random Forest is a machine learning algorithm that combines many decision trees and uses their combined output for stronger, more stable predictions. It is widely used for classification tasks like disease prediction."
  },
  {
    terms: ["what is computer vision", "define computer vision"],
    reply: "Computer vision is the area of AI that helps systems interpret images and video. It is commonly used for face detection, emotion analysis, object recognition, and visual automation."
  },
  {
    terms: ["what is data science", "define data science"],
    reply: "Data science combines statistics, programming, domain understanding, and machine learning to analyze data, find patterns, and support decisions or predictions."
  },
  {
    terms: ["what is api", "define api"],
    reply: "An API, or application programming interface, is a set of rules that lets one software system communicate with another in a structured way."
  },
  {
    terms: ["what is github", "define github"],
    reply: "GitHub is a platform for hosting code, managing Git repositories, collaborating on software projects, and tracking changes through commits, branches, and pull requests."
  },
  {
    terms: ["what is git", "define git"],
    reply: "Git is a distributed version control system used to track code changes, manage branches, and collaborate safely on software projects."
  },
  {
    terms: ["what is sql", "define sql"],
    reply: "SQL is a language used to store, query, update, and manage data in relational databases."
  },
  {
    terms: ["what is supervised learning", "define supervised learning"],
    reply: "Supervised learning is a machine learning approach where a model learns from labeled examples, meaning the correct output is already known during training."
  },
  {
    terms: ["what is unsupervised learning", "define unsupervised learning"],
    reply: "Unsupervised learning is a machine learning approach where the model finds patterns or structure in data without labeled target outputs."
  },
  {
    terms: ["what is neural network", "what are neural networks", "define neural network"],
    reply: "A neural network is a machine learning model inspired by interconnected neurons, built from layers of nodes that transform input data to learn patterns and make predictions."
  },
  {
    terms: ["what is regression", "define regression"],
    reply: "Regression is a type of predictive modeling used when the target output is a continuous numeric value, such as price, temperature, or risk score."
  },
  {
    terms: ["what is classification", "define classification"],
    reply: "Classification is a machine learning task where the model predicts one category or label from a fixed set of classes, such as spam or not spam."
  },
  {
    terms: ["what is pandas", "define pandas"],
    reply: "Pandas is a Python library used for data analysis and tabular data handling, especially for cleaning, filtering, transforming, and summarizing datasets."
  },
  {
    terms: ["what is numpy", "define numpy"],
    reply: "NumPy is a core Python library for fast numerical computing, arrays, matrix operations, and mathematical functions."
  },
  {
    terms: ["what is scikit learn", "what is sklearn", "define scikit learn"],
    reply: "Scikit-learn is a Python machine learning library that provides tools for preprocessing, model training, evaluation, and common algorithms such as regression, classification, and clustering."
  },
  {
    terms: ["what is tensorflow", "define tensorflow"],
    reply: "TensorFlow is a machine learning framework used to build and train neural networks, deep learning models, and AI systems for tasks like vision, language, and prediction."
  }
];

let titleIndex = 0;
function applyPortfolioTheme(theme, options = {}) {
  const nextTheme = resolveThemeName(theme);
  document.body.classList.remove(...ALLOWED_THEMES);
  document.body.classList.add(nextTheme);

  if (!options.skipStorage) {
    localStorage.setItem("portfolio-theme", nextTheme);
  }

  themeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.theme === nextTheme);
  });

  syncHeartFlaskTheme(nextTheme);
  return nextTheme;
}

const storedTheme = resolveThemeName(localStorage.getItem("portfolio-theme"));
applyPortfolioTheme(storedTheme);
initializeDeviceLayoutPreference();
repairMojibakeText();

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyPortfolioTheme(button.dataset.theme);
  });
});

window.addEventListener("pageshow", () => {
  applyPortfolioTheme(resolveThemeName(localStorage.getItem("portfolio-theme")), { skipStorage: true });
  applyDeviceLayout(getStoredDeviceLayout(), { skipStorage: true });
  restorePageVisibilityState();
});

window.addEventListener("load", () => {
  hideSiteLoader();
});

document.addEventListener("DOMContentLoaded", restorePageVisibilityState, { once: true });

function selectPreferredVoice() {
  if (!("speechSynthesis" in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    return null;
  }

  const femaleHints = [
    "female",
    "woman",
    "natural",
    "neural",
    "online",
    "zira",
    "aria",
    "jenny",
    "samantha",
    "victoria",
    "karen",
    "moira",
    "sonia",
    "heera",
    "priya"
  ];

  const indianFemaleVoice = voices.find((voice) => {
    const voiceName = (voice.name || "").toLowerCase();
    const voiceLang = (voice.lang || "").toLowerCase();
    const soundsFemale = femaleHints.some((hint) => voiceName.includes(hint));
    const soundsIndian =
      voiceLang.startsWith("en-in") ||
      voiceLang.startsWith("hi-in") ||
      voiceName.includes("india") ||
      voiceName.includes("indian") ||
      voiceName.includes("neerja") ||
      voiceName.includes("swara") ||
      voiceName.includes("heera") ||
      voiceName.includes("priya");

    return soundsFemale && soundsIndian;
  });

  preferredVoice =
    indianFemaleVoice ||
    voices.find((voice) => femaleHints.some((hint) => voice.name.toLowerCase().includes(hint))) ||
    voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith("en")) ||
    voices[0];

  return preferredVoice;
}

if ("speechSynthesis" in window) {
  selectPreferredVoice();
  window.speechSynthesis.onvoiceschanged = () => {
    selectPreferredVoice();
  };
}

document.querySelectorAll('a[href$=".html"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      link.target === "_blank" ||
      link.hasAttribute("download") ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    document.body.classList.add("is-transitioning");
    window.setTimeout(() => {
      window.location.href = href;
    }, 90);
  });
});

function rotateTitle() {
  if (!titleElement) {
    return;
  }

  titleElement.textContent = rotatingTitles[titleIndex];
  titleIndex = (titleIndex + 1) % rotatingTitles.length;
}

function animateCounter(element) {
  const target = Number(element.dataset.target);
  const isPercent = target >= 90;
  const duration = 1400;
  const startTime = performance.now();

  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.floor(progress * target);
    element.textContent = isPercent ? value + "%" : value;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function revealElementNow(element, observer = null) {
  if (!element) {
    return;
  }

  const wasVisible = element.classList.contains("is-visible");
  element.classList.add("is-visible");

  if (element.hasAttribute("data-target") && !element.dataset.counterAnimated) {
    element.dataset.counterAnimated = "true";
    animateCounter(element);
  }

  if (observer) {
    observer.unobserve(element);
  }

  if (wasVisible) {
    return;
  }
}

function revealVisibleElementsImmediately() {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const revealCandidates = [...new Set([...revealElements, ...metricElements])];

  revealCandidates.forEach((element) => {
    if (!element || element.classList.contains("is-visible")) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const isInView = rect.top < viewportHeight * 0.96 && rect.bottom > 0;

    if (isInView) {
      revealElementNow(element);
    }
  });
}

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting && entry.intersectionRatio <= 0) {
        return;
      }

      revealElementNow(entry.target, observer);
    });
  },
  {
    threshold: 0.08,
    rootMargin: "0px 0px -8% 0px"
  }
);

revealElements.forEach((element) => revealObserver.observe(element));
metricElements.forEach((element) => revealObserver.observe(element));
requestAnimationFrame(revealVisibleElementsImmediately);
window.addEventListener("load", revealVisibleElementsImmediately);
window.addEventListener("pageshow", () => {
  window.setTimeout(revealVisibleElementsImmediately, 60);
});
window.addEventListener("resize", () => {
  window.setTimeout(revealVisibleElementsImmediately, 60);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;

    filterButtons.forEach((chip) => chip.classList.remove("is-active"));
    button.classList.add("is-active");

    projectCards.forEach((card) => {
      const matches = selected === "all" || card.dataset.category === selected;
      card.classList.toggle("is-hidden", !matches);
    });
  });
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === "#" + entry.target.id;
        link.classList.toggle("is-current", isCurrent);
      });
    });
  },
  { rootMargin: "-40% 0px -45% 0px" }
);

sections.forEach((section) => sectionObserver.observe(section));

function calculateHeartDemoReport(formData) {
  const age = Number(formData.get("age") || 0);
  const cp = Number(formData.get("cp") || 0);
  const trestbps = Number(formData.get("trestbps") || 0);
  const chol = Number(formData.get("chol") || 0);
  const fbs = Number(formData.get("fbs") || 0);
  const thalach = Number(formData.get("thalach") || 0);
  const exang = Number(formData.get("exang") || 0);
  const smoking = formData.get("smoking") || "no";
  const familyHistory = formData.get("family_history") || "no";
  const activityLevel = formData.get("activity_level") || "moderate";
  const stressLevel = formData.get("stress_level") || "medium";
  const heightCm = Number(formData.get("height_cm") || 0);
  const weightKg = Number(formData.get("weight_kg") || 0);

  let score = 8;
  const flags = [];

  if (age >= 55) {
    score += 14;
    flags.push("Age is in a higher-observation range for heart screening.");
  } else if (age >= 45) {
    score += 8;
  }

  if (cp === 3) {
    score += 14;
    flags.push("Asymptomatic chest pain pattern needs stronger attention.");
  } else if (cp === 2) {
    score += 8;
  } else if (cp === 1) {
    score += 4;
  }

  if (trestbps >= 140) {
    score += 12;
    flags.push("Resting blood pressure is elevated.");
  } else if (trestbps >= 130) {
    score += 7;
  }

  if (chol >= 240) {
    score += 12;
    flags.push("Cholesterol level is above the desirable range.");
  } else if (chol >= 200) {
    score += 7;
  }

  if (fbs === 1) {
    score += 5;
    flags.push("Fasting blood sugar is flagged above 120 mg/dL.");
  }

  if (thalach < 100) {
    score += 9;
    flags.push("Maximum heart rate response is lower than ideal.");
  } else if (thalach < 130) {
    score += 5;
  }

  if (exang === 1) {
    score += 10;
    flags.push("Exercise-induced angina was marked present.");
  }

  if (smoking === "yes") {
    score += 8;
    flags.push("Smoking habit adds cardiovascular pressure.");
  }

  if (familyHistory === "yes") {
    score += 7;
    flags.push("Family history suggests extra preventive attention.");
  }

  if (activityLevel === "sedentary") {
    score += 8;
    flags.push("Low physical activity can raise long-term risk.");
  } else if (activityLevel === "moderate") {
    score += 3;
  }

  if (stressLevel === "high") {
    score += 6;
    flags.push("High stress may contribute to cardiovascular strain.");
  } else if (stressLevel === "medium") {
    score += 3;
  }

  let bmiText = "Not set";
  if (heightCm > 0 && weightKg > 0) {
    const bmi = weightKg / Math.pow(heightCm / 100, 2);
    bmiText = bmi.toFixed(1);
    if (bmi >= 30) {
      score += 8;
      flags.push("BMI is in an obesity range.");
    } else if (bmi >= 25) {
      score += 4;
    }
  }

  const risk = Math.min(Math.max(Math.round(score), 8), 96);

  let band = "Lower current signal";
  let consensus = "Lower probability band";

  if (risk >= 70) {
    band = "High attention needed";
    consensus = "High probability band";
  } else if (risk >= 40) {
    band = "Moderate risk signal";
    consensus = "Moderate probability band";
  }

  const recommendations = [];
  if (risk >= 70) {
    recommendations.push("Discuss this result with a clinician soon, especially if symptoms are present.");
  } else if (risk >= 40) {
    recommendations.push("Consider a preventive check-up and compare this result with professional evaluation.");
  } else {
    recommendations.push("Keep monitoring your health habits and use routine screening when appropriate.");
  }

  if (trestbps >= 130) {
    recommendations.push("Track blood pressure on multiple days rather than relying on one reading.");
  }
  if (chol >= 200) {
    recommendations.push("A lipid profile review could help confirm cholesterol-related risk.");
  }
  if (smoking === "yes") {
    recommendations.push("Reducing or stopping smoking would meaningfully improve heart-health outlook.");
  }
  if (activityLevel === "sedentary") {
    recommendations.push("Aim for gradual weekly activity targets if your clinician says exercise is safe.");
  }

  if (!flags.length) {
    flags.push("Current inputs suggest fewer immediate high-risk signals in this demo profile.");
  }

  return {
    risk,
    band,
    consensus,
    bmiText,
    flags,
    recommendations: recommendations.slice(0, 4),
    activityLabel:
      activityLevel === "sedentary"
        ? "Sedentary"
        : activityLevel === "active"
          ? "Highly Active"
          : "Moderately Active",
    stressLabel:
      stressLevel === "high"
        ? "High"
        : stressLevel === "low"
          ? "Low"
          : "Medium"
  };
}

function renderHeartDemoReport(report) {
  const riskValue = document.getElementById("heartRiskValue");
  const riskBand = document.getElementById("heartRiskBand");
  const consensus = document.getElementById("heartConsensus");
  const bmiValue = document.getElementById("heartBmiValue");
  const flagCount = document.getElementById("heartFlagCount");
  const activityPreview = document.getElementById("heartActivityPreview");
  const stressPreview = document.getElementById("heartStressPreview");
  const flagList = document.getElementById("heartFlagList");
  const recommendationList = document.getElementById("heartRecommendationList");
  const clinicalSummary = document.getElementById("heartClinicalSummary");

  if (!riskValue || !riskBand || !consensus || !flagList || !recommendationList) {
    return;
  }

  riskValue.textContent = `${report.risk}%`;
  riskBand.textContent = report.band;
  consensus.textContent = report.consensus;

  if (bmiValue) {
    bmiValue.textContent = report.bmiText;
  }
  if (flagCount) {
    flagCount.textContent = String(report.flags.length);
  }
  if (activityPreview) {
    activityPreview.textContent = report.activityLabel;
  }
  if (stressPreview) {
    stressPreview.textContent = report.stressLabel;
  }
  if (clinicalSummary) {
    clinicalSummary.textContent =
      report.risk >= 70
        ? "This scenario is showing a higher-observation risk pattern and should be treated as a prompt for stronger clinical follow-up."
        : report.risk >= 40
          ? "This scenario lands in a moderate band, so trend monitoring and preventive review would be the practical next step."
          : "This scenario currently reads lower risk in the portfolio simulator, but consistent preventive habits and professional screening still matter.";
  }

  flagList.innerHTML = report.flags.map((item) => `<li>${item}</li>`).join("");
  recommendationList.innerHTML = report.recommendations.map((item) => `<li>${item}</li>`).join("");
  currentHeartDemoState = {
    ...report,
    summary: clinicalSummary ? clinicalSummary.textContent : report.consensus
  };
}

function buildHeartDemoExportText() {
  if (!currentHeartDemoState) {
    return "";
  }

  const lines = [
    "Heart Disease Demo Snapshot",
    `Risk score: ${currentHeartDemoState.risk}%`,
    `Band: ${currentHeartDemoState.band}`,
    `Consensus: ${currentHeartDemoState.consensus}`,
    `BMI signal: ${currentHeartDemoState.bmiText}`,
    `Activity: ${currentHeartDemoState.activityLabel}`,
    `Stress: ${currentHeartDemoState.stressLabel}`,
    "",
    "Key flags:"
  ];

  currentHeartDemoState.flags.forEach((item, index) => {
    lines.push(`${index + 1}. ${item}`);
  });

  lines.push("", "Recommended next steps:");
  currentHeartDemoState.recommendations.forEach((item, index) => {
    lines.push(`${index + 1}. ${item}`);
  });

  if (currentHeartDemoState.summary) {
    lines.push("", currentHeartDemoState.summary);
  }

  return lines.join("\n");
}

function updateHeartDemoFromForm() {
  if (!heartDemoForm) {
    return;
  }

  renderHeartDemoReport(calculateHeartDemoReport(new FormData(heartDemoForm)));
}

if (heartDemoForm) {
  const heartDemoCopy = document.getElementById("heartDemoCopy");

  heartDemoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    updateHeartDemoFromForm();
  });

  heartDemoForm.addEventListener("input", updateHeartDemoFromForm);
  heartDemoForm.addEventListener("change", updateHeartDemoFromForm);

  if (heartDemoReset) {
    heartDemoReset.addEventListener("click", () => {
      heartDemoForm.reset();
      window.setTimeout(updateHeartDemoFromForm, 0);
    });
  }

  heartDemoCopy?.addEventListener("click", async () => {
    try {
      await copyPlainText(buildHeartDemoExportText());
      flashTemporaryButtonLabel(heartDemoCopy, "Copied");
    } catch (error) {
      flashTemporaryButtonLabel(heartDemoCopy, "Retry");
    }
  });

  updateHeartDemoFromForm();
}

async function initializeHeartFlaskFrame(forceReload = false) {
  if (!heartFlaskFrame || !heartFlaskStatus) {
    return;
  }

  const liveAppShell = heartFlaskFrame.closest(".live-app-shell");
  const theme = getCurrentPortfolioTheme();

  if (!useServerChat) {
    if (liveAppShell) {
      liveAppShell.hidden = Boolean(isStaticPortfolioHost);
      liveAppShell.classList.remove("is-ready");
    }
    heartFlaskStatus.textContent = isStaticPortfolioHost
      ? "GitHub Pages mode: portfolio simulator is active."
      : "Run this page through server.py to load the Flask app.";
    heartFlaskStatus.classList.add("is-error");
    if (heartFlaskFrame) {
      heartFlaskFrame.hidden = true;
      heartFlaskFrame.removeAttribute("src");
    }
    if (heartFlaskReload) {
      heartFlaskReload.hidden = true;
    }
    if (heartFlaskLaunch) {
      heartFlaskLaunch.href = "heart-disease-case-study.html";
      heartFlaskLaunch.textContent = "Open Case Study";
      heartFlaskLaunch.removeAttribute("target");
      heartFlaskLaunch.removeAttribute("rel");
    }
    if (heartFlaskFallback) {
      heartFlaskFallback.innerHTML = isStaticPortfolioHost
        ? `
          <strong>Static showcase mode</strong>
          <p>
            GitHub Pages can publish the portfolio, case studies, and static demo experience, but the live Flask app itself runs only on your local Python setup.
            Use the case study here, and run <code>py -3 server.py</code> locally whenever you want the full embedded app experience.
          </p>
        `
        : `
          <strong>Waiting for the local Flask app</strong>
          <p>
            Open the portfolio through <code>server.py</code>. The page will try to start the local Flask app automatically and then load it here.
          </p>
        `;
      heartFlaskFallback.hidden = false;
    }
    return;
  }

  if (liveAppShell) {
    liveAppShell.hidden = false;
  }
  if (heartFlaskFrame) {
    heartFlaskFrame.hidden = false;
  }
  if (heartFlaskReload) {
    heartFlaskReload.hidden = false;
  }
  if (heartFlaskLaunch) {
    heartFlaskLaunch.textContent = "Open Fullscreen";
    heartFlaskLaunch.target = "_blank";
    heartFlaskLaunch.rel = "noreferrer";
  }

  heartFlaskStatus.textContent = "Starting local Flask app...";
  heartFlaskStatus.classList.remove("is-ready", "is-error");

  try {
    const response = await fetch(`/api/heart-demo-status${forceReload ? "?refresh=1" : ""}`, {
      cache: "no-store"
    });
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      throw new Error("Embedded demo API is unavailable. Restart server.py, then reload this page.");
    }

    const payload = await response.json();

    if (!response.ok || !payload.running || !payload.url) {
      throw new Error(payload.error || payload.message || "Flask app is unavailable");
    }

    const appUrl = `${payload.url}?theme=${encodeURIComponent(theme)}${forceReload ? `&t=${Date.now()}` : ""}`;

    if (heartFlaskLaunch) {
      heartFlaskLaunch.href = `${payload.url}?theme=${encodeURIComponent(theme)}`;
    }

    heartFlaskFrame.src = appUrl;
    heartFlaskStatus.textContent = payload.message || "Flask app connected";
    heartFlaskStatus.classList.remove("is-error");
    heartFlaskStatus.classList.add("is-ready");

    if (liveAppShell) {
      liveAppShell.classList.add("is-ready");
    }

    if (heartFlaskFallback) {
      heartFlaskFallback.hidden = true;
    }
  } catch (error) {
    if (isLocalPortfolioHost) {
      try {
        await fetch(heartFlaskDirectUrl, { mode: "no-cors" });
      } catch (directError) {
        heartFlaskStatus.textContent = "Flask app is not running on 127.0.0.1:5000. Restart server.py or run the local heart app manually.";
        heartFlaskStatus.classList.remove("is-ready");
        heartFlaskStatus.classList.add("is-error");

        if (liveAppShell) {
          liveAppShell.classList.remove("is-ready");
        }

        if (heartFlaskFallback) {
          heartFlaskFallback.hidden = false;
        }
        return;
      }

      heartFlaskStatus.textContent = "Trying direct local Flask app...";
      heartFlaskStatus.classList.remove("is-ready", "is-error");
      heartFlaskFrame.src = `${heartFlaskDirectUrl}?theme=${encodeURIComponent(theme)}&t=${Date.now()}`;

      if (heartFlaskLaunch) {
        heartFlaskLaunch.href = `${heartFlaskDirectUrl}?theme=${encodeURIComponent(theme)}`;
      }

      if (heartFlaskFallback) {
        heartFlaskFallback.hidden = false;
      }
      return;
    }

    heartFlaskStatus.textContent = error.message;
    heartFlaskStatus.classList.remove("is-ready");
    heartFlaskStatus.classList.add("is-error");

    if (liveAppShell) {
      liveAppShell.classList.remove("is-ready");
    }

    if (heartFlaskFallback) {
      heartFlaskFallback.hidden = false;
    }
  }
}

if (heartFlaskReload) {
  heartFlaskReload.addEventListener("click", () => {
    initializeHeartFlaskFrame(true);
  });
}

if (heartFlaskFrame && heartFlaskStatus) {
  heartFlaskFrame.addEventListener("load", () => {
    if (!heartFlaskFrame.src || heartFlaskFrame.src === "about:blank") {
      return;
    }

    const liveAppShell = heartFlaskFrame.closest(".live-app-shell");
    heartFlaskStatus.textContent = "Heart disease Flask app loaded";
    heartFlaskStatus.classList.remove("is-error");
    heartFlaskStatus.classList.add("is-ready");

    if (liveAppShell) {
      liveAppShell.classList.add("is-ready");
    }

    if (heartFlaskFallback) {
      heartFlaskFallback.hidden = true;
    }

    syncHeartFlaskTheme(getCurrentPortfolioTheme());
  });

initializeHeartFlaskFrame();
}

function uniqueValues(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function getTextSeed(value) {
  return Array.from(String(value || "")).reduce((total, character) => total + character.charCodeAt(0), 0);
}

function pickDeterministicOption(options, seed, offset = 0) {
  if (!Array.isArray(options) || !options.length) {
    return null;
  }

  return options[(seed + offset) % options.length];
}

function createDownloadSafeName(value, fallback = "portfolio-export") {
  const normalized = normalizeText(value || "").replace(/\s+/g, "-");
  return normalized || fallback;
}

function downloadPlainTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
}

async function copyPlainText(text) {
  if (!navigator.clipboard || !text) {
    throw new Error("Clipboard unavailable");
  }

  await navigator.clipboard.writeText(text);
}

function flashTemporaryButtonLabel(button, nextLabel) {
  if (!button) {
    return;
  }

  const originalLabel = button.dataset.label || button.textContent;
  button.dataset.label = originalLabel;
  button.textContent = nextLabel;
  window.clearTimeout(Number(button.dataset.timeoutId || 0));
  const timeoutId = window.setTimeout(() => {
    button.textContent = originalLabel;
  }, 1400);
  button.dataset.timeoutId = String(timeoutId);
}

async function startVideoPreview(videoElement) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Camera access is not available in this browser.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: { ideal: 640 },
      height: { ideal: 360 }
    },
    audio: false
  });

  videoElement.srcObject = stream;
  videoElement.muted = true;
  await videoElement.play().catch(() => {});
  return stream;
}

function stopVideoPreview(stream, videoElement) {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  if (videoElement) {
    videoElement.pause();
    videoElement.srcObject = null;
  }
}

function sampleVideoLighting(videoElement, canvasElement) {
  if (
    !videoElement ||
    !canvasElement ||
    !videoElement.srcObject ||
    !videoElement.videoWidth ||
    !videoElement.videoHeight
  ) {
    return null;
  }

  const context = canvasElement.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return null;
  }

  const sampleWidth = 72;
  const sampleHeight = 54;
  canvasElement.width = sampleWidth;
  canvasElement.height = sampleHeight;
  context.drawImage(videoElement, 0, 0, sampleWidth, sampleHeight);

  const { data } = context.getImageData(0, 0, sampleWidth, sampleHeight);
  let totalBrightness = 0;

  for (let index = 0; index < data.length; index += 4) {
    totalBrightness += (data[index] * 0.299) + (data[index + 1] * 0.587) + (data[index + 2] * 0.114);
  }

  const brightness = Math.round(totalBrightness / (data.length / 4));
  const label = brightness < 85 ? "dim" : brightness < 165 ? "balanced" : "bright";

  return { brightness, label };
}

function createInitialVisionState() {
  return {
    supported: null,
    faceCount: 0,
    centeredness: 0,
    stability: 0,
    areaRatio: 0,
    framing: "Manual mode",
    lastBox: null,
    error: ""
  };
}

function getFaceDetectorInstance() {
  if (!("FaceDetector" in window)) {
    return null;
  }

  try {
    return new window.FaceDetector({
      fastMode: true,
      maxDetectedFaces: 2
    });
  } catch (error) {
    return null;
  }
}

async function detectCameraVisionState(videoElement, previousState = createInitialVisionState(), detector = null) {
  if (!videoElement?.videoWidth || !videoElement?.videoHeight) {
    return {
      ...createInitialVisionState(),
      supported: detector ? true : null,
      framing: "Camera warming up"
    };
  }

  if (!detector) {
    return {
      ...createInitialVisionState(),
      supported: false,
      framing: "Lighting-only mode",
      error: "Face detection is not supported in this browser."
    };
  }

  const faces = await detector.detect(videoElement);

  if (!faces.length) {
    return {
      ...createInitialVisionState(),
      supported: true,
      framing: "No face detected",
      lastBox: previousState.lastBox || null
    };
  }

  const frameArea = videoElement.videoWidth * videoElement.videoHeight;
  const face = faces[0];
  const box = face.boundingBox || face.box || {
    x: 0,
    y: 0,
    width: videoElement.videoWidth * 0.25,
    height: videoElement.videoHeight * 0.25
  };
  const centerX = (box.x + (box.width / 2)) / videoElement.videoWidth;
  const centerY = (box.y + (box.height / 2)) / videoElement.videoHeight;
  const distanceFromCenter = Math.hypot(centerX - 0.5, centerY - 0.5);
  const centeredness = clamp(Math.round((1 - Math.min(distanceFromCenter / 0.62, 1)) * 100), 0, 100);
  const areaRatio = clamp((box.width * box.height) / frameArea, 0, 1);
  let stability = 78;

  if (previousState?.lastBox) {
    const previousCenterX = (previousState.lastBox.x + (previousState.lastBox.width / 2)) / videoElement.videoWidth;
    const previousCenterY = (previousState.lastBox.y + (previousState.lastBox.height / 2)) / videoElement.videoHeight;
    const delta = Math.abs(previousCenterX - centerX) + Math.abs(previousCenterY - centerY) + Math.abs(previousState.lastBox.width - box.width) / videoElement.videoWidth;
    stability = clamp(Math.round(100 - (delta * 220)), 24, 98);
  }

  let framing = "Well framed";

  if (faces.length > 1) {
    framing = "Multiple faces";
  } else if (areaRatio > 0.34) {
    framing = "Too close";
  } else if (areaRatio < 0.07) {
    framing = "Too far";
  } else if (centeredness < 55) {
    framing = "Off-center";
  } else if (stability < 50) {
    framing = "Moving";
  }

  return {
    supported: true,
    faceCount: faces.length,
    centeredness,
    stability,
    areaRatio: Number(areaRatio.toFixed(3)),
    framing,
    lastBox: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height
    },
    error: ""
  };
}

function parseStudyGoalBrief(brief) {
  const normalized = normalizeText(brief);
  const profiles = [
    {
      keywords: ["coding", "leetcode", "algorithm", "dsa", "programming", "debug"],
      mode: "Coding interview prep",
      intensity: "high",
      coaching: "timed problem-solving blocks",
      tags: ["coding focus", "logic-heavy"]
    },
    {
      keywords: ["exam", "revision", "test", "syllabus", "theory"],
      mode: "Exam revision",
      intensity: "medium",
      coaching: "recall and spaced revision",
      tags: ["revision", "memory recall"]
    },
    {
      keywords: ["assignment", "report", "essay", "writing", "documentation"],
      mode: "Writing session",
      intensity: "medium",
      coaching: "outline-first drafting",
      tags: ["writing", "structured output"]
    },
    {
      keywords: ["research", "paper", "reading", "analysis"],
      mode: "Research review",
      intensity: "medium",
      coaching: "annotated reading sprints",
      tags: ["reading", "analysis"]
    }
  ];

  const fallback = {
    mode: "General study sprint",
    intensity: "medium",
    coaching: "single-topic focus blocks",
    tags: ["study flow"]
  };

  const matched = profiles.find((profile) => profile.keywords.some((keyword) => normalized.includes(keyword))) || fallback;

  return {
    mode: matched.mode,
    intensity: matched.intensity,
    coaching: matched.coaching,
    tags: matched.tags,
    hasBrief: Boolean(normalized),
  };
}

function parseDietBrief(brief) {
  const normalized = normalizeText(brief);
  const tags = [];
  const allergies = [];
  let goalOverride = "";
  let dietOverride = "";
  let prepOverride = "";
  let budgetOverride = "";

  const maybeAddTag = (condition, tag) => {
    if (condition) {
      tags.push(tag);
    }
  };

  if (/(muscle|bulk|gain|strength|protein)/.test(normalized)) {
    goalOverride = "muscleGain";
    tags.push("protein priority");
  }
  if (/(fat loss|cut|lean|weight loss)/.test(normalized)) {
    goalOverride = "fatLoss";
    tags.push("leaning phase");
  }
  if (/(vegetarian|paneer|plant based|vegan)/.test(normalized)) {
    dietOverride = "vegetarian";
    tags.push("vegetarian bias");
  }
  if (/(high protein|gym meals|protein rich)/.test(normalized)) {
    if (!dietOverride) {
      dietOverride = "highProtein";
    }
    tags.push("macro-aware meals");
  }
  if (/(quick|fast|busy|office|college|hostel)/.test(normalized)) {
    prepOverride = "quick";
    tags.push("quick prep");
  }
  if (/(batch|meal prep|prep on sunday|weekly prep)/.test(normalized)) {
    prepOverride = "batch";
    tags.push("batch friendly");
  }
  if (/(budget|cheap|affordable|student)/.test(normalized)) {
    budgetOverride = "smart";
    tags.push("budget smart");
  }
  if (/(premium|quality ingredients|gourmet)/.test(normalized)) {
    budgetOverride = "premium";
    tags.push("premium ingredients");
  }

  [
    ["peanut", "peanut"],
    ["dairy", "dairy"],
    ["gluten", "gluten"],
    ["soy", "soy"],
    ["egg", "egg"],
  ].forEach(([keyword, label]) => {
    if (normalized.includes(keyword)) {
      allergies.push(label);
    }
  });

  maybeAddTag(/indian|dal|roti|paneer|poha|khichdi/.test(normalized), "Indian meal direction");
  maybeAddTag(/less oil|light|low oil|lighter/.test(normalized), "lighter meals");
  maybeAddTag(/fiber|digestion|gut/.test(normalized), "gut-friendly choices");

  return {
    tags: uniqueValues(tags),
    allergies: uniqueValues(allergies),
    goalOverride,
    dietOverride,
    prepOverride,
    budgetOverride,
    hasBrief: Boolean(normalized),
  };
}

function parsePlaylistPrompt(prompt) {
  const normalized = normalizeText(prompt);
  const tags = [];
  let moodOverride = "";
  let sessionOverride = "";
  let languageOverride = "";
  let lyricOverride = "";

  const maybeAddTag = (condition, tag) => {
    if (condition) {
      tags.push(tag);
    }
  };

  if (/(calm|peaceful|soft|gentle|relax)/.test(normalized)) {
    moodOverride = "calm";
  }
  if (/(happy|uplift|bright|positive|feel good)/.test(normalized)) {
    moodOverride = "happy";
  }
  if (/(energy|hype|workout|gym|run|power)/.test(normalized)) {
    moodOverride = "energetic";
  }
  if (/(reflective|emotional|sad|late night|nostalgia)/.test(normalized)) {
    moodOverride = "reflective";
  }
  if (/(code|coding|study|deep work|focus|work session)/.test(normalized)) {
    moodOverride = moodOverride || "focused";
    sessionOverride = "study";
    maybeAddTag(true, "focus work");
  }
  if (/(workout|gym|run|cardio)/.test(normalized)) {
    sessionOverride = "workout";
    maybeAddTag(true, "movement energy");
  }
  if (/(night|midnight|late night)/.test(normalized)) {
    sessionOverride = "lateNight";
    maybeAddTag(true, "after-hours listening");
  }
  if (/(quick|short|reset|mini break)/.test(normalized)) {
    sessionOverride = "quick";
    maybeAddTag(true, "quick reset");
  }
  if (/(hindi|bollywood)/.test(normalized)) {
    languageOverride = "Hindi";
    maybeAddTag(true, "Hindi layer");
  }
  if (/(english|international)/.test(normalized)) {
    languageOverride = languageOverride ? "Mixed" : "English";
    maybeAddTag(true, "English layer");
  }
  if (/(mixed|blend|both languages)/.test(normalized)) {
    languageOverride = "Mixed";
  }
  if (/(instrumental|no lyrics|low lyrics|minimal lyrics|ambient)/.test(normalized)) {
    lyricOverride = "minimal";
    maybeAddTag(true, "low lyric density");
  }
  if (/(vocals|sing along|full lyrics)/.test(normalized)) {
    lyricOverride = "full";
    maybeAddTag(true, "vocal-forward");
  }

  maybeAddTag(/synth|electronic|futuristic|neon/.test(normalized), "futuristic synth");
  maybeAddTag(/lofi|lo-fi|chillhop/.test(normalized), "lo-fi textures");
  maybeAddTag(/indie|acoustic|organic/.test(normalized), "organic tone");

  return {
    tags: uniqueValues(tags),
    moodOverride,
    sessionOverride,
    languageOverride,
    lyricOverride,
    hasPrompt: Boolean(normalized),
  };
}

const studyMoodDemoForm = document.getElementById("studyMoodDemoForm");
if (studyMoodDemoForm) {
  const studyMoodStatus = document.getElementById("studyMoodStatus");
  const studyMoodScore = document.getElementById("studyMoodScore");
  const studyMoodConfidence = document.getElementById("studyMoodConfidence");
  const studyMoodAction = document.getElementById("studyMoodAction");
  const studyMoodAudio = document.getElementById("studyMoodAudio");
  const studyMoodTechnique = document.getElementById("studyMoodTechnique");
  const studyMoodTips = document.getElementById("studyMoodTips");
  const studyMoodReadiness = document.getElementById("studyMoodReadiness");
  const studyMoodBreakWindow = document.getElementById("studyMoodBreakWindow");
  const studyMoodTaskMode = document.getElementById("studyMoodTaskMode");
  const studyMoodCameraHealth = document.getElementById("studyMoodCameraHealth");
  const studyMoodSignalStrip = document.getElementById("studyMoodSignalStrip");
  const studyMoodCameraInsight = document.getElementById("studyMoodCameraInsight");
  const studyMoodNlpInsight = document.getElementById("studyMoodNlpInsight");
  const studyMoodCoachSummary = document.getElementById("studyMoodCoachSummary");
  const studyMoodPlan = document.getElementById("studyMoodPlan");
  const studyMoodEnvironmentScore = document.getElementById("studyMoodEnvironmentScore");
  const studyMoodRecoveryScore = document.getElementById("studyMoodRecoveryScore");
  const studyMoodSprintPlan = document.getElementById("studyMoodSprintPlan");
  const studyMoodAttentionScore = document.getElementById("studyMoodAttentionScore");
  const studyMoodLoadScore = document.getElementById("studyMoodLoadScore");
  const studyMoodDriftRisk = document.getElementById("studyMoodDriftRisk");
  const studyMoodInterventionProfile = document.getElementById("studyMoodInterventionProfile");
  const studyMoodExportNote = document.getElementById("studyMoodExportNote");
  const studyMoodCopyButton = document.getElementById("studyMoodCopyButton");
  const studyMoodDownloadButton = document.getElementById("studyMoodDownloadButton");
  const studyMoodModelReasoning = document.getElementById("studyMoodModelReasoning");
  const studyMoodDriverList = document.getElementById("studyMoodDriverList");
  const studyMoodRecoveryProtocol = document.getElementById("studyMoodRecoveryProtocol");
  const studyMoodModelEngine = document.getElementById("studyMoodModelEngine");
  const studyMoodVisualEmotion = document.getElementById("studyMoodVisualEmotion");
  const studyMoodValidation = document.getElementById("studyMoodValidation");
  const studyMoodSignalSource = document.getElementById("studyMoodSignalSource");
  const studyMoodCameraToggle = document.getElementById("studyMoodCameraToggle");
  const studyMoodCameraStatus = document.getElementById("studyMoodCameraStatus");
  const studyMoodVideo = document.getElementById("studyMoodVideo");
  const studyMoodCanvas = document.getElementById("studyMoodCanvas");
  let studyMoodStream = null;
  let studyMoodVisionState = createInitialVisionState();
  let studyMoodFaceDetector = null;
  let studyMoodVisionTimer = null;
  let currentStudyMoodState = null;
  let studyMoodRequestToken = 0;
  let studyMoodLastSyncKey = "";
  let studyMoodLastSyncAt = 0;
  let studyMoodRenderTimer = 0;

  const moodProfiles = {
    focused: {
      label: "Focused",
      baseScore: 84,
      action: "Lock the next sprint to one high-value task and avoid context switching.",
      audio: "Low-lyric electronic or ambient focus audio with stable volume.",
      technique: "Use a fixed 45 to 50 minute sprint and one measurable success target."
    },
    tired: {
      label: "Tired",
      baseScore: 56,
      action: "Reduce intensity for one block, hydrate, and re-enter with a smaller milestone.",
      audio: "Gentle instrumental sound with no sharp transitions.",
      technique: "Use a 20 minute recovery sprint followed by a posture and water reset."
    },
    distracted: {
      label: "Distracted",
      baseScore: 46,
      action: "Reset the workspace, remove notifications, and restart with the easiest entry task.",
      audio: "White noise, brown noise, or steady low-lyric focus audio.",
      technique: "Run a 10 minute reset checklist before returning to the priority task."
    },
    stressed: {
      label: "Stressed",
      baseScore: 42,
      action: "Shift from pressure-heavy work into structured review until the nervous system settles.",
      audio: "Slow instrumental or nature-backed ambient tracks.",
      technique: "Use box breathing, then reduce the task into the next two concrete actions."
    }
  };

  function titleCaseStudyState(value) {
    return String(value || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
      .trim();
  }

  function captureStudyMoodSnapshot() {
    if (
      !studyMoodVideo ||
      !studyMoodCanvas ||
      !studyMoodStream ||
      !studyMoodVideo.videoWidth ||
      !studyMoodVideo.videoHeight
    ) {
      return "";
    }

    const context = studyMoodCanvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      return "";
    }

    const captureWidth = 192;
    const captureHeight = Math.max(144, Math.round((captureWidth / studyMoodVideo.videoWidth) * studyMoodVideo.videoHeight));
    studyMoodCanvas.width = captureWidth;
    studyMoodCanvas.height = captureHeight;
    context.drawImage(studyMoodVideo, 0, 0, captureWidth, captureHeight);
    return studyMoodCanvas.toDataURL("image/jpeg", 0.82);
  }

  function syncStudyMoodModelMeta({
    modelEngine,
    visualEmotion,
    validationLabel,
    signalSource
  } = {}) {
    if (studyMoodModelEngine) {
      studyMoodModelEngine.textContent = modelEngine || "Visual centroid ensemble";
    }
    if (studyMoodVisualEmotion) {
      studyMoodVisualEmotion.textContent = visualEmotion || "Manual baseline";
    }
    if (studyMoodValidation) {
      studyMoodValidation.textContent = validationLabel || "Awaiting server sync";
    }
    if (studyMoodSignalSource) {
      studyMoodSignalSource.textContent = signalSource || "Manual study signals";
    }
  }

  async function hydrateStudyMoodFromServer() {
    const formData = new FormData(studyMoodDemoForm);
    const payload = Object.fromEntries(formData.entries());
    const cameraLighting = sampleVideoLighting(studyMoodVideo, studyMoodCanvas);
    const roundedCenteredness = Math.round((studyMoodVisionState?.centeredness || 0) / 10) * 10;
    const roundedStability = Math.round((studyMoodVisionState?.stability || 0) / 10) * 10;
    const syncKey = [
      payload.faceState,
      payload.sleepHours,
      payload.sessionMinutes,
      payload.distractionLevel,
      payload.stressLevel,
      payload.postureQuality,
      payload.ambientNoise,
      normalizeText(payload.studyGoal || "").slice(0, 80),
      studyMoodStream ? "camera-on" : "camera-off",
      studyMoodVisionState?.faceCount || 0,
      roundedCenteredness,
      roundedStability,
      cameraLighting?.label || "no-lighting"
    ].join("|");
    const now = Date.now();

    if (syncKey === studyMoodLastSyncKey && now - studyMoodLastSyncAt < 2200) {
      return;
    }

    studyMoodLastSyncKey = syncKey;
    studyMoodLastSyncAt = now;

    const snapshot = captureStudyMoodSnapshot();
    if (snapshot) {
      payload.imageData = snapshot;
    }

    const requestToken = ++studyMoodRequestToken;

    try {
      const result = await postPortfolioJson("/api/study-mood-predict", payload, 8500);

      if (requestToken !== studyMoodRequestToken || !currentStudyMoodState) {
        return;
      }

      const predictedLabel = titleCaseStudyState(result.predictedState || currentStudyMoodState.label);
      const confidenceValue = clamp(Math.round(Number(result.confidence || 0.58) * 100), 24, 98);
      const blendedScore = clamp(
        Math.round((Number(currentStudyMoodState.score || 0) * 0.68) + (confidenceValue * 0.32)),
        24,
        98
      );
      const visualEmotionLabel = titleCaseStudyState(result.visualEmotion || "manual baseline");
      const signalSourceLabel = snapshot
        ? (studyMoodStream ? "Camera + manual study signals" : "Manual state + image snapshot")
        : "Manual study signals";
      const validationAccuracy = Number(result.validationAccuracy || 0);
      const validationLabel = validationAccuracy
        ? `${formatPercentageLabel(validationAccuracy * 100)} broad-state accuracy`
        : "Manual guidance mode";

      if (studyMoodStatus) studyMoodStatus.textContent = predictedLabel;
      if (studyMoodScore) studyMoodScore.textContent = `${blendedScore}%`;
      if (studyMoodConfidence) studyMoodConfidence.textContent = result.confidenceLabel || `${confidenceValue}% confidence`;
      if (studyMoodAction) studyMoodAction.textContent = result.recommendedAction || currentStudyMoodState.dynamicAction;
      if (studyMoodAudio) studyMoodAudio.textContent = result.recommendedAudio || currentStudyMoodState.audioPlan;
      if (studyMoodTechnique) studyMoodTechnique.textContent = result.recommendedTechnique || currentStudyMoodState.techniquePlan;
      if (studyMoodCoachSummary) studyMoodCoachSummary.textContent = result.serverSummary || currentStudyMoodState.coachSummary;
      if (studyMoodModelReasoning) studyMoodModelReasoning.textContent = result.reasoning || currentStudyMoodState.modelReasoning;
      if (studyMoodCameraInsight) {
        studyMoodCameraInsight.textContent = snapshot
          ? `${result.reasoning || "Visual snapshot analyzed."} Top visual emotion: ${visualEmotionLabel}.`
          : "Camera is not contributing to this report yet, so the system is relying on manual state inputs.";
      }
      if (studyMoodCameraHealth) {
        studyMoodCameraHealth.textContent = studyMoodStream
          ? `${signalSourceLabel} / ${visualEmotionLabel}`
          : signalSourceLabel;
      }
      if (studyMoodDriverList) {
        const drivers = result.signalDrivers || currentStudyMoodState.driverHighlights || [];
        studyMoodDriverList.innerHTML = drivers.map((driver) => `<li>${escapeHtml(driver)}</li>`).join("");
      }
      if (studyMoodSignalStrip) {
        const tags = uniqueValues([
          visualEmotionLabel,
          result.source || "study model",
          result.modelEngine || "visual centroid ensemble",
          result.predictedState ? `${titleCaseStudyState(result.predictedState)} state` : ""
        ].filter(Boolean));
        studyMoodSignalStrip.innerHTML = tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
      }
      if (studyMoodExportNote) {
        studyMoodExportNote.textContent = `Export the ${predictedLabel.toLowerCase()} report with ${result.confidenceLabel?.toLowerCase() || "ml-backed confidence"} and ${currentStudyMoodState.sprintPlan.toLowerCase()}.`;
      }

      syncStudyMoodModelMeta({
        modelEngine: result.modelEngine || "Visual centroid ensemble",
        visualEmotion: visualEmotionLabel,
        validationLabel,
        signalSource: signalSourceLabel
      });

      currentStudyMoodState.label = predictedLabel;
      currentStudyMoodState.score = blendedScore;
      currentStudyMoodState.confidence = result.confidenceLabel || currentStudyMoodState.confidence;
      currentStudyMoodState.dynamicAction = result.recommendedAction || currentStudyMoodState.dynamicAction;
      currentStudyMoodState.audioPlan = result.recommendedAudio || currentStudyMoodState.audioPlan;
      currentStudyMoodState.techniquePlan = result.recommendedTechnique || currentStudyMoodState.techniquePlan;
      currentStudyMoodState.coachSummary = result.serverSummary || currentStudyMoodState.coachSummary;
      currentStudyMoodState.modelReasoning = result.reasoning || currentStudyMoodState.modelReasoning;
      currentStudyMoodState.driverHighlights = result.signalDrivers || currentStudyMoodState.driverHighlights;
      currentStudyMoodState.cameraInsight = studyMoodCameraInsight?.textContent || currentStudyMoodState.cameraInsight;
      currentStudyMoodState.modelEngine = result.modelEngine || "Visual centroid ensemble";
      currentStudyMoodState.visualEmotion = visualEmotionLabel;
      currentStudyMoodState.validationLabel = validationLabel;
      currentStudyMoodState.signalSource = signalSourceLabel;
    } catch (error) {
      if (requestToken !== studyMoodRequestToken || !currentStudyMoodState) {
        return;
      }

      syncStudyMoodModelMeta({
        modelEngine: "Visual centroid ensemble",
        visualEmotion: studyMoodStream ? "Camera sync pending" : "Manual baseline",
        validationLabel: "Server sync unavailable",
        signalSource: studyMoodStream ? "Camera + manual study signals" : "Manual study signals"
      });
    }
  }

  function setStudyCameraStatus(text, state = "idle") {
    if (!studyMoodCameraStatus) {
      return;
    }

    studyMoodCameraStatus.textContent = text;
    studyMoodCameraStatus.classList.remove("is-live", "is-warning", "is-idle");
    studyMoodCameraStatus.classList.add(`is-${state}`);
  }

  function resetStudyVisionState() {
    studyMoodVisionState = createInitialVisionState();
  }

  function stopStudyCameraAnalysis() {
    if (studyMoodVisionTimer) {
      window.clearInterval(studyMoodVisionTimer);
      studyMoodVisionTimer = null;
    }
  }

  async function refreshStudyCameraAnalysis() {
    if (!studyMoodStream || !studyMoodVideo) {
      return;
    }

    if (!studyMoodFaceDetector) {
      studyMoodFaceDetector = getFaceDetectorInstance();
    }

    try {
      studyMoodVisionState = await detectCameraVisionState(
        studyMoodVideo,
        studyMoodVisionState,
        studyMoodFaceDetector
      );
    } catch (error) {
      studyMoodVisionState = {
        ...createInitialVisionState(),
        supported: false,
        framing: "Vision analysis unavailable",
        error: error.message || "Face analysis failed."
      };
    }

    if (studyMoodVisionState.supported === true && studyMoodVisionState.faceCount > 0) {
      setStudyCameraStatus(
        `Camera live - ${studyMoodVisionState.framing.toLowerCase()} (${studyMoodVisionState.faceCount} face${studyMoodVisionState.faceCount > 1 ? "s" : ""})`,
        "live"
      );
    } else if (studyMoodVisionState.supported === true) {
      setStudyCameraStatus("Camera live - looking for a face to analyze", "live");
    } else {
      setStudyCameraStatus("Camera live - lighting cues only, FaceDetector unavailable", "live");
    }

    renderStudyMoodDemo();
  }

  function startStudyCameraAnalysis() {
    stopStudyCameraAnalysis();
    void refreshStudyCameraAnalysis();
    studyMoodVisionTimer = window.setInterval(() => {
      void refreshStudyCameraAnalysis();
    }, 1400);
  }

  async function toggleStudyCamera() {
    if (!studyMoodVideo || !studyMoodCameraToggle) {
      return;
    }

    if (studyMoodStream) {
      stopStudyCameraAnalysis();
      stopVideoPreview(studyMoodStream, studyMoodVideo);
      studyMoodStream = null;
      resetStudyVisionState();
      studyMoodCameraToggle.textContent = "Start Camera";
      setStudyCameraStatus("Camera offline - using manual study signals", "idle");
      renderStudyMoodDemo();
      return;
    }

    try {
      setStudyCameraStatus("Connecting camera preview...", "warning");
      studyMoodStream = await startVideoPreview(studyMoodVideo);
      studyMoodCameraToggle.textContent = "Stop Camera";
      setStudyCameraStatus("Camera live - starting local vision analysis", "live");
      startStudyCameraAnalysis();
    } catch (error) {
      stopStudyCameraAnalysis();
      resetStudyVisionState();
      setStudyCameraStatus(error.message || "Camera access failed", "warning");
    }

    renderStudyMoodDemo();
  }

  function renderStudyMoodDemo() {
    const formData = new FormData(studyMoodDemoForm);
    const faceState = formData.get("faceState");
    const sleepHours = Number(formData.get("sleepHours") || 0);
    const sessionMinutes = Number(formData.get("sessionMinutes") || 0);
    const distractionLevel = formData.get("distractionLevel");
    const stressLevel = formData.get("stressLevel");
    const postureQuality = formData.get("postureQuality");
    const ambientNoise = formData.get("ambientNoise");
    const studyGoal = formData.get("studyGoal");
    const profile = moodProfiles[faceState] || moodProfiles.focused;
    const goalProfile = parseStudyGoalBrief(studyGoal);
    const cameraLighting = sampleVideoLighting(studyMoodVideo, studyMoodCanvas);
    const visionState = studyMoodVisionState || createInitialVisionState();
    let score = profile.baseScore;
    const scoreDrivers = [];
    const applyScore = (label, delta) => {
      if (!delta) {
        return;
      }

      score += delta;
      scoreDrivers.push({ label, delta });
    };

    applyScore("Sleep recovery", sleepHours >= 7 ? 8 : sleepHours <= 5 ? -12 : 0);
    applyScore(
      "Session duration",
      sessionMinutes >= 35 && sessionMinutes <= 65
        ? 5
        : sessionMinutes > 110
          ? -11
          : sessionMinutes > 80
            ? -7
            : 0
    );
    applyScore(
      "Distraction load",
      distractionLevel === "high" ? -12 : distractionLevel === "medium" ? -5 : 0
    );
    applyScore("Stress profile", stressLevel === "high" ? -10 : stressLevel === "low" ? 4 : 0);
    applyScore("Posture quality", postureQuality === "aligned" ? 5 : postureQuality === "slumped" ? -7 : 0);
    applyScore("Environment noise", ambientNoise === "quiet" ? 4 : ambientNoise === "busy" ? -9 : 0);
    applyScore("Task intensity", goalProfile.intensity === "high" ? -3 : goalProfile.intensity === "low" ? 2 : 0);
    applyScore("Lighting readiness", cameraLighting?.label === "balanced" ? 4 : cameraLighting?.label === "dim" ? -5 : 0);
    if (studyMoodStream && visionState.supported === true) {
      if (visionState.faceCount > 0) {
        applyScore("Camera framing", visionState.centeredness >= 72 ? 4 : visionState.centeredness <= 45 ? -5 : 0);
        applyScore("Motion stability", visionState.stability >= 70 ? 3 : visionState.stability <= 42 ? -4 : 0);
        applyScore(
          "Face distance",
          visionState.areaRatio >= 0.09 && visionState.areaRatio <= 0.26
            ? 2
            : visionState.areaRatio > 0.36 || visionState.areaRatio < 0.06
              ? -3
              : 0
        );
      } else {
        applyScore("Camera detection", -4);
      }
    }

    score = clamp(Math.round(score), 24, 98);

    let label = profile.label;
    if (score >= 84) label = "Focused";
    else if (score >= 68) label = "Ramping Up";
    else if (score >= 52) label = "Recovering";
    else if (score >= 40) label = "Distracted";
    else label = "Overloaded";

    const confidenceScore = clamp(
      58 +
        (goalProfile.hasBrief ? 10 : 0) +
        (cameraLighting ? 12 : 0) +
        (visionState.supported === true ? 14 : 0) +
        (visionState.faceCount > 0 ? 6 : 0) +
        (sleepHours ? 5 : 0) +
        (sessionMinutes ? 4 : 0),
      54,
      96
    );
    const confidence = confidenceScore >= 86
      ? `High confidence (${confidenceScore}%)`
      : confidenceScore >= 72
        ? `Moderate confidence (${confidenceScore}%)`
        : `Guidance mode (${confidenceScore}%)`;
    const breakMinutes = sessionMinutes >= 90 ? 0 : Math.max(5, 75 - sessionMinutes);
    const breakWindow = breakMinutes === 0 ? "Break now" : `Next reset in ${breakMinutes} min`;
    const environmentScore = clamp(
      100 -
        (ambientNoise === "busy" ? 26 : ambientNoise === "shared" ? 14 : 4) -
        (postureQuality === "slumped" ? 18 : postureQuality === "neutral" ? 8 : 0) -
        (cameraLighting?.label === "dim" ? 10 : 0) -
        (studyMoodStream && visionState.faceCount === 0 ? 8 : 0),
      42,
      96
    );
    const recoveryDemandScore = clamp(
      (stressLevel === "high" ? 68 : stressLevel === "medium" ? 44 : 24) +
        (sleepHours < 6 ? 18 : sleepHours < 7 ? 10 : 0) +
        (sessionMinutes > 75 ? 14 : sessionMinutes > 55 ? 8 : 0),
      12,
      92
    );
    const recoveryScore = recoveryDemandScore >= 68
      ? "High recovery demand"
      : recoveryDemandScore >= 42
        ? "Moderate recovery demand"
        : "Low recovery demand";
    const attentionStability = clamp(
      score +
        (visionState.stability ? Math.round(visionState.stability * 0.18) : 0) +
        (postureQuality === "aligned" ? 5 : postureQuality === "slumped" ? -6 : 0) -
        (distractionLevel === "high" ? 20 : distractionLevel === "medium" ? 9 : 0),
      26,
      97
    );
    const cognitiveLoadValue = clamp(
      (goalProfile.intensity === "high" ? 70 : goalProfile.intensity === "medium" ? 54 : 36) +
        (stressLevel === "high" ? 18 : stressLevel === "medium" ? 8 : 0) +
        (sessionMinutes > 75 ? 12 : sessionMinutes > 55 ? 6 : 0) +
        (sleepHours < 6 ? 12 : sleepHours < 7 ? 6 : -4),
      18,
      96
    );
    const cognitiveLoad = cognitiveLoadValue >= 74
      ? `High load (${cognitiveLoadValue}%)`
      : cognitiveLoadValue >= 52
        ? `Managed load (${cognitiveLoadValue}%)`
        : `Light load (${cognitiveLoadValue}%)`;
    const driftRiskValue = clamp(
      100 - attentionStability +
        (ambientNoise === "busy" ? 10 : ambientNoise === "shared" ? 4 : 0) +
        (studyMoodStream && visionState.faceCount === 0 ? 6 : 0),
      8,
      92
    );
    const driftRisk = driftRiskValue >= 66
      ? `High drift risk (${driftRiskValue}%)`
      : driftRiskValue >= 38
        ? `Moderate drift risk (${driftRiskValue}%)`
        : `Low drift risk (${driftRiskValue}%)`;
    const interventionProfile = score >= 84
      ? "Protected deep-work mode"
      : score >= 68
        ? "Guided momentum mode"
        : score >= 52
          ? "Recovery-first rebuild"
          : "Reset and stabilize mode";
    const sprintPlan = score >= 84
      ? `${Math.min(55, Math.max(35, breakMinutes === 0 ? 35 : breakMinutes))} min protected block`
      : score >= 60
        ? "25 min guided sprint + reset"
        : "10 min recovery + 20 min restart";
    const readiness = score >= 84
      ? "High-output sprint ready"
      : score >= 68
        ? "Stable with light guardrails"
        : score >= 52
          ? "Recovery sprint recommended"
          : "Needs reset before deep work";
    const lightingLabel = cameraLighting ? `${cameraLighting.label} lighting (${cameraLighting.brightness}/255)` : "";
    const cameraHealth = studyMoodStream
      ? visionState.supported === true
        ? visionState.faceCount > 0
          ? `${lightingLabel || "camera live"} / ${visionState.framing.toLowerCase()} / ${visionState.centeredness}% centered`
          : `${lightingLabel || "camera live"} / no face tracked`
        : `${lightingLabel || "camera live"} / lighting-only mode`
      : "Manual mode";
    const dynamicAction = score >= 80
      ? `Commit to ${goalProfile.coaching} for the next focused block.`
      : score >= 55
        ? `Stay with ${goalProfile.mode.toLowerCase()} but reduce pressure and rebuild momentum first.`
        : `Pause ${goalProfile.mode.toLowerCase()} briefly and reset attention before attempting another hard block.`;
    const audioPlan = ambientNoise === "busy"
      ? "Use stronger isolation audio like brown noise or low-lyric focus beats."
      : stressLevel === "high"
        ? "Use calm instrumental tracks with softer transitions and lower volume."
        : profile.audio;
    const techniquePlan = goalProfile.intensity === "high"
      ? `${profile.technique} Add one timed checkpoint at the halfway mark.`
      : `${profile.technique} Keep the task narrow and measurable.`;
    const nlpInsight = `The study brief points to ${goalProfile.mode.toLowerCase()} with ${goalProfile.intensity} complexity, so the coach is prioritizing ${goalProfile.coaching}.`;
    const cameraInsight = studyMoodStream
      ? visionState.supported === true
        ? visionState.faceCount > 0
          ? `On-device browser CV found a ${visionState.framing.toLowerCase()} face with ${visionState.stability}% motion stability, so the coach can trust the camera signal more than manual-only mode.`
          : "The camera is live, but no stable face is currently being tracked, so the model is leaning more on manual study and environment signals."
        : `The camera preview is active, but this browser does not expose FaceDetector, so only lighting readiness is being used right now${lightingLabel ? ` (${lightingLabel})` : ""}.`
      : "Camera is not contributing to this report yet, so the system is relying on manual mood and environment signals.";
    const coachSummary = `${label} state detected. The best next move is ${score >= 68 ? "a protected deep-work sprint" : "a lighter structured recovery block"} aligned to ${goalProfile.mode.toLowerCase()}${studyMoodStream && visionState.faceCount > 0 ? `, with ${visionState.framing.toLowerCase()} camera framing` : ""}.`;
    const signalTags = uniqueValues([
      goalProfile.mode,
      `${sleepHours}h sleep`,
      `${ambientNoise} noise`,
      `${postureQuality} posture`,
      studyMoodStream ? "camera live" : "camera manual",
      cameraLighting ? `${cameraLighting.label} lighting` : "",
      studyMoodStream && visionState.supported === true ? `${visionState.framing.toLowerCase()} face` : "",
      studyMoodStream && visionState.faceCount > 0 ? `${visionState.stability}% stability` : "",
    ]);
    const topDriverLabels = scoreDrivers
      .slice()
      .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))
      .slice(0, 4);
    const driverHighlights = topDriverLabels.map((driver) => `${driver.delta > 0 ? "+" : ""}${driver.delta} ${driver.label}`);
    const strongestPositive = topDriverLabels.find((driver) => driver.delta > 0);
    const strongestNegative = topDriverLabels.find((driver) => driver.delta < 0);
    const modelReasoning = strongestPositive || strongestNegative
      ? `The focus score is being pushed most by ${strongestPositive ? `${strongestPositive.label.toLowerCase()} (${strongestPositive.delta > 0 ? "+" : ""}${strongestPositive.delta})` : "stable baseline signals"}${strongestNegative ? ` while ${strongestNegative.label.toLowerCase()} (${strongestNegative.delta}) is the main drag on sustained performance.` : "."}`
      : "The model is reading a fairly neutral state with no dominant driver overwhelming the rest of the signal stack.";
    const recoveryProtocol = [
      breakMinutes === 0
        ? "Take a short break now before starting the next serious block."
        : `Protect the next ${Math.min(breakMinutes, 25)} minutes from notifications and app switching.`,
      recoveryDemandScore >= 68
        ? "Use a longer reset with hydration, breath control, and a lighter restart task."
        : "Keep the reset brief, then restart with one measurable micro-goal.",
      cognitiveLoadValue >= 74
        ? "Reduce task complexity for the next sprint so the system can rebuild clean momentum."
        : "Use a short recap at the end of the sprint so the following session starts faster."
    ];
    const interventionSteps = [
      {
        title: "Stabilize the environment",
        detail: ambientNoise === "busy"
          ? "Reduce environmental noise or move into a lower-distraction setting before the next sprint."
          : "Keep the current environment stable and remove only digital interruptions."
      },
      {
        title: "Run the next study block",
        detail: breakMinutes === 0
          ? "Take a short break first, then restart with one measurable milestone."
          : `Use the next ${Math.min(breakMinutes, 45)} minutes for ${goalProfile.mode.toLowerCase()} with one success target.`
      },
      {
        title: "Close with recovery",
        detail: stressLevel === "high"
          ? "Add breath work and a softer review step before attempting another intense block."
          : "End the block with a 3 minute recap so the next session starts faster."
      }
    ];
    const tips = [
      `Session length analyzed: ${sessionMinutes} minutes`,
      `Sleep support detected: ${sleepHours} hours`,
      distractionLevel === "high"
        ? "Attention leakage is high. Silence notifications before the next sprint."
        : "Current distraction load is manageable for another controlled block.",
      studyMoodStream && visionState.supported === true
        ? `Browser CV status: ${visionState.framing.toLowerCase()} with ${visionState.stability}% motion stability.`
        : studyMoodStream
          ? "Camera preview is active, but this browser is using lighting-only analysis."
          : "Enable the camera for on-device framing and stability cues.",
      postureQuality === "slumped"
        ? "Posture is weakening focus. Reset seating position before continuing."
        : "Posture signal is stable enough for sustained study."
    ];

    if (studyMoodStatus) studyMoodStatus.textContent = label;
    if (studyMoodScore) studyMoodScore.textContent = `${score}%`;
    if (studyMoodConfidence) studyMoodConfidence.textContent = confidence;
    if (studyMoodAction) studyMoodAction.textContent = dynamicAction;
    if (studyMoodAudio) studyMoodAudio.textContent = audioPlan;
    if (studyMoodTechnique) studyMoodTechnique.textContent = techniquePlan;
    if (studyMoodReadiness) studyMoodReadiness.textContent = readiness;
    if (studyMoodBreakWindow) studyMoodBreakWindow.textContent = breakWindow;
    if (studyMoodTaskMode) studyMoodTaskMode.textContent = goalProfile.mode;
    if (studyMoodCameraHealth) studyMoodCameraHealth.textContent = cameraHealth;
    if (studyMoodEnvironmentScore) studyMoodEnvironmentScore.textContent = `${environmentScore}%`;
    if (studyMoodRecoveryScore) studyMoodRecoveryScore.textContent = recoveryScore;
    if (studyMoodSprintPlan) studyMoodSprintPlan.textContent = sprintPlan;
    if (studyMoodAttentionScore) studyMoodAttentionScore.textContent = `${attentionStability}%`;
    if (studyMoodLoadScore) studyMoodLoadScore.textContent = cognitiveLoad;
    if (studyMoodDriftRisk) studyMoodDriftRisk.textContent = driftRisk;
    if (studyMoodInterventionProfile) studyMoodInterventionProfile.textContent = interventionProfile;
    if (studyMoodNlpInsight) studyMoodNlpInsight.textContent = nlpInsight;
    if (studyMoodCameraInsight) studyMoodCameraInsight.textContent = cameraInsight;
    if (studyMoodCoachSummary) studyMoodCoachSummary.textContent = coachSummary;
    if (studyMoodModelReasoning) studyMoodModelReasoning.textContent = modelReasoning;
    if (studyMoodExportNote) {
      studyMoodExportNote.textContent = `Export the ${label.toLowerCase()} coaching snapshot with ${confidence.toLowerCase()} and ${sprintPlan.toLowerCase()}.`;
    }
    if (studyMoodSignalStrip) {
      studyMoodSignalStrip.innerHTML = signalTags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    }
    if (studyMoodDriverList) {
      studyMoodDriverList.innerHTML = driverHighlights.map((driver) => `<li>${escapeHtml(driver)}</li>`).join("");
    }
    if (studyMoodRecoveryProtocol) {
      studyMoodRecoveryProtocol.innerHTML = recoveryProtocol.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
    }
    if (studyMoodPlan) {
      studyMoodPlan.innerHTML = interventionSteps.map((step) => `
        <li>
          <strong>${escapeHtml(step.title)}</strong>
          <span>${escapeHtml(step.detail)}</span>
        </li>
      `).join("");
    }
    if (studyMoodTips) {
      studyMoodTips.innerHTML = tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");
    }

    syncStudyMoodModelMeta({
      modelEngine: studyMoodStream ? "Visual centroid ensemble + study heuristics" : "Study heuristics",
      visualEmotion: studyMoodStream ? "Camera sync starting" : "Manual baseline",
      validationLabel: studyMoodStream ? "Awaiting server sync" : "Manual guidance mode",
      signalSource: studyMoodStream ? "Camera + manual study signals" : "Manual study signals"
    });

    currentStudyMoodState = {
      label,
      score,
      confidence,
      readiness,
      breakWindow,
      sprintPlan,
      environmentScore,
      recoveryScore,
      attentionStability,
      cognitiveLoad,
      driftRisk,
      interventionProfile,
      mode: goalProfile.mode,
      coachSummary,
      modelReasoning,
      driverHighlights,
      recoveryProtocol,
      dynamicAction,
      audioPlan,
      techniquePlan,
      nlpInsight,
      cameraInsight,
      tips,
      interventionSteps,
      modelEngine: studyMoodStream ? "Visual centroid ensemble + study heuristics" : "Study heuristics",
      visualEmotion: studyMoodStream ? "Camera sync starting" : "Manual baseline",
      validationLabel: studyMoodStream ? "Awaiting server sync" : "Manual guidance mode",
      signalSource: studyMoodStream ? "Camera + manual study signals" : "Manual study signals"
    };

    void hydrateStudyMoodFromServer();
  }

  function scheduleStudyMoodRender() {
    window.clearTimeout(studyMoodRenderTimer);
    studyMoodRenderTimer = window.setTimeout(renderStudyMoodDemo, 180);
  }

  function buildStudyMoodExportText() {
    if (!currentStudyMoodState) {
      return "";
    }

    const lines = [
      "Study Mood Demo Report",
      `State: ${currentStudyMoodState.label}`,
      `Score: ${currentStudyMoodState.score}%`,
      `Confidence: ${currentStudyMoodState.confidence}`,
      `Readiness: ${currentStudyMoodState.readiness}`,
      `Task mode: ${currentStudyMoodState.mode}`,
      `Next break: ${currentStudyMoodState.breakWindow}`,
      `Sprint plan: ${currentStudyMoodState.sprintPlan}`,
      `Environment score: ${currentStudyMoodState.environmentScore}%`,
      `Recovery profile: ${currentStudyMoodState.recoveryScore}`,
      `Attention stability: ${currentStudyMoodState.attentionStability}%`,
      `Cognitive load: ${currentStudyMoodState.cognitiveLoad}`,
      `Drift risk: ${currentStudyMoodState.driftRisk}`,
      `Intervention profile: ${currentStudyMoodState.interventionProfile}`,
      "",
      `Primary action: ${currentStudyMoodState.dynamicAction}`,
      `Audio cue: ${currentStudyMoodState.audioPlan}`,
      `Technique: ${currentStudyMoodState.techniquePlan}`,
      `NLP insight: ${currentStudyMoodState.nlpInsight}`,
      `Vision insight: ${currentStudyMoodState.cameraInsight}`,
      `Model reasoning: ${currentStudyMoodState.modelReasoning}`,
      `Model engine: ${currentStudyMoodState.modelEngine || "Study heuristics"}`,
      `Visual emotion: ${currentStudyMoodState.visualEmotion || "Manual baseline"}`,
      `Validation: ${currentStudyMoodState.validationLabel || "Manual guidance mode"}`,
      `Signal source: ${currentStudyMoodState.signalSource || "Manual study signals"}`,
      "",
      "Intervention sequence:"
    ];

    currentStudyMoodState.interventionSteps.forEach((step, index) => {
      lines.push(`${index + 1}. ${step.title} - ${step.detail}`);
    });

    lines.push("", "Quick tips:");
    currentStudyMoodState.tips.forEach((tip, index) => {
      lines.push(`${index + 1}. ${tip}`);
    });

    lines.push("", "Signal drivers:");
    currentStudyMoodState.driverHighlights.forEach((item, index) => {
      lines.push(`${index + 1}. ${item}`);
    });

    lines.push("", "Recovery protocol:");
    currentStudyMoodState.recoveryProtocol.forEach((item, index) => {
      lines.push(`${index + 1}. ${item}`);
    });

    return lines.join("\n");
  }

  studyMoodDemoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderStudyMoodDemo();
  });

  studyMoodDemoForm.addEventListener("input", scheduleStudyMoodRender);
  studyMoodDemoForm.addEventListener("change", scheduleStudyMoodRender);

  studyMoodDemoForm.addEventListener("reset", () => {
    window.setTimeout(renderStudyMoodDemo, 0);
  });

  studyMoodCopyButton?.addEventListener("click", async () => {
    try {
      await copyPlainText(buildStudyMoodExportText());
      flashTemporaryButtonLabel(studyMoodCopyButton, "Copied");
    } catch (error) {
      flashTemporaryButtonLabel(studyMoodCopyButton, "Retry");
    }
  });

  studyMoodDownloadButton?.addEventListener("click", () => {
    downloadPlainTextFile("study-mood-report.txt", buildStudyMoodExportText());
    flashTemporaryButtonLabel(studyMoodDownloadButton, "Saved");
  });

  studyMoodCameraToggle?.addEventListener("click", toggleStudyCamera);
  window.addEventListener("pagehide", () => {
    stopStudyCameraAnalysis();
    if (studyMoodStream) {
      stopVideoPreview(studyMoodStream, studyMoodVideo);
      studyMoodStream = null;
    }
    resetStudyVisionState();
  });

  renderStudyMoodDemo();
}

const dietPlannerDemoForm = document.getElementById("dietPlannerDemoForm");
if (dietPlannerDemoForm) {
  const dietCaloriesTarget = document.getElementById("dietCaloriesTarget");
  const dietProteinTarget = document.getElementById("dietProteinTarget");
  const dietHydrationTarget = document.getElementById("dietHydrationTarget");
  const dietMacroTarget = document.getElementById("dietMacroTarget");
  const dietPlanningMode = document.getElementById("dietPlanningMode");
  const dietConsistencyScore = document.getElementById("dietConsistencyScore");
  const dietBudgetEstimate = document.getElementById("dietBudgetEstimate");
  const dietPrepLoad = document.getElementById("dietPrepLoad");
  const dietMealRhythm = document.getElementById("dietMealRhythm");
  const dietMetabolicFit = document.getElementById("dietMetabolicFit");
  const dietSatietyScore = document.getElementById("dietSatietyScore");
  const dietMicronutrientCoverage = document.getElementById("dietMicronutrientCoverage");
  const dietAdherenceRisk = document.getElementById("dietAdherenceRisk");
  const dietModelEngine = document.getElementById("dietModelEngine");
  const dietModelConfidence = document.getElementById("dietModelConfidence");
  const dietModelValidation = document.getElementById("dietModelValidation");
  const dietModelClusterQuality = document.getElementById("dietModelClusterQuality");
  const dietExportNote = document.getElementById("dietExportNote");
  const dietCopyButton = document.getElementById("dietCopyButton");
  const dietDownloadButton = document.getElementById("dietDownloadButton");
  const dietPlannerSummary = document.getElementById("dietPlannerSummary");
  const dietMacroRationale = document.getElementById("dietMacroRationale");
  const dietPlanGrid = document.getElementById("dietPlanGrid");
  const dietPlannerTips = document.getElementById("dietPlannerTips");
  const dietPlannerTagStrip = document.getElementById("dietPlannerTagStrip");
  const dietGroceryList = document.getElementById("dietGroceryList");
  const dietRoutineList = document.getElementById("dietRoutineList");
  const dietSwapList = document.getElementById("dietSwapList");
  const dietCoachProtocol = document.getElementById("dietCoachProtocol");
  const dietShoppingZones = document.getElementById("dietShoppingZones");
  let dietRequestToken = 0;
  let currentDietPlanState = null;
  let dietRenderTimer = 0;

  const mealLibrary = {
    balanced: {
      breakfast: [
        { title: "Oats bowl with banana and chia", detail: "Slow carbs and fiber for stable morning energy.", groceries: ["oats", "banana", "chia seeds"] },
        { title: "Paneer vegetable toast", detail: "Balanced protein and carbs with quick assembly.", groceries: ["paneer", "bread", "bell peppers"] },
        { title: "Greek yogurt parfait", detail: "Cool, light, and easy for moderate calorie days.", groceries: ["greek yogurt", "berries", "granola"] }
      ],
      lunch: [
        { title: "Rice, dal, and salad plate", detail: "Reliable lunch structure with plant protein and fiber.", groceries: ["rice", "dal", "cucumber", "tomato"] },
        { title: "Quinoa vegetable bowl", detail: "High-volume lunch for steady productivity hours.", groceries: ["quinoa", "broccoli", "carrot", "olive oil"] },
        { title: "Roti with paneer curry", detail: "Comfort meal with moderate protein support.", groceries: ["whole wheat flour", "paneer", "spinach"] }
      ],
      dinner: [
        { title: "Khichdi with yogurt", detail: "Gentle dinner with easy digestion.", groceries: ["rice", "moong dal", "curd"] },
        { title: "Tofu stir fry with greens", detail: "Protein-led dinner that stays lighter at night.", groceries: ["tofu", "greens", "soy sauce"] },
        { title: "Lentil soup and toast", detail: "Warm, simple, and recovery-friendly.", groceries: ["lentils", "bread", "garlic"] }
      ],
      snack: [
        { title: "Roasted chana and fruit", detail: "Easy portable snack for mid-day hunger control.", groceries: ["roasted chana", "apple"] },
        { title: "Buttermilk and nuts", detail: "Light recovery snack with hydration support.", groceries: ["buttermilk", "almonds"] },
        { title: "Peanut butter toast", detail: "Simple energy top-up before evening work.", groceries: ["bread", "peanut butter"] }
      ]
    },
    vegetarian: {
      breakfast: [
        { title: "Besan chilla with curd", detail: "Quick vegetarian breakfast with stronger protein support.", groceries: ["besan", "curd", "onion"] },
        { title: "Poha with peanuts", detail: "Familiar Indian breakfast with easy prep.", groceries: ["poha", "peanuts", "curry leaves"] },
        { title: "Sprouts and paneer bowl", detail: "Higher-protein vegetarian start with better satiety.", groceries: ["sprouts", "paneer", "lemon"] }
      ],
      lunch: [
        { title: "Rajma rice combo", detail: "Plant protein and carb balance for mid-day fuel.", groceries: ["rajma", "rice", "onion", "tomato"] },
        { title: "Paneer millet bowl", detail: "Higher protein lunch with slower carbs.", groceries: ["paneer", "millet", "capsicum"] },
        { title: "Mixed dal and chapati", detail: "Budget-friendly vegetarian meal with strong fiber.", groceries: ["mixed dal", "whole wheat flour"] }
      ],
      dinner: [
        { title: "Moong khichdi with sauteed veg", detail: "Low-oil comfort dinner for better digestion.", groceries: ["moong dal", "rice", "carrot"] },
        { title: "Tofu curry with roti", detail: "Protein-forward vegetarian dinner.", groceries: ["tofu", "whole wheat flour", "peas"] },
        { title: "Vegetable soup and toast", detail: "Light dinner for lower-stress evenings.", groceries: ["mixed vegetables", "bread"] }
      ],
      snack: [
        { title: "Fruit and roasted makhana", detail: "Light snack with gentle crunch and volume.", groceries: ["seasonal fruit", "makhana"] },
        { title: "Curd with seeds", detail: "Cool snack that supports digestion and satiety.", groceries: ["curd", "mixed seeds"] },
        { title: "Sprouts chaat", detail: "Fresh mid-day protein with minimal cooking.", groceries: ["sprouts", "onion", "tomato"] }
      ]
    },
    highProtein: {
      breakfast: [
        { title: "Protein smoothie bowl", detail: "Fast high-protein breakfast for training or muscle gain goals.", groceries: ["milk", "banana", "protein powder", "oats"] },
        { title: "Paneer scramble wrap", detail: "Portable breakfast with stronger protein density.", groceries: ["paneer", "roti", "capsicum"] },
        { title: "Egg and oats plate", detail: "Simple macro-balanced breakfast for active days.", groceries: ["eggs", "oats", "spinach"] }
      ],
      lunch: [
        { title: "Chicken rice power bowl", detail: "High-protein lunch with controlled carbs.", groceries: ["chicken", "rice", "lettuce"] },
        { title: "Paneer quinoa bowl", detail: "Vegetarian protein bowl with stronger satiety.", groceries: ["paneer", "quinoa", "broccoli"] },
        { title: "Dal tofu performance plate", detail: "Plant-heavy protein lunch with fiber support.", groceries: ["dal", "tofu", "brown rice"] }
      ],
      dinner: [
        { title: "Grilled chicken with vegetables", detail: "Lean protein dinner with lower heaviness.", groceries: ["chicken", "zucchini", "beans"] },
        { title: "Paneer tikka with greens", detail: "Vegetarian protein dinner that still feels satisfying.", groceries: ["paneer", "lettuce", "yogurt"] },
        { title: "Lentil soup with tofu cubes", detail: "Recovery-oriented protein dinner for late evenings.", groceries: ["lentils", "tofu", "garlic"] }
      ],
      snack: [
        { title: "Greek yogurt protein cup", detail: "Compact recovery snack with steady protein.", groceries: ["greek yogurt", "berries"] },
        { title: "Boiled eggs and fruit", detail: "Fast snack for long workdays or gym timing.", groceries: ["eggs", "orange"] },
        { title: "Soy nuts and buttermilk", detail: "Portable combination for protein and hydration.", groceries: ["soy nuts", "buttermilk"] }
      ]
    }
  };

  function buildDietRoutine(goal, prepTime, activityLevel) {
    const morning = prepTime === "quick"
      ? "Prep breakfast and one snack in under 15 minutes."
      : prepTime === "batch"
        ? "Use batch-prepped staples for breakfast and lunch assembly."
        : "Use a moderate-prep breakfast with enough protein for the morning block.";
    const midday = activityLevel === "high"
      ? "Keep lunch carb support stronger to protect afternoon energy."
      : "Use a balanced lunch and short walk to improve digestion and alertness.";
    const evening = goal === "fatLoss"
      ? "Close the day with a lighter dinner and stop random snacking after it."
      : goal === "muscleGain"
        ? "Anchor dinner around protein and include recovery carbs."
        : "Keep dinner moderate and easy to digest so consistency stays high.";

    return [morning, midday, evening];
  }

  function renderDietMeals(meals) {
    if (!dietPlanGrid) {
      return;
    }

    dietPlanGrid.innerHTML = (meals || []).map((meal) => {
      const title = (meal.mealType || meal.slot || "meal").charAt(0).toUpperCase() + (meal.mealType || meal.slot || "meal").slice(1);
      const nutritionLine = meal.calories || meal.protein
        ? `
            <ul class="demo-inline-list">
              ${meal.calories ? `<li>${escapeHtml(String(meal.calories))} kcal</li>` : ""}
              ${meal.protein ? `<li>${escapeHtml(String(meal.protein))}g protein</li>` : ""}
              ${meal.source ? `<li>${escapeHtml(meal.source)}</li>` : ""}
            </ul>
          `
        : "";

      return `
        <article class="demo-output-card">
          <h4>${escapeHtml(title)}</h4>
          <p>${escapeHtml(meal.title || "")}</p>
          <p class="demo-mini-copy">${escapeHtml(meal.detail || meal.description || "")}</p>
          ${nutritionLine}
        </article>
      `;
    }).join("");
  }

  function buildDietDerivedMetrics({ mealsPerDay, activityLevel, prepTime, budgetLevel, groceries }) {
    const consistencyScore = clamp(
      74 +
        (prepTime === "quick" ? 10 : prepTime === "batch" ? 8 : 4) +
        (budgetLevel === "smart" ? 8 : budgetLevel === "flexible" ? 4 : -2) +
        (mealsPerDay >= 4 ? 4 : 0) +
        (activityLevel === "high" ? 2 : 0),
      64,
      97
    );
    const budgetEstimate = budgetLevel === "smart"
      ? "Budget-smart daily basket"
      : budgetLevel === "premium"
        ? "Premium grocery basket"
        : "Flexible mid-range basket";
    const prepLoad = prepTime === "quick"
      ? "Quick kitchen flow"
      : prepTime === "batch"
        ? "Batch-prep optimized"
        : "Moderate cooking load";
    const mealRhythm = mealsPerDay >= 5
      ? "Frequent smaller meals"
      : mealsPerDay === 4
        ? "Evenly spaced support"
        : "Three strong anchors";

    return {
      consistencyScore,
      budgetEstimate,
      prepLoad,
      mealRhythm,
      groceryCount: uniqueValues(groceries || []).length
    };
  }

  function buildDietShoppingZones(groceries) {
    const catalog = {
      proteins: ["paneer", "tofu", "chicken", "eggs", "dal", "rajma", "lentils", "greek yogurt", "curd", "yogurt", "sprouts", "soy", "milk", "protein powder"],
      produce: ["banana", "berries", "spinach", "greens", "broccoli", "carrot", "cucumber", "tomato", "lettuce", "capsicum", "peppers", "zucchini", "fruit", "orange", "apple", "lemon"],
      smartCarbs: ["oats", "rice", "quinoa", "millet", "poha", "bread", "roti", "whole wheat flour", "brown rice", "granola"],
      support: ["chia seeds", "mixed seeds", "almonds", "peanut butter", "olive oil", "garlic", "buttermilk", "makhana"]
    };

    const grouped = {
      proteins: [],
      produce: [],
      smartCarbs: [],
      support: []
    };

    (groceries || []).forEach((item) => {
      const normalizedItem = normalizeText(item);
      const group = Object.entries(catalog).find(([, keywords]) => keywords.some((keyword) => normalizedItem.includes(keyword)));
      if (group) {
        grouped[group[0]].push(item);
      } else {
        grouped.support.push(item);
      }
    });

    return [
      grouped.proteins.length ? `Protein anchors: ${uniqueValues(grouped.proteins).slice(0, 3).join(", ")}` : "",
      grouped.produce.length ? `Produce base: ${uniqueValues(grouped.produce).slice(0, 3).join(", ")}` : "",
      grouped.smartCarbs.length ? `Smart carbs: ${uniqueValues(grouped.smartCarbs).slice(0, 3).join(", ")}` : "",
      grouped.support.length ? `Support items: ${uniqueValues(grouped.support).slice(0, 3).join(", ")}` : ""
    ].filter(Boolean);
  }

  function buildDietAdvancedDiagnostics({
    goal,
    dietType,
    activityLevel,
    prepTime,
    budgetLevel,
    mealsPerDay,
    groceries,
    parsedBrief,
    mealPlan,
    allergies,
    adjustedCalories
  }) {
    const diversityScore = clamp(uniqueValues(groceries || []).length * 9, 36, 94);
    const metabolicFitValue = clamp(
      72 +
        (goal === "muscleGain" ? 8 : goal === "fatLoss" ? 6 : 4) +
        (dietType === "highProtein" ? 8 : dietType === "vegetarian" ? 4 : 6) +
        (activityLevel === "high" ? 6 : activityLevel === "low" ? 2 : 4) +
        (parsedBrief.hasBrief ? 5 : 0),
      68,
      97
    );
    const satietyValue = clamp(
      70 +
        (dietType === "highProtein" ? 10 : dietType === "vegetarian" ? 6 : 4) +
        (mealsPerDay >= 4 ? 5 : 1) +
        (prepTime === "batch" ? 4 : prepTime === "quick" ? 2 : 3) -
        (goal === "fatLoss" && adjustedCalories < 1700 ? 6 : 0),
      58,
      96
    );
    const micronutrientValue = clamp(
      diversityScore +
        (parsedBrief.tags.includes("fiber-aware") ? 4 : 0) +
        (parsedBrief.tags.includes("fresh produce") ? 6 : 0),
      52,
      97
    );
    const adherenceRiskValue = clamp(
      20 +
        (prepTime === "moderate" ? 12 : prepTime === "batch" ? 6 : 3) +
        (budgetLevel === "premium" ? 10 : budgetLevel === "smart" ? -4 : 2) +
        (allergies.length ? 8 : 0) +
        (parsedBrief.hasBrief && parsedBrief.tags.length > 4 ? 6 : 0),
      8,
      74
    );
    const adherenceRisk = adherenceRiskValue >= 56
      ? `High friction risk (${adherenceRiskValue}%)`
      : adherenceRiskValue >= 32
        ? `Moderate friction risk (${adherenceRiskValue}%)`
        : `Low friction risk (${adherenceRiskValue}%)`;
    const satietyLabel = satietyValue >= 86
      ? `Very stable (${satietyValue}%)`
      : satietyValue >= 72
        ? `Stable hunger control (${satietyValue}%)`
        : `Needs stronger anchors (${satietyValue}%)`;
    const micronutrientLabel = micronutrientValue >= 86
      ? `Wide coverage (${micronutrientValue}%)`
      : micronutrientValue >= 72
        ? `Good spread (${micronutrientValue}%)`
        : `Improve produce rotation (${micronutrientValue}%)`;
    const macroRationale = `The planner is tuning calories for ${goal === "muscleGain" ? "growth and recovery" : goal === "fatLoss" ? "fat loss without sharp energy crashes" : "steady maintenance"}, then adjusting protein density and meal timing to fit ${activityLevel} activity and ${prepTime} prep capacity.`;
    const mealTitles = (mealPlan || []).map((meal) => meal.title).filter(Boolean);
    const swapList = [
      dietType === "highProtein"
        ? "Swap one carb-heavy snack for a protein-forward option on busy days."
        : "Swap low-protein snacks for curd, sprouts, or paneer when hunger rises early.",
      prepTime === "quick"
        ? "Keep one 10-minute breakfast backup ready for rushed mornings."
        : "Use one batch-cooked lunch base so weekdays stay easier to follow.",
      budgetLevel === "smart"
        ? "Replace premium ingredients with repeatable staples when cost starts drifting up."
        : "Rotate ingredients weekly so the plan stays interesting without breaking adherence.",
      mealTitles.length ? `If ${mealTitles[0]} feels repetitive, rotate it with another meal from the same slot.` : ""
    ].filter(Boolean);
    const coachProtocol = [
      mealsPerDay >= 4
        ? "Anchor the day with 4 repeatable meal touchpoints so energy stays flatter."
        : "Use 3 strong meals and one optional snack only when hunger or workload demands it.",
      activityLevel === "high"
        ? "Place the strongest carb support around the most active part of the day."
        : "Keep the heaviest meal away from the lowest-movement part of the day.",
      goal === "fatLoss"
        ? "Protect protein at every meal so the plan feels sustainable while calories stay controlled."
        : goal === "muscleGain"
          ? "Use the recovery meal consistently after the hardest effort window."
          : "Prioritize routine consistency over aggressive restriction."
    ];
    const shoppingZones = buildDietShoppingZones(groceries);

    return {
      metabolicFitValue,
      satietyLabel,
      micronutrientLabel,
      adherenceRisk,
      macroRationale,
      swapList,
      coachProtocol,
      shoppingZones
    };
  }

  function syncDietDerivedMetrics(metrics) {
    if (dietConsistencyScore) dietConsistencyScore.textContent = `${metrics.consistencyScore}%`;
    if (dietBudgetEstimate) dietBudgetEstimate.textContent = metrics.budgetEstimate;
    if (dietPrepLoad) dietPrepLoad.textContent = metrics.prepLoad;
    if (dietMealRhythm) dietMealRhythm.textContent = metrics.mealRhythm;
  }

  function syncDietAdvancedDiagnostics(diagnostics) {
    if (dietMetabolicFit) dietMetabolicFit.textContent = `${diagnostics.metabolicFitValue}%`;
    if (dietSatietyScore) dietSatietyScore.textContent = diagnostics.satietyLabel;
    if (dietMicronutrientCoverage) dietMicronutrientCoverage.textContent = diagnostics.micronutrientLabel;
    if (dietAdherenceRisk) dietAdherenceRisk.textContent = diagnostics.adherenceRisk;
    if (dietMacroRationale) dietMacroRationale.textContent = diagnostics.macroRationale;
    if (dietSwapList) {
      dietSwapList.innerHTML = diagnostics.swapList.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    }
    if (dietCoachProtocol) {
      dietCoachProtocol.innerHTML = diagnostics.coachProtocol.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    }
    if (dietShoppingZones) {
      dietShoppingZones.innerHTML = diagnostics.shoppingZones.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    }
  }

  function buildDietExportText() {
    if (!currentDietPlanState) {
      return "";
    }

    const lines = [
      "Diet Planner Demo Report",
      currentDietPlanState.summary,
      `Calories: ${currentDietPlanState.calories}`,
      `Protein target: ${currentDietPlanState.protein}`,
      `Hydration: ${currentDietPlanState.hydration}`,
      `Macro split: ${currentDietPlanState.macro}`,
      `Planning mode: ${currentDietPlanState.mode}`,
      `Consistency score: ${currentDietPlanState.consistency}`,
      `Metabolic fit: ${currentDietPlanState.metabolicFit}`,
      `Satiety balance: ${currentDietPlanState.satiety}`,
      `Micronutrient coverage: ${currentDietPlanState.micronutrients}`,
      `Adherence risk: ${currentDietPlanState.adherenceRisk}`,
      `Model engine: ${currentDietPlanState.modelEngine || "Nutrition planner"}`,
      `Model confidence: ${currentDietPlanState.modelConfidence || "Preview ranking mode"}`,
      `Validation: ${currentDietPlanState.modelValidation || "Awaiting dataset-backed sync"}`,
      `Cluster quality: ${currentDietPlanState.clusterQuality || "Cluster diagnostics pending"}`,
      `Budget estimate: ${currentDietPlanState.budget}`,
      `Prep load: ${currentDietPlanState.prepLoad}`,
      `Meal rhythm: ${currentDietPlanState.mealRhythm}`,
      "",
      `Macro reasoning: ${currentDietPlanState.macroRationale}`,
      "",
      "Meal plan:"
    ];

    currentDietPlanState.meals.forEach((meal, index) => {
      const label = meal.mealType || meal.slot || "Meal";
      lines.push(`${index + 1}. ${label} - ${meal.title}`);
      if (meal.detail || meal.description) {
        lines.push(`   ${meal.detail || meal.description}`);
      }
    });

    lines.push("", "Groceries:");
    currentDietPlanState.groceries.forEach((item, index) => {
      lines.push(`${index + 1}. ${item}`);
    });

    lines.push("", "Routine:");
    currentDietPlanState.routine.forEach((item, index) => {
      lines.push(`${index + 1}. ${item}`);
    });

    lines.push("", "Smart swaps:");
    currentDietPlanState.swapList.forEach((item, index) => {
      lines.push(`${index + 1}. ${item}`);
    });

    lines.push("", "Execution protocol:");
    currentDietPlanState.coachProtocol.forEach((item, index) => {
      lines.push(`${index + 1}. ${item}`);
    });

    return lines.join("\n");
  }

  async function hydrateDietPlannerFromServer() {
    const requestToken = ++dietRequestToken;
    const payload = Object.fromEntries(new FormData(dietPlannerDemoForm).entries());
    payload.calories = Number(payload.calories || 0);
    payload.mealsPerDay = Number(payload.mealsPerDay || 0);

    try {
      const result = await postPortfolioJson("/api/diet-plan", payload, 7000);

      if (requestToken !== dietRequestToken) {
        return;
      }

      if (dietCaloriesTarget) dietCaloriesTarget.textContent = `${result.adjustedCalories} kcal`;
      if (dietProteinTarget) dietProteinTarget.textContent = result.proteinTarget;
      if (dietHydrationTarget) dietHydrationTarget.textContent = result.hydrationTarget;
      if (dietMacroTarget) dietMacroTarget.textContent = result.macroTarget;
      if (dietPlanningMode) dietPlanningMode.textContent = result.planningMode;
      if (dietPlannerSummary) dietPlannerSummary.textContent = result.summary;
      if (dietModelEngine) dietModelEngine.textContent = result.modelEngine || "Nutrition vector recommender";
      if (dietModelConfidence) dietModelConfidence.textContent = result.modelConfidence || "ML-ranked plan";
      if (dietModelValidation) {
        dietModelValidation.textContent = `${formatPercentageLabel((result.modelMetrics?.preference_match_rate || 0) * 100)} preference match`;
      }
      if (dietModelClusterQuality) {
        dietModelClusterQuality.textContent = `${formatPercentageLabel((result.modelMetrics?.cluster_separation_score || 0) * 100)} separation`;
      }
      const derivedMetrics = buildDietDerivedMetrics({
        mealsPerDay: payload.mealsPerDay,
        activityLevel: payload.activityLevel,
        prepTime: payload.prepTime,
        budgetLevel: payload.budgetLevel,
        groceries: result.groceries || []
      });
      const diagnostics = buildDietAdvancedDiagnostics({
        goal: payload.goal,
        dietType: payload.dietType,
        activityLevel: payload.activityLevel,
        prepTime: payload.prepTime,
        budgetLevel: payload.budgetLevel,
        mealsPerDay: payload.mealsPerDay,
        groceries: result.groceries || [],
        parsedBrief: parseDietBrief(payload.dietBrief),
        mealPlan: result.meals || [],
        allergies: String(payload.allergies || "")
          .split(",")
          .map((item) => normalizeText(item))
          .filter((item) => item && item !== "none"),
        adjustedCalories: result.adjustedCalories
      });
      syncDietDerivedMetrics(derivedMetrics);
      syncDietAdvancedDiagnostics(diagnostics);
      if (dietExportNote) {
        dietExportNote.textContent = `Export this ${result.planningMode.toLowerCase()} plan with ${derivedMetrics.consistencyScore}% consistency support and a ${derivedMetrics.prepLoad.toLowerCase()}.`;
      }
      if (dietPlannerTagStrip) {
        dietPlannerTagStrip.innerHTML = (result.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
      }
      renderDietMeals(result.meals);
      if (dietGroceryList) {
        dietGroceryList.innerHTML = (result.groceries || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      }
      if (dietRoutineList) {
        dietRoutineList.innerHTML = (result.routine || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      }
      if (dietPlannerTips) {
        dietPlannerTips.innerHTML = (result.tips || []).map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");
      }
      currentDietPlanState = {
        summary: result.summary,
        calories: `${result.adjustedCalories} kcal`,
        protein: result.proteinTarget,
        hydration: result.hydrationTarget,
        macro: result.macroTarget,
        mode: result.planningMode,
        consistency: `${derivedMetrics.consistencyScore}%`,
        metabolicFit: `${diagnostics.metabolicFitValue}%`,
          satiety: diagnostics.satietyLabel,
          micronutrients: diagnostics.micronutrientLabel,
          adherenceRisk: diagnostics.adherenceRisk,
          modelEngine: result.modelEngine || "Nutrition vector recommender",
          modelConfidence: result.modelConfidence || "ML-ranked plan",
          modelValidation: `${formatPercentageLabel((result.modelMetrics?.preference_match_rate || 0) * 100)} preference match`,
          clusterQuality: `${formatPercentageLabel((result.modelMetrics?.cluster_separation_score || 0) * 100)} separation`,
          budget: derivedMetrics.budgetEstimate,
          prepLoad: derivedMetrics.prepLoad,
          mealRhythm: derivedMetrics.mealRhythm,
        macroRationale: diagnostics.macroRationale,
        meals: result.meals || [],
        groceries: result.groceries || [],
        routine: result.routine || [],
        swapList: diagnostics.swapList,
        coachProtocol: diagnostics.coachProtocol
      };
    } catch (error) {
      if (requestToken !== dietRequestToken) {
        return;
      }

      if (dietModelEngine) dietModelEngine.textContent = "Local preview planner";
      if (dietModelConfidence) dietModelConfidence.textContent = "Server sync unavailable";
      if (dietModelValidation) dietModelValidation.textContent = "Using local nutrition preview";
      if (dietModelClusterQuality) dietModelClusterQuality.textContent = "Dataset sync pending";
    }
  }

  function renderDietPlannerDemo() {
    const formData = new FormData(dietPlannerDemoForm);
    const brief = formData.get("dietBrief");
    const parsedBrief = parseDietBrief(brief);
    const explicitGoal = formData.get("goal");
    const explicitDietType = formData.get("dietType");
    const explicitAllergies = String(formData.get("allergies") || "None").trim();
    const calorieTarget = Number(formData.get("calories") || 1800);
    const mealsPerDay = Number(formData.get("mealsPerDay") || 4);
    const activityLevel = formData.get("activityLevel");
    const prepTime = parsedBrief.prepOverride || formData.get("prepTime");
    const budgetLevel = parsedBrief.budgetOverride || formData.get("budgetLevel");
    const goal = parsedBrief.goalOverride || explicitGoal;
    const dietType = parsedBrief.dietOverride || explicitDietType;
    const allergies = uniqueValues([
      ...parsedBrief.allergies,
      ...explicitAllergies.split(",").map((item) => normalizeText(item)).filter((item) => item && item !== "none")
    ]);

    const goalLabels = {
      fatLoss: "fat loss",
      maintain: "maintenance",
      muscleGain: "muscle gain"
    };

    const activityAdjust = activityLevel === "high" ? 140 : activityLevel === "low" ? -90 : 0;
    const calorieAdjust = goal === "fatLoss" ? -180 : goal === "muscleGain" ? 220 : 0;
    const adjustedCalories = Math.max(1300, calorieTarget + calorieAdjust + activityAdjust);
    const proteinTarget = goal === "muscleGain" ? "125-145 g" : goal === "fatLoss" ? "100-120 g" : "85-105 g";
    const hydrationTarget = activityLevel === "high" ? "3.4 L" : activityLevel === "low" ? "2.5 L" : "2.9 L";
    const macroTarget = goal === "muscleGain"
      ? "40C / 30P / 30F"
      : goal === "fatLoss"
        ? "30C / 35P / 35F"
        : "35C / 30P / 35F";
    const planningMode = `${goalLabels[goal]} / ${prepTime} prep / ${budgetLevel} budget`;
    const mealSource = mealLibrary[dietType] || mealLibrary.balanced;
    const mealOrder = mealsPerDay >= 5
      ? ["breakfast", "snack", "lunch", "snack", "dinner"]
      : mealsPerDay === 3
        ? ["breakfast", "lunch", "dinner"]
        : ["breakfast", "lunch", "snack", "dinner"];
    const seed = getTextSeed(`${brief}-${goal}-${dietType}-${budgetLevel}-${prepTime}`);
    const mealPlan = mealOrder.map((mealType, index) => {
      const options = mealSource[mealType] || mealSource.snack;
      const choice = pickDeterministicOption(options, seed, index) || options[0];
      return {
        mealType,
        ...choice
      };
    });
    const groceries = uniqueValues(
      mealPlan.flatMap((meal) => meal.groceries || [])
        .filter((item) => !allergies.some((allergy) => item.includes(allergy)))
    ).slice(0, 8);
    const tags = uniqueValues([
      goalLabels[goal],
      dietType === "highProtein" ? "high protein engine" : dietType,
      prepTime === "quick" ? "fast prep" : prepTime === "batch" ? "batch workflow" : "standard prep",
      budgetLevel === "smart" ? "budget-aware" : budgetLevel,
      ...parsedBrief.tags
    ]);
    const routine = buildDietRoutine(goal, prepTime, activityLevel);
    const derivedMetrics = buildDietDerivedMetrics({
      mealsPerDay,
      activityLevel,
      prepTime,
      budgetLevel,
      groceries
    });
    const quickTips = [
      allergies.length ? `Filter these ingredients carefully: ${allergies.join(", ")}.` : "No additional allergies detected beyond the form inputs.",
      "Keep one anchor meal predictable so the plan is easier to follow on busy days.",
      activityLevel === "high"
        ? "Use hydration and mid-day carbs to keep energy stable across longer active periods."
        : "Use meal timing consistency to improve appetite control and digestion.",
      budgetLevel === "smart"
        ? "Batch cook one lunch base to reduce cost and decision fatigue."
        : "Use ingredient rotation to prevent the plan from feeling repetitive."
    ];
    const diagnostics = buildDietAdvancedDiagnostics({
      goal,
      dietType,
      activityLevel,
      prepTime,
      budgetLevel,
      mealsPerDay,
      groceries,
      parsedBrief,
      mealPlan,
      allergies,
      adjustedCalories
    });

    if (dietCaloriesTarget) dietCaloriesTarget.textContent = `${adjustedCalories} kcal`;
    if (dietProteinTarget) dietProteinTarget.textContent = proteinTarget;
    if (dietHydrationTarget) dietHydrationTarget.textContent = hydrationTarget;
    if (dietMacroTarget) dietMacroTarget.textContent = macroTarget;
    if (dietPlanningMode) dietPlanningMode.textContent = planningMode;
    syncDietDerivedMetrics(derivedMetrics);
    syncDietAdvancedDiagnostics(diagnostics);
    if (dietModelEngine) dietModelEngine.textContent = "Nutrition heuristics + dataset planner";
    if (dietModelConfidence) dietModelConfidence.textContent = "Preview ranking mode";
    if (dietModelValidation) dietModelValidation.textContent = "Awaiting dataset-backed sync";
    if (dietModelClusterQuality) dietModelClusterQuality.textContent = "Cluster diagnostics pending";
    if (dietPlannerSummary) {
      dietPlannerSummary.textContent = `This plan blends ${goalLabels[goal]}, ${dietType} meal logic, ${prepTime} preparation, and ${budgetLevel} ingredient strategy. ${parsedBrief.hasBrief ? "The NLP brief pushed the planner toward more personalized choices." : "Structured inputs are driving the meal selection."}`;
    }
    if (dietExportNote) {
      dietExportNote.textContent = `Export this plan with ${derivedMetrics.consistencyScore}% consistency support and a ${derivedMetrics.prepLoad.toLowerCase()}.`;
    }

    if (dietPlannerTagStrip) {
      dietPlannerTagStrip.innerHTML = tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    }

    renderDietMeals(mealPlan);

    if (dietGroceryList) {
      dietGroceryList.innerHTML = groceries.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    }

    if (dietRoutineList) {
      dietRoutineList.innerHTML = routine.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    }

    if (dietPlannerTips) {
      dietPlannerTips.innerHTML = quickTips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");
    }

    currentDietPlanState = {
      summary: dietPlannerSummary ? dietPlannerSummary.textContent : "",
      calories: `${adjustedCalories} kcal`,
      protein: proteinTarget,
      hydration: hydrationTarget,
      macro: macroTarget,
      mode: planningMode,
      consistency: `${derivedMetrics.consistencyScore}%`,
      metabolicFit: `${diagnostics.metabolicFitValue}%`,
      satiety: diagnostics.satietyLabel,
      micronutrients: diagnostics.micronutrientLabel,
      adherenceRisk: diagnostics.adherenceRisk,
      modelEngine: "Nutrition heuristics + dataset planner",
      modelConfidence: "Preview ranking mode",
      modelValidation: "Awaiting dataset-backed sync",
      clusterQuality: "Cluster diagnostics pending",
      budget: derivedMetrics.budgetEstimate,
      prepLoad: derivedMetrics.prepLoad,
      mealRhythm: derivedMetrics.mealRhythm,
      macroRationale: diagnostics.macroRationale,
      meals: mealPlan,
      groceries,
      routine,
      swapList: diagnostics.swapList,
      coachProtocol: diagnostics.coachProtocol
    };

    void hydrateDietPlannerFromServer();
  }

  function scheduleDietPlannerRender() {
    window.clearTimeout(dietRenderTimer);
    dietRenderTimer = window.setTimeout(renderDietPlannerDemo, 220);
  }

  dietPlannerDemoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderDietPlannerDemo();
  });

  dietPlannerDemoForm.addEventListener("input", scheduleDietPlannerRender);
  dietPlannerDemoForm.addEventListener("change", scheduleDietPlannerRender);

  dietPlannerDemoForm.addEventListener("reset", () => {
    window.setTimeout(renderDietPlannerDemo, 0);
  });

  dietCopyButton?.addEventListener("click", async () => {
    try {
      await copyPlainText(buildDietExportText());
      flashTemporaryButtonLabel(dietCopyButton, "Copied");
    } catch (error) {
      flashTemporaryButtonLabel(dietCopyButton, "Retry");
    }
  });

  dietDownloadButton?.addEventListener("click", () => {
    downloadPlainTextFile("diet-plan-report.txt", buildDietExportText());
    flashTemporaryButtonLabel(dietDownloadButton, "Saved");
  });

  renderDietPlannerDemo();
}

const playlistDemoForm = document.getElementById("playlistDemoForm");
if (playlistDemoForm) {
  const playlistMoodLabel = document.getElementById("playlistMoodLabel");
  const playlistEnergyLabel = document.getElementById("playlistEnergyLabel");
  const playlistSessionLabel = document.getElementById("playlistSessionLabel");
  const playlistMixMode = document.getElementById("playlistMixMode");
  const playlistSummary = document.getElementById("playlistSummary");
  const playlistGeneratedTitle = document.getElementById("playlistGeneratedTitle");
  const playlistSourceBadge = document.getElementById("playlistSourceBadge");
  const playlistActionNote = document.getElementById("playlistActionNote");
  const playlistBestUse = document.getElementById("playlistBestUse");
  const playlistTransitionStyle = document.getElementById("playlistTransitionStyle");
  const playlistConfidenceLabel = document.getElementById("playlistConfidenceLabel");
  const playlistCoherenceScore = document.getElementById("playlistCoherenceScore");
  const playlistNoveltyScore = document.getElementById("playlistNoveltyScore");
  const playlistLanguageBlend = document.getElementById("playlistLanguageBlend");
  const playlistReplayRisk = document.getElementById("playlistReplayRisk");
  const playlistModelEngine = document.getElementById("playlistModelEngine");
  const playlistModelAccuracy = document.getElementById("playlistModelAccuracy");
  const playlistModelConfidence = document.getElementById("playlistModelConfidence");
  const playlistModelSource = document.getElementById("playlistModelSource");
  const playlistCopyButton = document.getElementById("playlistCopyButton");
  const playlistDownloadTxtButton = document.getElementById("playlistDownloadTxtButton");
  const playlistDownloadM3uButton = document.getElementById("playlistDownloadM3uButton");
  const playlistShareButton = document.getElementById("playlistShareButton");
  const playlistOpenPlatformButton = document.getElementById("playlistOpenPlatformButton");
  const playlistResultGrid = document.getElementById("playlistResultGrid");
  const playlistInsights = document.getElementById("playlistInsights");
  const playlistTagStrip = document.getElementById("playlistTagStrip");
  const playlistReasoning = document.getElementById("playlistReasoning");
  const playlistLaneList = document.getElementById("playlistLaneList");
  const playlistAudioProfile = document.getElementById("playlistAudioProfile");
  const playlistCuratorLogic = document.getElementById("playlistCuratorLogic");
  const playlistFallbackRoute = document.getElementById("playlistFallbackRoute");
  let playlistRequestToken = 0;
  let currentPlaylistState = null;
  let playlistRenderTimer = 0;

  const playlistSeeds = {
    calm: ["Cloudline Drift", "Glass Lake Echo", "Quiet Bloom Signal", "Featherlight Horizon", "Soft Transit Glow"],
    happy: ["Golden Motion Drive", "Bright Street Replay", "Open Window Rise", "Weekend Lightbeam", "Sunflash Groove"],
    focused: ["Neural Focus Loop", "Code Window Drive", "Linear Flow State", "Circuit Calm Arc", "Afterhours Precision"],
    energetic: ["Velocity Charge", "Runway Voltage", "Pulse Sprint Run", "Ignition Hour", "Turbo Heartline"],
    reflective: ["Mirrorlight Tape", "Afterglow Pages", "Slow Orbit Letters", "Night Archive", "Memory Tide"]
  };
  const sessionLabels = {
    quick: "Quick reset mix",
    study: "Extended study mix",
    workout: "Workout momentum mix",
    lateNight: "Late-night smooth arc"
  };

  function formatPlaylistTitleCase(value) {
    return String(value || "")
      .replace(/[-_]+/g, " ")
      .trim()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  function buildPlaylistTitle(details) {
    const mood = normalizeText(details?.mood || "focused");
    const session = normalizeText(details?.session || "study");
    const language = normalizeText(details?.language || "mixed");
    const prompt = normalizeText(details?.prompt || "");
    const moodLabels = {
      focused: "Focused",
      calm: "Calm",
      happy: "Bright",
      energetic: "Voltage",
      reflective: "Reflective"
    };
    const sessionLabelsForTitle = {
      quick: "Reset Arc",
      study: "Study Arc",
      workout: "Workout Drive",
      latenight: "Night Flow",
      "late-night": "Night Flow"
    };

    let focusLabel = "Smart Mix";

    if (prompt.includes("coding")) {
      focusLabel = "Coding Mix";
    } else if (prompt.includes("study") || prompt.includes("focus")) {
      focusLabel = "Focus Mix";
    } else if (prompt.includes("workout") || prompt.includes("gym") || prompt.includes("run")) {
      focusLabel = "Workout Mix";
    } else if (prompt.includes("night") || prompt.includes("late")) {
      focusLabel = "Night Mix";
    } else if (prompt.includes("travel") || prompt.includes("drive")) {
      focusLabel = "Travel Mix";
    } else if (language === "hindi") {
      focusLabel = "Hindi Blend";
    } else if (language === "english") {
      focusLabel = "English Blend";
    }

    return `${moodLabels[mood] || formatPlaylistTitleCase(mood)} ${sessionLabelsForTitle[session] || "Session Mix"}: ${focusLabel}`;
  }

  function buildPlatformTrackUrl(platform, title, artist) {
    const query = encodeURIComponent([title, artist].filter(Boolean).join(" ").trim());

    if (!query) {
      return "";
    }

    const normalizedPlatform = normalizeText(platform || "spotify");

    if (normalizedPlatform.includes("youtube")) {
      return `https://music.youtube.com/search?q=${query}`;
    }

    if (normalizedPlatform.includes("jiosaavn") || normalizedPlatform.includes("saavn")) {
      return `https://www.jiosaavn.com/search/${query}`;
    }

    return `https://open.spotify.com/search/${query}`;
  }

  function buildPlatformMixUrl(platform, state) {
    const summarySeed = [
      state?.title,
      ...(state?.tracks || []).slice(0, 2).map((track) => [track.title, track.artist].filter(Boolean).join(" "))
    ].filter(Boolean).join(" ");
    return buildPlatformTrackUrl(platform, summarySeed, "");
  }

  function buildPlaylistDiagnostics({ mood, energy, session, language, lyricDensity, parsedPrompt, tracks, platform, isLiveSource }) {
    const coherenceValue = clamp(
      76 +
        (parsedPrompt.hasPrompt ? 8 : 2) +
        (session === "study" && lyricDensity === "minimal" ? 8 : 0) +
        (session === "workout" && energy === "high" ? 8 : 0) +
        (session === "lateNight" && mood === "reflective" ? 8 : 0) +
        (isLiveSource ? 4 : 0),
      68,
      98
    );
    const noveltyValue = clamp(
      54 +
        (language === "Mixed" ? 16 : 8) +
        (parsedPrompt.tags.length * 4) +
        (tracks.length >= 4 ? 6 : 2) -
        (lyricDensity === "full" && session === "study" ? 6 : 0),
      40,
      95
    );
    const noveltyLabel = noveltyValue >= 82
      ? `Fresh but curated (${noveltyValue}%)`
      : noveltyValue >= 64
        ? `Balanced novelty (${noveltyValue}%)`
        : `Safe familiarity (${noveltyValue}%)`;
    const languageBlend = language === "Mixed"
      ? "Hindi + English crossover"
      : `${language} primary lane`;
    const replayRiskValue = clamp(
      22 +
        (lyricDensity === "full" ? 18 : lyricDensity === "balanced" ? 10 : 4) +
        (energy === "high" ? 12 : energy === "medium" ? 7 : 3) +
        (session === "study" ? 6 : 0),
      8,
      74
    );
    const replayRisk = replayRiskValue >= 54
      ? `Higher fatigue risk (${replayRiskValue}%)`
      : replayRiskValue >= 34
        ? `Moderate fatigue risk (${replayRiskValue}%)`
        : `Low fatigue risk (${replayRiskValue}%)`;
    const audioProfile = `Energy ramp is ${energy}, lyric load is ${lyricDensity}, ${languageBlend.toLowerCase()} is active, and the playlist is being shaped for ${sessionLabels[session] || "adaptive listening"} on ${platform}.`;
    const curatorLogic = parsedPrompt.hasPrompt
      ? `The prompt is acting like a soft NLP controller, steering mood, language, and session purpose into a tighter listening route instead of relying only on manual dropdown choices.`
      : `The curator is leaning mostly on the selected mood, session, and lyric controls to keep the route consistent and usable.`;
    const fallbackRoute = [
      session === "study"
        ? "If focus drops, switch to a lower-lyric lane with smoother transitions."
        : session === "workout"
          ? "If momentum falls, move into a higher-energy lane with stronger percussive lift."
          : "If the mood feels off, drop into the calmest lane before rebuilding.",
      language === "Mixed"
        ? "Keep language crossover gradual so the mix still feels intentional."
        : `Use one or two ${language} outliers only if you want extra freshness without breaking cohesion.`,
      isLiveSource
        ? "Live-source tracks are available, so open the platform handoff when the current mix feels right."
        : "If the local route feels too safe, regenerate once with a richer vibe prompt for more variety."
    ];

    return {
      coherenceValue,
      noveltyLabel,
      languageBlend,
      replayRisk,
      audioProfile,
      curatorLogic,
      fallbackRoute
    };
  }

  function buildPlaylistExportText(state) {
    const lines = [
      state.title,
      `${state.platform} playlist concept`,
      state.summary,
      state.source,
      `Model engine: ${state.modelEngine || "Audio feature classifier"}`,
      `Validation: ${state.modelAccuracy || "Local evaluation"}`,
      `Ranking confidence: ${state.modelConfidenceDetail || state.confidence || "Strong match"}`,
      `Coherence: ${state.coherence}`,
      `Novelty balance: ${state.novelty}`,
      `Language blend: ${state.languageBlend}`,
      `Replay safety: ${state.replayRisk}`,
      `Audio fingerprint: ${state.audioProfile}`,
      ""
    ];

    (state.tracks || []).forEach((track, index) => {
      const searchUrl = buildPlatformTrackUrl(state.platform, track.title, track.artist);
      lines.push(`${index + 1}. ${track.title}${track.artist ? ` - ${track.artist}` : ""}`);
      if (track.lane) lines.push(`   Lane: ${track.lane}`);
      if (track.reason) lines.push(`   Why: ${track.reason}`);
      if (searchUrl) lines.push(`   Search: ${searchUrl}`);
      if (track.url) lines.push(`   Link: ${track.url}`);
      lines.push("");
    });

    return lines.join("\n").trim();
  }

  function buildPlaylistExportM3U(state) {
    const lines = ["#EXTM3U", `#PLAYLIST:${state.title}`];

    (state.tracks || []).forEach((track) => {
      const info = [track.artist || "Unknown Artist", track.title || "Untitled"].join(" - ");
      const mediaUrl = track.previewUrl || track.url || buildPlatformTrackUrl(state.platform, track.title, track.artist);
      lines.push(`#EXTINF:-1,${info}`);
      lines.push(mediaUrl || "# No URL available");
    });

    return lines.join("\n");
  }

  function downloadPlaylistBlob(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
  }

  function flashButtonText(button, nextLabel) {
    if (!button) {
      return;
    }

    const originalLabel = button.dataset.label || button.textContent;
    button.dataset.label = originalLabel;
    button.textContent = nextLabel;
    window.clearTimeout(Number(button.dataset.timeoutId || 0));
    const timeoutId = window.setTimeout(() => {
      button.textContent = originalLabel;
    }, 1400);
    button.dataset.timeoutId = String(timeoutId);
  }

  function syncPlaylistActions() {
    if (!currentPlaylistState) {
      return;
    }

    if (playlistGeneratedTitle) {
      playlistGeneratedTitle.textContent = currentPlaylistState.title;
    }

    if (playlistSourceBadge) {
      playlistSourceBadge.textContent = currentPlaylistState.source;
      playlistSourceBadge.classList.toggle("is-live", Boolean(currentPlaylistState.isLive));
      playlistSourceBadge.classList.toggle("is-warning", !currentPlaylistState.isLive);
    }

    if (playlistActionNote) {
      playlistActionNote.textContent = `This ${currentPlaylistState.platform} mix is ready to copy, export, or open as a searchable playlist handoff.`;
    }

    if (playlistBestUse) {
      playlistBestUse.textContent = currentPlaylistState.bestUse || "Adaptive listening support";
    }

    if (playlistTransitionStyle) {
      playlistTransitionStyle.textContent = currentPlaylistState.transitionStyle || "Smooth adaptive arc";
    }

    if (playlistConfidenceLabel) {
      playlistConfidenceLabel.textContent = currentPlaylistState.confidence || "Strong mood alignment";
    }
    if (playlistModelEngine) {
      playlistModelEngine.textContent = currentPlaylistState.modelEngine || "Audio feature classifier";
    }
    if (playlistModelAccuracy) {
      playlistModelAccuracy.textContent = currentPlaylistState.modelAccuracy || "Local evaluation";
    }
    if (playlistModelConfidence) {
      playlistModelConfidence.textContent = currentPlaylistState.modelConfidenceDetail || currentPlaylistState.confidence || "Strong mood alignment";
    }
    if (playlistModelSource) {
      playlistModelSource.textContent = currentPlaylistState.source || "Local recommendation backend";
    }

    if (playlistOpenPlatformButton) {
      playlistOpenPlatformButton.textContent = `Open on ${currentPlaylistState.platform}`;
      playlistOpenPlatformButton.href = buildPlatformMixUrl(currentPlaylistState.platform, currentPlaylistState) || "https://open.spotify.com/";
    }
  }

  function syncPlaylistDiagnostics(diagnostics) {
    if (playlistCoherenceScore) playlistCoherenceScore.textContent = `${diagnostics.coherenceValue}%`;
    if (playlistNoveltyScore) playlistNoveltyScore.textContent = diagnostics.noveltyLabel;
    if (playlistLanguageBlend) playlistLanguageBlend.textContent = diagnostics.languageBlend;
    if (playlistReplayRisk) playlistReplayRisk.textContent = diagnostics.replayRisk;
    if (playlistAudioProfile) playlistAudioProfile.textContent = diagnostics.audioProfile;
    if (playlistCuratorLogic) playlistCuratorLogic.textContent = diagnostics.curatorLogic;
    if (playlistFallbackRoute) {
      playlistFallbackRoute.innerHTML = diagnostics.fallbackRoute.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    }
  }

  function renderPlaylistTracks(tracks) {
    if (!playlistResultGrid) {
      return;
    }

    playlistResultGrid.innerHTML = (tracks || []).map((track, index) => {
      const platformSearchUrl = buildPlatformTrackUrl(currentPlaylistState?.platform || "Spotify", track.title, track.artist);
      const platformSearchLabel = `Search ${currentPlaylistState?.platform || "Spotify"}`;
      const openTrack = track.url
        ? `<a class="demo-track-link" href="${escapeHtml(track.url)}" target="_blank" rel="noopener noreferrer">Open track</a>`
        : "";
      const previewTrack = track.previewUrl
        ? `<a class="demo-track-link" href="${escapeHtml(track.previewUrl)}" target="_blank" rel="noopener noreferrer">Preview</a>`
        : "";
      const platformTrack = platformSearchUrl
        ? `<a class="demo-track-link" href="${escapeHtml(platformSearchUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(platformSearchLabel)}</a>`
        : "";

      return `
        <article class="demo-output-card">
          <h4>Lane ${index + 1}: ${escapeHtml(track.title || "Adaptive lane")}</h4>
          <p>${escapeHtml(track.lane || "")}</p>
          <p class="demo-mini-copy">${escapeHtml(track.detail || "")}</p>
          <ul class="demo-inline-list">
            ${track.artist ? `<li>${escapeHtml(track.artist)}</li>` : ""}
            ${track.source ? `<li>${escapeHtml(track.source)}</li>` : ""}
            ${track.reason ? `<li>${escapeHtml(track.reason)}</li>` : ""}
          </ul>
          ${(platformTrack || openTrack || previewTrack) ? `<div class="demo-track-actions">${platformTrack}${openTrack}${previewTrack}</div>` : ""}
        </article>
      `;
    }).join("");
  }

  async function hydratePlaylistFromServer() {
    const requestToken = ++playlistRequestToken;
    const payload = Object.fromEntries(new FormData(playlistDemoForm).entries());

    try {
      const result = await postPortfolioJson("/api/playlist-recommend", payload, 7000);

      if (requestToken !== playlistRequestToken) {
        return;
      }

      if (playlistMoodLabel) playlistMoodLabel.textContent = result.moodLabel;
      if (playlistEnergyLabel) playlistEnergyLabel.textContent = result.energyLabel;
      if (playlistSessionLabel) playlistSessionLabel.textContent = result.sessionLabel;
      if (playlistMixMode) playlistMixMode.textContent = result.mixMode;
      if (playlistSummary) playlistSummary.textContent = result.summary;
      const isLiveSource = normalizeText(result.source || "").includes("itunes");
      const diagnostics = buildPlaylistDiagnostics({
        mood: result.moodLabel,
        energy: payload.energy,
        session: payload.session,
        language: payload.language,
        lyricDensity: payload.lyricDensity,
        parsedPrompt: parsePlaylistPrompt(payload.playlistPrompt),
        tracks: result.tracks || [],
        platform: payload.platform || "Spotify",
        isLiveSource
      });
      currentPlaylistState = {
        title: buildPlaylistTitle({
          mood: result.moodLabel,
          session: payload.session,
          language: payload.language,
          prompt: payload.playlistPrompt
        }),
        platform: payload.platform || "Spotify",
        summary: result.summary,
        source: result.source || "Playlist ready",
        isLive: isLiveSource,
        tracks: result.tracks || [],
        bestUse: payload.session === "study"
          ? "Deep work and long focus blocks"
          : payload.session === "workout"
            ? "Momentum building and training sessions"
            : payload.session === "lateNight"
              ? "Late-night reflection and calm flow"
              : "Quick emotional reset and reset transitions",
        transitionStyle: payload.energy === "high"
          ? "Fast lift with sharper transitions"
          : payload.lyricDensity === "minimal"
            ? "Smooth crossfade arc"
            : "Balanced vocal progression",
        confidence: isLiveSource
          ? "Live-source reinforced mix"
          : "Strong local engine match",
        modelEngine: result.modelEngine || "Audio feature centroid classifier",
        modelAccuracy: `${formatPercentageLabel((result.modelAccuracy || 0) * 100)} label accuracy`,
        modelConfidenceDetail: `${formatPercentageLabel(result.modelConfidence || 0)} ranking confidence`,
        coherence: `${diagnostics.coherenceValue}%`,
        novelty: diagnostics.noveltyLabel,
        languageBlend: diagnostics.languageBlend,
        replayRisk: diagnostics.replayRisk,
        audioProfile: diagnostics.audioProfile
      };
      syncPlaylistActions();
      syncPlaylistDiagnostics(diagnostics);
      if (playlistTagStrip) {
        playlistTagStrip.innerHTML = (result.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
      }
      renderPlaylistTracks(currentPlaylistState.tracks);
      if (playlistReasoning) playlistReasoning.textContent = result.reasoning;
      if (playlistLaneList) {
        playlistLaneList.innerHTML = (result.laneList || []).map((item) => `
          <li>
            <strong>${escapeHtml(item.lane || "")}</strong>
            <span>${escapeHtml(item.detail || "")}</span>
          </li>
        `).join("");
      }
      if (playlistInsights) {
        playlistInsights.innerHTML = (result.insights || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      }
    } catch (error) {
      if (requestToken !== playlistRequestToken) {
        return;
      }

      if (playlistModelEngine) playlistModelEngine.textContent = "Prompt router + local ranking";
      if (playlistModelAccuracy) playlistModelAccuracy.textContent = "Local preview mode";
      if (playlistModelConfidence) playlistModelConfidence.textContent = "Server sync unavailable";
      if (playlistModelSource) playlistModelSource.textContent = "Local recommendation preview";
      if (playlistSourceBadge) {
        playlistSourceBadge.textContent = "Local preview mode";
        playlistSourceBadge.classList.remove("is-live");
        playlistSourceBadge.classList.add("is-warning");
      }
    }
  }

  function renderPlaylistDemo() {
    const formData = new FormData(playlistDemoForm);
    const prompt = formData.get("playlistPrompt");
    const parsedPrompt = parsePlaylistPrompt(prompt);
    const mood = parsedPrompt.moodOverride || formData.get("mood");
    const energy = formData.get("energy");
    const session = parsedPrompt.sessionOverride || formData.get("session");
    const platform = formData.get("platform");
    const language = parsedPrompt.languageOverride || formData.get("language");
    const lyricDensity = parsedPrompt.lyricOverride || formData.get("lyricDensity");
    const avoidKeywords = String(formData.get("avoidKeywords") || "").trim();
    const seed = getTextSeed(`${prompt}-${mood}-${energy}-${session}-${language}-${lyricDensity}`);
    const seeds = playlistSeeds[mood] || playlistSeeds.focused;
    const tags = uniqueValues([
      mood,
      sessionLabels[session],
      lyricDensity === "minimal" ? "low lyric lane" : lyricDensity === "full" ? "vocal push" : "balanced vocals",
      `${language} mix`,
      ...parsedPrompt.tags
    ]);
    const energyLabel = energy === "high" ? "High-energy curation" : energy === "medium" ? "Balanced curation" : "Soft curation";
    const sessionLabel = sessionLabels[session] || "Adaptive session mix";
    const mixMode = `${lyricDensity === "minimal" ? "Low-lyric" : lyricDensity === "full" ? "Vocal-rich" : "Balanced"} ${session === "study" ? "focus" : session === "workout" ? "momentum" : session === "lateNight" ? "night" : "reset"} arc`;
    const laneBlueprint = session === "workout"
      ? ["Warm-up tempo", "Acceleration lane", "Peak push", "Recovery glide"]
      : session === "lateNight"
        ? ["Soft entry", "Mood tunnel", "Afterglow lane", "Gentle landing"]
        : session === "quick"
          ? ["Fast reset", "Mood lift", "Exit clean"]
          : ["Warm-up focus", "Deep work tunnel", "Controlled lift", "Cool-down clarity"];
    const tracks = laneBlueprint.map((lane, index) => {
      const title = pickDeterministicOption(seeds, seed, index) || seeds[0];
      const reason = session === "study"
        ? "Keeps cognitive load low while maintaining motion."
        : session === "workout"
          ? "Pushes energy forward without losing the selected mood."
          : session === "lateNight"
            ? "Stays smooth and cinematic for after-hours listening."
            : "Provides a quick emotional reset with clean transitions.";
      const detail = `${language} ${lyricDensity === "minimal" ? "minimal-lyric" : lyricDensity === "full" ? "vocal-forward" : "mixed-vocal"} direction for ${platform}.`;
      return { lane, title, detail, reason };
    });
    const reasoning = `The generator prioritized ${mood} mood cues, ${energy} energy, and ${lyricDensity} vocal density${avoidKeywords ? ` while de-emphasizing ${avoidKeywords}` : ""}. ${parsedPrompt.hasPrompt ? "The NLP vibe prompt also nudged the mix toward a more personalized session arc." : ""}`;
    const insights = [
      `Detected mood style: ${mood}`,
      `Energy target: ${energy}`,
      `Playback context: ${session}`,
      `Language direction: ${language}`,
      avoidKeywords ? `Avoiding: ${avoidKeywords}` : "No avoid terms specified for this run"
    ];
    const diagnostics = buildPlaylistDiagnostics({
      mood,
      energy,
      session,
      language,
      lyricDensity,
      parsedPrompt,
      tracks,
      platform,
      isLiveSource: false
    });

    if (playlistMoodLabel) playlistMoodLabel.textContent = mood.charAt(0).toUpperCase() + mood.slice(1);
    if (playlistEnergyLabel) playlistEnergyLabel.textContent = energyLabel;
    if (playlistSessionLabel) playlistSessionLabel.textContent = sessionLabel;
    if (playlistMixMode) playlistMixMode.textContent = mixMode;
    if (playlistSummary) {
      playlistSummary.textContent = `This advanced playlist concept leans ${mood}, holds a ${energy} energy line, and builds a ${language} listening path optimized for ${platform}.`;
    }

    if (playlistTagStrip) {
      playlistTagStrip.innerHTML = tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    }

    currentPlaylistState = {
      title: buildPlaylistTitle({
        mood,
        session,
        language,
        prompt
      }),
      platform,
      summary: `This advanced playlist concept leans ${mood}, holds a ${energy} energy line, and builds a ${language} listening path optimized for ${platform}.`,
      source: "Local recommendation preview",
      isLive: false,
      tracks,
      bestUse: session === "study"
        ? "Deep work and long focus blocks"
        : session === "workout"
          ? "Momentum building and training sessions"
          : session === "lateNight"
            ? "Late-night reflection and calm flow"
            : "Quick emotional reset and reset transitions",
      transitionStyle: energy === "high"
        ? "Fast lift with sharper transitions"
        : lyricDensity === "minimal"
          ? "Smooth crossfade arc"
          : "Balanced vocal progression",
      confidence: parsedPrompt.hasPrompt ? "Prompt-tuned mood alignment" : "Strong local engine match",
      modelEngine: "Prompt router + local ranking",
      modelAccuracy: "Awaiting classifier sync",
      modelConfidenceDetail: "Preview ranking mode",
      coherence: `${diagnostics.coherenceValue}%`,
      novelty: diagnostics.noveltyLabel,
      languageBlend: diagnostics.languageBlend,
      replayRisk: diagnostics.replayRisk,
      audioProfile: diagnostics.audioProfile
    };
    syncPlaylistActions();
    syncPlaylistDiagnostics(diagnostics);
    renderPlaylistTracks(currentPlaylistState.tracks);

    if (playlistReasoning) {
      playlistReasoning.textContent = reasoning;
    }

    if (playlistLaneList) {
      playlistLaneList.innerHTML = tracks.map((track) => `
        <li>
          <strong>${escapeHtml(track.lane)}</strong>
          <span>${escapeHtml(track.reason)}</span>
        </li>
      `).join("");
    }

    if (playlistInsights) {
      playlistInsights.innerHTML = insights.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    }

    void hydratePlaylistFromServer();
  }

  function schedulePlaylistRender() {
    window.clearTimeout(playlistRenderTimer);
    playlistRenderTimer = window.setTimeout(renderPlaylistDemo, 220);
  }

  playlistDemoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderPlaylistDemo();
  });

  playlistDemoForm.addEventListener("input", schedulePlaylistRender);
  playlistDemoForm.addEventListener("change", schedulePlaylistRender);

  playlistDemoForm.addEventListener("reset", () => {
    window.setTimeout(renderPlaylistDemo, 0);
  });

  if (playlistCopyButton) {
    playlistCopyButton.addEventListener("click", async () => {
      if (!currentPlaylistState) {
        return;
      }

      try {
        await navigator.clipboard.writeText(buildPlaylistExportText(currentPlaylistState));
        flashButtonText(playlistCopyButton, "Copied");
      } catch (error) {
        flashButtonText(playlistCopyButton, "Retry");
      }
    });
  }

  if (playlistDownloadTxtButton) {
    playlistDownloadTxtButton.addEventListener("click", () => {
      if (!currentPlaylistState) {
        return;
      }

      downloadPlaylistBlob(
        `${normalizeText(currentPlaylistState.title).replace(/\s+/g, "-") || "playlist-mix"}.txt`,
        buildPlaylistExportText(currentPlaylistState),
        "text/plain;charset=utf-8"
      );
      flashButtonText(playlistDownloadTxtButton, "Saved");
    });
  }

  if (playlistDownloadM3uButton) {
    playlistDownloadM3uButton.addEventListener("click", () => {
      if (!currentPlaylistState) {
        return;
      }

      downloadPlaylistBlob(
        `${normalizeText(currentPlaylistState.title).replace(/\s+/g, "-") || "playlist-mix"}.m3u`,
        buildPlaylistExportM3U(currentPlaylistState),
        "audio/x-mpegurl;charset=utf-8"
      );
      flashButtonText(playlistDownloadM3uButton, "Saved");
    });
  }

  if (playlistShareButton) {
    playlistShareButton.addEventListener("click", async () => {
      if (!currentPlaylistState) {
        return;
      }

      const sharePayload = {
        title: currentPlaylistState.title,
        text: buildPlaylistExportText(currentPlaylistState),
        url: buildPlatformMixUrl(currentPlaylistState.platform, currentPlaylistState)
      };

      try {
        if (navigator.share) {
          await navigator.share(sharePayload);
          flashButtonText(playlistShareButton, "Shared");
          return;
        }

        await navigator.clipboard.writeText(`${sharePayload.text}\n\n${sharePayload.url}`);
        flashButtonText(playlistShareButton, "Copied");
      } catch (error) {
        flashButtonText(playlistShareButton, "Retry");
      }
    });
  }

  renderPlaylistDemo();
}

if (formButton && formNote) {
  formButton.addEventListener("click", () => {
    formNote.textContent = "Thanks for reaching out. This demo form is ready to connect to your preferred backend or email service.";
  });
}

if (cursorDot && cursorRing && window.matchMedia("(pointer: fine)").matches) {
  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;
  let lastStarTime = 0;
  const nativeCursorSelector = "input, textarea, select, option, iframe, video, canvas, [contenteditable='true']";

  const hideCustomCursor = () => {
    cursorDot.classList.remove("is-visible");
    cursorRing.classList.remove("is-visible");
  };

  const shouldUseNativeCursor = (target) => {
    if (!target || !(target instanceof Element)) {
      return false;
    }

    return Boolean(target.closest(nativeCursorSelector));
  };

  const moveCursor = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (
      chatbotWidget?.classList.contains("is-resizing") ||
      chatbotPanel?.classList.contains("is-resize-hover") ||
      shouldUseNativeCursor(event.target)
    ) {
      hideCustomCursor();
      return;
    }

    cursorDot.classList.add("is-visible");
    cursorRing.classList.add("is-visible");
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

    if (event.timeStamp - lastStarTime > 60) {
      spawnStar(mouseX, mouseY);
      lastStarTime = event.timeStamp;
    }
  };

  const spawnStar = (x, y) => {
    const star = document.createElement("span");
    const offsetX = Math.random() * 28 - 6;
    const offsetY = Math.random() * 28 - 6;
    const travelX = Math.random() * 28 - 14 + "px";
    const travelY = Math.random() * -26 - 8 + "px";
    const themeClass = document.body.classList.contains("theme-aurora")
      ? "cursor-heart"
      : document.body.classList.contains("theme-sunrise")
        ? "cursor-butterfly"
        : "cursor-star";

    star.className = `cursor-particle ${themeClass} is-animating`;
    star.style.left = x + offsetX + "px";
    star.style.top = y + offsetY + "px";
    star.style.setProperty("--star-x", travelX);
    star.style.setProperty("--star-y", travelY);
    document.body.appendChild(star);

      window.setTimeout(() => {
        star.remove();
      }, 520);
    };

  const animateRing = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(animateRing);
  };

  window.addEventListener("mousemove", moveCursor);
  window.addEventListener("mouseleave", () => {
    hideCustomCursor();
  });

  interactiveElements.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      cursorRing.classList.add("is-hovering");
    });

    element.addEventListener("mouseleave", () => {
      cursorRing.classList.remove("is-hovering");
    });
  });

  animateRing();
}

function addChatMessage(text, sender) {
  if (!chatbotMessages) {
    return;
  }

  const message = document.createElement("article");
  message.className = `chatbot-message ${sender}`;
  message.dataset.rawText = text;
  renderChatMessageContent(message, text, sender);
  enhanceChatMessage(message, text);
  chatbotMessages.appendChild(message);
  if (sender === "bot") {
    window.requestAnimationFrame(() => {
      scrollChatToMessageStart(message);
    });
  } else {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  if (sender === "bot") {
    latestBotReply = text;
  }

  chatHistory.push({
    role: sender === "bot" ? "assistant" : "user",
    content: text
  });

  if (chatHistory.length > 12) {
    chatHistory.splice(0, chatHistory.length - 12);
  }

  return message;
}

function updateChatMessage(message, text, sender = "bot") {
  if (!message) {
    return;
  }

  const previousRawText = message.dataset.rawText || "";
  message.classList.remove("is-loading");
  message.className = `chatbot-message ${sender}`;
  message.dataset.rawText = text;
  renderChatMessageContent(message, text, sender);

  const existingActions = message.querySelector(".chatbot-message-actions");
  if (existingActions) {
    existingActions.remove();
  }

  enhanceChatMessage(message, text);
  if (sender === "bot") {
    window.requestAnimationFrame(() => {
      scrollChatToMessageStart(message);
    });
  } else if (chatbotMessages) {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  if (sender === "bot") {
    latestBotReply = text;
    for (let index = chatHistory.length - 1; index >= 0; index -= 1) {
      if (chatHistory[index].role === "assistant" && chatHistory[index].content === previousRawText) {
        chatHistory[index].content = text;
        break;
      }
    }
  }
}

function addLoadingMessage() {
  if (!chatbotMessages) {
    return null;
  }

  const message = document.createElement("article");
  message.className = "chatbot-message bot is-loading";
  message.innerHTML = `
    <div class="chatbot-message-head">
      <span class="chatbot-message-role">Assistant</span>
      <span class="chatbot-message-time">Thinking</span>
    </div>
    <div class="chatbot-message-content chatbot-message-content-loading">
      <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
    </div>
  `;
  chatbotMessages.appendChild(message);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  return message;
}

function scrollChatToMessageStart(message) {
  if (!chatbotMessages || !message) {
    return;
  }
  const scrollToStart = () => {
    if (!chatbotMessages || !message?.isConnected) {
      return;
    }

    const previousBehavior = chatbotMessages.style.scrollBehavior;
    chatbotMessages.style.scrollBehavior = "auto";

    try {
      message.scrollIntoView({
        block: "start",
        inline: "nearest",
        behavior: "auto"
      });

      const targetTop = Math.max((message.offsetTop || 0) - (chatbotMessages.offsetTop || 0) - 12, 0);
      chatbotMessages.scrollTop = targetTop;
    } finally {
      chatbotMessages.style.scrollBehavior = previousBehavior;
    }
  };

  window.requestAnimationFrame(() => {
    scrollToStart();
    window.setTimeout(scrollToStart, 30);
  });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function linkifyInlineText(text) {
  let html = escapeHtml(text);

  html = html.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  html = html.replace(
    /\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/gi,
    '<a href="mailto:$1">$1</a>'
  );

  return html;
}

function getChatTimestamp() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatChatMessageContent(text, sender) {
  const blocks = text.replace(/\r/g, "").trim().split(/\n\s*\n/).filter(Boolean);

  if (!blocks.length) {
    return "<p></p>";
  }

  return blocks.map((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);

    if (lines.length > 1 && lines.every((line) => /^[-*â€¢]\s+/.test(line))) {
      return `<ul>${lines.map((line) => `<li>${linkifyInlineText(line.replace(/^[-*â€¢]\s+/, ""))}</li>`).join("")}</ul>`;
    }

    if (lines.length > 1 && lines.every((line) => /^\d+\.\s+/.test(line))) {
      return `<ol>${lines.map((line) => `<li>${linkifyInlineText(line.replace(/^\d+\.\s+/, ""))}</li>`).join("")}</ol>`;
    }

    const joinedLines = lines.map((line) => sender === "bot" ? linkifyInlineText(line) : escapeHtml(line)).join("<br>");
    return `<p>${joinedLines}</p>`;
  }).join("");
}

function renderChatMessageContent(message, text, sender) {
  const role = sender === "bot" ? "Assistant" : "You";
  const timeLabel = getChatTimestamp();
  const content = formatChatMessageContent(text, sender);

  message.innerHTML = `
    <div class="chatbot-message-head">
      <span class="chatbot-message-role">${role}</span>
      <span class="chatbot-message-time">${timeLabel}</span>
    </div>
    <div class="chatbot-message-content">
      ${content}
    </div>
  `;
}

function setSpeakingButton(button) {
  if (activeSpeechButton && activeSpeechButton !== button) {
    activeSpeechButton.classList.remove("is-speaking");
  }

  activeSpeechButton = button || null;

  if (activeSpeechButton) {
    activeSpeechButton.classList.add("is-speaking");
  }
}

function canUseServerTts() {
  return useServerChat && typeof window.fetch === "function";
}

function resetSpeakingButtons() {
  if (chatbotVoice) {
    chatbotVoice.classList.remove("is-speaking");
  }

  if (activeSpeechButton) {
    activeSpeechButton.classList.remove("is-speaking");
    activeSpeechButton = null;
  }
}

function cleanupActiveAudioPlayer() {
  if (activeAudioPlayer) {
    activeAudioPlayer.onplay = null;
    activeAudioPlayer.onpause = null;
    activeAudioPlayer.onended = null;
    activeAudioPlayer.onerror = null;
    activeAudioPlayer.pause();
    activeAudioPlayer = null;
  }

  if (activeAudioUrl) {
    URL.revokeObjectURL(activeAudioUrl);
    activeAudioUrl = "";
  }
}

function cancelActiveSpeechPlayback() {
  activeSpeechRequestToken += 1;

  if (activeSpeechAbortController) {
    activeSpeechAbortController.abort();
    activeSpeechAbortController = null;
  }

  cleanupActiveAudioPlayer();

  if ("speechSynthesis" in window && (window.speechSynthesis.speaking || window.speechSynthesis.paused)) {
    window.speechSynthesis.cancel();
  }
}

function updatePauseButtonState() {
  if (!chatbotPause) {
    return;
  }

  if (activeAudioPlayer) {
    const isActive = !activeAudioPlayer.ended && (activeAudioPlayer.currentTime > 0 || !activeAudioPlayer.paused);
    chatbotPause.disabled = !isActive;
    chatbotPause.textContent = activeAudioPlayer.paused ? "Resume" : "Pause";
    chatbotPause.classList.toggle("is-active", isActive && activeAudioPlayer.paused);
    return;
  }

  if (!("speechSynthesis" in window)) {
    chatbotPause.disabled = true;
    chatbotPause.textContent = "Pause";
    chatbotPause.classList.remove("is-active");
    return;
  }

  const synth = window.speechSynthesis;
  const isActive = synth.speaking || synth.paused;
  chatbotPause.disabled = !isActive;
  chatbotPause.textContent = synth.paused ? "Resume" : "Pause";
  chatbotPause.classList.toggle("is-active", synth.paused);
}

function stopSpeakingState() {
  cancelActiveSpeechPlayback();
  resetSpeakingButtons();
  updatePauseButtonState();
}

function speakWithBrowserVoice(text) {
  if (!("speechSynthesis" in window) || !text) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 0.96;
  utterance.volume = 0.92;
  utterance.voice = selectPreferredVoice();
  utterance.onstart = updatePauseButtonState;
  utterance.onend = stopSpeakingState;
  utterance.onerror = stopSpeakingState;

  window.speechSynthesis.speak(utterance);
  updatePauseButtonState();
}

async function speakWithServerVoice(text, requestToken) {
  if (!canUseServerTts() || !text) {
    return false;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort("timeout");
  }, CHATBOT_TTS_TIMEOUT_MS);

  activeSpeechAbortController = controller;

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text }),
      signal: controller.signal
    });

    if (!response.ok) {
      return false;
    }

    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("audio")) {
      return false;
    }

    const audioBlob = await response.blob();
    if (!audioBlob.size || requestToken !== activeSpeechRequestToken) {
      return false;
    }

    activeAudioUrl = URL.createObjectURL(audioBlob);
    activeAudioPlayer = new Audio(activeAudioUrl);
    activeAudioPlayer.onplay = updatePauseButtonState;
    activeAudioPlayer.onpause = updatePauseButtonState;
    activeAudioPlayer.onended = stopSpeakingState;
    activeAudioPlayer.onerror = stopSpeakingState;
    activeSpeechAbortController = null;

    await activeAudioPlayer.play();
    updatePauseButtonState();
    return true;
  } catch (error) {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
    if (activeSpeechAbortController === controller) {
      activeSpeechAbortController = null;
    }
  }
}

async function speakText(text, triggerButton = null) {
  if (!text) {
    return;
  }

  const alreadyActive =
    Boolean(activeAudioPlayer || activeSpeechAbortController) ||
    ("speechSynthesis" in window && (window.speechSynthesis.speaking || window.speechSynthesis.paused));

  const wasSameTrigger =
    (triggerButton && triggerButton === activeSpeechButton) ||
    (triggerButton && chatbotVoice && triggerButton === chatbotVoice && chatbotVoice.classList.contains("is-speaking"));

  if (alreadyActive) {
    cancelActiveSpeechPlayback();
    resetSpeakingButtons();
    updatePauseButtonState();

    if (wasSameTrigger) {
      return;
    }
  }

  if (chatbotVoice && triggerButton === chatbotVoice) {
    chatbotVoice.classList.add("is-speaking");
    setSpeakingButton(null);
  } else if (triggerButton) {
    if (chatbotVoice) {
      chatbotVoice.classList.remove("is-speaking");
    }
    setSpeakingButton(triggerButton);
  } else {
    resetSpeakingButtons();
  }

  const requestToken = ++activeSpeechRequestToken;
  const usedServerVoice = await speakWithServerVoice(text, requestToken);

  if (usedServerVoice || requestToken !== activeSpeechRequestToken) {
    return;
  }

  speakWithBrowserVoice(text);
}

function enhanceChatMessage(message, text) {
  if (!message || !text) {
    return;
  }

  message.classList.add("has-actions");

  const actionBar = document.createElement("div");
  actionBar.className = "chatbot-message-actions";

  if (canUseServerTts() || "speechSynthesis" in window) {
    const speakButton = document.createElement("button");
    speakButton.type = "button";
    speakButton.className = "chatbot-message-speak";
    speakButton.setAttribute("aria-label", "Speak this message");
    speakButton.textContent = "Speak";
    speakButton.addEventListener("click", (event) => {
      event.stopPropagation();
      speakText(text, speakButton);
    });

    message.addEventListener("mouseenter", () => {
      if (!activeSpeechButton || activeSpeechButton === speakButton) {
        return;
      }

      stopSpeakingState();
    });

    actionBar.appendChild(speakButton);
  }

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "chatbot-message-copy";
  copyButton.setAttribute("aria-label", "Copy this message");
  copyButton.textContent = "Copy";
  copyButton.addEventListener("click", async (event) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      const originalLabel = copyButton.textContent;
      copyButton.textContent = "Copied";
      window.setTimeout(() => {
        copyButton.textContent = originalLabel;
      }, 1200);
    } catch (error) {
      copyButton.textContent = "Copy";
    }
  });

  actionBar.appendChild(copyButton);
  message.appendChild(actionBar);
}

function enhanceExistingChatMessages() {
  if (!chatbotMessages) {
    return;
  }

  chatbotMessages.querySelectorAll(".chatbot-message").forEach((message) => {
    if (message.classList.contains("is-loading") || message.querySelector(".chatbot-message-actions")) {
      return;
    }

    const text = message.dataset.rawText || message.querySelector(".chatbot-message-content")?.textContent?.trim() || message.textContent.trim();
    enhanceChatMessage(message, text);
  });
}

function normalizeText(value) {
  return value.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function formatList(items) {
  const cleanItems = (items || []).map((item) => String(item || "").trim()).filter(Boolean);

  if (!cleanItems.length) {
    return "";
  }

  if (cleanItems.length === 1) {
    return cleanItems[0];
  }

  if (cleanItems.length === 2) {
    return `${cleanItems[0]} and ${cleanItems[1]}`;
  }

  return `${cleanItems.slice(0, -1).join(", ")}, and ${cleanItems[cleanItems.length - 1]}`;
}

function formatPercentageLabel(value, digits = 1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "Unavailable";
  }
  return `${numeric.toFixed(digits)}%`;
}

function chooseReplyVariant(key, options) {
  const cleanOptions = (options || []).map((option) => String(option || "").trim()).filter(Boolean);

  if (!cleanOptions.length) {
    return "";
  }

  const currentIndex = chatbotReplyVariantState.get(key) || 0;
  const nextReply = cleanOptions[currentIndex % cleanOptions.length];
  chatbotReplyVariantState.set(key, currentIndex + 1);
  return nextReply;
}

function formatFlow(steps) {
  return (steps || []).map((step) => String(step || "").trim()).filter(Boolean).join(" -> ");
}

function formatArtifacts(items) {
  return (items || []).map((item) => {
    if (typeof item === "string") {
      return item;
    }

    return item?.label || "";
  }).filter(Boolean);
}

function getProjectById(projectId) {
  return portfolioKnowledge.projects.find((project) => project.id === projectId) || null;
}

function findProjectsInMessage(message) {
  return portfolioKnowledge.projects.filter((project) => {
    return message.includes(project.name.toLowerCase()) || project.keywords.some((keyword) => message.includes(keyword));
  });
}

function findProjectByMessage(message) {
  return findProjectsInMessage(message)[0] || null;
}

function getProjectSummary(project) {
  return `${project.name} is a ${project.category} project. ${project.description} It is delivered as a ${project.platform}, and its main stack includes ${formatList(project.technologies)}.`;
}

function getAllProjectsSummary() {
  return portfolioKnowledge.projects.map((project) => `${project.name} focuses on ${project.category.toLowerCase()} and uses ${formatList(project.technologies.slice(0, 3))}.`).join(" ");
}

function getLastReferencedProject() {
  if (chatbotConversationContext.activeProjectId) {
    const activeProject = getProjectById(chatbotConversationContext.activeProjectId);
    if (activeProject) {
      return activeProject;
    }
  }

  for (let index = chatHistory.length - 1; index >= 0; index -= 1) {
    const item = chatHistory[index];
    const project = findProjectByMessage(normalizeText(item.content || ""));
    if (project) {
      return project;
    }
  }

  return null;
}

function isProjectFollowUpMessage(message) {
  if (PROJECT_FOLLOW_UP_TERMS.some((term) => message.includes(term))) {
    return true;
  }

  return /\b(it|its)\b/.test(message);
}

function resolveProjectIntent(message) {
  if (includesAny(message, ["what is", "define", "meaning of", "about this project", "about the project"])) {
    return "definition";
  }

  if (includesAny(message, ["need", "why needed", "why is it needed", "importance", "why does it matter", "why built"])) {
    return "need";
  }

  if (includesAny(message, ["dataset", "data", "training data", "dataset size", "what data"])) {
    return "dataset";
  }

  if (includesAny(message, ["algorithm", "algorithms", "model", "models", "engine", "classifier"])) {
    return "algorithm";
  }

  if (includesAny(message, ["tech stack", "stack", "technology", "technologies", "tools", "framework"])) {
    return "technology";
  }

  if (includesAny(message, ["feature", "features", "capability", "capabilities", "what does it do", "does it do", "function", "functions"])) {
    return "features";
  }

  if (includesAny(message, ["how it works", "how does it work", "working", "workflow", "architecture", "pipeline", "mechanism", "flow"])) {
    return "architecture";
  }

  if (includesAny(message, ["problem", "challenge", "purpose", "goal", "why built", "why did you build"])) {
    return "problem";
  }

  if (includesAny(message, ["solution", "approach", "implementation"])) {
    return "solution";
  }

  if (includesAny(message, ["evaluation", "evaluated", "accuracy", "metrics", "benchmark", "performance", "confusion matrix"])) {
    return "evaluation";
  }

  if (includesAny(message, ["outcome", "result", "results", "impact", "benefit", "practical use"])) {
    return "outcome";
  }

  if (includesAny(message, ["demo", "live demo", "try demo", "open demo"])) {
    return "demo";
  }

  if (includesAny(message, ["proof", "artifact", "artifacts", "files", "notebook", "script"])) {
    return "proof";
  }

  if (includesAny(message, ["limitation", "limitations", "weakness", "weaknesses"])) {
    return "limitations";
  }

  if (includesAny(message, ["future", "scope", "improvement", "next version", "enhancement"])) {
    return "future";
  }

  if (includesAny(message, ["platform", "mobile", "web", "android", "flask", "backend"])) {
    return "platform";
  }

  if (includesAny(message, ["model", "algorithm", "engine", "ai model"])) {
    return "engine";
  }

  return "summary";
}

function buildProjectIntentReply(project, intent) {
  const variantKey = `${project.id}:${intent}`;

  switch (intent) {
    case "definition":
      return chooseReplyVariant(variantKey, [
        `${project.name} is ${project.definition || project.description} ${project.domainDefinition || ""}`.trim(),
        `In this portfolio, ${project.name} is presented as ${project.definition || project.description}. ${project.domainDefinition || ""}`.trim(),
        `${project.name} can be understood as ${project.definition || project.description}. ${project.domainDefinition || ""}`.trim()
      ]);
    case "need":
      return chooseReplyVariant(variantKey, [
        `${project.name} is needed because ${project.need}.`,
        `The main need behind ${project.name} is that ${project.need}.`,
        `${project.name} matters because ${project.need}.`
      ]);
    case "dataset":
      return chooseReplyVariant(variantKey, [
        `${project.name} uses ${project.datasets}.`,
        `For data, ${project.name} is built on ${project.datasets}.`,
        `The dataset side of ${project.name} is ${project.datasets}.`
      ]);
    case "algorithm":
      return chooseReplyVariant(variantKey, [
        `${project.name} is built around ${project.engine} and uses ${formatList(project.algorithms || [])}.`,
        `On the model side, ${project.name} uses ${formatList(project.algorithms || [])}, with ${project.engine} as the main presentation engine.`,
        `${project.name} relies on ${formatList(project.algorithms || [])}. In the current portfolio explanation, the main engine is ${project.engine}.`
      ]);
    case "technology":
      return chooseReplyVariant(variantKey, [
        `${project.name} uses ${formatList(project.technologies)}. It is delivered as a ${project.platform}.`,
        `The stack behind ${project.name} includes ${formatList(project.technologies)}. The delivery layer is a ${project.platform}.`,
        `${project.name} is built with ${formatList(project.technologies)} and is positioned as a ${project.platform}.`
      ]);
    case "features":
      return chooseReplyVariant(variantKey, [
        `${project.name} includes ${formatList(project.features)}.`,
        `The main functions of ${project.name} are ${formatList(project.functionality || project.features)}.`,
        `${project.name} mainly does four things: ${formatList(project.functionality || project.features)}.`
      ]);
    case "architecture":
      return chooseReplyVariant(variantKey, [
        `${project.name} works in this flow: ${formatFlow(project.architecture)}.`,
        `The working mechanism of ${project.name} is ${formatFlow(project.architecture)}.`,
        `Step by step, ${project.name} goes through this pipeline: ${formatFlow(project.architecture)}.`
      ]);
    case "problem":
      return chooseReplyVariant(variantKey, [
        `${project.name} was built to solve this problem: ${project.problem}`,
        `The core problem behind ${project.name} is ${project.problem}`,
        `${project.name} begins from this challenge: ${project.problem}`
      ]);
    case "solution":
      return chooseReplyVariant(variantKey, [
        `${project.name} approaches it like this: ${project.solution}`,
        `The solution path in ${project.name} is ${project.solution}`,
        `${project.name} solves the problem by ${project.solution.charAt(0).toLowerCase()}${project.solution.slice(1)}`
      ]);
    case "outcome":
      return chooseReplyVariant(variantKey, [
        `${project.name} creates this practical value: ${project.outcome}`,
        `The result of ${project.name} is that ${project.outcome.charAt(0).toLowerCase()}${project.outcome.slice(1)}`,
        `${project.name} is useful because ${project.outcome.charAt(0).toLowerCase()}${project.outcome.slice(1)}`
      ]);
    case "demo":
      return chooseReplyVariant(variantKey, [
        `${project.demoHint}`,
        `To try ${project.name}, ${project.demoHint.charAt(0).toLowerCase()}${project.demoHint.slice(1)}`,
        `${project.demoHint} That is the fastest way to see the project in action.`
      ]);
    case "evaluation":
      return chooseReplyVariant(variantKey, [
        `${project.evaluation} ${project.resultSnapshot || ""}`.trim(),
        `For evaluation, ${project.evaluation} ${project.resultSnapshot || ""}`.trim(),
        `${project.name} is evaluated like this: ${project.evaluation} ${project.resultSnapshot || ""}`.trim()
      ]);
    case "proof":
      return chooseReplyVariant(variantKey, [
        `You can verify ${project.name} through ${formatList(formatArtifacts(project.proof || []))}.`,
        `The main proof artifacts for ${project.name} are ${formatList(formatArtifacts(project.proof || []))}.`,
        `${project.name} is backed by visible proof such as ${formatList(formatArtifacts(project.proof || []))}.`
      ]);
    case "limitations":
      return chooseReplyVariant(variantKey, [
        `A fair limitation of ${project.name} is that ${project.limitations}`,
        `${project.name} is strong as a portfolio build, but one limitation is that ${project.limitations}`,
        `The current limitation to keep in mind for ${project.name} is that ${project.limitations}`
      ]);
    case "future":
      return chooseReplyVariant(variantKey, [
        `A strong next step for ${project.name} is: ${project.futureScope}`,
        `The future scope for ${project.name} is ${project.futureScope.charAt(0).toLowerCase()}${project.futureScope.slice(1)}`,
        `${project.name} can grow further by ${project.futureScope.charAt(0).toLowerCase()}${project.futureScope.slice(1)}`
      ]);
    case "platform":
      return chooseReplyVariant(variantKey, [
        `${project.name} is positioned as a ${project.platform}.`,
        `The delivery form of ${project.name} is a ${project.platform}.`,
        `${project.name} is presented in the portfolio as a ${project.platform}.`
      ]);
    case "engine":
      return chooseReplyVariant(variantKey, [
        `${project.name} is driven by ${project.engine}.`,
        `The main engine behind ${project.name} is ${project.engine}.`,
        `At the model level, ${project.name} is centered on ${project.engine}.`
      ]);
    default:
      return chooseReplyVariant(variantKey, [
        `${getProjectSummary(project)} Problem: ${project.problem} Solution: ${project.solution}`,
        `${project.name} is a ${project.category} build. ${project.description} It uses ${formatList(project.algorithms || project.technologies.slice(0, 4))} and is delivered as a ${project.platform}.`,
        `${project.name} combines ${project.datasets || "local portfolio data"}, ${project.engine}, and ${project.platform} delivery. ${project.resultSnapshot || project.outcome}`
      ]);
  }
}

function buildProjectComparisonReply(projects) {
  if (!projects.length) {
    return "";
  }

  const variantKey = `comparison:${projects.map((project) => project.id).join("-")}`;
  const summaries = projects.map((project) => `${project.name} focuses on ${project.category.toLowerCase()} and is delivered as a ${project.platform}.`);
  const techSummary = projects.map((project) => `${project.name}: ${formatList(project.technologies.slice(0, 4))}`).join(" | ");
  const resultSummary = projects.map((project) => `${project.name}: ${project.resultSnapshot || project.outcome}`).join(" ");

  return chooseReplyVariant(variantKey, [
    `Here is a quick comparison: ${summaries.join(" ")} Their main technologies are ${techSummary}.`,
    `These projects differ mainly by domain and delivery. ${summaries.join(" ")} On the proof side: ${resultSummary}`,
    `A simple comparison is this: ${summaries.join(" ")} Their stack and output paths break down like this: ${techSummary}.`
  ]);
}

function findProjectsByTechnologyOrDomain(message) {
  return portfolioKnowledge.projects.filter((project) => {
    return project.technologies.some((technology) => message.includes(normalizeText(technology))) ||
      message.includes(normalizeText(project.category)) ||
      message.includes(normalizeText(project.engine || ""));
  });
}

function getInstantGlossaryReply(message) {
  const matchedEntry = instantGlossaryReplies.find((entry) => {
    return entry.terms.some((term) => message.includes(term));
  });

  return matchedEntry ? matchedEntry.reply : "";
}

function getExactInstantGlossaryReply(message) {
  const normalizedMessage = normalizeText(message);
  const matchedEntry = instantGlossaryReplies.find((entry) => {
    return entry.terms.some((term) => normalizeText(term) === normalizedMessage);
  });

  return matchedEntry ? matchedEntry.reply : "";
}

function extractMultiplicationTableRequest(message) {
  const normalizedMessage = normalizeText(message);
  let match = normalizedMessage.match(/\b(?:table of|multiplication table of)\s+(\d{1,3})\b/);

  if (!match) {
    match = normalizedMessage.match(/\b(\d{1,3})(?:st|nd|rd|th)?\s+table\b/);
  }

  if (!match) {
    match = normalizedMessage.match(/\btable\s+(\d{1,3})\b/);
  }

  const tableNumber = Number(match?.[1]);
  if (!Number.isFinite(tableNumber) || tableNumber <= 0 || tableNumber > 100) {
    return null;
  }

  return tableNumber;
}

function buildMultiplicationTableReply(tableNumber) {
  const lines = [];

  for (let multiplier = 1; multiplier <= 10; multiplier += 1) {
    lines.push(`${tableNumber} x ${multiplier} = ${tableNumber * multiplier}`);
  }

  return `Here is the table of ${tableNumber}:\n${lines.join("\n")}`;
}

function isPortfolioSpecificMessage(message) {
  const directPortfolioTerms = [
    "guruprasad",
    "portfolio",
    "resume",
    "cv",
    "contact",
    "email",
    "github",
    "linkedin",
    "whatsapp",
    "phone number",
    "location",
    "heart disease detection",
    "heart disease prediction",
    "study mood detector",
    "diet planner",
    "playlist generator",
    "project demo",
    "live demo",
    "your project",
    "your projects",
    "your work",
    "your portfolio",
    "your resume",
    "your cv",
    "your skills",
    "your education",
    "your contact",
    "your email",
    "your github",
    "your linkedin",
    "your whatsapp",
    "your location",
    "your profile",
    "your background",
    "about you",
    "about yourself",
    "who are you",
    "who is this assistant",
    "certification",
    "certifications",
    "achievement",
    "achievements",
    "experience"
  ];

  if (directPortfolioTerms.some((term) => message.includes(term))) {
    return true;
  }

  return [
    "projects",
    "project",
    "skills",
    "education",
    "about me",
    "about you",
    "who are you",
    "my work",
    "your work",
    "my profile",
    "your profile",
    "my background",
    "your background",
    "hire me"
  ].includes(message);
}

function getChatbotReply(input) {
  const message = normalizeText(input);
  const matchedProjects = findProjectsInMessage(message);
  const matchedProject = matchedProjects[0] || null;
  const hasComparisonIntent = includesAny(message, PROJECT_COMPARISON_TERMS) && matchedProjects.length >= 2;
  const contextualProject = matchedProject || (isProjectFollowUpMessage(message) ? getLastReferencedProject() : null);
  const isPortfolioQuery = isPortfolioSpecificMessage(message) || Boolean(matchedProject) || Boolean(contextualProject);

  if (matchedProject) {
    chatbotConversationContext.activeProjectId = matchedProject.id;
  }

  if (includesAny(message, ["hello", "hi", "hey", "namaste"])) {
    return chooseReplyVariant("greeting", [
      `Hello. I am Guru AI Portfolio Assistant. Ask me about ${portfolioKnowledge.profile.name}'s projects, live demos, resume, skills, education, services, or contact details.`,
      `Hi. I can walk you through ${portfolioKnowledge.profile.name}'s portfolio, especially the projects, demos, resume, skills, and contact details.`,
      `Welcome. I am here to explain ${portfolioKnowledge.profile.name}'s portfolio, including project logic, results, resume highlights, and contact paths.`
    ]);
  }

  if (includesAny(message, ["what can you do", "how can you help", "help me", "help"])) {
    return chooseReplyVariant("help", [
      `I can help you explore ${portfolioKnowledge.profile.name}'s portfolio in detail. You can ask about projects, demo flows, tech stacks, architecture, resume highlights, education, services, strengths, or contact details.`,
      `I mainly answer portfolio questions. Ask about a project's purpose, dataset, algorithms, working flow, evaluation, results, future scope, resume details, or how to contact Guruprasad.`,
      `I can explain the full portfolio clearly: flagship project, case studies, live demos, project mechanisms, skills, education, achievements, services, and contact details.`
    ]);
  }

  if (!matchedProject && !contextualProject && includesAny(message, ["demo", "live demo", "project demo", "try demo"])) {
    return "You can explore live demos for the Heart Disease Detection System, AI Study Mood Detector, AI-Powered Diet Planner, and Mood-Based Playlist Generator from the Projects page.";
  }

  if (includesAny(message, ["introduce guruprasad", "who is guruprasad", "tell me about guruprasad", "guruprasad bio"])) {
    return chooseReplyVariant("bio", [
      `${portfolioKnowledge.profile.bio} He is based in ${portfolioKnowledge.profile.location}.`,
      `${portfolioKnowledge.profile.name} is an ${portfolioKnowledge.profile.title} focused on practical AI systems, machine learning delivery, and recruiter-ready portfolio work. He is based in ${portfolioKnowledge.profile.location}.`,
      `${portfolioKnowledge.profile.name} builds machine-learning projects, portfolio demos, and proof-backed AI interfaces. He is based in ${portfolioKnowledge.profile.location}.`
    ]);
  }

  if (includesAny(message, ["full name", "guruprasad full name"])) {
    return `His full name is ${portfolioKnowledge.profile.name}, and his professional title is ${portfolioKnowledge.profile.title}.`;
  }

  if (hasComparisonIntent) {
    return buildProjectComparisonReply(matchedProjects);
  }

  if (isPortfolioQuery && includesAny(message, ["flagship", "best project", "main project", "featured project"])) {
    const flagshipProject = getProjectById("heart-disease");
    return chooseReplyVariant("flagship-project", [
      `${flagshipProject.name} is the flagship project because it combines a real dataset, multiple ML algorithms, notebook proof, a saved model, and a working Flask interface.`,
      `The flagship project is ${flagshipProject.name}. It is the strongest end-to-end story in the portfolio because it covers dataset, training, model choice, app delivery, and proof artifacts together.`,
      `${flagshipProject.name} leads the portfolio. It stands out for its healthcare relevance, multi-model workflow, Flask deployment path, and stronger proof structure.`
    ]);
  }

  if (contextualProject) {
    const intent = resolveProjectIntent(message);
    chatbotConversationContext.activeProjectId = contextualProject.id;
    chatbotConversationContext.activeIntent = intent;
    return buildProjectIntentReply(contextualProject, intent);
  }

  if (includesAny(message, ["which project uses", "which projects use", "which project has", "which projects have"])) {
    const matchingProjects = findProjectsByTechnologyOrDomain(message);
    if (matchingProjects.length) {
      return `These portfolio projects match that request: ${matchingProjects.map((project) => `${project.name} (${project.category})`).join(", ")}.`;
    }
  }

  if (isPortfolioQuery && includesAny(message, ["skill", "strength", "expertise", "core skill", "strengths"])) {
    return chooseReplyVariant("skills", [
      `${portfolioKnowledge.profile.name}'s core strengths include ${formatList(portfolioKnowledge.skills)}.`,
      `The strongest skill areas in the portfolio are ${formatList(portfolioKnowledge.skills)}.`,
      `${portfolioKnowledge.profile.name} works most strongly across ${formatList(portfolioKnowledge.skills)}.`
    ]);
  }

  if (isPortfolioQuery && includesAny(message, ["education", "degree", "diploma", "college", "resume summary"])) {
    return chooseReplyVariant("education", [
      `${portfolioKnowledge.profile.name}'s education path includes ${formatList(portfolioKnowledge.education)}. His resume highlights ${formatList(portfolioKnowledge.resumeHighlights)}.`,
      `On the education side, ${portfolioKnowledge.profile.name} has completed a diploma in AI and Data Science and is currently pursuing a Bachelor's degree in the same field. The resume highlights ${formatList(portfolioKnowledge.resumeHighlights)}.`,
      `${portfolioKnowledge.profile.name}'s academic base includes a completed diploma and an in-progress Bachelor's in Artificial Intelligence and Data Science. The resume also highlights ${formatList(portfolioKnowledge.resumeHighlights)}.`
    ]);
  }

  if (isPortfolioQuery && includesAny(message, ["career objective", "career goal", "current focus", "professional focus"])) {
    return `${portfolioKnowledge.careerObjective} He is currently focused on automated ML pipelines, practical AI systems, and real-world problem solving.`;
  }

  if (isPortfolioQuery && includesAny(message, ["resume", "cv"])) {
    return chooseReplyVariant("resume", [
      `Guruprasad's resume highlights ${formatList(portfolioKnowledge.resumeHighlights)}. It also reflects ${formatList(portfolioKnowledge.competencies)}. You can open the full resume page from this portfolio.`,
      `The resume focuses on AI and ML foundations, practical project delivery, Python and Java, and a portfolio shaped around real demos. It also reflects ${formatList(portfolioKnowledge.competencies)}.`,
      `The resume presents ${portfolioKnowledge.profile.name} as an AI and Data Science student with practical ML projects, cleaner product delivery, and strengths in ${formatList(portfolioKnowledge.resumeHighlights)}.`
    ]);
  }

  if (isPortfolioQuery && includesAny(message, ["guruprasad skills", "his skills", "technical skills", "core skills"])) {
    return `${portfolioKnowledge.profile.name} works strongly in ${formatList(portfolioKnowledge.skills)}. His profile blends AI, analytics, automation, and mobile app development.`;
  }

  if (isPortfolioQuery && includesAny(message, ["services", "what services", "offer", "can you do"])) {
    return chooseReplyVariant("services", [
      `${portfolioKnowledge.profile.name}'s portfolio currently reflects these service directions: ${formatList(portfolioKnowledge.services)}.`,
      `The portfolio shows service-fit work across ${formatList(portfolioKnowledge.services)}.`,
      `${portfolioKnowledge.profile.name} is strongest for ${formatList(portfolioKnowledge.services)}.`
    ]);
  }

  if (isPortfolioQuery && includesAny(message, ["competencies", "soft skills", "strength as person", "why hire", "why should hire"])) {
    return chooseReplyVariant("why-hire", [
      `Why Guruprasad stands out: ${formatList(portfolioKnowledge.competencies)}.`,
      `${portfolioKnowledge.profile.name} is a strong internship or project fit because of ${formatList(portfolioKnowledge.competencies)}.`,
      `From a recruiter point of view, the strongest personal advantages are ${formatList(portfolioKnowledge.competencies)}.`
    ]);
  }

  if (isPortfolioQuery && includesAny(message, ["certification", "certifications", "certificate", "certificates"])) {
    return "The portfolio currently highlights learning milestones and a certifications section, but it does not list named certificate titles in detail yet.";
  }

  if (isPortfolioQuery && includesAny(message, ["achievement", "achievements", "milestone", "milestones"])) {
    return "The portfolio highlights Guruprasad's completed diploma, ongoing AI and Data Science degree, and four working AI product demos as key milestones.";
  }

  if (isPortfolioQuery && includesAny(message, ["project", "projects", "portfolio work", "work"])) {
    return chooseReplyVariant("projects-overview", [
      `Guruprasad has built four highlighted projects: ${portfolioKnowledge.projects.map((project) => project.name).join(", ")}. ${getAllProjectsSummary()}`,
      `The portfolio currently centers on four main projects: ${portfolioKnowledge.projects.map((project) => project.name).join(", ")}. ${getAllProjectsSummary()}`,
      `There are four major project tracks in the portfolio: ${portfolioKnowledge.projects.map((project) => project.name).join(", ")}. ${getAllProjectsSummary()}`
    ]);
  }

  if (isPortfolioQuery && includesAny(message, ["contact", "email", "hire", "reach", "call", "message"])) {
    return chooseReplyVariant("contact", [
      `You can contact ${portfolioKnowledge.profile.name} at ${portfolioKnowledge.profile.email}. GitHub: ${portfolioKnowledge.profile.github}. LinkedIn: ${portfolioKnowledge.profile.linkedin}.`,
      `The direct contact paths are email at ${portfolioKnowledge.profile.email}, GitHub at ${portfolioKnowledge.profile.github}, and LinkedIn at ${portfolioKnowledge.profile.linkedin}.`,
      `To reach ${portfolioKnowledge.profile.name}, use ${portfolioKnowledge.profile.email}. The portfolio also links GitHub and LinkedIn for follow-up.`
    ]);
  }

  if (isPortfolioQuery && includesAny(message, ["location", "based", "from"])) {
    return `${portfolioKnowledge.profile.name} is based in ${portfolioKnowledge.profile.location}.`;
  }

  if (isPortfolioQuery && includesAny(message, ["github", "linkedin"])) {
    return chooseReplyVariant("profile-links", [
      `GitHub: ${portfolioKnowledge.profile.github}. LinkedIn: ${portfolioKnowledge.profile.linkedin}. Resume details are available in the About page, including education, technical skills, competencies, and career objective.`,
      `${portfolioKnowledge.profile.name}'s main profile links are GitHub at ${portfolioKnowledge.profile.github} and LinkedIn at ${portfolioKnowledge.profile.linkedin}.`,
      `The portfolio points to GitHub and LinkedIn directly: ${portfolioKnowledge.profile.github} and ${portfolioKnowledge.profile.linkedin}.`
    ]);
  }

  if (isPortfolioQuery && includesAny(message, ["whatsapp", "phone", "number"])) {
    return "You can reach Guruprasad on WhatsApp at https://wa.me/919527900530.";
  }

  if (isPortfolioQuery) {
    return chooseReplyVariant("portfolio-fallback", [
      `I can help with ${portfolioKnowledge.profile.name}'s profile, resume, demos, skills, services, projects, education, location, and contact details. Ask something direct and I will keep it clear and detailed.`,
      `Ask me anything specific about the portfolio, especially a project's need, dataset, algorithms, working, results, evaluation, resume, or contact details.`,
      `I know the portfolio best when the question is direct. Try asking about a project's mechanism, model, dataset, future scope, resume, or how to contact Guruprasad.`
    ]);
  }

  return portfolioOnlyRedirectReply;
}

function resizeChatInput() {
  if (!chatbotInput) {
    return;
  }

  chatbotInput.style.height = "auto";
  chatbotInput.style.height = `${Math.min(chatbotInput.scrollHeight, 180)}px`;
}

function resetChatInput() {
  if (!chatbotInput) {
    return;
  }

  chatbotInput.value = "";
  resizeChatInput();
}

function resetChatbotConversation() {
  if (!chatbotMessages) {
    return;
  }

  stopSpeakingState();
  chatHistory.length = 0;
  chatbotConversationContext.activeProjectId = "";
  chatbotConversationContext.activeIntent = "";
  chatbotMessages.innerHTML = initialChatbotMarkup;
  latestBotReply = chatbotMessages.querySelector(".chatbot-message")?.dataset.rawText || "";
  enhanceExistingChatMessages();
  chatbotMessages.scrollTop = 0;
}

function shouldUseInstantReply(input) {
  return Boolean(normalizeText(input));
}

async function postPortfolioJson(url, payload, timeoutMs = 6500) {
  if (!useServerChat) {
    throw new Error("Static portfolio mode");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort("timeout");
  }, timeoutMs);

  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (error) {
    window.clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error(`The portfolio server took longer than ${Math.round(timeoutMs / 1000)} seconds.`);
    }

    throw error;
  }

  window.clearTimeout(timeoutId);

  const rawBody = await response.text();
  const trimmedBody = rawBody.trim();

  if (!trimmedBody) {
    throw new Error("The portfolio server returned an empty response.");
  }

  let parsed;

  try {
    parsed = JSON.parse(trimmedBody);
  } catch (error) {
    if (trimmedBody.startsWith("<")) {
      throw new Error("The portfolio server returned HTML instead of API JSON.");
    }

    throw new Error("The portfolio server returned invalid JSON.");
  }

  if (!response.ok) {
    throw new Error(parsed.error || "The portfolio server request failed.");
  }

  return parsed;
}

async function getServerChatbotReply(input) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort("timeout");
  }, CHATBOT_SERVER_TIMEOUT_MS);

  let response;

  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: input,
        history: chatHistory
      }),
      signal: controller.signal
    });
  } catch (error) {
    window.clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error(`The live AI reply took longer than ${CHATBOT_SERVER_TIMEOUT_MS / 1000} seconds.`);
    }

    throw error;
  }

  window.clearTimeout(timeoutId);

  const rawBody = await response.text();
  const trimmedBody = rawBody.trim();
  let payload = null;

  if (!trimmedBody) {
    throw new Error("The portfolio server returned an empty response. Restart `server.py` and try again.");
  }

  try {
    payload = JSON.parse(trimmedBody);
  } catch (error) {
    if (trimmedBody.startsWith("<")) {
      throw new Error("The portfolio server returned HTML instead of chat JSON. Open the site through `server.py` at `http://127.0.0.1:8000` and try again.");
    }

    throw new Error("The portfolio server returned invalid chat data. Restart `server.py` and try again.");
  }

  if (!response.ok) {
    throw new Error(payload.error || "Server chat request failed");
  }

  if (!payload.reply) {
    throw new Error("The portfolio server did not return a chatbot reply.");
  }

  return payload.reply;
}

function openChatbot() {
  if (!chatbotPanel || !chatbotToggle) {
    return;
  }

  undockHomeMobileHeaderChatbot();
  applyChatbotMessageZoom();
  ensureChatbotResizeHandle();
  applySavedChatbotSize();
  chatbotPanel.hidden = false;
  chatbotToggle.setAttribute("aria-expanded", "true");
  syncChatbotDockState();
  updateChatbotCompactState();
  clampChatbotPosition();
  window.setTimeout(() => {
    chatbotInput?.focus();
    resizeChatInput();
  }, 40);
}

function closeChatbot() {
  if (!chatbotPanel || !chatbotToggle) {
    return;
  }

  chatbotDragState = null;
  chatbotResizeState = null;
  activeDragHandle = null;
  activeResizeHandle = null;
  chatbotWidget?.classList.remove("is-dragging", "is-resizing");
  chatbotPanel.classList.remove("is-resize-hover");
  setNativeResizeCursor("");
  chatbotPanel.hidden = true;
  chatbotToggle.setAttribute("aria-expanded", "false");
  chatbotWidget.classList.remove("is-compact");
  syncChatbotDockState();
}

function initializeChatbotState() {
  if (!chatbotPanel || !chatbotToggle) {
    return;
  }

  applyChatbotMessageZoom();
  chatbotPanel.classList.remove("is-resize-hover");
  setNativeResizeCursor("");
  chatbotPanel.hidden = true;
  chatbotToggle.setAttribute("aria-expanded", "false");
  chatbotWidget.classList.remove("is-compact");
  syncChatbotDockState();
}

function toggleChatbot(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const isHidden = chatbotPanel ? chatbotPanel.hidden : true;

  if (isHidden) {
    openChatbot();
  } else {
    closeChatbot();
  }
}

function handleChatbotOutsidePointerDown(event) {
  if (!chatbotPanel || !chatbotWidget || chatbotPanel.hidden) {
    return;
  }

  if (event.pointerType === "touch" || window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  if (chatbotDragState || chatbotResizeState) {
    return;
  }

  if (event.target.closest("#chatbotWidget")) {
    return;
  }

  closeChatbot();
}

function getChatbotBounds(width = chatbotWidget?.offsetWidth || 0, height = chatbotWidget?.offsetHeight || 0) {
  return {
    maxLeft: Math.max(window.innerWidth - width - 12, 12),
    maxTop: Math.max(window.innerHeight - height - 12, 12),
  };
}

function isMobileChatbotFloatingMode() {
  return document.body.classList.contains("layout-mobile-mode");
}

function isHomePortfolioPage() {
  const pathname = decodeURIComponent(window.location.pathname || "/").replace(/\\/g, "/");
  return pathname === "/" || pathname.endsWith("/index.html") || pathname.endsWith("/index.htm");
}

function isHomeMobileHeaderChatbotMode() {
  return isMobileChatbotFloatingMode() && isHomePortfolioPage();
}

function getChatbotPositionStorageKey() {
  return isMobileChatbotFloatingMode()
    ? CHATBOT_POSITION_STORAGE_KEY
    : CHATBOT_DESKTOP_POSITION_STORAGE_KEY;
}

function undockHomeMobileHeaderChatbot() {
  if (!chatbotWidget) {
    return;
  }

  if (chatbotWidget.parentElement !== document.body) {
    document.body.appendChild(chatbotWidget);
  }

  chatbotWidget.classList.remove("is-home-mobile-header-docked");
  document.body.classList.remove("home-mobile-chatbot-docked");
}

function dockHomeMobileHeaderChatbot() {
  if (!chatbotWidget || !chatbotPanel || !chatbotPanel.hidden || !isHomeMobileHeaderChatbotMode()) {
    return false;
  }

  const siteHeader = document.querySelector(".site-header");
  if (!(siteHeader instanceof HTMLElement)) {
    return false;
  }

  if (chatbotWidget.parentElement !== siteHeader) {
    siteHeader.appendChild(chatbotWidget);
  }

  chatbotWidget.classList.add("is-home-mobile-header-docked");
  document.body.classList.add("home-mobile-chatbot-docked");
  resetChatbotDock();
  return true;
}

function loadSavedChatbotPosition() {
  try {
    const raw = localStorage.getItem(getChatbotPositionStorageKey());
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const left = Number(parsed.left);
    const top = Number(parsed.top);

    if (!Number.isFinite(left) || !Number.isFinite(top)) {
      return null;
    }

    return { left, top };
  } catch (error) {
    return null;
  }
}

function saveChatbotPosition(left, top) {
  try {
    localStorage.setItem(getChatbotPositionStorageKey(), JSON.stringify({ left, top }));
  } catch (error) {
    // Ignore storage failures.
  }
}

function setChatbotPosition(left, top) {
  if (!chatbotWidget) {
    return;
  }

  const priority = isMobileChatbotFloatingMode() ? "important" : "";
  chatbotWidget.style.setProperty("left", `${left}px`, priority);
  chatbotWidget.style.setProperty("top", `${top}px`, priority);
  chatbotWidget.style.setProperty("right", "auto", priority);
  chatbotWidget.style.setProperty("bottom", "auto", priority);
  chatbotWidget.style.setProperty("margin", "0", priority);
}

function clampChatbotPosition() {
  if (!chatbotWidget) {
    return;
  }

  if (!chatbotWidget.style.left || !chatbotWidget.style.top) {
    return;
  }

  const bounds = getChatbotBounds(chatbotWidget.offsetWidth, chatbotWidget.offsetHeight);
  const nextLeft = clamp(parseFloat(chatbotWidget.style.left) || 12, 12, bounds.maxLeft);
  const nextTop = clamp(parseFloat(chatbotWidget.style.top) || 12, 12, bounds.maxTop);
  setChatbotPosition(nextLeft, nextTop);
}

function resetChatbotDock() {
  if (!chatbotWidget || !chatbotPanel) {
    return;
  }

  chatbotWidget.style.left = "";
  chatbotWidget.style.top = "";
  chatbotWidget.style.right = "";
  chatbotWidget.style.bottom = "";
  chatbotWidget.style.margin = "";
  chatbotWidget.style.width = "";
  chatbotPanel.style.height = "";
}

function applySavedChatbotPosition() {
  if (!chatbotWidget) {
    return false;
  }

  const savedPosition = loadSavedChatbotPosition();
  if (!savedPosition) {
    return false;
  }

  setChatbotPosition(savedPosition.left, savedPosition.top);
  clampChatbotPosition();
  return true;
}

function dockChatbotIntoHeroSection() {
  if (!chatbotWidget || !isHomePortfolioPage()) {
    return false;
  }

  const anchor =
    document.querySelector(".hero-panel .profile-spotlight") ||
    document.querySelector(".hero-panel");

  if (!(anchor instanceof HTMLElement)) {
    return false;
  }

  const anchorRect = anchor.getBoundingClientRect();
  if (anchorRect.bottom <= 24 || anchorRect.top >= window.innerHeight - 24) {
    return false;
  }

  const toggleWidth = chatbotToggle?.offsetWidth || 168;
  const toggleHeight = chatbotToggle?.offsetHeight || 72;
  const bounds = getChatbotBounds(toggleWidth, toggleHeight);
  const nextLeft = clamp(anchorRect.right - toggleWidth - 10, 12, bounds.maxLeft);
  const nextTop = clamp(anchorRect.bottom - toggleHeight - 10, 12, bounds.maxTop);

  setChatbotPosition(nextLeft, nextTop);

  if (isMobileChatbotFloatingMode()) {
    saveChatbotPosition(nextLeft, nextTop);
  }

  return true;
}

function syncChatbotDockState() {
  if (!chatbotWidget || !chatbotPanel) {
    return;
  }

  if (isMobileChatbotFloatingMode()) {
    if (dockHomeMobileHeaderChatbot()) {
      return;
    }

    undockHomeMobileHeaderChatbot();

    if (!applySavedChatbotPosition()) {
      resetChatbotDock();
    }
    return;
  }

  undockHomeMobileHeaderChatbot();

  if (applySavedChatbotPosition()) {
    return;
  }

  resetChatbotDock();
}

function updateChatbotCompactState() {
  if (!chatbotWidget || !chatbotPanel) {
    return;
  }

  const widgetWidth = chatbotWidget.offsetWidth || CHATBOT_MIN_WIDTH;
  const panelHeight = chatbotPanel.offsetHeight || CHATBOT_MIN_HEIGHT;
  const isCompact = widgetWidth <= CHATBOT_COMPACT_WIDTH || panelHeight <= CHATBOT_COMPACT_HEIGHT;
  chatbotWidget.classList.toggle("is-compact", isCompact);
}

function setNativeResizeCursor(cursor) {
  const isActive = Boolean(cursor);
  document.body.classList.toggle("chatbot-native-resize", isActive);

  if (isActive) {
    document.body.style.setProperty("--chatbot-resize-cursor", cursor);
    document.documentElement.style.setProperty("--chatbot-resize-cursor", cursor);
  } else {
    document.body.style.removeProperty("--chatbot-resize-cursor");
    document.documentElement.style.removeProperty("--chatbot-resize-cursor");
  }
}

function loadSavedChatbotSize() {
  try {
    const raw = localStorage.getItem(CHATBOT_SIZE_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const width = Number(parsed.width);
    const height = Number(parsed.height);

    if (!Number.isFinite(width) || !Number.isFinite(height)) {
      return null;
    }

    return {
      width: clamp(width, CHATBOT_MIN_WIDTH, CHATBOT_MAX_WIDTH),
      height: Math.max(height, CHATBOT_MIN_HEIGHT),
    };
  } catch (error) {
    return null;
  }
}

function saveChatbotSize(width, height) {
  try {
    localStorage.setItem(CHATBOT_SIZE_STORAGE_KEY, JSON.stringify({ width, height }));
  } catch (error) {
    // Ignore storage failures.
  }
}

function applySavedChatbotSize() {
  if (!chatbotWidget || !chatbotPanel) {
    return;
  }

  const savedSize = loadSavedChatbotSize();
  if (!savedSize) {
    return;
  }

  chatbotWidget.style.width = `${savedSize.width}px`;
  chatbotPanel.style.height = `${savedSize.height}px`;
  updateChatbotCompactState();
}

function loadSavedChatbotMessageZoom() {
  try {
    const raw = localStorage.getItem(CHATBOT_MESSAGE_ZOOM_STORAGE_KEY);
    if (!raw) {
      return 1;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      return 1;
    }

    return clamp(parsed, CHATBOT_MESSAGE_ZOOM_MIN, CHATBOT_MESSAGE_ZOOM_MAX);
  } catch (error) {
    return 1;
  }
}

function saveChatbotMessageZoom(scale) {
  try {
    localStorage.setItem(CHATBOT_MESSAGE_ZOOM_STORAGE_KEY, String(scale));
  } catch (error) {
    // Ignore storage failures.
  }
}

function applyChatbotMessageZoom(scale = loadSavedChatbotMessageZoom()) {
  if (!chatbotMessages) {
    return;
  }

  const clampedScale = clamp(scale, CHATBOT_MESSAGE_ZOOM_MIN, CHATBOT_MESSAGE_ZOOM_MAX);
  const previousScrollable = Math.max(chatbotMessages.scrollHeight - chatbotMessages.clientHeight, 0);
  const previousRatio = previousScrollable > 0 ? chatbotMessages.scrollTop / previousScrollable : 0;

  chatbotMessages.style.zoom = clampedScale.toFixed(2);

  window.requestAnimationFrame(() => {
    const nextScrollable = Math.max(chatbotMessages.scrollHeight - chatbotMessages.clientHeight, 0);
    chatbotMessages.scrollTop = nextScrollable > 0 ? previousRatio * nextScrollable : 0;
  });
}

function stepChatbotMessageZoom(direction) {
  const delta = direction === "in" ? CHATBOT_MESSAGE_ZOOM_STEP : -CHATBOT_MESSAGE_ZOOM_STEP;
  const currentScale = loadSavedChatbotMessageZoom();
  const nextScale = clamp(
    Math.round((currentScale + delta) * 100) / 100,
    CHATBOT_MESSAGE_ZOOM_MIN,
    CHATBOT_MESSAGE_ZOOM_MAX
  );

  saveChatbotMessageZoom(nextScale);
  applyChatbotMessageZoom(nextScale);
}

function ensureChatbotResizeHandle() {
  if (!chatbotPanel || chatbotPanel.querySelector(".chatbot-resize-handle")) {
    return;
  }

  const resizeHandle = document.createElement("div");
  resizeHandle.className = "chatbot-resize-handle";
  resizeHandle.setAttribute("role", "presentation");
  resizeHandle.setAttribute("aria-hidden", "true");
  resizeHandle.addEventListener("pointerdown", startChatbotResize);
  chatbotPanel.appendChild(resizeHandle);
}

function getChatbotResizeMeta(event) {
  if (!chatbotPanel) {
    return null;
  }

  const rect = chatbotPanel.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;
  const nearLeft = offsetX >= 0 && offsetX <= CHATBOT_RESIZE_GUTTER;
  const nearRight = offsetX <= rect.width && offsetX >= rect.width - CHATBOT_RESIZE_GUTTER;
  const nearTop = offsetY >= 0 && offsetY <= CHATBOT_RESIZE_GUTTER;
  const nearBottom = offsetY <= rect.height && offsetY >= rect.height - CHATBOT_RESIZE_GUTTER;

  let direction = null;

  if (nearTop && nearLeft) {
    direction = "top-left";
  } else if (nearTop && nearRight) {
    direction = "top-right";
  } else if (nearBottom && nearLeft) {
    direction = "bottom-left";
  } else if (nearBottom && nearRight) {
    direction = "bottom-right";
  } else if (nearTop) {
    direction = "top";
  } else if (nearBottom) {
    direction = "bottom";
  } else if (nearLeft) {
    direction = "left";
  } else if (nearRight) {
    direction = "right";
  }

  if (!direction) {
    return null;
  }

  return {
    direction,
    cursor: CHATBOT_RESIZE_CURSORS[direction],
    rect,
  };
}

if (chatbotToggle) {
  chatbotToggle.addEventListener("click", (event) => {
    if (suppressChatbotToggleClick) {
      event.preventDefault();
      event.stopPropagation();
      suppressChatbotToggleClick = false;
      return;
    }

    toggleChatbot(event);
  });

  chatbotToggle.addEventListener("pointerdown", (event) => {
    if (!chatbotPanel) {
      return;
    }

    startChatbotDrag(event, { allowControls: true });
  });
}

if (chatbotClose) {
  chatbotClose.addEventListener("click", closeChatbot);
}

if (chatbotClear) {
  chatbotClear.addEventListener("click", resetChatbotConversation);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function startChatbotDrag(event, options = {}) {
  const isMobileDragMode = isMobileChatbotFloatingMode();
  const isLauncherHandle = event.currentTarget === chatbotToggle;
  const isHeaderHandle = event.currentTarget === chatbotHeader;

  if (!chatbotWidget || (!isMobileDragMode && window.matchMedia("(pointer: coarse)").matches) || chatbotResizeState) {
    return;
  }

  if (isHomeMobileHeaderChatbotMode() && chatbotPanel?.hidden) {
    return;
  }

  const clickedResizeHandle = event.target.closest(".chatbot-resize-handle");
  const clickedInteractiveControl = event.target.closest("button, input, textarea, a, label, .chatbot-header-actions, .chatbot-form");
  const allowControls = Boolean(options.allowControls);

  if (event.button !== 0) {
    return;
  }

  if (clickedResizeHandle) {
    startChatbotResize(event);
    return;
  }

  if (isMobileDragMode && !isLauncherHandle && !isHeaderHandle) {
    return;
  }

  if (clickedInteractiveControl && !allowControls) {
    return;
  }

  if (!isMobileDragMode && getChatbotResizeMeta(event)) {
    startChatbotResize(event);
    return;
  }

  const widgetRect = chatbotWidget.getBoundingClientRect();
  chatbotDragState = {
    offsetX: event.clientX - widgetRect.left,
    offsetY: event.clientY - widgetRect.top,
    startX: event.clientX,
    startY: event.clientY,
    moved: false
  };
  activeDragHandle = event.currentTarget;

  if (activeDragHandle && typeof activeDragHandle.setPointerCapture === "function") {
    activeDragHandle.setPointerCapture(event.pointerId);
  }

  chatbotWidget.classList.add("is-dragging");
  setChatbotPosition(widgetRect.left, widgetRect.top);
}

function startChatbotResize(event) {
  if (!chatbotWidget || !chatbotPanel || window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  if (event.button !== 0) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const widgetRect = chatbotWidget.getBoundingClientRect();
  const panelRect = chatbotPanel.getBoundingClientRect();
  const resizeMeta = getChatbotResizeMeta(event) || {
    direction: "bottom-right",
    cursor: CHATBOT_RESIZE_CURSORS["bottom-right"],
  };

  chatbotResizeState = {
    direction: resizeMeta.direction,
    cursor: resizeMeta.cursor,
    startX: event.clientX,
    startY: event.clientY,
    startLeft: widgetRect.left,
    startTop: widgetRect.top,
    startWidth: widgetRect.width,
    startHeight: panelRect.height,
  };
  activeResizeHandle = event.currentTarget;

  if (activeResizeHandle && typeof activeResizeHandle.setPointerCapture === "function") {
    activeResizeHandle.setPointerCapture(event.pointerId);
  }

  chatbotWidget.classList.add("is-resizing");
  chatbotPanel.classList.add("is-resize-hover");
  chatbotPanel.dataset.resizeDirection = resizeMeta.direction;
  setNativeResizeCursor(resizeMeta.cursor);
  chatbotWidget.style.left = `${widgetRect.left}px`;
  chatbotWidget.style.top = `${widgetRect.top}px`;
  chatbotWidget.style.right = "auto";
  chatbotWidget.style.bottom = "auto";
  chatbotWidget.style.margin = "0";
}

function moveChatbot(event) {
  if (!chatbotWidget) {
    return;
  }

  if (chatbotResizeState && chatbotPanel) {
    const { direction, startLeft, startTop, startWidth, startHeight } = chatbotResizeState;
    const dx = event.clientX - chatbotResizeState.startX;
    const dy = event.clientY - chatbotResizeState.startY;
    const startRight = startLeft + startWidth;
    const startBottom = startTop + startHeight;

    let nextLeft = startLeft;
    let nextTop = startTop;
    let nextWidth = startWidth;
    let nextHeight = startHeight;

    if (direction.includes("right")) {
      const maxWidth = Math.max(CHATBOT_MIN_WIDTH, Math.min(CHATBOT_MAX_WIDTH, window.innerWidth - startLeft - 12));
      nextWidth = clamp(startWidth + dx, CHATBOT_MIN_WIDTH, maxWidth);
    }

    if (direction.includes("left")) {
      const minLeft = Math.max(12, startRight - CHATBOT_MAX_WIDTH);
      const maxLeft = startRight - CHATBOT_MIN_WIDTH;
      nextLeft = clamp(startLeft + dx, minLeft, maxLeft);
      nextWidth = startRight - nextLeft;
    }

    if (direction.includes("bottom")) {
      const maxHeight = Math.max(CHATBOT_MIN_HEIGHT, window.innerHeight - startTop - 12);
      nextHeight = clamp(startHeight + dy, CHATBOT_MIN_HEIGHT, maxHeight);
    }

    if (direction.includes("top")) {
      const minTop = 12;
      const maxTop = startBottom - CHATBOT_MIN_HEIGHT;
      nextTop = clamp(startTop + dy, minTop, maxTop);
      nextHeight = startBottom - nextTop;
    }

    setChatbotPosition(nextLeft, nextTop);
    chatbotWidget.style.width = `${nextWidth}px`;
    chatbotPanel.style.height = `${nextHeight}px`;
    updateChatbotCompactState();
    clampChatbotPosition();
    return;
  }

  if (!chatbotWidget || !chatbotDragState) {
    return;
  }

  const bounds = getChatbotBounds(chatbotWidget.offsetWidth, chatbotWidget.offsetHeight);
  const maxLeft = bounds.maxLeft;
  const maxTop = bounds.maxTop;
  const nextLeft = clamp(event.clientX - chatbotDragState.offsetX, 12, maxLeft);
  const nextTop = clamp(event.clientY - chatbotDragState.offsetY, 12, maxTop);

  if (
    Math.abs(event.clientX - chatbotDragState.startX) > 6 ||
    Math.abs(event.clientY - chatbotDragState.startY) > 6
  ) {
    chatbotDragState.moved = true;
    suppressChatbotToggleClick = true;
  }

  setChatbotPosition(nextLeft, nextTop);
}

function stopChatbotDrag(event) {
  if (chatbotResizeState) {
    chatbotResizeState = null;

    if (activeResizeHandle && typeof activeResizeHandle.releasePointerCapture === "function") {
      try {
        activeResizeHandle.releasePointerCapture(event?.pointerId);
      } catch (error) {
        // Ignore release errors from completed pointer interactions.
      }
    }

    activeResizeHandle = null;
    chatbotWidget?.classList.remove("is-resizing");
    chatbotPanel?.classList.remove("is-resize-hover");
    if (chatbotPanel) {
      delete chatbotPanel.dataset.resizeDirection;
    }
    setNativeResizeCursor("");
    saveChatbotSize(chatbotWidget.offsetWidth, chatbotPanel.offsetHeight);
    updateChatbotCompactState();
    clampChatbotPosition();
    return;
  }

  if (!chatbotWidget || !chatbotDragState) {
    return;
  }

  const finalLeft = parseFloat(chatbotWidget.style.left) || 12;
  const finalTop = parseFloat(chatbotWidget.style.top) || 12;
  const didMove = chatbotDragState.moved;
  chatbotDragState = null;
  if (activeDragHandle && typeof activeDragHandle.releasePointerCapture === "function") {
    try {
      activeDragHandle.releasePointerCapture(event?.pointerId);
    } catch (error) {
      // Ignore release errors from completed pointer interactions.
    }
  }
  activeDragHandle = null;
  chatbotWidget.classList.remove("is-dragging");
  if (didMove) {
    saveChatbotPosition(finalLeft, finalTop);
  }
  window.setTimeout(() => {
    suppressChatbotToggleClick = false;
  }, 0);
}

if (chatbotPanel) {
  ensureChatbotResizeHandle();
  chatbotPanel.addEventListener("pointerdown", startChatbotDrag);
  chatbotPanel.addEventListener("pointermove", (event) => {
    if (window.matchMedia("(pointer: coarse)").matches || chatbotResizeState) {
      return;
    }

    if (event.target.closest("button, input, textarea, a, label, .chatbot-header-actions, .chatbot-form")) {
      chatbotPanel.classList.remove("is-resize-hover");
      delete chatbotPanel.dataset.resizeDirection;
      setNativeResizeCursor("");
      return;
    }

    const resizeMeta = getChatbotResizeMeta(event);
    const isResizeHover = Boolean(resizeMeta);
    chatbotPanel.classList.toggle("is-resize-hover", isResizeHover);

    if (isResizeHover) {
      chatbotPanel.dataset.resizeDirection = resizeMeta.direction;
      setNativeResizeCursor(resizeMeta.cursor);
    } else {
      delete chatbotPanel.dataset.resizeDirection;
      setNativeResizeCursor("");
    }
  });
  chatbotPanel.addEventListener("pointerleave", () => {
    if (!chatbotResizeState) {
      chatbotPanel.classList.remove("is-resize-hover");
      delete chatbotPanel.dataset.resizeDirection;
      setNativeResizeCursor("");
    }
  });
}

if (chatbotHeader) {
  chatbotHeader.addEventListener("pointerdown", startChatbotDrag);
}

if (chatbotMessages) {
  chatbotMessages.setAttribute("title", "Use Ctrl + mouse wheel to zoom chat messages");
  chatbotMessages.addEventListener("wheel", (event) => {
    if (!event.ctrlKey) {
      return;
    }

    event.preventDefault();
    stepChatbotMessageZoom(event.deltaY < 0 ? "in" : "out");
  }, { passive: false });
}

window.addEventListener("pointermove", moveChatbot);
window.addEventListener("pointerup", stopChatbotDrag);
window.addEventListener("pointercancel", stopChatbotDrag);
document.addEventListener("pointerdown", handleChatbotOutsidePointerDown);
window.addEventListener("resize", () => {
  syncChatbotDockState();
  clampChatbotPosition();
  updateChatbotCompactState();
});
window.addEventListener("pageshow", initializeChatbotState);

if (chatbotVoice && (canUseServerTts() || "speechSynthesis" in window)) {
  chatbotVoice.addEventListener("click", () => {
    if (!latestBotReply) {
      return;
    }
    speakText(latestBotReply, chatbotVoice);
  });
}

if (chatbotPause && (canUseServerTts() || "speechSynthesis" in window)) {
  chatbotPause.addEventListener("click", () => {
    if (activeAudioPlayer) {
      if (activeAudioPlayer.paused) {
        activeAudioPlayer.play().catch(() => {});
      } else {
        activeAudioPlayer.pause();
      }

      updatePauseButtonState();
      return;
    }

    if (!("speechSynthesis" in window)) {
      return;
    }

    const synth = window.speechSynthesis;

    if (synth.paused) {
      synth.resume();
    } else if (synth.speaking) {
      synth.pause();
    } else {
      return;
    }

    updatePauseButtonState();
  });
}

if (voiceIntroButtons.length && (canUseServerTts() || "speechSynthesis" in window)) {
  voiceIntroButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const introText = button.dataset.voiceIntroText?.trim();

      if (!introText) {
        return;
      }

      speakText(introText, button);
    });
  });
}

if (chatbotForm && chatbotInput) {
  chatbotInput.addEventListener("input", resizeChatInput);
  chatbotInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      chatbotForm.requestSubmit();
    }
  });

  chatbotForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const value = chatbotInput.value.trim();

    if (!value) {
      return;
    }

    stopSpeakingState();

    addChatMessage(value, "user");
    resetChatInput();

    const cachedReply = getCachedChatbotReply(value);

    if (cachedReply) {
      window.setTimeout(() => {
        addChatMessage(cachedReply, "bot");
      }, 16);
      return;
    }

    if (shouldUseInstantReply(value)) {
      const instantReply = getChatbotReply(value);
      setCachedChatbotReply(value, instantReply);
      window.setTimeout(() => {
        addChatMessage(instantReply, "bot");
      }, 20);
      return;
    }

    const loadingMessage = addLoadingMessage();
    const provisionalReply = getChatbotReply(value);
    let provisionalMessage = null;
    let settledWithFastReply = false;
    const provisionalTimer = window.setTimeout(() => {
      if (!loadingMessage?.isConnected) {
        return;
      }

      settledWithFastReply = true;
      loadingMessage.remove();
      provisionalMessage = addChatMessage(provisionalReply, "bot");
    }, 650);

    try {
      let reply;

      if (useServerChat) {
        reply = await getServerChatbotReply(value);
      } else {
        throw new Error("Static mode");
      }

      window.clearTimeout(provisionalTimer);
      if (loadingMessage) {
        loadingMessage.remove();
      }
      setCachedChatbotReply(value, reply);
      if (settledWithFastReply && provisionalMessage) {
        updateChatMessage(provisionalMessage, reply, "bot");
      } else {
        addChatMessage(reply, "bot");
      }
    } catch (error) {
      window.clearTimeout(provisionalTimer);
      if (loadingMessage) {
        loadingMessage.remove();
      }

      if (settledWithFastReply) {
        setCachedChatbotReply(value, provisionalReply);
        return;
      }

      if (useServerChat) {
        const fallbackReply = getChatbotReply(value);
        setCachedChatbotReply(value, fallbackReply);
        console.error("Chatbot live model error:", error);
        if (error.message.includes("longer than")) {
          addChatMessage(fallbackReply, "bot");
        } else {
          addChatMessage(`${fallbackReply}\n\nNote: I answered from local mode because the live model was unavailable for a moment.`, "bot");
        }
      } else {
        const offlineReply = getChatbotReply(value);
        setCachedChatbotReply(value, offlineReply);
        window.setTimeout(() => {
          addChatMessage(offlineReply, "bot");
        }, 28);
      }
    }
  });
}

suggestionChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const prompt = chip.dataset.prompt;

    if (!prompt || !chatbotInput) {
      return;
    }

    openChatbot();
    chatbotInput.value = prompt;
    chatbotInput.focus();
    resizeChatInput();
  });
});

const portfolioPageSequence = [
  {
    path: "/index.html",
    label: "Home",
    description: "Start from the main landing page."
  },
  {
    path: "/about.html",
    label: "About",
    description: "Move into profile, strengths, and background."
  },
  {
    path: "/projects.html",
    label: "Projects",
    description: "Explore the main project showcase."
  },
  {
    path: "/heart-disease-demo.html",
    label: "Heart Demo",
    description: "Open the heart disease detection experience."
  },
  {
    path: "/study-mood-demo.html",
    label: "Study Mood Demo",
    description: "Review the webcam-assisted study copilot demo."
  },
  {
    path: "/diet-planner-demo.html",
    label: "Diet Planner Demo",
    description: "Continue into the nutrition planning demo."
  },
  {
    path: "/playlist-generator-demo.html",
    label: "Playlist Demo",
    description: "Try the music recommendation demo."
  },
  {
    path: "/contact.html",
    label: "Contact",
    description: "Jump to contact options and inquiry flow."
  },
  {
    path: "/resume.html",
    label: "Resume",
    description: "Finish on the visual resume page."
  }
];

function getCurrentPortfolioPagePath() {
  const pathname = decodeURIComponent(window.location.pathname).replace(/\\/g, "/");

  if (!pathname || pathname === "/") {
    return "/index.html";
  }

  const lastSegment = pathname.split("/").pop();
  if (!lastSegment || !lastSegment.includes(".")) {
    return `${pathname.replace(/\/$/, "")}/index.html`;
  }

  return pathname;
}

function renderPageDirectionLink(direction, page) {
  const kickerText = direction === "prev" ? "&larr; Back" : "Next &rarr;";

  if (!page) {
    return `
      <span class="page-direction-link is-disabled" aria-disabled="true">
        <span class="page-direction-kicker">${kickerText}</span>
        <strong>${direction === "prev" ? "No previous page" : "No next page"}</strong>
      </span>
    `;
  }

  return `
    <a class="page-direction-link" href="${page.path}">
      <span class="page-direction-kicker">${kickerText}</span>
      <strong>${escapeHtml(page.label)}</strong>
      <small>${escapeHtml(page.description)}</small>
    </a>
  `;
}

function initializePageNavigator() {
  if (document.getElementById("pageDirectionNav")) {
    return;
  }

  if (window.location.search.includes("print=1")) {
    return;
  }

  const nav = document.createElement("nav");
  nav.className = "page-direction-nav";
  nav.id = "pageDirectionNav";
  nav.setAttribute("aria-label", "Page navigation");
  nav.innerHTML = `
    <button class="page-direction-arrow" type="button" data-history-nav="back" aria-label="Go back" title="Back">
      <span aria-hidden="true">&larr;</span>
    </button>
    <button class="page-direction-arrow" type="button" data-history-nav="forward" aria-label="Go forward" title="Forward">
      <span aria-hidden="true">&rarr;</span>
    </button>
  `;
  document.body.appendChild(nav);

  nav.querySelectorAll("[data-history-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      restorePageVisibilityState();
      if (button.dataset.historyNav === "back") {
        window.history.back();
      } else {
        window.history.forward();
      }
    });
  });
}

function initializePrintMode() {
  if (!window.location.search.includes("print=1")) {
    return;
  }

  window.setTimeout(() => {
    try {
      window.print();
    } catch (error) {
      return;
    }
  }, 220);
}

function getDemoWalkthroughSteps(key) {
  const stepsByDemo = {
    heart: [
      {
        selector: ".demo-hero-copy",
        title: "Project demo overview",
        copy: "Start here to understand what this demo is showing and why the heart project is the flagship build."
      },
      {
        selector: ".heart-monitor-showcase",
        title: "Clinical monitor preview",
        copy: "This top-right visual frames the heart-disease project like a product, not only a machine learning form."
      },
      {
        selector: ".live-app-shell",
        title: "Embedded Flask app",
        copy: "This section connects to the actual Flask experience so reviewers can inspect the real heart-disease interface."
      },
      {
        selector: ".heart-demo-form",
        title: "Portfolio simulator",
        copy: "Use the quick simulator when you want a faster portfolio-side preview of the clinical risk workflow."
      },
      {
        selector: ".demo-report-card, .heart-simulator-grid .demo-report-card",
        title: "Result summary",
        copy: "The output area turns the submitted scenario into a cleaner summary with flags and reviewer-friendly reading."
      }
    ],
    study: [
      {
        selector: ".demo-hero-copy",
        title: "Focus-lab overview",
        copy: "This hero explains the productivity AI story before you start using the study state demo."
      },
      {
        selector: ".study-focus-showcase",
        title: "Signal radar",
        copy: "The showcase visual summarizes the idea: state signals, readiness, and coaching output."
      },
      {
        selector: ".study-lab-controls",
        title: "Input signals",
        copy: "This control area combines the study brief, sleep, posture, noise, and optional camera preview."
      },
      {
        selector: "#studyMoodCameraToggle",
        title: "Optional camera preview",
        copy: "You can start the local camera preview to add extra readiness cues without sending the feed anywhere."
      },
      {
        selector: ".study-live-layout .demo-report-card",
        title: "Coach report",
        copy: "The report area translates the study state into sprint advice, break timing, and recovery guidance."
      }
    ],
    diet: [
      {
        selector: ".demo-hero-copy",
        title: "Planner overview",
        copy: "This section frames the nutrition demo as a product-style planning experience rather than a static diet list."
      },
      {
        selector: ".diet-meal-showcase",
        title: "Meal board preview",
        copy: "The right-side showcase highlights the planning-board feel, macro split, and daily structure."
      },
      {
        selector: "#dietPlannerDemoForm",
        title: "Nutrition builder",
        copy: "Use the brief and structured controls here to set calories, prep time, diet style, and constraints."
      },
      {
        selector: ".diet-board-report",
        title: "Plan output",
        copy: "The report side turns the recommendation into meals, macros, substitutions, and execution guidance."
      }
    ],
    playlist: [
      {
        selector: ".demo-hero-copy",
        title: "Playlist overview",
        copy: "This hero explains the recommendation-system angle before you start building the mix."
      },
      {
        selector: ".playlist-stage-showcase",
        title: "Mix stage preview",
        copy: "The stage visual shows how the project turns audio features into a believable product-style curation experience."
      },
      {
        selector: "#playlistDemoForm",
        title: "Prompt controls",
        copy: "Use the playlist brief, mood, energy, platform, and lyric density to shape the mix route."
      },
      {
        selector: ".playlist-studio-layout .demo-report-card",
        title: "Playlist output",
        copy: "The report area turns the request into a route, track list, and export-ready mix summary."
      }
    ]
  };

  return (stepsByDemo[key] || []).filter((step) => document.querySelector(step.selector));
}

function clearDemoWalkthroughFocus() {
  document.querySelectorAll(".walkthrough-focus").forEach((element) => {
    element.classList.remove("walkthrough-focus");
  });
}

function closeDemoWalkthrough() {
  clearDemoWalkthroughFocus();

  if (!demoWalkthroughOverlay) {
    return;
  }

  demoWalkthroughOverlay.classList.remove("is-visible");
  document.body.classList.remove("has-walkthrough-open");
  window.setTimeout(() => {
    if (demoWalkthroughOverlay) {
      demoWalkthroughOverlay.hidden = true;
    }
  }, 180);
  demoWalkthroughState = null;
}

function renderDemoWalkthroughStep() {
  if (!demoWalkthroughOverlay || !demoWalkthroughState) {
    return;
  }

  const { steps, index } = demoWalkthroughState;
  const step = steps[index];
  if (!step) {
    closeDemoWalkthrough();
    return;
  }

  clearDemoWalkthroughFocus();
  const target = document.querySelector(step.selector);
  if (target) {
    target.classList.add("walkthrough-focus");
    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest"
    });
  }

  const title = demoWalkthroughOverlay.querySelector("[data-walkthrough-title]");
  const copy = demoWalkthroughOverlay.querySelector("[data-walkthrough-copy]");
  const progress = demoWalkthroughOverlay.querySelector("[data-walkthrough-progress]");
  const previousButton = demoWalkthroughOverlay.querySelector("[data-walkthrough-prev]");
  const nextButton = demoWalkthroughOverlay.querySelector("[data-walkthrough-next]");

  if (title) {
    title.textContent = step.title;
  }

  if (copy) {
    copy.textContent = step.copy;
  }

  if (progress) {
    progress.textContent = `Step ${index + 1} of ${steps.length}`;
  }

  if (previousButton) {
    previousButton.disabled = index === 0;
  }

  if (nextButton) {
    nextButton.textContent = index === steps.length - 1 ? "Finish" : "Next";
  }
}

function ensureDemoWalkthroughOverlay() {
  if (demoWalkthroughOverlay) {
    return;
  }

  demoWalkthroughOverlay = document.createElement("div");
  demoWalkthroughOverlay.className = "walkthrough-overlay";
  demoWalkthroughOverlay.hidden = true;
  demoWalkthroughOverlay.innerHTML = `
    <div class="walkthrough-card" role="dialog" aria-modal="true" aria-labelledby="walkthroughTitle">
      <p class="walkthrough-kicker">Demo walkthrough</p>
      <h2 class="walkthrough-title" id="walkthroughTitle" data-walkthrough-title></h2>
      <p class="walkthrough-copy" data-walkthrough-copy></p>
      <p class="walkthrough-progress" data-walkthrough-progress></p>
      <div class="walkthrough-actions">
        <button class="button button-ghost button-small" type="button" data-walkthrough-close>Close</button>
        <button class="button button-ghost button-small" type="button" data-walkthrough-prev>Previous</button>
        <button class="button button-small" type="button" data-walkthrough-next>Next</button>
      </div>
    </div>
  `;

  document.body.appendChild(demoWalkthroughOverlay);

  demoWalkthroughOverlay.addEventListener("click", (event) => {
    if (event.target === demoWalkthroughOverlay) {
      closeDemoWalkthrough();
    }
  });

  demoWalkthroughOverlay.querySelector("[data-walkthrough-close]")?.addEventListener("click", () => {
    closeDemoWalkthrough();
  });

  demoWalkthroughOverlay.querySelector("[data-walkthrough-prev]")?.addEventListener("click", () => {
    if (!demoWalkthroughState || demoWalkthroughState.index === 0) {
      return;
    }

    demoWalkthroughState.index -= 1;
    renderDemoWalkthroughStep();
  });

  demoWalkthroughOverlay.querySelector("[data-walkthrough-next]")?.addEventListener("click", () => {
    if (!demoWalkthroughState) {
      return;
    }

    if (demoWalkthroughState.index >= demoWalkthroughState.steps.length - 1) {
      closeDemoWalkthrough();
      return;
    }

    demoWalkthroughState.index += 1;
    renderDemoWalkthroughStep();
  });
}

function openDemoWalkthrough(key) {
  const steps = getDemoWalkthroughSteps(key);
  if (!steps.length) {
    return;
  }

  ensureDemoWalkthroughOverlay();

  demoWalkthroughState = {
    key,
    index: 0,
    steps
  };

  demoWalkthroughOverlay.hidden = false;
  document.body.classList.add("has-walkthrough-open");
  window.requestAnimationFrame(() => {
    demoWalkthroughOverlay.classList.add("is-visible");
    renderDemoWalkthroughStep();
  });
}

function initializeDemoWalkthroughs() {
  document.querySelectorAll("[data-demo-walkthrough]").forEach((button) => {
    button.addEventListener("click", () => {
      openDemoWalkthrough(button.dataset.demoWalkthrough || "");
    });
  });
}

rotateTitle();
setInterval(rotateTitle, 1800);
initializeProjectImageFallbacks();
enhanceExistingChatMessages();
updatePauseButtonState();
resizeChatInput();
latestBotReply = chatbotMessages?.querySelector(".chatbot-message")?.dataset.rawText || "";
initializeChatbotState();
initializePageNavigator();
initializeDemoWalkthroughs();
initializePrintMode();

