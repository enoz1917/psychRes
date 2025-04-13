"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';

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

interface DemographicFormProps {
  onSubmit: (data: DemographicData) => void;
}

export default function DemographicForm({ onSubmit }: DemographicFormProps) {
  const { databaseParticipantId } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // If we have a valid participant ID, save to database
      if (databaseParticipantId && databaseParticipantId > 0) {
        const response = await fetch('/api/demographic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participantId: databaseParticipantId,
            ...demographicData
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('Error saving demographic data:', data.error);
          console.error('Error details:', data.details);
          if (data.stack) {
            console.error('Error stack:', data.stack);
          }
          setError(`${data.error}: ${data.details || 'No additional details'}`);
          // Continue anyway - we'll still use the data in memory
        } else {
          console.log('Demographic data saved successfully, ID:', data.demographicId);
        }
      } else {
        console.log('Offline mode or no participant ID, skipping database save');
      }

      // Even if database save fails, we still want to continue
      onSubmit(demographicData);
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error instanceof Error ? error.message : 'Unexpected error occurred');
      // Still continue to the next step even if saving fails
      onSubmit(demographicData);
    } finally {
      setIsSubmitting(false);
    }
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

  const runDiagnostics = async () => {
    if (!databaseParticipantId || databaseParticipantId <= 0) {
      setDiagnosticResult('No valid participant ID available for testing');
      return;
    }
    
    setIsDiagnosticRunning(true);
    setDiagnosticResult('Running diagnostic tests...');
    
    try {
      const response = await fetch(`/api/demographic/test?participantId=${databaseParticipantId}`);
      const data = await response.json();
      
      setDiagnosticResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setDiagnosticResult(`Diagnostic test failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsDiagnosticRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ padding: "2rem 0" }}>
      <div className="mx-auto" style={{ maxWidth: "48rem", padding: "0 1rem" }}>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg" style={{ overflow: "hidden" }}>
          {/* Header */}
          <div className="bg-white border-b border-gray-200" style={{ padding: "1.5rem 2rem" }}>
            <h2 className="text-gray-900" style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center" }}>
              Demografik Bilgi Formu
            </h2>
            {error && (
              <div style={{ 
                marginTop: "0.75rem", 
                padding: "0.75rem", 
                backgroundColor: "#FEE2E2", 
                color: "#B91C1C",
                borderRadius: "0.375rem" 
              }}>
                {error}
                <div style={{ marginTop: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={runDiagnostics}
                    disabled={isDiagnosticRunning}
                    style={{
                      padding: "0.5rem 0.75rem",
                      backgroundColor: "#DC2626",
                      color: "white",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      border: "none",
                      cursor: isDiagnosticRunning ? "not-allowed" : "pointer",
                      opacity: isDiagnosticRunning ? 0.7 : 1
                    }}
                  >
                    {isDiagnosticRunning ? "Tanılama Çalışıyor..." : "Veritabanı Tanılama Testi Çalıştır"}
                  </button>
                </div>
                {diagnosticResult && (
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
                    {diagnosticResult}
                  </div>
                )}
              </div>
            )}
            {databaseParticipantId === -1 && (
              <div style={{ 
                marginTop: "0.75rem", 
                padding: "0.75rem", 
                backgroundColor: "#FEF3C7", 
                color: "#92400E",
                borderRadius: "0.375rem" 
              }}>
                Çevrimdışı mod: Verileriniz sadece yerel olarak saklanacak
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div style={{ padding: "1.5rem 2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Gender */}
              <div className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm" style={{ padding: "1.5rem" }}>
                <label className="block text-gray-900" style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
                  1. Cinsiyetiniz
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {['Erkek', 'Kadın', 'Belirtmek istemiyorum'].map((option) => (
                    <label key={option} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={demographicData.gender === option}
                        onChange={handleInputChange}
                        style={{ height: "1.25rem", width: "1.25rem" }}
                      />
                      <span style={{ marginLeft: "0.75rem", color: "#374151" }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm" style={{ padding: "1.5rem" }}>
                <label className="block text-gray-900" style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
                  2. Yaşınız
                </label>
                <input
                  type="number"
                  name="age"
                  value={demographicData.age}
                  onChange={handleInputChange}
                  min="0"
                  max="120"
                  required
                  style={{ 
                    width: "100%", 
                    padding: "0.5rem 0.75rem", 
                    borderRadius: "0.5rem", 
                    border: "1px solid #d1d5db"
                  }}
                />
              </div>

              {/* Education */}
              <div className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm" style={{ padding: "1.5rem" }}>
                <label className="block text-gray-900" style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
                  3. Eğitim Durumunuz
                </label>
                <select
                  name="education"
                  value={demographicData.education}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: "100%", 
                    padding: "0.5rem 0.75rem", 
                    borderRadius: "0.5rem", 
                    border: "1px solid #d1d5db" 
                  }}
                >
                  <option value="">Seçiniz</option>
                  <option value="üniversite">Üniversite Öğrencisi</option>
                  <option value="yüksek lisans">Yüksek Lisans Öğrencisi</option>
                  <option value="doktora">Doktora Öğrencisi</option>
                </select>
              </div>

              {/* Department */}
              <div className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm" style={{ padding: "1.5rem" }}>
                <label className="block text-gray-900" style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
                  4. Bölümünüz
                </label>
                <input
                  type="text"
                  name="department"
                  value={demographicData.department}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: "100%", 
                    padding: "0.5rem 0.75rem", 
                    borderRadius: "0.5rem", 
                    border: "1px solid #d1d5db" 
                  }}
                />
              </div>

              {/* Year */}
              <div className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm" style={{ padding: "1.5rem" }}>
                <label className="block text-gray-900" style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
                  5. Sınıfınız
                </label>
                <select
                  name="year"
                  value={demographicData.year}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: "100%", 
                    padding: "0.5rem 0.75rem", 
                    borderRadius: "0.5rem", 
                    border: "1px solid #d1d5db" 
                  }}
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
              <div className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm" style={{ padding: "1.5rem" }}>
                <label className="block text-gray-900" style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
                  6. Medeni Durumunuz
                </label>
                <select
                  name="maritalStatus"
                  value={demographicData.maritalStatus}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: "100%", 
                    padding: "0.5rem 0.75rem", 
                    borderRadius: "0.5rem", 
                    border: "1px solid #d1d5db" 
                  }}
                >
                  <option value="">Seçiniz</option>
                  <option value="bekar">Bekar</option>
                  <option value="evli">Evli</option>
                  <option value="boşanmış">Boşanmış</option>
                </select>
              </div>

              {/* Employment Status */}
              <div className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm" style={{ padding: "1.5rem" }}>
                <label className="block text-gray-900" style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
                  7. Çalışma Durumunuz
                </label>
                <select
                  name="employmentStatus"
                  value={demographicData.employmentStatus}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: "100%", 
                    padding: "0.5rem 0.75rem", 
                    borderRadius: "0.5rem", 
                    border: "1px solid #d1d5db" 
                  }}
                >
                  <option value="">Seçiniz</option>
                  <option value="tam zamanlı">Tam Zamanlı Çalışıyorum</option>
                  <option value="yarı zamanlı">Yarı Zamanlı Çalışıyorum</option>
                  <option value="çalışmıyor">Çalışmıyorum</option>
                </select>
              </div>

              {/* Living Situation */}
              <div className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm" style={{ padding: "1.5rem" }}>
                <label className="block text-gray-900" style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
                  8. Şu an kimlerle yaşıyorsunuz? (Birden fazla seçenek işaretleyebilirsiniz)
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    'Ailemle',
                    'Tek başıma',
                    'Arkadaşımla/arkadaşlarımla',
                    'Yurtta kalıyorum',
                    'Diğer'
                  ].map((option) => (
                    <label key={option} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={demographicData.livingWith.includes(option)}
                        onChange={() => handleCheckboxChange(option)}
                        style={{ height: "1.25rem", width: "1.25rem", borderRadius: "0.25rem" }}
                      />
                      <span style={{ marginLeft: "0.75rem", color: "#374151" }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Longest Residence */}
              <div className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm" style={{ padding: "1.5rem" }}>
                <label className="block text-gray-900" style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
                  9. Yaşamınızın çoğunun geçtiği yer (en uzun yaşadığınız yer)?
                </label>
                <select
                  name="longestResidence"
                  value={demographicData.longestResidence}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: "100%", 
                    padding: "0.5rem 0.75rem", 
                    borderRadius: "0.5rem", 
                    border: "1px solid #d1d5db" 
                  }}
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
              <div className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm" style={{ padding: "1.5rem" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label className="block text-gray-900" style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
                    10. Şu anki yaşamınızda kendinizi aşağıdaki merdivende nereye yerleştirirsiniz?
                  </label>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
                    En üst (10) en iyi koşullara, en alt (1) en kötü koşullara sahip olanları temsil eder.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", padding: "1rem 0" }}>
                    <div style={{ border: "1px solid #d1d5db", padding: "0.5rem", backgroundColor: "white" }}>
                      <Image
                        src="/images/ladder.png"
                        alt="Social Status Ladder"
                        width={200}
                        height={300}
                      />
                    </div>
                  </div>
                  <input
                    type="number"
                    name="currentSocialStatus"
                    value={demographicData.currentSocialStatus}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    required
                    style={{ 
                      width: "100%", 
                      padding: "0.5rem 0.75rem", 
                      borderRadius: "0.5rem", 
                      border: "1px solid #d1d5db" 
                    }}
                  />
                </div>

                <div>
                  <label className="block text-gray-900" style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
                    11. Çocukluk dönemindeki yaşantınızı göz önünde bulundurduğunuzda içinde bulunduğunuz aileyi bu merdivende nereye yerleştirirsiniz?
                  </label>
                  <input
                    type="number"
                    name="childhoodSocialStatus"
                    value={demographicData.childhoodSocialStatus}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    required
                    style={{ 
                      width: "100%", 
                      padding: "0.5rem 0.75rem", 
                      borderRadius: "0.5rem", 
                      border: "1px solid #d1d5db" 
                    }}
                  />
                </div>
              </div>

              {/* Monthly Income */}
              <div className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm" style={{ padding: "1.5rem" }}>
                <label className="block text-gray-900" style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
                  12. Ailenizin/hanenizin aylık gelirini asgari ücret üzerinden tanımlayacak olsanız aşağıdakilerden hangisi sizin için uygun olur?
                </label>
                <select
                  name="monthlyIncome"
                  value={demographicData.monthlyIncome}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: "100%", 
                    padding: "0.5rem 0.75rem", 
                    borderRadius: "0.5rem", 
                    border: "1px solid #d1d5db" 
                  }}
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
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-gray-50 border-t border-gray-200" style={{ padding: "1.5rem 2rem" }}>
            <button
              type="submit"
              className="bg-blue-600 text-white"
              disabled={isSubmitting}
              style={{ 
                width: "100%",
                display: "flex",
                justifyContent: "center",
                padding: "1rem",
                borderRadius: "0.75rem",
                fontWeight: "600",
                fontSize: "1.125rem",
                border: "transparent",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                transition: "background-color 0.2s",
                opacity: isSubmitting ? 0.7 : 1
              }}
              onMouseOver={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#1d4ed8")}
              onMouseOut={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#2563eb")}
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Devam Et'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 