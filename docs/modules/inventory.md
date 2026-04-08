# Inventory & Warehouse

Monitor stock levels, out-of-stock alerts, reorder needs, and warehouse performance across all locations.

## Overview

Connects to `I_InventoryItem`, `I_StockTransaction`, and `I_Warehouse`.

---

## Tabs

### Dashboard
- Total SKUs, out-of-stock count, low-stock count, total inventory value, recent transactions, warehouse count
- Stock alert distribution (OUT_OF_STOCK / LOW_STOCK / ADEQUATE / OVERSTOCKED)
- Value by category (bar chart)

### Inventory Items

| Column | Description |
|---|---|
| Item Code / Name | SKU identifier |
| Category | SUPPLIES / EQUIPMENT / PARTS / CHEMICALS / FUEL |
| Warehouse | Storage location |
| Current Stock | On-hand quantity |
| Reorder Point | Threshold that triggers a reorder |
| Max Stock | Upper storage limit |
| Unit Cost | Cost per unit |
| Total Value | Current Stock × Unit Cost |
| Status | OUT_OF_STOCK / LOW_STOCK / ADEQUATE / OVERSTOCKED |

!!! danger "Out-of-stock items"
    OUT_OF_STOCK items have zero on-hand inventory. If these are critical operational supplies (fuel, chemicals, safety equipment), immediate procurement action is required.

### Stock Alerts
Prioritized list of items needing attention:

- OUT_OF_STOCK items at top (red)
- LOW_STOCK items below (amber)
- Each row shows current stock, reorder point, and suggested order quantity

### Transactions
Recent stock movements:

| Column | Description |
|---|---|
| Transaction Date | When the movement occurred |
| Item | SKU |
| Type | RECEIPT / ISSUE / ADJUSTMENT / RETURN / TRANSFER |
| Quantity | Units moved (+ or −) |
| Reference | PO or work order number |
| Warehouse | Location |

### Warehouse Summary
Performance metrics per warehouse location:

- Total SKUs, total value, utilization %, turnover ratio
- Turnover = Annual issues ÷ Average inventory value

---

## Sierra AI Examples

- *"Which items are out of stock across all warehouses?"*
- *"Show me stock alerts and what needs to be reordered."*
- *"What is total inventory value by category?"*
- *"Which warehouse has the highest turnover ratio?"*
- *"Show me recent stock transactions for critical supplies."*
