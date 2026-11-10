import type { TRANSLATED_LOCALES } from "./i18n";
import { TH_RULES, TH_SUPPLEMENTS } from "./locales/th";
import { VI_RULES, VI_SUPPLEMENTS } from "./locales/vi";
/**
 * Translations of the starter knowledge base. The seed copies these into each
 * supplement's and rule's `translations` field in the database, where the
 * backoffice can correct them. English stays in the main fields.
 *
 * Thai and Vietnamese live in ./locales/th.ts and ./locales/vi.ts.
 *
 * Medical wording should be proofread by a native speaker before promotion.
 */
export type TranslatedLocale = (typeof TRANSLATED_LOCALES)[number];

export interface SupplementTranslation {
  name: string;
  summary: string;
  timing: string;
  notes: string[];
}

const MS_ID_SUPPLEMENTS: Record<string, Record<"ms" | "id", SupplementTranslation>> = {
  protein: {
    ms: {
      name: "Serbuk protein",
      summary:
        "Cara mudah mencapai sasaran protein harian apabila makanan sahaja tidak mencukupi. Isolat whey dan campuran tumbuhan sesuai; jumlah protein sehari lebih penting daripada masa pengambilan.",
      timing: "Bila-bila masa. Paling baik diagihkan kepada 3–5 hidangan (≈0.3–0.4 g/kg setiap satu).",
      notes: ["Serbuk protein ialah makanan, bukan produk ajaib — protein daripada makanan biasa sama berkesan."],
    },
    id: {
      name: "Bubuk protein",
      summary:
        "Cara praktis mencapai target protein harian saat makanan saja tidak cukup. Whey isolat dan campuran protein nabati sama-sama baik; total protein harian lebih penting daripada waktu konsumsi.",
      timing: "Kapan saja. Idealnya dibagi ke 3–5 kali makan (≈0,3–0,4 g/kg setiap kali).",
      notes: ["Bubuk protein adalah makanan, bukan produk ajaib — protein dari makanan biasa sama efektifnya."],
    },
  },
  creatine: {
    ms: {
      name: "Kreatin monohidrat",
      summary:
        "Suplemen sukan yang paling banyak dikaji. Meningkatkan kekuatan, kuasa dan pertambahan otot apabila digabungkan dengan latihan bebanan.",
      timing: "Setiap hari, bila-bila masa, dengan air atau makanan. Tidak perlu fasa 'loading' — otot tepu dalam 3–4 minggu.",
      notes: [
        "Kreatin boleh meningkatkan bacaan kreatinin dalam ujian darah tanpa merosakkan buah pinggang. Beritahu doktor anda sebelum ujian buah pinggang.",
        "Pertambahan berat air yang sedikit (≈1 kg) pada minggu-minggu awal adalah normal.",
      ],
    },
    id: {
      name: "Kreatin monohidrat",
      summary:
        "Suplemen olahraga yang paling banyak diteliti. Meningkatkan kekuatan, daya ledak, dan massa otot bila dikombinasikan dengan latihan beban.",
      timing: "Setiap hari, kapan saja, dengan air atau makanan. Tidak perlu fase 'loading' — otot jenuh dalam 3–4 minggu.",
      notes: [
        "Kreatin dapat menaikkan hasil tes kreatinin darah tanpa merusak ginjal. Beri tahu dokter Anda sebelum tes fungsi ginjal.",
        "Kenaikan berat air yang ringan (≈1 kg) pada minggu-minggu awal itu normal.",
      ],
    },
  },
  vitamin_d: {
    ms: {
      name: "Vitamin D3",
      summary:
        "Membetulkan paras vitamin D yang rendah. Tiada manfaat tambahan jika paras anda sudah mencukupi. Walaupun cuaca panas, kekurangan vitamin D biasa berlaku di Asia Tenggara, terutamanya bagi mereka yang bekerja di dalam bangunan.",
      timing: "Sekali sehari bersama hidangan yang mengandungi sedikit lemak.",
      notes: [
        "Dos yang lebih tinggi hanya boleh dipreskripsi oleh doktor. Pastikan jumlah daripada semua produk (termasuk multivitamin) kurang daripada 4,000 IU sehari.",
        "Uji semula paras anda selepas kira-kira 3 bulan.",
      ],
    },
    id: {
      name: "Vitamin D3",
      summary:
        "Memperbaiki kadar vitamin D yang rendah. Tidak ada manfaat tambahan bila kadar Anda sudah cukup. Meski banyak sinar matahari, kekurangan vitamin D umum di Asia Tenggara, terutama bagi yang bekerja di dalam ruangan.",
      timing: "Sekali sehari bersama makanan yang mengandung sedikit lemak.",
      notes: [
        "Dosis lebih tinggi hanya boleh diresepkan dokter. Jaga total dari semua produk (termasuk multivitamin) di bawah 4.000 IU sehari.",
        "Periksa ulang kadar Anda setelah sekitar 3 bulan.",
      ],
    },
  },
  omega_3: {
    ms: {
      name: "Omega-3 (EPA + DHA)",
      summary:
        "Minyak ikan, atau minyak alga jika anda vegetarian atau vegan, untuk mereka yang jarang makan ikan berlemak. Menyokong kesihatan jantung; manfaatnya bagi orang yang sihat adalah sederhana.",
      timing: "Bersama makanan, untuk mengurangkan sendawa berbau ikan.",
      notes: ["Kira jumlah EPA + DHA pada label, bukan jumlah keseluruhan minyak ikan."],
    },
    id: {
      name: "Omega-3 (EPA + DHA)",
      summary:
        "Minyak ikan, atau minyak alga bila Anda vegetarian atau vegan, untuk yang jarang makan ikan berlemak. Mendukung kesehatan jantung; manfaatnya bagi orang sehat tergolong kecil.",
      timing: "Bersama makanan, untuk mengurangi sendawa beraroma ikan.",
      notes: ["Hitung EPA + DHA pada label, bukan jumlah total minyak ikan."],
    },
  },
  iron: {
    ms: {
      name: "Zat besi",
      summary:
        "Hanya untuk simpanan zat besi yang disahkan rendah (feritin rendah dalam ujian darah). Zat besi yang tidak diperlukan boleh memudaratkan, jadi kami tidak mencadangkannya tanpa keputusan ujian.",
      timing: "Selang sehari, semasa perut kosong atau bersama makanan kaya vitamin C. Jangan bersama teh, kopi, susu atau kalsium.",
      notes: [
        "Mengambil zat besi selang sehari lebih mudah diserap dan kurang menyebabkan sakit perut berbanding setiap hari.",
        "Sembelit dan loya adalah biasa. Uji semula feritin selepas 2–3 bulan.",
      ],
    },
    id: {
      name: "Zat besi",
      summary:
        "Hanya untuk cadangan zat besi yang terbukti rendah (feritin rendah pada tes darah). Zat besi yang tidak dibutuhkan bisa berbahaya, jadi kami tidak pernah menyarankannya tanpa hasil tes.",
      timing: "Dua hari sekali, saat perut kosong atau bersama makanan kaya vitamin C. Jangan bersama teh, kopi, susu, atau kalsium.",
      notes: [
        "Zat besi yang diminum dua hari sekali lebih mudah diserap dan lebih jarang membuat sakit perut dibanding setiap hari.",
        "Sembelit dan mual sering terjadi. Periksa ulang feritin setelah 2–3 bulan.",
      ],
    },
  },
  vitamin_b12: {
    ms: {
      name: "Vitamin B12",
      summary:
        "Penting jika anda kurang atau tidak makan makanan haiwan. Juga berguna untuk warga emas dan mereka yang mengambil metformin jangka panjang.",
      timing: "Bila-bila masa. Bentuk kunyah atau bawah lidah juga sesuai.",
      notes: ["Tiada had maksimum ditetapkan untuk B12; kesan sampingan pada dos ini jarang berlaku."],
    },
    id: {
      name: "Vitamin B12",
      summary:
        "Penting bila Anda jarang atau tidak makan makanan hewani. Juga bermanfaat bagi lansia dan pengguna metformin jangka panjang.",
      timing: "Kapan saja. Bentuk kunyah atau bawah lidah juga bisa.",
      notes: ["Belum ada batas atas yang ditetapkan untuk B12; efek samping pada dosis ini jarang terjadi."],
    },
  },
  electrolytes: {
    ms: {
      name: "Elektrolit (natrium)",
      summary:
        "Untuk sesi senaman yang panjang atau sangat berpeluh dalam cuaca panas dan lembap. Tidak perlu untuk senaman singkat — air sudah mencukupi.",
      timing: "Semasa sesi lebih daripada 60–90 minit, dicampur ke dalam air minuman anda.",
      notes: ["Banyak minuman elektrolit tinggi gula. Pilih tablet tanpa gula melainkan anda juga perlukan tenaga."],
    },
    id: {
      name: "Elektrolit (natrium)",
      summary:
        "Untuk sesi latihan panjang atau sangat berkeringat di cuaca panas dan lembap. Tidak diperlukan untuk latihan singkat — air sudah cukup.",
      timing: "Saat sesi lebih dari 60–90 menit, dicampur ke air minum Anda.",
      notes: ["Banyak minuman elektrolit tinggi gula. Pilih tablet bebas gula kecuali Anda juga butuh energi."],
    },
  },
};

