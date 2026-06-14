// --- 1. THE HOSPITAL SYSTEM ENGINE (C++ Logic) ---
class HospitalSystem {
    constructor() {
        this.registry = new Map();
        this.emergencyQ = [];
        this.normalQ = [];
        this.undoStack = [];
        this.idCounter = 101;
        this.tokenGen = 1;
    }

    register(name, age, disease, priority) {
        let p = {
            id: this.idCounter++,
            name: name,
            age: age,
            disease: disease,
            priority: parseInt(priority),
            token: this.tokenGen++,
            status: parseInt(priority) === 1 ? "Emergency" : "Stable"
        };
        this.registry.set(p.id, p);
        this.undoStack.push(p.id);
        
        if (p.priority === 1) this.emergencyQ.push(p);
        else this.normalQ.push(p);
        
        return p;
    }
}

const system = new HospitalSystem();

// --- 2. THE SPLASH SCREEN TRANSITION (The "Forward" Fix) ---
// This runs as soon as the page loads
window.addEventListener('load', () => {
    console.log("System Initializing...");
    
    // Wait 3.5 seconds to show off the welcome screen
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        const auth = document.getElementById('auth-screen');
        
        if(splash && auth) {
            // Smooth Fade Out
            splash.style.opacity = '0';
            splash.style.transition = '1s';
            
            setTimeout(() => {
                splash.style.display = 'none';
                auth.style.display = 'flex'; // Shows Login Screen
                console.log("Transition to Auth Complete");
            }, 1000);
        } else {
            console.error("IDs not found! Check index.html for splash-screen and auth-screen");
        }
    }, 3500);
});

// --- 3. LOGIN & REGISTRATION LOGIC ---
function toggleAuth(mode) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    if (mode === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
    }
}

function handleRegister() {
    const name = document.getElementById('regName').value;
    const age = document.getElementById('regAge').value;
    const disease = document.getElementById('regDisease').value;
    const priority = document.getElementById('regPriority').value;

    if (!name || !age) {
        notify("Please enter Name and Age", "error");
        return;
    }

    // Process C++ Logic
    const patient = system.register(name, age, disease, priority);

    // Update Dashboard Overview with Patient Data
    document.getElementById('dispToken').innerText = "T-" + patient.token;
    document.getElementById('dispName').innerText = patient.name;
    document.getElementById('dispAge').innerText = patient.age;
    document.getElementById('dispIssue').innerText = patient.disease;

    // Transition to Dashboard
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'grid';
    
    notify("Patient Registered Successfully!", "success");
}

function handleLogin() {
    const id = parseInt(document.getElementById('loginID').value);
    if (system.registry.has(id)) {
        const p = system.registry.get(id);
        // Fill Dashboard
        document.getElementById('dispToken').innerText = "T-" + p.token;
        document.getElementById('dispName').innerText = p.name;
        document.getElementById('dispAge').innerText = p.age;
        document.getElementById('dispIssue').innerText = p.disease;
        
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'grid';
    } else {
        notify("Patient ID not found", "error");
    }
}

// --- 4. VOICE RECOGNITION FEATURE ---
function startVoiceRecording() {
    const status = document.getElementById('recordStatus');
    const pulse = document.getElementById('pulseEffect');
    const transcriptText = document.getElementById('voiceTranscript');
    const aiBox = document.getElementById('aiSuggestion');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech Recognition not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.onstart = () => {
        status.innerText = "Listening to symptoms...";
        pulse.classList.add('active');
    };

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        transcriptText.innerText = `"${text}"`;
        
        // Simple AI matching logic
        aiBox.style.display = "block";
        let recommendation = "General OPD";
        if(text.toLowerCase().includes("heart")) recommendation = "Cardiology Wing (Dr. Smith)";
        if(text.toLowerCase().includes("stomach")) recommendation = "Gastroenterology (Dr. Taylor)";
        if(text.toLowerCase().includes("head")) recommendation = "Neurology (Dr. Sarah)";
        
        aiBox.innerHTML = `<strong>AI Suggestion:</strong> Route to ${recommendation}`;
    };

    recognition.onend = () => {
        status.innerText = "Recording Finished";
        pulse.classList.remove('active');
    };

    recognition.start();
}

// --- 5. UTILITIES ---
function showSection(id) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    // Highlight active menu
    event.currentTarget.classList.add('active');
}

function notify(msg, type) {
    alert(msg); // You can replace this with your red notification bar later
}

function exitSystem() {
    location.reload(); // Restarts the app
}
// Extend the HospitalSystem Class
class HospitalSystemExtended extends HospitalSystem {
    constructor() {
        super();
        this.doctors = [
            { name: "Dr. Arsalan", spec: "Cardiologist", room: "101", status: "Available" },
            { name: "Dr. Sarah", spec: "Neurologist", room: "205", status: "In Surgery" },
            { name: "Dr. Usman", spec: "Pediatrician", room: "LL-1", status: "Available" }
        ];
    }

    getQueue() {
        // Sort: Critical (1) first, then Normal (2)
        return [...this.emergencyQ, ...this.normalQ];
    }
}

const sys = new HospitalSystemExtended();

// Overwrite handleRegister to include the new UI updates
function handleRegister() {
    const name = document.getElementById('regName').value;
    const age = document.getElementById('regAge').value;
    const disease = document.getElementById('regDisease').value;
    const priority = document.getElementById('regPriority').value;

    if (!name || !age) {
        alert("Fields missing");
        return;
    }

    const patient = sys.register(name, age, disease, priority);
    
    // Update UI elements
    updateQueueUI();
    updateAdminStats();
    
    // Fill Dashboard Info
    document.getElementById('dispToken').innerText = "T-" + patient.token;
    document.getElementById('dispName').innerText = patient.name;
    document.getElementById('dispAge').innerText = patient.age;
    document.getElementById('dispIssue').innerText = patient.disease;
    document.getElementById('billName').innerText = patient.name;

    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'grid';
}

function updateQueueUI() {
    const qBody = document.getElementById('queueBody');
    const fullQueue = sys.getQueue();
    
    qBody.innerHTML = fullQueue.map(p => `
        <tr>
            <td>T-${p.token}</td>
            <td>${p.name}</td>
            <td><span class="badge ${p.priority === 1 ? 'critical' : 'normal'}">
                ${p.priority === 1 ? 'CRITICAL' : 'NORMAL'}</span>
            </td>
            <td>Waiting</td>
        </tr>
    `).join('');

    document.getElementById('qCount').innerText = fullQueue.length;
    document.getElementById('waitTime').innerText = (fullQueue.length * 15) + " min";
}

function renderDoctors() {
    const container = document.getElementById('doctorGrid');
    container.innerHTML = sys.doctors.map(d => `
        <div class="doc-card">
            <h4>${d.name}</h4>
            <p>${d.spec}</p>
            <small>Room: ${d.room}</small><br>
            <span style="color: ${d.status === 'Available' ? 'green' : 'red'}">${d.status}</span>
        </div>
    `).join('');
}

function updateAdminStats() {
    document.getElementById('statTotal').innerText = sys.registry.size;
    document.getElementById('statCritical').innerText = sys.emergencyQ.length;
}

// Update showSection to trigger specific renders
const originalShowSection = showSection;
showSection = function(id) {
    if (id === 'doctors') renderDoctors();
    if (id === 'live-queue') updateQueueUI();
    if (id === 'admin') updateAdminStats();
    
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    // If the call came from a click event
    if(event && event.currentTarget) event.currentTarget.classList.add('active');
};