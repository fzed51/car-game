import { Segment } from "./geometrical";

export interface Boxable {
  getBox: () => Segment[];
}