const MS_ID_RULES: Record<string, Record<"ms" | "id", string>> = {
  "global-under-18": {
    ms: "Anda berumur bawah 18 tahun. Suplemen sukan tidak disyorkan tanpa doktor atau pakar diet sukan — utamakan makanan dahulu.",
    id: "Anda berusia di bawah 18 tahun. Suplemen olahraga tidak dianjurkan tanpa dokter atau ahli gizi olahraga — utamakan makanan terlebih dahulu.",
  },
  "global-pregnancy": {
    ms: "Anda hamil atau menyusukan bayi. Sila tanya pakar obstetrik atau bidan anda sebelum mengambil sebarang suplemen sukan.",
    id: "Anda sedang hamil atau menyusui. Tanyakan dokter kandungan atau bidan Anda sebelum mengonsumsi suplemen olahraga apa pun.",
  },
  "global-high-alt": {
    ms: "Paras ALT (enzim hati) anda lebih daripada ~3× had normal. Sila jumpa doktor tentang perkara ini sebelum memulakan suplemen.",
    id: "Kadar ALT (enzim hati) Anda lebih dari ~3× batas normal. Temui dokter terlebih dahulu sebelum mulai mengonsumsi suplemen.",
  },
  "global-medications": {
    ms: "Anda mengambil ubat. Minta ahli farmasi menyemak interaksi sebelum memulakan apa-apa yang baharu.",
    id: "Anda sedang minum obat. Minta apoteker memeriksa interaksi sebelum memulai sesuatu yang baru.",
  },
  "global-herbal": {
    ms: "Produk herba (contohnya St John's Wort, ginkgo atau kunyit dos tinggi) boleh berinteraksi dengan ubat. Tunjukkan labelnya kepada ahli farmasi anda.",
    id: "Produk herbal (misalnya St John's Wort, ginkgo, atau kunyit dosis tinggi) dapat berinteraksi dengan obat. Tunjukkan labelnya kepada apoteker Anda.",
  },
  "protein-recommend-active": {
    ms: "Pengambilan protein yang lebih tinggi menyokong pemulihan dan pertumbuhan otot untuk matlamat latihan anda.",
    id: "Asupan protein yang lebih tinggi mendukung pemulihan dan pertumbuhan otot untuk tujuan latihan Anda.",
  },
  "protein-recommend-older": {
    ms: "Orang dewasa 65 tahun ke atas memerlukan lebih banyak protein untuk melambatkan kehilangan otot akibat usia.",
    id: "Orang dewasa usia 65+ membutuhkan lebih banyak protein untuk memperlambat penyusutan otot karena usia.",
  },
  "protein-block-ckd": {
    ms: "Jika fungsi buah pinggang anda berkurangan, pengambilan protein perlu ditetapkan oleh pakar nefrologi atau pakar diet buah pinggang. Jangan tambah suplemen protein sendiri.",
    id: "Dengan fungsi ginjal yang menurun, asupan protein harus ditentukan oleh dokter spesialis ginjal atau ahli gizi ginjal. Jangan menambah suplemen protein sendiri.",
  },
  "protein-caution-liver": {
    ms: "Anda melaporkan penyakit hati. Semak sasaran protein anda dengan doktor.",
    id: "Anda melaporkan penyakit hati. Periksakan target protein Anda ke dokter.",
  },
  "creatine-recommend-strength": {
    ms: "Kreatin terbukti meningkatkan kekuatan dan pertambahan otot apabila anda kerap melakukan latihan bebanan.",
    id: "Kreatin terbukti meningkatkan kekuatan dan pertumbuhan otot bila Anda rutin latihan beban.",
  },
  "creatine-recommend-other-training": {
    ms: "Dengan latihan yang kerap, kreatin boleh membantu mengekalkan dan membina otot (bukti sederhana untuk matlamat ini).",
    id: "Dengan latihan rutin, kreatin dapat membantu mempertahankan dan membentuk otot (bukti sedang untuk tujuan ini).",
  },
  "creatine-block-ckd": {
    ms: "Fungsi buah pinggang anda berkurangan (penyakit buah pinggang atau eGFR bawah 60). Jangan ambil kreatin melainkan diluluskan oleh pakar nefrologi anda.",
    id: "Fungsi ginjal Anda menurun (penyakit ginjal atau eGFR di bawah 60). Jangan konsumsi kreatin kecuali disetujui dokter spesialis ginjal Anda.",
  },
  "creatine-caution-kidney-meds": {
    ms: "Anda mengambil ubat yang boleh menjejaskan buah pinggang (diuretik, NSAID secara kerap atau seumpamanya). Semak dengan doktor sebelum memulakan kreatin.",
    id: "Anda minum obat yang dapat memengaruhi ginjal (diuretik, NSAID rutin, atau sejenisnya). Konsultasikan dengan dokter sebelum mulai kreatin.",
  },
  "creatine-caution-no-kidney-labs": {
    ms: "Disebabkan umur atau sejarah kesihatan anda, buat ujian fungsi buah pinggang (eGFR / kreatinin) sebelum memulakan kreatin.",
    id: "Karena usia atau riwayat kesehatan Anda, lakukan tes fungsi ginjal (eGFR / kreatinin) sebelum mulai kreatin.",
  },
  "vitd-recommend-low": {
    ms: "Paras vitamin D anda di bawah 50 nmol/L (20 ng/mL), paras yang dianggap mencukupi oleh kebanyakan garis panduan.",
    id: "Kadar vitamin D Anda di bawah 50 nmol/L (20 ng/mL), kadar yang dianggap cukup oleh sebagian besar pedoman.",
  },
  "vitd-recommend-75plus": {
    ms: "Bagi orang dewasa 75 tahun ke atas, garis panduan mencadangkan suplemen vitamin D setiap hari walaupun tanpa ujian darah.",
    id: "Untuk orang dewasa usia 75+, pedoman menyarankan suplemen vitamin D setiap hari meski tanpa tes darah.",
  },
  "vitd-caution-very-low": {
    ms: "Paras anda sangat rendah (bawah 30 nmol/L / 12 ng/mL). Doktor mungkin mempreskripsi dos rawatan yang lebih tinggi dan menyiasat puncanya.",
    id: "Kadar Anda sangat rendah (di bawah 30 nmol/L / 12 ng/mL). Dokter mungkin meresepkan dosis pengobatan lebih tinggi dan mencari penyebabnya.",
  },
  "vitd-block-high": {
    ms: "Paras vitamin D anda sudah tinggi (melebihi 150 nmol/L / 60 ng/mL). Jangan ambil lagi; tanya doktor anda.",
    id: "Kadar vitamin D Anda sudah tinggi (di atas 150 nmol/L / 60 ng/mL). Jangan tambah lagi; tanyakan dokter Anda.",
  },
  "vitd-caution-kidney": {
    ms: "Jika fungsi buah pinggang anda berkurangan, vitamin D perlu diuruskan oleh pakar nefrologi anda.",
    id: "Dengan fungsi ginjal yang menurun, vitamin D sebaiknya diatur oleh dokter spesialis ginjal Anda.",
  },
  "vitd-caution-multivitamin": {
    ms: "Multivitamin anda mungkin juga mengandungi vitamin D. Masukkan ke dalam jumlah anda dan kekalkan bawah 4,000 IU sehari.",
    id: "Multivitamin Anda kemungkinan juga mengandung vitamin D. Hitung dalam total Anda dan jaga di bawah 4.000 IU sehari.",
  },
  "omega3-recommend-low-fish": {
    ms: "Anda makan ikan kurang daripada sekali seminggu; garis panduan mencadangkan kira-kira dua hidangan ikan berlemak seminggu.",
    id: "Anda makan ikan kurang dari sekali seminggu; pedoman menyarankan sekitar dua porsi ikan berlemak per minggu.",
  },
  "omega3-recommend-plant-based": {
    ms: "Diet berasaskan tumbuhan hampir tidak membekalkan EPA atau DHA; minyak alga ialah sumber vegan.",
    id: "Pola makan nabati hampir tidak menyediakan EPA atau DHA; minyak alga adalah sumber yang vegan.",
  },
  "omega3-caution-anticoagulant": {
    ms: "Omega-3 boleh menambah kesan ubat pencair darah. Tanya doktor anda sebelum memulakannya.",
    id: "Omega-3 dapat menambah efek obat pengencer darah. Tanyakan dokter Anda sebelum memulai.",
  },
  "iron-recommend-low-ferritin": {
    ms: "Feritin anda di bawah 30 µg/L, menunjukkan simpanan zat besi yang rendah — biasa berlaku akibat haid.",
    id: "Feritin Anda di bawah 30 µg/L, menandakan cadangan zat besi yang rendah — umum terjadi karena menstruasi.",
  },
  "iron-block-investigate": {
    ms: "Zat besi rendah pada lelaki dan wanita berumur lebih 50 tahun perlu disiasat puncanya oleh doktor (contohnya pendarahan tersembunyi) sebelum mengambil zat besi.",
    id: "Zat besi rendah pada pria dan wanita di atas 50 tahun perlu dicari penyebabnya oleh dokter (misalnya perdarahan tersembunyi) sebelum mengonsumsi zat besi.",
  },
  "iron-block-overload-risk": {
    ms: "Jika anda menghidap talasemia atau hemokromatosis, ambil zat besi hanya jika doktor mengesahkan anda kekurangan zat besi.",
    id: "Bila Anda memiliki talasemia atau hemokromatosis, konsumsi zat besi hanya jika dokter memastikan Anda kekurangan zat besi.",
  },
  "iron-block-high-ferritin": {
    ms: "Feritin anda tinggi. Jangan ambil zat besi melainkan disuruh oleh doktor.",
    id: "Feritin Anda tinggi. Jangan konsumsi zat besi kecuali atas anjuran dokter.",
  },
  "iron-caution-calcium": {
    ms: "Kalsium menghalang penyerapan zat besi. Ambil kedua-duanya sekurang-kurangnya 2 jam berasingan.",
    id: "Kalsium menghambat penyerapan zat besi. Beri jarak minimal 2 jam di antara keduanya.",
  },
  "iron-caution-multivitamin": {
    ms: "Multivitamin anda mungkin sudah mengandungi zat besi. Semak label supaya tidak berganda.",
    id: "Multivitamin Anda mungkin sudah mengandung zat besi. Periksa labelnya agar tidak dobel.",
  },
  "b12-recommend-vegan": {
    ms: "Vegan memerlukan sumber B12 yang boleh dipercayai; makanan tumbuhan tidak membekalkannya.",
    id: "Vegan membutuhkan sumber B12 yang andal; makanan nabati tidak menyediakannya.",
  },
  "b12-recommend-vegetarian": {
    ms: "Vegetarian selalunya mendapat terlalu sedikit B12 daripada telur dan tenusu sahaja.",
    id: "Vegetarian sering kali mendapat terlalu sedikit B12 dari telur dan susu saja.",
  },
  "b12-recommend-low-lab": {
    ms: "Paras B12 anda rendah (bawah 148 pmol/L / 200 pg/mL).",
    id: "Kadar B12 Anda rendah (di bawah 148 pmol/L / 200 pg/mL).",
  },
  "b12-recommend-diabetes-meds": {
    ms: "Jika anda mengambil metformin, penggunaan jangka panjang boleh merendahkan B12. Minta doktor menyemak paras anda setiap tahun.",
    id: "Bila Anda minum metformin, penggunaan jangka panjang dapat menurunkan B12. Minta dokter memeriksa kadar Anda setiap tahun.",
  },
  "b12-recommend-older": {
    ms: "Penyerapan B12 daripada makanan berkurangan dengan usia.",
    id: "Penyerapan B12 dari makanan menurun seiring bertambahnya usia.",
  },
  "b12-caution-low-lab": {
    ms: "B12 rendah perlu disemak oleh doktor: anda mungkin perlukan dos lebih tinggi atau suntikan, dan puncanya perlu dikenal pasti.",
    id: "B12 rendah perlu diperiksa dokter: Anda mungkin butuh dosis lebih tinggi atau suntikan, dan penyebabnya perlu dicari.",
  },
  "electrolytes-recommend-endurance": {
    ms: "Sesi panjang dalam cuaca panas dan lembap di Asia Tenggara bermakna banyak peluh dan garam yang hilang.",
    id: "Sesi panjang di cuaca panas dan lembap Asia Tenggara berarti banyak keringat dan garam yang hilang.",
  },
  "electrolytes-block-kidney": {
    ms: "Jika fungsi buah pinggang anda berkurangan, tanya doktor sebelum menggunakan produk elektrolit (ia mengandungi natrium dan kalium).",
    id: "Dengan fungsi ginjal yang menurun, tanyakan dokter sebelum memakai produk elektrolit (mengandung natrium dan kalium).",
  },
  "electrolytes-caution-bp": {
    ms: "Produk elektrolit menambah natrium (dan selalunya kalium). Jika anda ada tekanan darah tinggi, penyakit jantung atau mengambil ubat tekanan darah, semak dengan doktor dahulu.",
    id: "Produk elektrolit menambah natrium (dan sering kalium). Bila Anda memiliki tekanan darah tinggi, penyakit jantung, atau minum obat tekanan darah, konsultasikan dengan dokter terlebih dahulu.",
  },
};

export const SUPPLEMENT_TRANSLATIONS: Record<string, Record<TranslatedLocale, SupplementTranslation>> = Object.fromEntries(
  Object.entries(MS_ID_SUPPLEMENTS).map(([slug, t]) => [slug, { ...t, th: TH_SUPPLEMENTS[slug]!, vi: VI_SUPPLEMENTS[slug]! }]),
);

export const RULE_TRANSLATIONS: Record<string, Record<TranslatedLocale, string>> = Object.fromEntries(
  Object.entries(MS_ID_RULES).map(([id, t]) => [id, { ...t, th: TH_RULES[id]!, vi: VI_RULES[id]! }]),
);
