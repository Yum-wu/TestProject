require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
const ZHIPU_API_URL =
  "https://open.bigmodel.cn/api/paas/v4/audio/transcriptions";

if (!ZHIPU_API_KEY) {
  console.error("错误：未在 .env 文件中配置 ZHIPU_API_KEY");
  process.exit(1);
}

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "未收到音频文件" });
  }

  const streamMode = req.query.stream === "true";

  if (streamMode) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
  }

  try {
    const formData = new FormData();
    formData.append("model", "glm-asr-2512");
    formData.append(
      "file",
      new Blob([req.file.buffer], { type: req.file.mimetype || "audio/wav" }),
      req.file.originalname || "audio.wav",
    );
    formData.append("stream", streamMode);

    const response = await fetch(ZHIPU_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ZHIPU_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("智谱API错误:", response.status, errorText);
      if (streamMode) {
        res.write(`data: ${JSON.stringify({ error: errorText })}\n\n`);
        res.end();
      } else {
        return res.status(response.status).json({
          error: `语音识别服务错误 (${response.status})`,
          detail: errorText,
        });
      }
      return;
    }

    if (streamMode) {
      for await (const chunk of response.body) {
        const text = chunk.toString();
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            res.write(line + "\n");
          }
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } else {
      const result = await response.json();
      res.json(result);
    }
  } catch (error) {
    console.error("识别请求失败:", error);
    if (streamMode) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: "语音识别请求失败", detail: error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`语音识别应用服务器已启动: http://localhost:${PORT}`);
});
