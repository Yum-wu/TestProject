(function () {
  "use strict";

  const MAX_RECORDING_SECONDS = 60;
  const HISTORY_KEY = "voice_recognition_history";

  let isRecording = false;
  let audioBlob = null;
  let recordingTimer = null;
  let remainingSeconds = MAX_RECORDING_SECONDS;
  let audioContext = null;
  let mediaStream = null;
  let scriptProcessor = null;
  let recordedSamples = [];

  const recordBtn = document.getElementById("recordBtn");
  const timer = document.getElementById("timer");
  const statusText = document.getElementById("statusText");
  const recognizeSection = document.getElementById("recognizeSection");
  const recognizeBtn = document.getElementById("recognizeBtn");
  const recognizeBtnText = document.getElementById("recognizeBtnText");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const resultSection = document.getElementById("resultSection");
  const resultText = document.getElementById("resultText");
  const copyBtn = document.getElementById("copyBtn");
  const errorSection = document.getElementById("errorSection");
  const errorText = document.getElementById("errorText");
  const historyList = document.getElementById("historyList");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const pulseRing = document.querySelector(".pulse-ring");

  function init() {
    recordBtn.addEventListener("click", toggleRecording);
    recognizeBtn.addEventListener("click", recognizeAudio);
    copyBtn.addEventListener("click", copyResult);
    clearHistoryBtn.addEventListener("click", clearHistory);
    renderHistory();
  }

  async function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }

  async function startRecording() {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      audioContext = new (window.AudioContext || window.webkitAudioContext)();

      const source = audioContext.createMediaStreamSource(mediaStream);
      scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      recordedSamples = [];

      scriptProcessor.onaudioprocess = function (e) {
        if (isRecording) {
          const inputData = e.inputBuffer.getChannelData(0);
          recordedSamples.push(new Float32Array(inputData));
        }
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      isRecording = true;
      updateRecordingUI(true);
      startTimer();
    } catch (err) {
      console.error("麦克风访问失败:", err);
      showError("需要麦克风权限才能录音，请在浏览器设置中允许访问麦克风。");
    }
  }

  function stopRecording() {
    isRecording = false;

    const sampleRate = audioContext ? audioContext.sampleRate : 16000;

    if (scriptProcessor) {
      scriptProcessor.disconnect();
      scriptProcessor = null;
    }

    if (audioContext && audioContext.state !== "closed") {
      audioContext.close();
      audioContext = null;
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }

    clearInterval(recordingTimer);

    audioBlob = encodeWAV(recordedSamples, sampleRate);
    recordedSamples = [];

    updateRecordingUI(false);

    if (audioBlob && audioBlob.size > 0) {
      recognizeSection.style.display = "block";
      statusText.textContent = '录音完成，点击"开始识别"';
    } else {
      statusText.textContent = "录音失败，请重试";
    }
  }

  function encodeWAV(samples, sampleRate) {
    let totalLength = 0;
    for (let i = 0; i < samples.length; i++) {
      totalLength += samples[i].length;
    }

    const buffer = new ArrayBuffer(44 + totalLength * 2);
    const view = new DataView(buffer);

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + totalLength * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, totalLength * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const chunk = samples[i];
      for (let j = 0; j < chunk.length; j++) {
        const s = Math.max(-1, Math.min(1, chunk[j]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        offset += 2;
      }
    }

    return new Blob([buffer], { type: "audio/wav" });
  }

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  function startTimer() {
    remainingSeconds = MAX_RECORDING_SECONDS;
    timer.style.display = "block";
    timer.textContent = remainingSeconds;

    recordingTimer = setInterval(() => {
      remainingSeconds--;
      timer.textContent = remainingSeconds;

      if (remainingSeconds <= 0) {
        stopRecording();
      }
    }, 1000);
  }

  function updateRecordingUI(recording) {
    const btn = recordBtn;

    if (recording) {
      btn.classList.add("recording");
      pulseRing.classList.add("active");
      btn.innerHTML =
        '<svg class="stop-icon" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
      statusText.textContent = "正在录音...";
      recognizeSection.style.display = "none";
      resultSection.style.display = "none";
      errorSection.style.display = "none";
    } else {
      btn.classList.remove("recording");
      pulseRing.classList.remove("active");
      btn.innerHTML =
        '<svg class="mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
      timer.style.display = "none";
    }
  }

  async function recognizeAudio() {
    if (!audioBlob) {
      showError("没有录音数据，请先录音");
      return;
    }

    recognizeBtn.disabled = true;
    recognizeBtnText.textContent = "识别中...";
    loadingSpinner.style.display = "inline-block";
    errorSection.style.display = "none";

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.wav");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `请求失败 (${response.status})`);
      }

      const text = data.text || "";
      if (text.trim()) {
        resultText.textContent = text;
        resultSection.style.display = "block";
        saveToHistory(text);
        statusText.textContent = "识别完成";
      } else {
        showError("未能识别出语音内容，请重新录音尝试。");
      }
    } catch (err) {
      console.error("识别失败:", err);
      showError("语音识别失败: " + err.message);
    } finally {
      recognizeBtn.disabled = false;
      recognizeBtnText.textContent = "开始识别";
      loadingSpinner.style.display = "none";
    }
  }

  function showError(message) {
    errorText.textContent = message;
    errorSection.style.display = "block";
  }

  async function copyResult() {
    const text = resultText.textContent || resultText.innerText;
    if (!text.trim()) return;

    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "✅";
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.textContent = "📋";
        copyBtn.classList.remove("copied");
      }, 1500);
    } catch (err) {
      const range = document.createRange();
      range.selectNodeContents(resultText);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("copy");
      selection.removeAllRanges();
    }
  }

  function getHistory() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveToHistory(text) {
    const history = getHistory();
    history.unshift({
      id: Date.now(),
      text: text,
      time: new Date().toLocaleString("zh-CN"),
    });

    if (history.length > 50) {
      history.length = 50;
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
  }

  function deleteHistoryItem(id) {
    let history = getHistory();
    history = history.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
  }

  function clearHistory() {
    if (confirm("确定要清空所有识别历史吗？")) {
      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
    }
  }

  function renderHistory() {
    const history = getHistory();

    if (history.length === 0) {
      historyList.innerHTML = '<p class="empty-hint">暂无识别记录</p>';
      clearHistoryBtn.style.display = "none";
      return;
    }

    clearHistoryBtn.style.display = "inline-block";

    historyList.innerHTML = history
      .map(
        (item) => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-content">
                    <div class="history-text">${escapeHtml(item.text)}</div>
                    <div class="history-time">${item.time}</div>
                </div>
                <button class="history-delete" title="删除此记录" data-id="${item.id}">🗑️</button>
            </div>
        `,
      )
      .join("");

    historyList.querySelectorAll(".history-delete").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const id = parseInt(this.getAttribute("data-id"));
        deleteHistoryItem(id);
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  document.addEventListener("DOMContentLoaded", init);
})();
