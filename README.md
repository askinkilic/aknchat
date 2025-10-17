# 🤖 AKNCHAT# 💬 aknchat# aknchat



<div align="center">

  <img src="public/logo.svg" alt="AKNCHAT Logo" width="120" height="120" />

  <p><strong>Ultra-modern AI chatbot powered by Azure OpenAI</strong></p>Ultra-modern AI chatbot powered by Azure OpenAI with glassmorphism design.Herkese açık bir chatbot. Backend Express ile Azure OpenAI'a proxy olur, frontend ise statik bir sayfadır.

  <p>Microsoft Copilot tarzında, yeni nesil yapay zeka sohbet deneyimi</p>

</div>



---## ✨ Özellikler## Kurulum



## ✨ Özellikler1. Node 18+ kurulu olmalı.



- 🎨 **Microsoft Copilot Tasarımı** - Modern logo ve iç açıcı hoş geldin ekranı- 🎨 **Ultra-Modern Tasarım** - Glassmorphism ve gradient efektleri2. Bağımlılıkları yükleyin:

- 🌈 **Glassmorphism UI** - Bulanık cam efekti ve gradient arka planlar

- 🌓 **Açık/Koyu Tema** - Dinamik tema değiştirme- 🌓 **Açık/Koyu Tema** - Dinamik tema değiştirme   ```bash

- 🤖 **Azure OpenAI Entegrasyonu** - GPT-5 ve MODEL desteği

- 📸 **Görsel Analiz** - Resim yükleme ve paste desteği- 🤖 **Azure OpenAI Entegrasyonu** - GPT modelleriyle güçlendirilmiş   npm install

- 💾 **Session Yönetimi** - Numaralandırılmış sohbet geçmişi (#1, #2, #3...)

- 🗑️ **Sağ Tık Menüsü** - Kolay session silme özelliği- 📸 **Görsel Analiz** - Resim yükleme ve paste desteği   ```

- 📱 **Responsive Tasarım** - Mobil ve desktop uyumlu

- ⚡ **Smooth Animasyonlar** - Logo float, pulse, fade-in efektleri- 💾 **Session Yönetimi** - LocalStorage ile sohbet geçmişi3. Ortam değişkenlerini ayarlayın:

- 💡 **Örnek Sorular** - Hızlı başlangıç için hazır prompt butonları

