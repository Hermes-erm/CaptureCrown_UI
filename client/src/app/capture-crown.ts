import { Euler } from 'three';

export interface PayLoad {
  name: string;
  pose: {
    x: number;
    y: number;
    z: number;
    angle: Euler;
  };
  color: string;
}

export interface Message {
  name: string;
  message: string;
}
