// --- image-viewer.js ---
let currentScale = 1;
let initialPinchDistance = null;

function showImgs(str) {
    const viewer = document.getElementById('imgViewer');
    const list = document.getElementById('imgList');
    
    // Tách chuỗi thành mảng các tên file ảnh
    const imgs = str.split(/[,\s\n]+/).filter(s => s.includes('.'));
    
    // Đổ ảnh vào (thêm class zoomable-img để thao tác)
    list.innerHTML = imgs.map(src => 
        `<img class="zoomable-img" src="./${src.trim()}" onerror="this.src='https://via.placeholder.com/300x200?text=Lỗi+tải+ảnh+${src}'">`
    ).join('');
    
    viewer.style.display = 'flex';
    currentScale = 1; 
    
    // Gắn sự kiện Zoom cho vùng chứa ảnh
    setupPinchZoom(list);
}

function closeViewer(e) {
    // Chỉ đóng khi chạm vào nền đen hoặc chữ hướng dẫn, không đóng khi đang thao tác trên ảnh
    if (e.target.id === 'imgViewer' || e.target.tagName.toLowerCase() === 'p') {
        document.getElementById('imgViewer').style.display = 'none';
    }
}

function setupPinchZoom(element) {
    element.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            initialPinchDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
        }
    }, { passive: false });

    element.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault(); // Ngăn trình duyệt cuộn trang
            const currentDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            
            const scaleFactor = currentDistance / initialPinchDistance;
            let tempScale = currentScale * scaleFactor;
            
            // Giới hạn zoom từ 1x đến 4x
            tempScale = Math.max(1, Math.min(tempScale, 4));
            
            // Áp dụng hiệu ứng zoom cho tất cả ảnh
            const imgs = element.querySelectorAll('.zoomable-img');
            imgs.forEach(img => {
                img.style.transform = `scale(${tempScale})`;
                img.style.transition = 'none'; // Tắt transition để zoom mượt
            });
        }
    }, { passive: false });

    element.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            // Lưu lại tỷ lệ scale hiện tại khi thả tay
            const img = element.querySelector('.zoomable-img');
            if (img && img.style.transform.includes('scale')) {
                currentScale = parseFloat(img.style.transform.replace('scale(', '').replace(')', ''));
            }
            
            // Bật lại transition để mượt mà nếu có thay đổi khác
            const imgs = element.querySelectorAll('.zoomable-img');
            imgs.forEach(img => {
                img.style.transition = 'transform 0.2s';
            });
        }
    });
}
