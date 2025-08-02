# 🎓 Dct24 - Online Exam Platform

## ✨ Features

### 🔐 **Authentication System**
- **Real Google Authentication** (Original users, not demo)
- Student login with Google accounts
- Admin panel with secure access
- Session management

### 📝 **Exam System**
- **Multiple Course Types**: RS-CIT, CCC, Subject-wise, Mock Tests, Free Tests
- **Timed Exams**: Fixed duration for each course type
- **Login Check**: Automatic login prompt if user not authenticated
- **Real-time Timer**: Countdown timer with auto-submit
- **Question Navigation**: Previous/Next with answer saving
- **Auto-submit**: When time expires
- **Instant Results**: Detailed score analysis

### 👨‍💼 **Admin Panel**
- Add/Edit/Delete questions
- Course-wise question management
- Question validation
- Real-time question count

### 📊 **Results System**
- Percentage score calculation
- Pass/Fail status based on course requirements
- Detailed question-wise analysis
- Time taken tracking
- Result history (localStorage)

## 🚀 **Course Configurations**

| Course | Duration | Questions | Passing % |
|--------|----------|-----------|-----------|
| RS-CIT Online | 90 min | 50 | 60% |
| RS-CIT Subject-wise | 30 min | 20 | 60% |
| RS-CIT Mock Test | 90 min | 50 | 60% |
| CCC Online | 90 min | 50 | 60% |
| CCC Subject-wise | 45 min | 25 | 60% |
| CCC Practical | 60 min | 30 | 60% |
| Free Mock Test | 30 min | 15 | 50% |
| Premium Course | 120 min | 75 | 70% |

## 🔧 **Setup Instructions**

### **Prerequisites**
- Python 3.x (for local server)
- Modern web browser
- Internet connection (for Firebase)

### **Step 1: Firebase Setup**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select "onlineexam-41f3f" project
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Google** provider
5. Select support email
6. Save configuration

### **Step 2: Run Application**
```bash
# Clone/Download the project
cd onlineexam

# Start local server
python -m http.server 8000

# Open in browser
http://localhost:8000
```

### **Step 3: Admin Access**
- URL: `http://localhost:8000/admin.html`
- Email: `digitalcomputer1808@gmail.com`
- Password: `Digital@2025`

## 🎯 **How It Works**

### **For Students:**
1. Click **"Start Exam"** on any course card
2. If not logged in → Google login prompt appears
3. If logged in → Exam instructions displayed
4. Confirm to start → Exam interface loads
5. Answer questions with navigation
6. Submit or auto-submit on time expiry
7. View detailed results

### **For Admins:**
1. Access admin panel with credentials
2. Add questions with course type selection
3. Edit/Delete existing questions
4. View question statistics

## 🔐 **Security Features**

- **Exam Environment**:
  - Prevents browser back/forward during exam
  - Disables right-click context menu
  - Auto-submit on time expiry
  - Session validation

- **Admin Protection**:
  - Secure login credentials
  - Admin-only question management
  - Session timeout handling

## 💾 **Data Storage**

- **Firebase Mode**: Real-time database for production
- **Demo Mode**: localStorage fallback for development
- **Question Storage**: Course-wise organization
- **Results Storage**: Local browser storage

## 📱 **Responsive Design**

- Mobile-friendly interface
- Tablet optimization
- Desktop experience
- Touch-friendly exam controls

## 🛠 **Technical Stack**

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Authentication**: Firebase Auth
- **Database**: Firebase Realtime Database
- **UI**: SweetAlert2 for modals
- **Icons**: Font Awesome
- **Styling**: Custom CSS Grid & Flexbox

## 🎨 **UI Features**

- **Modern Design**: Gradient backgrounds, smooth animations
- **Interactive Cards**: Hover effects, button animations
- **Exam Interface**: Clean, distraction-free design
- **Results Display**: Visual score representation
- **Loading States**: Spinner animations

## 📈 **Analytics & Tracking**

- Question-wise performance analysis
- Time taken per exam
- Pass/fail rate tracking
- Course popularity metrics

## 🔄 **Future Enhancements**

- PDF result export
- Email result sharing
- Advanced question categories
- Video question support
- Multi-language support
- Detailed analytics dashboard

## 🆘 **Troubleshooting**

### **Login Issues:**
- Ensure Firebase Google auth is enabled
- Check browser popup blockers
- Verify authorized domains in Firebase

### **Exam Issues:**
- Refresh page if questions don't load
- Ensure stable internet connection
- Check browser console for errors

### **Admin Issues:**
- Verify admin credentials
- Clear browser cache if needed
- Check Firebase authentication status

## 📞 **Support**

For technical support or questions:
- Email: digitalcomputer1808@gmail.com
- Check browser console for error logs
- Verify Firebase configuration

---

**© 2024 Guruji24 - Online Learning Platform** 