// 1. Cấu hình mật khẩu
const SECRET_PASS = "1234"; 

// 2. Tự động tiêm (inject) giao diện khóa vào trang web
const authHTML = `
<div id="authOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:white; z-index:10000; flex-direction:column; align-items:center; justify-content:center; padding:20px; text-align:center; font-family:sans-serif;">
    <div style="font-size: 60px; margin-bottom:10px;">🔐</div>
    <h2 style="color: #333; margin:10px 0;">XÁC THỰC NHÂN VIÊN</h2>
    <p style="color: #666; font-size: 14px; margin-bottom:20px;">Vui lòng nhập mã định danh để vào hệ thống</p>
    <input type="password" id="passCode" style="width:200px; padding:15px; border:2px solid #ddd; border-radius:10px; text-align:center; font-size:20px; outline:none; margin-bottom:20px;" placeholder="****">
    <button onclick="checkPass()" style="background:#0C9943; color:white; border:none; padding:12px 40px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:16px;">XÁC NHẬN</button>
</div>
`;

// Tự động chèn HTML vào cuối body khi trang load
document.addEventListener("DOMContentLoaded", function() {
    document.body.insertAdjacentHTML('beforeend', authHTML);
    checkAuth();
});

// 3. Logic kiểm tra
function checkAuth() {
    const isUnlocked = localStorage.getItem("app_unlocked");
    if (isUnlocked !== "true") {
        document.getElementById("authOverlay").style.display = "flex";
        document.body.style.overflow = "hidden"; 
    }
}

function checkPass() {
    const input = document.getElementById("passCode").value;
    if (input === SECRET_PASS) {
        localStorage.setItem("app_unlocked", "true");
        location.reload();
    } else {
        alert("Mã định danh không chính xác!");
    }
}
