import type { Shop, ShoppingItem } from '../types'

export const INITIAL_SHOPS: Shop[] = [
  {
    id: 'aldi',
    name: 'Aldi',
    color: 'emerald',
    icon: 'ShoppingBag',
    orderIndex: 0,
    defaultAisles: [
      'Entrance Produce',
      'Fresh Meat Cases',
      'Aisle 1 - Dairy & Eggs',
      'Aisle 2 - Canned & Grains',
      'Aisle 3 - Snacks & Sweets',
      'Aisle 4 - Frozen Cases',
      'Aisle 5 - Bakery & Bread',
      'Aldi Finds Aisle',
    ],
  },
  {
    id: 'costco',
    name: 'Costco Wholesale',
    color: 'blue',
    icon: 'Building2',
    orderIndex: 1,
    defaultAisles: [
      'Fresh Produce Walk-in',
      'Walk-in Dairy Cooler',
      'Fresh Meat & Poultry',
      'Center Freezers',
      'Bakery Section',
      'Aisle 10 - Coffee & Tea',
      'Aisle 14 - Canned & Condiments',
      'Aisle 18 - Snacks & Nuts',
      'Front Register Aisles',
    ],
  },
  {
    id: 'trader-joes',
    name: "Trader Joe's",
    color: 'rose',
    icon: 'Store',
    orderIndex: 2,
    defaultAisles: [
      'Front Produce Section',
      'Dairy Wall (Left)',
      'Fresh Meat Cases',
      'Aisle 1 - Chips & Snacks',
      'Aisle 2 - Pantry & Sauces',
      'Aisle 3 - Frozen & Entrees',
      'Bakery / Bread Table',
      'Beverages & Coffee',
      'Checkout Endcaps',
    ],
  },
  {
    id: 'target',
    name: 'Target',
    color: 'amber',
    icon: 'ShoppingCart',
    orderIndex: 3,
    defaultAisles: [
      'Grocery - Produce',
      'Grocery - Meat & Poultry',
      'Grocery - Aisle G2 (Dairy & Milk)',
      'Grocery - Aisle G5 (Cereal & Coffee)',
      'Grocery - Aisle G8 (Pasta & Sauce)',
      'Grocery - Aisle G11 (Frozen Foods)',
      'Grocery - Aisle G14 (Snacks & Chips)',
      'Household / Paper Goods',
    ],
  },
]

