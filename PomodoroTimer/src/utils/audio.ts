let audio: HTMLAudioElement | null = null;

export function playNotificationSound(): void {
  if (!audio) {
    audio = new Audio("/sounds/notification.mp3");
  }
  audio.currentTime = 0;
  audio.play().catch(() => {
    console.warn("无法播放提示音");
  });
}

export function stopNotificationSound(): void {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}
