// Import Firebase modules (using the same version)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getDatabase, set, get, ref } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA4OJ3sqwF3hGx5qQ2kxWaKRIDQJEJf6zU",
    authDomain: "webnoti-e810f.firebaseapp.com",
    projectId: "webnoti-e810f",
    storageBucket: "webnoti-e810f.firebasestorage.app",
    messagingSenderId: "646556692348",
    appId: "1:646556692348:web:a0d197a82e64367fca3ef9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

console.log("Firebase Initialized Successfully");

// Function to write user data to Firebase Realtime Database
function writeUserData(inputnumber,inputdate, inputtitle, inputcomment) {
  set(ref(db, 'information/' + inputnumber), { // Fixed "inforamation" to "information"
    inputdate: inputdate,
    inputtitle: inputtitle,
    inputcomment: inputcomment,
  })
    .then(() => {
        const errormsgadmin=document.getElementById("errormsgadmin");
        errormsgadmin.style.display="none";
        const successmsgadmin=document.getElementById("successmsgadmin");
        successmsgadmin.style.display="block";
       
        setTimeout(successsupdateload, 1500);
        function successsupdateload() {
            window.location.reload();
        }
    })
    .catch((error) => {
        const successmsgadmin=document.getElementById("successmsgadmin");
        successmsgadmin.style.display="none";
        const errormsgadmin=document.getElementById("errormsgadmin");
        errormsgadmin.style.display="block";
    });
}

// Function to read data from Firebase Realtime Database
function readData() {
  const userRef = ref(db, 'information'); // Fixed "inforamation" to "information"

  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const datacome=childSnapshot.val();
        //   console.log(datacome);

// console.log(datacome.inputdate);
          const Notificationsdata=document.getElementById("Notificationsdata");
          const creatediv=document.createElement("div");
          const createspan=document.createElement("span");
          const createbr=document.createElement("br");
          const createb=document.createElement("b");
          const createp=document.createElement("p");
          const createhr=document.createElement("hr");

         const fi= Notificationsdata.append(creatediv);
         const se= creatediv.append(createspan);
         const th= creatediv.append(createbr);
         const fo= creatediv.append(createb);
         const fiv= creatediv.append(createp);
         const six= creatediv.append(createhr);

         createspan.innerText=datacome.inputdate;
         createb.innerText=datacome.inputtitle;
         createp.innerText=datacome.inputcomment;
         


        //  const se=fi.append(createspan);
          
        });
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => console.error("Read failed: ", error));
}

const adminbtnSubmit=document.getElementById("adminbtnSubmit");

adminbtnSubmit.addEventListener("click",()=>{
const inputnumber=document.getElementById("inputnumber").value;
const inputdate=document.getElementById("inputdate").value;
const inputtitle=document.getElementById("inputtitle").value;
const inputcomment=document.getElementById("inputcomment").value;
writeUserData(inputnumber,inputdate,inputtitle,inputcomment);

writeUserData(inputnumber,inputdate,inputtitle,inputcomment);
// readData();

})


// Writing and Reading Data
// writeUserData(1, "Ameen", "sa@gmail.com");
readData();
