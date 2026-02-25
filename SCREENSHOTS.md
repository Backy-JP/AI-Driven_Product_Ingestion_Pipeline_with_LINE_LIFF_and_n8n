# 截圖放置說明

請將以下三張截圖放到 `screenshots` 資料夾中：

## 1. n8n 工作流程圖
- **檔案名稱**：`n8n-workflow.png`
- **位置**：`screenshots/n8n-workflow.png`
- **來源**：第一張圖片（n8n 工作流程介面）

## 2. LIFF 上傳介面
- **檔案名稱**：`liff-upload.png`
- **位置**：`screenshots/liff-upload.png`
- **來源**：第二張圖片（手機上傳商品照片的介面）

## 3. LINE 聊天室入口
- **檔案名稱**：`line-menu.png`
- **位置**：`screenshots/line-menu.png`
- **來源**：第三張圖片（LINE 聊天室的圖文選單）

## 放置步驟

```bash
# 在專案根目錄執行
mkdir -p screenshots

# 將三張圖片複製到 screenshots 資料夾
# 方式一：使用檔案管理員拖曳
# 方式二：使用指令
cp /path/to/your/n8n-workflow.png screenshots/
cp /path/to/your/liff-upload.png screenshots/
cp /path/to/your/line-menu.png screenshots/
```

## README 中的圖片位置

圖片已經在 README.md 的以下位置引用：

1. **LINE 聊天室入口**（第 68 行）：
   ```markdown
   ![LINE 聊天室入口](screenshots/line-menu.png)
   ```

2. **LIFF 上傳介面**（第 77 行）：
   ```markdown
   ![LIFF 上傳介面](screenshots/liff-upload.png)
   ```

3. **n8n 工作流程**（第 86 行）：
   ```markdown
   ![n8n 工作流程](screenshots/n8n-workflow.png)
   ```

放置完成後，圖片會自動顯示在 README 中！
