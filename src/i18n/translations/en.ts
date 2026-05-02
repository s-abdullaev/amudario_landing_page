export default {
  /* ── Common / Shared ─────────────────────────────────────── */
  nav: {
    products: 'Products',
    oxusWs: 'OxusWS',
    jayhunTrap: 'JayhunTrap',
    airsense: 'AirSense',
    gozanlink: 'GozanLink',
    team: 'Team',
    contact: 'Contact',
    allProducts: 'All Products',
  },
  footer: {
    tagline: 'Smart solutions for smart agriculture.',
    copy: '© {year} Amudario Research LLC. Smart solutions for smart agriculture.',
  },
  cta: {
    contactUs: 'Contact Us',
    viewAllProducts: 'View All Products',
    exploreProducts: 'Explore Products',
    getInTouch: 'Get in Touch',
    learnMore: 'Learn More',
  },
  sectionTags: {
    ourSolutions: 'Our Solutions',
    howItWorks: 'How It Works',
    ourTeam: 'Our Team',
    ourPartners: 'Our Partners',
    inThePress: 'In the Press',
    getStarted: 'Get Started',
    theChallenge: 'The Challenge',
    features: 'Features',
    gallery: 'Gallery',
    dashboard: 'Dashboard',
    hardware: 'Hardware',
    targetPests: 'Target Pests',
  },

  /* ── Home Page ───────────────────────────────────────────── */
  home: {
    meta: {
      title: 'Amudar.io — Smart Solutions for Smart Agriculture',
      description: 'Amudar.io provides smart agrometeorological stations, pheromone traps, air quality monitoring devices, and greenhouse management systems for precision agriculture in Uzbekistan.',
      keywords: 'weather station, agrometeostation, agrometeorological station, smart farming, AI in agriculture, integrated pest management, pest monitoring, insects, plant diseases, irrigation, greenhouse, climate monitoring, environment monitoring, air quality, greenhouse management, precision farming, quarantine pests, pesticides, sustainable agriculture, green economy, climate change, climate resilience, IoT agriculture, smart agriculture, Uzbekistan, Central Asia',
    },
    hero: {
      badge: 'Precision Agriculture Technology',
      title1: 'Smart Solutions',
      title2: 'for Smart',
      title3: 'Agriculture',
      subtitle: 'AI-powered agrometeorological stations, pest detection, air quality monitoring, and greenhouse management systems — transforming farming in Uzbekistan and beyond.',
      statStations: 'Stations Installed',
      statPestModels: 'Pest Models',
      statAgroIndicators: 'Agro Indicators',
      scrollToExplore: 'Scroll to explore',
    },
    solutions: {
      title: 'Intelligent tools for <span class="gradient-text">precision farming</span>',
      subtitle: 'Four interconnected smart systems that revolutionize agricultural monitoring, pest control, and environmental management.',
      oxusWs: {
        name: 'OxusWS',
        desc: 'Smart agrometeostation with 30+ sensor parameters for precision weather monitoring.',
      },
      jayhunTrap: {
        name: 'JayhunTrap',
        desc: 'AI-powered pheromone traps for automated pest detection and species counting.',
      },
      airsense: {
        name: 'AirSense',
        desc: 'Smart air quality monitoring with PM2.5/PM10 sensors and pollutant analysis.',
      },
      gozanlink: {
        name: 'GozanLink',
        desc: 'IoT greenhouse management tracking temperature, humidity, CO₂, and light.',
      },
    },
    oxusWsStory: {
      tag: '01 — Agrometeostation',
      title: 'Oxus<span class="gradient-text">WS</span>',
      facts: [
        '🌡️ Monitors air temp, humidity, precipitation, wind speed & direction',
        '🌱 Soil moisture, temperature & electrical conductivity sensors',
        '💧 Optimized watering schedule for cotton & wheat crops',
        '🦠 Predicts 10+ diseases & 20+ pest outbreak timings',
        '📊 Weekly agro-forecasts on dashboard',
      ],
    },
    jayhunStory: {
      tag: '02 — Pheromone Trap',
      title: 'Jayhun<span class="gradient-text">Trap</span>',
      facts: [
        '📸 Wide-angle cameras continuously upload images to cloud',
        '🤖 AI-powered automatic pest detection & species classification',
        '🧪 Species-specific pheromone bait for targeted trapping',
        '☀️ Fully autonomous — solar-powered with GSM communication',
        '📊 Monitor 20+ pest outbreak risks',
      ],
    },
    airsenseStory: {
      tag: '03 — Air Quality',
      title: 'Air<span class="gradient-text">Sense</span>',
      facts: [
        '💨 Measures NO₂, CO, NH₃, SO₂, H₂S & O₃ gases',
        '🔬 PM1.0, PM2.5 & PM10 particulate matter sensors',
        '🌡️ Tracks temperature, humidity, pressure & wind speed',
        '📡 GPS positioning with GSM/GPRS data transmission',
        '📊 Online dashboard for air quality',
      ],
    },
    gozanStory: {
      tag: '04 — Greenhouse',
      title: '<span style="color:#fff">Gozan</span><span class="gradient-text">Link</span>',
      facts: [
        '🌡️ Internal & external temperature and humidity tracking',
        '🌱 Soil moisture, temperature & electrical conductivity',
        '💨 Wind speed & direction monitoring outside',
        '⚡ Power outage detection & pump control sensor',
        '📱 Emergency alerts via phone call & SMS',
      ],
    },
    howItWorks: {
      title: 'From <span class="gradient-text">field</span> to <span class="gradient-text">forecast</span>',
      steps: [
        { title: 'Sensor Data Collection', desc: 'Weather parameters are measured by sensors and transmitted to the server via mobile networks.' },
        { title: 'Satellite Data Fusion', desc: 'Ground sensor data combines with satellite imagery for comprehensive environmental analysis.' },
        { title: 'AI Processing', desc: 'Machine learning models generate predictions for weather, disease, and pest outbreaks.' },
        { title: 'Farmer Dashboard', desc: 'Results displayed on an intuitive dashboard for real-time decision making.' },
      ],
    },
    team: {
      title: 'Meet our <span class="gradient-text">team</span>',
      subtitle: 'We are a small, dedicated team with complementary strengths, working side by side to disrupt farming with AI and IoT.',
      members: [
        {
          name: 'Shuhrat Kushbakov',
          role: 'Business Co-founder',
          credentials: ['16 years in procurement, project management and business development', '$11B in career deals, including a $20M flagship contract', 'Record full-cycle delivery from kickoff to completion: 5 days', 'MBA in Digital Transformation'],
        },
        {
          name: 'Sarvar Abdullayev',
          role: 'Technical Co-founder (Product)',
          credentials: ['20 years in software engineering and operations', 'Reprimanded by the headmaster for infecting school PCs with VBScript virus.', 'Won a hackathon for simulating the Ebola outbreak across world airports', 'PhD in Computer Science'],
        },
        {
          name: 'Jasurbek Khodjayev',
          role: 'Technical Co-founder (Hardware)',
          credentials: ['20 years designing and building systems', 'Developed indoor first responder tracking system as a part of large European project', 'Built a wall penetrating radar system for detecting humans', 'PhD in Information and Communication Engineering'],
        },
      ],
    },
    partners: {
      title: 'Trusted by <span class="gradient-text">leading organizations</span>',
      subtitle: 'We collaborate with top institutions and international bodies to deliver impact at scale.',
    },
    press: {
      title: 'Recognized <span class="gradient-text">globally</span>',
      articles: [
        { source: 'Spot.uz', text: 'Farms in Tashkent region began implementing IoT' },
        { source: 'UNDP', text: 'UNDP promotes modern eco-friendly pest management' },
        { source: 'Spot.uz', text: 'Precision agriculture transforming farming in Uzbekistan' },
        { source: 'Gazeta.uz', text: 'Pheromone traps help farmers fight pests' },
        { source: 'Inha.uz', text: 'Amudario wins first place in CGIAR Acceleration Program' },
        { source: 'Inha.uz', text: 'Professors present smart agrometeorological stations' },
      ],
    },
    contact: {
      title: 'Ready to transform <span class="gradient-text">your farm?</span>',
      subtitle: 'Contact us to learn how our smart solutions can boost your yields and protect your crops.',
      callUs: 'Call us',
      telegram: 'Telegram',
      email: 'Email',
    },
  },

  /* ── OxusWS Product Page ────────────────────────────────── */
  oxusWs: {
    meta: {
      title: 'OxusWS — Smart Agrometeostation | Amudar.io',
      description: 'OxusWS is a smart agrometeostation with 30+ sensor parameters for precision weather monitoring, solar-powered, with real-time data via 4G/LoRa.',
      keywords: 'weather station, agrometeostation, agrometeorological station, smart farming, precision farming, climate monitoring, climate resilience, IoT weather station, soil moisture sensor, irrigation management, plant disease prediction, crop monitoring, Uzbekistan',
    },
    hero: {
      tag: '01 — Agrometeostation',
      title: 'Oxus<span class="gradient-text">WS</span>',
      subtitle: 'Smart agrometeostation with 30+ sensor parameters for precision weather and crop monitoring — solar-powered, connected via 4G/LoRa.',
    },
    problems: {
      title: 'Why farmers need <span class="gradient-text">weather data</span>',
      subtitle: 'Without real-time meteorological data, farmers face devastating consequences from unpredictable weather.',
      cards: [
        { title: 'Unexpected Frost', desc: 'Lack of early frost warnings leads to catastrophic crop losses in cotton and wheat fields.' },
        { title: 'Flood & Overwatering', desc: 'Without rain data, farmers cannot optimize irrigation, leading to waterlogged soil and root damage.' },
        { title: 'Drought & Heat Stress', desc: 'Rising temperatures without monitoring causes heat stress, reducing yields significantly.' },
      ],
    },
    features: {
      title: 'Precision <span class="gradient-text">monitoring</span> capabilities',
      subtitle: 'OxusWS integrates multiple sensors to provide comprehensive agricultural and environmental data.',
      cards: [
        { title: 'Wind Monitoring', desc: 'Measure wind speed and direction for crop protection and spray planning.' },
        { title: 'Rainfall Measurement', desc: 'Track precipitation in real time to optimize irrigation schedules and water usage.' },
        { title: 'Soil Analysis', desc: 'Monitor soil moisture, temperature, and salinity to optimize crop health.' },
        { title: 'Dew Point & Humidity', desc: 'Track atmospheric humidity for disease prediction and frost risk assessment.' },
        { title: 'Data Analytics', desc: 'AI-powered insights turn raw sensor data into actionable farming recommendations.' },
        { title: 'Microclimate Forecasting', desc: 'Hyper-local weather predictions specific to your field, not the nearest city.' },
      ],
    },
    howItWorks: {
      title: 'From <span class="gradient-text">sensors</span> to <span class="gradient-text">decisions</span>',
      heading: 'Intelligent Data Pipeline',
      text: 'OxusWS collects data from 30+ sensors installed in the field — measuring temperature, humidity, wind, rainfall, soil moisture, UV radiation, and more. Data is transmitted in real time via 4G or LoRa networks to our cloud platform, where machine learning models process the information and generate actionable insights including disease risk predictions, frost alerts, and optimal irrigation schedules. Farmers access everything through an intuitive web dashboard and mobile app.',
    },
    gallery: {
      title: 'OxusWS <span class="gradient-text">in the field</span>',
    },
    dashboard: {
      title: 'Real-time <span class="gradient-text">monitoring platform</span>',
      heading: 'Intuitive Data Visualization',
      text: 'Access all your field data through a powerful web dashboard and mobile application designed for farmers.',
      features: [
        'Real-time sensor data with interactive charts and graphs',
        'Historical data analysis with custom date ranges',
        'Disease prediction models with risk level indicators',
        'Automated alerts for frost, rain, wind, and extreme conditions',
        'Multi-station management from a single dashboard',
        'Exportable reports for agronomic planning',
      ],
    },
    hardware: {
      title: 'Built to <span class="gradient-text">withstand</span> the elements',
      heading: 'Industrial-Grade Construction',
      text: 'OxusWS is built with weather-resistant materials rated for outdoor use across all seasons. The station is powered entirely by a solar panel with a rechargeable battery, eliminating the need for grid electricity. It features a modular design allowing sensors to be added or replaced depending on specific crop requirements. Communication modules support both 4G cellular and LoRa long-range wireless, ensuring connectivity even in remote agricultural areas. Each station undergoes rigorous quality testing before deployment.',
    },
    cta: {
      title: 'Ready to monitor <span class="gradient-text">your fields?</span>',
      text: 'Contact us to learn how OxusWS can transform your farming with precision weather data.',
    },
  },

  /* ── JayhunTrap Product Page ────────────────────────────── */
  jayhunTrap: {
    meta: {
      title: 'JayhunTrap — AI Pheromone Trap | Amudar.io',
      description: 'JayhunTrap is an AI-powered pheromone trap for automated pest detection, species classification, and counting with 95%+ accuracy.',
      keywords: 'AI pest detection, pheromone trap, integrated pest management, pest monitoring, insects, quarantine pests, pesticides reduction, sustainable agriculture, green economy, codling moth, fruit fly, precision farming, plant diseases',
    },
    hero: {
      tag: '02 — Pheromone Trap',
      title: 'Jayhun<span class="gradient-text">Trap</span>',
      subtitle: 'AI-powered smart pheromone trap for automated pest detection, species classification, and real-time counting with 95%+ accuracy.',
    },
    problems: {
      title: 'Why farmers need <span class="gradient-text">pest intelligence</span>',
      subtitle: 'Manual pest monitoring is slow, inaccurate, and leads to overuse of pesticides — damaging crops and the environment.',
      cards: [
        { title: 'Crop Damage', desc: 'Pest infestations discovered too late result in devastating crop losses — up to 40% in affected areas.' },
        { title: 'Population Explosions', desc: 'Without continuous monitoring, pest populations can surge undetected and overwhelm entire fields.' },
        { title: 'Export Quality Loss', desc: 'Pest damage reduces the quality of produce, making it impossible to meet international export standards.' },
      ],
    },
    pheromones: {
      title: 'Species-specific <span class="gradient-text">pheromone lures</span>',
      subtitle: 'Our interchangeable pheromone cartridges attract and capture specific pest species for accurate identification.',
      cards: [
        { title: 'Apple Codling Moth', desc: 'Targets Cydia pomonella, a major pest in apple and pear orchards.' },
        { title: 'Cherry Fruit Fly', desc: 'Detects Rhagoletis cerasi, a destructive pest in cherry production.' },
        { title: 'Potato Tuber Moth', desc: 'Monitors Phthorimaea operculella, a significant threat to potato crops.' },
        { title: 'Plum Fruit Moth', desc: 'Catches Grapholita funebrana, targeting plum and stone fruit orchards.' },
        { title: 'Comstock Mealybug', desc: 'Detects Pseudococcus comstocki, a quarantine pest in many countries.' },
        { title: 'Mulberry Silk Moth', desc: 'Monitors silk moth populations in mulberry cultivation areas.' },
      ],
    },
    features: {
      title: 'Smart <span class="gradient-text">pest detection</span> technology',
      subtitle: 'JayhunTrap combines AI vision, IoT connectivity, and precision pheromone science.',
      cards: [
        { title: 'AI-Powered Camera', desc: 'High-resolution camera with deep learning models for automatic pest identification.' },
        { title: 'Pheromone Cartridges', desc: 'Interchangeable species-specific lure cartridges for targeted pest monitoring.' },
        { title: 'Wireless Connectivity', desc: 'Real-time data transmission via 4G networks for instant pest alerts.' },
        { title: 'Long Battery Life', desc: 'Solar-powered with rechargeable battery for months of autonomous operation.' },
        { title: '95%+ Accuracy', desc: 'Machine learning ensures precise species classification with minimal false positives.' },
        { title: 'Weather-Proof Design', desc: 'IP65-rated enclosure designed for year-round outdoor deployment in any climate.' },
      ],
    },
    howItWorks: {
      title: 'From <span class="gradient-text">trap</span> to <span class="gradient-text">alert</span>',
      heading: 'Automated Pest Intelligence',
      text: 'JayhunTrap uses species-specific pheromone lures to attract target pests into the trap chamber. A built-in high-resolution camera captures images of trapped insects, which are processed by on-device AI models for species identification and counting. Results are transmitted via 4G to the cloud dashboard in real time. Farmers receive automated alerts when pest populations exceed economic thresholds, enabling timely and targeted pesticide application — reducing chemical usage by up to 60%.',
    },
    gallery: {
      title: 'JayhunTrap <span class="gradient-text">in action</span>',
    },
    dashboard: {
      title: 'Pest <span class="gradient-text">intelligence platform</span>',
      heading: 'Real-Time Pest Monitoring',
      text: 'The JayhunTrap dashboard provides complete visibility into pest activity across all your fields.',
      features: [
        'Live pest counts with species identification and confidence levels',
        'Population trend analysis and forecasting',
        'Photo gallery of captured specimens with AI classification',
        'Automated alerts when pest thresholds are exceeded',
        'Multi-trap management with interactive field maps',
        'Historical data for seasonal pest pattern analysis',
      ],
    },
    hardware: {
      title: 'Engineered for <span class="gradient-text">field conditions</span>',
      heading: 'Robust Field-Ready Design',
      text: 'JayhunTrap features an IP65-rated weatherproof enclosure with a UV-resistant outer shell. The internal camera module uses low-power night vision for 24/7 pest detection. Solar panel with battery backup ensures continuous autonomous operation. The modular pheromone cartridge system allows quick and easy lure replacement. Each unit is equipped with GPS for precise geo-location mapping and supports both 4G and LoRa connectivity for flexible network deployment.',
    },
    cta: {
      title: 'Protect your crops from <span class="gradient-text">pests</span>',
      text: 'Contact us to learn how JayhunTrap can automate your pest monitoring and reduce pesticide usage.',
    },
  },

  /* ── AirSense Product Page ──────────────────────────── */
  oxusAirsense: {
    meta: {
      title: 'AirSense — Air Quality Monitor | Amudar.io',
      description: 'AirSense is a smart air quality monitoring station with PM2.5, PM10, CO2, SO2, and VOC sensors for urban and agricultural environments.',
      keywords: 'air quality monitoring, environment monitoring, PM2.5, PM10, CO2 sensor, air pollution, climate monitoring, climate change, green economy, sustainable agriculture, smart farming, Uzbekistan',
    },
    hero: {
      tag: '03 — Air Quality',
      title: 'Air<span class="gradient-text">Sense</span>',
      subtitle: 'Smart air quality monitoring station with PM2.5, PM10, CO\u2082, SO\u2082, and VOC sensors — designed for urban, peri-urban, and agricultural zones.',
    },
    problems: {
      title: 'Why we need <span class="gradient-text">air quality data</span>',
      subtitle: 'Air pollution is an invisible threat to public health, agriculture, and the environment — monitoring is the first step to action.',
      cards: [
        { title: 'Urban Pollution', desc: 'Cities in Central Asia face hazardous air quality levels, especially during winter heating season.' },
        { title: 'Traffic Emissions', desc: 'Vehicle exhaust is a major source of PM2.5 and NOx, impacting millions in urban corridors.' },
        { title: 'Health Impacts', desc: 'Without monitoring, citizens have no data to protect themselves from hazardous air quality days.' },
      ],
    },
    features: {
      title: 'Comprehensive <span class="gradient-text">air analysis</span>',
      subtitle: 'AirSense measures a wide range of pollutants and environmental parameters for complete air quality assessment.',
      cards: [
        { title: 'PM2.5 & PM10', desc: 'Laser-based particulate matter sensors for accurate real-time fine dust measurement.' },
        { title: 'Gas Detection', desc: 'CO\u2082, SO\u2082, NO\u2082, and VOC sensors for comprehensive atmospheric gas analysis.' },
        { title: 'Environmental Parameters', desc: 'Temperature, humidity, and pressure sensors for complete meteorological context.' },
        { title: 'Real-Time AQI', desc: 'Automatic Air Quality Index calculation following international standards (EPA, WHO).' },
        { title: 'Cloud Platform', desc: 'Real-time data synced to the cloud with historical analysis and trend visualization.' },
        { title: 'Smart Alerts', desc: 'Automated notifications when pollutant levels exceed safe thresholds for public safety.' },
      ],
    },
    howItWorks: {
      title: 'From <span class="gradient-text">air</span> to <span class="gradient-text">insight</span>',
      heading: 'Continuous Air Monitoring',
      text: 'AirSense continuously samples ambient air through precision intake ports, analyzing it with an array of electrochemical and laser-based sensors. Particulate matter (PM2.5, PM10) is measured using light-scattering technology, while gas sensors detect CO\u2082, SO\u2082, VOC, and other pollutants. Data is processed on-device and transmitted via 4G to our cloud platform where it is combined with weather data and satellite imagery for comprehensive air quality analysis. Results are displayed on public dashboards and mobile apps, with automated alerts for hazardous conditions.',
    },
    gallery: {
      title: 'AirSense <span class="gradient-text">deployments</span>',
    },
    dashboard: {
      title: 'Air quality <span class="gradient-text">intelligence</span>',
      heading: 'Comprehensive AQI Platform',
      text: 'The AirSense dashboard delivers actionable air quality intelligence to cities, communities, and agricultural operations.',
      features: [
        'Real-time AQI display with color-coded health risk levels',
        'Individual pollutant breakdown — PM2.5, PM10, CO\u2082, SO\u2082, VOC',
        'Historical trend analysis with hourly, daily, and monthly views',
        'Interactive maps showing air quality across monitoring network',
        'Public-facing displays for community awareness',
        'Automated health advisory notifications',
      ],
    },
    hardware: {
      title: 'Professional-grade <span class="gradient-text">monitoring station</span>',
      heading: 'Precision Air Quality Station',
      text: 'AirSense is housed in a compact, weather-resistant enclosure designed for permanent outdoor installation. The station integrates multiple sensor types — laser particle counters for PM2.5/PM10, NDIR sensors for CO\u2082, electrochemical cells for SO\u2082 and NO\u2082, and photoionization detectors for VOCs. A built-in heating element prevents condensation in cold weather. The system communicates via 4G/Wi-Fi and runs on solar or mains power. Automated self-diagnostics ensure consistent measurement accuracy over time.',
    },
    cta: {
      title: 'Monitor the air <span class="gradient-text">you breathe</span>',
      text: 'Contact us to deploy AirSense in your city, campus, or agricultural region.',
    },
  },

  /* ── GozanLink Product Page ──────────────────────────────── */
  gozanlink: {
    meta: {
      title: 'GozanLink — Smart Greenhouse Management | Amudar.io',
      description: 'GozanLink is an IoT greenhouse management system tracking temperature, humidity, CO2, light, and soil — with automated ventilation and irrigation control.',
      keywords: 'greenhouse management, smart greenhouse, greenhouse automation, irrigation, climate monitoring, greenhouse climate control, precision farming, sustainable agriculture, IoT greenhouse, climate resilience, climate change',
    },
    hero: {
      tag: '04 — Greenhouse',
      title: '<span style="color:#fff">Gozan</span><span class="gradient-text">Link</span>',
      subtitle: 'IoT greenhouse management system for precise climate control — monitoring temperature, humidity, CO\u2082, light, and soil with automated ventilation and irrigation.',
    },
    problems: {
      title: 'Greenhouses without <span class="gradient-text">smart control</span>',
      subtitle: 'Manual greenhouse management leads to inconsistent climate conditions, wasted resources, and suboptimal crop yields.',
      cards: [
        { title: 'Temperature Extremes', desc: 'Without monitoring, greenhouses can overheat or freeze — causing immediate plant damage and crop loss.' },
        { title: 'Irrigation Waste', desc: 'Manual watering without soil moisture data leads to over or under-watering, reducing yields and wasting resources.' },
        { title: 'Disease & Rot', desc: 'High humidity and poor ventilation create breeding grounds for fungal diseases and fruit rot.' },
      ],
    },
    features: {
      title: 'Complete greenhouse <span class="gradient-text">control</span>',
      subtitle: 'GozanLink provides full environmental monitoring and automated control for optimal greenhouse climate.',
      cards: [
        { title: 'Temperature Control', desc: 'Precise monitoring of air and soil temperature with automated heating and cooling response.' },
        { title: 'Humidity Management', desc: 'Real-time humidity tracking with automated ventilation to prevent mold and disease.' },
        { title: 'CO\u2082 Enrichment', desc: 'Monitor CO\u2082 levels to optimize photosynthesis and accelerate plant growth.' },
        { title: 'Soil Moisture', desc: 'Continuous soil moisture tracking with automated drip irrigation control.' },
        { title: 'Automated Irrigation', desc: 'Smart water management with pump control based on soil moisture and crop needs.' },
        { title: 'Remote Control', desc: 'Manage your greenhouse from anywhere via the mobile app — fans, vents, pumps, and lights.' },
      ],
    },
    howItWorks: {
      title: 'Smart <span class="gradient-text">greenhouse</span> automation',
      heading: 'Intelligent Climate Management',
      text: 'GozanLink installs a network of wireless sensors throughout your greenhouse — measuring temperature, humidity, CO\u2082, light intensity, and soil moisture at multiple points. The central controller collects data from all sensors and automatically adjusts ventilation fans, heating systems, irrigation pumps, and shade screens to maintain optimal growing conditions. All data is synced to the cloud in real time, accessible via web dashboard and mobile app. Farmers can set custom climate profiles for different crops and growth stages, with the system automatically adapting throughout the day and night.',
    },
    gallery: {
      title: 'GozanLink <span class="gradient-text">installations</span>',
    },
    dashboard: {
      title: 'Greenhouse <span class="gradient-text">control center</span>',
      heading: 'Complete Greenhouse Command',
      text: 'The GozanLink dashboard gives you full visibility and control over every aspect of your greenhouse environment.',
      features: [
        'Real-time sensor readings displayed with intuitive gauges and graphs',
        'Automated climate profiles with custom schedules for each crop type',
        'Remote actuator control — fans, vents, pumps, heaters, and lights',
        'Alert system for temperature spikes, humidity drops, and equipment failures',
        'Historical data analysis for optimizing growing conditions',
        'Multi-greenhouse management from a single interface',
      ],
    },
    hardware: {
      title: 'Built for <span class="gradient-text">greenhouse</span> conditions',
      heading: 'Modular Sensor Network',
      text: 'GozanLink uses a modular architecture with wireless sensor nodes distributed throughout the greenhouse. Each node can measure temperature, humidity, soil moisture, light, and CO\u2082. The central gateway communicates via Wi-Fi or 4G with the cloud platform. Relay modules control ventilation fans, heating elements, irrigation pumps, and shade screens. The system is designed for easy installation without specialized tools — most setups complete in under a day. All components are rated for the high-humidity, high-temperature greenhouse environment.',
    },
    cta: {
      title: 'Optimize your <span class="gradient-text">greenhouse</span>',
      text: 'Contact us to learn how GozanLink can automate your greenhouse management and boost yields.',
    },
  },
} as const;
