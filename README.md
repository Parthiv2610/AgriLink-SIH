# AgriLink (Prototype 2) - Government of India Mandi Price Portal

**Team APEX {SYNTAX} @ MGIT.ac.in**

AgriLink Prototype 2 is a dedicated, fully multilingual agricultural price intelligence portal connecting farmers across India to wholesale mandi prices sourced from Government of India APIs (**Agmarknet / Ministry of Agriculture & Farmers Welfare / data.gov.in**).

---

## 🌟 Key Capabilities

### 1. Complete 6-Language Localization
Switch effortlessly between 6 languages. Every component—headers, crop names, state names, table data, calculators, and speech announcements—switches dynamically to the chosen language:
- **🇬🇧 English**
- **🇮🇳 తెలుగు (Telugu)**
- **🇮🇳 தமிழ் (Tamil)**
- **🇮🇳 मराठी (Marathi)**
- **🇮🇳 ਪੰਜਾਬੀ (Punjabi)**
- **🇮🇳 हिंदी (Hindi)**

### 2. Focus Crops & Major Indian Mandis
Real-time tracking of high-impact cash and staple crops:
- 🌶️ **Chilli (మిర్చి / मिरची / ਮਿਰਚ / मिर्च)**: Guntur (Asia's Largest Chilli Yard), Khammam, Warangal, Byadgi, Nagpur.
- 🌾 **Paddy (వరి / धान / ਝੋਨਾ / धान)**: Nizamabad, Suryapet, Rajahmundry, Amritsar (Basmati 1121), Khanna, Karnal.
- ☁️ **Cotton (పత్తి / कापूस / ਨਰਮਾ / कपास)**: Adilabad, Warangal, Yavatmal, Rajkot, Bathinda, Adoni.
- 🍅 **Tomato (టమోటా / टोमॅटो / ਟਮਾਟਰ / टमाटर)**: Madanapalle (Asia's Largest Tomato Yard), Kolar, Nashik, Bowenpally, Pune.
- 🌾 **Wheat (గోధుమలు / गहू / ਕਣਕ / गेहूं)**: Khanna (Asia's Largest Grain Market), Moga, Indore (Sharbati), Ujjain, Hardoi, Kota.
- *Plus Onion (Lasalgaon), Potato (Agra, Jalandhar), Maize, Soybean, and Mustard.*

### 3. Government of India API Integration
- **Direct REST Integration**: Connects to the official data.gov.in Agmarknet endpoint (`Current Daily Price of Various Commodities from various Markets`).
- **Resilient Pre-bundled Agmarknet Database**: Comes bundled with authentic market records for zero downtime and instant presentation at hackathons.
- **Govt API Sync Dialog**: Add your custom `data.gov.in` API key and trigger live synchronizations on demand.

### 4. Interactive Farmer Tools
- **Mandi Modal Price Visualizer**: HTML5 Canvas bar chart comparing prices across reporting mandis.
- **Farmer Earnings & Price Calculator**: Calculate gross farmgate earnings for custom harvests (in Quintals, Kilograms, or 50kg Bags).
- **Audio Voice Readout**: Uses the browser's Web Speech API to read out market rates in the selected regional language.
- **CSV Data Export**: One-click download of filtered market rates.

---

## 🚀 How to Run

### Quick Start
```bash
cd "Prototype 2"
./run.sh 8085
```
Or directly using Python (standard library, zero pip dependencies required):
```bash
python3 server.py 8085
```

Navigate in your web browser to:
```
http://localhost:8085
```

---

## 🧪 Verification & Testing

To run the automated verification test suite:
```bash
python3 test_server.py
```

All 39+ mandi records, 5 translation dictionaries, and project assets will be validated.

---

## 👥 Credits
- **Project**: AgriLink (Prototype 2)
- **Team**: APEX {SYNTAX}
- **Institution**: Mahatma Gandhi Institute of Technology (MGIT.ac.in)
