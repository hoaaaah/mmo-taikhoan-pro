let currentProduct = '';
let currentPrice = '';
let orderStep = 1; // 1: nhập thông tin, 2: xác nhận chuyển khoản

function openModal(productName, price) {
    currentProduct = productName;
    currentPrice = price;
    document.getElementById('modalProduct').innerHTML = `
        <h3>${productName}</h3>
        <p><strong>Giá: ${price}</strong></p>
    `;
    document.getElementById('orderModal').style.display = 'block';
    document.getElementById('order-info-fields').style.display = 'block';
    document.getElementById('bank-transfer-qr').style.display = 'none';
    document.getElementById('waiting-confirm').style.display = 'none';
    document.getElementById('order-submit-btn').innerText = 'Đặt hàng ngay';
    orderStep = 1;
}

function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
    document.getElementById('bank-transfer-qr').style.display = 'none';
}

async function submitOrder(event) {
    event.preventDefault();

    if (orderStep === 1) {
        const customerName = document.getElementById('customerName').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerEmail = document.getElementById('customerEmail').value;

        if (!customerName || !customerPhone || !customerEmail) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        document.getElementById('order-info-fields').style.display = 'none';
        showBankQR(customerName);
        document.getElementById('order-submit-btn').innerText = 'Xác nhận đã chuyển khoản';
        orderStep = 2;
        alert('Vui lòng chuyển khoản theo thông tin bên dưới và upload ảnh chuyển khoản để hoàn tất đơn hàng!');
    } else if (orderStep === 2) {
        const paymentProof = document.getElementById('paymentProof').files[0];
        if (!paymentProof) {
            alert('Vui lòng upload ảnh chuyển khoản!');
            return;
        }

        if (paymentProof.size > 10 * 1024 * 1024) {
            alert('File ảnh quá lớn! Vui lòng chọn file dưới 10MB.');
            return;
        }

        const customerName = document.getElementById('customerName').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerEmail = document.getElementById('customerEmail').value;

        const formData = new FormData();
        formData.append('customerName', customerName);
        formData.append('customerPhone', customerPhone);
        formData.append('customerEmail', customerEmail);
        formData.append('product', currentProduct);
        formData.append('paymentProof', paymentProof);

        console.log('Sending FormData:', {
            customerName,
            customerPhone,
            customerEmail,
            product: currentProduct,
            paymentProof: paymentProof.name
        });

        try {
            const response = await fetch('https://server-banhang12.onrender.com/api/order', {
                method: 'POST',
                body: formData
            });

            // Log raw response text for debugging
            const responseText = await response.text();
            console.log('Raw server response:', responseText);

            // Try parsing as JSON
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                alert('Phản hồi server không hợp lệ. Vui lòng thử lại sau! Chi tiết: ' + responseText.substring(0, 100));
                return;
            }

            console.log('Parsed server response:', result);

            if (result.success) {
                document.getElementById('bank-transfer-qr').style.display = 'none';
                document.getElementById('waiting-confirm').style.display = 'block';
                document.getElementById('order-submit-btn').style.display = 'none';
                orderStep = 3;
            } else {
                alert('Có lỗi xảy ra: ' + (result.message || 'Không nhận được phản hồi hợp lệ từ server'));
            }
        } catch (err) {
            console.error('Fetch error:', err);
            alert('Không thể gửi đơn hàng. Vui lòng thử lại sau! Chi tiết lỗi: ' + err.message);
        }
    }
}

function showBankQR(name) {
    const content = `MUA ${currentProduct} - ${name}`;
    document.getElementById('bank-transfer-content').innerText = content;
    const bank = 'MB';
    const account = '701235';
    const template = `https://img.vietqr.io/image/${bank}-${account}-compact2.png?amount=&addInfo=${encodeURIComponent(content)}&accountName=LE%20QUOC%20CHIEN`;
    document.getElementById('bank-qr-img').src = template;
    document.getElementById('bank-transfer-qr').style.display = 'block';
}

// Smooth scrolling cho navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Đóng modal khi click bên ngoài
window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all product cards and feature items
document.querySelectorAll('.product-card, .feature-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
