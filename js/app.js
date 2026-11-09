import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, getDocs, collection, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// ---------------------------------------------------------------------
//  ELECTION SETTINGS (India time, +05:30)
// ---------------------------------------------------------------------
// Voting closes at this moment. After it, voting is disabled and the
// "See candidates for victory" button appears.
export const VOTING_END = new Date("2026-11-16T10:00:00+05:30");
export const VOTING_END_LABEL = "16th November 2026, 10:00 AM";

// "End time" shown on the welcome page. After this moment the
// "See candidates for victory" button appears.
export const RESULTS_TIME = new Date("2026-11-09T10:00:00+05:30");
export const RESULTS_TIME_LABEL = "9th November 2026, 10:00 AM";
export function resultsOpen() { return Date.now() >= RESULTS_TIME.getTime(); }

// Codes are stored as SHA-256 hashes so the real codes are not visible
// in the website source.
const CODE_SALT = "ABM2026:";

export const PEOPLE = {
  joby:  { name: "Joby Joseph",     short: "Joby",  photo: "images/joby.jpg",  candidate: true,  userId: "ABMelections2026user1047",
           codeHash: "0439ea7fad4603303ce49222a2a91656ac4f9eeb6fd30cb525592a29aecc412d" },
  anna:  { name: "Anna Maria",      short: "Anna",  photo: "images/anna.jpg",  candidate: false, userId: "ABMelections2026user2318",
           codeHash: "f44f0f01536885564644ec48cdb3133bb9d905ce82c869550ba0c354a685faf1" },
  asha:  { name: "Asha Joby",       short: "Asha",  photo: "images/asha.jpg",  candidate: true,  userId: "ABMelections2026user3592",
           codeHash: "2b5c76ce4d9bda635e5a7af8bc9482610c6a953e7b4ccc445caec01acfb53aa7" },
  aaron: { name: "Aaron Joseph",    short: "Aaron", photo: "images/aaron.jpg", candidate: true,  userId: "ABMelections2026user4765",
           codeHash: "6b9a09383ac6998598909eb6c2a0151cb2ab1a2ebde164fb89371553e1ead48d" },
  anton: { name: "Anton Kuriakose", short: "Anton", photo: "images/anton.jpg", candidate: false, userId: "ABMelections2026user5821",
           codeHash: "29d16a4b0d2eed34e7f0d8ab0ad8d6bada85b539796cd8dd3762f04c7bb4bd51" },
};

export const CANDIDATES = ["asha", "aaron", "joby"];

// ---------------------------------------------------------------------
//  Firebase
// ---------------------------------------------------------------------
let db = null;
export function getDb() {
  if (db) return db;
  if (!firebaseConfig.projectId || firebaseConfig.projectId === "PASTE_HERE") {
    throw new Error("Firebase is not set up yet. Paste your config into js/firebase-config.js.");
  }
  db = getFirestore(initializeApp(firebaseConfig));
  return db;
}

export async function getMyVote(key) {
  const snap = await getDoc(doc(getDb(), "votes", key));
  return snap.exists() ? snap.data() : null;
}

export async function castVote(voterKey, candidateKey) {
  if (votingClosed()) throw new Error("closed");
  if (voterKey === candidateKey || !CANDIDATES.includes(candidateKey)) throw new Error("invalid");
  if (await getMyVote(voterKey)) throw new Error("already");
  // Firestore rules only allow creating this document once, so a person can never vote twice.
  await setDoc(doc(getDb(), "votes", voterKey), { candidate: candidateKey, votedAt: serverTimestamp() });
}

export async function countVotes() {
  const counts = Object.fromEntries(CANDIDATES.map(c => [c, 0]));
  const snap = await getDocs(collection(getDb(), "votes"));
  snap.forEach(d => { const c = d.data().candidate; if (c in counts) counts[c]++; });
  return counts;
}

// ---------------------------------------------------------------------
//  Login / session
// ---------------------------------------------------------------------
async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function login(code) {
  const h = await sha256(CODE_SALT + code.trim());
  const key = Object.keys(PEOPLE).find(k => PEOPLE[k].codeHash === h);
  if (key) sessionStorage.setItem("abmUser", key);
  return key || null;
}

// Use on every page except the login page. Sends the visitor back to the
// login page if they have not entered a code.
export function requireUser() {
  const key = sessionStorage.getItem("abmUser");
  if (!key || !PEOPLE[key]) { location.replace("index.html"); throw new Error("not logged in"); }
  return key;
}

export function logout() {
  sessionStorage.removeItem("abmUser");
  location.href = "index.html";
}

// ---------------------------------------------------------------------
//  Time helpers
// ---------------------------------------------------------------------
export function votingClosed() { return Date.now() >= VOTING_END.getTime(); }

export function timeLeftText() {
  let ms = VOTING_END.getTime() - Date.now();
  if (ms <= 0) return "Voting time is over";
  const min = Math.floor(ms / 60000);
  const days = Math.floor(min / 1440), hours = Math.floor((min % 1440) / 60), mins = min % 60;
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  if (days > 0) return `${plural(days, "day")} ${plural(hours, "hour")} left`;
  if (hours > 0) return `${plural(hours, "hour")} ${mins} min left`;
  return `${Math.max(mins, 1)} min left`;
}

export function startCountdown(el) {
  const tick = () => { el.textContent = timeLeftText(); };
  tick();
  setInterval(tick, 15000);
}

export function showError(el, err) {
  el.textContent = err && err.message ? err.message : String(err);
  el.hidden = false;
}
