import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDKoUi-HrpSecqRaAHPJegkBsQB9VXCd94",
  authDomain: "wingsauto-68140.firebaseapp.com",
  projectId: "wingsauto-68140",
  storageBucket: "wingsauto-68140.firebasestorage.app",
  messagingSenderId: "970162929270",
  appId: "1:970162929270:web:00e11505839c37d064a957"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  console.log("Attempting write...");
  try {
    await setDoc(doc(db, "test/testdoc"), { hello: "world" });
    console.log("Write succeeded!");
  } catch (err) {
    console.error("Write failed:", err.message);
  }
  process.exit(0);
}

test();
