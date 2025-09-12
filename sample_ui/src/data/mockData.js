// Mock data for the Agrotech application

// Language data
export const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
];

// Field sensor data
export const fieldsData = [
  {
    id: 1,
    name: "Field 1",
    nameHi: "खेत 1",
    location: "North Field",
    locationHi: "उत्तरी खेत",
    moisture: 70,
    ph: 6.8,
    nitrogen: 85,
    phosphorus: 65,
    potassium: 75,
    temperature: 25,
    humidity: 60,
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    status: "good",
    image: "/api/placeholder/300/200",
  },
  {
    id: 2,
    name: "Field 2",
    nameHi: "खेत 2",
    location: "South Field",
    locationHi: "दक्षिणी खेत",
    moisture: 85,
    ph: 7.2,
    nitrogen: 75,
    phosphorus: 80,
    potassium: 70,
    temperature: 30,
    humidity: 55,
    lastUpdated: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    status: "excellent",
    image: "/api/placeholder/300/200",
  },
  {
    id: 3,
    name: "Field 3",
    nameHi: "खेत 3",
    location: "East Field",
    locationHi: "पूर्वी खेत",
    moisture: 45,
    ph: 6.2,
    nitrogen: 55,
    phosphorus: 45,
    potassium: 60,
    temperature: 28,
    humidity: 45,
    lastUpdated: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    status: "warning",
    image: "/api/placeholder/300/200",
  },
];

// Historical data for charts
export const generateHistoricalData = (fieldId, days = 7) => {
  const data = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const baseField = fieldsData.find((f) => f.id === fieldId);

    data.push({
      date: date.toISOString().split("T")[0],
      moisture: baseField.moisture + Math.random() * 20 - 10,
      ph: baseField.ph + Math.random() * 1 - 0.5,
      temperature: baseField.temperature + Math.random() * 10 - 5,
      time:
        date.getHours() +
        ":" +
        (date.getMinutes() < 10 ? "0" : "") +
        date.getMinutes(),
    });
  }

  return data;
};

// Disease detection results
export const diseaseDetectionResults = [
  {
    id: 1,
    disease: "Leaf Blight",
    diseaseHi: "पत्ती झुलसा",
    confidence: 92,
    severity: "moderate",
    description: "A fungal disease affecting leaf health",
    descriptionHi: "पत्ती स्वास्थ्य को प्रभावित करने वाली एक फंगल बीमारी",
    recommendations: [
      "Apply fungicide spray immediately",
      "Remove affected leaves",
      "Improve field drainage",
      "Monitor weekly for progression",
    ],
    recommendationsHi: [
      "तुरंत फंगिसाइड स्प्रे करें",
      "प्रभावित पत्तियों को हटा दें",
      "खेत की जल निकासी में सुधार करें",
      "प्रगति के लिए साप्ताहिक निगरानी करें",
    ],
  },
  {
    id: 2,
    disease: "Healthy Plant",
    diseaseHi: "स्वस्थ पौधा",
    confidence: 98,
    severity: "none",
    description: "Plant appears healthy with no visible diseases",
    descriptionHi: "पौधा स्वस्थ दिखता है, कोई दिखाई देने वाली बीमारी नहीं",
    recommendations: [
      "Continue current care routine",
      "Regular monitoring recommended",
      "Maintain proper watering schedule",
    ],
    recommendationsHi: [
      "वर्तमान देखभाल दिनचर्या जारी रखें",
      "नियमित निगरानी की सिफारिश",
      "उचित पानी देने का कार्यक्रम बनाए रखें",
    ],
  },
];

