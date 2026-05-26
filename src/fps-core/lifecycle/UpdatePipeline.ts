export type UpdateStep = (delta: number) => void;

export class UpdatePipeline {
  private readonly steps: UpdateStep[] = [];

  add(step: UpdateStep) {
    this.steps.push(step);
    return () => {
      const index = this.steps.indexOf(step);
      if (index >= 0) {
        this.steps.splice(index, 1);
      }
    };
  }

  update(delta: number) {
    for (const step of this.steps) {
      step(delta);
    }
  }

  clear() {
    this.steps.length = 0;
  }
}
