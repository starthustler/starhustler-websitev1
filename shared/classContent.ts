export type PublishStatus = "draft" | "published";

export type ManagedListItem = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  enabled: boolean;
};

export type ClassNotification = {
  id: string;
  icon: string;
  title: string;
  supportingText: string;
  url: string;
  active: boolean;
  displayDurationMs: number;
};

export type ClassContent = {
  shortDescription: string;
  fullDescription: string;
  hero: {
    eyebrow: string;
    headline: string;
    highlightText: string;
    description: string;
    supportingText: string;
    imageUrl: string;
    supportingImageUrl: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    secondaryCtaUrl: string;
    dateBadge: string;
    scheduleText: string;
    deliveryText: string;
  };
  video: {
    enabled: boolean;
    url: string;
    title: string;
    customThumbnailUrl: string;
    aspectRatio: "16:9" | "9:16" | "4:3";
  };
  pricing: {
    originalPrice: number;
    sellingPrice: number;
    priceLabel: string;
    promoLabel: string;
    bundlingLabel: string;
    supportingText: string;
    paymentUrl: string;
  };
  intro: {
    lead: string;
    firstTitle: string;
    firstBody: string;
    secondTitle: string;
    secondBody: string;
  };
  story: {
    title: string;
    paragraphs: string[];
    highlight: string;
    imageUrl: string;
  };
  calculation: {
    title: string;
    description: string;
    formula: string;
    result: string;
    resultWords: string;
    disclaimer: string;
    closing: string;
  };
  solution: {
    title: string;
    paragraphs: string[];
    imageUrl: string;
  };
  painPoints: ManagedListItem[];
  benefits: ManagedListItem[];
  curriculum: ManagedListItem[];
  bonuses: ManagedListItem[];
  testimonials: ManagedListItem[];
  mentor: {
    name: string;
    title: string;
    headline: string;
    description: string;
    extendedDescription: string;
    imageUrl: string;
    proofLabel: string;
  };
  ebook: {
    enabled: boolean;
    title: string;
    headline: string;
    description: string;
    supportingText: string;
    imageUrl: string;
  };
  faq: FaqItem[];
  announcement: {
    enabled: boolean;
    mainText: string;
    highlightText: string;
    ctaLabel: string;
    ctaUrl: string;
    variant: "blue" | "navy";
  };
  countdown: {
    enabled: boolean;
    endDateTime: string;
    label: string;
    expiredText: string;
  };
  floatingCta: {
    enabled: boolean;
    title: string;
    subtitle: string;
    originalPrice: number;
    currentPrice: number;
    ctaLabel: string;
    ctaUrl: string;
    icon: string;
  };
  notificationSettings: {
    enabled: boolean;
    initialDelayMs: number;
    intervalMs: number;
    items: ClassNotification[];
  };
  sectionVisibility: Record<string, boolean>;
  sectionOrder: string[];
  finalCta: {
    title: string;
    description: string;
    ctaLabel: string;
  };
  seo: {
    title: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonicalUrl: string;
  };
};

export type ClassRecord = {
  id: number;
  name: string;
  slug: string;
  status: PublishStatus;
  featured: boolean;
  content: ClassContent;
  createdAt: string;
  updatedAt: string;
};

export const DEFAULT_PAYMENT_URL = "https://pay.doku.com/p-link/p/JFB442avKB";

const item = (
  id: string,
  title: string,
  description = ""
): ManagedListItem => ({
  id,
  title,
  description,
  enabled: true,
});

