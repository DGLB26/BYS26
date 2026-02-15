 const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby2Zx77GS8OL17_GMlNf60tbfmo3gq8lytCpjMqW3kUdC0vUlQq8pRrTmWV69XQaAER9A/exec';
    let sheetData = []; 
    let currentApplicantData = {}; 

    // --- Date Formatting Functions ---
    function formatDateDisplay(dateVal) {
        if (!dateVal || dateVal === "N/A" || dateVal === "") return "N/A";
        try {
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return dateVal;
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (e) { return dateVal; }
    }

    function formatDateForInput(dateVal) {
        if (!dateVal || dateVal === "N/A") return "";
        try {
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return "";
            return d.toISOString().split('T')[0];
        } catch (e) { return ""; }
    }

    // --- UI Functions ---
    function openModal(id) { document.getElementById(id).classList.add('active'); }
    function closeModal(id) {
        document.getElementById(id).classList.remove('active');
        if (id === 'dataModal') toggleEditMode(false);
    }

    // --- Login & Data Loading ---
        async function adminLogin() {
        const user = document.getElementById("adminUser").value;
        const pass = document.getElementById("adminPass").value;
        const msg = document.getElementById("statusMessage");

        msg.textContent = "Checking...";

        const res = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "adminLogin",
                user: user,
                password: pass
            })
        });

        const result = await res.json();

        if (result.result === "success") {
            document.getElementById("loginBox").style.display = "none";
            document.getElementById("adminPanel").style.display = "block";
            loadData();  // আপনার আগে লেখা ফাংশন ডাটা লোডের জন্য
        } else {
            msg.textContent = "❌ Wrong User ID or Password";
        }
    }

    async function loadData() {
        const loading = document.getElementById("loading");
        loading.style.display = "block";
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'fetch' })
            });
            sheetData = await response.json();
            const displayHeaders = ['Name', 'Date_of_Birth', 'Father_Name', 'Aadhaar_Number', 'Village', 'Case_Status', 'Actions'];
            renderTable(displayHeaders, sheetData);
        } catch (error) {
            loading.textContent = "Error: " + error.message;
        }
        loading.style.display = "none";
    }

    function renderTable(headers, data) {
        const thead = document.querySelector("#dataTable thead");
        const tbody = document.getElementById("dataRows");
        thead.innerHTML = ""; tbody.innerHTML = "";
        
        const headerRow = document.createElement("tr");
        headers.forEach(h => {
            const th = document.createElement("th");
            th.textContent = h.replace(/_/g, ' '); 
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        data.forEach(row => {
            const tr = document.createElement("tr");
            headers.forEach(headerKey => {
                const td = document.createElement("td");
                let value = row[headerKey] || 'N/A';

                if (headerKey === 'Actions') {
                    td.innerHTML = `<button onclick="openDataModal('${row.id}')">View Details</button>`;
                } else if (headerKey === 'Case_Status') {
                    td.textContent = value;
                    td.style.fontWeight = 'bold';
                    if (value === '4th District Verified') td.style.color = 'green';
                    else if (value === 'Wait for Entry' || value === '1st Entry') td.style.color = 'orange';
                    else td.style.color = 'blue';
                } else if (headerKey === 'Date_of_Birth') {
                    td.textContent = formatDateDisplay(value);
                } else {
                    td.textContent = value;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    function filterByName() {
        const q = document.getElementById("searchBox").value.toLowerCase();
        const displayHeaders = ['Name', 'Date_of_Birth', 'Father_Name', 'Aadhaar_Number', 'Village', 'Case_Status', 'Actions'];
        const filtered = sheetData.filter(r => (r.Name || "").toLowerCase().includes(q));
        renderTable(displayHeaders, filtered);
    }

    const detailFields = [

  // ===== BASIC INFO =====
  { key: 'Timestamp', label: 'Entry Time', editable: false },
  { key: 'BYS_ID', label: 'BYS ID', editable: true },

  { key: 'Name', label: 'Full Name', editable: true },
  { key: 'Date_of_Birth', label: 'Date of Birth', editable: false, type: 'date' },
  { key: 'Age_2026', label: 'Age (as on 01/04/2026)', editable: false },

  { key: 'Gender', label: 'Gender', editable: true, type: 'select',
    options: ['Male', 'Female', 'Other'] },

  { key: 'Father_Name', label: "Father's Name", editable: true },
  { key: 'Mother_Name', label: "Mother's Name", editable: true },

  { key: 'Marital_Status', label: 'Marital Status', editable: true, type: 'select',
    options: ['Unmarried', 'Married', 'Widow', 'Divorced'] },

  { key: 'Spouse_Name', label: "Spouse Name", editable: true },

  // ===== IDENTIFICATION =====
  { key: 'Aadhaar_Number', label: 'Aadhaar Number', editable: true },
  { key: 'Voter_Number', label: 'Voter ID Number', editable: true },

  { key: 'Caste_Category', label: 'Caste Category', editable: true, type: 'select',
    options: ['General', 'SC', 'ST', 'OBC', 'Others'] },

  { key: 'Caste_Number', label: 'Caste Certificate No.', editable: true },

  // ===== EDUCATION =====
  { key: 'MP_Roll_No', label: 'MP Roll No', editable: true },
  { key: 'MP_Year', label: 'MP Passing Year', editable: true },

  { key: 'MP_Board', label: 'MP Board', editable: true, type: 'select',
    options: ['WBBSE', 'CBSE', 'ICSE', 'WBBME', 'Others'] },

  {  key: 'Highest_Education',  label: 'Highest Education Qualification',  editable: true,  type: 'select',
  options: [    'Madhyamik',    'Higher Secondary',    'Graduate',    'Post Graduate',    'Diploma',    'Others']},

{key: 'Present_Occupation', label: 'Present Occupation', editable: true, type: 'select',
  options: ['Unemployed', 'Student', 'Self Employed', 'Private Job', 'Government Job', 'Others'] },

  // ===== ADDRESS =====
  { key: 'Village', label: 'Village', editable: true },
  { key: 'Post_Office', label: 'Post Office', editable: true },
  { key: 'Gram_Panchayat', label: 'Gram Panchayat', editable: true },
  {  key: 'Police_Station',  label: 'Police Station',  editable: true,  type: 'select',
  options: [    'Balurghat',    'Gangarampur',    'Tapan',    'Kushmandi',    'Kumarganj',    'Hili',    'Banshihari',    'Harirampur'  ]},

  {  key: 'District', label: 'District',  editable: true,  type: 'select',
  options: [    'Dakshin Dinajpur',    'Uttar Dinajpur',    'Malda',    'Murshidabad',    'Birbhum',    'Purba Bardhaman',    'Paschim Bardhaman',
    'Nadia',    'Hooghly',    'Howrah',    'North 24 Parganas',    'South 24 Parganas',    'Bankura',    'Purulia',    'Jhargram',    'Paschim Medinipur',
    'Purba Medinipur',    'Kolkata',    'Alipurduar',    'Cooch Behar',    'Jalpaiguri',    'Darjeeling',    'Kalimpong'  ]},

  { key: 'Pin_Code', label: 'PIN Code', editable: true },

  // ===== BANK =====
  {  key: 'Bank_Name',  label: 'Bank Name',  editable: true,  type: 'select',
  options: ['Axis Bank','West Bengal Gramin Bank','Bank of Baroda','Bank of India','Canara Bank','Central Bank of India','HDFC Bank','ICICI Bank','IDBI Bank','Indian Bank','Indian Overseas Bank','Indian Post Payment Bank','IndusInd Bank','Kotak Mahindra Bank','Punjab National Bank','State Bank of India','UCO Bank','Union Bank of India','Yes Bank']},
  { key: 'Bank_Branch', label: 'Bank Branch', editable: true },
  { key: 'IFSC', label: 'IFSC Code', editable: true },
  { key: 'Account_Number', label: 'Account Number', editable: true },

  // ===== CONTACT =====
  { key: 'Mobile_Number', label: 'Mobile Number', editable: true },
  { key: 'Email', label: 'Email ID', editable: true },

  // ===== ADMIN CONTROL =====
  { key: 'Case_Status', label: 'Case Status', editable: true, type: 'select',
    options: ['Wait for Entry', '1st Entry', '2nd Submit', '3rd Block Verified', '4th District Verified'] },

  { key: 'Bank_Validation', label: 'Bank Validation', editable: true, type: 'select',
    options: ['Waiting', 'Validation Success', 'Validation Error', 'No Such Account', 'Account Frozen'] },

  { key: 'Payment_Agreement', label: 'Payment Agreement Amount', editable: true, type: 'select',
    options: ['0', '500', '1000', '1500', '2000', '2500', '3000', '3500', '4000', '4500', '5000', '10000'] },

  { key: 'Payment_Status', label: 'Payment Status', editable: true, type: 'select',
    options: ['No Payment', '500', '1000', '1500', '2000', '2500', '3000', '3500', '4000', '4500', '5000', 'Payment Complete'] },

  { key: 'Note', label: 'Note / Remarks', editable: true, type: 'textarea' }

];


    function openDataModal(docId) {
        const applicant = sheetData.find(a => a.id == docId);
        if (!applicant) return;
        currentApplicantData = applicant; 
        document.getElementById('editDocId').value = docId;
        document.getElementById('applicantNameHeader').textContent = applicant.Name || 'N/A';
        renderDetails(applicant, false);
        
        const photoImg = document.getElementById('applicantPhoto');
        const noPhotoMsg = document.getElementById('noPhotoMsg');
        if (applicant.Photo_Upload && applicant.Photo_Upload.includes('data:image')) {
            photoImg.src = applicant.Photo_Upload;
            photoImg.style.display = 'block';
            noPhotoMsg.style.display = 'none';
        } else {
            photoImg.style.display = 'none';
            noPhotoMsg.style.display = 'block';
        }
        openModal('dataModal');
    }

    function toggleEditMode(isEdit) {
        renderDetails(currentApplicantData, isEdit);
        document.getElementById('editButton').style.display = isEdit ? 'none' : 'inline-block';
        document.getElementById('saveButton').style.display = isEdit ? 'inline-block' : 'none';
    }

    // --- রেন্ডার ফাংশন (যা ড্রপডাউন তৈরি করবে) ---
function renderDetails(applicant, isEdit) {
    const detailsDiv = document.getElementById('detailsSection');
    detailsDiv.innerHTML = '';

    detailFields.forEach(field => {
        const key = field.key;
        let value = applicant[key] || '';

        if (isEdit && field.editable) {
            let inputElement;
            if (field.type === 'select') {
                // ড্রপডাউন লজিক
                let optionsHtml = field.options.map(opt => 
                    `<option value="${opt}" ${opt == value ? 'selected' : ''}>${opt}</option>`
                ).join('');
                inputElement = `<select name="${key}" class="editable-input">${optionsHtml}</select>`;
            } else if (field.type === 'textarea') {
                inputElement = `<textarea name="${key}" class="editable-input">${value}</textarea>`;
            } else if (field.type === 'date') {
                let dateVal = "";
                if (value) {
                    // Remove time part if exists
                    if (value.includes('T')) {
                        dateVal = value.split('T')[0];
                    } else {
                        const parts = value.toString().split(/[-/]/);
                        if (parts.length === 3) {
                            if (parts[0].length === 4) {
                                dateVal = `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
                            } else {
                                dateVal = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
                            }
                        }
                    }
                }
                inputElement = `<input type="date" name="${key}" class="editable-input" value="${dateVal}">`;
            } else {
                inputElement = `<input type="${field.type || 'text'}" name="${key}" class="editable-input" value="${value}">`;
            }
            detailsDiv.innerHTML += `<div class="form-group"><label><strong>${field.label}:</strong></label>${inputElement}</div>`;
        } else {
            // ভিউ মোড
            let displayValue = (field.type === 'date' || key === 'Date_of_Birth') ? formatDateDisplay(value) : (value || 'N/A');
            detailsDiv.innerHTML += `<p><strong>${field.label}:</strong> ${displayValue}</p>`;
        }
    });
}

    document.getElementById('fullEditForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const docId = document.getElementById('editDocId').value;
        const statusMsg = document.getElementById('editStatusMessage');
        statusMsg.textContent = 'Saving to Google Sheets...';
        
        const formData = new FormData(e.target);
        const updates = {};
        detailFields.filter(f => f.editable).forEach(f => {
            updates[f.key] = formData.get(f.key);
        });

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'update', id: docId, updates: updates })
            });
            const result = await response.json();
            if (result.result === 'success') {
                statusMsg.textContent = '✅ Updated Successfully!';
                setTimeout(() => { closeModal('dataModal'); loadData(); }, 1000);
            }
        } catch (error) {
            statusMsg.textContent = '❌ Update Failed!';
        }
    });

    function exportToCSV() {
        if (sheetData.length === 0) return;
        const headers = Object.keys(sheetData[0]);
        const csvRows = [headers.join(",")];
        sheetData.forEach(row => {
            const values = headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`);
            csvRows.push(values.join(","));
        });
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "LB_Data.csv"; a.click();
    }

    function printApplicant() {

  // fields to hide in print
  const hiddenFields = [
    'Case Status',
    'Bank Validation',
    'Payment Agreement Amount',
    'Payment Status',
    'Note / Remarks'
  ];

  // clone details HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = document.getElementById("detailsSection").innerHTML;

  // remove unwanted fields
  tempDiv.querySelectorAll('p').forEach(p => {
    const label = p.querySelector('strong')?.innerText.replace(':','').trim();
    if (hiddenFields.includes(label)) {
      p.remove();
    }
  });

  const detailsHTML = tempDiv.innerHTML;

  // photo
  const photoEl = document.getElementById("applicantPhoto");
  const photoHTML = (photoEl && photoEl.src)
    ? `<img src="${photoEl.src}" />`
    : `<div class="no-photo">No Photo</div>`;

  const name = currentApplicantData.Name || '';

  const win = window.open('', '', 'width=1000,height=900');
  win.document.write(`
    <html>
    <head>
      <title>${name} - Application</title>
      <style>
        body {
          font-family: "Segoe UI", Arial, sans-serif;
          padding: 30px;
          color: #000;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .header h2 {
          margin: 0;
          font-size: 22px;
          letter-spacing: 1px;
        }
        .header p {
          margin: 4px 0 0;
          font-size: 13px;
        }
        .container {
          display: flex;
          gap: 30px;
        }
        .details {
          flex: 2;
        }
        .details p {
          font-size: 14px;
          margin: 6px 0;
        }
        .details strong {
          display: inline-block;
          width: 230px;
        }
        .photo-box {
          flex: 1;
          text-align: center;
        }
        .photo-box img {
          width: 160px;
          height: 200px;
          object-fit: cover;
          border: 1px solid #000;
          border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .no-photo {
          width: 160px;
          height: 200px;
          border: 1px dashed #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }
        .footer {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }
        .footer div {
          border-top: 1px solid #000;
          width: 200px;
          text-align: center;
          padding-top: 5px;
        }
        button { display:none; }
      </style>
    </head>

    <body>
      <div class="header">
        <h2>APPLICATION DETAILS</h2>
        <p>(Computer Generated Copy)</p>
      </div>

      <div class="container">
        <div class="details">
          ${detailsHTML}
        </div>
        <div class="photo-box">
          ${photoHTML}
          <p style="margin-top:8px;font-size:13px;">Applicant Photo</p>
        </div>
      </div>

      <div class="footer">
        <div>Digi World</div>
        <div>Applicant Signature</div>
      </div>
    </body>
    </html>
  `);

  win.document.close();
  win.focus();
  win.print();
}

    document.addEventListener('contextmenu', e => e.preventDefault());