# 🚀 Quick Firebase Google Auth Setup

## Step 1: Firebase Console - Google Sign-In Enable करें

1. **Firebase Console खोलें:**
   - https://console.firebase.google.com/
   - "onlineexam-41f3f" project select करें

2. **Authentication Enable करें:**
   - Left sidebar में **"Authentication"** click करें
   - **"Sign-in method"** tab पर click करें
   - **"Google"** provider पर click करें
   - **"Enable"** toggle को ON करें
   - **Support email** select करें (dropdown से आपका email)
   - **"Save"** button पर click करें

3. **Authorized Domains Check करें:**
   - Same page में नीचे scroll करें
   - **"Authorized domains"** section में check करें
   - `localhost` already होना चाहिए
   - अगर नहीं है तो **"Add domain"** पर click करें और `localhost` add करें

## Step 2: Test करें

1. **Local server start करें:**
   ```bash
   python -m http.server 8000
   ```

2. **Test page खोलें:**
   - Browser में जाएं: `http://localhost:8000/test-auth.html`
   - **"Test Google Login"** button पर click करें

## Expected Results:

✅ **अगर successful है:**
- Google account selection popup खुलेगा
- Real Google account से login हो जाएगा
- User info display होगी

❌ **अगर error आए:**
- Console में error check करें (F12 press करें)
- Screenshots भेजें error की

## Step 3: Main App Test करें

अगर test successful है तो:
1. `http://localhost:8000/index.html` पर जाएं
2. **"Student Login"** button test करें

---

## 📝 Notes:

- OAuth consent screen बाद में भी configure कर सकते हैं
- पहले basic Google Sign-In test करते हैं
- Production के लिए बाद में full setup करेंगे

## 🆘 अगर Problem हो:

1. Browser console errors screenshot भेजें
2. Firebase Console screenshots भेजें  
3. Test page का behavior बताएं 