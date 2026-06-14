// --- 1. SYSTEM INITIALIZATION & TRANSITION ---
window.onload = () => {
    console.log("System Initializing...");
    
    // Set Current Date in Dashboard
    const dateEl = document.getElementById('currentDate');
    if(dateEl) dateEl.innerText = new Date().toDateString();

    const splash = document.getElementById('splash-screen');
    const auth = document.getElementById('auth-screen');

    // 3 Second Splash Screen Pause
    setTimeout(() => {
        if (splash && auth) {
            splash.style.opacity = '0';
            splash.style.transition = '0.8s ease';
            
            setTimeout(() => {
                splash.style.display = 'none';
                auth.style.display = 'flex'; // Show Login Screen
                console.log("Login Screen Visible");
            }, 800);
        }
    }, 3000);
};

// --- 2. HOSPITAL SYSTEM CLASS (Database & Logic) ---
class HospitalSystem {
    constructor() {
        // DATABASE INTEGRATION: Load from LocalStorage
        this.patients = JSON.parse(localStorage.getItem('hospital_patients')) || [];
        this.tokenCounter = this.patients.length > 0 ? 101 + this.patients.length : 101;
        
        this.doctors = [
            { id: 1, name: "Dr. Ahmed", dept: "Cardiology", room: "203", status: "Available", wait: 12, exp: 12, rating: 4.9, img: "👨‍⚕️" },
            { id: 2, name: "Dr. Sara", dept: "Neurology", room: "105", status: "Busy", wait: 45, exp: 8, rating: 4.7, img: "👩‍⚕️" },
            { id: 3, name: "Dr. Ali", dept: "Pediatrics", room: "302", status: "Available", wait: 5, exp: 15, rating: 4.8, img: "👨‍⚕️" },
            { id: 4, name: "Dr. Zafar", dept: "Radiology", room: "Lab 1", status: "Available", wait: 20, exp: 10, rating: 4.6, img: "👨‍⚕️" },
            { id: 5, name: "Dr. Khan", dept: "General", room: "101", status: "Available", wait: 10, exp: 20, rating: 4.9, img: "👨‍⚕️" }
        ];

        this.graph = {
            'Reception': ['Emergency', 'Pharmacy', 'OPD_A'],
            'Emergency': ['Reception', 'Radiology'],
            'Pharmacy': ['Reception'],
            'Radiology': ['Emergency', 'OPD_A'],
            'OPD_A': ['Reception', 'Radiology']
        };
    }

    saveToDatabase() {
        localStorage.setItem('hospital_patients', JSON.stringify(this.patients));
    }

    // Helper to find a doctor based on department
    assignDoctor(dept) {
        const doc = this.doctors.find(d => d.dept === dept);
        return doc ? doc.name : "Dr. On Call";
    }

    registerPatient(name, age, dept, priority, symptoms) {
        const patient = {
            token: "SAV-" + this.tokenCounter++,
            name, age, dept, symptoms,
            priority: parseInt(priority),
            gender: "Not Specified",
            blood: "O+",
            time: new Date().toLocaleDateString(),
            status: "Waiting",
            visits: [
                { date: new Date().toDateString(), dept, doctor: this.assignDoctor(dept), symptom: symptoms }
            ]
        };

        this.patients.push(patient);
        this.sortQueue();      // PRIORITY QUEUE LOGIC: Emergency moves to top
        this.saveToDatabase();
        this.updateUI(patient);
        this.notify(`New Registration: ${name} (${patient.token})`);
    }

    sortQueue() {
        // 1=Emergency, 2=Serious, 3=Normal
        this.patients.sort((a, b) => a.priority - b.priority);
    }

    notify(msg) {
        const stream = document.getElementById('notification-stream');
        if(!stream) return;
        const item = document.createElement('div');
        item.className = 'notif-item';
        item.innerHTML = `<strong>${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>: ${msg}`;
        stream.prepend(item);
        const empty = stream.querySelector('.empty-msg');
        if(empty) empty.remove();
    }

