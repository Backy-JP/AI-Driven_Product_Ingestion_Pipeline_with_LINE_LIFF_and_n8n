# 環境變數設定說明

本專案需要設定以下環境變數與 API Keys。

## ⚠️ 安全提醒

**請勿將任何 API Keys 或密鑰提交到 Git！**

---

## 📝 需要設定的環境變數

### 1. Supabase 設定

在 Supabase Dashboard 取得：

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
BUCKET_NAME=Product_images
```

### 2. n8n Webhook

部署 n8n 後取得：

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxxxx
```

### 3. OpenAI API Key

在 [OpenAI Platform](https://platform.openai.com/api-keys) 取得：

```bash
OPENAI_API_KEY=sk-proj-...
```

**設定位置**：在 n8n 工作流程的 "OpenAI Tag Classifier" 節點中設定

### 4. LINE LIFF

在 [LINE Developers Console](https://developers.line.biz/console/) 取得：

```bash
LIFF_ID=2009156161-xxxxxxxx
LINE_CHANNEL_ACCESS_TOKEN=xxx...
```

---

## 🔧 設定方式

### Supabase Edge Functions

```bash
supabase secrets set N8N_WEBHOOK_URL=https://your-n8n.com/webhook/xxx
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### LIFF Frontend

編輯 `liff-product/index.html`：

```javascript
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";
await liff.init({ liffId: "your-liff-id" });
```

### n8n Workflow

1. 匯入 `n8n_LIFF_ProductCreateAPI.json`
2. 在 "OpenAI Tag Classifier" 節點設定 Authorization header：
   ```
   Bearer YOUR_OPENAI_API_KEY
   ```
3. 在 Supabase 節點設定連線資訊

---

## 📚 相關文件

- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [LINE LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [n8n Documentation](https://docs.n8n.io/)
