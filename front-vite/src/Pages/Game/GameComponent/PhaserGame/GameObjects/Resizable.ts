export default interface Resizable {

  resize(old_width: number, old_height: number): void;

  show(): void;

  hide(): void;
}