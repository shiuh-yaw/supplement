/**
 * Vietnamese (Tiếng Việt) translations of the engine text, labels and starter knowledge base.
 * The user is addressed as "bạn". Decimals use a comma and thousands a dot (4.000 IU).
 *
 * Medical wording should be proofread by a native speaker before promotion.
 */
import type { EngineMessages } from "../i18n";
import type { LabelSet } from "../labels";
import type { SupplementTranslation } from "../defaults-i18n";

export const VI_ENGINE: EngineMessages = {
  schedule: { daily: "/ngày", every_other_day: " cách ngày", per_exercise_hour: " mỗi giờ tập luyện" },
  units: { "g protein": "g protein", "mg iron": "mg sắt", "mg sodium": "mg natri", "mg EPA+DHA": "mg EPA+DHA" },
  older65: (min) => `Người từ 65 tuổi trở lên cần ít nhất ${min} g/kg/ngày để duy trì khối cơ.`,
  proteinTarget: (a, b, min, max) =>
    `Mục tiêu protein mỗi ngày của bạn là ${a}–${b} g/kg/ngày ≈ ${min}–${max} g/ngày, dựa trên mục tiêu và cân nặng của bạn.`,
  fromFood: (g) => `Bạn nhận được khoảng ${g} g/ngày từ thức ăn.`,
  assumedFood: (g) =>
    `Bạn chưa cho chúng tôi biết lượng protein từ bữa ăn, nên chúng tôi ước tính khoảng ~${g} g/ngày. Hãy ghi lại các bữa ăn trong vài ngày để có con số chính xác hơn.`,
  foodMeets: "Chỉ riêng thức ăn đã đáp ứng mục tiêu của bạn — sản phẩm bổ sung protein là tùy chọn, không cần thiết.",
  gapTooLarge: (max) =>
    `Lượng protein còn thiếu của bạn vượt quá ${max} g/ngày; hãy bù phần còn lại bằng các bữa ăn giàu protein thay vì dùng thêm bột protein.`,
  notSold: "Không bán tại quốc gia của bạn",
  contains: (a) => `Có chứa ${a}`,
  notVegan: "Chưa xác nhận thuần chay",
  lactose: "Có chứa lactose",
  notHalal: "Chưa xác nhận halal",
  tested: (list) => `Đã được bên thứ ba kiểm nghiệm (${list})`,
  noTesting: "Chưa có chứng nhận kiểm nghiệm của bên thứ ba",
  bestValue: "Thuộc nhóm có giá tốt nhất tính theo gram",
  sugarEnergy: (g) => `${g} g đường mỗi khẩu phần — cung cấp năng lượng hữu ích cho buổi tập dài, nhưng lượng đường sẽ cộng dồn`,
  lowSugar: "Ít đường — phù hợp khi cần kiểm soát đường huyết",
  sugarBad: (g) => `${g} g đường mỗi khẩu phần — không phù hợp khi cần kiểm soát đường huyết`,
  overBudget: "Vượt ngân sách hằng tháng của bạn",
  halal: "Có chứng nhận halal",
  moreThanSuggested: (active, max, unit) =>
    `Một khẩu phần chứa ${active} ${unit} — nhiều hơn mức ${max} ${unit} được khuyến nghị`,
  isolateLactose: "Dạng isolate — thường có dưới 1 g lactose mỗi khẩu phần; nên bắt đầu với lượng nhỏ",
  creatineMono: "Creatine monohydrate — dạng được nghiên cứu nhiều nhất",
  creatineOther: "Dạng creatine ít được nghiên cứu; chưa có bằng chứng tốt hơn dạng monohydrate",
  vitD3: "Vitamin D3 — làm tăng nồng độ vitamin D trong máu hiệu quả hơn D2",
  vitD2: "Vitamin D2 — có tác dụng, nhưng D3 làm tăng nồng độ nhiều hơn",
  algaeOil: "Dầu tảo — EPA/DHA có nguồn gốc thực vật",
  fishOil: "Dầu cá có EPA + DHA",
  proteinPct: (p) => `${p}% protein theo khối lượng`,
  proteinPctLow: (p) => `Chỉ có ${p}% protein theo khối lượng (nhiều chất độn)`,
  alreadyBlocked: "Bạn cho biết hiện đang dùng sản phẩm này. Vui lòng hỏi ý kiến bác sĩ trước khi tiếp tục sử dụng.",
  alreadyNotNeeded:
    "Bạn đang dùng sản phẩm này, nhưng câu trả lời của bạn không cho thấy bạn cần đến nó. Hãy hỏi ý kiến bác sĩ hoặc dược sĩ xem có nên tiếp tục hay không.",
  notIndicated: "Không được khuyến nghị cho mục tiêu và tình trạng của bạn.",
  alreadyTaking: "Bạn đang dùng sản phẩm này — hãy tiếp tục, và kiểm tra xem sản phẩm của bạn có cung cấp đúng lượng dưới đây không.",
  noProducts: "Danh mục của chúng tôi chưa có sản phẩm nào.",
  noMatch: (why) => `Không có sản phẩm nào trong danh mục phù hợp với nhu cầu của bạn (${why}).`,
  disclaimer:
    "Đây là thông tin giáo dục chung, không phải lời khuyên y khoa. Thông tin này không dùng để chẩn đoán hay điều trị bất kỳ bệnh nào. " +
    "Hãy hỏi ý kiến bác sĩ, chuyên gia dinh dưỡng hoặc dược sĩ trước khi bắt đầu dùng thực phẩm bổ sung — đặc biệt nếu bạn " +
    "đang có bệnh lý, đang dùng thuốc, hoặc đang mang thai hay cho con bú.",
  allergens: {
    dairy: "sữa", soy: "đậu nành", gluten: "gluten", egg: "trứng", peanut: "đậu phộng", tree_nut: "các loại hạt", fish: "cá", shellfish: "hải sản có vỏ",
  },
};

