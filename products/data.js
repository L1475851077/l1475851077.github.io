var CATEGORIES = [
    {
        "id": "all",
        "name": "All Products"
    },
    {
        "id": "fridge",
        "name": "Refrigeration Series"
    },
    {
        "id": "oven",
        "name": "Bakery Equipment"
    },
    {
        "id": "worktable",
        "name": "Food Processor"
    },
    {
        "id": "dishwasher",
        "name": "Bar&Coffee Series"
    },
    {
        "id": "cabinet",
        "name": "Kitchen Equipment"
    }
];

var PRODUCTS = [
    {
        "id": "fridge-b2000",
        "name": "冰箱Commercial Double Door Fridge B-2000",
        "description": "304-5 Stainless Steel · Energy Saving · 3-Year Warranty",
        "category": "fridge",
        "image": "/products/product_details/product_images/fridge/img_1773138956328.jpg",
        "isHot": true
    },
    {
        "id": "oven-o300",
        "name": "3-Layer Electric Oven O-300",
        "description": "Precise Temperature · Independent Control · For Bakeries",
        "category": "oven",
        "image": "../images/photo-冰箱.jpg",
        "isHot": true
    },
    {
        "id": "worktable-w500",
        "name": "Stainless Steel Worktable W-500",
        "description": "Thick Surface · Anti-Slip · Multi-Functional Rack",
        "category": "worktable",
        "image": "../images/photo-冰箱.jpg",
        "isHot": true
    },
    {
        "id": "dishwasher-d800",
        "name": "Commercial Dishwasher D-800",
        "description": "High-Temp Sanitize · Fast Wash · Water Saving",
        "category": "dishwasher",
        "image": "../images/photo-冰箱.jpg",
        "isHot": true
    },
    {
        "id": "cabinet-s100",
        "name": "Heated Display Cabinet S-100",
        "description": "Double Glass · Constant Temp · For Dessert Shops",
        "category": "cabinet",
        "image": "../images/photo-冰箱.jpg",
        "isHot": false
    },
    {
        "id": "workstation-c600",
        "name": "Modular Workstation C-600",
        "description": "Flexible Design · Space Saving · Customizable",
        "category": "worktable",
        "image": "../images/photo-冰箱.jpg"
    },
    {
        "id": "fridge-KF-0.5F-2F",
        "name": "Commercial Upright Double Doors Freezer KF-0.5F-2F",
        "description": "Flexible Design · Space Saving · Customizable",
        "category": "fridge",
        "image": "../images/fridge-KF-0.5F-2F.webp"
    },
    {
        "id": "fridge-KF-0.5F-3F",
        "name": "Commercial Upright Double Doors Freezer KF-0.5F-3F",
        "description": "Flexible Design · Space Saving · Customizable",
        "category": "fridge",
        "image": "../images/fridge-KF-0.5F-2F.webp"
    },
    {
        "id": "fridge-KF-0.5F-4F",
        "name": "Commercial Upright Double Doors Freezer KF-0.5F-4F",
        "description": "Flexible Design · Space Saving · Customizable",
        "category": "fridge",
        "image": "../images/fridge-KF-0.5F-2F.webp"
    },
    {
        "id": "fridge-KF-0.5F-5F",
        "name": "Commercial Upright Double Doors Freezer KF-0.5F-5F",
        "description": "Flexible Design · Space Saving · Customizable",
        "category": "fridge",
        "image": "../images/fridge-KF-0.5F-2F.webp"
    },
    {
        "id": "fridge-KF-0.5F-6F",
        "name": "Commercial Upright Double Doors Freezer KF-0.5F-6F",
        "description": "Flexible Design · Space Saving · Customizable",
        "category": "fridge",
        "image": "../images/fridge-KF-0.5F-2F.webp"
    },
    {
        "id": "fridge-KF-0.5F-7F",
        "name": "Commercial Upright Double Doors Freezer KF-0.5F-7F",
        "description": "Flexible Design · Space Saving · Customizable",
        "category": "fridge",
        "image": "../images/fridge-KF-0.5F-2F.webp"
    },
    {
        "id": "fridge-KF-0.5F-8F",
        "name": "Commercial Upright Double Doors Freezer KF-0.5F-8F",
        "description": "Flexible Design · Space Saving · Customizable",
        "category": "fridge",
        "image": "../images/fridge-KF-0.5F-2F.webp"
    },
    {
        "id": "fridge-KF-0.5F-9F",
        "name": "Commercial Upright Double Doors Freezer KF-0.5F-9F",
        "description": "Flexible Design · Space Saving · Customizable",
        "category": "fridge",
        "image": "../images/fridge-KF-0.5F-2F.webp"
    },
    {
        "id": "fridge-KF-0.5F-9F",
        "name": "Commercial Upright Double Doors Freezer KF-0.5F-9F",
        "description": "Flexible Design · Space Saving · Customizable",
        "category": "fridge",
        "image": "../images/fridge-KF-0.5F-2F.webp"
    },
    {
        "id": "fridge-KF-0.5F-10F",
        "name": "Commercial Upright Double Doors Freezer KF-0.5F-10F",
        "description": "Flexible Design · Space Saving · Customizable",
        "category": "fridge",
        "image": "../images/fridge-KF-0.5F-2F.webp"
    },
    {
        "id": "fridge-KF-0.5F-11F",
        "name": "Commercial Upright Double Doors Freezer KF-0.5F-11F",
        "description": "Flexible Design · Space Saving · Customizable",
        "category": "fridge",
        "image": "../images/fridge-KF-0.5F-2F.webp"
    },
    {
        "id": "fridge-KF-0.5F-12F",
        "name": "Commercial Upright Double Doors Freezer KF-0.5F-12F",
        "description": "Flexible Design · Space Saving · Customizable",
        "category": "fridge",
        "image": "../images/fridge-KF-0.5F-2F.webp"
    },
    {
        "id": "fridge-KF-0.5F-13F",
        "name": "Commercial Upright Double Doors Freezer KF-0.5F-13F",
        "description": "Flexible Design · Space Saving · Customizable",
        "category": "fridge",
        "image": "../images/fridge-KF-0.5F-2F.webp"
    },
    {
        "id": "car-222",
        "name": "汽车",
        "description": "性能跑车，超级",
        "category": "cabinet",
        "image": "/product_images/uploaded/img_1773467707854.jpg"
    }
];
