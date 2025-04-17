export interface WordGroup {
  words: string[];
}

export const practiceGroups: WordGroup[] = [
  // Practice groups will be added here. For now we'll use placeholder values
  {words: ["TEK", "BAŞINA ", "EĞLENCELİDİR", " BİLGİSAYAR", "OYNAMAK ", "SIKICIDIR"]},
  { words: ["İKLİMİMİZ", "OTOBÜSE", "BİSİKLETE", "BİNMEK", "İÇİN", "FAYDALIDIR"]},
  { words: ["ASYA", "ZİYARET", "ÜLKELERİNİ", "ETMEK", "İSTİYORUM", "AVRUPA"]},
  { words: ["EĞLENCELİ", "ARKADAŞLARIMLA", "FİLM", "BULURUM", "İZLEYEMEYİ", "DİZİ"]},
  { words: ["KAHVALTIDA", "AİLEMLE", "YUMURTA", "YEMEYİ", "SİMİT", "SEVERİM"]},
  { words: ["EĞLENCELİDİR", "YABANCI", "ZİYARET", "PAHALIDIR", "ETMEK", "ÜLKELERİ"]},
  { words: ["ÖĞRENMESİ", "BİR", "ZOR", "KOLAY", "DİLDİR", "ÇİNCE"]},
  { words: ["KÖPEK", "OLMAYI", "İLERİDE", "KEDİ", "SAHİBİ", "İSTİYORUM"]},
  { words: ["ÇALIŞIRKEN", "TERCİH", "KAHVE", "EDERİM", "ÇAY", "İÇMEYİ"]},
  { words: ["LİSEDE", "TÜRKÇEYDİ", "SEVDİĞİM", "DERS", "EN", "MATEMATİKTİ"]}
];

export const mainGroups: WordGroup[] = [
  { words: ["DEĞERLENDİRİRİM", "GENELLİKLE", "GERİ", "BİLDİRİMLERİNİ", "ÖNEMSEMEM", "BAŞKALARININ"] },
  { words: ["HAZIRLIKSIZIM", "HALİHAZIRDA", "KARŞI", "OLAN", "HAZIRLIKLIYIM", "ŞEYLERE"] },
  { words: ["HAREKET", "DİKKATLİ", "SORUNLARIM", "HIZLI", "GEREKTİRİR", "ETMEYİ"] },
  { words: ["YARINLAR", "ANLAMSIZDIR", "YARARLIDIR", "İÇİN", "YAPMAK", "FEDAKARLIK"] },
  { words: ["NADİREN", "UZUN", "SIK SIK", "DÜŞÜNÜRÜM", "SONUÇLARI", "VADELİ"] },
  { words: ["ŞEYLERİ", "DÜŞÜNÜRÜM", "BİR", "YAPMADAN", "ÖNCE", "DÜŞÜNMEM"] },
  { words: ["HIZLI", "KARARLARIMI", "ALIRIM", "BİR", "BİLİNÇLİ", "ŞEKİLDE"] },
  { words: ["ÇOK", "HAREKETE", "DÜŞÜNMEKSİZİN", "GEÇERİM", "FAZLA", "DÜŞÜNÜP"] },
  { words: ["ÖNCESİNDE", "SIKLIKLA", "NADİREN", "EYLEMLERİM", "YAPARIM", "PLAN"] },
  { words: ["DİKKATLİ", "GEÇERİM", "GENELLİKLE", "HIZLI", "HAREKETE", "ŞEKİLDE"] },
  { words: ["İLERİYE", "DÜŞÜNMEKTEN", "HOŞLANMAM", "GENELLİKLE", "DÖNÜK", "HOŞLANIRIM"] },
  { words: ["KOLAY", "TERCİH", "OLAN", "YOLU", "ETTİM", "ZORLAYICI"] },
  { words: ["FEDAKÂRLIK", "ŞİMDİLERDE", "HAYATIM", "SONRA", "İÇİN", "YAPARIM"] },
  { words: ["GEREKTİRİR", "SABIR", "ACİLİYET", "BAŞARIM", "GENELLİKLE", "BENİM"] },
  { words: ["VERİRİM", "HIZLI", "BİR", "DİKKATLİ", "KARAR", "ŞEKİLDE"] },
  { words: ["MANTIKLIDIR", "TEPKİSELDİR", "DAVRANIŞLAR", "GENEL", "OLARAK", "SERGİLEDİĞİM"] },
  { words: ["İÇİN", "ENGELDİR", "SABIRLI", "KAZANÇTIR", "KİŞİ", "OLMAK"] },
  { words: ["ALIR", "SIKLIKLA", "NADİREN", "KARAR", "ZAMAN", "VERMEM"] },
  { words: ["ZAMAN", "KAZANDIM", "PLANLAR", "EPEY", "HARCADIM", "YAPARAK"] },
  { words: ["ŞEYLERE", "ZORDUR", "KARŞI", "KOLAYDIR", "CEZBEDİCİ", "KOYMAK"] },
  { words: ["ÇOĞUNLUKLA", "YAKIN", "ÖNEMSERİM", "UZAK", "SONUÇLARI", "GELECEKTEKİ"] },
  { words: ["SEVMEZ", "BİRÇOK", "SEÇER", "PLANMALAYI", "KİŞİ", "GELECEĞİ"] },
  { words: ["GÜNLER", "BU", "GÜZEL", "EN", "GÜNLERİM", "GELECEK"] },
  { words: ["NADİREN", "İŞİN", "GETİRİRİM", "BİR", "GENELLİKLE", "SONUNU"] },
  { words: ["ENGELLENMİŞ", "BENİ", "HEVESLİ", "HİSSETTİRİR", "GÖREVLER", "ZORLAYICI"] }
];

// Log the groups length when the file loads (for debugging)
if (typeof window !== 'undefined') {
  console.log(`Word groups loaded - Practice: ${practiceGroups.length}, Main: ${mainGroups.length}`);
} 