export const VI_LABELS: LabelSet = {
  goals: {
    muscle_gain: "Tăng cơ",
    strength: "Tăng sức mạnh",
    fat_loss: "Giảm mỡ, giữ cơ",
    endurance: "Sức bền (chạy bộ, đạp xe…)",
    general_health: "Sức khỏe tổng quát",
  },
  diets: { omnivore: "Tôi ăn thịt / cá", vegetarian: "Ăn chay (có trứng, sữa)", vegan: "Thuần chay" },
  countries: { MY: "Malaysia", SG: "Singapore", ID: "Indonesia", TH: "Thái Lan", PH: "Philippines", VN: "Việt Nam" },
  allergens: {
    dairy: "Sữa / chế phẩm từ sữa", soy: "Đậu nành", gluten: "Gluten", egg: "Trứng", peanut: "Đậu phộng",
    tree_nut: "Các loại hạt (hạnh nhân, óc chó…)", fish: "Cá", shellfish: "Hải sản có vỏ (tôm, cua, sò…)",
  },
  conditions: {
    kidney_disease: "Bệnh thận",
    liver_disease: "Bệnh gan",
    diabetes: "Đái tháo đường / tiền đái tháo đường",
    hypertension: "Tăng huyết áp",
    heart_disease: "Bệnh tim",
    gout: "Bệnh gút / acid uric máu cao",
    pregnant: "Đang mang thai",
    breastfeeding: "Đang cho con bú",
    iron_overload_risk: "Bệnh thalassemia (tan máu bẩm sinh, kể cả người mang gen) hoặc bệnh ứ sắt (hemochromatosis)",
  },
  medications: {
    diuretic: "Thuốc lợi tiểu",
    nsaid_regular: "Thuốc giảm đau như ibuprofen / naproxen, dùng gần như hằng ngày",
    nephrotoxic: "Thuốc khác mà bác sĩ cho biết có ảnh hưởng đến thận",
    anticoagulant: "Thuốc chống đông máu (ví dụ warfarin)",
    diabetes_medication: "Thuốc điều trị đái tháo đường (ví dụ metformin, insulin)",
    blood_pressure: "Thuốc điều trị huyết áp",
    other: "Thuốc kê đơn khác",
  },
  currentSupplements: {
    protein: "Bột protein", creatine: "Creatine", vitamin_d: "Vitamin D", omega_3: "Dầu cá / omega-3",
    iron: "Sắt", vitamin_b12: "Vitamin B12", electrolytes: "Chất điện giải", multivitamin: "Vitamin tổng hợp",
    calcium: "Canxi", magnesium: "Magie", zinc: "Kẽm", herbal: "Sản phẩm thảo dược (ví dụ St John's Wort, bạch quả/ginkgo)",
  },
};

