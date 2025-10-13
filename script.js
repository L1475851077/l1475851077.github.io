// 产品弹窗数据（增强版）
const products = {
    product1: {
        title: "Commercial Double Door Fridge B-2000",
        subtitle: "304 Stainless Steel · Energy Saving · 3-Year Warranty",
        image: "images/product1.jpg",
        features: [
            "Full 304 food-grade stainless steel interior & exterior",
            "Dual evaporator system for stable temperature",
            "Energy-efficient compressor (R290 refrigerant)",
            "Adjustable shelves, 800L total capacity",
            "Factory direct – no middleman markup"
        ],
        specs: {
            "Model": "B-2000",
            "Capacity": "800L",
            "Material": "304 Stainless Steel",
            "Cooling System": "Fan Cooling, Frost-Free",
            "Noise Level": "<45dB",
            "Warranty": "3 Years Global"
        },
        desc: "Ideal for medium to large restaurants and hotel kitchens. Dual temperature zones, energy-saving and quiet operation for high-intensity commercial use. We offer free kitchen layout design to optimize your space."
    },
    product2: {
        title: "3-Layer Electric Oven O-300",
        subtitle: "Precise Temperature · Independent Control · For Bakeries",
        image: "images/product2.jpg",
        features: [
            "3 independent heating chambers with ±1°C accuracy",
            "Digital PID controller with timer (0–120 mins)",
            "Hot air circulation for even baking",
            "9 standard trays included",
            "Global shipping & installation support"
        ],
        specs: {
            "Model": "O-300",
            "Layers": "3 Independent Zones",
            "Temperature Range": "30–300℃",
            "Timer": "0–120 mins",
            "Power": "9kW",
            "Warranty": "2 Years"
        },
        desc: "Professional baking equipment with precise temperature control and hot air circulation, perfect for bakeries and pastry shops. Custom sizes available upon request."
    },
    product3: {
        title: "Stainless Steel Worktable W-500",
        subtitle: "Thick Surface · Anti-Slip · Multi-Functional Rack",
        image: "images/product3.jpg",
        features: [
            "1.2mm thick 304 stainless steel top",
            "Anti-slip edge and adjustable feet",
            "Integrated hanging rod & under-shelf",
            "Corrosion-resistant, easy to clean",
            "5-year structural warranty"
        ],
        specs: {
            "Model": "W-500",
            "Thickness": "1.2mm",
            "Standard Size": "1800×800×850mm",
            "Accessories": "Hanging Rod / Shelf",
            "Feet": "Anti-Slip, Adjustable",
            "Warranty": "5 Years"
        },
        desc: "Thick stainless steel surface, corrosion-resistant and easy to clean. Ergonomic design improves kitchen efficiency. Custom lengths (1.2m–3m) available."
    },
    product4: {
        title: "Commercial Dishwasher D-800",
        subtitle: "High-Temp Sanitize · Fast Wash · Water Saving",
        image: "images/product4.jpg",
        features: [
            "80°C high-temperature sanitization",
            "80 baskets/hour capacity",
            "Auto waste removal system",
            "Water-saving spray technology",
            "24/7 after-sales support"
        ],
        specs: {
            "Model": "D-800",
            "Capacity": "80 Baskets/Hour",
            "Wash Temperature": "65–85℃",
            "Water System": "Water Saving Design",
            "Waste Handling": "Auto Waste Removal",
            "Warranty": "2 Years"
        },
        desc: "High-temperature sanitization, powerful degreasing, reduces labor cost. Ideal for restaurants and canteens. Free on-site installation guidance."
    },
    product5: {
        title: "Heated Display Cabinet S-100",
        subtitle: "Double Glass · Constant Temp · For Dessert Shops",
        image: "images/product5.jpg",
        features: [
            "Double anti-fog tempered glass",
            "30–60°C adjustable temperature",
            "LED strip lighting for product highlight",
            "100L display capacity",
            "Energy-efficient heating system"
        ],
        specs: {
            "Model": "S-100",
            "Temperature": "30–60℃ Adjustable",
            "Glass": "Double Anti-Fog",
            "Lighting": "LED Strip",
            "Capacity": "100L",
            "Warranty": "2 Years"
        },
        desc: "Designed for dessert shops and cafes. Constant temperature preservation enhances product display and boosts sales. Custom branding panel available."
    },
    product6: {
        title: "Modular Workstation C-600",
        subtitle: "Flexible Design · Space Saving · Customizable",
        image: "images/product6.jpg",
        features: [
            "L/U/I shape configuration options",
            "Integrated sink, cutting board, or storage",
            "Mobile casters with lock",
            "Space-saving for small kitchens",
            "Free layout design service included"
        ],
        specs: {
            "Model": "C-600",
            "Design": "Modular & Customizable",
            "Layout": "Flexible (L/U/I Shape)",
            "Components": "Sink / Cutting Board / Rack",
            "Mobility": "With Lockable Casters",
            "Warranty": "3 Years"
        },
        desc: "Flexible adaptation to different kitchen layouts, space-saving, efficiency-boosting. Supports full customization. Our engineers will design your ideal workstation at no cost."
    }
};

// 打开产品弹窗
function openModal(productId) {
    const product = products[productId];
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');

    let specsHtml = '<table class="specs-table">';
    for (const [key, value] of Object.entries(product.specs)) {
        specsHtml += `<tr><td>${key}</td><td>${value}</td></tr>`;
    }
    specsHtml += '</table>';

    modalBody.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">
            <img src="${product.image}" alt="${product.title}" style="width:100%; max-height:400px; object-fit:contain; border-radius:8px;">
            <div>
                <h2 style="font-size:1.6rem; margin-bottom:8px;">${product.title}</h2>
                <p style="color:#d63031; font-weight:500; margin-bottom:15px;">${product.subtitle}</p>
                <h3 style="margin:15px 0 10px; font-size:1.3rem;">Key Features</h3>
                <ul style="padding-left:20px; margin-bottom:15px;">
                    ${product.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
                <h3 style="margin:15px 0 10px; font-size:1.3rem;">Technical Specifications</h3>
                ${specsHtml}
                <h3 style="margin:15px 0 10px; font-size:1.3rem;">Description</h3>
                <p>${product.desc}</p>
                <div style="margin-top:20px; padding-top:15px; border-top:1px solid #eee;">
                    <a href="#contact" class="btn" style="display:inline-block;" onclick="closeModal()">Send Inquiry</a>
                    <p style="font-size:0.9rem; color:#666; margin-top:10px;">We offer <strong>free kitchen layout design</strong> for all orders.</p>
                </div>
            </div>
        </div>
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
    if (event.target === productModal) {
        productModal.style.display = 'none';
    }
    if (event.target === contactModal) {
        contactModal.style.display = 'none';
    }
}

// 平滑滚动
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId.startsWith('#')) {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                closeModal();
                closeContactModal();
            }
        }
    });
});
