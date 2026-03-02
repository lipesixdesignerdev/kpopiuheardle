const musicasIU = [
    // ERA: THE WINNING (2024)
    { title: "Love wins all", file: "songs/Love wins all (Love wins all).mp3", album: "The Winning", cover: "https://upload.wikimedia.org/wikipedia/en/3/3e/IU_-_The_Winning.png" },
    { title: "Shopper", file: "songs/Shopper (Shopper).mp3", album: "The Winning", cover: "https://upload.wikimedia.org/wikipedia/en/3/3e/IU_-_The_Winning.png" },
    { title: "Holssi", file: "songs/Holssi (홀씨).mp3", album: "The Winning", cover: "https://upload.wikimedia.org/wikipedia/en/3/3e/IU_-_The_Winning.png" },
    { title: "Shh..", file: "songs/Shh.. (Feat. HYEIN, WONSUN JOE & Special Narr. Patti Kim) (Shh.. (Feat. 혜인(HYEIN), 조원선....mp3", album: "The Winning", cover: "https://upload.wikimedia.org/wikipedia/en/3/3e/IU_-_The_Winning.png" },
    { title: "I stan U", file: "songs/I stan U (관객이 될게 (I stan U)).mp3", album: "The Winning", cover: "https://upload.wikimedia.org/wikipedia/en/3/3e/IU_-_The_Winning.png" },

    // ERA: PIECES (2021)
    { title: "Winter Sleep", file: "songs/Winter Sleep (겨울잠).mp3", album: "Pieces", cover: "https://upload.wikimedia.org/wikipedia/en/d/d4/IU_-_Pieces.jpg" },
    { title: "Drama", file: "songs/Drama (드라마).mp3", album: "Pieces", cover: "https://upload.wikimedia.org/wikipedia/en/d/d4/IU_-_Pieces.jpg" },
    { title: "Next Stop", file: "songs/Next Stop (정거장).mp3", album: "Pieces", cover: "https://upload.wikimedia.org/wikipedia/en/d/d4/IU_-_Pieces.jpg" },
    { title: "Love Letter", file: "songs/Love Letter (러브레터).mp3", album: "Pieces", cover: "https://upload.wikimedia.org/wikipedia/en/d/d4/IU_-_Pieces.jpg" },

    // ERA: LILAC (2021)
    { title: "LILAC", file: "songs/LILAC (라일락).mp3", album: "LILAC", cover: "https://upload.wikimedia.org/wikipedia/en/b/b6/IU_-_Lilac.png" },
    { title: "Celebrity", file: "songs/Celebrity (Celebrity).mp3", album: "LILAC", cover: "https://upload.wikimedia.org/wikipedia/en/b/b6/IU_-_Lilac.png" },
    { title: "Coin", file: "songs/Coin (Coin).mp3", album: "LILAC", cover: "https://upload.wikimedia.org/wikipedia/en/b/b6/IU_-_Lilac.png" },
    { title: "Ah puh", file: "songs/Ah puh (어푸 (Ah puh)).mp3", album: "LILAC", cover: "https://upload.wikimedia.org/wikipedia/en/b/b6/IU_-_Lilac.png" },
    { title: "Flu", file: "songs/Flu (Flu).mp3", album: "LILAC", cover: "https://upload.wikimedia.org/wikipedia/en/b/b6/IU_-_Lilac.png" },
    { title: "My sea", file: "songs/My sea (아이와 나의 바다).mp3", album: "LILAC", cover: "https://upload.wikimedia.org/wikipedia/en/b/b6/IU_-_Lilac.png" },
    { title: "Troll", file: "songs/Troll (Feat. DEAN) (돌림노래 (Feat. DEAN)).mp3", album: "LILAC", cover: "https://upload.wikimedia.org/wikipedia/en/b/b6/IU_-_Lilac.png" },
    { title: "Epilogue", file: "songs/Epilogue (에필로그).mp3", album: "LILAC", cover: "https://upload.wikimedia.org/wikipedia/en/b/b6/IU_-_Lilac.png" },

    // ERA: LOVE POEM / EIGHT (2019-2020)
    { title: "Blueming", file: "songs/Blueming (Blueming).mp3", album: "Love poem", cover: "https://upload.wikimedia.org/wikipedia/en/e/e3/IU_-_Love_Poem.jpg" },
    { title: "Love poem", file: "songs/Love poem (Love poem).mp3", album: "Love poem", cover: "https://upload.wikimedia.org/wikipedia/en/e/e3/IU_-_Love_Poem.jpg" },
    { title: "unlucky", file: "songs/unlucky (unlucky).mp3", album: "Love poem", cover: "https://upload.wikimedia.org/wikipedia/en/e/e3/IU_-_Love_Poem.jpg" },
    { title: "above the time", file: "songs/above the time (시간의 바깥).mp3", album: "Love poem", cover: "https://upload.wikimedia.org/wikipedia/en/e/e3/IU_-_Love_Poem.jpg" },
    { title: "eight", file: "songs/eight(Prod.&Feat. SUGA of BTS).mp3", album: "eight (Single)", cover: "https://upload.wikimedia.org/wikipedia/en/c/c9/IU_Eight_single_cover.jpg" },
    { title: "strawberry moon", file: "songs/strawberry moon (strawberry moon).mp3", album: "strawberry moon", cover: "https://upload.wikimedia.org/wikipedia/en/b/ba/IU_-_Strawberry_Moon.png" },

    // ERA: PALETTE (2017)
    { title: "Palette", file: "songs/Palette (feat. G-DRAGON) (팔레트 (feat. G-DRAGON)).mp3", album: "Palette", cover: "https://upload.wikimedia.org/wikipedia/pt/b/b8/IU_-_Palette_capa.jpg" },
    { title: "Through the Night", file: "songs/Through the Night (밤편지).mp3", album: "Palette", cover: "https://upload.wikimedia.org/wikipedia/pt/b/b8/IU_-_Palette_capa.jpg" },
    { title: "Ending Scene", file: "songs/Ending Scene (이런 엔딩).mp3", album: "Palette", cover: "https://upload.wikimedia.org/wikipedia/pt/b/b8/IU_-_Palette_capa.jpg" },
    { title: "Dear Name", file: "songs/Dear Name (이름에게).mp3", album: "Palette", cover: "https://upload.wikimedia.org/wikipedia/pt/b/b8/IU_-_Palette_capa.jpg" },
    { title: "dlwlrma", file: "songs/dlwlrma (이 지금).mp3", album: "Palette", cover: "https://upload.wikimedia.org/wikipedia/pt/b/b8/IU_-_Palette_capa.jpg" },

    // ERA: CHAT-SHIRE (2015)
    { title: "Twenty-three", file: "songs/Twenty-three (스물셋).mp3", album: "CHAT-SHIRE", cover: "https://upload.wikimedia.org/wikipedia/en/d/db/IU_-_Chat-Shire.jpg" },
    { title: "Shoes", file: "songs/Shoes (새 신발).mp3", album: "CHAT-SHIRE", cover: "https://upload.wikimedia.org/wikipedia/en/d/db/IU_-_Chat-Shire.jpg" },
    { title: "Knees", file: "songs/Knees (무릎).mp3", album: "CHAT-SHIRE", cover: "https://upload.wikimedia.org/wikipedia/en/d/db/IU_-_Chat-Shire.jpg" },
    { title: "Zezé", file: "songs/Zezé (ZEZE).mp3", album: "CHAT-SHIRE", cover: "https://upload.wikimedia.org/wikipedia/en/d/db/IU_-_Chat-Shire.jpg" },

    // ERA: MODERN TIMES (2013)
    { title: "The Red Shoes", file: "songs/The Red Shoes (분홍신).mp3", album: "Modern Times", cover: "https://upload.wikimedia.org/wikipedia/en/9/91/IU_-_Modern_Times.jpg" },
    { title: "Friday", file: "songs/Friday (feat.Jang Yi-jeong) (금요일에 만나요 (feat.장이정 of HISTORY)).mp3", album: "Modern Times - Epilogue", cover: "https://upload.wikimedia.org/wikipedia/en/4/42/IU_-_Modern_Times_Epilogue.jpg" },
    { title: "A Gloomy Clock", file: "songs/A Gloomy Clock (feat. Jong-hyun)(feat.of SHINee)).mp3", album: "Modern Times", cover: "https://upload.wikimedia.org/wikipedia/en/9/91/IU_-_Modern_Times.jpg" },

    // ERA: CLÁSSICOS ANTIGOS
    { title: "Good Day", file: "songs/Good day (좋은 날).mp3", album: "Real", cover: "https://upload.wikimedia.org/wikipedia/en/1/10/IU_-_Real.jpg" },
    { title: "YOU & I", file: "songs/YOU & I (너랑 나).mp3", album: "Last Fantasy", cover: "https://upload.wikimedia.org/wikipedia/en/f/f6/IU_-_Last_Fantasy.jpg" },
    { title: "Marshmallow", file: "songs/marshmallow (마쉬멜로우).mp3", album: "IU...IM", cover: "https://upload.wikimedia.org/wikipedia/en/2/29/IU...IM.jpg" },
    { title: "Boo", file: "songs/Boo (BOO).mp3", album: "Growing Up", cover: "https://upload.wikimedia.org/wikipedia/en/3/36/Growing_Up_IU.jpg" },
    { title: "Lost Child", file: "songs/lost child (미아).mp3", album: "Lost and Found", cover: "https://upload.wikimedia.org/wikipedia/en/0/03/Lost_and_Found_IU.jpg" }
];
