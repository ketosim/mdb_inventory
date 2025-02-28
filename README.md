## Overview

This inventory management system is designed to help dominos cbd store track inventory, record counts, and generate order summaries based on stock levels and weekly usage.

## Features

- Inventory counting interface with product search functionality
- Real-time count recording and validation
- Order summary generation based on current stock and usage patterns
- Responsive design for mobile and desktop use

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: React Router
- **API Communication**: Axios
- **Styling**: Tailwind CSS

## API Integration

The application integrates with a RESTful API with the following endpoints:

- \`POST /api/inventory/session\` - Start a new inventory session
- \`GET /api/products\` - Get list of products
- \`POST /api/inventory/count\` - Record a product count
- \`GET /api/inventory/orders/:sessionId\` - Generate order summary

## Usage Flow

1. Start a new inventory session by selecting a sales level.
2. Search and select products to count.
3. Enter count quantities for each product.
4. Submit the count to generate an order summary.
5. View the suggested order quantities based on current stock and usage patterns.
