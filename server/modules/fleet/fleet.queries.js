import { SCHEMA as S } from '../../connectors/hana.js';

export const Q = {
  kpis: `
    SELECT
      COUNT(*)                                                                  AS "total_vehicles",
      SUM(CASE WHEN "vehicle_status" = 'ACTIVE'         THEN 1 ELSE 0 END)    AS "active_vehicles",
      SUM(CASE WHEN "vehicle_status" = 'OUT_OF_SERVICE' THEN 1 ELSE 0 END)    AS "out_of_service",
      SUM(CASE WHEN "vehicle_status" = 'MAINTENANCE'    THEN 1 ELSE 0 END)    AS "in_maintenance",
      ROUND(AVG("odometer_miles"), 0)                                          AS "avg_odometer",
      (SELECT ROUND(SUM("total_cost"), 2) FROM ${S}."I_FuelRecord"
       WHERE "fuel_date" >= ADD_MONTHS(CURRENT_DATE,-12))                      AS "fuel_cost_ytd",
      (SELECT ROUND(SUM("gallons"), 1) FROM ${S}."I_FuelRecord"
       WHERE "fuel_date" >= ADD_MONTHS(CURRENT_DATE,-12))                      AS "fuel_gallons_ytd",
      (SELECT COUNT(*) FROM ${S}."I_VehicleInspection"
       WHERE "next_due_date" < CURRENT_DATE
         AND "inspection_status" = 'SCHEDULED')                                AS "inspections_overdue"
    FROM ${S}."I_Vehicle"`,

  vehicles: `SELECT * FROM ${S}."V_FleetHealth" ORDER BY HEALTH_STATUS ASC, "department" ASC`,

  fuel: `
    SELECT
      fr."record_id", fr."fuel_date", fr."gallons",
      fr."cost_per_gallon", fr."total_cost", fr."odometer_reading",
      fr."fuel_type", fr."location",
      v."vehicle_id", v."vehicle_number", v."make", v."model",
      v."year", v."department",
      CASE WHEN fr."gallons" > 0 THEN
        ROUND((fr."odometer_reading" -
          LAG(fr."odometer_reading") OVER (PARTITION BY fr."vehicle_id" ORDER BY fr."fuel_date")) / fr."gallons", 1)
        ELSE NULL END                                                           AS "mpg"
    FROM ${S}."I_FuelRecord"     fr
    JOIN ${S}."I_Vehicle"        v  ON v."vehicle_id" = fr."vehicle_id"
    WHERE fr."fuel_date" >= ADD_MONTHS(CURRENT_DATE,-3)
    ORDER BY fr."fuel_date" DESC`,

  inspections: `
    SELECT
      vi."inspection_id", vi."inspection_type", vi."inspection_date",
      vi."next_due_date", vi."passed", vi."mileage_at_inspection",
      vi."inspection_cost", vi."inspector", vi."notes",
      vi."inspection_status",
      DAYS_BETWEEN(vi."next_due_date", CURRENT_DATE)                          AS "days_overdue",
      v."vehicle_id", v."vehicle_number", v."make", v."model",
      v."year", v."department", v."vehicle_status"
    FROM ${S}."I_VehicleInspection" vi
    JOIN ${S}."I_Vehicle"            v ON v."vehicle_id" = vi."vehicle_id"
    ORDER BY
      CASE vi."inspection_status" WHEN 'OVERDUE' THEN 0 WHEN 'SCHEDULED' THEN 1 ELSE 2 END,
      vi."next_due_date" ASC`,

  costByDept: `
    SELECT
      v."department",
      COUNT(DISTINCT v."vehicle_id")                                           AS "vehicle_count",
      ROUND(SUM(fr."total_cost"), 2)                                           AS "fuel_cost_ytd",
      ROUND(SUM(fr."gallons"), 1)                                              AS "gallons_ytd",
      ROUND(SUM(v."acquisition_cost"), 2)                                      AS "fleet_value",
      ROUND(AVG(v."odometer_miles"), 0)                                        AS "avg_mileage"
    FROM ${S}."I_Vehicle"    v
    LEFT JOIN ${S}."I_FuelRecord" fr ON fr."vehicle_id" = v."vehicle_id"
                                     AND fr."fuel_date" >= ADD_MONTHS(CURRENT_DATE,-12)
    GROUP BY v."department"
    ORDER BY "fuel_cost_ytd" DESC`,

  utilization: `
    SELECT
      v."vehicle_id", v."vehicle_number", v."make", v."model",
      v."year", v."department", v."vehicle_status",
      v."odometer_miles", v."acquisition_cost",
      COALESCE(SUM(fr."gallons"), 0)                                           AS "gallons_ytd",
      COALESCE(ROUND(SUM(fr."total_cost"), 2), 0)                             AS "fuel_cost_ytd",
      COUNT(fr."record_id")                                                    AS "fuel_stops_ytd",
      COALESCE(ROUND(SUM(fr."total_cost") / NULLIF(v."acquisition_cost",0) * 100, 1), 0) AS "cost_to_value_pct"
    FROM ${S}."I_Vehicle"    v
    LEFT JOIN ${S}."I_FuelRecord" fr ON fr."vehicle_id" = v."vehicle_id"
                                     AND fr."fuel_date" >= ADD_MONTHS(CURRENT_DATE,-12)
    GROUP BY v."vehicle_id", v."vehicle_number", v."make", v."model",
             v."year", v."department", v."vehicle_status",
             v."odometer_miles", v."acquisition_cost"
    ORDER BY "fuel_cost_ytd" DESC`,
};
