"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';

interface QuestionnaireData {
  section1: number[];
  section2: number[];
  section3: number[];
  section4: number[];
}

interface QuestionnaireProps {
  onSubmit: (data: QuestionnaireData) => void;
}

export default function Questionnaire({ onSubmit }: QuestionnaireProps) {
  const { databaseParticipantId, questionnaireData: contextData, setQuestionnaireData } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(1);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<QuestionnaireData>({
    section1: contextData?.section1 || Array(9).fill(0),
    section2: contextData?.section2 || Array(37).fill(0),
    section3: contextData?.section3 || Array(14).fill(0),
    section4: contextData?.section4 || Array(29).fill(0),
  });
  const isDevelopment = process.env.NODE_ENV === 'development';

  // If we have context data, update our local state
  useEffect(() => {
    if (contextData) {
      setData(contextData);
    }
  }, [contextData]);

  // Update progress when section changes
  useEffect(() => {
    const sectionProgress = {
      1: 0,
      2: 9 / 89,
      3: 46 / 89,
      4: 60 / 89,
    };
    setProgress(sectionProgress[currentSection as 1 | 2 | 3 | 4] * 100);
  }, [currentSection]);

  const handleInputChange = (section: keyof QuestionnaireData, index: number, value: number) => {
    setData(prev => {
      const newData = { ...prev };
      newData[section] = [...prev[section]];
      newData[section][index] = value;
      return newData;
    });
  };

  // Save data to context when it changes
  useEffect(() => {
    // Avoid saving empty initial data
    if (data.section1.some(val => val !== 0) || 
        data.section2.some(val => val !== 0) || 
        data.section3.some(val => val !== 0) || 
        data.section4.some(val => val !== 0)) {
      setQuestionnaireData(data);
    }
  }, [data, setQuestionnaireData]);

  const handleNext = () => {
    // Validate current section
    const currentSectionData = data[`section${currentSection}` as keyof QuestionnaireData];
    const isComplete = currentSectionData.every(value => value !== 0);
    
    if (!isComplete) {
      setError('Lütfen tüm soruları cevaplayınız.');
      return;
    }
    
    setError(null);
    
    if (currentSection < 4) {
      setCurrentSection(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Save final data to context
      setQuestionnaireData(data);
      
      // If we have a valid participant ID, save to database
      if (databaseParticipantId && databaseParticipantId > 0) {
        try {
          const response = await fetch('/api/questionnaire', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              participantId: databaseParticipantId,
              ...data
            }),
          });

          const responseData = await response.json();
          
          if (!response.ok) {
            // Safely access properties, provide defaults if undefined
            const errorMessage = responseData?.error || 'Unknown error';
            const errorDetails = responseData?.details || 'No additional details';
            
            console.error('Error saving questionnaire data:', errorMessage);
            console.error('Error details:', errorDetails);
            
            setError(`${errorMessage}: ${errorDetails}`);
            // Continue anyway - we'll still use the data in memory
          } else {
            // Safely access questionnaireId
            const questionnaireId = responseData?.questionnaireId || 'unknown';
            console.log('Questionnaire data saved successfully, ID:', questionnaireId);
          }
        } catch (apiError) {
          console.error('API request error:', apiError);
          setError(`Failed to save questionnaire: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
        }
      } else {
        console.log('Offline mode or no participant ID, skipping database save');
      }

      // Even if database save fails, we still want to continue
      onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error instanceof Error ? error.message : 'Unexpected error occurred');
      // Still continue to the next step even if saving fails
      onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug function to fill all answers with 1
  const fillWithOnes = () => {
    setData({
      section1: Array(9).fill(1),
      section2: Array(37).fill(1),
      section3: Array(14).fill(1),
      section4: Array(29).fill(1),
    });
    setError(null);
  };

  const renderSection1 = () => {
    // Section 1: 9 questions, scale of 1-5
    const questions = [
      "İlginç yerleri keşfetmekten hoşlanırım.",
      "Evde çok fazla zaman geçirdiğimde huzursuz olurum.",
      "Korkutucu şeyler yapmaktan hoşlanırım.",
      "Çılgın partilerden hoşlanırım.",
      "Rotası belli olmayan ve zaman sınırı olmayan bir geziye çıkmak isterim.",
      "Heyecan verici bir şekilde ne yapacağı belli olmayan arkadaşları tercih ederim.",
      "Lütfen bu soruyu \"4=katılıyorum\" olarak işaretleyiniz.",
      "Bungee-jumping yapmayı denemek isterim.",
      "Yasadışı olsa bile yeni ve heyecan verici deneyimleri yaşamayı severim."
    ];

    const options = [
      { value: 1, label: "Hiç Katılmıyorum" },
      { value: 2, label: "Katılmıyorum" },
      { value: 3, label: "Kararsızım" },
      { value: 4, label: "Katılıyorum" },
      { value: 5, label: "Tamamen Katılıyorum" }
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Bölüm 1</h3>
        <p className="text-gray-700 mb-6">
          Lütfen aşağıdaki her maddeyi okuyunuz ve olabildiğince dürüst bir şekilde sizi ne
          kadar yansıttığını veya sizin için ne kadar doğru olduğunu işaretleyiniz.
        </p>
        
        {questions.map((question, index) => (
          <div key={`s1-${index}`} className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm p-6">
            <p className="font-medium text-gray-900 mb-4">
              {index + 1}. {question}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              {options.map((option) => (
                <label 
                  key={`s1-${index}-${option.value}`}
                  className={`
                    flex items-center justify-between gap-2 p-3 rounded-lg border
                    ${data.section1[index] === option.value 
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                    } 
                    cursor-pointer transition-all
                  `}
                >
                  <span className="text-sm">{option.label}</span>
                  <input
                    type="radio"
                    name={`s1-q${index}`}
                    value={option.value}
                    checked={data.section1[index] === option.value}
                    onChange={() => handleInputChange('section1', index, option.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    required
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSection2 = () => {
    // Section 2: 37 questions, scale of 1-5
    const questions = [
      "Bir kutlama için arkadaşlarla bir araya gelmenin hayattaki en büyük zevklerden biri olduğuna inanırım.",
      "Kader hayatımda birçok şeyi belirler.",
      "Bir kişinin günü sabahtan planlamış olmalı.",
      "Düşünmeden hareket ederim.",
      "İşlerin zamanında bitmemesi beni endişelendirmez.",
      "Bir şeyi başarmak istediğimde kendime hedefler belirlerim ve bu hedeflere ulaşmak için belirli yöntemler düşünürüm.",
      "En sevdiğim şarkıyı dinlerken, genellikle zamanın nasıl geçtiğini anlamam.",
      "Yarının işlerini yetiştirmek ve diğer gerekli işleri yapmak, bu akşamın eğlencesinden önce gelir.",
      "Her şey olacağına varır, bu nedenle ne yaptığımın bir önemi yoktur.",
      "Hayatımı mümkün olduğunca dolu dolu yaşamaya çalışırım; anı yaşarım.",
      "Randevulara geç kalmak keyfimi kaçırır.",
      "Tercihen, her günümü son günümmüş gibi yaşamak isterim.",
      "Arkadaşlarıma ve yetkililere karşı olan yükümlülüklerimi zamanında yerine getiririm.",
      "Fevri kararlar veririm.",
      "Her günümü planlamaya çalışmak yerine, olduğu gibi yaşarım.",
      "Hayatıma heyecan katmak benim için önemlidir.",
      "Yaptığım işten keyif almanın işi zamanında bitirmekten daha önemli olduğunu düşünürüm.",
      "Bir karar vermeden önce, yarar ve zararları tartarım.",
      "Risk almak hayatımı sıkıcı olmaktan kurtarır.",
      "Bana göre, hayat yolculuğunun tadını çıkarmak, sadece varış noktasına odaklanmaktan daha önemlidir.",
      "Hedef, sonuç ve çıktıları düşünmem gerektiğinde, bu durum sürecin keyfini kaçırır ve faaliyetlerimin akışını bozar.",
      "Her şey sürekli değiştiği için geleceğe dair plan yapamazsınız.",
      "Hayatımın gidişatı benim etkiyemeyeceğim güçler tarafından kontrol edilir.",
      "Yapabileceğim bir şey olmadığı için, gelecek hakkında kaygılanmanın bir anlamı yoktur.",
      "İstikrarlı bir şekilde ilerleyerek, projeleri zamanında tamamlarım.",
      "Hayatıma heyecan katmak için riskler alırım.",
      "Yapılacaklar listesi hazırlarım.",
      "Güneş, doğu yönünden batar.",
      "Genellikle, mantığımdan ziyade kalbimin sesini dinlerim.",
      "Yapılması gereken bir iş olduğunu bildiğimde, cezbedici diğer şeylere karşı koyabilirim.",
      "Kendimi anın heyecanına kapılırken bulurum.",
      "Günümüz hayatı fazla karmaşık; geçmişin daha basit hayatını tercih ederdim.",
      "Arkadaşlarımın öngörülebilir davranmalarındansa spontane davranmalarını tercih ederim.",
      "Eğer benim ilerlememi sağlayacaksa, zor ve ilginç olmayan görevlerde çalışmaya devam ederim.",
      "Kazandıklarımı bugün keyif için harcamak, yarının güvencesi için biriktirmekten daha iyidir.",
      "Genellikle şans, sıkı çalışmaktan daha iyi sonuç getirir.",
      "Yakın ilişkilerimin tutkulu olmasını severim."
    ];

    const options = [
      { value: 1, label: "Hiç doğru değil" },
      { value: 2, label: "Doğru değil" },
      { value: 3, label: "Ne doğru ne de yanlış" },
      { value: 4, label: "Doğru" },
      { value: 5, label: "Çok doğru" }
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Bölüm 2</h3>
        <p className="text-gray-700 mb-6">
          Aşağıda size verilen her maddeyi okuyunuz ve her madde için olabildiğince
          dürüst bir şekilde "Sizin karakterinizi ne kadar yansıtıyor veya sizin
          için ne kadar doğru?" sorusunu cevaplayınız.
        </p>
        
        {questions.map((question, index) => (
          <div key={`s2-${index}`} className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm p-6">
            <p className="font-medium text-gray-900 mb-4">
              {index + 1}. {question}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              {options.map((option) => (
                <label 
                  key={`s2-${index}-${option.value}`}
                  className={`
                    flex items-center justify-between gap-2 p-3 rounded-lg border
                    ${data.section2[index] === option.value 
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                    } 
                    cursor-pointer transition-all
                  `}
                >
                  <span className="text-sm">{option.label}</span>
                  <input
                    type="radio"
                    name={`s2-q${index}`}
                    value={option.value}
                    checked={data.section2[index] === option.value}
                    onChange={() => handleInputChange('section2', index, option.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    required
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSection3 = () => {
    // Section 3: 14 questions, scale of 1-7
    const questions = [
      "İşlerin gelecekte nasıl olabileceğini dikkate alırım ve günlük davranışlarımla bunları etkilemeye çalışırım.",
      "Uzun yıllar netice vermeyebilecek sonuçlara ulaşmak için sıklıkla belirli bir davranışta bulunurum.",
      "Geleceğin kendi başının çaresine bakacağını düşünerek yalnızca anlık endişeleri gidermek için eyleme geçerim.",
      "Davranışım yalnızca eylemlerimin anlık (örneğin, birkaç günlük ya da haftalık) sonuçlarından etkilenir.",
      "Benim rahatlığım, verdiğim kararlarda ya da aldığım eylemlerde büyük bir faktördür.",
      "Gelecekteki sonuçlara ulaşmak için anlık mutluluğumu ya da esenliğimi feda etmeye istekliyimdir.",
      "Olumsuz sonuç uzun yıllar ortaya çıkmayacak olsa da olumsuz sonuçlarla ilgili uyarıları ciddiye almanın önemli olduğunu düşünürüm.",
      "Daha sonra sonuç alınan önemli bir davranış sergilemenin şimdi sonuç alınan daha az önemli bir davranış sergilemekten daha önemli olduğunu düşünürüm.",
      "Lütfen bu soruyu \"6\" olarak işaretleyiniz.",
      "Gelecekteki sorunlar hakkındaki uyarıları genellikle görmezden gelirim çünkü sorunlar kriz düzeyine ulaşmadan önce çözüleceklerini düşünürüm.",
      "Gelecekteki sonuçlarla daha ilerideki bir zamanda uğraşılabileceği için şimdi fedakârlık yapmanın gereksiz olduğunu düşünürüm.",
      "Gelecekteki sorunlarla daha ilerideki bir vakitte ilgileneceğimi düşünerek sadece anlık kaygılarımı gidermek için eyleme geçerim.",
      "Günden güne çalışmamın belirli sonuçları olduğundan bu, benim için uzak sonuçları olan davranıştan daha önemlidir.",
      "Bir karar verirken bunun beni gelecekte nasıl etkileyebileceği hakkında düşünürüm."
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Bölüm 3</h3>
        <p className="text-gray-700 mb-6">
          Aşağıda size sunulan her bir ifadenin sizin için geçerli olup olmadığını lütfen belirtin. 
          Eğer ifade sizin için son derece geçersizse (size hiç benzemiyorsa) "1" seçeneğini; 
          eğer ifade sizin için tamamen geçerliyse (size oldukça benziyorsa) "7" seçeneğini işaretleyin.
          Elbette, uç noktaların arasına düşüyorsanız da aradaki sayıları kullanabilirsiniz.
        </p>
        
        {questions.map((question, index) => (
          <div key={`s3-${index}`} className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm p-6">
            <p className="font-medium text-gray-900 mb-4">
              {index + 1}. {question}
            </p>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between text-sm text-gray-500 px-4">
                <span>Bana hiç benzemiyor</span>
                <span>Bana oldukça benziyor</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <label 
                    key={`s3-${index}-${value}`}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg border
                      ${data.section3[index] === value 
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      } 
                      cursor-pointer transition-all
                    `}
                  >
                    <span className="font-medium">{value}</span>
                    <input
                      type="radio"
                      name={`s3-q${index}`}
                      value={value}
                      checked={data.section3[index] === value}
                      onChange={() => handleInputChange('section3', index, value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      required
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSection4 = () => {
    // Section 4: 29 questions, scale of 1-5
    const questions = [
      "Verdiğim kararlardan dolayı asla pişmanlık duymam.",
      "Birinin arkasından kesinlikle kötü şeyler konuşmam.",
      "Bana yönelik eleştirileri her zaman dikkate alırım.",
      "Hayatımda hiç hırsızlık yapmadım.",
      "Bir şeyi kafama koyduğumda diğer insanlar nadiren fikrimi değiştirebilir.",
      "Kendi kaderimi yazabileceğimi düşünürüm.",
      "Bana ait olmayan şeyleri asla almam.",
      "İş veya okuldan izin almak için hasta numarası yapmam.",
      "Verdiğim kararlara çok güvenirim.",
      "Kesinlikle sokağa çöp atmam.",
      "Araç kullanırken hız limitini aşmam.",
      "Diğer insanların benim hakkımda ne düşündüğünü dikkate almam.",
      "Kendime karşı her zaman dürüst davranırım.",
      "Suçlu duruma düşme ihtimalim olmasa bile her zaman yasalara uyarım.",
      "Tamamen mantıklı bir insanım.",
      "İnsanların özel bir şeyler konuştuğunu duyarsam dinlemekten kaçınırım.",
      "Zihnimi dağıtan bir düşünceden uzaklaşmak benim için zor değildir.",
      "Hatalarımı kesinlikle gizlemem.",
      "Kötü alışkanlıklarımı terk etmek bana zor gelmez.",
      "Duygularımın yoğunlaşması düşüncelerimde önyargılı olmama neden olmaz.",
      "Mağaza eşyalarına zarar verirsem kesinlikle bu durumu görevlilere bildiririm.",
      "Diğer insanlar hakkında dedikodu yapmam.",
      "İnsanlara yönelik ilk izlenimimde yanılmam.",
      "Çok mecbur olsam bile yalan söylemem.",
      "Hiçbir kötü alışkanlığım yoktur.",
      "Lütfen bu soruda \"1-Hiç uygun değil\" seçeneğini işaretleyiniz.",
      "Yaptığım işlerde her zaman doğru adımlar atarım.",
      "Asla cinsel içerikli kitap veya dergi okumam.",
      "Kesinlikle küfür etmem."
    ];

    const options = [
      { value: 1, label: "Hiç uygun değil" },
      { value: 2, label: "Uygun değil" },
      { value: 3, label: "Biraz uygun" },
      { value: 4, label: "Uygun" },
      { value: 5, label: "Tamamen uygun" }
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Bölüm 4</h3>
        <p className="text-gray-700 mb-6">
          Sizden istenilen aşağıdaki ifadeleri okuduktan sonra kendinizi değerlendirmeniz ve 
          sizin için en uygun seçeneği işaretlemenizdir.
        </p>
        
        {questions.map((question, index) => (
          <div key={`s4-${index}`} className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm p-6">
            <p className="font-medium text-gray-900 mb-4">
              {index + 1}. {question}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              {options.map((option) => (
                <label 
                  key={`s4-${index}-${option.value}`}
                  className={`
                    flex items-center justify-between gap-2 p-3 rounded-lg border
                    ${data.section4[index] === option.value 
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                    } 
                    cursor-pointer transition-all
                  `}
                >
                  <span className="text-sm">{option.label}</span>
                  <input
                    type="radio"
                    name={`s4-q${index}`}
                    value={option.value}
                    checked={data.section4[index] === option.value}
                    onChange={() => handleInputChange('section4', index, option.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    required
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Anket</h2>
        
        {/* Debug button - only visible in development */}
        {isDevelopment && (
          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={fillWithOnes}
              className="px-4 py-2 bg-gray-800 text-white text-sm rounded"
            >
              Debug: Fill All with 1
            </button>
          </div>
        )}
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress + (currentSection === 4 ? 40 * data.section4.filter(v => v !== 0).length / 29 : 0)}%` }}
          ></div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Current section */}
        {currentSection === 1 && renderSection1()}
        {currentSection === 2 && renderSection2()}
        {currentSection === 3 && renderSection3()}
        {currentSection === 4 && renderSection4()}
        
        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentSection === 1 || isSubmitting}
            className={`px-5 py-2 rounded-md text-sm font-medium 
              ${currentSection === 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Geri
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting 
              ? 'Gönderiliyor...' 
              : currentSection < 4 
                ? 'Sonraki Bölüm' 
                : 'Tamamla'
            }
          </button>
        </div>
      </div>
    </div>
  );
} 