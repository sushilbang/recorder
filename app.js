document.addEventListener("DOMContentLoaded", () => {
  const preview = document.getElementById("preview");
  const captionsEl = document.getElementById("captions");

  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const downloadVideoBtn = document.getElementById("downloadVideoBtn");
  const downloadTextBtn = document.getElementById("downloadTextBtn");
  const readBtn = document.getElementById("readBtn");

  const recorder = new window.TabRecorder(preview);
  const captions = new window.LiveCaptions(captionsEl, "en-US");

  let recordedBlob = null;

  async function finalizeRecording() {
    const blob = await recorder.stop();
    if (!blob) return;

    recordedBlob = blob;

    const videoURL = URL.createObjectURL(recordedBlob);

    preview.srcObject = null;
    preview.src = videoURL;
    preview.controls = true;
    preview.play();

    stopBtn.disabled = true;
    startBtn.disabled = false;
    downloadVideoBtn.disabled = false;
    downloadTextBtn.disabled = false;
    readBtn.disabled = false;

    captions.stop();
  }

  startBtn.onclick = async () => {
    await recorder.start(finalizeRecording);
    captions.start();

    preview.controls = false;

    startBtn.disabled = true;
    stopBtn.disabled = false;
    downloadVideoBtn.disabled = true;
    downloadTextBtn.disabled = true;
    readBtn.disabled = true;
  };

  stopBtn.onclick = finalizeRecording;

  downloadVideoBtn.onclick = () => {
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recording.webm";
    a.click();
    URL.revokeObjectURL(url);
  };

  downloadTextBtn.onclick = () => {
    captions.downloadText("captions.txt");
  };

  readBtn.onclick = () => {
    captions.speakAll();
  };
});