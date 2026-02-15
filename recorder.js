class TabRecorder {
  constructor(previewElement) {
    this.preview = previewElement;
    this.mediaRecorder = null;
    this.chunks = [];
    this.stream = null;
    this.screenStream = null;
    this.micStream = null;
  }

  async start(onExternalStop) {
    this.screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });

    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    const combinedStream = new MediaStream([
      ...this.screenStream.getVideoTracks(),
      ...this.screenStream.getAudioTracks(),
      ...this.micStream.getAudioTracks()
    ]);

    this.stream = combinedStream;
    this.preview.srcObject = combinedStream;

    this.mediaRecorder = new MediaRecorder(combinedStream);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };

    this.screenStream.getVideoTracks()[0].onended = () => {
      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
      }
      if (onExternalStop) onExternalStop();
    };

    this.mediaRecorder.start();
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: "video/webm" });
        this.chunks = [];

        if (this.screenStream) {
          this.screenStream.getTracks().forEach(track => track.stop());
        }

        if (this.micStream) {
          this.micStream.getTracks().forEach(track => track.stop());
        }

        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }
}

window.TabRecorder = TabRecorder;