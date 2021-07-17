export default function getRandomHumanPosition() {
  const arrNumberPosition = [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57];
  const uniqueNumber = arrNumberPosition.reduce((set) => {
    const randomIndex = Math.trunc((Math.random() * arrNumberPosition.length));
    set.add(arrNumberPosition[randomIndex]);
    return set;
  }, new Set());
  return [...uniqueNumber.values()];
}
