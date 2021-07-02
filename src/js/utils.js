export function calcTileType(index) {
  // TODO: write logic here
  const top = [1, 2, 3, 4, 5, 6];
  const right = [15, 23, 31, 39, 47, 55];
  const bottom = [57, 58, 59, 60, 61, 62];
  const left = [8, 16, 24, 32, 40, 48];
  if (index === 0) return 'top-left';
  if (index === 7) return 'top-right';
  if (index === 56) return 'bottom-left';
  if (index === 63) return 'bottom-right';
  if (top.includes(index)) return 'top';
  if (right.includes(index)) return 'right';
  if (bottom.includes(index)) return 'bottom';
  if (left.includes(index)) return 'left';
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
