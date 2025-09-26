// 产品弹窗数据
const products = {
    product1: {
        title: "Commercial Double Door Fridge B-2000",
        image: "images/product1.jpg",
        specs: [
            "Capacity: 800L",
            "Material: 304 Stainless Steel",
            "Cooling: Fan Cooling, Frost-Free",
            "Noise: <45dB",
            "Warranty: 3 Years"
        ],
        desc: "Ideal for medium to large restaurants and hotel kitchens. Dual temperature zones, energy-saving and quiet operation for high-intensity commercial use."
    },
    product2: {
        title: "3-Layer Electric Oven O-300",
        image: "images/product2.jpg",
        specs: [
            "Layers: 3 Independent Zones",
            "Temp Range: 30-300℃",
            "Timer: 0-120 mins",
            "Power: 9kW",
            "Warranty: 2 Years"
        ],
        desc: "Professional baking equipment with precise temperature control and hot air circulation, perfect for bakeries and pastry shops."
    },
    product3: {
        title: "Stainless Steel Worktable W-500",
        image: "images/product3.jpg",
        specs: [
            "Thickness: 1.2mm",
            "Size: 1800×800×850mm",
            "With Hanging Rod/Shelf",
            "Anti-Slip Feet",
            "Warranty: 5 Years"
        ],
        desc: "Thick stainless steel surface, corrosion-resistant and easy to clean. Ergonomic design improves kitchen efficiency."
    },
    product4: {
        title: "Commercial Dishwasher D-800",
        image: "images/product4.jpg",
        specs: [
            "Capacity: 80 Baskets/Hour",
            "Water Temp: 65-85℃",
            "Water Saving Design",
            "Auto Waste Removal",
            "Warranty: 2 Years"
        ],
        desc: "High-temperature sanitization, powerful degreasing, reduces labor cost. Ideal for restaurants and canteens."
    },
    product5: {
        title: "Heated Display Cabinet S-100",
        image: "images/product5.jpg",
        specs: [
            "Temp: 30-60℃ Adjustable",
            "Glass: Double Anti-Fog",
            "Lighting: LED Strip",
            "Capacity: 100L",
            "Warranty: 2 Years"
        ],
        desc: "Designed for dessert shops and cafes. Constant temperature preservation enhances product display and boosts sales."
    },
    product6: {
        title: "Modular Workstation C-600",
        image: "images/product6.jpg",
        specs: [
            "Modular Design",
            "Customizable Layout",
            "With Sink/Cutting Board",
            "Mobile Casters",
            "Warranty: 3 Years"
        ],
        desc: "Flexible adaptation to different kitchen layouts, space-saving, efficiency-boosting. Supports full customization."
    }
};

// 打开产品弹窗
function openModal(productId) {
    const product = products[productId];
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h2>${product.title}</h2>
        <img src="${product.image}" alt="${product.title}" style="width:100%; max-height:400px; object-fit:contain; margin:20px 0;">
        <h3>Specifications</h3>
        <ul>
            ${product.specs.map(spec => `<li>${spec}</li>`).join('')}
        </ul>
        <h3>Description</h3>
        <p>${product.desc}</p>
    `;
    
    modal.style.display = 'block';
}

// 关闭产品弹窗
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// 打开联系弹窗
function openContactModal() {
    document.getElementById('contactModal').style.display = 'block';
}

// 关闭联系弹窗
function closeContactModal() {
    document.getElementById('contactModal').style.display = 'none';
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const productModal = document.getElementById('productModal');
    const contactModal = document.getElementById('contactModal');
    if (event.target == productModal) {
        productModal.style.display = 'none';
    }
    if (event.target == contactModal) {
        contactModal.style.display = 'none';
    }
}

// 平滑滚动
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        document.querySelector(targetId).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