export const INITIAL_ITEMS: ShoppingItem[] = [
  {
  "id": "item-spinach",
  "name": "Baby Spinach",
  "category": "Produce",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Pre-washed tender leaves for salads & smoothies",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.99,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.249,
      "unitSize": "8 oz clamshell",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 3.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.218,
      "unitSize": "16 oz clamshell",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 2.99,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.187,
      "unitSize": "16 oz bag",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 3.79,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.237,
      "unitSize": "16 oz tub",
      "location": "Grocery - Produce",
      "packageOptions": [
        {
          "id": "opt-spinach-5oz",
          "label": "5 oz Bag",
          "packageSize": 5,
          "packageUnit": "oz",
          "price": 2.19,
          "unitPrice": 0.438
        },
        {
          "id": "opt-spinach-16oz",
          "label": "16 oz Tub (Best Value)",
          "packageSize": 16,
          "packageUnit": "oz",
          "price": 3.79,
          "unitPrice": 0.237
        }
      ]
    }
  },
  "createdAt": 1730000000000,
  "updatedAt": 1730000000000
},
  {
  "id": "item-avocados",
  "name": "Avocados",
  "category": "Produce",
  "quantity": 4,
  "unit": "pieces",
  "isNeeded": true,
  "inCart": false,
  "notes": "Slightly firm to ripen at home",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.29,
      "packageSize": 6,
      "packageUnit": "ct",
      "unitPrice": 0.548,
      "unitSize": "6-count bag",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 6.99,
      "packageSize": 6,
      "packageUnit": "ct",
      "unitPrice": 1.165,
      "unitSize": "6-count Jumbo",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 3.49,
      "packageSize": 4,
      "packageUnit": "ct",
      "unitPrice": 0.873,
      "unitSize": "4-pack Teeny Tiny",
      "location": "Front Produce Section",
      "packageOptions": [
        {
          "id": "opt-tj-avo-single",
          "label": "Single Avocado",
          "packageSize": 1,
          "packageUnit": "piece",
          "price": 0.89,
          "unitPrice": 0.89
        },
        {
          "id": "opt-tj-avo-4pack",
          "label": "Teeny Tiny 4-Pack",
          "packageSize": 4,
          "packageUnit": "ct",
          "price": 3.49,
          "unitPrice": 0.873
        }
      ]
    },
    "target": {
      "available": true,
      "price": 3.99,
      "packageSize": 4,
      "packageUnit": "ct",
      "unitPrice": 0.998,
      "unitSize": "4-count bag",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000001000,
  "updatedAt": 1730000001000
},
  {
  "id": "item-bananas",
  "name": "Bananas",
  "category": "Produce",
  "quantity": 3,
  "unit": "lbs",
  "isNeeded": true,
  "inCart": false,
  "notes": "Yellow with slight green stems",
  "shops": {
    "aldi": {
      "available": true,
      "price": 0.52,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 0.52,
      "unitSize": "Per lb",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 1.89,
      "packageSize": 3,
      "packageUnit": "lb",
      "unitPrice": 0.63,
      "unitSize": "3 lb bunch",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 0.25,
      "packageSize": 1,
      "packageUnit": "piece",
      "unitPrice": 0.25,
      "unitSize": "Per banana",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 0.59,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 0.59,
      "unitSize": "Per lb",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000002000,
  "updatedAt": 1730000002000
},
  {
  "id": "item-blueberries",
  "name": "Blueberries",
  "category": "Produce",
  "quantity": 18,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Fresh sweet berries for snacks & bowls",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.49,
      "packageSize": 11,
      "packageUnit": "oz",
      "unitPrice": 0.226,
      "unitSize": "1 dry pint (11 oz)",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 4.79,
      "packageSize": 18,
      "packageUnit": "oz",
      "unitPrice": 0.266,
      "unitSize": "18 oz clamshell",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 4.99,
      "packageSize": 18,
      "packageUnit": "oz",
      "unitPrice": 0.277,
      "unitSize": "18 oz Jumbo pack",
      "location": "Front Produce Section",
      "packageOptions": [
        {
          "id": "opt-tj-blue-6oz",
          "label": "6 oz Regular clamshell",
          "packageSize": 6,
          "packageUnit": "oz",
          "price": 2.99,
          "unitPrice": 0.498
        },
        {
          "id": "opt-tj-blue-18oz",
          "label": "18 oz Jumbo pack",
          "packageSize": 18,
          "packageUnit": "oz",
          "price": 4.99,
          "unitPrice": 0.277
        }
      ]
    },
    "target": {
      "available": true,
      "price": 3.29,
      "packageSize": 11,
      "packageUnit": "oz",
      "unitPrice": 0.299,
      "unitSize": "1 pint (11 oz)",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000003000,
  "updatedAt": 1730000003000
},
  {
  "id": "item-strawberries",
  "name": "Strawberries",
  "category": "Produce",
  "quantity": 32,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Sweet, bright red berries",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.156,
      "unitSize": "16 oz clamshell",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 4.99,
      "packageSize": 32,
      "packageUnit": "oz",
      "unitPrice": 0.156,
      "unitSize": "32 oz (2 lb) clamshell",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 3.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.218,
      "unitSize": "16 oz clamshell",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 2.99,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.187,
      "unitSize": "16 oz clamshell",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000004000,
  "updatedAt": 1730000004000
},
  {
  "id": "item-apples",
  "name": "Apples",
  "category": "Produce",
  "quantity": 3,
  "unit": "lbs",
  "isNeeded": true,
  "inCart": false,
  "notes": "Crisp Honeycrisp or Gala apples",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.89,
      "packageSize": 3,
      "packageUnit": "lb",
      "unitPrice": 1.297,
      "unitSize": "3 lb bag",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 7.99,
      "packageSize": 4,
      "packageUnit": "lb",
      "unitPrice": 1.998,
      "unitSize": "4 lb clamshell",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 1.49,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 1.49,
      "unitSize": "Per lb",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 4.49,
      "packageSize": 3,
      "packageUnit": "lb",
      "unitPrice": 1.497,
      "unitSize": "3 lb bag",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000005000,
  "updatedAt": 1730000005000
},
  {
  "id": "item-broccoli",
  "name": "Broccoli",
  "category": "Produce",
  "quantity": 2,
  "unit": "lbs",
  "isNeeded": true,
  "inCart": false,
  "notes": "Fresh crowns or florets",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.89,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 1.89,
      "unitSize": "1 lb bag florets",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 4.99,
      "packageSize": 3,
      "packageUnit": "lb",
      "unitPrice": 1.663,
      "unitSize": "3 lb bag florets",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 2.29,
      "packageSize": 12,
      "packageUnit": "oz",
      "unitPrice": 0.191,
      "unitSize": "12 oz bag florets",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 1.69,
      "packageSize": 12,
      "packageUnit": "oz",
      "unitPrice": 0.141,
      "unitSize": "12 oz bag",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000006000,
  "updatedAt": 1730000006000
},
  {
  "id": "item-carrots",
  "name": "Carrots",
  "category": "Produce",
  "quantity": 2,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Whole crunchy carrots",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.49,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 0.745,
      "unitSize": "2 lb bag",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 3.99,
      "packageSize": 5,
      "packageUnit": "lb",
      "unitPrice": 0.798,
      "unitSize": "5 lb bag",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 0.99,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 0.99,
      "unitSize": "1 lb bag",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 1.79,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 0.895,
      "unitSize": "2 lb bag",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000007000,
  "updatedAt": 1730000007000
},
  {
  "id": "item-bell-peppers",
  "name": "Bell Peppers",
  "category": "Produce",
  "quantity": 3,
  "unit": "pieces",
  "isNeeded": false,
  "inCart": false,
  "notes": "Sweet bell peppers (red/yellow/orange)",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.69,
      "packageSize": 3,
      "packageUnit": "ct",
      "unitPrice": 0.897,
      "unitSize": "3-pack multi-color",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 6.49,
      "packageSize": 6,
      "packageUnit": "ct",
      "unitPrice": 1.082,
      "unitSize": "6-count pack",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 0.99,
      "packageSize": 1,
      "packageUnit": "piece",
      "unitPrice": 0.99,
      "unitSize": "Per pepper",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 2.99,
      "packageSize": 3,
      "packageUnit": "ct",
      "unitPrice": 0.997,
      "unitSize": "3-pack bag",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000008000,
  "updatedAt": 1730000008000
},
  {
  "id": "item-onions",
  "name": "Yellow Onions",
  "category": "Produce",
  "quantity": 3,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Everyday cooking staple",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.99,
      "packageSize": 3,
      "packageUnit": "lb",
      "unitPrice": 0.663,
      "unitSize": "3 lb bag",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 6.99,
      "packageSize": 10,
      "packageUnit": "lb",
      "unitPrice": 0.699,
      "unitSize": "10 lb sack",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 1.99,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 0.995,
      "unitSize": "2 lb bag",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 2.49,
      "packageSize": 3,
      "packageUnit": "lb",
      "unitPrice": 0.83,
      "unitSize": "3 lb bag",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000009000,
  "updatedAt": 1730000009000
},
  {
  "id": "item-garlic",
  "name": "Garlic",
  "category": "Produce",
  "quantity": 3,
  "unit": "pieces",
  "isNeeded": false,
  "inCart": false,
  "notes": "Firm, fresh bulbs",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.19,
      "packageSize": 3,
      "packageUnit": "ct",
      "unitPrice": 0.397,
      "unitSize": "3-bulb sleeve",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 5.99,
      "packageSize": 32,
      "packageUnit": "oz",
      "unitPrice": 0.187,
      "unitSize": "2 lb jar peeled",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 1.49,
      "packageSize": 3,
      "packageUnit": "ct",
      "unitPrice": 0.497,
      "unitSize": "3-bulb sleeve",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 1.49,
      "packageSize": 3,
      "packageUnit": "ct",
      "unitPrice": 0.497,
      "unitSize": "3-bulb sleeve",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000010000,
  "updatedAt": 1730000010000
},
  {
  "id": "item-tomatoes",
  "name": "Roma Tomatoes",
  "category": "Produce",
  "quantity": 2,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Plum tomatoes for salads & sauce",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.29,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 1.29,
      "unitSize": "1 lb pack",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 3.49,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 1.745,
      "unitSize": "2 lb clamshell",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 1.69,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 1.69,
      "unitSize": "1 lb pack",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 1.59,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 1.59,
      "unitSize": "1 lb pack",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000011000,
  "updatedAt": 1730000011000
},
  {
  "id": "item-sweet-potatoes",
  "name": "Sweet Potatoes",
  "category": "Produce",
  "quantity": 3,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Medium size, dense and unblemished",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.29,
      "packageSize": 3,
      "packageUnit": "lb",
      "unitPrice": 0.763,
      "unitSize": "3 lb bag",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 4.99,
      "packageSize": 5,
      "packageUnit": "lb",
      "unitPrice": 0.998,
      "unitSize": "5 lb mesh bag",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 2.49,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 1.245,
      "unitSize": "2 lb bag",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 2.99,
      "packageSize": 3,
      "packageUnit": "lb",
      "unitPrice": 0.997,
      "unitSize": "3 lb bag",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000012000,
  "updatedAt": 1730000012000
},
  {
  "id": "item-russet-potatoes",
  "name": "Russet Potatoes",
  "category": "Produce",
  "quantity": 5,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Classic baking and mashing potatoes",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.99,
      "packageSize": 5,
      "packageUnit": "lb",
      "unitPrice": 0.598,
      "unitSize": "5 lb bag",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 5.99,
      "packageSize": 10,
      "packageUnit": "lb",
      "unitPrice": 0.599,
      "unitSize": "10 lb sack",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 3.49,
      "packageSize": 5,
      "packageUnit": "lb",
      "unitPrice": 0.698,
      "unitSize": "5 lb bag",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 3.69,
      "packageSize": 5,
      "packageUnit": "lb",
      "unitPrice": 0.738,
      "unitSize": "5 lb bag",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000013000,
  "updatedAt": 1730000013000
},
  {
  "id": "item-lemons",
  "name": "Lemons",
  "category": "Produce",
  "quantity": 4,
  "unit": "pieces",
  "isNeeded": false,
  "inCart": false,
  "notes": "Juicy citrus for cooking & tea",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.49,
      "packageSize": 6,
      "packageUnit": "ct",
      "unitPrice": 0.415,
      "unitSize": "2 lb bag (~6 ct)",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 6.99,
      "packageSize": 15,
      "packageUnit": "ct",
      "unitPrice": 0.466,
      "unitSize": "5 lb bag (~15 ct)",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 0.49,
      "packageSize": 1,
      "packageUnit": "piece",
      "unitPrice": 0.49,
      "unitSize": "Per lemon",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 2.99,
      "packageSize": 6,
      "packageUnit": "ct",
      "unitPrice": 0.498,
      "unitSize": "2 lb bag (~6 ct)",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000014000,
  "updatedAt": 1730000014000
},
  {
  "id": "item-limes",
  "name": "Limes",
  "category": "Produce",
  "quantity": 4,
  "unit": "pieces",
  "isNeeded": true,
  "inCart": false,
  "notes": "Tart green citrus for cooking and drinks",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.99,
      "packageSize": 6,
      "packageUnit": "ct",
      "unitPrice": 0.332,
      "unitSize": "1 lb bag (~6 ct)",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 5.99,
      "packageSize": 18,
      "packageUnit": "ct",
      "unitPrice": 0.333,
      "unitSize": "3 lb bag (~18 ct)",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 0.39,
      "packageSize": 1,
      "packageUnit": "piece",
      "unitPrice": 0.39,
      "unitSize": "Per lime",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 2.49,
      "packageSize": 6,
      "packageUnit": "ct",
      "unitPrice": 0.415,
      "unitSize": "1 lb bag",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000015000,
  "updatedAt": 1730000015000
},
  {
  "id": "item-cucumbers",
  "name": "Cucumbers",
  "category": "Produce",
  "quantity": 3,
  "unit": "pieces",
  "isNeeded": true,
  "inCart": false,
  "notes": "Crisp English or Persian cucumbers",
  "shops": {
    "aldi": {
      "available": true,
      "price": 0.89,
      "packageSize": 1,
      "packageUnit": "piece",
      "unitPrice": 0.89,
      "unitSize": "Seedless English",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 4.99,
      "packageSize": 3,
      "packageUnit": "piece",
      "unitPrice": 1.663,
      "unitSize": "3-pack English",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 2.49,
      "packageSize": 6,
      "packageUnit": "ct",
      "unitPrice": 0.415,
      "unitSize": "6-pack Persian mini",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 0.99,
      "packageSize": 1,
      "packageUnit": "piece",
      "unitPrice": 0.99,
      "unitSize": "Per cucumber",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000016000,
  "updatedAt": 1730000016000
},
  {
  "id": "item-zucchini",
  "name": "Zucchini",
  "category": "Produce",
  "quantity": 2,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Tender medium green zucchini",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.79,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 0.895,
      "unitSize": "2 lb pack",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 4.49,
      "packageSize": 4,
      "packageUnit": "lb",
      "unitPrice": 1.123,
      "unitSize": "4 lb pack",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 1.99,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 0.995,
      "unitSize": "2 lb pack",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 1.99,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 0.995,
      "unitSize": "2 lb pack",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000017000,
  "updatedAt": 1730000017000
},
  {
  "id": "item-celery",
  "name": "Celery",
  "category": "Produce",
  "quantity": 1,
  "unit": "bunches",
  "isNeeded": false,
  "inCart": false,
  "notes": "Crisp celery stalk",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.29,
      "packageSize": 1,
      "packageUnit": "bunch",
      "unitPrice": 1.29,
      "unitSize": "1 stalk bunch",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 3.49,
      "packageSize": 2,
      "packageUnit": "bunch",
      "unitPrice": 1.745,
      "unitSize": "2-pack hearts",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 1.69,
      "packageSize": 1,
      "packageUnit": "bunch",
      "unitPrice": 1.69,
      "unitSize": "1 stalk bunch",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 1.59,
      "packageSize": 1,
      "packageUnit": "bunch",
      "unitPrice": 1.59,
      "unitSize": "1 stalk bunch",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000018000,
  "updatedAt": 1730000018000
},
  {
  "id": "item-romaine",
  "name": "Romaine Lettuce",
  "category": "Produce",
  "quantity": 3,
  "unit": "heads",
  "isNeeded": true,
  "inCart": false,
  "notes": "Crisp romaine hearts for Caesar salads",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.49,
      "packageSize": 3,
      "packageUnit": "head",
      "unitPrice": 0.83,
      "unitSize": "3-pack hearts",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 4.49,
      "packageSize": 6,
      "packageUnit": "head",
      "unitPrice": 0.748,
      "unitSize": "6-pack hearts",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 2.99,
      "packageSize": 3,
      "packageUnit": "head",
      "unitPrice": 0.997,
      "unitSize": "3-pack hearts",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 2.99,
      "packageSize": 3,
      "packageUnit": "head",
      "unitPrice": 0.997,
      "unitSize": "3-pack hearts",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000019000,
  "updatedAt": 1730000019000
},
  {
  "id": "item-kale",
  "name": "Kale",
  "category": "Produce",
  "quantity": 1,
  "unit": "bunches",
  "isNeeded": false,
  "inCart": false,
  "notes": "Fresh curly or lacinato kale",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.49,
      "packageSize": 1,
      "packageUnit": "bunch",
      "unitPrice": 1.49,
      "unitSize": "1 bunch",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 3.99,
      "packageSize": 24,
      "packageUnit": "oz",
      "unitPrice": 0.166,
      "unitSize": "24 oz chopped bag",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 1.99,
      "packageSize": 1,
      "packageUnit": "bunch",
      "unitPrice": 1.99,
      "unitSize": "1 bunch",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 1.79,
      "packageSize": 1,
      "packageUnit": "bunch",
      "unitPrice": 1.79,
      "unitSize": "1 bunch",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000020000,
  "updatedAt": 1730000020000
},
  {
  "id": "item-mushrooms",
  "name": "Mushrooms",
  "category": "Produce",
  "quantity": 8,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Sliced baby bella or white button mushrooms",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.69,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.211,
      "unitSize": "8 oz pack",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 4.99,
      "packageSize": 24,
      "packageUnit": "oz",
      "unitPrice": 0.208,
      "unitSize": "24 oz pack",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 1.99,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.249,
      "unitSize": "8 oz pack",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 1.99,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.249,
      "unitSize": "8 oz pack",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000021000,
  "updatedAt": 1730000021000
},
  {
  "id": "item-red-onions",
  "name": "Red Onions",
  "category": "Produce",
  "quantity": 2,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Sweet red onions for salads & grilling",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.89,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 0.945,
      "unitSize": "2 lb bag",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 5.99,
      "packageSize": 8,
      "packageUnit": "lb",
      "unitPrice": 0.749,
      "unitSize": "8 lb sack",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 2.19,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 1.095,
      "unitSize": "2 lb bag",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 2.29,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 1.145,
      "unitSize": "2 lb bag",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000022000,
  "updatedAt": 1730000022000
},
  {
  "id": "item-green-onions",
  "name": "Green Onions",
  "category": "Produce",
  "quantity": 1,
  "unit": "bunches",
  "isNeeded": true,
  "inCart": false,
  "notes": "Fresh scallions for garnish & stir fry",
  "shops": {
    "aldi": {
      "available": true,
      "price": 0.79,
      "packageSize": 1,
      "packageUnit": "bunch",
      "unitPrice": 0.79,
      "unitSize": "1 bunch",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 2.99,
      "packageSize": 4,
      "packageUnit": "bunch",
      "unitPrice": 0.748,
      "unitSize": "4-pack",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 0.99,
      "packageSize": 1,
      "packageUnit": "bunch",
      "unitPrice": 0.99,
      "unitSize": "1 bunch",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 0.89,
      "packageSize": 1,
      "packageUnit": "bunch",
      "unitPrice": 0.89,
      "unitSize": "1 bunch",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000023000,
  "updatedAt": 1730000023000
},
  {
  "id": "item-cilantro",
  "name": "Cilantro",
  "category": "Produce",
  "quantity": 1,
  "unit": "bunches",
  "isNeeded": true,
  "inCart": false,
  "notes": "Fresh green herb for tacos & salsa",
  "shops": {
    "aldi": {
      "available": true,
      "price": 0.69,
      "packageSize": 1,
      "packageUnit": "bunch",
      "unitPrice": 0.69,
      "unitSize": "1 bunch",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 2.49,
      "packageSize": 3,
      "packageUnit": "bunch",
      "unitPrice": 0.83,
      "unitSize": "3-pack",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 0.99,
      "packageSize": 1,
      "packageUnit": "bunch",
      "unitPrice": 0.99,
      "unitSize": "1 bunch",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 0.89,
      "packageSize": 1,
      "packageUnit": "bunch",
      "unitPrice": 0.89,
      "unitSize": "1 bunch",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000024000,
  "updatedAt": 1730000024000
},
  {
  "id": "item-ginger",
  "name": "Ginger",
  "category": "Produce",
  "quantity": 8,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Fresh ginger root",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.49,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.186,
      "unitSize": "8 oz piece",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 4.49,
      "packageSize": 24,
      "packageUnit": "oz",
      "unitPrice": 0.187,
      "unitSize": "1.5 lb bag",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 1.79,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.224,
      "unitSize": "8 oz piece",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 1.99,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.249,
      "unitSize": "8 oz piece",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000025000,
  "updatedAt": 1730000025000
},
  {
  "id": "item-oranges",
  "name": "Oranges",
  "category": "Produce",
  "quantity": 4,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Sweet navel or Cara Cara oranges",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.49,
      "packageSize": 4,
      "packageUnit": "lb",
      "unitPrice": 0.873,
      "unitSize": "4 lb bag",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 8.99,
      "packageSize": 8,
      "packageUnit": "lb",
      "unitPrice": 1.124,
      "unitSize": "8 lb box",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 3.99,
      "packageSize": 3,
      "packageUnit": "lb",
      "unitPrice": 1.33,
      "unitSize": "3 lb bag",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 4.29,
      "packageSize": 4,
      "packageUnit": "lb",
      "unitPrice": 1.073,
      "unitSize": "4 lb bag",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000026000,
  "updatedAt": 1730000026000
},
  {
  "id": "item-grapes",
  "name": "Grapes",
  "category": "Produce",
  "quantity": 2,
  "unit": "lbs",
  "isNeeded": true,
  "inCart": false,
  "notes": "Crisp seedless red or green grapes",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.98,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 1.49,
      "unitSize": "2 lb bag ($1.49/lb)",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 6.99,
      "packageSize": 3,
      "packageUnit": "lb",
      "unitPrice": 2.33,
      "unitSize": "3 lb clamshell",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 3.49,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 1.745,
      "unitSize": "2 lb clamshell",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 3.98,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 1.99,
      "unitSize": "2 lb bag",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000027000,
  "updatedAt": 1730000027000
},
  {
  "id": "item-chicken-breast",
  "name": "Chicken Breast",
  "category": "Meat & Seafood",
  "quantity": 4,
  "unit": "lbs",
  "isNeeded": true,
  "inCart": false,
  "notes": "Boneless, skinless lean chicken breasts",
  "shops": {
    "aldi": {
      "available": true,
      "price": 9.96,
      "packageSize": 4,
      "packageUnit": "lb",
      "unitPrice": 2.49,
      "unitSize": "4 lb Family Pack",
      "location": "Fresh Meat Cases"
    },
    "costco": {
      "available": true,
      "price": 19.44,
      "packageSize": 6.5,
      "packageUnit": "lb",
      "unitPrice": 2.991,
      "unitSize": "6-pouch pack",
      "location": "Fresh Meat & Poultry"
    },
    "trader-joes": {
      "available": true,
      "price": 6.74,
      "packageSize": 24,
      "packageUnit": "oz",
      "unitPrice": 0.281,
      "unitSize": "1.5 lb tray",
      "location": "Fresh Meat Cases"
    },
    "target": {
      "available": true,
      "price": 8.23,
      "packageSize": 40,
      "packageUnit": "oz",
      "unitPrice": 0.206,
      "unitSize": "2.5 lb pack",
      "location": "Grocery - Meat & Poultry",
      "packageOptions": [
        {
          "id": "opt-tgt-chick-1lb",
          "label": "1 lb Tray (16 oz)",
          "packageSize": 16,
          "packageUnit": "oz",
          "price": 3.99,
          "unitPrice": 0.249
        },
        {
          "id": "opt-tgt-chick-2.5lb",
          "label": "2.5 lb Value Pack",
          "packageSize": 40,
          "packageUnit": "oz",
          "price": 8.23,
          "unitPrice": 0.206
        }
      ]
    }
  },
  "createdAt": 1730000028000,
  "updatedAt": 1730000028000
},
  {
  "id": "item-chicken-thighs",
  "name": "Chicken Thighs",
  "category": "Meat & Seafood",
  "quantity": 3,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Boneless skinless chicken thighs",
  "shops": {
    "aldi": {
      "available": true,
      "price": 7.47,
      "packageSize": 3,
      "packageUnit": "lb",
      "unitPrice": 2.49,
      "unitSize": "3 lb pack ($2.49/lb)",
      "location": "Fresh Meat Cases"
    },
    "costco": {
      "available": true,
      "price": 16.99,
      "packageSize": 6,
      "packageUnit": "lb",
      "unitPrice": 2.832,
      "unitSize": "6 lb pack ($2.83/lb)",
      "location": "Fresh Meat & Poultry"
    },
    "trader-joes": {
      "available": true,
      "price": 7.98,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 3.99,
      "unitSize": "2 lb tray ($3.99/lb)",
      "location": "Fresh Meat Cases"
    },
    "target": {
      "available": true,
      "price": 8.97,
      "packageSize": 3,
      "packageUnit": "lb",
      "unitPrice": 2.99,
      "unitSize": "3 lb pack",
      "location": "Grocery - Meat & Poultry"
    }
  },
  "createdAt": 1730000029000,
  "updatedAt": 1730000029000
},
  {
  "id": "item-ground-beef",
  "name": "Ground Beef",
  "category": "Meat & Seafood",
  "quantity": 2,
  "unit": "lbs",
  "isNeeded": true,
  "inCart": false,
  "notes": "85/15 lean ground beef for burgers & pasta",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.99,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 3.99,
      "unitSize": "1 lb pack",
      "location": "Fresh Meat Cases"
    },
    "costco": {
      "available": true,
      "price": 18.95,
      "packageSize": 5,
      "packageUnit": "lb",
      "unitPrice": 3.79,
      "unitSize": "5 lb chub ($3.79/lb)",
      "location": "Fresh Meat & Poultry"
    },
    "trader-joes": {
      "available": true,
      "price": 4.99,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 4.99,
      "unitSize": "1 lb pack",
      "location": "Fresh Meat Cases"
    },
    "target": {
      "available": true,
      "price": 4.49,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 4.49,
      "unitSize": "1 lb pack",
      "location": "Grocery - Meat & Poultry",
      "packageOptions": [
        {
          "id": "opt-tgt-beef-1lb",
          "label": "1 lb Tray",
          "packageSize": 1,
          "packageUnit": "lb",
          "price": 4.49,
          "unitPrice": 4.49
        },
        {
          "id": "opt-tgt-beef-3lb",
          "label": "3 lb Value Pack",
          "packageSize": 3,
          "packageUnit": "lb",
          "price": 11.99,
          "unitPrice": 3.997
        }
      ]
    }
  },
  "createdAt": 1730000030000,
  "updatedAt": 1730000030000
},
  {
  "id": "item-ground-turkey",
  "name": "Ground Turkey",
  "category": "Meat & Seafood",
  "quantity": 2,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "93/7 lean ground turkey",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.29,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 3.29,
      "unitSize": "1 lb pack",
      "location": "Fresh Meat Cases"
    },
    "costco": {
      "available": true,
      "price": 14.99,
      "packageSize": 4,
      "packageUnit": "lb",
      "unitPrice": 3.748,
      "unitSize": "4x 1 lb packs",
      "location": "Fresh Meat & Poultry"
    },
    "trader-joes": {
      "available": true,
      "price": 3.99,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 3.99,
      "unitSize": "1 lb pack",
      "location": "Fresh Meat Cases"
    },
    "target": {
      "available": true,
      "price": 3.79,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 3.79,
      "unitSize": "1 lb pack",
      "location": "Grocery - Meat & Poultry"
    }
  },
  "createdAt": 1730000031000,
  "updatedAt": 1730000031000
},
  {
  "id": "item-salmon",
  "name": "Salmon Fillets",
  "category": "Meat & Seafood",
  "quantity": 2,
  "unit": "lbs",
  "isNeeded": true,
  "inCart": false,
  "notes": "Fresh salmon portions with skin",
  "shops": {
    "aldi": {
      "available": true,
      "price": 8.99,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 8.99,
      "unitSize": "1 lb fresh fillet",
      "location": "Fresh Meat Cases"
    },
    "costco": {
      "available": true,
      "price": 25.47,
      "packageSize": 3,
      "packageUnit": "lb",
      "unitPrice": 8.49,
      "unitSize": "3 lb fillet tray",
      "location": "Fresh Meat & Poultry"
    },
    "trader-joes": {
      "available": true,
      "price": 9.99,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 9.99,
      "unitSize": "1 lb vacuum tray",
      "location": "Fresh Meat Cases"
    },
    "target": {
      "available": true,
      "price": 10.99,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 10.99,
      "unitSize": "1 lb fresh fillet",
      "location": "Grocery - Meat & Poultry"
    }
  },
  "createdAt": 1730000032000,
  "updatedAt": 1730000032000
},
  {
  "id": "item-sirloin-steak",
  "name": "Sirloin Steak",
  "category": "Meat & Seafood",
  "quantity": 2,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Top sirloin steak portions",
  "shops": {
    "aldi": {
      "available": true,
      "price": 7.99,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 7.99,
      "unitSize": "1 lb tray",
      "location": "Fresh Meat Cases"
    },
    "costco": {
      "available": true,
      "price": 26.97,
      "packageSize": 3,
      "packageUnit": "lb",
      "unitPrice": 8.99,
      "unitSize": "3 lb tray ($8.99/lb)",
      "location": "Fresh Meat & Poultry"
    },
    "trader-joes": {
      "available": true,
      "price": 9.99,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 9.99,
      "unitSize": "1 lb vacuum pack",
      "location": "Fresh Meat Cases"
    },
    "target": {
      "available": true,
      "price": 8.99,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 8.99,
      "unitSize": "1 lb tray",
      "location": "Grocery - Meat & Poultry"
    }
  },
  "createdAt": 1730000033000,
  "updatedAt": 1730000033000
},
  {
  "id": "item-pork-chops",
  "name": "Pork Chops",
  "category": "Meat & Seafood",
  "quantity": 2,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Boneless center cut pork loin chops",
  "shops": {
    "aldi": {
      "available": true,
      "price": 5.98,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 2.99,
      "unitSize": "2 lb pack ($2.99/lb)",
      "location": "Fresh Meat Cases"
    },
    "costco": {
      "available": true,
      "price": 14.99,
      "packageSize": 4.5,
      "packageUnit": "lb",
      "unitPrice": 3.331,
      "unitSize": "4.5 lb pack ($3.33/lb)",
      "location": "Fresh Meat & Poultry"
    },
    "trader-joes": {
      "available": true,
      "price": 6.98,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 3.49,
      "unitSize": "2 lb tray ($3.49/lb)",
      "location": "Fresh Meat Cases"
    },
    "target": {
      "available": true,
      "price": 6.58,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 3.29,
      "unitSize": "2 lb pack",
      "location": "Grocery - Meat & Poultry"
    }
  },
  "createdAt": 1730000034000,
  "updatedAt": 1730000034000
},
  {
  "id": "item-bacon",
  "name": "Bacon",
  "category": "Meat & Seafood",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Thick cut applewood smoked bacon",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.89,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.243,
      "unitSize": "16 oz pack",
      "location": "Fresh Meat Cases"
    },
    "costco": {
      "available": true,
      "price": 14.99,
      "packageSize": 64,
      "packageUnit": "oz",
      "unitPrice": 0.234,
      "unitSize": "4-pack (4x 16 oz)",
      "location": "Walk-in Dairy Cooler"
    },
    "trader-joes": {
      "available": true,
      "price": 4.49,
      "packageSize": 12,
      "packageUnit": "oz",
      "unitPrice": 0.374,
      "unitSize": "12 oz pack",
      "location": "Fresh Meat Cases"
    },
    "target": {
      "available": true,
      "price": 4.79,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.299,
      "unitSize": "16 oz pack",
      "location": "Grocery - Meat & Poultry"
    }
  },
  "createdAt": 1730000035000,
  "updatedAt": 1730000035000
},
  {
  "id": "item-sausage",
  "name": "Sausage Links",
  "category": "Meat & Seafood",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Sweet or hot Italian pork sausage",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.49,
      "packageSize": 19,
      "packageUnit": "oz",
      "unitPrice": 0.184,
      "unitSize": "19 oz (5 links)",
      "location": "Fresh Meat Cases"
    },
    "costco": {
      "available": true,
      "price": 12.99,
      "packageSize": 48,
      "packageUnit": "oz",
      "unitPrice": 0.271,
      "unitSize": "3 lb pack",
      "location": "Walk-in Dairy Cooler"
    },
    "trader-joes": {
      "available": true,
      "price": 4.99,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.312,
      "unitSize": "16 oz pack",
      "location": "Fresh Meat Cases"
    },
    "target": {
      "available": true,
      "price": 4.29,
      "packageSize": 19,
      "packageUnit": "oz",
      "unitPrice": 0.226,
      "unitSize": "19 oz pack",
      "location": "Grocery - Meat & Poultry"
    }
  },
  "createdAt": 1730000036000,
  "updatedAt": 1730000036000
},
  {
  "id": "item-deli-turkey",
  "name": "Turkey Deli Slices",
  "category": "Meat & Seafood",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Oven roasted sliced turkey breast",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.99,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.249,
      "unitSize": "16 oz tub",
      "location": "Fresh Meat Cases"
    },
    "costco": {
      "available": true,
      "price": 11.99,
      "packageSize": 48,
      "packageUnit": "oz",
      "unitPrice": 0.25,
      "unitSize": "3x 16 oz packs",
      "location": "Walk-in Dairy Cooler"
    },
    "trader-joes": {
      "available": true,
      "price": 3.49,
      "packageSize": 7,
      "packageUnit": "oz",
      "unitPrice": 0.499,
      "unitSize": "7 oz pack",
      "location": "Fresh Meat Cases"
    },
    "target": {
      "available": true,
      "price": 4.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.281,
      "unitSize": "16 oz tub",
      "location": "Grocery - Meat & Poultry"
    }
  },
  "createdAt": 1730000037000,
  "updatedAt": 1730000037000
},
  {
  "id": "item-shrimp",
  "name": "Shrimp",
  "category": "Meat & Seafood",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Raw peeled and deveined tail-on shrimp",
  "shops": {
    "aldi": {
      "available": true,
      "price": 5.99,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.374,
      "unitSize": "16 oz bag",
      "location": "Aisle 4 - Frozen Cases"
    },
    "costco": {
      "available": true,
      "price": 14.99,
      "packageSize": 32,
      "packageUnit": "oz",
      "unitPrice": 0.468,
      "unitSize": "2 lb bag",
      "location": "Center Freezers"
    },
    "trader-joes": {
      "available": true,
      "price": 7.99,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.499,
      "unitSize": "16 oz bag",
      "location": "Aisle 3 - Frozen & Entrees"
    },
    "target": {
      "available": true,
      "price": 7.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.468,
      "unitSize": "16 oz bag",
      "location": "Grocery - Aisle G11 (Frozen Foods)"
    }
  },
  "createdAt": 1730000038000,
  "updatedAt": 1730000038000
},
  {
  "id": "item-tofu",
  "name": "Tofu",
  "category": "Meat & Seafood",
  "quantity": 14,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Firm or extra-firm organic tofu",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.59,
      "packageSize": 14,
      "packageUnit": "oz",
      "unitPrice": 0.114,
      "unitSize": "14 oz block",
      "location": "Entrance Produce"
    },
    "costco": {
      "available": true,
      "price": 6.49,
      "packageSize": 64,
      "packageUnit": "oz",
      "unitPrice": 0.101,
      "unitSize": "4-pack (4x 16 oz)",
      "location": "Fresh Produce Walk-in"
    },
    "trader-joes": {
      "available": true,
      "price": 1.99,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.124,
      "unitSize": "16 oz Super Firm",
      "location": "Front Produce Section"
    },
    "target": {
      "available": true,
      "price": 1.99,
      "packageSize": 14,
      "packageUnit": "oz",
      "unitPrice": 0.142,
      "unitSize": "14 oz block",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000039000,
  "updatedAt": 1730000039000
},
  {
  "id": "item-eggs",
  "name": "Eggs",
  "category": "Dairy & Eggs",
  "quantity": 2,
  "unit": "dozens",
  "isNeeded": true,
  "inCart": false,
  "notes": "Grade A Large eggs",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.79,
      "packageSize": 12,
      "packageUnit": "ct",
      "unitPrice": 0.233,
      "unitSize": "12 ct carton",
      "location": "Aisle 1 - Dairy & Eggs"
    },
    "costco": {
      "available": true,
      "price": 5.99,
      "packageSize": 24,
      "packageUnit": "ct",
      "unitPrice": 0.25,
      "unitSize": "24 ct (2x 12-pack)",
      "location": "Walk-in Dairy Cooler"
    },
    "trader-joes": {
      "available": true,
      "price": 3.29,
      "packageSize": 12,
      "packageUnit": "ct",
      "unitPrice": 0.274,
      "unitSize": "12 ct carton",
      "location": "Dairy Wall (Left)"
    },
    "target": {
      "available": true,
      "price": 3.49,
      "packageSize": 12,
      "packageUnit": "ct",
      "unitPrice": 0.291,
      "unitSize": "12 ct carton",
      "location": "Grocery - Aisle G2 (Dairy & Milk)",
      "packageOptions": [
        {
          "id": "opt-tgt-egg-12",
          "label": "12 ct Regular Carton",
          "packageSize": 12,
          "packageUnit": "ct",
          "price": 3.49,
          "unitPrice": 0.291
        },
        {
          "id": "opt-tgt-egg-18",
          "label": "18 ct Value Pack",
          "packageSize": 18,
          "packageUnit": "ct",
          "price": 4.79,
          "unitPrice": 0.266
        }
      ]
    }
  },
  "createdAt": 1730000040000,
  "updatedAt": 1730000040000
},
  {
  "id": "item-greek-yogurt",
  "name": "Greek Yogurt",
  "category": "Dairy & Eggs",
  "quantity": 32,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Plain non-fat thick Greek yogurt",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.49,
      "packageSize": 32,
      "packageUnit": "oz",
      "unitPrice": 0.109,
      "unitSize": "32 oz tub",
      "location": "Aisle 1 - Dairy & Eggs"
    },
    "costco": {
      "available": true,
      "price": 5.99,
      "packageSize": 48,
      "packageUnit": "oz",
      "unitPrice": 0.125,
      "unitSize": "48 oz (3 lb) tub",
      "location": "Walk-in Dairy Cooler"
    },
    "trader-joes": {
      "available": true,
      "price": 5.49,
      "packageSize": 32,
      "packageUnit": "oz",
      "unitPrice": 0.172,
      "unitSize": "32 oz tub",
      "location": "Dairy Wall (Left)",
      "packageOptions": [
        {
          "id": "opt-tj-yog-cup",
          "label": "Single Cup (5.3 oz)",
          "packageSize": 5.3,
          "packageUnit": "oz",
          "price": 0.99,
          "unitPrice": 0.187
        },
        {
          "id": "opt-tj-yog-tub",
          "label": "32 oz Tub",
          "packageSize": 32,
          "packageUnit": "oz",
          "price": 5.49,
          "unitPrice": 0.172
        }
      ]
    },
    "target": {
      "available": true,
      "price": 3.79,
      "packageSize": 32,
      "packageUnit": "oz",
      "unitPrice": 0.118,
      "unitSize": "32 oz tub",
      "location": "Grocery - Aisle G2 (Dairy & Milk)"
    }
  },
  "createdAt": 1730000041000,
  "updatedAt": 1730000041000
},
  {
  "id": "item-whole-milk",
  "name": "Whole Milk",
  "category": "Dairy & Eggs",
  "quantity": 1,
  "unit": "gal",
  "isNeeded": true,
  "inCart": false,
  "notes": "Pasteurized vitamin D whole milk",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.29,
      "packageSize": 1,
      "packageUnit": "gal",
      "unitPrice": 3.29,
      "unitSize": "1 Gallon",
      "location": "Aisle 1 - Dairy & Eggs"
    },
    "costco": {
      "available": true,
      "price": 6.58,
      "packageSize": 2,
      "packageUnit": "gal",
      "unitPrice": 3.29,
      "unitSize": "2-pack (2 gal)",
      "location": "Walk-in Dairy Cooler"
    },
    "trader-joes": {
      "available": true,
      "price": 3.99,
      "packageSize": 1,
      "packageUnit": "gal",
      "unitPrice": 3.99,
      "unitSize": "1 Gallon",
      "location": "Dairy Wall (Left)",
      "packageOptions": [
        {
          "id": "opt-tj-milk-half",
          "label": "Half Gallon (64 fl oz)",
          "packageSize": 64,
          "packageUnit": "fl oz",
          "price": 2.29,
          "unitPrice": 0.0358
        },
        {
          "id": "opt-tj-milk-gal",
          "label": "1 Gallon Jug",
          "packageSize": 1,
          "packageUnit": "gal",
          "price": 3.99,
          "unitPrice": 3.99
        }
      ]
    },
    "target": {
      "available": true,
      "price": 3.49,
      "packageSize": 1,
      "packageUnit": "gal",
      "unitPrice": 3.49,
      "unitSize": "1 Gallon",
      "location": "Grocery - Aisle G2 (Dairy & Milk)"
    }
  },
  "createdAt": 1730000042000,
  "updatedAt": 1730000042000
},
  {
  "id": "item-almond-milk",
  "name": "Almond Milk",
  "category": "Dairy & Eggs",
  "quantity": 64,
  "unit": "fl oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Unsweetened plant milk",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.29,
      "packageSize": 64,
      "packageUnit": "fl oz",
      "unitPrice": 0.036,
      "unitSize": "64 fl oz carton",
      "location": "Aisle 1 - Dairy & Eggs"
    },
    "costco": {
      "available": true,
      "price": 8.99,
      "packageSize": 192,
      "packageUnit": "fl oz",
      "unitPrice": 0.047,
      "unitSize": "6-pack 32 fl oz cartons",
      "location": "Aisle 10 - Coffee & Tea"
    },
    "trader-joes": {
      "available": true,
      "price": 2.69,
      "packageSize": 64,
      "packageUnit": "fl oz",
      "unitPrice": 0.042,
      "unitSize": "64 fl oz carton",
      "location": "Dairy Wall (Left)"
    },
    "target": {
      "available": true,
      "price": 2.49,
      "packageSize": 64,
      "packageUnit": "fl oz",
      "unitPrice": 0.039,
      "unitSize": "64 fl oz carton",
      "location": "Grocery - Aisle G2 (Dairy & Milk)"
    }
  },
  "createdAt": 1730000043000,
  "updatedAt": 1730000043000
},
  {
  "id": "item-oat-milk",
  "name": "Oat Milk",
  "category": "Dairy & Eggs",
  "quantity": 64,
  "unit": "fl oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Creamy barista oat milk",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.79,
      "packageSize": 64,
      "packageUnit": "fl oz",
      "unitPrice": 0.044,
      "unitSize": "64 fl oz carton",
      "location": "Aisle 1 - Dairy & Eggs"
    },
    "costco": {
      "available": true,
      "price": 9.99,
      "packageSize": 192,
      "packageUnit": "fl oz",
      "unitPrice": 0.052,
      "unitSize": "6-pack 32 fl oz",
      "location": "Aisle 10 - Coffee & Tea"
    },
    "trader-joes": {
      "available": true,
      "price": 2.99,
      "packageSize": 64,
      "packageUnit": "fl oz",
      "unitPrice": 0.047,
      "unitSize": "64 fl oz carton",
      "location": "Dairy Wall (Left)"
    },
    "target": {
      "available": true,
      "price": 3.29,
      "packageSize": 64,
      "packageUnit": "fl oz",
      "unitPrice": 0.051,
      "unitSize": "64 fl oz carton",
      "location": "Grocery - Aisle G2 (Dairy & Milk)"
    }
  },
  "createdAt": 1730000044000,
  "updatedAt": 1730000044000
},
  {
  "id": "item-cheddar",
  "name": "Cheddar Cheese",
  "category": "Dairy & Eggs",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Sharp cheddar block or shredded",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.89,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.236,
      "unitSize": "8 oz block",
      "location": "Aisle 1 - Dairy & Eggs"
    },
    "costco": {
      "available": true,
      "price": 6.99,
      "packageSize": 32,
      "packageUnit": "oz",
      "unitPrice": 0.218,
      "unitSize": "32 oz (2 lb) block",
      "location": "Walk-in Dairy Cooler"
    },
    "trader-joes": {
      "available": true,
      "price": 2.49,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.311,
      "unitSize": "8 oz block",
      "location": "Dairy Wall (Left)"
    },
    "target": {
      "available": true,
      "price": 2.19,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.274,
      "unitSize": "8 oz block",
      "location": "Grocery - Aisle G2 (Dairy & Milk)",
      "packageOptions": [
        {
          "id": "opt-tgt-ched-8oz",
          "label": "8 oz Block",
          "packageSize": 8,
          "packageUnit": "oz",
          "price": 2.19,
          "unitPrice": 0.274
        },
        {
          "id": "opt-tgt-ched-16oz",
          "label": "16 oz (1 lb) Block",
          "packageSize": 16,
          "packageUnit": "oz",
          "price": 3.89,
          "unitPrice": 0.243
        }
      ]
    }
  },
  "createdAt": 1730000045000,
  "updatedAt": 1730000045000
},
  {
  "id": "item-mozzarella",
  "name": "Mozzarella Cheese",
  "category": "Dairy & Eggs",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Low moisture part skim shredded mozzarella",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.99,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.249,
      "unitSize": "8 oz bag",
      "location": "Aisle 1 - Dairy & Eggs"
    },
    "costco": {
      "available": true,
      "price": 9.99,
      "packageSize": 80,
      "packageUnit": "oz",
      "unitPrice": 0.125,
      "unitSize": "5 lb bag",
      "location": "Walk-in Dairy Cooler"
    },
    "trader-joes": {
      "available": true,
      "price": 2.49,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.311,
      "unitSize": "8 oz bag",
      "location": "Dairy Wall (Left)"
    },
    "target": {
      "available": true,
      "price": 2.19,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.274,
      "unitSize": "8 oz bag",
      "location": "Grocery - Aisle G2 (Dairy & Milk)"
    }
  },
  "createdAt": 1730000046000,
  "updatedAt": 1730000046000
},
  {
  "id": "item-parmesan",
  "name": "Parmesan Cheese",
  "category": "Dairy & Eggs",
  "quantity": 8,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Aged parmesan wedge or grated",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.99,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.374,
      "unitSize": "8 oz tub grated",
      "location": "Aisle 1 - Dairy & Eggs"
    },
    "costco": {
      "available": true,
      "price": 11.99,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.749,
      "unitSize": "1 lb Parmigiano wedge",
      "location": "Walk-in Dairy Cooler"
    },
    "trader-joes": {
      "available": true,
      "price": 3.99,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.499,
      "unitSize": "8 oz wedge",
      "location": "Dairy Wall (Left)"
    },
    "target": {
      "available": true,
      "price": 3.49,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.436,
      "unitSize": "8 oz tub",
      "location": "Grocery - Aisle G2 (Dairy & Milk)"
    }
  },
  "createdAt": 1730000047000,
  "updatedAt": 1730000047000
},
  {
  "id": "item-butter",
  "name": "Butter",
  "category": "Dairy & Eggs",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Sweet cream salted or unsalted 4 sticks",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.218,
      "unitSize": "16 oz (4 sticks)",
      "location": "Aisle 1 - Dairy & Eggs"
    },
    "costco": {
      "available": true,
      "price": 12.99,
      "packageSize": 64,
      "packageUnit": "oz",
      "unitPrice": 0.203,
      "unitSize": "4-pack (4 lbs)",
      "location": "Walk-in Dairy Cooler"
    },
    "trader-joes": {
      "available": true,
      "price": 3.99,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.249,
      "unitSize": "16 oz (4 sticks)",
      "location": "Dairy Wall (Left)"
    },
    "target": {
      "available": true,
      "price": 3.89,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.243,
      "unitSize": "16 oz (4 sticks)",
      "location": "Grocery - Aisle G2 (Dairy & Milk)"
    }
  },
  "createdAt": 1730000048000,
  "updatedAt": 1730000048000
},
  {
  "id": "item-cream-cheese",
  "name": "Cream Cheese",
  "category": "Dairy & Eggs",
  "quantity": 8,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Classic brick cream cheese for bagels & baking",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.49,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.186,
      "unitSize": "8 oz brick",
      "location": "Aisle 1 - Dairy & Eggs"
    },
    "costco": {
      "available": true,
      "price": 8.99,
      "packageSize": 48,
      "packageUnit": "oz",
      "unitPrice": 0.187,
      "unitSize": "6-pack (6x 8 oz)",
      "location": "Walk-in Dairy Cooler"
    },
    "trader-joes": {
      "available": true,
      "price": 1.99,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.249,
      "unitSize": "8 oz brick",
      "location": "Dairy Wall (Left)"
    },
    "target": {
      "available": true,
      "price": 1.99,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.249,
      "unitSize": "8 oz brick",
      "location": "Grocery - Aisle G2 (Dairy & Milk)"
    }
  },
  "createdAt": 1730000049000,
  "updatedAt": 1730000049000
},
  {
  "id": "item-sour-cream",
  "name": "Sour Cream",
  "category": "Dairy & Eggs",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Cultured sour cream for dips & chili",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.39,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.087,
      "unitSize": "16 oz tub",
      "location": "Aisle 1 - Dairy & Eggs"
    },
    "costco": {
      "available": true,
      "price": 4.99,
      "packageSize": 48,
      "packageUnit": "oz",
      "unitPrice": 0.104,
      "unitSize": "3 lb tub",
      "location": "Walk-in Dairy Cooler"
    },
    "trader-joes": {
      "available": true,
      "price": 1.79,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.112,
      "unitSize": "16 oz tub",
      "location": "Dairy Wall (Left)"
    },
    "target": {
      "available": true,
      "price": 1.89,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.118,
      "unitSize": "16 oz tub",
      "location": "Grocery - Aisle G2 (Dairy & Milk)"
    }
  },
  "createdAt": 1730000050000,
  "updatedAt": 1730000050000
},
  {
  "id": "item-cottage-cheese",
  "name": "Cottage Cheese",
  "category": "Dairy & Eggs",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "High protein small curd cottage cheese",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.79,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.112,
      "unitSize": "16 oz tub",
      "location": "Aisle 1 - Dairy & Eggs"
    },
    "costco": {
      "available": true,
      "price": 5.49,
      "packageSize": 48,
      "packageUnit": "oz",
      "unitPrice": 0.114,
      "unitSize": "3 lb tub",
      "location": "Walk-in Dairy Cooler"
    },
    "trader-joes": {
      "available": true,
      "price": 2.29,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.143,
      "unitSize": "16 oz tub",
      "location": "Dairy Wall (Left)"
    },
    "target": {
      "available": true,
      "price": 2.19,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.137,
      "unitSize": "16 oz tub",
      "location": "Grocery - Aisle G2 (Dairy & Milk)"
    }
  },
  "createdAt": 1730000051000,
  "updatedAt": 1730000051000
},
  {
  "id": "item-bread",
  "name": "Whole Wheat Bread",
  "category": "Bakery & Bread",
  "quantity": 1,
  "unit": "loaves",
  "isNeeded": true,
  "inCart": false,
  "notes": "100% whole wheat sandwich bread",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.89,
      "packageSize": 1,
      "packageUnit": "loaf",
      "unitPrice": 1.89,
      "unitSize": "20 oz loaf",
      "location": "Aisle 5 - Bakery & Bread"
    },
    "costco": {
      "available": true,
      "price": 5.49,
      "packageSize": 2,
      "packageUnit": "loaf",
      "unitPrice": 2.745,
      "unitSize": "2-pack 24 oz loaves",
      "location": "Bakery Section"
    },
    "trader-joes": {
      "available": true,
      "price": 2.49,
      "packageSize": 1,
      "packageUnit": "loaf",
      "unitPrice": 2.49,
      "unitSize": "24 oz loaf",
      "location": "Bakery / Bread Table"
    },
    "target": {
      "available": true,
      "price": 2.19,
      "packageSize": 1,
      "packageUnit": "loaf",
      "unitPrice": 2.19,
      "unitSize": "20 oz loaf",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000052000,
  "updatedAt": 1730000052000
},
  {
  "id": "item-sourdough",
  "name": "Sourdough Bread",
  "category": "Bakery & Bread",
  "quantity": 1,
  "unit": "loaves",
  "isNeeded": false,
  "inCart": false,
  "notes": "Artisan crusty sourdough boule or loaf",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.99,
      "packageSize": 1,
      "packageUnit": "loaf",
      "unitPrice": 2.99,
      "unitSize": "24 oz loaf",
      "location": "Aisle 5 - Bakery & Bread"
    },
    "costco": {
      "available": true,
      "price": 6.99,
      "packageSize": 2,
      "packageUnit": "loaf",
      "unitPrice": 3.495,
      "unitSize": "2-pack round boules",
      "location": "Bakery Section"
    },
    "trader-joes": {
      "available": true,
      "price": 3.49,
      "packageSize": 1,
      "packageUnit": "loaf",
      "unitPrice": 3.49,
      "unitSize": "24 oz loaf",
      "location": "Bakery / Bread Table"
    },
    "target": {
      "available": true,
      "price": 3.69,
      "packageSize": 1,
      "packageUnit": "loaf",
      "unitPrice": 3.69,
      "unitSize": "24 oz loaf",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000053000,
  "updatedAt": 1730000053000
},
  {
  "id": "item-bagels",
  "name": "Bagels",
  "category": "Bakery & Bread",
  "quantity": 1,
  "unit": "packs",
  "isNeeded": true,
  "inCart": false,
  "notes": "Plain or everything sliced bagels",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.99,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 1.99,
      "unitSize": "6-count bag",
      "location": "Aisle 5 - Bakery & Bread"
    },
    "costco": {
      "available": true,
      "price": 6.99,
      "packageSize": 2,
      "packageUnit": "pack",
      "unitPrice": 3.495,
      "unitSize": "2-pack (12 bagels)",
      "location": "Bakery Section"
    },
    "trader-joes": {
      "available": true,
      "price": 2.49,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 2.49,
      "unitSize": "6-count bag",
      "location": "Bakery / Bread Table"
    },
    "target": {
      "available": true,
      "price": 2.79,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 2.79,
      "unitSize": "6-count bag",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000054000,
  "updatedAt": 1730000054000
},
  {
  "id": "item-english-muffins",
  "name": "English Muffins",
  "category": "Bakery & Bread",
  "quantity": 1,
  "unit": "packs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Fork-split English muffins for breakfast",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.49,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 1.49,
      "unitSize": "6-count pack",
      "location": "Aisle 5 - Bakery & Bread"
    },
    "costco": {
      "available": true,
      "price": 6.49,
      "packageSize": 3,
      "packageUnit": "pack",
      "unitPrice": 2.163,
      "unitSize": "3-pack (18 muffins)",
      "location": "Bakery Section"
    },
    "trader-joes": {
      "available": true,
      "price": 1.99,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 1.99,
      "unitSize": "6-count pack",
      "location": "Bakery / Bread Table"
    },
    "target": {
      "available": true,
      "price": 2.29,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 2.29,
      "unitSize": "6-count pack",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000055000,
  "updatedAt": 1730000055000
},
  {
  "id": "item-flour-tortillas",
  "name": "Flour Tortillas",
  "category": "Bakery & Bread",
  "quantity": 1,
  "unit": "packs",
  "isNeeded": true,
  "inCart": false,
  "notes": "Soft burrito or fajita size tortillas",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.69,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 1.69,
      "unitSize": "10-count pack",
      "location": "Aisle 5 - Bakery & Bread"
    },
    "costco": {
      "available": true,
      "price": 5.99,
      "packageSize": 36,
      "packageUnit": "ct",
      "unitPrice": 0.166,
      "unitSize": "36-count pack",
      "location": "Bakery Section"
    },
    "trader-joes": {
      "available": true,
      "price": 2.29,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 2.29,
      "unitSize": "10-count pack",
      "location": "Bakery / Bread Table"
    },
    "target": {
      "available": true,
      "price": 2.19,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 2.19,
      "unitSize": "10-count pack",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000056000,
  "updatedAt": 1730000056000
},
  {
  "id": "item-corn-tortillas",
  "name": "Corn Tortillas",
  "category": "Bakery & Bread",
  "quantity": 1,
  "unit": "packs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Yellow or white corn taco tortillas",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.29,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 1.29,
      "unitSize": "30-count pack",
      "location": "Aisle 5 - Bakery & Bread"
    },
    "costco": {
      "available": true,
      "price": 4.99,
      "packageSize": 80,
      "packageUnit": "ct",
      "unitPrice": 0.062,
      "unitSize": "80-count pack",
      "location": "Bakery Section"
    },
    "trader-joes": {
      "available": true,
      "price": 1.69,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 1.69,
      "unitSize": "12-count handmade",
      "location": "Bakery / Bread Table"
    },
    "target": {
      "available": true,
      "price": 1.89,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 1.89,
      "unitSize": "30-count pack",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000057000,
  "updatedAt": 1730000057000
},
  {
  "id": "item-burger-buns",
  "name": "Hamburger Buns",
  "category": "Bakery & Bread",
  "quantity": 1,
  "unit": "packs",
  "isNeeded": false,
  "inCart": false,
  "notes": "8-count sesame or brioche burger buns",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.39,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 1.39,
      "unitSize": "8-count bag",
      "location": "Aisle 5 - Bakery & Bread"
    },
    "costco": {
      "available": true,
      "price": 5.49,
      "packageSize": 2,
      "packageUnit": "pack",
      "unitPrice": 2.745,
      "unitSize": "2-pack (16 buns)",
      "location": "Bakery Section"
    },
    "trader-joes": {
      "available": true,
      "price": 2.49,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 2.49,
      "unitSize": "4-pack brioche",
      "location": "Bakery / Bread Table"
    },
    "target": {
      "available": true,
      "price": 1.89,
      "packageSize": 1,
      "packageUnit": "pack",
      "unitPrice": 1.89,
      "unitSize": "8-count bag",
      "location": "Grocery - Produce"
    }
  },
  "createdAt": 1730000058000,
  "updatedAt": 1730000058000
},
  {
  "id": "item-olive-oil",
  "name": "Olive Oil",
  "category": "Pantry & Grains",
  "quantity": 33.8,
  "unit": "fl oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Extra virgin cold pressed olive oil",
  "shops": {
    "aldi": {
      "available": true,
      "price": 4.99,
      "packageSize": 16.9,
      "packageUnit": "fl oz",
      "unitPrice": 0.295,
      "unitSize": "16.9 fl oz (500 ml)",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 17.99,
      "packageSize": 67.6,
      "packageUnit": "fl oz",
      "unitPrice": 0.266,
      "unitSize": "2 Liters (67.6 fl oz)",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 8.99,
      "packageSize": 33.8,
      "packageUnit": "fl oz",
      "unitPrice": 0.266,
      "unitSize": "1 Liter (33.8 fl oz)",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 9.99,
      "packageSize": 33.8,
      "packageUnit": "fl oz",
      "unitPrice": 0.296,
      "unitSize": "1 Liter (33.8 fl oz)",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)",
      "packageOptions": [
        {
          "id": "opt-tgt-oil-500",
          "label": "16.9 fl oz (500 ml)",
          "packageSize": 16.9,
          "packageUnit": "fl oz",
          "price": 5.79,
          "unitPrice": 0.343
        },
        {
          "id": "opt-tgt-oil-1l",
          "label": "33.8 fl oz (1 Liter)",
          "packageSize": 33.8,
          "packageUnit": "fl oz",
          "price": 9.99,
          "unitPrice": 0.295
        }
      ]
    }
  },
  "createdAt": 1730000059000,
  "updatedAt": 1730000059000
},
  {
  "id": "item-peanut-butter",
  "name": "Peanut Butter",
  "category": "Pantry & Grains",
  "quantity": 32,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Creamy peanut butter",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.89,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.118,
      "unitSize": "16 oz jar",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 9.99,
      "packageSize": 56,
      "packageUnit": "oz",
      "unitPrice": 0.178,
      "unitSize": "2x 28 oz jars",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 2.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.156,
      "unitSize": "16 oz jar",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 2.19,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.137,
      "unitSize": "16 oz jar",
      "location": "Grocery - Aisle G5 (Cereal & Coffee)"
    }
  },
  "createdAt": 1730000060000,
  "updatedAt": 1730000060000
},
  {
  "id": "item-oats",
  "name": "Oats",
  "category": "Pantry & Grains",
  "quantity": 32,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Old fashioned rolled oats",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.89,
      "packageSize": 42,
      "packageUnit": "oz",
      "unitPrice": 0.069,
      "unitSize": "42 oz canister",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 9.99,
      "packageSize": 160,
      "packageUnit": "oz",
      "unitPrice": 0.062,
      "unitSize": "10 lb Box (160 oz)",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 3.29,
      "packageSize": 32,
      "packageUnit": "oz",
      "unitPrice": 0.103,
      "unitSize": "32 oz bag",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 3.29,
      "packageSize": 42,
      "packageUnit": "oz",
      "unitPrice": 0.078,
      "unitSize": "42 oz canister",
      "location": "Grocery - Aisle G5 (Cereal & Coffee)"
    }
  },
  "createdAt": 1730000061000,
  "updatedAt": 1730000061000
},
  {
  "id": "item-pasta",
  "name": "Pasta",
  "category": "Pantry & Grains",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Spaghetti or penne pasta",
  "shops": {
    "aldi": {
      "available": true,
      "price": 0.98,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.061,
      "unitSize": "16 oz box",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 8.99,
      "packageSize": 128,
      "packageUnit": "oz",
      "unitPrice": 0.07,
      "unitSize": "8-pack (8x 16 oz)",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 1.29,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.081,
      "unitSize": "16 oz bag",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 1.09,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.068,
      "unitSize": "16 oz box",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000062000,
  "updatedAt": 1730000062000
},
  {
  "id": "item-pasta-sauce",
  "name": "Pasta Sauce",
  "category": "Pantry & Grains",
  "quantity": 24,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Tomato basil marinara sauce",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.69,
      "packageSize": 24,
      "packageUnit": "oz",
      "unitPrice": 0.07,
      "unitSize": "24 oz jar",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 9.99,
      "packageSize": 96,
      "packageUnit": "oz",
      "unitPrice": 0.104,
      "unitSize": "4-pack (4x 24 oz)",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 2.29,
      "packageSize": 24,
      "packageUnit": "oz",
      "unitPrice": 0.095,
      "unitSize": "24 oz jar",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 1.99,
      "packageSize": 24,
      "packageUnit": "oz",
      "unitPrice": 0.083,
      "unitSize": "24 oz jar",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000063000,
  "updatedAt": 1730000063000
},
  {
  "id": "item-black-beans",
  "name": "Black Beans",
  "category": "Pantry & Grains",
  "quantity": 4,
  "unit": "cans",
  "isNeeded": true,
  "inCart": false,
  "notes": "Canned black beans",
  "shops": {
    "aldi": {
      "available": true,
      "price": 0.85,
      "packageSize": 1,
      "packageUnit": "can",
      "unitPrice": 0.85,
      "unitSize": "15 oz can",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 6.99,
      "packageSize": 8,
      "packageUnit": "can",
      "unitPrice": 0.874,
      "unitSize": "8-pack 15 oz cans",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 0.99,
      "packageSize": 1,
      "packageUnit": "can",
      "unitPrice": 0.99,
      "unitSize": "15 oz can",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 0.95,
      "packageSize": 1,
      "packageUnit": "can",
      "unitPrice": 0.95,
      "unitSize": "15 oz can",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000064000,
  "updatedAt": 1730000064000
},
  {
  "id": "item-chickpeas",
  "name": "Chickpeas",
  "category": "Pantry & Grains",
  "quantity": 4,
  "unit": "cans",
  "isNeeded": false,
  "inCart": false,
  "notes": "Garbanzo beans for hummus & salads",
  "shops": {
    "aldi": {
      "available": true,
      "price": 0.85,
      "packageSize": 1,
      "packageUnit": "can",
      "unitPrice": 0.85,
      "unitSize": "15 oz can",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 6.99,
      "packageSize": 8,
      "packageUnit": "can",
      "unitPrice": 0.874,
      "unitSize": "8-pack cans",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 0.99,
      "packageSize": 1,
      "packageUnit": "can",
      "unitPrice": 0.99,
      "unitSize": "15 oz can",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 0.95,
      "packageSize": 1,
      "packageUnit": "can",
      "unitPrice": 0.95,
      "unitSize": "15 oz can",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000065000,
  "updatedAt": 1730000065000
},
  {
  "id": "item-diced-tomatoes",
  "name": "Diced Tomatoes",
  "category": "Pantry & Grains",
  "quantity": 4,
  "unit": "cans",
  "isNeeded": false,
  "inCart": false,
  "notes": "Canned diced tomatoes for stews & chili",
  "shops": {
    "aldi": {
      "available": true,
      "price": 0.89,
      "packageSize": 1,
      "packageUnit": "can",
      "unitPrice": 0.89,
      "unitSize": "14.5 oz can",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 7.99,
      "packageSize": 8,
      "packageUnit": "can",
      "unitPrice": 0.999,
      "unitSize": "8-pack cans",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 1.19,
      "packageSize": 1,
      "packageUnit": "can",
      "unitPrice": 1.19,
      "unitSize": "14.5 oz can",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 0.99,
      "packageSize": 1,
      "packageUnit": "can",
      "unitPrice": 0.99,
      "unitSize": "14.5 oz can",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000066000,
  "updatedAt": 1730000066000
},
  {
  "id": "item-tomato-paste",
  "name": "Tomato Paste",
  "category": "Pantry & Grains",
  "quantity": 3,
  "unit": "cans",
  "isNeeded": false,
  "inCart": false,
  "notes": "Concentrated tomato paste",
  "shops": {
    "aldi": {
      "available": true,
      "price": 0.69,
      "packageSize": 1,
      "packageUnit": "can",
      "unitPrice": 0.69,
      "unitSize": "6 oz can",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 7.49,
      "packageSize": 12,
      "packageUnit": "can",
      "unitPrice": 0.624,
      "unitSize": "12-pack cans",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 0.99,
      "packageSize": 1,
      "packageUnit": "can",
      "unitPrice": 0.99,
      "unitSize": "6 oz can",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 0.79,
      "packageSize": 1,
      "packageUnit": "can",
      "unitPrice": 0.79,
      "unitSize": "6 oz can",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000067000,
  "updatedAt": 1730000067000
},
  {
  "id": "item-white-rice",
  "name": "White Rice",
  "category": "Pantry & Grains",
  "quantity": 5,
  "unit": "lbs",
  "isNeeded": true,
  "inCart": false,
  "notes": "Jasmine or long grain white rice",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.49,
      "packageSize": 5,
      "packageUnit": "lb",
      "unitPrice": 0.698,
      "unitSize": "5 lb bag",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 14.99,
      "packageSize": 25,
      "packageUnit": "lb",
      "unitPrice": 0.6,
      "unitSize": "25 lb sack",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 1.99,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 0.995,
      "unitSize": "2 lb bag",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 3.99,
      "packageSize": 5,
      "packageUnit": "lb",
      "unitPrice": 0.798,
      "unitSize": "5 lb bag",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000068000,
  "updatedAt": 1730000068000
},
  {
  "id": "item-brown-rice",
  "name": "Brown Rice",
  "category": "Pantry & Grains",
  "quantity": 2,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Whole grain brown rice",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.79,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 0.895,
      "unitSize": "2 lb bag",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 10.99,
      "packageSize": 12,
      "packageUnit": "lb",
      "unitPrice": 0.916,
      "unitSize": "12 lb sack",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 2.29,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 1.145,
      "unitSize": "2 lb bag",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 2.19,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 1.095,
      "unitSize": "2 lb bag",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000069000,
  "updatedAt": 1730000069000
},
  {
  "id": "item-quinoa",
  "name": "Quinoa",
  "category": "Pantry & Grains",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Tri-color grain bowl base",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.79,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.174,
      "unitSize": "16 oz pouch",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 9.49,
      "packageSize": 72,
      "packageUnit": "oz",
      "unitPrice": 0.132,
      "unitSize": "4.5 lb (72 oz) bag",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 3.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.218,
      "unitSize": "16 oz bag",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 3.29,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.206,
      "unitSize": "16 oz pouch",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000070000,
  "updatedAt": 1730000070000
},
  {
  "id": "item-flour",
  "name": "All-Purpose Flour",
  "category": "Pantry & Grains",
  "quantity": 5,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Unbleached all-purpose baking flour",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.19,
      "packageSize": 5,
      "packageUnit": "lb",
      "unitPrice": 0.438,
      "unitSize": "5 lb bag",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 8.99,
      "packageSize": 25,
      "packageUnit": "lb",
      "unitPrice": 0.36,
      "unitSize": "25 lb bag",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 2.99,
      "packageSize": 5,
      "packageUnit": "lb",
      "unitPrice": 0.598,
      "unitSize": "5 lb bag",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 2.49,
      "packageSize": 5,
      "packageUnit": "lb",
      "unitPrice": 0.498,
      "unitSize": "5 lb bag",
      "location": "Grocery - Aisle G5 (Cereal & Coffee)"
    }
  },
  "createdAt": 1730000071000,
  "updatedAt": 1730000071000
},
  {
  "id": "item-sugar",
  "name": "Granulated Sugar",
  "category": "Pantry & Grains",
  "quantity": 4,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Pure cane granulated white sugar",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.89,
      "packageSize": 4,
      "packageUnit": "lb",
      "unitPrice": 0.723,
      "unitSize": "4 lb bag",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 8.49,
      "packageSize": 10,
      "packageUnit": "lb",
      "unitPrice": 0.849,
      "unitSize": "10 lb bag",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 3.49,
      "packageSize": 4,
      "packageUnit": "lb",
      "unitPrice": 0.873,
      "unitSize": "4 lb bag",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 3.19,
      "packageSize": 4,
      "packageUnit": "lb",
      "unitPrice": 0.797,
      "unitSize": "4 lb bag",
      "location": "Grocery - Aisle G5 (Cereal & Coffee)"
    }
  },
  "createdAt": 1730000072000,
  "updatedAt": 1730000072000
},
  {
  "id": "item-brown-sugar",
  "name": "Brown Sugar",
  "category": "Pantry & Grains",
  "quantity": 2,
  "unit": "lbs",
  "isNeeded": false,
  "inCart": false,
  "notes": "Light or dark brown sugar for baking",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.79,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 0.895,
      "unitSize": "2 lb bag",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 5.99,
      "packageSize": 7,
      "packageUnit": "lb",
      "unitPrice": 0.856,
      "unitSize": "7 lb bag",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 2.29,
      "packageSize": 1,
      "packageUnit": "lb",
      "unitPrice": 2.29,
      "unitSize": "1 lb box",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 2.19,
      "packageSize": 2,
      "packageUnit": "lb",
      "unitPrice": 1.095,
      "unitSize": "2 lb bag",
      "location": "Grocery - Aisle G5 (Cereal & Coffee)"
    }
  },
  "createdAt": 1730000073000,
  "updatedAt": 1730000073000
},
  {
  "id": "item-chicken-broth",
  "name": "Chicken Broth",
  "category": "Pantry & Grains",
  "quantity": 32,
  "unit": "fl oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Low sodium chicken broth carton",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.39,
      "packageSize": 32,
      "packageUnit": "fl oz",
      "unitPrice": 0.043,
      "unitSize": "32 fl oz carton",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 9.99,
      "packageSize": 192,
      "packageUnit": "fl oz",
      "unitPrice": 0.052,
      "unitSize": "6-pack 32 fl oz",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 1.99,
      "packageSize": 32,
      "packageUnit": "fl oz",
      "unitPrice": 0.062,
      "unitSize": "32 fl oz carton",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 1.69,
      "packageSize": 32,
      "packageUnit": "fl oz",
      "unitPrice": 0.053,
      "unitSize": "32 fl oz carton",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000074000,
  "updatedAt": 1730000074000
},
  {
  "id": "item-vegetable-broth",
  "name": "Vegetable Broth",
  "category": "Pantry & Grains",
  "quantity": 32,
  "unit": "fl oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Hearty vegetable cooking broth",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.39,
      "packageSize": 32,
      "packageUnit": "fl oz",
      "unitPrice": 0.043,
      "unitSize": "32 fl oz carton",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 9.99,
      "packageSize": 192,
      "packageUnit": "fl oz",
      "unitPrice": 0.052,
      "unitSize": "6-pack 32 fl oz",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 1.99,
      "packageSize": 32,
      "packageUnit": "fl oz",
      "unitPrice": 0.062,
      "unitSize": "32 fl oz carton",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 1.69,
      "packageSize": 32,
      "packageUnit": "fl oz",
      "unitPrice": 0.053,
      "unitSize": "32 fl oz carton",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000075000,
  "updatedAt": 1730000075000
},
  {
  "id": "item-honey",
  "name": "Honey",
  "category": "Pantry & Grains",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Pure clover liquid honey",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.29,
      "packageSize": 12,
      "packageUnit": "oz",
      "unitPrice": 0.274,
      "unitSize": "12 oz bear",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 13.99,
      "packageSize": 72,
      "packageUnit": "oz",
      "unitPrice": 0.194,
      "unitSize": "3-pack 24 oz bears",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 4.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.281,
      "unitSize": "16 oz bottle",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 4.29,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.268,
      "unitSize": "16 oz bottle",
      "location": "Grocery - Aisle G5 (Cereal & Coffee)"
    }
  },
  "createdAt": 1730000076000,
  "updatedAt": 1730000076000
},
  {
  "id": "item-hot-sauce",
  "name": "Hot Sauce",
  "category": "Pantry & Grains",
  "quantity": 12,
  "unit": "fl oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Spicy pepper condiment",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.99,
      "packageSize": 12,
      "packageUnit": "fl oz",
      "unitPrice": 0.166,
      "unitSize": "12 fl oz bottle",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 8.99,
      "packageSize": 48,
      "packageUnit": "fl oz",
      "unitPrice": 0.187,
      "unitSize": "2x 24 fl oz bottles",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 2.49,
      "packageSize": 12,
      "packageUnit": "fl oz",
      "unitPrice": 0.208,
      "unitSize": "12 fl oz bottle",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 2.89,
      "packageSize": 12,
      "packageUnit": "fl oz",
      "unitPrice": 0.241,
      "unitSize": "12 fl oz bottle",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000077000,
  "updatedAt": 1730000077000
},
  {
  "id": "item-soy-sauce",
  "name": "Soy Sauce",
  "category": "Pantry & Grains",
  "quantity": 15,
  "unit": "fl oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Naturally brewed soy sauce",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.69,
      "packageSize": 15,
      "packageUnit": "fl oz",
      "unitPrice": 0.113,
      "unitSize": "15 fl oz bottle",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 6.99,
      "packageSize": 64,
      "packageUnit": "fl oz",
      "unitPrice": 0.109,
      "unitSize": "64 fl oz jug",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 2.29,
      "packageSize": 15,
      "packageUnit": "fl oz",
      "unitPrice": 0.153,
      "unitSize": "15 fl oz bottle",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 2.49,
      "packageSize": 15,
      "packageUnit": "fl oz",
      "unitPrice": 0.166,
      "unitSize": "15 fl oz bottle",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000078000,
  "updatedAt": 1730000078000
},
  {
  "id": "item-mayonnaise",
  "name": "Mayonnaise",
  "category": "Pantry & Grains",
  "quantity": 30,
  "unit": "fl oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Real mayonnaise jar",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.69,
      "packageSize": 30,
      "packageUnit": "fl oz",
      "unitPrice": 0.09,
      "unitSize": "30 fl oz jar",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 8.99,
      "packageSize": 64,
      "packageUnit": "fl oz",
      "unitPrice": 0.14,
      "unitSize": "64 fl oz jar",
      "location": "Aisle 14 - Canned & Condiments"
    },
    "trader-joes": {
      "available": true,
      "price": 3.49,
      "packageSize": 16,
      "packageUnit": "fl oz",
      "unitPrice": 0.218,
      "unitSize": "16 fl oz jar",
      "location": "Aisle 2 - Pantry & Sauces"
    },
    "target": {
      "available": true,
      "price": 3.79,
      "packageSize": 30,
      "packageUnit": "fl oz",
      "unitPrice": 0.126,
      "unitSize": "30 fl oz jar",
      "location": "Grocery - Aisle G8 (Pasta & Sauce)"
    }
  },
  "createdAt": 1730000079000,
  "updatedAt": 1730000079000
},
  {
  "id": "item-coffee",
  "name": "Ground Coffee",
  "category": "Pantry & Grains",
  "quantity": 12,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Medium roast ground coffee",
  "shops": {
    "aldi": {
      "available": true,
      "price": 4.99,
      "packageSize": 12,
      "packageUnit": "oz",
      "unitPrice": 0.416,
      "unitSize": "12 oz bag",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 14.99,
      "packageSize": 40,
      "packageUnit": "oz",
      "unitPrice": 0.375,
      "unitSize": "40 oz bag",
      "location": "Aisle 10 - Coffee & Tea"
    },
    "trader-joes": {
      "available": true,
      "price": 5.99,
      "packageSize": 12,
      "packageUnit": "oz",
      "unitPrice": 0.499,
      "unitSize": "12 oz canister",
      "location": "Beverages & Coffee"
    },
    "target": {
      "available": true,
      "price": 6.29,
      "packageSize": 12,
      "packageUnit": "oz",
      "unitPrice": 0.524,
      "unitSize": "12 oz bag",
      "location": "Grocery - Aisle G5 (Cereal & Coffee)"
    }
  },
  "createdAt": 1730000080000,
  "updatedAt": 1730000080000
},
  {
  "id": "item-tortilla-chips",
  "name": "Tortilla Chips",
  "category": "Snacks & Sweets",
  "quantity": 12,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Crispy sea salt tortilla chips",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.79,
      "packageSize": 10,
      "packageUnit": "oz",
      "unitPrice": 0.179,
      "unitSize": "10 oz bag",
      "location": "Aisle 3 - Snacks & Sweets"
    },
    "costco": {
      "available": true,
      "price": 5.49,
      "packageSize": 40,
      "packageUnit": "oz",
      "unitPrice": 0.137,
      "unitSize": "40 oz party bag",
      "location": "Aisle 18 - Snacks & Nuts"
    },
    "trader-joes": {
      "available": true,
      "price": 2.29,
      "packageSize": 12,
      "packageUnit": "oz",
      "unitPrice": 0.191,
      "unitSize": "12 oz bag",
      "location": "Aisle 1 - Chips & Snacks"
    },
    "target": {
      "available": true,
      "price": 2.49,
      "packageSize": 12,
      "packageUnit": "oz",
      "unitPrice": 0.208,
      "unitSize": "12 oz bag",
      "location": "Grocery - Aisle G14 (Snacks & Chips)"
    }
  },
  "createdAt": 1730000081000,
  "updatedAt": 1730000081000
},
  {
  "id": "item-potato-chips",
  "name": "Potato Chips",
  "category": "Snacks & Sweets",
  "quantity": 8,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Classic salted kettle potato chips",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.89,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.236,
      "unitSize": "8 oz bag",
      "location": "Aisle 3 - Snacks & Sweets"
    },
    "costco": {
      "available": true,
      "price": 5.99,
      "packageSize": 30,
      "packageUnit": "oz",
      "unitPrice": 0.2,
      "unitSize": "30 oz party bag",
      "location": "Aisle 18 - Snacks & Nuts"
    },
    "trader-joes": {
      "available": true,
      "price": 2.49,
      "packageSize": 7,
      "packageUnit": "oz",
      "unitPrice": 0.356,
      "unitSize": "7 oz bag",
      "location": "Aisle 1 - Chips & Snacks"
    },
    "target": {
      "available": true,
      "price": 2.69,
      "packageSize": 8,
      "packageUnit": "oz",
      "unitPrice": 0.336,
      "unitSize": "8 oz bag",
      "location": "Grocery - Aisle G14 (Snacks & Chips)"
    }
  },
  "createdAt": 1730000082000,
  "updatedAt": 1730000082000
},
  {
  "id": "item-pretzels",
  "name": "Pretzels",
  "category": "Snacks & Sweets",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Crispy sourdough pretzel nuggets or twists",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.99,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.124,
      "unitSize": "16 oz bag",
      "location": "Aisle 3 - Snacks & Sweets"
    },
    "costco": {
      "available": true,
      "price": 6.99,
      "packageSize": 52,
      "packageUnit": "oz",
      "unitPrice": 0.134,
      "unitSize": "52 oz tub",
      "location": "Aisle 18 - Snacks & Nuts"
    },
    "trader-joes": {
      "available": true,
      "price": 2.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.156,
      "unitSize": "16 oz bag",
      "location": "Aisle 1 - Chips & Snacks"
    },
    "target": {
      "available": true,
      "price": 2.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.156,
      "unitSize": "16 oz bag",
      "location": "Grocery - Aisle G14 (Snacks & Chips)"
    }
  },
  "createdAt": 1730000083000,
  "updatedAt": 1730000083000
},
  {
  "id": "item-popcorn",
  "name": "Popcorn",
  "category": "Snacks & Sweets",
  "quantity": 6,
  "unit": "bags",
  "isNeeded": false,
  "inCart": false,
  "notes": "Microwave butter popcorn or bagged",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.19,
      "packageSize": 6,
      "packageUnit": "bag",
      "unitPrice": 0.365,
      "unitSize": "6-count box",
      "location": "Aisle 3 - Snacks & Sweets"
    },
    "costco": {
      "available": true,
      "price": 11.99,
      "packageSize": 44,
      "packageUnit": "bag",
      "unitPrice": 0.273,
      "unitSize": "44-pack box",
      "location": "Aisle 18 - Snacks & Nuts"
    },
    "trader-joes": {
      "available": true,
      "price": 2.29,
      "packageSize": 5,
      "packageUnit": "oz",
      "unitPrice": 0.458,
      "unitSize": "5 oz bag movie theater",
      "location": "Aisle 1 - Chips & Snacks"
    },
    "target": {
      "available": true,
      "price": 2.99,
      "packageSize": 6,
      "packageUnit": "bag",
      "unitPrice": 0.498,
      "unitSize": "6-count box",
      "location": "Grocery - Aisle G14 (Snacks & Chips)"
    }
  },
  "createdAt": 1730000084000,
  "updatedAt": 1730000084000
},
  {
  "id": "item-almonds",
  "name": "Almonds",
  "category": "Snacks & Sweets",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Whole roasted or raw almonds",
  "shops": {
    "aldi": {
      "available": true,
      "price": 4.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.281,
      "unitSize": "16 oz bag",
      "location": "Aisle 3 - Snacks & Sweets"
    },
    "costco": {
      "available": true,
      "price": 11.99,
      "packageSize": 48,
      "packageUnit": "oz",
      "unitPrice": 0.25,
      "unitSize": "3 lb (48 oz) bag",
      "location": "Aisle 18 - Snacks & Nuts"
    },
    "trader-joes": {
      "available": true,
      "price": 4.99,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.312,
      "unitSize": "16 oz bag",
      "location": "Aisle 1 - Chips & Snacks"
    },
    "target": {
      "available": true,
      "price": 5.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.343,
      "unitSize": "16 oz pouch",
      "location": "Grocery - Aisle G14 (Snacks & Chips)"
    }
  },
  "createdAt": 1730000085000,
  "updatedAt": 1730000085000
},
  {
  "id": "item-walnuts",
  "name": "Walnuts",
  "category": "Snacks & Sweets",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Raw walnut halves & pieces",
  "shops": {
    "aldi": {
      "available": true,
      "price": 4.79,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.299,
      "unitSize": "16 oz bag",
      "location": "Aisle 3 - Snacks & Sweets"
    },
    "costco": {
      "available": true,
      "price": 10.99,
      "packageSize": 48,
      "packageUnit": "oz",
      "unitPrice": 0.229,
      "unitSize": "3 lb bag",
      "location": "Aisle 18 - Snacks & Nuts"
    },
    "trader-joes": {
      "available": true,
      "price": 5.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.343,
      "unitSize": "16 oz bag",
      "location": "Aisle 1 - Chips & Snacks"
    },
    "target": {
      "available": true,
      "price": 5.99,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.374,
      "unitSize": "16 oz bag",
      "location": "Grocery - Aisle G14 (Snacks & Chips)"
    }
  },
  "createdAt": 1730000086000,
  "updatedAt": 1730000086000
},
  {
  "id": "item-chocolate",
  "name": "Dark Chocolate",
  "category": "Snacks & Sweets",
  "quantity": 3,
  "unit": "pieces",
  "isNeeded": true,
  "inCart": false,
  "notes": "70%+ rich dark chocolate bars",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.99,
      "packageSize": 1,
      "packageUnit": "piece",
      "unitPrice": 1.99,
      "unitSize": "3.5 oz bar",
      "location": "Aisle 3 - Snacks & Sweets"
    },
    "costco": {
      "available": true,
      "price": 10.99,
      "packageSize": 20,
      "packageUnit": "piece",
      "unitPrice": 0.549,
      "unitSize": "Bag of squares (~20 ct)",
      "location": "Aisle 18 - Snacks & Nuts"
    },
    "trader-joes": {
      "available": true,
      "price": 2.49,
      "packageSize": 3,
      "packageUnit": "piece",
      "unitPrice": 0.83,
      "unitSize": "3-pack 3 oz bars",
      "location": "Aisle 1 - Chips & Snacks"
    },
    "target": {
      "available": true,
      "price": 2.99,
      "packageSize": 1,
      "packageUnit": "piece",
      "unitPrice": 2.99,
      "unitSize": "3.5 oz bar",
      "location": "Grocery - Aisle G14 (Snacks & Chips)"
    }
  },
  "createdAt": 1730000087000,
  "updatedAt": 1730000087000
},
  {
  "id": "item-frozen-berries",
  "name": "Frozen Mixed Berries",
  "category": "Frozen Foods",
  "quantity": 32,
  "unit": "oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Frozen berry blend for smoothies",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.49,
      "packageSize": 12,
      "packageUnit": "oz",
      "unitPrice": 0.208,
      "unitSize": "12 oz bag",
      "location": "Aisle 4 - Frozen Cases"
    },
    "costco": {
      "available": true,
      "price": 9.99,
      "packageSize": 48,
      "packageUnit": "oz",
      "unitPrice": 0.208,
      "unitSize": "3 lb (48 oz) bag",
      "location": "Center Freezers"
    },
    "trader-joes": {
      "available": true,
      "price": 3.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.218,
      "unitSize": "16 oz bag",
      "location": "Aisle 3 - Frozen & Entrees"
    },
    "target": {
      "available": true,
      "price": 6.79,
      "packageSize": 32,
      "packageUnit": "oz",
      "unitPrice": 0.212,
      "unitSize": "32 oz bag",
      "location": "Grocery - Aisle G11 (Frozen Foods)"
    }
  },
  "createdAt": 1730000088000,
  "updatedAt": 1730000088000
},
  {
  "id": "item-frozen-peas",
  "name": "Frozen Peas",
  "category": "Frozen Foods",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Sweet green frozen peas",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.19,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.074,
      "unitSize": "16 oz bag",
      "location": "Aisle 4 - Frozen Cases"
    },
    "costco": {
      "available": true,
      "price": 6.99,
      "packageSize": 80,
      "packageUnit": "oz",
      "unitPrice": 0.087,
      "unitSize": "5 lb (80 oz) bag",
      "location": "Center Freezers"
    },
    "trader-joes": {
      "available": true,
      "price": 1.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.093,
      "unitSize": "16 oz bag",
      "location": "Aisle 3 - Frozen & Entrees"
    },
    "target": {
      "available": true,
      "price": 1.39,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.087,
      "unitSize": "16 oz bag",
      "location": "Grocery - Aisle G11 (Frozen Foods)"
    }
  },
  "createdAt": 1730000089000,
  "updatedAt": 1730000089000
},
  {
  "id": "item-frozen-corn",
  "name": "Frozen Corn",
  "category": "Frozen Foods",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Sweet whole kernel yellow corn",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.19,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.074,
      "unitSize": "16 oz bag",
      "location": "Aisle 4 - Frozen Cases"
    },
    "costco": {
      "available": true,
      "price": 6.99,
      "packageSize": 80,
      "packageUnit": "oz",
      "unitPrice": 0.087,
      "unitSize": "5 lb bag",
      "location": "Center Freezers"
    },
    "trader-joes": {
      "available": true,
      "price": 1.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.093,
      "unitSize": "16 oz bag",
      "location": "Aisle 3 - Frozen & Entrees"
    },
    "target": {
      "available": true,
      "price": 1.39,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.087,
      "unitSize": "16 oz bag",
      "location": "Grocery - Aisle G11 (Frozen Foods)"
    }
  },
  "createdAt": 1730000090000,
  "updatedAt": 1730000090000
},
  {
  "id": "item-frozen-broccoli",
  "name": "Frozen Broccoli",
  "category": "Frozen Foods",
  "quantity": 16,
  "unit": "oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Frozen broccoli florets for quick sides",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.29,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.081,
      "unitSize": "16 oz bag",
      "location": "Aisle 4 - Frozen Cases"
    },
    "costco": {
      "available": true,
      "price": 7.99,
      "packageSize": 64,
      "packageUnit": "oz",
      "unitPrice": 0.125,
      "unitSize": "4x 16 oz bags",
      "location": "Center Freezers"
    },
    "trader-joes": {
      "available": true,
      "price": 1.79,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.112,
      "unitSize": "16 oz bag",
      "location": "Aisle 3 - Frozen & Entrees"
    },
    "target": {
      "available": true,
      "price": 1.49,
      "packageSize": 16,
      "packageUnit": "oz",
      "unitPrice": 0.093,
      "unitSize": "16 oz bag",
      "location": "Grocery - Aisle G11 (Frozen Foods)"
    }
  },
  "createdAt": 1730000091000,
  "updatedAt": 1730000091000
},
  {
  "id": "item-frozen-pizza",
  "name": "Frozen Pizza",
  "category": "Frozen Foods",
  "quantity": 2,
  "unit": "pieces",
  "isNeeded": true,
  "inCart": false,
  "notes": "Thin crust pepperoni or four cheese pizza",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.99,
      "packageSize": 1,
      "packageUnit": "piece",
      "unitPrice": 3.99,
      "unitSize": "1 pizza box",
      "location": "Aisle 4 - Frozen Cases"
    },
    "costco": {
      "available": true,
      "price": 13.99,
      "packageSize": 4,
      "packageUnit": "piece",
      "unitPrice": 3.498,
      "unitSize": "4-pack boxes",
      "location": "Center Freezers"
    },
    "trader-joes": {
      "available": true,
      "price": 4.99,
      "packageSize": 1,
      "packageUnit": "piece",
      "unitPrice": 4.99,
      "unitSize": "1 pizza box",
      "location": "Aisle 3 - Frozen & Entrees"
    },
    "target": {
      "available": true,
      "price": 4.49,
      "packageSize": 1,
      "packageUnit": "piece",
      "unitPrice": 4.49,
      "unitSize": "1 pizza box",
      "location": "Grocery - Aisle G11 (Frozen Foods)"
    }
  },
  "createdAt": 1730000092000,
  "updatedAt": 1730000092000
},
  {
  "id": "item-frozen-waffles",
  "name": "Frozen Waffles",
  "category": "Frozen Foods",
  "quantity": 1,
  "unit": "boxes",
  "isNeeded": false,
  "inCart": false,
  "notes": "Homestyle toaster waffles (10 count)",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.89,
      "packageSize": 1,
      "packageUnit": "box",
      "unitPrice": 1.89,
      "unitSize": "10-count box",
      "location": "Aisle 4 - Frozen Cases"
    },
    "costco": {
      "available": true,
      "price": 9.99,
      "packageSize": 6,
      "packageUnit": "box",
      "unitPrice": 1.665,
      "unitSize": "60-count bulk box",
      "location": "Center Freezers"
    },
    "trader-joes": {
      "available": true,
      "price": 2.29,
      "packageSize": 1,
      "packageUnit": "box",
      "unitPrice": 2.29,
      "unitSize": "8-count box",
      "location": "Aisle 3 - Frozen & Entrees"
    },
    "target": {
      "available": true,
      "price": 2.39,
      "packageSize": 1,
      "packageUnit": "box",
      "unitPrice": 2.39,
      "unitSize": "10-count box",
      "location": "Grocery - Aisle G11 (Frozen Foods)"
    }
  },
  "createdAt": 1730000093000,
  "updatedAt": 1730000093000
},
  {
  "id": "item-green-tea",
  "name": "Green Tea",
  "category": "Beverages",
  "quantity": 20,
  "unit": "bags",
  "isNeeded": false,
  "inCart": false,
  "notes": "Organic green tea bags",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.79,
      "packageSize": 20,
      "packageUnit": "bag",
      "unitPrice": 0.089,
      "unitSize": "20 bags box",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 12.99,
      "packageSize": 100,
      "packageUnit": "bag",
      "unitPrice": 0.13,
      "unitSize": "100 bags box",
      "location": "Aisle 10 - Coffee & Tea"
    },
    "trader-joes": {
      "available": true,
      "price": 2.49,
      "packageSize": 20,
      "packageUnit": "bag",
      "unitPrice": 0.125,
      "unitSize": "20 bags box",
      "location": "Beverages & Coffee"
    },
    "target": {
      "available": true,
      "price": 2.79,
      "packageSize": 20,
      "packageUnit": "bag",
      "unitPrice": 0.14,
      "unitSize": "20 bags box",
      "location": "Grocery - Aisle G5 (Cereal & Coffee)"
    }
  },
  "createdAt": 1730000094000,
  "updatedAt": 1730000094000
},
  {
  "id": "item-orange-juice",
  "name": "Orange Juice",
  "category": "Beverages",
  "quantity": 52,
  "unit": "fl oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "100% pure squeezed no pulp orange juice",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.99,
      "packageSize": 52,
      "packageUnit": "fl oz",
      "unitPrice": 0.058,
      "unitSize": "52 fl oz bottle",
      "location": "Aisle 1 - Dairy & Eggs"
    },
    "costco": {
      "available": true,
      "price": 7.99,
      "packageSize": 118,
      "packageUnit": "fl oz",
      "unitPrice": 0.068,
      "unitSize": "2x 59 fl oz bottles",
      "location": "Walk-in Dairy Cooler"
    },
    "trader-joes": {
      "available": true,
      "price": 3.49,
      "packageSize": 52,
      "packageUnit": "fl oz",
      "unitPrice": 0.067,
      "unitSize": "52 fl oz bottle",
      "location": "Dairy Wall (Left)"
    },
    "target": {
      "available": true,
      "price": 3.89,
      "packageSize": 52,
      "packageUnit": "fl oz",
      "unitPrice": 0.075,
      "unitSize": "52 fl oz bottle",
      "location": "Grocery - Aisle G2 (Dairy & Milk)"
    }
  },
  "createdAt": 1730000095000,
  "updatedAt": 1730000095000
},
  {
  "id": "item-sparkling-water",
  "name": "Sparkling Water",
  "category": "Beverages",
  "quantity": 12,
  "unit": "cans",
  "isNeeded": true,
  "inCart": false,
  "notes": "Flavored sparkling water 12-pack",
  "shops": {
    "aldi": {
      "available": true,
      "price": 3.49,
      "packageSize": 12,
      "packageUnit": "can",
      "unitPrice": 0.291,
      "unitSize": "12-pack 12 oz cans",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 9.99,
      "packageSize": 30,
      "packageUnit": "can",
      "unitPrice": 0.333,
      "unitSize": "30-pack variety",
      "location": "Aisle 10 - Coffee & Tea"
    },
    "trader-joes": {
      "available": true,
      "price": 3.99,
      "packageSize": 8,
      "packageUnit": "can",
      "unitPrice": 0.499,
      "unitSize": "8-pack cans",
      "location": "Beverages & Coffee"
    },
    "target": {
      "available": true,
      "price": 3.99,
      "packageSize": 12,
      "packageUnit": "can",
      "unitPrice": 0.333,
      "unitSize": "12-pack cans",
      "location": "Grocery - Aisle G5 (Cereal & Coffee)"
    }
  },
  "createdAt": 1730000096000,
  "updatedAt": 1730000096000
},
  {
  "id": "item-apple-juice",
  "name": "Apple Juice",
  "category": "Beverages",
  "quantity": 64,
  "unit": "fl oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "100% apple juice bottle",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.99,
      "packageSize": 64,
      "packageUnit": "fl oz",
      "unitPrice": 0.031,
      "unitSize": "64 fl oz bottle",
      "location": "Aisle 2 - Canned & Grains"
    },
    "costco": {
      "available": true,
      "price": 7.49,
      "packageSize": 192,
      "packageUnit": "fl oz",
      "unitPrice": 0.039,
      "unitSize": "2x 96 fl oz jugs",
      "location": "Aisle 10 - Coffee & Tea"
    },
    "trader-joes": {
      "available": true,
      "price": 2.99,
      "packageSize": 64,
      "packageUnit": "fl oz",
      "unitPrice": 0.047,
      "unitSize": "64 fl oz bottle",
      "location": "Beverages & Coffee"
    },
    "target": {
      "available": true,
      "price": 2.29,
      "packageSize": 64,
      "packageUnit": "fl oz",
      "unitPrice": 0.036,
      "unitSize": "64 fl oz bottle",
      "location": "Grocery - Aisle G5 (Cereal & Coffee)"
    }
  },
  "createdAt": 1730000097000,
  "updatedAt": 1730000097000
},
  {
  "id": "item-paper-towels",
  "name": "Paper Towels",
  "category": "Household & Cleaning",
  "quantity": 6,
  "unit": "rolls",
  "isNeeded": true,
  "inCart": false,
  "notes": "Absorbent select-a-size paper towels",
  "shops": {
    "aldi": {
      "available": true,
      "price": 5.99,
      "packageSize": 6,
      "packageUnit": "roll",
      "unitPrice": 0.998,
      "unitSize": "6 double rolls",
      "location": "Aldi Finds Aisle"
    },
    "costco": {
      "available": true,
      "price": 19.99,
      "packageSize": 12,
      "packageUnit": "roll",
      "unitPrice": 1.666,
      "unitSize": "12 super rolls",
      "location": "Front Register Aisles"
    },
    "trader-joes": {
      "available": true,
      "price": 4.99,
      "packageSize": 3,
      "packageUnit": "roll",
      "unitPrice": 1.663,
      "unitSize": "3 jumbo rolls",
      "location": "Checkout Endcaps"
    },
    "target": {
      "available": true,
      "price": 7.99,
      "packageSize": 6,
      "packageUnit": "roll",
      "unitPrice": 1.332,
      "unitSize": "6 double rolls",
      "location": "Household / Paper Goods"
    }
  },
  "createdAt": 1730000098000,
  "updatedAt": 1730000098000
},
  {
  "id": "item-toilet-paper",
  "name": "Toilet Paper",
  "category": "Household & Cleaning",
  "quantity": 12,
  "unit": "rolls",
  "isNeeded": true,
  "inCart": false,
  "notes": "Soft 2-ply bath tissue rolls",
  "shops": {
    "aldi": {
      "available": true,
      "price": 6.99,
      "packageSize": 12,
      "packageUnit": "roll",
      "unitPrice": 0.583,
      "unitSize": "12 mega rolls",
      "location": "Aldi Finds Aisle"
    },
    "costco": {
      "available": true,
      "price": 19.99,
      "packageSize": 30,
      "packageUnit": "roll",
      "unitPrice": 0.666,
      "unitSize": "30 mega rolls",
      "location": "Front Register Aisles"
    },
    "trader-joes": {
      "available": true,
      "price": 4.49,
      "packageSize": 6,
      "packageUnit": "roll",
      "unitPrice": 0.748,
      "unitSize": "6 rolls",
      "location": "Checkout Endcaps"
    },
    "target": {
      "available": true,
      "price": 8.99,
      "packageSize": 12,
      "packageUnit": "roll",
      "unitPrice": 0.749,
      "unitSize": "12 mega rolls",
      "location": "Household / Paper Goods"
    }
  },
  "createdAt": 1730000099000,
  "updatedAt": 1730000099000
},
  {
  "id": "item-dish-soap",
  "name": "Dish Soap",
  "category": "Household & Cleaning",
  "quantity": 16,
  "unit": "fl oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Grease-cutting liquid dish soap",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.89,
      "packageSize": 24,
      "packageUnit": "fl oz",
      "unitPrice": 0.079,
      "unitSize": "24 fl oz bottle",
      "location": "Aldi Finds Aisle"
    },
    "costco": {
      "available": true,
      "price": 9.99,
      "packageSize": 90,
      "packageUnit": "fl oz",
      "unitPrice": 0.111,
      "unitSize": "90 fl oz jug",
      "location": "Front Register Aisles"
    },
    "trader-joes": {
      "available": true,
      "price": 2.99,
      "packageSize": 25,
      "packageUnit": "fl oz",
      "unitPrice": 0.12,
      "unitSize": "25 fl oz bottle",
      "location": "Checkout Endcaps"
    },
    "target": {
      "available": true,
      "price": 2.99,
      "packageSize": 19,
      "packageUnit": "fl oz",
      "unitPrice": 0.157,
      "unitSize": "19 fl oz bottle",
      "location": "Household / Paper Goods"
    }
  },
  "createdAt": 1730000100000,
  "updatedAt": 1730000100000
},
  {
  "id": "item-trash-bags",
  "name": "Trash Bags",
  "category": "Household & Cleaning",
  "quantity": 40,
  "unit": "pieces",
  "isNeeded": false,
  "inCart": false,
  "notes": "13-gallon kitchen drawstring trash bags",
  "shops": {
    "aldi": {
      "available": true,
      "price": 6.99,
      "packageSize": 40,
      "packageUnit": "ct",
      "unitPrice": 0.175,
      "unitSize": "40 count box",
      "location": "Aldi Finds Aisle"
    },
    "costco": {
      "available": true,
      "price": 16.99,
      "packageSize": 200,
      "packageUnit": "ct",
      "unitPrice": 0.085,
      "unitSize": "200 count box",
      "location": "Front Register Aisles"
    },
    "trader-joes": {
      "available": true,
      "price": 4.99,
      "packageSize": 20,
      "packageUnit": "ct",
      "unitPrice": 0.249,
      "unitSize": "20 count box",
      "location": "Checkout Endcaps"
    },
    "target": {
      "available": true,
      "price": 8.99,
      "packageSize": 45,
      "packageUnit": "ct",
      "unitPrice": 0.2,
      "unitSize": "45 count box",
      "location": "Household / Paper Goods"
    }
  },
  "createdAt": 1730000101000,
  "updatedAt": 1730000101000
},
  {
  "id": "item-laundry-detergent",
  "name": "Laundry Detergent",
  "category": "Household & Cleaning",
  "quantity": 100,
  "unit": "fl oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Liquid laundry detergent for 64+ loads",
  "shops": {
    "aldi": {
      "available": true,
      "price": 7.99,
      "packageSize": 100,
      "packageUnit": "fl oz",
      "unitPrice": 0.08,
      "unitSize": "100 fl oz bottle",
      "location": "Aldi Finds Aisle"
    },
    "costco": {
      "available": true,
      "price": 17.99,
      "packageSize": 194,
      "packageUnit": "fl oz",
      "unitPrice": 0.093,
      "unitSize": "194 fl oz jug",
      "location": "Front Register Aisles"
    },
    "trader-joes": {
      "available": true,
      "price": 6.99,
      "packageSize": 64,
      "packageUnit": "fl oz",
      "unitPrice": 0.109,
      "unitSize": "64 fl oz bottle",
      "location": "Checkout Endcaps"
    },
    "target": {
      "available": true,
      "price": 11.99,
      "packageSize": 100,
      "packageUnit": "fl oz",
      "unitPrice": 0.12,
      "unitSize": "100 fl oz bottle",
      "location": "Household / Paper Goods"
    }
  },
  "createdAt": 1730000102000,
  "updatedAt": 1730000102000
},
  {
  "id": "item-hand-soap",
  "name": "Hand Soap",
  "category": "Personal Care",
  "quantity": 12,
  "unit": "fl oz",
  "isNeeded": true,
  "inCart": false,
  "notes": "Liquid moisturizing hand soap pump",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.49,
      "packageSize": 7.5,
      "packageUnit": "fl oz",
      "unitPrice": 0.199,
      "unitSize": "7.5 fl oz bottle",
      "location": "Aldi Finds Aisle"
    },
    "costco": {
      "available": true,
      "price": 8.99,
      "packageSize": 80,
      "packageUnit": "fl oz",
      "unitPrice": 0.112,
      "unitSize": "4-pack bottles",
      "location": "Front Register Aisles"
    },
    "trader-joes": {
      "available": true,
      "price": 2.99,
      "packageSize": 16,
      "packageUnit": "fl oz",
      "unitPrice": 0.187,
      "unitSize": "16 fl oz bottle",
      "location": "Checkout Endcaps"
    },
    "target": {
      "available": true,
      "price": 1.99,
      "packageSize": 12,
      "packageUnit": "fl oz",
      "unitPrice": 0.166,
      "unitSize": "12 fl oz pump",
      "location": "Household / Paper Goods"
    }
  },
  "createdAt": 1730000103000,
  "updatedAt": 1730000103000
},
  {
  "id": "item-body-wash",
  "name": "Body Wash",
  "category": "Personal Care",
  "quantity": 18,
  "unit": "fl oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Moisturizing body wash bottle",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.49,
      "packageSize": 18,
      "packageUnit": "fl oz",
      "unitPrice": 0.138,
      "unitSize": "18 fl oz bottle",
      "location": "Aldi Finds Aisle"
    },
    "costco": {
      "available": true,
      "price": 11.99,
      "packageSize": 60,
      "packageUnit": "fl oz",
      "unitPrice": 0.2,
      "unitSize": "3-pack bottles",
      "location": "Front Register Aisles"
    },
    "trader-joes": {
      "available": true,
      "price": 3.99,
      "packageSize": 16,
      "packageUnit": "fl oz",
      "unitPrice": 0.249,
      "unitSize": "16 fl oz bottle",
      "location": "Checkout Endcaps"
    },
    "target": {
      "available": true,
      "price": 4.49,
      "packageSize": 18,
      "packageUnit": "fl oz",
      "unitPrice": 0.249,
      "unitSize": "18 fl oz bottle",
      "location": "Household / Paper Goods"
    }
  },
  "createdAt": 1730000104000,
  "updatedAt": 1730000104000
},
  {
  "id": "item-toothpaste",
  "name": "Toothpaste",
  "category": "Personal Care",
  "quantity": 2,
  "unit": "pieces",
  "isNeeded": true,
  "inCart": false,
  "notes": "Fluoride cavity protection toothpaste tubes",
  "shops": {
    "aldi": {
      "available": true,
      "price": 1.69,
      "packageSize": 1,
      "packageUnit": "piece",
      "unitPrice": 1.69,
      "unitSize": "6 oz tube",
      "location": "Aldi Finds Aisle"
    },
    "costco": {
      "available": true,
      "price": 12.99,
      "packageSize": 5,
      "packageUnit": "piece",
      "unitPrice": 2.598,
      "unitSize": "5-pack tubes",
      "location": "Front Register Aisles"
    },
    "trader-joes": {
      "available": true,
      "price": 2.49,
      "packageSize": 1,
      "packageUnit": "piece",
      "unitPrice": 2.49,
      "unitSize": "6 oz tube",
      "location": "Checkout Endcaps"
    },
    "target": {
      "available": true,
      "price": 3.99,
      "packageSize": 2,
      "packageUnit": "piece",
      "unitPrice": 1.995,
      "unitSize": "2-pack tubes",
      "location": "Household / Paper Goods"
    }
  },
  "createdAt": 1730000105000,
  "updatedAt": 1730000105000
},
  {
  "id": "item-shampoo",
  "name": "Shampoo",
  "category": "Personal Care",
  "quantity": 16,
  "unit": "fl oz",
  "isNeeded": false,
  "inCart": false,
  "notes": "Daily clarifying or moisturizing shampoo",
  "shops": {
    "aldi": {
      "available": true,
      "price": 2.49,
      "packageSize": 16,
      "packageUnit": "fl oz",
      "unitPrice": 0.156,
      "unitSize": "16 fl oz bottle",
      "location": "Aldi Finds Aisle"
    },
    "costco": {
      "available": true,
      "price": 10.99,
      "packageSize": 33.8,
      "packageUnit": "fl oz",
      "unitPrice": 0.325,
      "unitSize": "1 Liter bottle",
      "location": "Front Register Aisles"
    },
    "trader-joes": {
      "available": true,
      "price": 3.99,
      "packageSize": 16,
      "packageUnit": "fl oz",
      "unitPrice": 0.249,
      "unitSize": "16 fl oz bottle",
      "location": "Checkout Endcaps"
    },
    "target": {
      "available": true,
      "price": 4.99,
      "packageSize": 16,
      "packageUnit": "fl oz",
      "unitPrice": 0.312,
      "unitSize": "16 fl oz bottle",
      "location": "Household / Paper Goods"
    }
  },
  "createdAt": 1730000106000,
  "updatedAt": 1730000106000
},
]
