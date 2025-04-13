"use client";

import { useState } from 'react';
import Image from 'next/image';

interface DemographicData {
  gender: string;
  age: string;
  education: string;
  department: string;
  year: string;
  maritalStatus: string;
  employmentStatus: string;
  livingWith: string[];
  longestResidence: string;
  currentSocialStatus: string;
  childhoodSocialStatus: string;
  monthlyIncome: string;
}

const demoWords = [
  "ÖRNEK", "KELİME", "SEÇME", "ARAYÜZÜ", "DEMO", "SAYFASI"
];

export default function DemoPage() {
  const [showDemographicForm, setShowDemographicForm] = useState(true);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [demographicData, setDemographicData] = useState<DemographicData>({
    gender: '',
    age: '',
    education: '',
    department: '',
    year: '',
    maritalStatus: '',
    employmentStatus: '',
    livingWith: [],
    longestResidence: '',
    currentSocialStatus: '',
    childhoodSocialStatus: '',
    monthlyIncome: ''
  });

  const isWordSelected = (word: string) => selectedWords.includes(word);

  const toggleWordSelection = (word: string) => {
    if (isWordSelected(word)) {
      setSelectedWords(prev => prev.filter(w => w !== word));
    } else if (selectedWords.length < 5) {
      setSelectedWords(prev => [...prev, word]);
    }
  };

  const handleDemographicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Demographic data:', demographicData);
    setShowDemographicForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDemographicData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (value: string) => {
    setDemographicData(prev => ({
      ...prev,
      livingWith: prev.livingWith.includes(value)
        ? prev.livingWith.filter(item => item !== value)
        : [...prev.livingWith, value]
    }));
  };

  if (showDemographicForm) {
    return (
      <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleDemographicSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Demografik Bilgi Formu</h2>

            {/* Gender */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-gray-700">1. Cinsiyetiniz</label>
              <div className="space-y-2">
                {['Erkek', 'Kadın', 'Belirtmek istemiyorum'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={demographicData.gender === option}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">2. Yaşınız</label>
              <input
                type="number"
                name="age"
                value={demographicData.age}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                max="120"
              />
            </div>

            {/* Education */}
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">3. Eğitim Durumunuz</label>
              <select
                name="education"
                value={demographicData.education}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="üniversite">Üniversite Öğrencisi</option>
                <option value="yüksek lisans">Yüksek Lisans Öğrencisi</option>
                <option value="doktora">Doktora Öğrencisi</option>
              </select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">4. Bölümünüz</label>
              <input
                type="text"
                name="department"
                value={demographicData.department}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Year */}
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">5. Sınıfınız</label>
              <select
                name="year"
                value={demographicData.year}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="hazırlık">Hazırlık</option>
                <option value="1">1. Sınıf</option>
                <option value="2">2. Sınıf</option>
                <option value="3">3. Sınıf</option>
                <option value="4">4. Sınıf</option>
                <option value="yüksek lisans">Yüksek Lisans Öğrencisi</option>
                <option value="doktora">Doktora Öğrencisi</option>
              </select>
            </div>

            {/* Marital Status */}
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">6. Medeni Durumunuz</label>
              <select
                name="maritalStatus"
                value={demographicData.maritalStatus}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="bekar">Bekar</option>
                <option value="evli">Evli</option>
                <option value="boşanmış">Boşanmış</option>
              </select>
            </div>

            {/* Employment Status */}
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">7. Çalışma Durumunuz</label>
              <select
                name="employmentStatus"
                value={demographicData.employmentStatus}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="tam zamanlı">Tam Zamanlı Çalışıyorum</option>
                <option value="yarı zamanlı">Yarı Zamanlı Çalışıyorum</option>
                <option value="çalışmıyor">Çalışmıyorum</option>
              </select>
            </div>

            {/* Living Situation */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-gray-700">
                8. Şu an kimlerle yaşıyorsunuz? (Birden fazla seçenek işaretleyebilirsiniz)
              </label>
              <div className="space-y-2">
                {[
                  'Ailemle',
                  'Tek başıma',
                  'Arkadaşımla/arkadaşlarımla',
                  'Yurtta kalıyorum',
                  'Diğer'
                ].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={demographicData.livingWith.includes(option)}
                      onChange={() => handleCheckboxChange(option)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Longest Residence */}
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">
                9. Yaşamınızın çoğunun geçtiği yer (en uzun yaşadığınız yer)?
              </label>
              <select
                name="longestResidence"
                value={demographicData.longestResidence}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="köy">Köy</option>
                <option value="kasaba">Kasaba/Belde</option>
                <option value="ilçe">İlçe</option>
                <option value="il">İl</option>
                <option value="büyükşehir">Büyükşehir</option>
              </select>
            </div>

            {/* Social Status Ladder */}
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-lg font-medium text-gray-700">
                  10. Şu anki yaşamınızda kendinizi aşağıdaki merdivende nereye yerleştirirsiniz?
                </label>
                <p className="text-sm text-gray-500">
                  En üst (10) en iyi koşullara, en alt (1) en kötü koşullara sahip olanları temsil eder.
                </p>
                <Image
                  src="https://lh7-us.googleusercontent.com/gt9tCPaMSGEd8NAwb0AV3_GdvTNcXQbI28TwxIdRKegvVJcLMVuN9JJItyDE8ESNQgLX9qlnm0ItfQ1AP29FbhObJqQ7Qe5vH9kvdqBOwLkszVDTPo2bNTJgef74cMDiNwiv_aHCuMa7qybrKMb-1XfLANqJQpQ9_3Dvhkwbp1bPMXIC0CTF4k9XvbZivEm52GzcZzwf"
                  alt="Social Status Ladder"
                  width={300}
                  height={400}
                  className="mx-auto"
                />
                <input
                  type="number"
                  name="currentSocialStatus"
                  value={demographicData.currentSocialStatus}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-medium text-gray-700">
                  11. Çocukluk dönemindeki yaşantınızı göz önünde bulundurduğunuzda içinde bulunduğunuz aileyi bu merdivende nereye yerleştirirsiniz?
                </label>
                <input
                  type="number"
                  name="childhoodSocialStatus"
                  value={demographicData.childhoodSocialStatus}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Monthly Income */}
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">
                12. Ailenizin/hanenizin aylık gelirini asgari ücret üzerinden tanımlayacak olsanız aşağıdakilerden hangisi sizin için uygun olur?
              </label>
              <select
                name="monthlyIncome"
                value={demographicData.monthlyIncome}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="asgari">Asgari ücret</option>
                <option value="1-2">Asgari ücretin 1 ile 2 katı arasında</option>
                <option value="2">Asgari ücretin 2 katı</option>
                <option value="2-3">Asgari ücretin 2 ile 3 katı arasında</option>
                <option value="3">Asgari ücretin 3 katı</option>
                <option value="3-4">Asgari ücretin 3 ile 4 katı arasında</option>
                <option value="4">Asgari ücretin 4 katı</option>
                <option value="4-5">Asgari ücretin 4 ile 5 katı arasında</option>
                <option value="5">Asgari ücretin 5 katı</option>
                <option value="5+">Asgari ücretin 5 katından fazla</option>
              </select>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Devam Et
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 py-8">
      <div className="w-full max-w-2xl mx-auto space-y-16">
        {/* Word selection interface */}
        <div className="bg-white p-7 rounded-xl shadow-sm">
          <div className="max-w-3xl mx-auto mb-8">
            <div className="w-[700px] h-[130px] grid grid-cols-3 gap-x-10 gap-y-8 place-items-center">
              {demoWords.map((word, index) => (
                <div key={index}>
                  <button
                    onClick={() => toggleWordSelection(word)}
                    className={`min-w-[200px] py-6 px-4 rounded-lg text-center text-[24px] font-medium transition-all duration-200 ${
                      isWordSelected(word)
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : 'bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {word}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Selected sentence display */}
        <div className="bg-white p-7 rounded-xl shadow-sm my-[20px]">
          {selectedWords.length > 0 ? (
            <p className="text-gray-800 text-[18px] font-medium p-4 bg-gray-50 rounded-lg">
              {selectedWords.join(' ')}
            </p>
          ) : (
            <p className="text-gray-400 italic p-4 bg-gray-50 rounded-lg">Henüz kelime seçilmedi...</p>
          )}
        </div>
      </div>
    </div>
  );
} 