export const VI_SUPPLEMENTS: Record<string, SupplementTranslation> = {
  protein: {
    name: "Bột protein",
    summary:
      "Cách tiện lợi để đạt mục tiêu protein hằng ngày khi chỉ ăn uống là chưa đủ. Whey isolate và hỗn hợp protein thực vật đều phù hợp; tổng lượng protein trong ngày quan trọng hơn thời điểm dùng.",
    timing: "Bất kỳ lúc nào trong ngày. Lý tưởng nhất là chia đều lượng protein cho 3–5 bữa (≈0,3–0,4 g/kg mỗi bữa).",
    notes: ["Bột protein là thực phẩm, không phải sản phẩm thần kỳ — protein từ thức ăn thông thường cũng hiệu quả như vậy."],
  },
  creatine: {
    name: "Creatine monohydrate",
    summary:
      "Thực phẩm bổ sung thể thao được nghiên cứu nhiều nhất. Giúp tăng sức mạnh, sức bộc phát và khối cơ nạc khi kết hợp với tập kháng lực (tập tạ).",
    timing: "Mỗi ngày, vào bất kỳ lúc nào, uống cùng nước hoặc bữa ăn. Không cần giai đoạn nạp (loading) — cơ bắp sẽ bão hòa creatine sau 3–4 tuần.",
    notes: [
      "Creatine có thể làm tăng chỉ số creatinine trong xét nghiệm máu mà không gây hại cho thận. Hãy báo với bác sĩ rằng bạn đang dùng creatine trước khi xét nghiệm chức năng thận.",
      "Tăng nhẹ cân do giữ nước (≈1 kg) trong những tuần đầu là bình thường.",
    ],
  },
  vitamin_d: {
    name: "Vitamin D3",
    summary:
      "Giúp bù đắp tình trạng thiếu vitamin D. Không mang lại thêm lợi ích nếu nồng độ vitamin D của bạn đã đủ. Dù nhiều nắng, thiếu vitamin D vẫn phổ biến ở Đông Nam Á, đặc biệt ở những người làm việc trong nhà.",
    timing: "Mỗi ngày một lần, uống cùng bữa ăn có một ít chất béo.",
    notes: [
      "Liều cao hơn chỉ được dùng khi có bác sĩ kê đơn. Giữ tổng lượng từ tất cả các sản phẩm (kể cả vitamin tổng hợp) dưới 4.000 IU mỗi ngày.",
      "Xét nghiệm lại nồng độ vitamin D sau khoảng 3 tháng.",
    ],
  },
  omega_3: {
    name: "Omega-3 (EPA + DHA)",
    summary:
      "Dầu cá, hoặc dầu tảo nếu bạn ăn chay hay thuần chay, dành cho người hiếm khi ăn cá béo. Hỗ trợ sức khỏe tim mạch; lợi ích đối với người khỏe mạnh ở mức khiêm tốn.",
    timing: "Uống cùng bữa ăn để giảm ợ hơi có mùi tanh cá.",
    notes: ["Hãy tính lượng EPA + DHA ghi trên nhãn, không phải tổng lượng dầu cá."],
  },
  iron: {
    name: "Sắt",
    summary:
      "Chỉ dành cho người đã được xác nhận dự trữ sắt thấp (ferritin thấp trong xét nghiệm máu). Bổ sung sắt khi không cần thiết có thể gây hại, vì vậy chúng tôi không bao giờ gợi ý sắt khi chưa có kết quả xét nghiệm.",
    timing:
      "Cách ngày, uống lúc đói hoặc cùng thực phẩm giàu vitamin C. Không uống cùng trà, cà phê, sữa hoặc canxi.",
    notes: [
      "Uống sắt cách ngày giúp hấp thu tốt hơn và ít gây khó chịu dạ dày hơn so với uống mỗi ngày.",
      "Táo bón và buồn nôn là thường gặp. Xét nghiệm lại ferritin sau 2–3 tháng.",
    ],
  },
  vitamin_b12: {
    name: "Vitamin B12",
    summary:
      "Rất cần thiết nếu bạn ăn ít hoặc không ăn thực phẩm có nguồn gốc động vật. Cũng hữu ích cho người lớn tuổi và người dùng metformin lâu dài.",
    timing: "Bất kỳ lúc nào trong ngày. Có thể dùng dạng viên nhai hoặc viên ngậm dưới lưỡi.",
    notes: ["Chưa có ngưỡng tối đa được thiết lập cho B12; tác dụng phụ ở các liều này rất hiếm gặp."],
  },
  electrolytes: {
    name: "Chất điện giải (natri)",
    summary:
      "Dành cho buổi tập dài hoặc ra nhiều mồ hôi trong thời tiết nóng ẩm. Không cần thiết cho buổi tập ngắn — nước lọc là đủ.",
    timing: "Trong các buổi tập kéo dài hơn 60–90 phút, pha vào nước uống của bạn.",
    notes: ["Nhiều loại nước uống bù điện giải có nhiều đường. Hãy chọn viên sủi không đường, trừ khi bạn cũng cần thêm năng lượng."],
  },
};

