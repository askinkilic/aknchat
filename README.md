# aknchat

Herkese açık bir chatbot. Backend Express ile Azure OpenAI'a proxy olur, frontend ise statik bir sayfadır.

## Kurulum
1. Node 18+ kurulu olmalı.
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. Ortam değişkenlerini ayarlayın:
   - `.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun.
   - Gerekli değişkenler:
     - `AZURE_OPENAI_ENDPOINT`
     - `AZURE_OPENAI_API_KEY`
     - `AZURE_OPENAI_DEPLOYMENT` (Azure'da model deployment adı)
     - `AZURE_OPENAI_API_VERSION` (opsiyonel)

## Geliştirme
```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresine gidin.

## Üretim
```bash
npm run start
```

## Notlar
- İlk etapta herkese açık. İleride üyelik eklenebilir.
- İstekler tarayıcıdan direkt Azure'a gitmez; sunucu üzerinden `/api/chat` ile proxy edilir.
