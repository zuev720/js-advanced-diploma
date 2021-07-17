export default function getRandomDemonPosition() {
  const arrNumberPosition = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
  const uniqueNumber = arrNumberPosition.reduce((set) => {
    const randomIndex = Math.trunc((Math.random() * arrNumberPosition.length));
    set.add(arrNumberPosition[randomIndex]);
    return set;
  }, new Set());
  return [...uniqueNumber.values()];
}
