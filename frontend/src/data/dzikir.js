// Dzikir pagi dan petang: teks Arab dan arti bahasa Indonesia.
//
// Sumber: Data-Dzikir-Pagi-Petang-Indonesia (sutisnaasep323, GitHub), yang disusun mengikuti buku
// "Doa dan Wirid" karya Ustadz Yazid bin Abdul Qadir Jawas. Latin dan keterangan dalil lengkap ada di
// alquran-indonesia.id (lihat DZIKIR_SUMBER).
//
// Bentuk data yang dipakai DzikirView.vue:
//   { id, judul, jumlah (angka), jumlahLabel?, pembuka?: [Arab], arab: [Arab], arti }
//
// Koreksi saat menyalin: huruf Arab dari skrip lain (ک ھ ی dan bentuk presentasi) diganti huruf baku,
// beberapa salah ketik harakat dan terjemahan dibetulkan, serta bacaan "pagi" dan "petang" dipisah.
// Mohon tinjau kembali dengan rujukan terpercaya sebelum dipublikasikan luas.

export const DZIKIR_SUMBER = {
  nama: "Data-Dzikir-Pagi-Petang-Indonesia (sutisnaasep323)",
  url: "https://github.com/sutisnaasep323/Data-Dzikir-Pagi-Petang-Indonesia",
  rujukan: {
    pagi: "https://alquran-indonesia.id/alquran/dzikir/pagi",
    petang: "https://alquran-indonesia.id/alquran/dzikir/petang",
  },
};

