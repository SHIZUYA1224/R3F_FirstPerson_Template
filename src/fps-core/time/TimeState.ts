export type TimeAPI = {
  getElapsed(): number;
  getDelta(): number;
  getFrame(): number;
};

export class TimeState implements TimeAPI {
  private elapsed = 0;
  private delta = 0;
  private frame = 0;

  update(delta: number) {
    this.delta = delta;
    this.elapsed += delta;
    this.frame += 1;
  }

  reset() {
    this.elapsed = 0;
    this.delta = 0;
    this.frame = 0;
  }

  getElapsed() {
    return this.elapsed;
  }

  getDelta() {
    return this.delta;
  }

  getFrame() {
    return this.frame;
  }
}
