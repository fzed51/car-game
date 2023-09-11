export const randomInt = (opt: { min?: number; max?: number } = {}): number => {
  return Math.floor(randomNumber({ ...opt, max: opt.max ? opt.max + 1 : 2 }));
};

export const randomNumber = (
  opt: { min?: number; max?: number } = {}
): number => {
  const ukn = Math.random();
  opt.min = opt.min ? opt.min : 0;
  opt.max = opt.max ? opt.max : opt.min + 1;
  const rnd = opt.min + ukn * (opt.max - opt.min);
  return rnd;
};

export const shuffledArray = <T>(array: T[]): T[] =>
  [...array].sort(() => Math.random() - 0.5);
