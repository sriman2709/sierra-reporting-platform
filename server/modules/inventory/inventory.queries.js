import { SCHEMA as S } from '../../connectors/hana.js';

export const Q = {
  kpis: `
    SELECT
      COUNT(*)                                                              AS "total_items",
      SUM("current_stock" * "unit_cost")                                   AS "total_inventory_value",
      SUM(CASE WHEN "current_stock" = 0                    THEN 1 ELSE 0 END) AS "out_of_stock",
      SUM(CASE WHEN "current_stock" > 0
               AND "current_stock" <= "reorder_point"      THEN 1 ELSE 0 END) AS "low_stock",
      SUM(CASE WHEN "current_stock" > "reorder_point"      THEN 1 ELSE 0 END) AS "adequate_stock",
      (SELECT COUNT(*) FROM ${S}."I_StockTransaction"
       WHERE "transaction_type" = 'RECEIPT'
         AND "transaction_date" >= ADD_MONTHS(CURRENT_DATE,-1))            AS "receipts_last_30d",
      (SELECT COALESCE(SUM(ABS("quantity" * "unit_cost")),0)
       FROM ${S}."I_StockTransaction"
       WHERE "transaction_type" = 'ISSUE'
         AND "transaction_date" >= ADD_MONTHS(CURRENT_DATE,-12))           AS "issues_value_ytd"
    FROM ${S}."I_InventoryItem"
    WHERE "item_status" = 'ACTIVE'`,

  items: `SELECT * FROM ${S}."V_InventoryHealth" ORDER BY STOCK_STATUS ASC, "category" ASC`,

  transactions: `
    SELECT
      t."transaction_id", t."transaction_type", t."quantity",
      t."unit_cost", t."transaction_date", t."reference_number",
      t."performed_by", t."notes",
      ABS(t."quantity" * t."unit_cost")                     AS "line_value",
      i."item_id", i."item_number", i."item_name", i."category", i."unit",
      w."warehouse_name"
    FROM ${S}."I_StockTransaction" t
    JOIN ${S}."I_InventoryItem"    i ON i."item_id"     = t."item_id"
    JOIN ${S}."I_Warehouse"        w ON w."warehouse_id" = i."warehouse_id"
    WHERE t."transaction_date" >= ADD_MONTHS(CURRENT_DATE,-3)
    ORDER BY t."transaction_date" DESC, t."transaction_id" DESC`,

  warehouses: `
    SELECT
      w."warehouse_id", w."warehouse_code", w."warehouse_name",
      w."location", w."manager", w."capacity_sqft", w."warehouse_status",
      COUNT(i."item_id")                                    AS "item_count",
      SUM(i."current_stock")                                AS "total_units",
      ROUND(SUM(i."current_stock" * i."unit_cost"), 2)      AS "inventory_value",
      SUM(CASE WHEN i."current_stock" = 0            THEN 1 ELSE 0 END) AS "out_of_stock_items",
      SUM(CASE WHEN i."current_stock" > 0
               AND i."current_stock" <= i."reorder_point"   THEN 1 ELSE 0 END) AS "low_stock_items"
    FROM ${S}."I_Warehouse"        w
    LEFT JOIN ${S}."I_InventoryItem" i ON i."warehouse_id" = w."warehouse_id"
                                       AND i."item_status" = 'ACTIVE'
    GROUP BY w."warehouse_id", w."warehouse_code", w."warehouse_name",
             w."location", w."manager", w."capacity_sqft", w."warehouse_status"
    ORDER BY w."warehouse_name"`,

  alerts: `
    SELECT
      i."item_id", i."item_number", i."item_name", i."category",
      i."unit", i."unit_cost", i."current_stock", i."reorder_point",
      i."reorder_qty", i."lead_time_days", i."supplier",
      ROUND(i."current_stock" * i."unit_cost", 2)            AS "stock_value",
      ROUND(i."reorder_qty"   * i."unit_cost", 2)            AS "reorder_cost",
      CASE
        WHEN i."current_stock" = 0                  THEN 'OUT_OF_STOCK'
        WHEN i."current_stock" <= i."reorder_point" THEN 'LOW_STOCK'
      END                                                     AS ALERT_TYPE,
      w."warehouse_name"
    FROM ${S}."I_InventoryItem" i
    JOIN ${S}."I_Warehouse"     w ON w."warehouse_id" = i."warehouse_id"
    WHERE i."item_status" = 'ACTIVE'
      AND i."current_stock" <= i."reorder_point"
    ORDER BY
      CASE WHEN i."current_stock" = 0 THEN 0 ELSE 1 END,
      (i."reorder_point" - i."current_stock") DESC`,

  turnover: `
    SELECT
      i."category",
      COUNT(DISTINCT i."item_id")                             AS "item_count",
      ROUND(SUM(i."current_stock" * i."unit_cost"), 2)        AS "stock_value",
      COALESCE(SUM(ABS(t."quantity")), 0)                     AS "units_issued_ytd",
      COALESCE(ROUND(SUM(ABS(t."quantity") * t."unit_cost"), 2), 0) AS "issue_value_ytd",
      CASE
        WHEN SUM(i."current_stock") = 0 THEN NULL
        ELSE ROUND(COALESCE(SUM(ABS(t."quantity")),0) / NULLIF(SUM(i."current_stock"),0), 2)
      END                                                      AS "turnover_ratio"
    FROM ${S}."I_InventoryItem"    i
    LEFT JOIN ${S}."I_StockTransaction" t ON t."item_id" = i."item_id"
                                          AND t."transaction_type" = 'ISSUE'
                                          AND t."transaction_date" >= ADD_MONTHS(CURRENT_DATE,-12)
    WHERE i."item_status" = 'ACTIVE'
    GROUP BY i."category"
    ORDER BY "issue_value_ytd" DESC`,
};