- 🎯 **Sidebar Toggle** - Açılır/kapanır kenar çubuğu- 📱 **Responsive Tasarım** - Mobil ve desktop uyumlu   - `.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun.



## 🚀 Kurulum- ⚡ **Smooth Animasyonlar** - Modern geçiş efektleri   - Gerekli değişkenler:



1. **Node.js 18+ kurulu olmalı**     - `AZURE_OPENAI_ENDPOINT`



2. **Bağımlılıkları yükleyin:**## 🚀 Kurulum     - `AZURE_OPENAI_API_KEY`

   ```bash

   npm install     - `AZURE_OPENAI_DEPLOYMENT` (Azure'da model deployment adı)

   ```

### Gereksinimler     - `AZURE_OPENAI_API_VERSION` (opsiyonel)

3. **Ortam değişkenlerini ayarlayın:**

   - `.env.example` dosyasını `.env` olarak kopyalayın- Node.js 18 veya üzeri

   - Azure OpenAI bilgilerinizi doldurun:

     ```env- Azure OpenAI servisi ve API anahtarı## Geliştirme

     AZURE_OPENAI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/openai

     AZURE_OPENAI_API_KEY=your-api-key-here```bash

     AZURE_OPENAI_DEPLOYMENT=MODEL

     AZURE_OPENAI_API_VERSION=2025-01-01-preview### Adımlarnpm run dev

     ```

```

4. **Sunucuyu başlatın:**

   ```bash1. **Projeyi klonlayın:**

   npm start

   ```   ```bashTarayıcıda `http://localhost:3000` adresine gidin.



5. **Tarayıcıda açın:**   git clone https://github.com/askinkilic/aknchat.git

   ```

   http://localhost:3000   cd aknchat## Üretim

   ```

   ``````bash

## 🎨 Tasarım Özellikleri

npm run start

### Logo

- **SVG formatında** özel tasarlanmış AKNCHAT logosu2. **Bağımlılıkları yükleyin:**```

- **Microsoft Copilot tarzı** gradient ve sparkle efektleri

- **Neural network** konsepti ile AI temalı tasarım   ```bash

- **Animasyonlu** float ve pulse efektleri

   npm install## Notlar

### Hoş Geldin Ekranı

- 🧠 **4 özellik kartı** - Glassmorphism stilinde   ```- İlk etapta herkese açık. İleride üyelik eklenebilir.

- 💡 **Örnek sorular** - Hızlı başlatma butonları

- 🎭 **Animasyonlu giriş** - Fade-in ve scale efektleri- İstekler tarayıcıdan direkt Azure'a gitmez; sunucu üzerinden `/api/chat` ile proxy edilir.

- 📱 **Responsive** - Mobil cihazlarda optimize edilmiş

3. **Ortam değişkenlerini ayarlayın:**

### Tema Sistemi   ```bash

- **Açık Mod** - Beyaz ve pastel tonlar   cp .env.example .env

- **Koyu Mod** - Mor gradient arka planlar   ```

- **LocalStorage** - Tercih kaydedilir   

- **Smooth geçişler** - Tüm elementlerde   `.env` dosyasını düzenleyin ve şu değerleri ekleyin:

   - `AZURE_OPENAI_ENDPOINT` - Azure OpenAI endpoint URL'niz

## 📁 Proje Yapısı   - `AZURE_OPENAI_API_KEY` - Azure OpenAI API anahtarınız

   - `AZURE_OPENAI_DEPLOYMENT` - Model deployment adınız (örn: gpt-4, MODEL)

```   - `AZURE_OPENAI_API_VERSION` - API versiyonu (opsiyonel)

PROJE-CHATBOT/

├── public/## 🎯 Kullanım

│   ├── index.html          # Ana HTML (logo, hoş geldin ekranı)

│   ├── app.js              # Frontend mantığı (471 satır)### Geliştirme Modu

│   ├── styles.css          # Tüm stiller (1254 satır)```bash

│   └── logo.svg            # AKNCHAT logosu (yeni!)npm run dev

├── server.js               # Express + Azure OpenAI proxy```

├── package.json            # BağımlılıklarTarayıcıda `http://localhost:3000` adresine gidin.

├── .env                    # Ortam değişkenleri (git'de yok)

├── .env.example            # Örnek şablon### Üretim Modu

└── README.md               # Bu dosya```bash

```npm start

```

## 🔧 Teknolojiler

## 🏗️ Teknolojiler

**Backend:**

- Node.js + Express- **Backend:** Node.js + Express

- Azure OpenAI API (2025-01-01-preview)- **Frontend:** Vanilla JavaScript (ES6+)

- CORS, dotenv- **AI:** Azure OpenAI API

- **Styling:** CSS3 (Glassmorphism, Gradients, Animations)

**Frontend:**- **Storage:** LocalStorage

- Vanilla JavaScript (ES6+)

- CSS3 (Glassmorphism, Animations)## 📁 Proje Yapısı

- LocalStorage API

- SVG Graphics```

aknchat/

**Design:**├── public/

- Microsoft Copilot inspired│   ├── index.html      # Ana HTML dosyası

- Glassmorphism effects│   ├── app.js          # Frontend JavaScript

- Custom SVG logo│   └── styles.css      # Modern CSS tasarım

- Gradient backgrounds├── server.js           # Express sunucu & Azure proxy

- Smooth animations├── package.json        # Dependencies

├── .env.example        # Ortam değişkenleri şablonu

## 🎯 Kullanım└── README.md

```

1. **İlk mesaj** - Hoş geldin ekranından başlayın

2. **Örnek sorular** - Hızlı başlatma butonlarına tıklayın## 🎨 Özellikler Detay

3. **Kendi sorunuzu yazın** - Text alanına yazıp gönderin

4. **Resim ekleyin** - 📎 butonuyla veya Ctrl+V ile yapıştırın### Tema Desteği

5. **Session yönetimi** - Sağ tıklayarak sessionları silebilirsiniz- Koyu tema (varsayılan)

6. **Tema değiştirin** - Açık/Koyu butonuyla tema seçin- Açık tema

7. **Sidebar gizleyin** - ☰ butonuyla kenar çubuğunu kapatın- Otomatik kaydetme (LocalStorage)



## 🔒 Güvenlik### Mesaj Özellikleri

- Metin mesajları

- `.env` dosyası Git'de **izlenmez**- Resim yükleme (📎 butonu)

- API anahtarları **backend'de** saklanır- Paste ile resim ekleme

- Frontend'den **doğrudan API çağrısı yapılmaz**- Markdown desteği (kod, liste, vb.)

- CORS koruması aktif- Mesaj kopyalama



## 🌟 Yeni Eklenenler (v2.0)### Session Yönetimi

- Birden fazla sohbet oturumu

- ✅ **AKNCHAT Logosu** - SVG formatında custom logo- Otomatik başlık oluşturma

- ✅ **Hoş Geldin Ekranı** - İlk açılışta gösterilen özelliklerin yer aldığı ekran- Geçmiş silme

- ✅ **Örnek Sorular** - 4 adet hızlı başlatma butonu- LocalStorage ile kalıcılık

- ✅ **Özellik Kartları** - Glassmorphism stilinde 4 kart

- ✅ **Logo Animasyonları** - Float, pulse, entrance efektleri## 🔒 Güvenlik

- ✅ **Responsive İyileştirmeler** - Mobil cihazlar için optimize edilmiş hoş geldin ekranı

- ✅ **Brand Badge** - Header'da "AI" rozeti- API anahtarları `.env` dosyasında saklanır

- ✅ **Gelişmiş Tasarım** - Microsoft Copilot tarzında modern görünüm- `.gitignore` ile hassas bilgiler korunur

- CORS yapılandırması

## 🤝 Katkıda Bulunma- Input sanitization



1. Fork edin## 🤝 Katkıda Bulunma

2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)

3. Commit edin (`git commit -m 'Özellik: Harika özellik eklendi'`)1. Fork edin

4. Push edin (`git push origin feature/amazing-feature`)2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)

5. Pull Request açın3. Commit edin (`git commit -m 'Add amazing feature'`)

4. Push edin (`git push origin feature/amazing-feature`)

## 📝 Lisans5. Pull Request açın



Bu proje açık kaynaklıdır.## 📝 Lisans



## 👨‍💻 GeliştiriciBu proje MIT lisansı altındadır.



**Aşkın KILIÇ**## 👨‍💻 Yazar

- GitHub: [@askinkilic](https://github.com/askinkilic)

- Repository: [aknchat](https://github.com/askinkilic/aknchat)**Aşkın KILIÇ**

- GitHub: [@askinkilic](https://github.com/askinkilic)

---

## 🙏 Teşekkürler

<div align="center">

  <p>Made with ❤️ and Azure OpenAI</p>- Azure OpenAI

  <p>⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!</p>- Inter Font Family

</div>- Modern CSS Community


---

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!
