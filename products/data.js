// products/data.js

// ===== 商品数据 =====
const CATEGORIES = [
    { id: 'all', name: 'All Products' },
    { id: 'fridge', name: 'Refrigeration Series' },
    { id: 'oven', name: 'Bakery Equipment' },
    { id: 'worktable', name: 'Food Processor' },
    { id: 'dishwasher', name: 'Bar&Coffee Series' },
    { id: 'cabinet', name: 'Kitchen Equipment' }
];

const PRODUCTS = [
    {
        id: 'fridge-b2000', //商品型号
        name: 'Commercial Double Door Fridge B-2000', //标题
        description: '304 Stainless Steel · Energy Saving · 3-Year Warranty', //商品描述
        category: 'fridge', //属于的分组
        image: '../images/photo-冰箱.jpg' //照片
    },
    {
        id: 'oven-o300',
        name: '3-Layer Electric Oven O-300',
        description: 'Precise Temperature · Independent Control · For Bakeries',
        category: 'oven',
        image: '../images/photo-冰箱.jpg'
    },
    {
        id: 'worktable-w500',
        name: 'Stainless Steel Worktable W-500',
        description: 'Thick Surface · Anti-Slip · Multi-Functional Rack',
        category: 'worktable',
        image: '../images/photo-冰箱.jpg'
    },
    {
        id: 'dishwasher-d800',
        name: 'Commercial Dishwasher D-800',
        description: 'High-Temp Sanitize · Fast Wash · Water Saving',
        category: 'dishwasher',
        image: '../images/photo-冰箱.jpg'
    },
    {
        id: 'cabinet-s100',
        name: 'Heated Display Cabinet S-100',
        description: 'Double Glass · Constant Temp · For Dessert Shops',
        category: 'cabinet',
        image: '../images/photo-冰箱.jpg'
    },
    {
        id: 'workstation-c600',
        name: 'Modular Workstation C-600',
        description: 'Flexible Design · Space Saving · Customizable',
        category: 'worktable',
        image: '../images/photo-冰箱.jpg'
    },
    {
        id: 'fridge-KF-0.5F-2F',
        name: 'Commercial Upright Double Doors Freezer KF-0.5F-2F',
        description: 'Flexible Design · Space Saving · Customizable',
        category: 'fridge',
        image: '../images/fridge-KF-0.5F-2F.webp'
    }
];
