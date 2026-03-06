// --- image-viewer.js v2.0 (Slider + Zoom + Pan) ---
let scale = 1;
let pointX = 0;
let pointY = 0;
let start = { x: 0, y: 0 };
let isZooming = false;

function showImgs(str) {
    const viewer = document.getElementById('imgViewer');
    const list = document.getElementById('imgList');
    const imgs = str.split(/[,\s\n]+/).filter(s => s.includes('.'));
    
    // Reset trạng thái
    scale = 1; pointX = 0; pointY = 0;
    
    // Tạo cấu trúc Slider
    list.innerHTML = `
        <div id="imgSlider" style="display:flex; transition: transform 0.3s ease; width: ${imgs.length * 100}%;">
            ${imgs.map(src => `
                <div style="width: 100vw; display:flex; justify-content:center; align-items:center; overflow:hidden;">
                    <img class="zoom-img" src="./${src.trim()}" 
                         style="max-width:95%; max-height:70vh; transform: translate(0px, 0px) scale(1); transition: 0.2s;"
                         onerror="this.src='https://via.placeholder.com/300x200?text=Lỗi+tải+ảnh+${src}'">
                </div>
            `).join('')}
        </div>
        ${imgs.length > 1 ? `
            <div style="position:absolute; bottom:100px; width:100%; display:flex; justify-content:center; gap:30px;">
                <button onclick="moveSlide(-1)" style="padding:10px 20px; border-radius:50%; border:none; background:rgba(255,255,255,0.3); color:white; font-size:24px;">❮</button>
                <button onclick="moveSlide(1)" style="padding:10px 20px; border-radius:50%; border:none; background:rgba(255,255,255,0.3); color:white; font-size:24px;">❯</button>
            </div>
        ` : ''}
    `;
    
    viewer.style.display = 'flex';
    initZoomEvents();
}

let currentSlide = 0;
function moveSlide(dir) {
    const slider = document.getElementById('imgSlider');
    const totalSlides = slider.children.length;
    currentSlide = Math.max(0, Math.min(currentSlide + dir, totalSlides - 1));
    slider.style.transform = `translateX(-${(currentSlide * 100) / totalSlides}%)`;
    // Reset zoom khi chuyển slide
    scale = 1; pointX = 0; pointY = 0;
    updateTransform();
}

function initZoomEvents() {
    const viewer = document.getElementById('imgViewer');
    
    viewer.ontouchstart = function(e) {
        if (e.touches.length === 1) {
            start = { x: e.touches[0].clientX - pointX, y: e.touches[0].clientY - pointY };
        } else if (e.touches.length === 2) {
            isZooming = true;
            start.dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        }
    };

    viewer.ontouchmove = function(e) {
        e.preventDefault();
        if (e.touches.length === 1 && scale > 1) {
            pointX = e.touches[0].clientX - start.x;
            pointY = e.touches[0].clientY - start.y;
        } else if (e.touches.length === 2) {
            let dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            scale = Math.min(Math.max(1, (dist / start.dist) * scale), 4);
            start.dist = dist;
        }
        updateTransform();
    };

    viewer.ontouchend = function() { isZooming = false; };
}

function updateTransform() {
    const activeImg = document.querySelectorAll('.zoom-img')[currentSlide];
    if (activeImg) {
        activeImg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    }
}

function closeViewer(e) {
    // Chỉ đóng khi bấm vào vùng trống hoặc nút đóng, không đóng khi đang zoom
    if (e.target.id === 'imgViewer' || e.target.tagName === 'P') {
        document.getElementById('imgViewer').style.display = 'none';
        currentSlide = 0;
    }
}
