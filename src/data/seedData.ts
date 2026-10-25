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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.99,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.249,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 3.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.218,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 2.99,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.187,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 3.79,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.237,
        "location": "Grocery - Produce",
        "packageOptions": [
          {
            "id": "opt-spinach-5oz",
            "packageSize": 5,
            "packageUnit": "oz",
            "price": 2.19,
            "unitPrice": 0.438
          },
          {
            "id": "opt-spinach-16oz",
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.29,
        "packageSize": 6,
        "packageUnit": "ct",
        "unitPrice": 0.548,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 6.99,
        "packageSize": 6,
        "packageUnit": "ct",
        "unitPrice": 1.165,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 3.49,
        "packageSize": 4,
        "packageUnit": "ct",
        "unitPrice": 0.873,
        "location": "Front Produce Section",
        "packageOptions": [
          {
            "id": "opt-tj-avo-single",
            "packageSize": 1,
            "packageUnit": "piece",
            "price": 0.89,
            "unitPrice": 0.89
          },
          {
            "id": "opt-tj-avo-4pack",
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 0.52,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 0.52,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 1.89,
        "packageSize": 3,
        "packageUnit": "lb",
        "unitPrice": 0.63,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 0.25,
        "packageSize": 1,
        "packageUnit": "piece",
        "unitPrice": 0.25,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 0.59,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 0.59,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.49,
        "packageSize": 11,
        "packageUnit": "oz",
        "unitPrice": 0.226,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 4.79,
        "packageSize": 18,
        "packageUnit": "oz",
        "unitPrice": 0.266,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 4.99,
        "packageSize": 18,
        "packageUnit": "oz",
        "unitPrice": 0.277,
        "location": "Front Produce Section",
        "packageOptions": [
          {
            "id": "opt-tj-blue-6oz",
            "packageSize": 6,
            "packageUnit": "oz",
            "price": 2.99,
            "unitPrice": 0.498
          },
          {
            "id": "opt-tj-blue-18oz",
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.156,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 4.99,
        "packageSize": 32,
        "packageUnit": "oz",
        "unitPrice": 0.156,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 3.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.218,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 2.99,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.187,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.89,
        "packageSize": 3,
        "packageUnit": "lb",
        "unitPrice": 1.297,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 7.99,
        "packageSize": 4,
        "packageUnit": "lb",
        "unitPrice": 1.998,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 1.49,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 1.49,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 4.49,
        "packageSize": 3,
        "packageUnit": "lb",
        "unitPrice": 1.497,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.89,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 1.89,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 4.99,
        "packageSize": 3,
        "packageUnit": "lb",
        "unitPrice": 1.663,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 2.29,
        "packageSize": 12,
        "packageUnit": "oz",
        "unitPrice": 0.191,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 1.69,
        "packageSize": 12,
        "packageUnit": "oz",
        "unitPrice": 0.141,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.49,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 0.745,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 3.99,
        "packageSize": 5,
        "packageUnit": "lb",
        "unitPrice": 0.798,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 0.99,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 0.99,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 1.79,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 0.895,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.69,
        "packageSize": 3,
        "packageUnit": "ct",
        "unitPrice": 0.897,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 6.49,
        "packageSize": 6,
        "packageUnit": "ct",
        "unitPrice": 1.082,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 0.99,
        "packageSize": 1,
        "packageUnit": "piece",
        "unitPrice": 0.99,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 2.99,
        "packageSize": 3,
        "packageUnit": "ct",
        "unitPrice": 0.997,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.99,
        "packageSize": 3,
        "packageUnit": "lb",
        "unitPrice": 0.663,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 6.99,
        "packageSize": 10,
        "packageUnit": "lb",
        "unitPrice": 0.699,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 1.99,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 0.995,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 2.49,
        "packageSize": 3,
        "packageUnit": "lb",
        "unitPrice": 0.83,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.19,
        "packageSize": 3,
        "packageUnit": "ct",
        "unitPrice": 0.397,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 5.99,
        "packageSize": 32,
        "packageUnit": "oz",
        "unitPrice": 0.187,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 1.49,
        "packageSize": 3,
        "packageUnit": "ct",
        "unitPrice": 0.497,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 1.49,
        "packageSize": 3,
        "packageUnit": "ct",
        "unitPrice": 0.497,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.29,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 1.29,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 3.49,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 1.745,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 1.69,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 1.69,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 1.59,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 1.59,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.29,
        "packageSize": 3,
        "packageUnit": "lb",
        "unitPrice": 0.763,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 4.99,
        "packageSize": 5,
        "packageUnit": "lb",
        "unitPrice": 0.998,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 2.49,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 1.245,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 2.99,
        "packageSize": 3,
        "packageUnit": "lb",
        "unitPrice": 0.997,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.99,
        "packageSize": 5,
        "packageUnit": "lb",
        "unitPrice": 0.598,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 5.99,
        "packageSize": 10,
        "packageUnit": "lb",
        "unitPrice": 0.599,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 3.49,
        "packageSize": 5,
        "packageUnit": "lb",
        "unitPrice": 0.698,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 3.69,
        "packageSize": 5,
        "packageUnit": "lb",
        "unitPrice": 0.738,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.49,
        "packageSize": 6,
        "packageUnit": "ct",
        "unitPrice": 0.415,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 6.99,
        "packageSize": 15,
        "packageUnit": "ct",
        "unitPrice": 0.466,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 0.49,
        "packageSize": 1,
        "packageUnit": "piece",
        "unitPrice": 0.49,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 2.99,
        "packageSize": 6,
        "packageUnit": "ct",
        "unitPrice": 0.498,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.99,
        "packageSize": 6,
        "packageUnit": "ct",
        "unitPrice": 0.332,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 5.99,
        "packageSize": 18,
        "packageUnit": "ct",
        "unitPrice": 0.333,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 0.39,
        "packageSize": 1,
        "packageUnit": "piece",
        "unitPrice": 0.39,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 2.49,
        "packageSize": 6,
        "packageUnit": "ct",
        "unitPrice": 0.415,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 0.89,
        "packageSize": 1,
        "packageUnit": "piece",
        "unitPrice": 0.89,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 4.99,
        "packageSize": 3,
        "packageUnit": "piece",
        "unitPrice": 1.663,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 2.49,
        "packageSize": 6,
        "packageUnit": "ct",
        "unitPrice": 0.415,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 0.99,
        "packageSize": 1,
        "packageUnit": "piece",
        "unitPrice": 0.99,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.79,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 0.895,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 4.49,
        "packageSize": 4,
        "packageUnit": "lb",
        "unitPrice": 1.123,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 1.99,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 0.995,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 1.99,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 0.995,
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
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.29,
        "packageSize": 1,
        "packageUnit": "bunch",
        "unitPrice": 1.29,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 3.49,
        "packageSize": 2,
        "packageUnit": "bunch",
        "unitPrice": 1.745,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 1.69,
        "packageSize": 1,
        "packageUnit": "bunch",
        "unitPrice": 1.69,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 1.59,
        "packageSize": 1,
        "packageUnit": "bunch",
        "unitPrice": 1.59,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.49,
        "packageSize": 3,
        "packageUnit": "head",
        "unitPrice": 0.83,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 4.49,
        "packageSize": 6,
        "packageUnit": "head",
        "unitPrice": 0.748,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 2.99,
        "packageSize": 3,
        "packageUnit": "head",
        "unitPrice": 0.997,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 2.99,
        "packageSize": 3,
        "packageUnit": "head",
        "unitPrice": 0.997,
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
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.49,
        "packageSize": 1,
        "packageUnit": "bunch",
        "unitPrice": 1.49,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 3.99,
        "packageSize": 24,
        "packageUnit": "oz",
        "unitPrice": 0.166,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 1.99,
        "packageSize": 1,
        "packageUnit": "bunch",
        "unitPrice": 1.99,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 1.79,
        "packageSize": 1,
        "packageUnit": "bunch",
        "unitPrice": 1.79,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.69,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.211,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 4.99,
        "packageSize": 24,
        "packageUnit": "oz",
        "unitPrice": 0.208,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 1.99,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.249,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 1.99,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.249,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.89,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 0.945,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 5.99,
        "packageSize": 8,
        "packageUnit": "lb",
        "unitPrice": 0.749,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 2.19,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 1.095,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 2.29,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 1.145,
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
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 0.79,
        "packageSize": 1,
        "packageUnit": "bunch",
        "unitPrice": 0.79,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 2.99,
        "packageSize": 4,
        "packageUnit": "bunch",
        "unitPrice": 0.748,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 0.99,
        "packageSize": 1,
        "packageUnit": "bunch",
        "unitPrice": 0.99,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 0.89,
        "packageSize": 1,
        "packageUnit": "bunch",
        "unitPrice": 0.89,
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
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 0.69,
        "packageSize": 1,
        "packageUnit": "bunch",
        "unitPrice": 0.69,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 2.49,
        "packageSize": 3,
        "packageUnit": "bunch",
        "unitPrice": 0.83,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 0.99,
        "packageSize": 1,
        "packageUnit": "bunch",
        "unitPrice": 0.99,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 0.89,
        "packageSize": 1,
        "packageUnit": "bunch",
        "unitPrice": 0.89,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.49,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.186,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 4.49,
        "packageSize": 24,
        "packageUnit": "oz",
        "unitPrice": 0.187,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 1.79,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.224,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 1.99,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.249,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.49,
        "packageSize": 4,
        "packageUnit": "lb",
        "unitPrice": 0.873,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 8.99,
        "packageSize": 8,
        "packageUnit": "lb",
        "unitPrice": 1.124,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 3.99,
        "packageSize": 3,
        "packageUnit": "lb",
        "unitPrice": 1.33,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 4.29,
        "packageSize": 4,
        "packageUnit": "lb",
        "unitPrice": 1.073,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.98,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 1.49,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 6.99,
        "packageSize": 3,
        "packageUnit": "lb",
        "unitPrice": 2.33,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 3.49,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 1.745,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 3.98,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 1.99,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 9.96,
        "packageSize": 4,
        "packageUnit": "lb",
        "unitPrice": 2.49,
        "location": "Fresh Meat Cases"
      },
      "costco": {
        "available": true,
        "price": 19.44,
        "packageSize": 6.5,
        "packageUnit": "lb",
        "unitPrice": 2.991,
        "location": "Fresh Meat & Poultry"
      },
      "trader-joes": {
        "available": true,
        "price": 6.74,
        "packageSize": 24,
        "packageUnit": "oz",
        "unitPrice": 0.281,
        "location": "Fresh Meat Cases"
      },
      "target": {
        "available": true,
        "price": 8.23,
        "packageSize": 40,
        "packageUnit": "oz",
        "unitPrice": 0.206,
        "location": "Grocery - Meat & Poultry",
        "packageOptions": [
          {
            "id": "opt-tgt-chick-1lb",
            "packageSize": 16,
            "packageUnit": "oz",
            "price": 3.99,
            "unitPrice": 0.249
          },
          {
            "id": "opt-tgt-chick-2.5lb",
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 7.47,
        "packageSize": 3,
        "packageUnit": "lb",
        "unitPrice": 2.49,
        "location": "Fresh Meat Cases"
      },
      "costco": {
        "available": true,
        "price": 16.99,
        "packageSize": 6,
        "packageUnit": "lb",
        "unitPrice": 2.832,
        "location": "Fresh Meat & Poultry"
      },
      "trader-joes": {
        "available": true,
        "price": 7.98,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 3.99,
        "location": "Fresh Meat Cases"
      },
      "target": {
        "available": true,
        "price": 8.97,
        "packageSize": 3,
        "packageUnit": "lb",
        "unitPrice": 2.99,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.99,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 3.99,
        "location": "Fresh Meat Cases"
      },
      "costco": {
        "available": true,
        "price": 18.95,
        "packageSize": 5,
        "packageUnit": "lb",
        "unitPrice": 3.79,
        "location": "Fresh Meat & Poultry"
      },
      "trader-joes": {
        "available": true,
        "price": 4.99,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 4.99,
        "location": "Fresh Meat Cases"
      },
      "target": {
        "available": true,
        "price": 4.49,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 4.49,
        "location": "Grocery - Meat & Poultry",
        "packageOptions": [
          {
            "id": "opt-tgt-beef-1lb",
            "packageSize": 1,
            "packageUnit": "lb",
            "price": 4.49,
            "unitPrice": 4.49
          },
          {
            "id": "opt-tgt-beef-3lb",
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.29,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 3.29,
        "location": "Fresh Meat Cases"
      },
      "costco": {
        "available": true,
        "price": 14.99,
        "packageSize": 4,
        "packageUnit": "lb",
        "unitPrice": 3.748,
        "location": "Fresh Meat & Poultry"
      },
      "trader-joes": {
        "available": true,
        "price": 3.99,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 3.99,
        "location": "Fresh Meat Cases"
      },
      "target": {
        "available": true,
        "price": 3.79,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 3.79,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 8.99,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 8.99,
        "location": "Fresh Meat Cases"
      },
      "costco": {
        "available": true,
        "price": 25.47,
        "packageSize": 3,
        "packageUnit": "lb",
        "unitPrice": 8.49,
        "location": "Fresh Meat & Poultry"
      },
      "trader-joes": {
        "available": true,
        "price": 9.99,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 9.99,
        "location": "Fresh Meat Cases"
      },
      "target": {
        "available": true,
        "price": 10.99,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 10.99,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 7.99,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 7.99,
        "location": "Fresh Meat Cases"
      },
      "costco": {
        "available": true,
        "price": 26.97,
        "packageSize": 3,
        "packageUnit": "lb",
        "unitPrice": 8.99,
        "location": "Fresh Meat & Poultry"
      },
      "trader-joes": {
        "available": true,
        "price": 9.99,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 9.99,
        "location": "Fresh Meat Cases"
      },
      "target": {
        "available": true,
        "price": 8.99,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 8.99,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 5.98,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 2.99,
        "location": "Fresh Meat Cases"
      },
      "costco": {
        "available": true,
        "price": 14.99,
        "packageSize": 4.5,
        "packageUnit": "lb",
        "unitPrice": 3.331,
        "location": "Fresh Meat & Poultry"
      },
      "trader-joes": {
        "available": true,
        "price": 6.98,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 3.49,
        "location": "Fresh Meat Cases"
      },
      "target": {
        "available": true,
        "price": 6.58,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 3.29,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.89,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.243,
        "location": "Fresh Meat Cases"
      },
      "costco": {
        "available": true,
        "price": 14.99,
        "packageSize": 64,
        "packageUnit": "oz",
        "unitPrice": 0.234,
        "location": "Walk-in Dairy Cooler"
      },
      "trader-joes": {
        "available": true,
        "price": 4.49,
        "packageSize": 12,
        "packageUnit": "oz",
        "unitPrice": 0.374,
        "location": "Fresh Meat Cases"
      },
      "target": {
        "available": true,
        "price": 4.79,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.299,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.49,
        "packageSize": 19,
        "packageUnit": "oz",
        "unitPrice": 0.184,
        "location": "Fresh Meat Cases"
      },
      "costco": {
        "available": true,
        "price": 12.99,
        "packageSize": 48,
        "packageUnit": "oz",
        "unitPrice": 0.271,
        "location": "Walk-in Dairy Cooler"
      },
      "trader-joes": {
        "available": true,
        "price": 4.99,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.312,
        "location": "Fresh Meat Cases"
      },
      "target": {
        "available": true,
        "price": 4.29,
        "packageSize": 19,
        "packageUnit": "oz",
        "unitPrice": 0.226,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.99,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.249,
        "location": "Fresh Meat Cases"
      },
      "costco": {
        "available": true,
        "price": 11.99,
        "packageSize": 48,
        "packageUnit": "oz",
        "unitPrice": 0.25,
        "location": "Walk-in Dairy Cooler"
      },
      "trader-joes": {
        "available": true,
        "price": 3.49,
        "packageSize": 7,
        "packageUnit": "oz",
        "unitPrice": 0.499,
        "location": "Fresh Meat Cases"
      },
      "target": {
        "available": true,
        "price": 4.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.281,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 5.99,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.374,
        "location": "Aisle 4 - Frozen Cases"
      },
      "costco": {
        "available": true,
        "price": 14.99,
        "packageSize": 32,
        "packageUnit": "oz",
        "unitPrice": 0.468,
        "location": "Center Freezers"
      },
      "trader-joes": {
        "available": true,
        "price": 7.99,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.499,
        "location": "Aisle 3 - Frozen & Entrees"
      },
      "target": {
        "available": true,
        "price": 7.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.468,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.59,
        "packageSize": 14,
        "packageUnit": "oz",
        "unitPrice": 0.114,
        "location": "Entrance Produce"
      },
      "costco": {
        "available": true,
        "price": 6.49,
        "packageSize": 64,
        "packageUnit": "oz",
        "unitPrice": 0.101,
        "location": "Fresh Produce Walk-in"
      },
      "trader-joes": {
        "available": true,
        "price": 1.99,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.124,
        "location": "Front Produce Section"
      },
      "target": {
        "available": true,
        "price": 1.99,
        "packageSize": 14,
        "packageUnit": "oz",
        "unitPrice": 0.142,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.79,
        "packageSize": 12,
        "packageUnit": "ct",
        "unitPrice": 0.233,
        "location": "Aisle 1 - Dairy & Eggs"
      },
      "costco": {
        "available": true,
        "price": 5.99,
        "packageSize": 24,
        "packageUnit": "ct",
        "unitPrice": 0.25,
        "location": "Walk-in Dairy Cooler"
      },
      "trader-joes": {
        "available": true,
        "price": 3.29,
        "packageSize": 12,
        "packageUnit": "ct",
        "unitPrice": 0.274,
        "location": "Dairy Wall (Left)"
      },
      "target": {
        "available": true,
        "price": 3.49,
        "packageSize": 12,
        "packageUnit": "ct",
        "unitPrice": 0.291,
        "location": "Grocery - Aisle G2 (Dairy & Milk)",
        "packageOptions": [
          {
            "id": "opt-tgt-egg-12",
            "packageSize": 12,
            "packageUnit": "ct",
            "price": 3.49,
            "unitPrice": 0.291
          },
          {
            "id": "opt-tgt-egg-18",
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.49,
        "packageSize": 32,
        "packageUnit": "oz",
        "unitPrice": 0.109,
        "location": "Aisle 1 - Dairy & Eggs"
      },
      "costco": {
        "available": true,
        "price": 5.99,
        "packageSize": 48,
        "packageUnit": "oz",
        "unitPrice": 0.125,
        "location": "Walk-in Dairy Cooler"
      },
      "trader-joes": {
        "available": true,
        "price": 5.49,
        "packageSize": 32,
        "packageUnit": "oz",
        "unitPrice": 0.172,
        "location": "Dairy Wall (Left)",
        "packageOptions": [
          {
            "id": "opt-tj-yog-cup",
            "packageSize": 5.3,
            "packageUnit": "oz",
            "price": 0.99,
            "unitPrice": 0.187
          },
          {
            "id": "opt-tj-yog-tub",
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
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.29,
        "packageSize": 1,
        "packageUnit": "gal",
        "unitPrice": 3.29,
        "location": "Aisle 1 - Dairy & Eggs"
      },
      "costco": {
        "available": true,
        "price": 6.58,
        "packageSize": 2,
        "packageUnit": "gal",
        "unitPrice": 3.29,
        "location": "Walk-in Dairy Cooler"
      },
      "trader-joes": {
        "available": true,
        "price": 3.99,
        "packageSize": 1,
        "packageUnit": "gal",
        "unitPrice": 3.99,
        "location": "Dairy Wall (Left)",
        "packageOptions": [
          {
            "id": "opt-tj-milk-half",
            "packageSize": 64,
            "packageUnit": "fl oz",
            "price": 2.29,
            "unitPrice": 0.0358
          },
          {
            "id": "opt-tj-milk-gal",
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.29,
        "packageSize": 64,
        "packageUnit": "fl oz",
        "unitPrice": 0.036,
        "location": "Aisle 1 - Dairy & Eggs"
      },
      "costco": {
        "available": true,
        "price": 8.99,
        "packageSize": 192,
        "packageUnit": "fl oz",
        "unitPrice": 0.047,
        "location": "Aisle 10 - Coffee & Tea"
      },
      "trader-joes": {
        "available": true,
        "price": 2.69,
        "packageSize": 64,
        "packageUnit": "fl oz",
        "unitPrice": 0.042,
        "location": "Dairy Wall (Left)"
      },
      "target": {
        "available": true,
        "price": 2.49,
        "packageSize": 64,
        "packageUnit": "fl oz",
        "unitPrice": 0.039,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.79,
        "packageSize": 64,
        "packageUnit": "fl oz",
        "unitPrice": 0.044,
        "location": "Aisle 1 - Dairy & Eggs"
      },
      "costco": {
        "available": true,
        "price": 9.99,
        "packageSize": 192,
        "packageUnit": "fl oz",
        "unitPrice": 0.052,
        "location": "Aisle 10 - Coffee & Tea"
      },
      "trader-joes": {
        "available": true,
        "price": 2.99,
        "packageSize": 64,
        "packageUnit": "fl oz",
        "unitPrice": 0.047,
        "location": "Dairy Wall (Left)"
      },
      "target": {
        "available": true,
        "price": 3.29,
        "packageSize": 64,
        "packageUnit": "fl oz",
        "unitPrice": 0.051,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.89,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.236,
        "location": "Aisle 1 - Dairy & Eggs"
      },
      "costco": {
        "available": true,
        "price": 6.99,
        "packageSize": 32,
        "packageUnit": "oz",
        "unitPrice": 0.218,
        "location": "Walk-in Dairy Cooler"
      },
      "trader-joes": {
        "available": true,
        "price": 2.49,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.311,
        "location": "Dairy Wall (Left)"
      },
      "target": {
        "available": true,
        "price": 2.19,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.274,
        "location": "Grocery - Aisle G2 (Dairy & Milk)",
        "packageOptions": [
          {
            "id": "opt-tgt-ched-8oz",
            "packageSize": 8,
            "packageUnit": "oz",
            "price": 2.19,
            "unitPrice": 0.274
          },
          {
            "id": "opt-tgt-ched-16oz",
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.99,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.249,
        "location": "Aisle 1 - Dairy & Eggs"
      },
      "costco": {
        "available": true,
        "price": 9.99,
        "packageSize": 80,
        "packageUnit": "oz",
        "unitPrice": 0.125,
        "location": "Walk-in Dairy Cooler"
      },
      "trader-joes": {
        "available": true,
        "price": 2.49,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.311,
        "location": "Dairy Wall (Left)"
      },
      "target": {
        "available": true,
        "price": 2.19,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.274,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.99,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.374,
        "location": "Aisle 1 - Dairy & Eggs"
      },
      "costco": {
        "available": true,
        "price": 11.99,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.749,
        "location": "Walk-in Dairy Cooler"
      },
      "trader-joes": {
        "available": true,
        "price": 3.99,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.499,
        "location": "Dairy Wall (Left)"
      },
      "target": {
        "available": true,
        "price": 3.49,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.436,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.218,
        "location": "Aisle 1 - Dairy & Eggs"
      },
      "costco": {
        "available": true,
        "price": 12.99,
        "packageSize": 64,
        "packageUnit": "oz",
        "unitPrice": 0.203,
        "location": "Walk-in Dairy Cooler"
      },
      "trader-joes": {
        "available": true,
        "price": 3.99,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.249,
        "location": "Dairy Wall (Left)"
      },
      "target": {
        "available": true,
        "price": 3.89,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.243,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.49,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.186,
        "location": "Aisle 1 - Dairy & Eggs"
      },
      "costco": {
        "available": true,
        "price": 8.99,
        "packageSize": 48,
        "packageUnit": "oz",
        "unitPrice": 0.187,
        "location": "Walk-in Dairy Cooler"
      },
      "trader-joes": {
        "available": true,
        "price": 1.99,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.249,
        "location": "Dairy Wall (Left)"
      },
      "target": {
        "available": true,
        "price": 1.99,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.249,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.39,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.087,
        "location": "Aisle 1 - Dairy & Eggs"
      },
      "costco": {
        "available": true,
        "price": 4.99,
        "packageSize": 48,
        "packageUnit": "oz",
        "unitPrice": 0.104,
        "location": "Walk-in Dairy Cooler"
      },
      "trader-joes": {
        "available": true,
        "price": 1.79,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.112,
        "location": "Dairy Wall (Left)"
      },
      "target": {
        "available": true,
        "price": 1.89,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.118,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.79,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.112,
        "location": "Aisle 1 - Dairy & Eggs"
      },
      "costco": {
        "available": true,
        "price": 5.49,
        "packageSize": 48,
        "packageUnit": "oz",
        "unitPrice": 0.114,
        "location": "Walk-in Dairy Cooler"
      },
      "trader-joes": {
        "available": true,
        "price": 2.29,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.143,
        "location": "Dairy Wall (Left)"
      },
      "target": {
        "available": true,
        "price": 2.19,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.137,
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
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.89,
        "packageSize": 1,
        "packageUnit": "loaf",
        "unitPrice": 1.89,
        "location": "Aisle 5 - Bakery & Bread"
      },
      "costco": {
        "available": true,
        "price": 5.49,
        "packageSize": 2,
        "packageUnit": "loaf",
        "unitPrice": 2.745,
        "location": "Bakery Section"
      },
      "trader-joes": {
        "available": true,
        "price": 2.49,
        "packageSize": 1,
        "packageUnit": "loaf",
        "unitPrice": 2.49,
        "location": "Bakery / Bread Table"
      },
      "target": {
        "available": true,
        "price": 2.19,
        "packageSize": 1,
        "packageUnit": "loaf",
        "unitPrice": 2.19,
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
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.99,
        "packageSize": 1,
        "packageUnit": "loaf",
        "unitPrice": 2.99,
        "location": "Aisle 5 - Bakery & Bread"
      },
      "costco": {
        "available": true,
        "price": 6.99,
        "packageSize": 2,
        "packageUnit": "loaf",
        "unitPrice": 3.495,
        "location": "Bakery Section"
      },
      "trader-joes": {
        "available": true,
        "price": 3.49,
        "packageSize": 1,
        "packageUnit": "loaf",
        "unitPrice": 3.49,
        "location": "Bakery / Bread Table"
      },
      "target": {
        "available": true,
        "price": 3.69,
        "packageSize": 1,
        "packageUnit": "loaf",
        "unitPrice": 3.69,
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
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.99,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 1.99,
        "location": "Aisle 5 - Bakery & Bread"
      },
      "costco": {
        "available": true,
        "price": 6.99,
        "packageSize": 2,
        "packageUnit": "pack",
        "unitPrice": 3.495,
        "location": "Bakery Section"
      },
      "trader-joes": {
        "available": true,
        "price": 2.49,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 2.49,
        "location": "Bakery / Bread Table"
      },
      "target": {
        "available": true,
        "price": 2.79,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 2.79,
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
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.49,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 1.49,
        "location": "Aisle 5 - Bakery & Bread"
      },
      "costco": {
        "available": true,
        "price": 6.49,
        "packageSize": 3,
        "packageUnit": "pack",
        "unitPrice": 2.163,
        "location": "Bakery Section"
      },
      "trader-joes": {
        "available": true,
        "price": 1.99,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 1.99,
        "location": "Bakery / Bread Table"
      },
      "target": {
        "available": true,
        "price": 2.29,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 2.29,
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
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.69,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 1.69,
        "location": "Aisle 5 - Bakery & Bread"
      },
      "costco": {
        "available": true,
        "price": 5.99,
        "packageSize": 36,
        "packageUnit": "ct",
        "unitPrice": 0.166,
        "location": "Bakery Section"
      },
      "trader-joes": {
        "available": true,
        "price": 2.29,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 2.29,
        "location": "Bakery / Bread Table"
      },
      "target": {
        "available": true,
        "price": 2.19,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 2.19,
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
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.29,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 1.29,
        "location": "Aisle 5 - Bakery & Bread"
      },
      "costco": {
        "available": true,
        "price": 4.99,
        "packageSize": 80,
        "packageUnit": "ct",
        "unitPrice": 0.062,
        "location": "Bakery Section"
      },
      "trader-joes": {
        "available": true,
        "price": 1.69,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 1.69,
        "location": "Bakery / Bread Table"
      },
      "target": {
        "available": true,
        "price": 1.89,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 1.89,
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
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.39,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 1.39,
        "location": "Aisle 5 - Bakery & Bread"
      },
      "costco": {
        "available": true,
        "price": 5.49,
        "packageSize": 2,
        "packageUnit": "pack",
        "unitPrice": 2.745,
        "location": "Bakery Section"
      },
      "trader-joes": {
        "available": true,
        "price": 2.49,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 2.49,
        "location": "Bakery / Bread Table"
      },
      "target": {
        "available": true,
        "price": 1.89,
        "packageSize": 1,
        "packageUnit": "pack",
        "unitPrice": 1.89,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 4.99,
        "packageSize": 16.9,
        "packageUnit": "fl oz",
        "unitPrice": 0.295,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 17.99,
        "packageSize": 67.6,
        "packageUnit": "fl oz",
        "unitPrice": 0.266,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 8.99,
        "packageSize": 33.8,
        "packageUnit": "fl oz",
        "unitPrice": 0.266,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 9.99,
        "packageSize": 33.8,
        "packageUnit": "fl oz",
        "unitPrice": 0.296,
        "location": "Grocery - Aisle G8 (Pasta & Sauce)",
        "packageOptions": [
          {
            "id": "opt-tgt-oil-500",
            "packageSize": 16.9,
            "packageUnit": "fl oz",
            "price": 5.79,
            "unitPrice": 0.343
          },
          {
            "id": "opt-tgt-oil-1l",
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.89,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.118,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 9.99,
        "packageSize": 56,
        "packageUnit": "oz",
        "unitPrice": 0.178,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 2.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.156,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 2.19,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.137,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.89,
        "packageSize": 42,
        "packageUnit": "oz",
        "unitPrice": 0.069,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 9.99,
        "packageSize": 160,
        "packageUnit": "oz",
        "unitPrice": 0.062,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 3.29,
        "packageSize": 32,
        "packageUnit": "oz",
        "unitPrice": 0.103,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 3.29,
        "packageSize": 42,
        "packageUnit": "oz",
        "unitPrice": 0.078,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 0.98,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.061,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 8.99,
        "packageSize": 128,
        "packageUnit": "oz",
        "unitPrice": 0.07,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 1.29,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.081,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 1.09,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.068,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.69,
        "packageSize": 24,
        "packageUnit": "oz",
        "unitPrice": 0.07,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 9.99,
        "packageSize": 96,
        "packageUnit": "oz",
        "unitPrice": 0.104,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 2.29,
        "packageSize": 24,
        "packageUnit": "oz",
        "unitPrice": 0.095,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 1.99,
        "packageSize": 24,
        "packageUnit": "oz",
        "unitPrice": 0.083,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 0.85,
        "packageSize": 1,
        "packageUnit": "can",
        "unitPrice": 0.85,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 6.99,
        "packageSize": 8,
        "packageUnit": "can",
        "unitPrice": 0.874,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 0.99,
        "packageSize": 1,
        "packageUnit": "can",
        "unitPrice": 0.99,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 0.95,
        "packageSize": 1,
        "packageUnit": "can",
        "unitPrice": 0.95,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 0.85,
        "packageSize": 1,
        "packageUnit": "can",
        "unitPrice": 0.85,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 6.99,
        "packageSize": 8,
        "packageUnit": "can",
        "unitPrice": 0.874,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 0.99,
        "packageSize": 1,
        "packageUnit": "can",
        "unitPrice": 0.99,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 0.95,
        "packageSize": 1,
        "packageUnit": "can",
        "unitPrice": 0.95,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 0.89,
        "packageSize": 1,
        "packageUnit": "can",
        "unitPrice": 0.89,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 7.99,
        "packageSize": 8,
        "packageUnit": "can",
        "unitPrice": 0.999,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 1.19,
        "packageSize": 1,
        "packageUnit": "can",
        "unitPrice": 1.19,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 0.99,
        "packageSize": 1,
        "packageUnit": "can",
        "unitPrice": 0.99,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 0.69,
        "packageSize": 1,
        "packageUnit": "can",
        "unitPrice": 0.69,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 7.49,
        "packageSize": 12,
        "packageUnit": "can",
        "unitPrice": 0.624,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 0.99,
        "packageSize": 1,
        "packageUnit": "can",
        "unitPrice": 0.99,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 0.79,
        "packageSize": 1,
        "packageUnit": "can",
        "unitPrice": 0.79,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.49,
        "packageSize": 5,
        "packageUnit": "lb",
        "unitPrice": 0.698,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 14.99,
        "packageSize": 25,
        "packageUnit": "lb",
        "unitPrice": 0.6,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 1.99,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 0.995,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 3.99,
        "packageSize": 5,
        "packageUnit": "lb",
        "unitPrice": 0.798,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.79,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 0.895,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 10.99,
        "packageSize": 12,
        "packageUnit": "lb",
        "unitPrice": 0.916,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 2.29,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 1.145,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 2.19,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 1.095,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.79,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.174,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 9.49,
        "packageSize": 72,
        "packageUnit": "oz",
        "unitPrice": 0.132,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 3.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.218,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 3.29,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.206,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.19,
        "packageSize": 5,
        "packageUnit": "lb",
        "unitPrice": 0.438,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 8.99,
        "packageSize": 25,
        "packageUnit": "lb",
        "unitPrice": 0.36,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 2.99,
        "packageSize": 5,
        "packageUnit": "lb",
        "unitPrice": 0.598,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 2.49,
        "packageSize": 5,
        "packageUnit": "lb",
        "unitPrice": 0.498,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.89,
        "packageSize": 4,
        "packageUnit": "lb",
        "unitPrice": 0.723,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 8.49,
        "packageSize": 10,
        "packageUnit": "lb",
        "unitPrice": 0.849,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 3.49,
        "packageSize": 4,
        "packageUnit": "lb",
        "unitPrice": 0.873,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 3.19,
        "packageSize": 4,
        "packageUnit": "lb",
        "unitPrice": 0.797,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.79,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 0.895,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 5.99,
        "packageSize": 7,
        "packageUnit": "lb",
        "unitPrice": 0.856,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 2.29,
        "packageSize": 1,
        "packageUnit": "lb",
        "unitPrice": 2.29,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 2.19,
        "packageSize": 2,
        "packageUnit": "lb",
        "unitPrice": 1.095,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.39,
        "packageSize": 32,
        "packageUnit": "fl oz",
        "unitPrice": 0.043,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 9.99,
        "packageSize": 192,
        "packageUnit": "fl oz",
        "unitPrice": 0.052,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 1.99,
        "packageSize": 32,
        "packageUnit": "fl oz",
        "unitPrice": 0.062,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 1.69,
        "packageSize": 32,
        "packageUnit": "fl oz",
        "unitPrice": 0.053,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.39,
        "packageSize": 32,
        "packageUnit": "fl oz",
        "unitPrice": 0.043,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 9.99,
        "packageSize": 192,
        "packageUnit": "fl oz",
        "unitPrice": 0.052,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 1.99,
        "packageSize": 32,
        "packageUnit": "fl oz",
        "unitPrice": 0.062,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 1.69,
        "packageSize": 32,
        "packageUnit": "fl oz",
        "unitPrice": 0.053,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.29,
        "packageSize": 12,
        "packageUnit": "oz",
        "unitPrice": 0.274,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 13.99,
        "packageSize": 72,
        "packageUnit": "oz",
        "unitPrice": 0.194,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 4.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.281,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 4.29,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.268,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.99,
        "packageSize": 12,
        "packageUnit": "fl oz",
        "unitPrice": 0.166,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 8.99,
        "packageSize": 48,
        "packageUnit": "fl oz",
        "unitPrice": 0.187,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 2.49,
        "packageSize": 12,
        "packageUnit": "fl oz",
        "unitPrice": 0.208,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 2.89,
        "packageSize": 12,
        "packageUnit": "fl oz",
        "unitPrice": 0.241,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.69,
        "packageSize": 15,
        "packageUnit": "fl oz",
        "unitPrice": 0.113,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 6.99,
        "packageSize": 64,
        "packageUnit": "fl oz",
        "unitPrice": 0.109,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 2.29,
        "packageSize": 15,
        "packageUnit": "fl oz",
        "unitPrice": 0.153,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 2.49,
        "packageSize": 15,
        "packageUnit": "fl oz",
        "unitPrice": 0.166,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.69,
        "packageSize": 30,
        "packageUnit": "fl oz",
        "unitPrice": 0.09,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 8.99,
        "packageSize": 64,
        "packageUnit": "fl oz",
        "unitPrice": 0.14,
        "location": "Aisle 14 - Canned & Condiments"
      },
      "trader-joes": {
        "available": true,
        "price": 3.49,
        "packageSize": 16,
        "packageUnit": "fl oz",
        "unitPrice": 0.218,
        "location": "Aisle 2 - Pantry & Sauces"
      },
      "target": {
        "available": true,
        "price": 3.79,
        "packageSize": 30,
        "packageUnit": "fl oz",
        "unitPrice": 0.126,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": true,
    "shops": {
      "aldi": {
        "available": true,
        "price": 4.99,
        "packageSize": 12,
        "packageUnit": "oz",
        "unitPrice": 0.416,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 14.99,
        "packageSize": 40,
        "packageUnit": "oz",
        "unitPrice": 0.375,
        "location": "Aisle 10 - Coffee & Tea"
      },
      "trader-joes": {
        "available": true,
        "price": 5.99,
        "packageSize": 12,
        "packageUnit": "oz",
        "unitPrice": 0.499,
        "location": "Beverages & Coffee"
      },
      "target": {
        "available": true,
        "price": 6.29,
        "packageSize": 12,
        "packageUnit": "oz",
        "unitPrice": 0.524,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.79,
        "packageSize": 10,
        "packageUnit": "oz",
        "unitPrice": 0.179,
        "location": "Aisle 3 - Snacks & Sweets"
      },
      "costco": {
        "available": true,
        "price": 5.49,
        "packageSize": 40,
        "packageUnit": "oz",
        "unitPrice": 0.137,
        "location": "Aisle 18 - Snacks & Nuts"
      },
      "trader-joes": {
        "available": true,
        "price": 2.29,
        "packageSize": 12,
        "packageUnit": "oz",
        "unitPrice": 0.191,
        "location": "Aisle 1 - Chips & Snacks"
      },
      "target": {
        "available": true,
        "price": 2.49,
        "packageSize": 12,
        "packageUnit": "oz",
        "unitPrice": 0.208,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.89,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.236,
        "location": "Aisle 3 - Snacks & Sweets"
      },
      "costco": {
        "available": true,
        "price": 5.99,
        "packageSize": 30,
        "packageUnit": "oz",
        "unitPrice": 0.2,
        "location": "Aisle 18 - Snacks & Nuts"
      },
      "trader-joes": {
        "available": true,
        "price": 2.49,
        "packageSize": 7,
        "packageUnit": "oz",
        "unitPrice": 0.356,
        "location": "Aisle 1 - Chips & Snacks"
      },
      "target": {
        "available": true,
        "price": 2.69,
        "packageSize": 8,
        "packageUnit": "oz",
        "unitPrice": 0.336,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.99,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.124,
        "location": "Aisle 3 - Snacks & Sweets"
      },
      "costco": {
        "available": true,
        "price": 6.99,
        "packageSize": 52,
        "packageUnit": "oz",
        "unitPrice": 0.134,
        "location": "Aisle 18 - Snacks & Nuts"
      },
      "trader-joes": {
        "available": true,
        "price": 2.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.156,
        "location": "Aisle 1 - Chips & Snacks"
      },
      "target": {
        "available": true,
        "price": 2.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.156,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.19,
        "packageSize": 6,
        "packageUnit": "bag",
        "unitPrice": 0.365,
        "location": "Aisle 3 - Snacks & Sweets"
      },
      "costco": {
        "available": true,
        "price": 11.99,
        "packageSize": 44,
        "packageUnit": "bag",
        "unitPrice": 0.273,
        "location": "Aisle 18 - Snacks & Nuts"
      },
      "trader-joes": {
        "available": true,
        "price": 2.29,
        "packageSize": 5,
        "packageUnit": "oz",
        "unitPrice": 0.458,
        "location": "Aisle 1 - Chips & Snacks"
      },
      "target": {
        "available": true,
        "price": 2.99,
        "packageSize": 6,
        "packageUnit": "bag",
        "unitPrice": 0.498,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 4.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.281,
        "location": "Aisle 3 - Snacks & Sweets"
      },
      "costco": {
        "available": true,
        "price": 11.99,
        "packageSize": 48,
        "packageUnit": "oz",
        "unitPrice": 0.25,
        "location": "Aisle 18 - Snacks & Nuts"
      },
      "trader-joes": {
        "available": true,
        "price": 4.99,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.312,
        "location": "Aisle 1 - Chips & Snacks"
      },
      "target": {
        "available": true,
        "price": 5.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.343,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 4.79,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.299,
        "location": "Aisle 3 - Snacks & Sweets"
      },
      "costco": {
        "available": true,
        "price": 10.99,
        "packageSize": 48,
        "packageUnit": "oz",
        "unitPrice": 0.229,
        "location": "Aisle 18 - Snacks & Nuts"
      },
      "trader-joes": {
        "available": true,
        "price": 5.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.343,
        "location": "Aisle 1 - Chips & Snacks"
      },
      "target": {
        "available": true,
        "price": 5.99,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.374,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.99,
        "packageSize": 1,
        "packageUnit": "piece",
        "unitPrice": 1.99,
        "location": "Aisle 3 - Snacks & Sweets"
      },
      "costco": {
        "available": true,
        "price": 10.99,
        "packageSize": 20,
        "packageUnit": "piece",
        "unitPrice": 0.549,
        "location": "Aisle 18 - Snacks & Nuts"
      },
      "trader-joes": {
        "available": true,
        "price": 2.49,
        "packageSize": 3,
        "packageUnit": "piece",
        "unitPrice": 0.83,
        "location": "Aisle 1 - Chips & Snacks"
      },
      "target": {
        "available": true,
        "price": 2.99,
        "packageSize": 1,
        "packageUnit": "piece",
        "unitPrice": 2.99,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.49,
        "packageSize": 12,
        "packageUnit": "oz",
        "unitPrice": 0.208,
        "location": "Aisle 4 - Frozen Cases"
      },
      "costco": {
        "available": true,
        "price": 9.99,
        "packageSize": 48,
        "packageUnit": "oz",
        "unitPrice": 0.208,
        "location": "Center Freezers"
      },
      "trader-joes": {
        "available": true,
        "price": 3.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.218,
        "location": "Aisle 3 - Frozen & Entrees"
      },
      "target": {
        "available": true,
        "price": 6.79,
        "packageSize": 32,
        "packageUnit": "oz",
        "unitPrice": 0.212,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.19,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.074,
        "location": "Aisle 4 - Frozen Cases"
      },
      "costco": {
        "available": true,
        "price": 6.99,
        "packageSize": 80,
        "packageUnit": "oz",
        "unitPrice": 0.087,
        "location": "Center Freezers"
      },
      "trader-joes": {
        "available": true,
        "price": 1.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.093,
        "location": "Aisle 3 - Frozen & Entrees"
      },
      "target": {
        "available": true,
        "price": 1.39,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.087,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.19,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.074,
        "location": "Aisle 4 - Frozen Cases"
      },
      "costco": {
        "available": true,
        "price": 6.99,
        "packageSize": 80,
        "packageUnit": "oz",
        "unitPrice": 0.087,
        "location": "Center Freezers"
      },
      "trader-joes": {
        "available": true,
        "price": 1.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.093,
        "location": "Aisle 3 - Frozen & Entrees"
      },
      "target": {
        "available": true,
        "price": 1.39,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.087,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.29,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.081,
        "location": "Aisle 4 - Frozen Cases"
      },
      "costco": {
        "available": true,
        "price": 7.99,
        "packageSize": 64,
        "packageUnit": "oz",
        "unitPrice": 0.125,
        "location": "Center Freezers"
      },
      "trader-joes": {
        "available": true,
        "price": 1.79,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.112,
        "location": "Aisle 3 - Frozen & Entrees"
      },
      "target": {
        "available": true,
        "price": 1.49,
        "packageSize": 16,
        "packageUnit": "oz",
        "unitPrice": 0.093,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.99,
        "packageSize": 1,
        "packageUnit": "piece",
        "unitPrice": 3.99,
        "location": "Aisle 4 - Frozen Cases"
      },
      "costco": {
        "available": true,
        "price": 13.99,
        "packageSize": 4,
        "packageUnit": "piece",
        "unitPrice": 3.498,
        "location": "Center Freezers"
      },
      "trader-joes": {
        "available": true,
        "price": 4.99,
        "packageSize": 1,
        "packageUnit": "piece",
        "unitPrice": 4.99,
        "location": "Aisle 3 - Frozen & Entrees"
      },
      "target": {
        "available": true,
        "price": 4.49,
        "packageSize": 1,
        "packageUnit": "piece",
        "unitPrice": 4.49,
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
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.89,
        "packageSize": 1,
        "packageUnit": "box",
        "unitPrice": 1.89,
        "location": "Aisle 4 - Frozen Cases"
      },
      "costco": {
        "available": true,
        "price": 9.99,
        "packageSize": 6,
        "packageUnit": "box",
        "unitPrice": 1.665,
        "location": "Center Freezers"
      },
      "trader-joes": {
        "available": true,
        "price": 2.29,
        "packageSize": 1,
        "packageUnit": "box",
        "unitPrice": 2.29,
        "location": "Aisle 3 - Frozen & Entrees"
      },
      "target": {
        "available": true,
        "price": 2.39,
        "packageSize": 1,
        "packageUnit": "box",
        "unitPrice": 2.39,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.79,
        "packageSize": 20,
        "packageUnit": "bag",
        "unitPrice": 0.089,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 12.99,
        "packageSize": 100,
        "packageUnit": "bag",
        "unitPrice": 0.13,
        "location": "Aisle 10 - Coffee & Tea"
      },
      "trader-joes": {
        "available": true,
        "price": 2.49,
        "packageSize": 20,
        "packageUnit": "bag",
        "unitPrice": 0.125,
        "location": "Beverages & Coffee"
      },
      "target": {
        "available": true,
        "price": 2.79,
        "packageSize": 20,
        "packageUnit": "bag",
        "unitPrice": 0.14,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.99,
        "packageSize": 52,
        "packageUnit": "fl oz",
        "unitPrice": 0.058,
        "location": "Aisle 1 - Dairy & Eggs"
      },
      "costco": {
        "available": true,
        "price": 7.99,
        "packageSize": 118,
        "packageUnit": "fl oz",
        "unitPrice": 0.068,
        "location": "Walk-in Dairy Cooler"
      },
      "trader-joes": {
        "available": true,
        "price": 3.49,
        "packageSize": 52,
        "packageUnit": "fl oz",
        "unitPrice": 0.067,
        "location": "Dairy Wall (Left)"
      },
      "target": {
        "available": true,
        "price": 3.89,
        "packageSize": 52,
        "packageUnit": "fl oz",
        "unitPrice": 0.075,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 3.49,
        "packageSize": 12,
        "packageUnit": "can",
        "unitPrice": 0.291,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 9.99,
        "packageSize": 30,
        "packageUnit": "can",
        "unitPrice": 0.333,
        "location": "Aisle 10 - Coffee & Tea"
      },
      "trader-joes": {
        "available": true,
        "price": 3.99,
        "packageSize": 8,
        "packageUnit": "can",
        "unitPrice": 0.499,
        "location": "Beverages & Coffee"
      },
      "target": {
        "available": true,
        "price": 3.99,
        "packageSize": 12,
        "packageUnit": "can",
        "unitPrice": 0.333,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.99,
        "packageSize": 64,
        "packageUnit": "fl oz",
        "unitPrice": 0.031,
        "location": "Aisle 2 - Canned & Grains"
      },
      "costco": {
        "available": true,
        "price": 7.49,
        "packageSize": 192,
        "packageUnit": "fl oz",
        "unitPrice": 0.039,
        "location": "Aisle 10 - Coffee & Tea"
      },
      "trader-joes": {
        "available": true,
        "price": 2.99,
        "packageSize": 64,
        "packageUnit": "fl oz",
        "unitPrice": 0.047,
        "location": "Beverages & Coffee"
      },
      "target": {
        "available": true,
        "price": 2.29,
        "packageSize": 64,
        "packageUnit": "fl oz",
        "unitPrice": 0.036,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 5.99,
        "packageSize": 6,
        "packageUnit": "roll",
        "unitPrice": 0.998,
        "location": "Aldi Finds Aisle"
      },
      "costco": {
        "available": true,
        "price": 19.99,
        "packageSize": 12,
        "packageUnit": "roll",
        "unitPrice": 1.666,
        "location": "Front Register Aisles"
      },
      "trader-joes": {
        "available": true,
        "price": 4.99,
        "packageSize": 3,
        "packageUnit": "roll",
        "unitPrice": 1.663,
        "location": "Checkout Endcaps"
      },
      "target": {
        "available": true,
        "price": 7.99,
        "packageSize": 6,
        "packageUnit": "roll",
        "unitPrice": 1.332,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 6.99,
        "packageSize": 12,
        "packageUnit": "roll",
        "unitPrice": 0.583,
        "location": "Aldi Finds Aisle"
      },
      "costco": {
        "available": true,
        "price": 19.99,
        "packageSize": 30,
        "packageUnit": "roll",
        "unitPrice": 0.666,
        "location": "Front Register Aisles"
      },
      "trader-joes": {
        "available": true,
        "price": 4.49,
        "packageSize": 6,
        "packageUnit": "roll",
        "unitPrice": 0.748,
        "location": "Checkout Endcaps"
      },
      "target": {
        "available": true,
        "price": 8.99,
        "packageSize": 12,
        "packageUnit": "roll",
        "unitPrice": 0.749,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.89,
        "packageSize": 24,
        "packageUnit": "fl oz",
        "unitPrice": 0.079,
        "location": "Aldi Finds Aisle"
      },
      "costco": {
        "available": true,
        "price": 9.99,
        "packageSize": 90,
        "packageUnit": "fl oz",
        "unitPrice": 0.111,
        "location": "Front Register Aisles"
      },
      "trader-joes": {
        "available": true,
        "price": 2.99,
        "packageSize": 25,
        "packageUnit": "fl oz",
        "unitPrice": 0.12,
        "location": "Checkout Endcaps"
      },
      "target": {
        "available": true,
        "price": 2.99,
        "packageSize": 19,
        "packageUnit": "fl oz",
        "unitPrice": 0.157,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 6.99,
        "packageSize": 40,
        "packageUnit": "ct",
        "unitPrice": 0.175,
        "location": "Aldi Finds Aisle"
      },
      "costco": {
        "available": true,
        "price": 16.99,
        "packageSize": 200,
        "packageUnit": "ct",
        "unitPrice": 0.085,
        "location": "Front Register Aisles"
      },
      "trader-joes": {
        "available": true,
        "price": 4.99,
        "packageSize": 20,
        "packageUnit": "ct",
        "unitPrice": 0.249,
        "location": "Checkout Endcaps"
      },
      "target": {
        "available": true,
        "price": 8.99,
        "packageSize": 45,
        "packageUnit": "ct",
        "unitPrice": 0.2,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 7.99,
        "packageSize": 100,
        "packageUnit": "fl oz",
        "unitPrice": 0.08,
        "location": "Aldi Finds Aisle"
      },
      "costco": {
        "available": true,
        "price": 17.99,
        "packageSize": 194,
        "packageUnit": "fl oz",
        "unitPrice": 0.093,
        "location": "Front Register Aisles"
      },
      "trader-joes": {
        "available": true,
        "price": 6.99,
        "packageSize": 64,
        "packageUnit": "fl oz",
        "unitPrice": 0.109,
        "location": "Checkout Endcaps"
      },
      "target": {
        "available": true,
        "price": 11.99,
        "packageSize": 100,
        "packageUnit": "fl oz",
        "unitPrice": 0.12,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.49,
        "packageSize": 7.5,
        "packageUnit": "fl oz",
        "unitPrice": 0.199,
        "location": "Aldi Finds Aisle"
      },
      "costco": {
        "available": true,
        "price": 8.99,
        "packageSize": 80,
        "packageUnit": "fl oz",
        "unitPrice": 0.112,
        "location": "Front Register Aisles"
      },
      "trader-joes": {
        "available": true,
        "price": 2.99,
        "packageSize": 16,
        "packageUnit": "fl oz",
        "unitPrice": 0.187,
        "location": "Checkout Endcaps"
      },
      "target": {
        "available": true,
        "price": 1.99,
        "packageSize": 12,
        "packageUnit": "fl oz",
        "unitPrice": 0.166,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.49,
        "packageSize": 18,
        "packageUnit": "fl oz",
        "unitPrice": 0.138,
        "location": "Aldi Finds Aisle"
      },
      "costco": {
        "available": true,
        "price": 11.99,
        "packageSize": 60,
        "packageUnit": "fl oz",
        "unitPrice": 0.2,
        "location": "Front Register Aisles"
      },
      "trader-joes": {
        "available": true,
        "price": 3.99,
        "packageSize": 16,
        "packageUnit": "fl oz",
        "unitPrice": 0.249,
        "location": "Checkout Endcaps"
      },
      "target": {
        "available": true,
        "price": 4.49,
        "packageSize": 18,
        "packageUnit": "fl oz",
        "unitPrice": 0.249,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 1.69,
        "packageSize": 1,
        "packageUnit": "piece",
        "unitPrice": 1.69,
        "location": "Aldi Finds Aisle"
      },
      "costco": {
        "available": true,
        "price": 12.99,
        "packageSize": 5,
        "packageUnit": "piece",
        "unitPrice": 2.598,
        "location": "Front Register Aisles"
      },
      "trader-joes": {
        "available": true,
        "price": 2.49,
        "packageSize": 1,
        "packageUnit": "piece",
        "unitPrice": 2.49,
        "location": "Checkout Endcaps"
      },
      "target": {
        "available": true,
        "price": 3.99,
        "packageSize": 2,
        "packageUnit": "piece",
        "unitPrice": 1.995,
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
    "quantity": 1,
    "unit": "",
    "isNeeded": false,
    "inCart": false,
    "isWeekly": false,
    "shops": {
      "aldi": {
        "available": true,
        "price": 2.49,
        "packageSize": 16,
        "packageUnit": "fl oz",
        "unitPrice": 0.156,
        "location": "Aldi Finds Aisle"
      },
      "costco": {
        "available": true,
        "price": 10.99,
        "packageSize": 33.8,
        "packageUnit": "fl oz",
        "unitPrice": 0.325,
        "location": "Front Register Aisles"
      },
      "trader-joes": {
        "available": true,
        "price": 3.99,
        "packageSize": 16,
        "packageUnit": "fl oz",
        "unitPrice": 0.249,
        "location": "Checkout Endcaps"
      },
      "target": {
        "available": true,
        "price": 4.99,
        "packageSize": 16,
        "packageUnit": "fl oz",
        "unitPrice": 0.312,
        "location": "Household / Paper Goods"
      }
    },
    "createdAt": 1730000106000,
    "updatedAt": 1730000106000
  }
]
