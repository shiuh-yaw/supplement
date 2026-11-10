import type { Country } from "@supplement/engine";

/**
 * Wording a country's regulator requires alongside supplement products. Kept in the
 * required language whatever the site language is.
 * - PH: FDA requires "No approved therapeutic claims" for food supplements.
 * - VN: Decree 15/2018 and Decree 342/2025 require naming the category and stating it isn't a medicine.
 */
export const COUNTRY_PRODUCT_NOTICES: Partial<Record<Country, string>> = {
  PH: "Food supplement. No approved therapeutic claims.",
  VN: "Thực phẩm bảo vệ sức khỏe. Sản phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.",
};