export const DEFAULT_CLASS_CONTENT: ClassContent = {
  shortDescription:
    "Dari masalah sehari-hari menjadi produk digital yang dapat diuji dan dijual dengan bantuan AI.",
  fullDescription:
    "Kelas praktis untuk mempelajari cara menemukan peluang, membangun produk digital, dan mulai menguji potensi bisnisnya sebagai solopreneur.",
  hero: {
    eyebrow: "Solopreneur Class",
    headline:
      "Satu aplikasi sederhana, 1 juta lebih download, Potensi cuan miliaran",
    highlightText: "",
    description:
      "Selama dua jam, kamu akan diajak melihat cara seorang solopreneur menemukan peluang dari masalah sehari-hari, mengubahnya menjadi ide aplikasi, lalu mulai membangunnya dengan bantuan AI.",
    supportingText: "",
    imageUrl: "/assets/starhustler-course-creators_4af6efe2.webp",
    supportingImageUrl: "",
    primaryCtaLabel: "Daftar Kelas",
    secondaryCtaLabel: "",
    secondaryCtaUrl: "",
    dateBadge: "AUG 28",
    scheduleText: "Senin, 28 Agustus 2026\n19.00 - 21.00",
    deliveryText:
      "Live via Zoom\nDiberikan setelah peserta masuk ke grup komunitas",
  },
  video: {
    enabled: false,
    url: "",
    title: "Kelas Solopreneur",
    customThumbnailUrl: "",
    aspectRatio: "16:9",
  },
  pricing: {
    originalPrice: 300000,
    sellingPrice: 200000,
    priceLabel: "Harga bundling bulan ini",
    promoLabel: "Hemat Rp100.000",
    bundlingLabel: "Paket bundling kelas online dan ebook Memulai Solopreneur",
    supportingText:
      "Kelas online Rp150.000 + ebook Memulai Solopreneur Rp150.000.",
    paymentUrl: DEFAULT_PAYMENT_URL,
  },
  intro: {
    lead: "Selama dua jam, kamu akan diajak melihat cara seorang solopreneur menemukan peluang dari masalah sehari hari, mengubahnya menjadi ide aplikasi, lalu mulai membangunnya dengan bantuan AI.",
    firstTitle: "Kita tidak akan membahas teori bisnis yang berputar putar.",
    firstBody:
      "Kita akan membedah sebuah studi kasus aplikasi sederhana yang sudah dipakai lebih dari 1 juta orang, kemudian melihat bagaimana produk seperti itu bisa dibuat, dikembangkan, dan diuji peluang bisnisnya.",
    secondTitle: "Cocok Untuk Siapa?",
    secondBody:
      "Kelas ini cocok untuk kamu yang ingin mulai membangun produk sendiri tanpa harus menunggu punya tim, kantor, atau kemampuan coding, benar-benar bisa dimulai dari nol.",
  },
  story: {
    title: "Ternyata, aplikasi sederhana bisa dipakai jutaan orang.",
    paragraphs: [
      "Coba lihat pola ini. Sebuah aplikasi pencatatan keuangan yang tampilannya sederhana bisa mencapai 1 juta lebih download di Play Store. Fungsinya dekat dengan kehidupan sehari hari, masalah yang diselesaikan jelas, dan orang bisa langsung memakainya tanpa perlu belajar lama.",
      "Aplikasi seperti ini mungkin tidak terlihat heboh. Tidak ada efek 3D. Tidak ada fitur yang membuat orang berkata, ‘Wah, secanggih itu?’",
      "Namun justru di situlah peluangnya. Banyak produk digital yang menghasilkan bukan karena rumit, melainkan karena menyelesaikan satu masalah dengan cara yang mudah dipahami.",
      "Angka ini menunjukkan bahwa produk sederhana pun bisa menemukan pasar yang besar ketika masalahnya nyata dan solusinya mudah digunakan.",
    ],
    highlight: "1 juta lebih download",
    imageUrl: "/assets/starhustler-japanese-male-office_b8ef0e79.webp",
  },
  calculation: {
    title: "Berapa potensi penghasilannya?",
    description:
      "Ini adalah simulasi sederhana berdasarkan studi kasus yang kita bahas di kelas. Jika sebuah aplikasi memiliki 1 juta download dan 5 persen penggunanya memilih fitur premium dengan harga 45 ribu rupiah.",
    formula: "1.000.000 download × 5 persen pengguna premium × 45.000 rupiah",
    result: "Rp2.250.000.000",
    resultWords: "Dua koma dua lima miliar rupiah",
    disclaimer:
      "Ini simulasi pendapatan kotor, bukan janji pendapatan secara instan. Hasil nyata bergantung pada kualitas produk, jumlah pengguna aktif, tingkat konversi, biaya platform, pajak, pemasaran, dan banyak faktor lain.",
    closing:
      "Yang ingin kita pelajari bukan cara mengejar angka secara membabi buta. Kita ingin memahami bagaimana produk kecil dapat dibangun, diuji, dan dikembangkan menjadi aset digital.",
  },
  solution: {
    title: "Seriusan ini? Bikinnya susah, ya?",
    paragraphs: [
      "Dulu, bikin aplikasi berarti harus punya skill coding. Sekarang, pintu masuknya sudah berubah.",
      "Kamu tidak harus menjadi programmer senior untuk mulai membuat produk digital. Dengan bantuan Codex dari ChatGPT, kamu bisa menjelaskan ide dengan bahasa sehari hari, meminta bantuan menyusun fitur, mencoba alur aplikasi, dan memperbaiki masalah secara bertahap.",
      "Di kelas ini, Abdul Arfan akan menunjukkan cara berpikirnya saat mengubah ide menjadi produk. Kamu akan melihat prosesnya secara langsung step by step.",
      "AI membantu mengerjakan bagian teknis, tetapi arah produknya tetap datang dari kamu.",
    ],
    imageUrl: "/assets/starhustler-benefits-mentor_fdf27b2f.webp",
  },
  painPoints: [
    item("pain-1", "Belum tahu masalah mana yang layak dijadikan produk"),
    item("pain-2", "Merasa harus bisa coding sebelum mulai"),
    item("pain-3", "Punya ide tetapi belum tahu cara menguji peluangnya"),
  ],
  benefits: [
    item("benefit-1", "Praktik langsung bersama mentor"),
    item("benefit-2", "Akses rekaman kelas"),
    item("benefit-3", "Masuk ke grup komunitas Premium"),
    item("benefit-4", "Bahan untuk memulai proyek pertama"),
    item("benefit-5", "Belajar praktik dari studi kasus nyata"),
    item("benefit-6", "Membuka framework berpikir dalam menangkap peluang"),
  ],
  curriculum: [],
  bonuses: [
    item(
      "bonus-1",
      "Ebook Memulai Solopreneur",
      "Pendamping untuk menemukan arah, membangun kepercayaan, dan memperkenalkan produk."
    ),
  ],
  testimonials: [],
  mentor: {
    name: "Abdul Arfan",
    title: "Information Technology Development Manager",
    headline:
      "Bukan sekadar teori. Mentor kita pernah menjual produk buatannya sendiri",
    description:
      "Abdul Arfan adalah programmer berpengalaman yang sudah bekerja di bidang teknologi selama bertahun-tahun. Ia pernah menjadi Software Engineer di beberapa perusahaan teknologi, termasuk Bank Aladin Syariah.",
    extendedDescription:
      "Ia pernah membangun aplikasi yang diunduh 5 juta orang dengan penghasilan sekitar 700 juta rupiah. Sekarang, ia akan menunjukkan bagaimana AI bisa membantu lebih banyak orang masuk ke dunia pembuatan produk digital.",
    imageUrl: "/assets/starhustler-course-creators_4af6efe2.webp",
    proofLabel: "Pemateri telah membuktikannya!",
  },
  ebook: {
    enabled: true,
    title: "Apa yang ada dalam buku ini?",
    headline:
      "Produk sudah jadi, tapi orang belum tahu siapa yang membuatnya? Di situlah personal branding ikut bermain",
    description:
      "Ebook Memulai Solopreneur membantu kamu memahami langkah awal membangun usaha sendiri, mulai dari menemukan arah, membangun kepercayaan, sampai berani memperkenalkan apa yang kamu kerjakan.",
    supportingText:
      "Kelas membantu kamu melihat cara membuat produk. Ebook membantu kamu membangun kepercayaan dan memperkenalkan produk tersebut kepada orang lain.",
    imageUrl: "/assets/starhustler-solopreneur-starter-kit-mockup_f0ada996.webp",
  },
  faq: [
    {
      id: "faq-1",
      question: "Kelas ini cocok untuk siapa?",
      answer:
        "Kelas ini cocok untuk pegawai, profesional, dan pemula yang ingin mengubah masalah sehari-hari atau pengalaman kerja menjadi ide produk digital.",
      enabled: true,
    },
    {
      id: "faq-2",
      question: "Apakah saya harus bisa coding?",
      answer:
        "Tidak. Materi dirancang agar pemula dapat mulai dengan bantuan AI. Kamu tetap akan belajar menjelaskan kebutuhan produk, mengecek hasil, mencoba alur, dan memperbaiki bagian yang belum berjalan.",
      enabled: true,
    },
    {
      id: "faq-3",
      question: "Bagaimana format kelasnya?",
      answer:
        "Kelas dilaksanakan secara live melalui Zoom. Informasi akses diberikan setelah peserta masuk ke grup komunitas.",
      enabled: true,
    },
    {
      id: "faq-4",
      question: "Apa yang akan saya pelajari?",
      answer:
        "Kamu akan mempelajari cara menemukan peluang, mengubah masalah menjadi ide aplikasi, melihat proses pembangunan produk dengan AI, dan mulai menguji peluang bisnisnya.",
      enabled: true,
    },
    {
      id: "faq-5",
      question: "Apakah cocok untuk pemula?",
      answer:
        "Ya. Pembahasan dimulai dari cara berpikir dan studi kasus nyata sehingga dapat diikuti meskipun kamu belum pernah membuat aplikasi.",
      enabled: true,
    },
    {
      id: "faq-6",
      question: "Bagaimana cara mendaftar kelas?",
      answer:
        "Klik tombol Daftar Kelas pada halaman ini. Kamu akan diarahkan ke halaman pembayaran resmi Kelas Solopreneur.",
      enabled: true,
    },
    {
      id: "faq-7",
      question: "Bagaimana jika saya sudah punya ide bisnis atau produk?",
      answer:
        "Kamu tetap dapat mengikuti kelas untuk mempertajam masalah yang diselesaikan, mengecek arah produk, dan menyusun eksperimen yang lebih terarah.",
      enabled: true,
    },
    {
      id: "faq-8",
      question: "Apakah ada komunitas setelah kelas?",
      answer:
        "Ya. Paket kelas yang ditampilkan saat ini mencakup akses ke grup komunitas Premium sesuai informasi pada halaman kelas.",
      enabled: true,
    },
  ],
  announcement: {
    enabled: true,
    mainText: "Pendaftaran Kelas Dibuka",
    highlightText: "Kelas Solopreneur",
    ctaLabel: "Daftar",
    ctaUrl: "",
    variant: "blue",
  },
  countdown: {
    enabled: false,
    endDateTime: "",
    label: "Pendaftaran ditutup dalam",
    expiredText: "Pendaftaran telah ditutup",
  },
  floatingCta: {
    enabled: true,
    title: "Kelas Solopreneur",
    subtitle: "Paket bundling kelas + ebook",
    originalPrice: 300000,
    currentPrice: 200000,
    ctaLabel: "Daftar Kelas",
    ctaUrl: "",
    icon: "🚀",
  },
  notificationSettings: {
    enabled: true,
    initialDelayMs: 5000,
    intervalMs: 30000,
    items: [
      {
        id: "notif-1",
        icon: "🔥",
        title: "Pendaftaran Kelas Dibuka",
        supportingText: "Daftar untuk batch berikutnya",
        url: "",
        active: true,
        displayDurationMs: 5000,
      },
      {
        id: "notif-2",
        icon: "🎁",
        title: "Paket Bundling Tersedia",
        supportingText: "Lihat detail paket kelas dan ebook",
        url: "#pricing",
        active: true,
        displayDurationMs: 5000,
      },
    ],
  },
  sectionVisibility: {
    hero: true,
    video: true,
    intro: true,
    painPoints: false,
    story: true,
    calculation: true,
    solution: true,
    benefits: true,
    curriculum: true,
    bonuses: true,
    mentor: true,
    testimonials: false,
    pricing: true,
    faq: true,
    finalCta: true,
  },
  sectionOrder: [
    "video",
    "intro",
    "painPoints",
    "story",
    "calculation",
    "solution",
    "benefits",
    "curriculum",
    "bonuses",
    "mentor",
    "testimonials",
    "pricing",
    "faq",
    "finalCta",
  ],
  finalCta: {
    title: "Mulai bangun produk digital pertamamu",
    description:
      "Pelajari framework praktis untuk menemukan peluang, membangun produk, dan mulai mengujinya.",
    ctaLabel: "Daftar Kelas",
  },
  seo: {
    title: "Kelas Solopreneur — Dari Ide Sampai Terjual | StartHustler",
    metaDescription:
      "Kelas praktis StartHustler untuk menemukan peluang, membangun produk digital dengan AI, dan mulai menguji potensi bisnisnya.",
    ogTitle: "Kelas Solopreneur — Dari Ide Sampai Terjual",
    ogDescription:
      "Ubah masalah sehari-hari menjadi produk digital dengan bantuan AI.",
    ogImage: "/assets/starhustler-course-creators_4af6efe2.webp",
    canonicalUrl: "https://www.starthustler.com/kelas/kelas-solopreneur",
  },
};

