export type LatestRequestHandle = {
  signal: AbortSignal;
  isCurrent: () => boolean;
};

/**
 * Koordiniert austauschbare asynchrone Adapter-Aufrufe.
 *
 * Ein neuer Aufruf bricht den vorherigen nach Möglichkeit ab. Die zusätzliche
 * Sequenzprüfung verhindert veraltete Zustandsupdates auch dann, wenn ein
 * später angebundener Adapter das AbortSignal nicht berücksichtigt.
 */
export class LatestRequestCoordinator {
  private sequence = 0;
  private controller: AbortController | undefined;

  begin(): LatestRequestHandle {
    this.controller?.abort();

    const sequence = ++this.sequence;
    const controller = new AbortController();
    this.controller = controller;

    return {
      signal: controller.signal,
      isCurrent: () => !controller.signal.aborted && sequence === this.sequence,
    };
  }

  cancel(): void {
    this.sequence += 1;
    this.controller?.abort();
    this.controller = undefined;
  }
}
