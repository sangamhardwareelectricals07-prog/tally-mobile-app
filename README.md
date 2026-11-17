# TallyMobile - Expo Android APK Build Guide (हिंदी व English)

यह फोल्डर TallyMobile के लिए रेडी-टू-यूज़ (Ready-to-use) **Expo React Native APK** प्रोजेक्ट है।
इससे आप अपने Android मोबाइल में बिना Google Play Store के सीधा **.APK** इनस्टॉल कर सकते हैं।

---

## 🚀 तरीका 1: सिर्फ 3 कमांड में डायरेक्ट .APK फाइल बनाएं (EAS Cloud Build)

आपको अपने कंप्यूटर पर Android Studio की कोई आवश्यकता नहीं है! Expo का फ्री क्लाउड सर्वर आपके लिए डायरेक्ट `.apk` फाइल तैयार कर देगा:

### स्टेप 1: फोल्डर में जाएं और डिपेंडेंसी इनस्टॉल करें
```bash
cd expo-app
npm install
```

### स्टेप 2: Expo में लॉगिन करें (फ्री अकाउंट)
```bash
npx eas-cli login
```
*(यदि अकाउंट नहीं है, तो [expo.dev](https://expo.dev) पर 1 मिनट में फ्री अकाउंट बना लें)*

### स्टेप 3: APK बिल्ड कमांड चलाएं
```bash
npx eas-cli build -p android --profile preview
```

### परिणाम (Result):
* Expo Cloud 2-3 मिनट में आपकी **`TallyMobile.apk`** फाइल बना देगा।
* टर्मिनल में और आपके ईमेल पर सीधा **APK डाउनलोड लिंक (QR Code)** मिल जाएगा।
* अपने मोबाइल में डाउनलोड लिंक खोलें और **"Install"** पर क्लिक करें!

---

## 📱 तरीका 2: Expo Go ऐप में बिना APK बनाए तुरंत टेस्ट करें (Instant Test)

1. अपने Android मोबाइल के Google Play Store से **"Expo Go"** ऐप डाउनलोड करें।
2. अपने कंप्यूटर टर्मिनल में लिखें:
   ```bash
   cd expo-app
   npm install
   npx expo start
   ```
3. स्क्रीन पर आने वाले **QR Code** को अपने मोबाइल के Expo Go ऐप से स्कैन करें।
4. ऐप आपके फोन में तुरंत खुल जाएगा!

---

## ⚡ तरीका 3: बिना किसी कोडिंग/टर्मिनल के तुरंत अपने फोन पर इनस्टॉल करें (PWA APK)

यदि आपके पास अभी लैपटॉप या टर्मिनल नहीं है:
1. अपने Android फोन के **Google Chrome** में लाइव ऐप खोलें:
   `https://ais-dev-twnzusadlch2hmqriwhiur-383964826128.asia-east1.run.app`
   *(नोट: यदि आपने AI Studio में 'Deploy' या 'Share' किया है तो Shared URL `https://ais-pre-twnzusadlch2hmqriwhiur-383964826128.asia-east1.run.app` भी उपयोग कर सकते हैं)*
2. ऊपर दाएँ कोने में 3 डॉट्स **(⋮)** पर क्लिक करें।
3. **"Install App"** या **"होम स्क्रीन में जोड़ें (Add to Home Screen)"** चुनें।
4. आपके मोबाइल की होम स्क्रीन पर TallyMobile का असली ऐप आइकॉन बन जाएगा और यह पूरे स्क्रीन में बिना ब्राउज़र बार के एक नेटिव ऐप की तरह चलेगा!
