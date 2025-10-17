# 💬 aknchat# aknchat



Ultra-modern AI chatbot powered by Azure OpenAI with glassmorphism design.Herkese açık bir chatbot. Backend Express ile Azure OpenAI'a proxy olur, frontend ise statik bir sayfadır.



## ✨ Özellikler## Kurulum

1. Node 18+ kurulu olmalı.

- 🎨 **Ultra-Modern Tasarım** - Glassmorphism ve gradient efektleri2. Bağımlılıkları yükleyin:

- 🌓 **Açık/Koyu Tema** - Dinamik tema değiştirme   ```bash

- 🤖 **Azure OpenAI Entegrasyonu** - GPT modelleriyle güçlendirilmiş   npm install

- 📸 **Görsel Analiz** - Resim yükleme ve paste desteği   ```

- 💾 **Session Yönetimi** - LocalStorage ile sohbet geçmişi3. Ortam değişkenlerini ayarlayın:

- 📱 **Responsive Tasarım** - Mobil ve desktop uyumlu   - `.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun.

- ⚡ **Smooth Animasyonlar** - Modern geçiş efektleri   - Gerekli değişkenler:

     - `AZURE_OPENAI_ENDPOINT`

## 🚀 Kurulum     - `AZURE_OPENAI_API_KEY`

     - `AZURE_OPENAI_DEPLOYMENT` (Azure'da model deployment adı)

### Gereksinimler     - `AZURE_OPENAI_API_VERSION` (opsiyonel)

- Node.js 18 veya üzeri

- Azure OpenAI servisi ve API anahtarı## Geliştirme

```bash

### Adımlarnpm run dev

```

1. **Projeyi klonlayın:**

   ```bashTarayıcıda `http://localhost:3000` adresine gidin.

   git clone https://github.com/askinkilic/aknchat.git

   cd aknchat## Üretim

   ``````bash

npm run start

2. **Bağımlılıkları yükleyin:**```

   ```bash

   npm install## Notlar

   ```- İlk etapta herkese açık. İleride üyelik eklenebilir.

- İstekler tarayıcıdan direkt Azure'a gitmez; sunucu üzerinden `/api/chat` ile proxy edilir.

3. **Ortam değişkenlerini ayarlayın:**
   ```bash
   cp .env.example .env
   ```
   
   `.env` dosyasını düzenleyin ve şu değerleri ekleyin:
   - `AZURE_OPENAI_ENDPOINT` - Azure OpenAI endpoint URL'niz
   - `AZURE_OPENAI_API_KEY` - Azure OpenAI API anahtarınız
   - `AZURE_OPENAI_DEPLOYMENT` - Model deployment adınız (örn: gpt-4, MODEL)
   - `AZURE_OPENAI_API_VERSION` - API versiyonu (opsiyonel)

## 🎯 Kullanım

### Geliştirme Modu
```bash
npm run dev
```
Tarayıcıda `http://localhost:3000` adresine gidin.

### Üretim Modu
```bash
npm start
```

## 🏗️ Teknolojiler

- **Backend:** Node.js + Express
- **Frontend:** Vanilla JavaScript (ES6+)
- **AI:** Azure OpenAI API
- **Styling:** CSS3 (Glassmorphism, Gradients, Animations)
- **Storage:** LocalStorage

## 📁 Proje Yapısı

```
aknchat/
├── public/
│   ├── index.html      # Ana HTML dosyası
│   ├── app.js          # Frontend JavaScript
│   └── styles.css      # Modern CSS tasarım
├── server.js           # Express sunucu & Azure proxy
├── package.json        # Dependencies
├── .env.example        # Ortam değişkenleri şablonu
└── README.md
```

## 🎨 Özellikler Detay

### Tema Desteği
- Koyu tema (varsayılan)
- Açık tema
- Otomatik kaydetme (LocalStorage)

### Mesaj Özellikleri
- Metin mesajları
- Resim yükleme (📎 butonu)
- Paste ile resim ekleme
- Markdown desteği (kod, liste, vb.)
- Mesaj kopyalama

### Session Yönetimi
- Birden fazla sohbet oturumu
- Otomatik başlık oluşturma
- Geçmiş silme
- LocalStorage ile kalıcılık

## 🔒 Güvenlik

- API anahtarları `.env` dosyasında saklanır
- `.gitignore` ile hassas bilgiler korunur
- CORS yapılandırması
- Input sanitization

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altındadır.

## 👨‍💻 Yazar

**Aşkın KILIÇ**
- GitHub: [@askinkilic](https://github.com/askinkilic)

## 🙏 Teşekkürler

- Azure OpenAI
- Inter Font Family
- Modern CSS Community

---

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!
