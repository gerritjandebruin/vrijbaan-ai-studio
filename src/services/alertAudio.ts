/**
 * Audio- en Trilsignaal Service voor Vrijbaan
 * Geeft een subtiele, zachte waarschuwingstoon en haptische trilling
 * bij het naderen (binnen 1 km) van een acuut rood kruis of AID-filekop (50 met knipperlichten).
 */

class AlertAudioService {
  private audioCtx: AudioContext | null = null;
  private alertedItems = new Set<string>();

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Speelt een zachte, dubbele attentietoon (D5 -> A5) en activeert haptische feedback
   */
  public playWarningChime() {
    // 1. Haptische feedback (Android / ondersteunde toestellen)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 60, 120]);
      } catch {}
    }

    // 2. Subtiele, zachte synthesizertoon via Web Audio API
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Toon 1: 587 Hz (D5) - warm en zacht
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.18);

      // Toon 2: 880 Hz (A5) - lichte alert toon
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.14);

      gain2.gain.setValueAtTime(0, now + 0.14);
      gain2.gain.linearRampToValueAtTime(0.22, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.14);
      osc2.stop(now + 0.40);
    } catch {}
  }

  /**
   * Controleert of we een acuut portaal (rood kruis of knipperende 50) of filekop naderen
   * en geeft hooguit één waarschuwing per locatie binnen 1 km.
   */
  public checkAndTriggerApproachingAlert(
    items: Array<{ id: string; distanceMeters: number; dotColor: string }>,
    enabled: boolean
  ) {
    if (!enabled) return;

    for (const item of items) {
      // Waarschuwing als item binnen 1000m (1 km) en rood (rood kruis, AID 50 of file)
      if (item.dotColor === 'red' && item.distanceMeters <= 1000 && item.distanceMeters >= 50) {
        if (!this.alertedItems.has(item.id)) {
          this.alertedItems.add(item.id);
          this.playWarningChime();
          break;
        }
      }
    }
  }

  public resetAlertHistory() {
    this.alertedItems.clear();
  }
}

export const alertAudioService = new AlertAudioService();
