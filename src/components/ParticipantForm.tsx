import { useState } from 'react';

interface ParticipantData {
  school: string;
  studentNumber: string;
  course: string;
  department: string;
}

interface ParticipantFormProps {
  onSubmit: (data: ParticipantData, databaseId: number) => void;
}

export default function ParticipantForm({ onSubmit }: ParticipantFormProps) {
  const [formData, setFormData] = useState<ParticipantData>({
    school: '',
    studentNumber: '',
    course: '',
    department: 'N/A'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setDebug('');

    try {
      // Try to save to database first
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Veriler kaydedilirken bir hata oluştu';
        const details = data.details ? `\n\nDebug:\n${data.details}` : '';
        setDebug(`Status: ${response.status}, Error: ${errorMessage}${details}`);

        // Always show the error and offer offline mode option for any error
        setError(`${errorMessage}. Çevrimdışı modda devam edebilirsiniz.`);
        setShowFallback(true);
        return;
      }

      // If we got here, database save was successful
      onSubmit(formData, data.participantId);
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu. Çevrimdışı modda devam edebilirsiniz.');
      setShowFallback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfflineMode = () => {
    // Use -1 as participantId to indicate offline mode
    onSubmit(formData, -1);
  };

  const runMigration = async () => {
    setIsMigrating(true);
    setMigrationResult('Running migration...');

    try {
      const response = await fetch('/api/participants/migrate');
      const data = await response.json();

      setMigrationResult(JSON.stringify(data, null, 2));

      if (data.success) {
        setError(null);
      }
    } catch (err) {
      setMigrationResult(`Migration failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="w-full p-4">
      {/* Introduction text in its own card */}
      <div className="max-w-[800px] mx-auto bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 
          className="text-2xl md:text-3xl font-extrabold text-center mb-8 text-blue-700 pb-4 border-b border-gray-200"
          style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#1d4ed8',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          Doktora Tez Araştırması
        </h1>
        
        <div className="text-sm space-y-6">
          <p>
            Değerli Katılımcı, Dokuz Eylül Üniversitesi Psikoloji Anabilim dalı Psikoloji Doktora Programı bünyesinde Necati Enöz tarafından yürütülen araştırmaya davet edilmiş bulunuyorsunuz. Araştırmada üniversite öğrencilerinin zaman yönelimlerini incelemek amacıyla planlanmıştır. Bu araştırmaya katılmak gönüllülük esasına dayanmaktadır. Çalışmaya katılmayı kabul ettikten sonra veri toplama formunu doldurmaya başlamış olsanız bile istemediğiniz takdirde çalışmaya katılmaktan vazgeçebilirsiniz. Formu eksiksiz doldurup araştırmacıya vermiş olmanız/göndermeniz çalışmaya katılma konusunda gönüllü olduğunuz anlamına gelmektedir.
          </p>
          
          <p>
            Sizden elde edilen tüm bu bilgiler bilimsel bir araştırmada kullanılacaktır. Araştırma sonuçları kimlik belirtecek herhangi bir isim ya da işaret içermeyecektir. Bu araştırmada sizinle ilgili tutulan tüm kayıtlar gizli kalacaktır.
          </p>
          
          <p>
            Bu nedenle soruların tümüne doğru ve eksiksiz yanıt vermeniz büyük önem taşımaktadır. Çalışma ile ilgili herhangi bir sorunuz olduğunda aşağıda iletişim bilgileri yer alan sorumlu araştırmacı Necati Enöz ile çekinmeden iletişime geçebilirsiniz.
          </p>
          
          <p>
            Çalışmamız için zaman ayırarak bilim dünyasına verdiğiniz katkı için teşekkürler...
          </p>
          
          <div className="mt-8">
            <p>Araştırma yürütücüsünün</p>
            <p>Unvanı, Adı Soyadı: Arş. Gör. Necati Enöz</p>
            <p>Telefon Numarası: (216) 626 10 50-2244</p>
            <p>E-posta adresi: necatienoz@maltepe.edu.tr</p>
          </div>
          
          <div className="mt-4 font-medium">
            <p className="mb-3">Çalışmaya Katılım Onayı:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Yukarıda yer alan ve araştırmadan önce katılımcıya/gönüllüye verilmesi gereken bilgileri okudum ve katılmam istenen çalışmanın kapsamını ve amacını, gönüllü olarak üzerime düşen sorumlulukları tamamen anladım.</li>
              <li>Çalışma hakkında yazılı ve sözlü açıklama bu yukarıda adı belirtilen araştırmacı tarafından yapıldı, soru sorma ve tartışma imkanı buldum ve tatmin edici yanıtlar aldım.</li>
              <li>Bana, çalışmanın muhtemel riskleri ve faydaları sözlü olarak da anlatıldı.</li>
              <li>Bu çalışmayı istediğim zaman ve herhangi bir neden belirtmek zorunda kalmadan bırakabileceğimi ve bıraktığım takdirde herhangi bir olumsuzluk ile karşılaşmayacağımı anladım.</li>
              <li>Bu koşullarda söz konusu araştırmaya kendi isteğimle, hiçbir baskı ve zorlama olmaksızın katılmayı kabul ediyorum.</li>
            </ul>
          </div>
          
          <p className="mt-8 font-medium text-center">
            Bilgilerinizi girip, &quot;Devam Et&quot; butonuna tıkladığınızda yukarıda sıralanan maddeleri onaylamış sayılacaksınız.
          </p>
        </div>
      </div>
      
      {/* Form section in a separate card */}
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-center mb-6">
          Katılımcı Bilgileri
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
            {!showFallback && (
              <button
                onClick={() => setShowFallback(true)}
                className="ml-2 text-blue-600 underline"
              >
                Veritabanı olmadan devam et
              </button>
            )}
            {(error.includes('department') || error.includes('Failed to save participant')) && (
              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={runMigration}
                  disabled={isMigrating}
                  style={{
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "#DC2626",
                    color: "white",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    border: "none",
                    cursor: isMigrating ? "not-allowed" : "pointer",
                    opacity: isMigrating ? 0.7 : 1
                  }}
                >
                  {isMigrating ? "Migrasyon Çalışıyor..." : "Veritabanı Şemasını Düzelt"}
                </button>

                {migrationResult && (
                  <div style={{
                    marginTop: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: "#F3F4F6",
                    borderRadius: "0.375rem",
                    whiteSpace: "pre-wrap",
                    fontSize: "0.875rem",
                    maxHeight: "200px",
                    overflowY: "auto",
                    fontFamily: "monospace"
                  }}>
                    {migrationResult}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {showFallback && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
            <p className="mb-2">
              <strong>Uyarı:</strong> Veritabanına bağlantı kurulamıyor.
              Devam ederseniz, verileriniz sadece yerel olarak saklanacak ve
              sonuçlar Excel dosyası olarak indirilebilecek.
            </p>
            <button
              onClick={handleOfflineMode}
              className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition duration-200"
            >
              Veritabanı Olmadan Devam Et
            </button>
          </div>
        )}

        {debug && (
          <div className="mb-4 p-3 bg-gray-100 text-gray-700 rounded-lg text-xs font-mono overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold">Tanılama Bilgileri:</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(debug);
                  alert('Tanılama bilgileri panoya kopyalandı');
                }}
                className="text-blue-500 hover:text-blue-700 text-xs"
              >
                Kopyala
              </button>
            </div>
            <pre className="whitespace-pre-wrap">{debug}</pre>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Okulunuz</label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Öğrenci Numaranız</label>
            <input
              type="text"
              value={formData.studentNumber}
              onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Puan Alacağınız Dersiniz (tam ismi ve kodu)</label>
            <input
              type="text"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="pt-4 mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
            >
              {isSubmitting ? 'Gönderiliyor...' : 'Devam Et'}
            </button>

            {error && error.includes('Veritabanı') && (
              <button
                type="button"
                onClick={handleOfflineMode}
                className="w-full mt-3 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Veritabanı olmadan devam et
              </button>
            )}
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Veritabanı bağlantı hatası alıyorsanız, lütfen internet bağlantınızı kontrol edin.</p>
          <button
            type="button"
            onClick={async () => {
              try {
                setDebug("Veritabanı bağlantısı test ediliyor...");
                const testResponse = await fetch('/api/db-test', { method: 'GET' });
                const testData = await testResponse.json();

                if (testResponse.ok && testData.success) {
                  const diagnostics = testData.diagnostics || {};
                  setDebug(
                    `Bağlantı başarılı (${testData.responseTime || 'N/A'})\n` +
                    `Sunucu zamanı: ${diagnostics.serverTime || 'N/A'}\n` +
                    `Veritabanı: ${diagnostics.databaseName || 'N/A'}\n` +
                    `Server version: ${diagnostics.serverVersion || 'N/A'}\n` +
                    `Server address: ${diagnostics.serverAddress || 'N/A'}`
                  );
                } else {
                  const diagnostics = testData.diagnostics || {};
                  setDebug(
                    `Bağlantı hatası: ${testData.error || 'Bilinmeyen hata'}\n` +
                    `Hata türü: ${diagnostics.name || 'N/A'}\n` +
                    `Hata kodu: ${diagnostics.code || 'N/A'}\n` +
                    `Çözüm önerisi: Lütfen internet bağlantınızı kontrol edin ve yöneticinize başvurun.`
                  );
                  // Automatically show fallback option
                  setShowFallback(true);
                }
              } catch (err: unknown) {
                setDebug(
                  `Test başarısız: ${err instanceof Error ? err.message : String(err)}\n` +
                  `Tarayıcınız sunucuya erişemiyor olabilir. Lütfen internet bağlantınızı kontrol edin.`
                );
                // Automatically show fallback option
                setShowFallback(true);
              }
            }}
            className="mt-2 text-blue-500 underline"
          >
            Veritabanı bağlantısını test et
          </button>
        </div>
      </div>
    </div>
  );
} 