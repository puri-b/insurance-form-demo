const form = document.getElementById("appForm");
const modal = document.getElementById("modal");
const previewBox = document.getElementById("previewBox");

function openModal(jsonText){
  previewBox.textContent = jsonText;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function serializeForm(){
  const fd = new FormData(form);
  const data = {};
  for (const [k,v] of fd.entries()){
    // trim strings
    data[k] = typeof v === "string" ? v.trim() : v;
  }

  // beneficiaries table
  data.beneficiaries = collectBeneficiaries();

  return data;
}

function copyToClipboard(text){
  navigator.clipboard.writeText(text).then(()=>{
    alert("คัดลอก JSON แล้ว");
  }).catch(()=>{
    alert("คัดลอกไม่สำเร็จ (เบราว์เซอร์ไม่อนุญาต)");
  });
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

  tr.querySelector("button").addEventListener("click", ()=>{
    tr.remove();
  });

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

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* init with 1 row */
addBenefRow();

/* ===== Buttons ===== */
document.getElementById("btnPreview").addEventListener("click", ()=>{
  const data = serializeForm();
  openModal(JSON.stringify(data, null, 2));
});
document.getElementById("btnPreview2").addEventListener("click", ()=>{
  const data = serializeForm();
  openModal(JSON.stringify(data, null, 2));
});

document.getElementById("btnCopyJson").addEventListener("click", ()=>{
  const data = serializeForm();
  copyToClipboard(JSON.stringify(data, null, 2));
});
document.getElementById("btnCopyJson2").addEventListener("click", ()=>{
  copyToClipboard(previewBox.textContent || "");
});

document.getElementById("btnReset").addEventListener("click", ()=>{
  if(!confirm("ต้องการล้างฟอร์มทั้งหมดหรือไม่?")) return;
  form.reset();
  benefTbody.innerHTML = "";
  addBenefRow();
});

document.getElementById("btnFillDemo").addEventListener("click", ()=>{
  // demo values (fictional)
  form.elements["barcode"].value = "U14400-DEMO-0001";
  form.elements["branch"].value = "สำนักงานใหญ่";
  form.elements["agent_code"].value = "AG-001 / Unit-01";
  form.elements["application_type"].value = "แบบมาตรฐาน / สุขภาพ";
  form.elements["received_date"].valueAsDate = new Date();

  form.elements["insured_title"].value = "นางสาว";
  form.elements["insured_firstname"].value = "ศิริพร";
  form.elements["insured_lastname"].value = "ใจดี";
  form.elements["insured_gender"].value = "หญิง";
  form.elements["insured_dob"].value = "1995-06-15";
  form.elements["insured_age"].value = "29";
  form.elements["insured_id"].value = "1234567890123";
  form.elements["insured_nationality"].value = "ไทย";
  form.elements["insured_marital"].value = "โสด";
  form.elements["insured_email"].value = "demo@example.com";
  form.elements["insured_mobile"].value = "0812345678";

  form.elements["addr_registered"].value = "99/1 ถนนสุขุมวิท แขวงบางนา เขตบางนา กรุงเทพฯ 10260";
  form.elements["addr_current"].value = "คอนโดตัวอย่าง ชั้น 8 เขตบางนา กรุงเทพฯ 10260";
  form.elements["addr_work"].value = "บริษัทตัวอย่าง จำกัด เขตบางนา กรุงเทพฯ 10260";
  form.elements["addr_contact_choice"].value = "ที่อยู่ปัจจุบัน";

  form.elements["insured_job"].value = "พนักงานออฟฟิศ";
  form.elements["insured_position"].value = "เจ้าหน้าที่";
  form.elements["insured_job_desc"].value = "งานเอกสาร/ประสานงาน";
  form.elements["insured_income_year"].value = "480000";

  form.elements["plan_name"].value = "แผนคุ้มครองชีวิต + สัญญาเพิ่มเติมสุขภาพ";
  form.elements["sum_assured"].value = "500000";
  form.elements["total_premium"].value = "18000";
  form.elements["pay_frequency"].value = "รายปี";
  form.elements["pay_method"].value = "โอน/อื่นๆ";
  // pay_method option doesn't include "โอน/อื่นๆ" by default; keep it empty or set to "อื่นๆ"
  form.elements["pay_method"].value = "อื่นๆ";
  form.elements["paid_amount"].value = "18000";
  form.elements["temp_receipt_no"].value = "TMP-2025-000123";
  form.elements["payer_name"].value = "ศิริพร ใจดี";
  form.elements["payer_job"].value = "พนักงานออฟฟิศ";
  form.elements["payer_relation"].value = "ตนเอง";

  form.elements["bank_transfer_consent"].value = "ยินยอม/ประสงค์โอนเข้าบัญชี";
  form.elements["bank_account_name"].value = "ศิริพร ใจดี";
  form.elements["bank_name"].value = "ธนาคารตัวอย่าง";
  form.elements["bank_account_no"].value = "123-4-56789-0";

  benefTbody.innerHTML = "";
  addBenefRow({name:"มารดา ใจดี", id:"9876543210987", age:"55", relation:"มารดา", address:"กรุงเทพฯ", percent:"100"});

  form.elements["health_history_any"].value = "ไม่เคย";
  form.elements["smoking"].value = "ไม่เคย";
  form.elements["alcohol"].value = "เคย";
  form.elements["disease_group"].value = "ไม่มี";
  form.elements["hiv"].value = "ไม่เคย";
  form.elements["pregnant_status"].value = "ไม่ตั้งครรภ์";

  form.elements["us_person"].value = "ไม่ใช่ US Person";
  form.elements["fatca_consent"].value = "ยินยอม";

  form.elements["sign_province"].value = "กรุงเทพมหานคร";
  form.elements["sign_date"].valueAsDate = new Date();
  form.elements["sign_insured_name"].value = "ศิริพร ใจดี";
});

btnAddBenef.addEventListener("click", ()=> addBenefRow());

/* modal close */
modal.addEventListener("click", (e)=>{
  const t = e.target;
  if (t?.dataset?.close === "1") closeModal();
});
document.addEventListener("keydown", (e)=>{
  if(e.key === "Escape") closeModal();
});
