export const percentageToString = (percentage: number) => percentage
  .toFixed(2)
  .replace(/0?0$/, '')
  .replace(/\.$/, '');