// Chat conversation data
export const chatHistory = [
  {
    id: 1,
    type: "user",
    message: "My crops are showing yellow leaves. What should I do?",
    messageHi: "मेरी फसलों में पीले पत्ते दिख रहे हैं। मुझे क्या करना चाहिए?",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: 2,
    type: "bot",
    message:
      "Yellow leaves can indicate nitrogen deficiency or overwatering. Based on your field data, I recommend applying nitrogen-rich fertilizer and checking drainage.",
    messageHi:
      "पीले पत्ते नाइट्रोजन की कमी या अधिक पानी का संकेत हो सकते हैं। आपके खेत के डेटा के आधार पर, मैं नाइट्रोजन से भरपूर उर्वरक लगाने और जल निकासी की जांच करने की सलाह देता हूं।",
    timestamp: new Date(Date.now() - 59 * 60 * 1000),
  },
];

// Quick action buttons for chat
export const quickActions = [
  {
    id: 1,
    text: "Fertilizer Advice",
    textHi: "उर्वरक सलाह",
    icon: "Leaf",
    category: "fertilizer",
  },
  {
    id: 2,
    text: "Disease Detection",
    textHi: "रोग पहचान",
    icon: "Bug",
    category: "disease",
  },
  {
    id: 3,
    text: "Watering Schedule",
    textHi: "पानी देने का कार्यक्रम",
    icon: "Droplets",
    category: "watering",
  },
  {
    id: 4,
    text: "Pest Control",
    textHi: "कीट नियंत्रण",
    icon: "Shield",
    category: "pest",
  },
  {
    id: 5,
    text: "Crop Health",
    textHi: "फसल स्वास्थ्य",
    icon: "Heart",
    category: "health",
  },
  {
    id: 6,
    text: "Weather Advisory",
    textHi: "मौसम सलाह",
    icon: "Cloud",
    category: "weather",
  },
];

// Connected devices data
export const connectedDevices = [
  {
    id: 1,
    name: "Soil Sensor A1",
    nameHi: "मिट्टी सेंसर A1",
    type: "soil_sensor",
    location: "Field 1 - North",
    locationHi: "खेत 1 - उत्तर",
    status: "online",
    battery: 85,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    sensors: ["moisture", "ph", "temperature"],
  },
  {
    id: 2,
    name: "Soil Sensor B2",
    nameHi: "मिट्टी सेंसर B2",
    type: "soil_sensor",
    location: "Field 2 - South",
    locationHi: "खेत 2 - दक्षिण",
    status: "online",
    battery: 92,
    lastSeen: new Date(Date.now() - 2 * 60 * 1000),
    sensors: ["moisture", "ph", "temperature", "nutrients"],
  },
  {
    id: 3,
    name: "Weather Station",
    nameHi: "मौसम स्टेशन",
    type: "weather_station",
    location: "Central Location",
    locationHi: "केंद्रीय स्थान",
    status: "offline",
    battery: 15,
    lastSeen: new Date(Date.now() - 120 * 60 * 1000),
    sensors: ["temperature", "humidity", "rainfall", "wind_speed"],
  },
];

// Settings options
export const settingsOptions = [
  {
    id: "language",
    title: "Language",
    titleHi: "भाषा",
    type: "select",
    options: languages,
    defaultValue: "en",
  },
  {
    id: "notifications",
    title: "Push Notifications",
    titleHi: "पुश नोटिफिकेशन",
    type: "toggle",
    defaultValue: true,
  },
  {
    id: "voice_prompts",
    title: "Voice Prompts",
    titleHi: "आवाज़ के संकेत",
    type: "toggle",
    defaultValue: true,
  },
  {
    id: "offline_cache",
    title: "Offline Data Cache",
    titleHi: "ऑफ़लाइन डेटा कैश",
    type: "info",
    value: "2.3 MB",
  },
  {
    id: "sync_frequency",
    title: "Data Sync Frequency",
    titleHi: "डेटा सिंक आवृत्ति",
    type: "select",
    options: [
      { value: "5", label: "5 minutes" },
      { value: "15", label: "15 minutes" },
      { value: "30", label: "30 minutes" },
      { value: "60", label: "1 hour" },
    ],
    defaultValue: "15",
  },
];
