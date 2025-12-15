const form = document.getElementById("appForm");
const modal = document.getElementById("modal");
const previewBox = document.getElementById("previewBox");

const applicantType = document.getElementById("applicant_type");
const applicationType = document.getElementById("application_type");

const secMinor = document.getElementById("sec-minor");
const secAdult = document.getElementById("sec-adult");
const secSio = document.getElementById("sec-sio");
const secUnit = document.getElementById("sec-unit");

const modeText = document.getElementById("modeText");

function openModal(jsonText){
  previewBox.textContent = jsonText;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* ===== Beneficiaries dynamic rows ===== */
const benefTbody = document.querySelector("#benefTable tbody");
const btnAddBenef = document.getElementById("btnAddBenef");

function addBenefRow(prefill = {}){
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" placeholder="ชื่อ-สกุล" value="${escapeHtml(prefill.name || "")}"></td>
    <td><input type="text" placeholder="เลขบัตร" value="${escapeHtml(prefill.id || "")}"></td>
    <td><input type="number" min="0" placeholder="อายุ" value="${escapeHtml(prefill.age || "")}"></td>
    <td><input type="text" placeholder="ความสัมพันธ์" value="${escapeHtml(prefill.relation || "")}"></td>
    <td><textarea rows="2" placeholder="ที่อยู่">${escapeHtml(prefill.address || "")}</textarea></td>
    <td><input type="number" min="0" max="100" placeholder="%" value="${escapeHtml(prefill.percent || "")}"></td>
    <td><button type="button" class="icon-btn" title="ลบแถว">🗑️</button></td>
  `;
  tr.querySelector("button").addEventListener("click", ()=> tr.remove());
  benefTbody.appendChild(tr);
}

function collectBeneficiaries(){
  const rows = [...benefTbody.querySelectorAll("tr")];
  return rows.map(r=>{
    const tds = r.querySelectorAll("td");
    return {
      name: tds[0].querySelector("input").value.trim(),
      id: tds[1].querySelector("input").value.trim(),
      age: tds[2].querySelector("input").value.trim(),
      relation: tds[3].querySelector("input").value.trim(),
      address: tds[4].querySelector("textarea").value.trim(),
      percent: tds[5].querySelector("input").value.trim()
    };
  }).filter(b => Object.values(b).some(v => v !== ""));
}

/* init with 1 row */
addBenefRow();

/* ===== Serialize ===== */
function serializeForm(){
  const fd = new FormData(form);
  const data = {};
  for (const [k,v] of fd.entries()){
    data[k] = typeof v === "string" ? v.trim() : v;
  }
  data.beneficiaries = collectBeneficiaries();
  return data;
}

/* ===== UX: Show/hide sections ===== */
function setHidden(el, yes){
  if(!el) return;
  el.classList.toggle("hidden", !!yes);
}

function syncSections(){
  const at = applicantType?.value;
  const ft = applicationType?.value;

  // applicant type
  if(at === "minor"){
    setHidden(secMinor, false);
    setHidden(secAdult, true);
    if(modeText) modeText.textContent = "ผู้เยาว์ (ข้อ 6–14)";
  }else if(at === "adult"){
    setHidden(secMinor, true);
    setHidden(secAdult, false);
    if(modeText) modeText.textContent = "ผู้เอาประกัน 16+ (ข้อ 15–28)";
  }else{
    // default: show adult (common use), but still hide both if user hasn't picked
    setHidden(secMinor, true);
    setHidden(secAdult, false);
    if(modeText) modeText.textContent = "ผู้เอาประกัน 16+ (ข้อ 15–28)";
  }

  // form type
  setHidden(secSio, ft !== "sio");
  setHidden(secUnit, ft !== "unit");
}

applicantType?.addEventListener("change", syncSections);
applicationType?.addEventListener("change", syncSections);
syncSections();

/* ===== Buttons ===== */
document.getElementById("btnPreview").addEventListener("click", ()=>{
  openModal(JSON.stringify(serializeForm(), null, 2));
});
document.getElementById("btnPreview2").addEventListener("click", ()=>{
  openModal(JSON.stringify(serializeForm(), null, 2));
});

function copyToClipboard(text){
  navigator.clipboard.writeText(text).then(()=>{
    alert("คัดลอก JSON แล้ว");
  }).catch(()=>{
    alert("คัดลอกไม่สำเร็จ (เบราว์เซอร์ไม่อนุญาต)");
  });
}

document.getElementById("btnCopyJson").addEventListener("click", ()=>{
  copyToClipboard(JSON.stringify(serializeForm(), null, 2));
});
document.getElementById("btnCopyJson2").addEventListener("click", ()=>{
  copyToClipboard(previewBox.textContent || "");
});

document.getElementById("btnReset").addEventListener("click", ()=>{
  if(!confirm("ต้องการล้างฟอร์มทั้งหมดหรือไม่?")) return;
  form.reset();
  benefTbody.innerHTML = "";
  addBenefRow();
  syncSections();
});

/* demo fill */
document.getElementById("btnFillDemo").addEventListener("click", ()=>{
  // choose mode
  applicantType.value = "adult";
  applicationType.value = "standard";
  syncSections();

  form.elements["barcode"].value = "U14400-DEMO-0001";
  form.elements["branch"].value = "สำนักงานใหญ่";
  form.elements["received_date"].valueAsDate = new Date();
  form.elements["unit_name"].value = "หน่วยตัวอย่าง";
  form.elements["agent_name"].value = "คุณเอ";
  form.elements["agent_code"].value = "AG-001";
  form.elements["investor_contact_codes"].value = "IC-0001, IC-0002";
  form.elements["attachments_pack"].value = "id_house";

  // insured
  form.elements["insured_title"].value = "นางสาว";
  form.elements["insured_firstname"].value = "ศิริพร";
  form.elements["insured_lastname"].value = "ใจดี";
  form.elements["insured_gender"].value = "หญิง";
  form.elements["insured_dob"].value = "1995-06-15";
  form.elements["insured_age"].value = "29";
  form.elements["insured_id"].value = "1234567890123";
  form.elements["insured_race"].value = "ไทย";
  form.elements["insured_nationality"].value = "ไทย";
  form.elements["insured_marital"].value = "โสด";
  form.elements["insured_email"].value = "demo@example.com";
  form.elements["insured_mobile"].value = "0812345678";

  form.elements["addr_registered"].value = "99/1 ถนนสุขุมวิท แขวงบางนา เขตบางนา กรุงเทพฯ 10260";
  form.elements["addr_current"].value = "คอนโดตัวอย่าง ชั้น 8 เขตบางนา กรุงเทพฯ 10260";
  form.elements["addr_work"].value = "บริษัทตัวอย่าง จำกัด เขตบางนา กรุงเทพฯ 10260";
  form.elements["addr_contact_choice"].value = "ที่อยู่ปัจจุบัน";

  form.elements["job_main"].value = "พนักงานออฟฟิศ";
  form.elements["job_main_position"].value = "เจ้าหน้าที่";
  form.elements["job_main_income_year"].value = "480000";
  form.elements["job_main_desc"].value = "งานเอกสาร/ประสานงาน";
  form.elements["job_main_business"].value = "บริการ";

  // policy
  form.elements["policy_category"].value = "other";
  form.elements["plan_name"].value = "แผนคุ้มครองชีวิต + สัญญาเพิ่มเติมสุขภาพ";
  form.elements["sum_assured"].value = "500000";
  form.elements["total_premium"].value = "18000";
  form.elements["policy_term_year"].value = "20";
  form.elements["pay_term_year"].value = "20";
  form.elements["dividend_type"].value = "none";
  form.elements["bank_transfer_consent"].value = "yes";
  form.elements["bank_account_name"].value = "ศิริพร ใจดี";
  form.elements["bank_name"].value = "ธนาคารตัวอย่าง";
  form.elements["bank_account_no"].value = "123-4-56789-0";

  form.elements["paid_amount"].value = "18000";
  form.elements["temp_receipt_no"].value = "TMP-2025-000123";
  form.elements["pay_method"].value = "อื่นๆ";
  form.elements["pay_frequency"].value = "รายปี";
  form.elements["payer_name"].value = "ศิริพร ใจดี";
  form.elements["payer_job"].value = "พนักงานออฟฟิศ";
  form.elements["payer_relation"].value = "ตนเอง";

  // beneficiaries
  benefTbody.innerHTML = "";
  addBenefRow({name:"มารดา ใจดี", id:"9876543210987", age:"55", relation:"มารดา", address:"กรุงเทพฯ", percent:"100"});

  // adult Q
  form.elements["q15_has_policy"].value = "ไม่มี";
  form.elements["q16_reject"].value = "ไม่เคย";
  form.elements["q17_drug_case"].value = "ไม่เคย";
  form.elements["q18_drug_use"].value = "ไม่เคย";
  form.elements["q19_alcohol"].value = "เคย";
  form.elements["q20_smoke"].value = "ไม่เคย";
  form.elements["q21_height_cm"].value = "172";
  form.elements["q21_weight_kg"].value = "60";
  form.elements["q21_weight_change"].value = "ไม่เปลี่ยน";
  form.elements["q22_family_disease"].value = "ไม่เป็น";
  form.elements["q23_spouse_hiv"].value = "ไม่เป็น";
  form.elements["q25_has_symptom"].value = "ไม่เคย/ไม่มี";
  form.elements["q26_1_exam"].value = "ไม่เคย";
  form.elements["q26_2_hospital"].value = "ไม่เคย";
  form.elements["q27_has_extra_health"].value = "ไม่เคย";

  // FATCA / sign
  form.elements["us_person"].value = "ไม่ใช่ US Person";
  form.elements["fatca_consent"].value = "ยินยอม";
  form.elements["sign_province"].value = "กรุงเทพมหานคร";
  form.elements["sign_date"].valueAsDate = new Date();
  form.elements["sign_insured_name"].value = "ศิริพร ใจดี";
  form.elements["confirm_accept"].value = "accept";
});

/* add beneficiary */
btnAddBenef.addEventListener("click", ()=> addBenefRow());

/* modal close */
modal.addEventListener("click", (e)=>{
  const t = e.target;
  if (t?.dataset?.close === "1") closeModal();
});
document.addEventListener("keydown", (e)=>{
  if(e.key === "Escape") closeModal();
});
