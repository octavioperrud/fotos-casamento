const EVENT_CODE="CASAMENTO-JANAINA-OCTAVIO-2026";
let scanner;
const start=document.querySelector("#start"), scannerBox=document.querySelector("#scanner"), upload=document.querySelector("#upload");
document.querySelector("#scan").onclick=async()=>{
 start.classList.add("hidden");scannerBox.classList.remove("hidden");scanner=new Html5Qrcode("reader");
 try{await scanner.start({facingMode:"environment"},{fps:10,qrbox:{width:250,height:250}},async text=>{
  await scanner.stop();scanner.clear();
  if(text.trim()===EVENT_CODE){scannerBox.classList.add("hidden");upload.classList.remove("hidden")}
  else{alert("❌ QR Code inválido");scannerBox.classList.add("hidden");start.classList.remove("hidden")}
 },()=>{})}catch(e){alert("Permita o acesso à câmera.");scannerBox.classList.add("hidden");start.classList.remove("hidden")}
};
document.querySelector("#cancel").onclick=async()=>{try{await scanner.stop();scanner.clear()}catch(e){}scannerBox.classList.add("hidden");start.classList.remove("hidden")};
const input=document.querySelector("#photo"),preview=document.querySelector("#preview"),send=document.querySelector("#send");
input.onchange=()=>{let f=input.files[0];if(!f)return;preview.src=URL.createObjectURL(f);preview.classList.remove("hidden");send.disabled=false};
send.onclick=()=>{document.querySelector("#msg").innerHTML="✅ Foto selecionada!<br><small>Esta versão ainda será conectada ao armazenamento.</small>"};