export const DEFAULT_CLASS_RECORD: Omit<
  ClassRecord,
  "id" | "createdAt" | "updatedAt"
> = {
  name: "Kelas Solopreneur",
  slug: "kelas-solopreneur",
  status: "published",
  featured: true,
  content: DEFAULT_CLASS_CONTENT,
};

export function normalizeClassContent(
  input: Partial<ClassContent> | null | undefined
): ClassContent {
  if (!input) return structuredClone(DEFAULT_CLASS_CONTENT);
  return {
    ...structuredClone(DEFAULT_CLASS_CONTENT),
    ...input,
    hero: { ...DEFAULT_CLASS_CONTENT.hero, ...input.hero },
    video: { ...DEFAULT_CLASS_CONTENT.video, ...input.video },
    pricing: { ...DEFAULT_CLASS_CONTENT.pricing, ...input.pricing },
    intro: { ...DEFAULT_CLASS_CONTENT.intro, ...input.intro },
    story: { ...DEFAULT_CLASS_CONTENT.story, ...input.story },
    calculation: { ...DEFAULT_CLASS_CONTENT.calculation, ...input.calculation },
    solution: { ...DEFAULT_CLASS_CONTENT.solution, ...input.solution },
    mentor: { ...DEFAULT_CLASS_CONTENT.mentor, ...input.mentor },
    ebook: { ...DEFAULT_CLASS_CONTENT.ebook, ...input.ebook },
    announcement: {
      ...DEFAULT_CLASS_CONTENT.announcement,
      ...input.announcement,
    },
    countdown: { ...DEFAULT_CLASS_CONTENT.countdown, ...input.countdown },
    floatingCta: { ...DEFAULT_CLASS_CONTENT.floatingCta, ...input.floatingCta },
    notificationSettings: {
      ...DEFAULT_CLASS_CONTENT.notificationSettings,
      ...input.notificationSettings,
    },
    sectionVisibility: {
      ...DEFAULT_CLASS_CONTENT.sectionVisibility,
      ...input.sectionVisibility,
    },
    finalCta: { ...DEFAULT_CLASS_CONTENT.finalCta, ...input.finalCta },
    seo: { ...DEFAULT_CLASS_CONTENT.seo, ...input.seo },
  };
}

export const formatRupiah = (value: number) =>
  `Rp${Math.max(0, Number(value) || 0).toLocaleString("id-ID")}`;