export const VI_RULES: Record<string, string> = {
  "global-under-18":
    "Bạn dưới 18 tuổi. Không khuyến nghị dùng thực phẩm bổ sung thể thao khi chưa có ý kiến của bác sĩ hoặc chuyên gia dinh dưỡng thể thao — hãy ưu tiên dinh dưỡng từ bữa ăn trước.",
  "global-pregnancy":
    "Bạn đang mang thai hoặc cho con bú. Vui lòng hỏi ý kiến bác sĩ sản khoa hoặc nữ hộ sinh trước khi dùng bất kỳ thực phẩm bổ sung thể thao nào.",
  "global-high-alt":
    "Chỉ số ALT (men gan) của bạn cao hơn ~3 lần mức giới hạn bình thường. Vui lòng đi khám bác sĩ về vấn đề này trước khi bắt đầu dùng thực phẩm bổ sung.",
  "global-medications":
    "Bạn đang dùng thuốc. Hãy nhờ dược sĩ kiểm tra tương tác thuốc trước khi bắt đầu dùng bất kỳ sản phẩm mới nào.",
  "global-herbal":
    "Các sản phẩm thảo dược (ví dụ St John's Wort, bạch quả/ginkgo hoặc nghệ liều cao) có thể tương tác với thuốc. Hãy mang nhãn sản phẩm cho dược sĩ xem.",
  "protein-recommend-active":
    "Tăng lượng protein nạp vào giúp hỗ trợ phục hồi và phát triển cơ cho mục tiêu tập luyện của bạn.",
  "protein-recommend-older":
    "Người từ 65 tuổi trở lên cần nhiều protein hơn để làm chậm quá trình mất cơ do tuổi tác.",
  "protein-block-ckd":
    "Khi chức năng thận suy giảm, lượng protein cần do bác sĩ chuyên khoa thận hoặc chuyên gia dinh dưỡng về thận chỉ định. Không tự ý dùng thêm sản phẩm bổ sung protein.",
  "protein-caution-liver":
    "Bạn cho biết có bệnh gan. Hãy hỏi ý kiến bác sĩ về mục tiêu protein của bạn.",
  "creatine-recommend-strength":
    "Creatine giúp tăng sức mạnh và khối cơ một cách đáng tin cậy khi bạn tập tạ đều đặn.",
  "creatine-recommend-other-training":
    "Khi tập luyện đều đặn, creatine có thể giúp bạn duy trì và phát triển khối cơ (bằng chứng ở mức trung bình cho mục tiêu này).",
  "creatine-block-ckd":
    "Chức năng thận của bạn đã suy giảm (bệnh thận hoặc eGFR dưới 60). Không dùng creatine trừ khi bác sĩ chuyên khoa thận của bạn đồng ý.",
  "creatine-caution-kidney-meds":
    "Bạn đang dùng thuốc có thể ảnh hưởng đến thận (thuốc lợi tiểu, thường xuyên dùng thuốc giảm đau NSAID hoặc thuốc tương tự). Hãy hỏi ý kiến bác sĩ trước khi bắt đầu dùng creatine.",
  "creatine-caution-no-kidney-labs":
    "Do tuổi tác hoặc tiền sử sức khỏe của bạn, hãy xét nghiệm chức năng thận (eGFR / creatinine) trước khi bắt đầu dùng creatine.",
  "vitd-recommend-low":
    "Nồng độ vitamin D của bạn dưới 50 nmol/L (20 ng/mL), là mức mà hầu hết các hướng dẫn coi là đủ.",
  "vitd-recommend-75plus":
    "Với người từ 75 tuổi trở lên, các hướng dẫn khuyến nghị bổ sung vitamin D hằng ngày, kể cả khi chưa xét nghiệm máu.",
  "vitd-caution-very-low":
    "Nồng độ vitamin D của bạn rất thấp (dưới 30 nmol/L / 12 ng/mL). Bác sĩ có thể kê liều điều trị cao hơn và kiểm tra nguyên nhân gây thiếu hụt.",
  "vitd-block-high":
    "Nồng độ vitamin D của bạn đã cao (trên 150 nmol/L / 60 ng/mL). Không dùng thêm; hãy hỏi ý kiến bác sĩ.",
  "vitd-caution-kidney":
    "Khi chức năng thận suy giảm, việc dùng vitamin D cần do bác sĩ chuyên khoa thận của bạn quản lý.",
  "vitd-caution-multivitamin":
    "Vitamin tổng hợp bạn đang dùng có thể cũng chứa vitamin D. Hãy cộng vào tổng lượng và giữ dưới 4.000 IU mỗi ngày.",
  "omega3-recommend-low-fish":
    "Bạn ăn cá ít hơn một lần mỗi tuần; các hướng dẫn khuyến nghị khoảng hai khẩu phần cá béo mỗi tuần.",
  "omega3-recommend-plant-based":
    "Chế độ ăn thực vật hầu như không cung cấp EPA hoặc DHA; dầu tảo là nguồn thuần chay.",
  "omega3-caution-anticoagulant":
    "Omega-3 có thể làm tăng tác dụng của thuốc chống đông máu. Hãy hỏi ý kiến bác sĩ trước khi bắt đầu dùng.",
  "iron-recommend-low-ferritin":
    "Ferritin của bạn dưới 30 µg/L, cho thấy dự trữ sắt thấp — thường gặp do kinh nguyệt.",
  "iron-block-investigate":
    "Thiếu sắt ở nam giới và ở phụ nữ trên 50 tuổi cần được bác sĩ tìm nguyên nhân (ví dụ mất máu tiềm ẩn) trước khi dùng sắt.",
  "iron-block-overload-risk":
    "Nếu bạn mắc bệnh thalassemia (tan máu bẩm sinh) hoặc bệnh ứ sắt (hemochromatosis), chỉ dùng sắt khi bác sĩ xác nhận bạn bị thiếu sắt.",
  "iron-block-high-ferritin":
    "Ferritin của bạn cao. Không dùng sắt trừ khi bác sĩ chỉ định.",
  "iron-caution-calcium":
    "Canxi cản trở hấp thu sắt. Hãy uống hai loại này cách nhau ít nhất 2 giờ.",
  "iron-caution-multivitamin":
    "Vitamin tổng hợp bạn đang dùng có thể đã chứa sắt. Hãy kiểm tra nhãn để tránh dùng trùng lặp.",
  "b12-recommend-vegan":
    "Người ăn thuần chay cần một nguồn B12 đáng tin cậy; thực phẩm thực vật không cung cấp B12.",
  "b12-recommend-vegetarian":
    "Người ăn chay thường nhận quá ít B12 nếu chỉ dựa vào trứng và sữa.",
  "b12-recommend-low-lab":
    "Nồng độ B12 của bạn thấp (dưới 148 pmol/L / 200 pg/mL).",
  "b12-recommend-diabetes-meds":
    "Nếu bạn dùng metformin, sử dụng lâu dài có thể làm giảm B12. Hãy nhờ bác sĩ kiểm tra nồng độ B12 mỗi năm.",
  "b12-recommend-older":
    "Khả năng hấp thu B12 từ thức ăn giảm dần theo tuổi tác.",
  "b12-caution-low-lab":
    "B12 thấp cần được bác sĩ kiểm tra: bạn có thể cần liều cao hơn hoặc tiêm B12, và cần tìm ra nguyên nhân.",
  "electrolytes-recommend-endurance":
    "Các buổi tập dài trong thời tiết nóng ẩm của Đông Nam Á khiến cơ thể mất nhiều mồ hôi và muối.",
  "electrolytes-block-kidney":
    "Khi chức năng thận suy giảm, hãy hỏi ý kiến bác sĩ trước khi dùng các sản phẩm điện giải (chúng chứa natri và kali).",
  "electrolytes-caution-bp":
    "Sản phẩm điện giải bổ sung thêm natri (và thường cả kali). Nếu bạn bị tăng huyết áp, bệnh tim hoặc đang dùng thuốc huyết áp, hãy hỏi ý kiến bác sĩ trước.",
};
