class LiveCaptions {
  constructor(outputElement, lang = "en-US") {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error("Speech Recognition not supported");
    }

    this.output = outputElement;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = lang;

    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const text = event.results[i][0].transcript.trim();
          this.appendText(text);
        }
      }
    };
  }

  appendText(text) {
    if (this.output.innerText.trim().length === 0) {
      this.output.innerText = text;
    } else {
      this.output.innerText += " " + text;
    }

    this.output.scrollTop = this.output.scrollHeight;
  }

  start() {
    this.output.innerText = "";
    this.recognition.start();
  }

  stop() {
    this.recognition.stop();
  }

  getText() {
    return this.output.innerText.trim();
  }

  downloadText(filename = "captions.txt") {
    const blob = new Blob([this.getText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  speakAll() {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(this.getText());
    window.speechSynthesis.speak(utterance);
  }
}

window.LiveCaptions = LiveCaptions;