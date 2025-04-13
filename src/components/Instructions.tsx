"use client";

import { useAppContext } from '../contexts/AppContext';

interface InstructionsProps {
  title?: string;
  content: string;
  onContinue: () => void;
}

export default function Instructions({ title, content, onContinue }: InstructionsProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        {title && (
          <h1 className="text-2xl font-bold text-center text-red-600 mb-6">
            {title}
          </h1>
        )}
        
        <div className="text-red-600 text-lg font-medium mb-8 whitespace-pre-line">
          {content}
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={onContinue}
            className="bg-blue-600 text-white py-2 px-8 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}

export function PracticeInstructions({ onContinue }: { onContinue: () => void }) {
  return (
    <Instructions
      title="Deneme Uygulaması"
      content={`Şimdi bir deneme uygulaması yapacaksınız. Bu uygulama, ana uygulamaya başlamadan önce alıştırma yapmanız içindir.

Deneme uygulamasında, size karışık halde verilen kelime gruplarını kullanarak anlamlı cümleler oluşturacaksınız.
Her kelime grubundan BEŞ KELİME seçerek bir cümle oluşturun.

Kelimeler ekranda sadece belirli bir süre için görünecektir.
Süre dolduğunda kelimeler ekrandan silinecek ve yeni kelimelere geçilecektir.`}
      onContinue={onContinue}
    />
  );
}

export function MainInstructions({ onContinue }: { onContinue: () => void }) {
  return (
    <Instructions
      title="Ana Uygulama"
      content={`Deneme uygulaması tamamlandı. Şimdi ana uygulamaya geçiyoruz.

Ana uygulamada, kelimeler ekranda sadece belirli bir süre için görünecek.
Bu süre içinde BEŞ kelime seçerek anlamlı bir cümle oluşturmanız gerekiyor.
Süre dolduğunda kelimeler ekrandan silinecek ve yeni kelimelere geçilecek.

Lütfen olabildiğince hızlı ve doğru bir şekilde seçim yapmaya çalışın.`}
      onContinue={onContinue}
    />
  );
}

export function InitialInstructions({ onContinue }: { onContinue: () => void }) {
  return (
    <Instructions
      content={`Lütfen birazdan size karışık halde verilen kelime gruplarını okuyunuz.

Kelime grupları ALTI kelimeden oluşmaktadır; bu kelimelerden BEŞ TANESİNİ kullanarak anlamlı bir cümle oluşturunuz.
Cümleleri oluştururken (cümle anlamlı hale gelene kadar) herhangi bir yolu seçebilirsiniz.`}
      onContinue={onContinue}
    />
  );
} 