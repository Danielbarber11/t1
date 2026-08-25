// Audio playback utility supporting browser Web Speech API with configurable rate

export function speakText(
  text: string,
  langCode: string,
  onEnd?: () => void,
  rate: number = 1.0
) {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis is not supported in this browser.");
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel(); // Stop any ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);

  // Map ISO language code to BCP47 tag
  const langMap: Record<string, string> = {
    he: "he-IL",
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    ja: "ja-JP",
    ar: "ar-SA",
    ru: "ru-RU",
    zh: "zh-CN",
    pt: "pt-BR",
    ko: "ko-KR",
    nl: "nl-NL",
    tr: "tr-TR",
    hi: "hi-IN",
    el: "el-GR",
    sv: "sv-SE",
    pl: "pl-PL",
    uk: "uk-UA",
    th: "th-TH",
  };

  utterance.lang = langMap[langCode] || langCode;
  utterance.rate = rate || 1.0;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
