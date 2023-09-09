export const randomInt = (opt: { min?: number; max?: number } = {}): number => {
  opt.min = opt.min ? opt.min : 0;
  opt.max = opt.max ? opt.max : opt.min + 1;
  const ukn = Math.random();
  return opt.min + Math.round(ukn * (opt.max - opt.min));
};

export const shuffledArray = <T>(array: T[]): T[] =>
  [...array].sort(() => Math.random() - 0.5);