export const DZIKIR = {
  pagi: [
    {
      id: 1,
      judul: "Ayat Kursi",
      jumlah: 1,
      arab: [
        "اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ، لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ، لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ، مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ، يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ، وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلاَّ بِمَا شَاءَ، وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ، وَلَا يَئُودُهُ حِفْظُهُمَا، وَهُوَ الْعَلِيُّ الْعَظِيمُ",
      ],
      pembuka: ["أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ"],
      arti: "Allah, tidak ada ilah (yang berhak disembah) kecuali Dia, Yang Mahahidup lagi terus-menerus mengurusi (makhluk-Nya). Dia tidak mengantuk dan tidak tidur. Kepunyaan-Nya apa yang di langit dan di bumi. Tidak ada yang dapat memberi syafa’at di sisi-Nya tanpa seizin-Nya. Dia mengetahui apa-apa yang di hadapan dan di belakang mereka, dan mereka tidak mengetahui apa-apa dari ilmu Allah melainkan apa yang dikehendaki-Nya. Kursi-Nya meliputi langit dan bumi. Dia tidak merasa berat memelihara keduanya. Dan Dia-lah Yang Mahatinggi lagi Mahabesar. (QS. Al-Baqarah: 255)",
    },
    {
      id: 2,
      judul: "Surat Al-Ikhlas",
      jumlah: 3,
      pembuka: ["بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"],
      arab: [
        "قُلْ هُوَ اللَّهُ أَحَدٌ",
        "اللَّهُ الصَّمَدُ",
        "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
      ],
      arti: "Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah: Dialah Allah, Yang Maha Esa. Allah adalah ilah yang bergantung kepada-Nya segala urusan. Dia tidak beranak dan tiada pula diperanakkan, dan tidak ada seorang pun yang setara dengan Dia. (QS. Al-Ikhlas: 1-4)",
    },
    {
      id: 3,
      judul: "Surat Al-Falaq",
      jumlah: 3,
      pembuka: ["بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"],
      arab: [
        "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
        "مِن شَرِّ مَا خَلَقَ",
        "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
        "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
        "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
      ],
      arti: "Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah: Aku berlindung kepada Rabb yang menguasai Shubuh, dari kejahatan makhluk-Nya, dan dari kejahatan malam apabila telah gelap gulita, dan dari kejahatan-kejahatan wanita tukang sihir yang menghembus pada buhul-buhul, dan dari kejahatan orang yang dengki apabila ia dengki. (QS. Al-Falaq: 1-5)",
    },
    {
      id: 4,
      judul: "Surat An-Naas",
      jumlah: 3,
      pembuka: ["بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"],
      arab: [
        "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        "مَلِكِ النَّاسِ",
        "إِلَهِ النَّاسِ",
        "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
        "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
        "مِنَ الْجِنَّةِ وَالنَّاسِ",
      ],
      arti: "Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah: Aku berlindung kepada Rabb manusia. Raja manusia. Sembahan manusia, dari kejahatan (bisikan) setan yang biasa bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari jin dan manusia. (QS. An-Naas: 1-6)",
    },
    {
      id: 5,
      judul: "Doa Perlindungan dan Kebaikan",
      jumlah: 1,
      arab: [
        "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ.",
        "رَبِّ أَسْأَلُكَ خَيْرَ مَا فِيْ هٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِيْ هٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوْذُ بِكَ مِنَ الْكَسَلِ وَسُوْءِ الْكِبَرِ، رَبِّ أَعُوْذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
      ],
      arti: "Kami telah memasuki waktu pagi dan kerajaan hanya milik Allah, segala puji bagi Allah. Tidak ada ilah (yang berhak disembah) kecuali Allah semata, tiada sekutu bagi-Nya. Hanya milik-Nya kerajaan dan segala puji hanya bagi-Nya. Dia-lah Yang Mahakuasa atas segala sesuatu. Wahai Rabbku, aku mohon kepada-Mu kebaikan di hari ini dan kebaikan sesudahnya. Aku berlindung kepada-Mu dari kejahatan hari ini dan kejahatan sesudahnya. Wahai Rabbku, aku berlindung kepada-Mu dari kemalasan dan kejelekan di hari tua. Wahai Rabbku, aku berlindung kepada-Mu dari siksaan di neraka dan siksaan di alam kubur.",
    },
    {
      id: 6,
      judul: "Doa Berserah Diri",
      jumlah: 1,
      arab: [
        "اَللّٰهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوْتُ، وَإِلَيْكَ النُّشُوْرُ",
      ],
      arti: "Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu sore. Dengan rahmat dan pertolongan-Mu kami hidup, dan dengan kehendak-Mu kami mati. Dan kepada-Mu (kami semua) akan dibangkitkan.",
    },
    {
      id: 7,
      judul: "Sayyidul Istighfar",
      jumlah: 1,
      arab: [
        "اَللّٰهُمَّ أَنْتَ رَبِّيْ لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوْءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوْءُ بِذَنْبِيْ، فَاغْفِرْ لِيْ، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوْبَ إِلَّا أَنْتَ",
      ],
      arti: "Ya Allah, Engkau adalah Rabbku, tidak ada ilah yang berhak disembah kecuali Engkau, Engkaulah yang menciptakanku. Aku adalah hamba-Mu. Aku akan setia pada perjanjianku pada-Mu (yaitu aku akan mentauhidkan-Mu) semampuku dan aku yakin akan janji-Mu (berupa surga untukku). Aku berlindung kepada-Mu dari kejelekan yang kuperbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku. Oleh karena itu, ampunilah aku. Sesungguhnya tiada yang mengampuni dosa kecuali Engkau.",
    },
    {
      id: 8,
      judul: "Doa Persaksian",
      jumlah: 4,
      arab: [
        "اَللّٰهُمَّ إِنِّيْ أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيْعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللّٰهُ لَا إِلٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيْكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُوْلُكَ",
      ],
      arti: "Ya Allah, sesungguhnya aku di waktu pagi ini mempersaksikan Engkau, malaikat yang memikul ‘Arsy-Mu, malaikat-malaikat dan seluruh makhluk-Mu, bahwa sesungguhnya Engkau adalah Allah, tiada ilah yang berhak disembah kecuali Engkau semata, tiada sekutu bagi-Mu dan sesungguhnya Muhammad adalah hamba dan utusan-Mu.",
    },
    {
      id: 9,
      judul: "Doa Bersyukur",
      jumlah: 1,
      arab: [
        "اَللّٰهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ، فَمِنْكَ وَحْدَكَ، لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ، وَلَكَ الشُّكْرُ",
      ],
      arti: "Ya Allah, nikmat apa pun yang ada padaku di waktu pagi atau yang ada pada setiap makhluk-Mu, semuanya hanya dari-Mu semata, tiada sekutu bagi-Mu, bagi-Mu segala puji dan bagi-Mu segala syukur.",
    },
    {
      id: 10,
      judul: "Doa Keselamatan Badan",
      jumlah: 3,
      arab: [
        "اَللّٰهُمَّ عَافِنِى فِى بَدَنِى، اَللّٰهُمَّ عَافِنِى فِى سَمْعِى، اَللّٰهُمَّ عَافِنِى فِى بَصَرِى، لَا إِلٰهَ إِلَّا أَنْتَ، اَللّٰهُمَّ إِنِّيْ أَعُوْذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوْذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلٰهَ إِلَّا أَنْتَ",
      ],
      arti: "Ya Allah, selamatkan tubuhku (dari penyakit dan yang tidak aku inginkan). Ya Allah, selamatkan pendengaranku (dari penyakit dan maksiat atau sesuatu yang tidak aku inginkan), Ya Allah selamatkan penglihatanku. Tiada ilah yang berhak diibadahi kecuali Engkau. Ya Allah, sesungguhnya aku berlindung kepada-Mu dari kekufuran dan kefakiran, aku berlindung kepada-Mu dari siksa kubur. Tidak ada ilah yang berhak diibadahi kecuali Engkau.",
    },
    {
      id: 11,
      judul: "Doa Kecukupan (Hasbiyallah)",
      jumlah: 7,
      arab: [
        "حَسْبِيَ اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
      ],
      arti: "Cukuplah Allah (sebagai penolong) bagiku, tiada tuhan yang berhak disembah kecuali Dia. Hanya kepada-Nya aku bertawakal, dan Dialah Rabb yang memiliki ‘Arasy yang besar.",
    },
    {
      id: 12,
      judul: "Doa Keselamatan Dunia dan Akhirat",
      jumlah: 1,
      arab: [
        "اَللّٰهُمَّ إِنِّيْ أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَاْلآخِرَةِ، اَللّٰهُمَّ إِنِّيْ أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِيْنِيْ وَدُنْيَايَ وَأَهْلِيْ وَمَالِيْ، اَللّٰهُمَّ اسْتُرْ عَوْرَاتِى وَآمِنْ رَوْعَاتِى.",
        "اَللّٰهُمَّ احْفَظْنِيْ مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِيْ، وَعَنْ يَمِيْنِيْ، وَعَنْ شِمَالِيْ، وَمِنْ فَوْقِيْ، وَأَعُوْذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِيْ",
      ],
      arti: "Ya Allah, sesungguhnya aku memohon kebajikan dan keselamatan di dunia dan akhirat. Ya Allah, sesungguhnya aku memohon kebajikan dan keselamatan dalam agama, dunia, keluarga dan hartaku. Ya Allah, tutupilah auratku (aib dan sesuatu yang tidak layak dilihat orang) dan tenteramkanlah aku dari rasa takut. Ya Allah, peliharalah aku dari depan, belakang, kanan, kiri dan atasku. Aku berlindung dengan kebesaran-Mu, agar aku tidak disambar marabahaya dari bawah.",
    },
    {
      id: 13,
      judul: "Doa Perlindungan dari Kejahatan Diri dan Setan",
      jumlah: 1,
      arab: [
        "اَللّٰهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَاْلأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيْكَهُ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا أَنْتَ، أَعُوْذُ بِكَ مِنْ شَرِّ نَفْسِيْ، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِيْ سُوْءًا أَوْ أَجُرُّهُ إِلَى مُسْلِمٍ",
      ],
      arti: "Ya Allah, Yang Maha Mengetahui yang ghaib dan yang nyata, Rabb pencipta langit dan bumi, Rabb segala sesuatu dan yang merajainya. Aku bersaksi bahwa tidak ada ilah yang berhak disembah kecuali Engkau. Aku berlindung kepada-Mu dari kejahatan diriku, setan dan balatentaranya (godaan untuk berbuat syirik pada Allah), dan aku (berlindung kepada-Mu) dari berbuat kejelekan terhadap diriku sendiri atau menularkannya kepada seorang muslim.",
    },
    {
      id: 14,
      judul: "Doa Terhindar dari Marabahaya",
      jumlah: 3,
      arab: [
        "بِسْمِ اللّٰهِ الَّذِى لَا يَضُرُّ مَعَ اسْمِهِ شَىْءٌ فِى الأَرْضِ وَلَا فِى السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ",
      ],
      arti: "Dengan nama Allah yang dengan nama-Nya tidak ada sesuatu pun yang memudaratkan di bumi maupun di langit, dan Dia-lah Yang Maha Mendengar lagi Maha Mengetahui.",
    },
    {
      id: 15,
      judul: "Doa Keridhaan",
      jumlah: 3,
      arab: [
        "رَضِيْتُ بِاللّٰهِ رَبًّا، وَبِاْلإِسْلَامِ دِيْنًا، وَبِمُحَمَّدٍ صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
      ],
      arti: "Aku ridha Allah sebagai Rabb, Islam sebagai agama dan Muhammad shallallahu ‘alaihi wa sallam sebagai nabi.",
    },
    {
      id: 16,
      judul: "Doa Memohon Pertolongan",
      jumlah: 1,
      arab: [
        "يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ، وَأَصْلِحْ لِيْ شَأْنِيْ كُلَّهُ، وَلَا تَكِلْنِيْ إِلَى نَفْسِيْ طَرْفَةَ عَيْنٍ",
      ],
      arti: "Wahai Rabb Yang Maha Hidup, wahai Rabb Yang Berdiri Sendiri (tidak butuh segala sesuatu), dengan rahmat-Mu aku minta pertolongan, perbaikilah segala urusanku dan jangan diserahkan kepadaku sekali pun sekejap mata (tanpa mendapat pertolongan dari-Mu).",
    },
    {
      id: 17,
      judul: "Doa Memohon Kebaikan Hari Ini",
      jumlah: 1,
      arab: [
        "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ، اَللّٰهُمَّ إِنِّيْ أَسْأَلُكَ خَيْرَ هٰذَا الْيَوْمِ: فَتْحَهُ، وَنَصْرَهُ، وَنُوْرَهُ، وَبَرَكَتَهُ، وَهُدَاهُ، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِيْهِ وَشَرِّ مَا بَعْدَهُ",
      ],
      arti: "Kami memasuki waktu pagi, dan kerajaan hanya milik Allah, Rabb semesta alam. Ya Allah, sesungguhnya aku memohon kepada-Mu kebaikan hari ini: keberhasilan mencapai tujuan, kemenangan (menghadapi musuh), cahaya (ilmu dan taufik), keberkahan dan petunjuk yang ada padanya. Dan aku berlindung kepada-Mu dari keburukan apa yang ada di dalamnya dan keburukan sesudahnya.",
    },
    {
      id: 18,
      judul: "Doa Fitrah",
      jumlah: 1,
      arab: [
        "أَصْبَحْنَا عَلَى فِطْرَةِ اْلإِسْلَامِ وَعَلَى كَلِمَةِ اْلإِخْلَاصِ، وَعَلَى دِيْنِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِيْنَا إِبْرَاهِيْمَ، حَنِيْفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِيْنَ",
      ],
      arti: "Di waktu pagi kami berpegang teguh pada fitrah (agama) Islam, juga kepada kalimat ikhlas (tauhid), juga kepada agama Nabi kami Muhammad shallallahu ‘alaihi wa sallam, dan agama bapak kami Ibrahim, yang berdiri di atas jalan yang lurus, muslim dan tidak tergolong orang-orang musyrik.",
    },
    {
      id: 19,
      judul: "Tasbih dan Tahmid",
      jumlah: 100,
      arab: ["سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ"],
      arti: "Maha suci Allah, aku memuji-Nya.",
    },
    {
      id: 20,
      judul: "Tahlil (Bertauhid)",
      jumlah: 100,
      jumlahLabel: "100x, atau 10x, atau minimal 1x jika berat",
      arab: [
        "لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ",
      ],
      arti: "Tidak ada ilah yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya. Hanya milik-Nya kerajaan dan segala puji hanya bagi-Nya. Dia-lah yang berkuasa atas segala sesuatu.",
    },
    {
      id: 21,
      judul: "Dzikir Pemberat Timbangan",
      jumlah: 3,
      arab: [
        "سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
      ],
      arti: "Maha Suci Allah, aku memuji-Nya sebanyak makhluk-Nya, sebagaimana diridhai-Nya, seberat timbangan ‘Arsy-Nya dan sebanyak kalimat-kalimat-Nya.",
    },
    {
      id: 22,
      judul: "Doa Memohon Ilmu, Rezeki, dan Amal",
      jumlah: 1,
      arab: [
        "اَللَّهُمَّ إِنِّيْ أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
      ],
      arti: "Ya Allah, sungguh aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.",
    },
    {
      id: 23,
      judul: "Istighfar",
      jumlah: 100,
      arab: ["أَسْتَغْفِرُ اللّٰهَ وَأَتُوْبُ إِلَيْهِ"],
      arti: "Aku memohon ampun kepada Allah dan bertobat kepada-Nya.",
    },
    {
      id: 24,
      judul: "Shalawat atas Nabi",
      jumlah: 10,
      arab: ["اَللّٰهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ"],
      arti: "Ya Allah, limpahkanlah shalawat dan salam kepada Nabi kami, Muhammad shallallahu ‘alaihi wa sallam.",
    },
  ],
  petang: [
    {
      id: 1,
      judul: "Ayat Kursi",
      jumlah: 1,
      arab: [
        "اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ، لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ، لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ، مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ، يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ، وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلاَّ بِمَا شَاءَ، وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ، وَلَا يَئُودُهُ حِفْظُهُمَا، وَهُوَ الْعَلِيُّ الْعَظِيمُ",
      ],
      pembuka: ["أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ"],
      arti: "Allah, tidak ada ilah (yang berhak disembah) kecuali Dia, Yang Mahahidup lagi terus-menerus mengurusi (makhluk-Nya). Dia tidak mengantuk dan tidak tidur. Kepunyaan-Nya apa yang di langit dan di bumi. Tidak ada yang dapat memberi syafa’at di sisi-Nya tanpa seizin-Nya. Dia mengetahui apa-apa yang di hadapan dan di belakang mereka, dan mereka tidak mengetahui apa-apa dari ilmu Allah melainkan apa yang dikehendaki-Nya. Kursi-Nya meliputi langit dan bumi. Dia tidak merasa berat memelihara keduanya. Dan Dia-lah Yang Mahatinggi lagi Mahabesar. (QS. Al-Baqarah: 255)",
    },
    {
      id: 2,
      judul: "Surat Al-Ikhlas",
      jumlah: 3,
      pembuka: ["بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"],
      arab: [
        "قُلْ هُوَ اللَّهُ أَحَدٌ",
        "اللَّهُ الصَّمَدُ",
        "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
      ],
      arti: "Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah: Dialah Allah, Yang Maha Esa. Allah adalah ilah yang bergantung kepada-Nya segala urusan. Dia tidak beranak dan tiada pula diperanakkan, dan tidak ada seorang pun yang setara dengan Dia. (QS. Al-Ikhlas: 1-4)",
    },
    {
      id: 3,
      judul: "Surat Al-Falaq",
      jumlah: 3,
      pembuka: ["بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"],
      arab: [
        "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
        "مِن شَرِّ مَا خَلَقَ",
        "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
        "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
        "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
      ],
      arti: "Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah: Aku berlindung kepada Rabb yang menguasai Shubuh, dari kejahatan makhluk-Nya, dan dari kejahatan malam apabila telah gelap gulita, dan dari kejahatan-kejahatan wanita tukang sihir yang menghembus pada buhul-buhul, dan dari kejahatan orang yang dengki apabila ia dengki. (QS. Al-Falaq: 1-5)",
    },
    {
      id: 4,
      judul: "Surat An-Naas",
      jumlah: 3,
      pembuka: ["بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"],
      arab: [
        "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        "مَلِكِ النَّاسِ",
        "إِلَهِ النَّاسِ",
        "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
        "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
        "مِنَ الْجِنَّةِ وَالنَّاسِ",
      ],
      arti: "Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah: Aku berlindung kepada Rabb manusia. Raja manusia. Sembahan manusia, dari kejahatan (bisikan) setan yang biasa bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari jin dan manusia. (QS. An-Naas: 1-6)",
    },
    {
      id: 5,
      judul: "Doa Perlindungan dan Kebaikan",
      jumlah: 1,
      arab: [
        "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ.",
        "رَبِّ أَسْأَلُكَ خَيْرَ مَا فِيْ هٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِيْ هٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوْذُ بِكَ مِنَ الْكَسَلِ وَسُوْءِ الْكِبَرِ، رَبِّ أَعُوْذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
      ],
      arti: "Kami telah memasuki waktu sore dan kerajaan hanya milik Allah, segala puji bagi Allah. Tidak ada ilah (yang berhak disembah) kecuali Allah semata, tiada sekutu bagi-Nya. Hanya milik-Nya kerajaan dan segala puji hanya bagi-Nya. Dia-lah Yang Mahakuasa atas segala sesuatu. Wahai Rabbku, aku mohon kepada-Mu kebaikan di malam ini dan kebaikan sesudahnya. Aku berlindung kepada-Mu dari kejahatan malam ini dan kejahatan sesudahnya. Wahai Rabbku, aku berlindung kepada-Mu dari kemalasan dan kejelekan di hari tua. Wahai Rabbku, aku berlindung kepada-Mu dari siksaan di neraka dan siksaan di alam kubur.",
    },
    {
      id: 6,
      judul: "Doa Berserah Diri",
      jumlah: 1,
      arab: [
        "اَللّٰهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوْتُ، وَإِلَيْكَ الْمَصِيْرُ",
      ],
      arti: "Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu sore, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi. Dengan rahmat dan pertolongan-Mu kami hidup, dan dengan kehendak-Mu kami mati. Dan kepada-Mu (kami semua) akan dikembalikan.",
    },
    {
      id: 7,
      judul: "Sayyidul Istighfar",
      jumlah: 1,
      arab: [
        "اَللّٰهُمَّ أَنْتَ رَبِّيْ لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوْءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوْءُ بِذَنْبِيْ، فَاغْفِرْ لِيْ، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوْبَ إِلَّا أَنْتَ",
      ],
      arti: "Ya Allah, Engkau adalah Rabbku, tidak ada ilah yang berhak disembah kecuali Engkau, Engkaulah yang menciptakanku. Aku adalah hamba-Mu. Aku akan setia pada perjanjianku pada-Mu (yaitu aku akan mentauhidkan-Mu) semampuku dan aku yakin akan janji-Mu (berupa surga untukku). Aku berlindung kepada-Mu dari kejelekan yang kuperbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku. Oleh karena itu, ampunilah aku. Sesungguhnya tiada yang mengampuni dosa kecuali Engkau.",
    },
    {
      id: 8,
      judul: "Doa Persaksian",
      jumlah: 4,
      arab: [
        "اَللّٰهُمَّ إِنِّيْ أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيْعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللّٰهُ لَا إِلٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيْكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُوْلُكَ",
      ],
      arti: "Ya Allah, sesungguhnya aku di waktu sore ini mempersaksikan Engkau, malaikat yang memikul ‘Arsy-Mu, malaikat-malaikat dan seluruh makhluk-Mu, bahwa sesungguhnya Engkau adalah Allah, tiada ilah yang berhak disembah kecuali Engkau semata, tiada sekutu bagi-Mu dan sesungguhnya Muhammad adalah hamba dan utusan-Mu.",
    },
    {
      id: 9,
      judul: "Doa Bersyukur",
      jumlah: 1,
      arab: [
        "اَللّٰهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ، فَمِنْكَ وَحْدَكَ، لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ، وَلَكَ الشُّكْرُ",
      ],
      arti: "Ya Allah, nikmat apa pun yang ada padaku di waktu sore atau yang ada pada setiap makhluk-Mu, semuanya hanya dari-Mu semata, tiada sekutu bagi-Mu, bagi-Mu segala puji dan bagi-Mu segala syukur.",
    },
    {
      id: 10,
      judul: "Doa Keselamatan Badan",
      jumlah: 3,
      arab: [
        "اَللّٰهُمَّ عَافِنِى فِى بَدَنِى، اَللّٰهُمَّ عَافِنِى فِى سَمْعِى، اَللّٰهُمَّ عَافِنِى فِى بَصَرِى، لَا إِلٰهَ إِلَّا أَنْتَ، اَللّٰهُمَّ إِنِّيْ أَعُوْذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوْذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلٰهَ إِلَّا أَنْتَ",
      ],
      arti: "Ya Allah, selamatkan tubuhku (dari penyakit dan yang tidak aku inginkan). Ya Allah, selamatkan pendengaranku (dari penyakit dan maksiat atau sesuatu yang tidak aku inginkan), Ya Allah selamatkan penglihatanku. Tiada ilah yang berhak diibadahi kecuali Engkau. Ya Allah, sesungguhnya aku berlindung kepada-Mu dari kekufuran dan kefakiran, aku berlindung kepada-Mu dari siksa kubur. Tidak ada ilah yang berhak diibadahi kecuali Engkau.",
    },
    {
      id: 11,
      judul: "Doa Kecukupan (Hasbiyallah)",
      jumlah: 7,
      arab: [
        "حَسْبِيَ اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
      ],
      arti: "Cukuplah Allah (sebagai penolong) bagiku, tiada tuhan yang berhak disembah kecuali Dia. Hanya kepada-Nya aku bertawakal, dan Dialah Rabb yang memiliki ‘Arasy yang besar.",
    },
    {
      id: 12,
      judul: "Doa Keselamatan Dunia dan Akhirat",
      jumlah: 1,
      arab: [
        "اَللّٰهُمَّ إِنِّيْ أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَاْلآخِرَةِ، اَللّٰهُمَّ إِنِّيْ أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِيْنِيْ وَدُنْيَايَ وَأَهْلِيْ وَمَالِيْ، اَللّٰهُمَّ اسْتُرْ عَوْرَاتِى وَآمِنْ رَوْعَاتِى.",
        "اَللّٰهُمَّ احْفَظْنِيْ مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِيْ، وَعَنْ يَمِيْنِيْ، وَعَنْ شِمَالِيْ، وَمِنْ فَوْقِيْ، وَأَعُوْذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِيْ",
      ],
      arti: "Ya Allah, sesungguhnya aku memohon kebajikan dan keselamatan di dunia dan akhirat. Ya Allah, sesungguhnya aku memohon kebajikan dan keselamatan dalam agama, dunia, keluarga dan hartaku. Ya Allah, tutupilah auratku (aib dan sesuatu yang tidak layak dilihat orang) dan tenteramkanlah aku dari rasa takut. Ya Allah, peliharalah aku dari depan, belakang, kanan, kiri dan atasku. Aku berlindung dengan kebesaran-Mu, agar aku tidak disambar marabahaya dari bawah.",
    },
    {
      id: 13,
      judul: "Doa Perlindungan dari Kejahatan Diri dan Setan",
      jumlah: 1,
      arab: [
        "اَللّٰهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَاْلأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيْكَهُ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا أَنْتَ، أَعُوْذُ بِكَ مِنْ شَرِّ نَفْسِيْ، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِيْ سُوْءًا أَوْ أَجُرُّهُ إِلَى مُسْلِمٍ",
      ],
      arti: "Ya Allah, Yang Maha Mengetahui yang ghaib dan yang nyata, Rabb pencipta langit dan bumi, Rabb segala sesuatu dan yang merajainya. Aku bersaksi bahwa tidak ada ilah yang berhak disembah kecuali Engkau. Aku berlindung kepada-Mu dari kejahatan diriku, setan dan balatentaranya (godaan untuk berbuat syirik pada Allah), dan aku (berlindung kepada-Mu) dari berbuat kejelekan terhadap diriku sendiri atau menularkannya kepada seorang muslim.",
    },
    {
      id: 14,
      judul: "Doa Terhindar dari Marabahaya",
      jumlah: 3,
      arab: [
        "بِسْمِ اللّٰهِ الَّذِى لَا يَضُرُّ مَعَ اسْمِهِ شَىْءٌ فِى الأَرْضِ وَلَا فِى السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ",
      ],
      arti: "Dengan nama Allah yang dengan nama-Nya tidak ada sesuatu pun yang memudaratkan di bumi maupun di langit, dan Dia-lah Yang Maha Mendengar lagi Maha Mengetahui.",
    },
    {
      id: 15,
      judul: "Doa Keridhaan",
      jumlah: 3,
      arab: [
        "رَضِيْتُ بِاللّٰهِ رَبًّا، وَبِاْلإِسْلَامِ دِيْنًا، وَبِمُحَمَّدٍ صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
      ],
      arti: "Aku ridha Allah sebagai Rabb, Islam sebagai agama dan Muhammad shallallahu ‘alaihi wa sallam sebagai nabi.",
    },
    {
      id: 16,
      judul: "Doa Memohon Pertolongan",
      jumlah: 1,
      arab: [
        "يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ، وَأَصْلِحْ لِيْ شَأْنِيْ كُلَّهُ، وَلَا تَكِلْنِيْ إِلَى نَفْسِيْ طَرْفَةَ عَيْنٍ",
      ],
      arti: "Wahai Rabb Yang Maha Hidup, wahai Rabb Yang Berdiri Sendiri (tidak butuh segala sesuatu), dengan rahmat-Mu aku minta pertolongan, perbaikilah segala urusanku dan jangan diserahkan kepadaku sekali pun sekejap mata (tanpa mendapat pertolongan dari-Mu).",
    },
    {
      id: 17,
      judul: "Doa Memohon Kebaikan Malam Ini",
      jumlah: 1,
      arab: [
        "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ، اَللّٰهُمَّ إِنِّيْ أَسْأَلُكَ خَيْرَ هٰذِهِ اللَّيْلَةِ: فَتْحَهَا، وَنَصْرَهَا، وَنُوْرَهَا، وَبَرَكَتَهَا، وَهُدَاهَا، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِيْهَا وَشَرِّ مَا بَعْدَهَا",
      ],
      arti: "Kami memasuki waktu sore, dan kerajaan hanya milik Allah, Rabb semesta alam. Ya Allah, sesungguhnya aku memohon kepada-Mu kebaikan malam ini: keberhasilan mencapai tujuan, kemenangan (menghadapi musuh), cahaya (ilmu dan taufik), keberkahan dan petunjuk yang ada padanya. Dan aku berlindung kepada-Mu dari keburukan apa yang ada di dalamnya dan keburukan sesudahnya.",
    },
    {
      id: 18,
      judul: "Doa Fitrah",
      jumlah: 1,
      arab: [
        "أَمْسَيْنَا عَلَى فِطْرَةِ اْلإِسْلَامِ وَعَلَى كَلِمَةِ اْلإِخْلَاصِ، وَعَلَى دِيْنِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِيْنَا إِبْرَاهِيْمَ، حَنِيْفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِيْنَ",
      ],
      arti: "Di waktu sore kami berpegang teguh pada fitrah (agama) Islam, juga kepada kalimat ikhlas (tauhid), juga kepada agama Nabi kami Muhammad shallallahu ‘alaihi wa sallam, dan agama bapak kami Ibrahim, yang berdiri di atas jalan yang lurus, muslim dan tidak tergolong orang-orang musyrik.",
    },
    {
      id: 19,
      judul: "Tasbih dan Tahmid",
      jumlah: 100,
      arab: ["سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ"],
      arti: "Maha suci Allah, aku memuji-Nya.",
    },
    {
      id: 20,
      judul: "Tahlil (Bertauhid)",
      jumlah: 100,
      jumlahLabel: "100x, atau 10x, atau minimal 1x jika berat",
      arab: [
        "لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ",
      ],
      arti: "Tidak ada ilah yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya. Hanya milik-Nya kerajaan dan segala puji hanya bagi-Nya. Dia-lah yang berkuasa atas segala sesuatu.",
    },
    {
      id: 21,
      judul: "Doa Perlindungan dengan Kalimat Allah",
      jumlah: 3,
      arab: ["أَعُوْذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ"],
      arti: "Aku berlindung dengan kalimat-kalimat Allah yang sempurna, dari kejahatan sesuatu yang diciptakan-Nya.",
    },
    {
      id: 22,
      judul: "Shalawat atas Nabi",
      jumlah: 10,
      arab: ["اَللّٰهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ"],
      arti: "Ya Allah, limpahkanlah shalawat dan salam kepada Nabi kami, Muhammad shallallahu ‘alaihi wa sallam.",
    },
  ],
};
