"use client";

import { useEffect, useRef, useState } from "react";

const RECORDER_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

function recorderMime(): string {
  return RECORDER_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

/* Browser dictation shared by the Company Brain doc editor and the founder
   questions: records from the microphone and hands the finished clip to
   onAudio as a File a server action can transcribe. */
export function useVoiceRecorder(onAudio: (audio: File) => void) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const liveRef = useRef(true);
  const onAudioRef = useRef(onAudio);

  useEffect(() => {
    onAudioRef.current = onAudio;
  }, [onAudio]);

  useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
      recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const stop = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
  };

  const start = async () => {
    if (recorderRef.current) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = recorderMime();
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        setRecording(false);
        recorderRef.current = null;
        stopTracks();
        if (!liveRef.current) return;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        if (blob.size < 200) {
          setError("Didn't catch that. Try speaking again.");
          return;
        }
        const ext = blob.type.includes("mp4") ? "m4a" : "webm";
        const type = (blob.type || "audio/webm").split(";")[0];
        onAudioRef.current(new File([blob], `voice.${ext}`, { type }));
      };
      recorderRef.current = recorder;
      recorder.start(250);
      setRecording(true);
    } catch (err) {
      stopTracks();
      const name = err instanceof DOMException ? err.name : "";
      setError(
        name === "NotAllowedError"
          ? "Microphone access is blocked. Allow it in the browser and try again."
          : "Couldn't start the microphone.",
      );
    }
  };

  return { recording, error, start, stop, clearError: () => setError(null) };
}
