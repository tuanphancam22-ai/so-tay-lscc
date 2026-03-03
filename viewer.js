// Giao diện trình xem PDF nhúng
const viewerHTML = `
<div id="pdfViewer" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:20000; flex-direction:column;">
    <div style="background:#fff; padding:10px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #ddd;">
        <span id="pdfTitle" style="font-weight:bold; font-size:14px; color:#333; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:70%;">Đang xem tài liệu</span>
        <button onclick="closePDF()" style="background:#d93025; color:white; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer;">ĐÓNG X</button>
    </div>
    <iframe id="pdfFrame" src="" style="width:100%; flex-grow:1; border:none;"></iframe>
</div>
`;

// Chèn giao diện vào trang khi load
document.addEventListener("DOMContentLoaded", function() {
    document.body.insertAdjacentHTML('beforeend', viewerHTML);
});

function openPDF(url, title) {
    let finalUrl = url;
    // Chuyển đổi link Drive sang link nhúng nếu cần
    if (url.includes('drive.google.com')) {
        const fileId = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
        if (fileId) {
            finalUrl = `https://docs.google.com/viewer?url=https://drive.google.com/uc?id=${fileId[1]}&embedded=true`;
        }
    } else if (url.toLowerCase().endsWith('.pdf')) {
        finalUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }

    document.getElementById('pdfFrame').src = finalUrl;
    document.getElementById('pdfTitle').innerText = title;
    document.getElementById('pdfViewer').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Khóa cuộn trang chính
}

function closePDF() {
    document.getElementById('pdfViewer').style.display = 'none';
    document.getElementById('pdfFrame').src = '';
    document.body.style.overflow = 'auto'; // Mở lại cuộn trang
}