    updateUI(lastP = null) {
        if(lastP) {
            document.getElementById('dispToken').innerText = lastP.token;
            document.getElementById('dispName').innerText = lastP.name;
            document.getElementById('dispDept').innerText = lastP.dept;
            const badge = document.getElementById('dispPriorityBadge');
            const label = lastP.priority == 1 ? 'Emergency' : (lastP.priority == 2 ? 'Serious' : 'Normal');
            badge.innerText = label;
            badge.className = `badge ${label.toLowerCase()}`;
        }

        document.getElementById('stat-total').innerText = this.patients.length;
        document.getElementById('stat-emergency').innerText = this.patients.filter(p => p.priority == 1).length;

        const tbody = document.getElementById('queue-body');
        if(tbody) {
            tbody.innerHTML = "";
            this.patients.forEach((p, index) => {
                const label = p.priority == 1 ? 'Emergency' : (p.priority == 2 ? 'Serious' : 'Normal');
                tbody.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${p.token}</strong></td>
                        <td>${p.name}</td>
                        <td>${p.dept}</td>
                        <td><span class="badge ${label.toLowerCase()}">${label}</span></td>
                        <td>${this.assignDoctor(p.dept)}</td>
                        <td>${index * 12}m</td>
                    </tr>
                `;
            });
        }
    }
}

const sys = new HospitalSystem();

// --- 3. UI INTERACTION FUNCTIONS ---

function toggleAuth(mode) {
    document.getElementById('login-form').style.display = mode === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = mode === 'register' ? 'block' : 'none';
    document.getElementById('tab-login').classList.toggle('active', mode === 'login');
    document.getElementById('tab-register').classList.toggle('active', mode === 'register');
}

function handleLogin() {
    const id = document.getElementById('loginID').value;
    if(!id) return alert("Enter Staff ID");
    
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'grid';
    showSection('overview');
    sys.updateUI(); 
}

function handleRegister() {
    const name = document.getElementById('regName').value;
    const age = document.getElementById('regAge').value;
    const dept = document.getElementById('regDept').value;
    const priority = document.getElementById('regPriority').value;
    const symptoms = document.getElementById('regDisease').value;

    if(!name || !age) return alert("Please enter at least Name and Age");

    // Process logic
    sys.registerPatient(name, age, dept, priority, symptoms);
    
    // Switch UI to Dashboard
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'grid';
    showSection('overview');
}

function showSection(sectionId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    
    // Show target view
    const target = document.getElementById(sectionId);
    if(target) target.style.display = 'block';

    // Update Sidebar
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    const navItem = document.getElementById('nav-' + sectionId);
    if(navItem) navItem.classList.add('active');

    // Run specific renders
    if(sectionId === 'doctors') renderDoctors();
    if(sectionId === 'history') renderHistorySidebar();
}

// --- 4. DOCTORS & MAP LOGIC ---

function renderDoctors() {
    const list = document.getElementById('doctor-list');
    if(!list) return;
    list.innerHTML = "";
    sys.doctors.forEach(doc => {
        list.innerHTML += `
            <div class="doc-card">
                <div class="doc-img">${doc.img}</div>
                <h3>${doc.name}</h3>
                <p>${doc.dept}</p>
                <div class="doc-status ${doc.status === 'Available' ? 'status-available' : 'status-busy'}">
                    ● ${doc.status} | Room ${doc.room}
                </div>
                <div class="doc-stats">
                    <div><strong>${doc.wait}m</strong><br>Wait</div>
                    <div><strong>${doc.rating}</strong><br>⭐</div>
                    <div><strong>${doc.exp}y</strong><br>Exp</div>
                </div>
                <button class="main-btn" style="margin-top:10px; padding:8px;">Assign Patient</button>
            </div>
        `;
    });
}

function findRoute() {
    const end = document.getElementById('endNode').value;
    if(!end) return alert("Select a destination");

    const path = ["Reception", end]; 
    document.querySelectorAll('.map-node').forEach(n => n.classList.remove('highlight'));
    
    path.forEach((node, i) => {
        setTimeout(() => {
            const el = document.getElementById('node-' + node);
            if(el) el.classList.add('highlight');
        }, i * 600);
    });
}

// --- UPDATED MAP LOGIC (BFS ALGORITHM) ---

function showRoomInfo(room) {
    const modal = document.getElementById('infoModal');
    const body = document.getElementById('modal-body');
    
    // Custom data for each room to make it feel "Alive"
    const roomData = {
        'Emergency': { icon: '🚑', floor: 'Ground Floor - Wing A', crowd: 'High', wait: '5 mins', color: '#e74c3c' },
        'Pharmacy': { icon: '💊', floor: 'Ground Floor - Wing B', crowd: 'Low', wait: '10 mins', color: '#27ae60' },
        'Radiology': { icon: '🩻', floor: 'Basement - Wing C', crowd: 'Medium', wait: '45 mins', color: '#9b59b6' },
        'OPD_A': { icon: '🩺', floor: '1st Floor - Wing A', crowd: 'High', wait: '30 mins', color: '#3498db' }
    };

    const data = roomData[room];

    // Show the modal instead of an alert
    modal.style.display = 'flex';
    body.innerHTML = `
        <div style="text-align:center;">
            <div style="font-size: 3rem; margin-bottom:10px;">${data.icon}</div>
            <h2 style="color:${data.color}; margin-bottom:5px;">${room.replace('_', ' ')} Department</h2>
            <p style="color:#666; margin-bottom:20px;">${data.floor}</p>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div class="profile-stat"><span>Crowd Level</span><strong style="color:${data.color}">${data.crowd}</strong></div>
            <div class="profile-stat"><span>Avg. Wait</span><strong>${data.wait}</strong></div>
        </div>
        <hr style="margin:20px 0; opacity:0.1;">
        <p><i class="fa-solid fa-circle-info"></i> <strong>Note:</strong> Emergency cases are prioritized in this wing. Follow the red floor lines for the fastest route.</p>
        <button class="main-btn" onclick="closeModal()">Close Navigator</button>
    `;
}

function closeModal() {
    document.getElementById('infoModal').style.display = 'none';
}

function findRoute() {
    const startNode = "Reception";
    const endNode = document.getElementById('endNode').value;
    
    if (!endNode) return;

    // The Graph: Which room connects to which?
    const graph = {
        'Reception': ['OPD_A', 'Pharmacy'],
        'OPD_A': ['Reception', 'Radiology'],
        'Pharmacy': ['Reception'],
        'Radiology': ['OPD_A', 'Emergency'],
        'Emergency': ['Radiology']
    };

    // BFS Algorithm to find shortest path
    let queue = [[startNode]];
    let visited = new Set();
    let shortestPath = null;

    while (queue.length > 0) {
        let path = queue.shift();
        let room = path[path.length - 1];

        if (room === endNode) {
            shortestPath = path;
            break;
        }

        if (!visited.has(room)) {
            visited.add(room);
            let neighbors = graph[room] || [];
            for (let neighbor of neighbors) {
                let newPath = [...path, neighbor];
                queue.push(newPath);
            }
        }
    }

    // VISUAL FEEDBACK
    // 1. Reset all nodes
    document.querySelectorAll('.map-node').forEach(node => {
        node.classList.remove('highlight');
        node.style.border = '2px solid #eee';
    });

    // 2. Animate the path
    shortestPath.forEach((roomId, index) => {
        setTimeout(() => {
            const el = document.getElementById('node-' + roomId);
            if (el) {
                el.classList.add('highlight'); // This uses your CSS pulse animation
                el.style.border = '2px solid #cc0000';
            }
        }, index * 400); // 400ms delay creates a "walking" effect
    });

    // 3. Show instructions
    const instructionBox = document.getElementById('route-instructions');
    instructionBox.innerHTML = `
        <div style="background:#fff5f5; padding:15px; border-radius:10px; border-left:5px solid #cc0000; margin-top:15px;">
            <i class="fa-solid fa-diamond-turn-right"></i> 
            <strong>Route Found:</strong> ${shortestPath.join(' → ').replace('_', ' ')} <br>
            <small><i class="fa-solid fa-person-walking"></i> Follow the highlighted blocks. Est time: ${shortestPath.length * 2} mins</small>
        </div>
    `;
}

// --- 5. HISTORY FEATURE FUNCTIONS ---

function filterHistory() {
    const query = document.getElementById('historySearch').value.toLowerCase();
    renderHistorySidebar(query);
}

function renderHistorySidebar(query = "") {
    const sidebar = document.getElementById('history-sidebar');
    if(!sidebar) return;
    sidebar.innerHTML = "";
    
    const filtered = sys.patients.filter(p => 
        p.name.toLowerCase().includes(query) || p.token.toLowerCase().includes(query)
    );

    filtered.forEach(p => {
        sidebar.innerHTML += `
            <div class="patient-item" onclick="viewPatientFolder('${p.token}')">
                <strong>${p.name}</strong>
                <span>ID: ${p.token} | ${p.dept}</span>
            </div>
        `;
    });
}

function viewPatientFolder(token) {
    console.log("Viewing patient:", token); // For debugging
    
    // 1. Find the patient in the system array
    const p = sys.patients.find(pt => pt.token === token);
    const folder = document.getElementById('patient-folder-view');
    
    if (!p || !folder) {
        console.error("Patient or Folder container not found!");
        return;
    }

    // 2. Highlight the active patient in the sidebar
    document.querySelectorAll('.patient-item').forEach(item => item.classList.remove('active'));
    // Find the item that was clicked and add active class
    const clickedItem = event.currentTarget; 
    if(clickedItem) clickedItem.classList.add('active');

    // 3. Inject the data into the right panel
    folder.innerHTML = `
        <div class="folder-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #eee; padding-bottom:15px;">
            <div>
                <h1 style="margin:0; color:#cc0000; font-size:2rem;">${p.name}</h1>
                <span style="color:#666;">Patient ID: <strong>${p.token}</strong></span>
            </div>
            <span class="badge ${p.priority == 1 ? 'critical' : 'normal'}" style="padding:10px 20px; font-size:0.9rem;">
                ${p.priority == 1 ? '🚨 Emergency Case' : '✅ Standard Case'}
            </span>
        </div>

        <div class="profile-grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; margin:20px 0;">
            <div class="profile-stat" style="background:#f8f9fa; padding:15px; border-radius:12px; text-align:center;">
                <span style="font-size:0.8rem; color:#888;">Age</span><br>
                <strong style="font-size:1.2rem;">${p.age} Years</strong>
            </div>
            <div class="profile-stat" style="background:#f8f9fa; padding:15px; border-radius:12px; text-align:center;">
                <span style="font-size:0.8rem; color:#888;">Blood Group</span><br>
                <strong style="font-size:1.2rem; color:#cc0000;">${p.blood || 'O+'}</strong>
            </div>
            <div class="profile-stat" style="background:#f8f9fa; padding:15px; border-radius:12px; text-align:center;">
                <span style="font-size:0.8rem; color:#888;">Total Visits</span><br>
                <strong style="font-size:1.2rem;">${p.visits ? p.visits.length : 1}</strong>
            </div>
        </div>

        <h3 style="border-left:5px solid #cc0000; padding-left:10px; margin-top:30px;">Visit & Queue History</h3>
        <div class="visit-history-list">
            ${p.visits && p.visits.length > 0 ? p.visits.map(v => `
                <div class="visit-card" style="display:grid; grid-template-columns: 120px 1fr 1fr 100px; gap:10px; border:1px solid #eee; padding:15px; margin-bottom:10px; border-radius:10px; align-items:center; background:#fff;">
                    <div style="font-size:0.85rem; color:#888;">${v.date}</div>
                    <div><strong>${v.dept}</strong><br><small>Department</small></div>
                    <div><strong>${v.doctor}</strong><br><small>Physician</small></div>
                    <div style="color:#27ae60; font-weight:bold; font-size:0.8rem; text-align:right;"><i class="fa-solid fa-circle-check"></i> COMPLETED</div>
                </div>
            `).join('') : '<p>No previous visits recorded.</p>'}
        </div>

        <h3 style="border-left:5px solid #cc0000; padding-left:10px; margin-top:30px;">Medical Diagnosis</h3>
        <div style="background:#fff8f8; padding:20px; border-radius:12px; border:1px solid #ffebeb;">
            <p><strong>Primary Symptoms:</strong> ${p.symptoms}</p>
            <p><strong>Clinical Notes:</strong> Patient is stable. History of ${p.symptoms} noted. Assigned to ${p.dept} for further evaluation.</p>
            <p style="margin-bottom:0;"><strong>Prescription:</strong> Standard medical protocol for ${p.dept} symptoms. Re-evaluation in 3 days.</p>
        </div>
    `;
}