export function valueFormatter(number: number) {
  return new Intl.NumberFormat('us').format(number).toString();
}

export function getColor(index: number, alpha = 1) {
  const colors = [
    [75, 192, 192],
    [255, 99, 132],
    [54, 162, 235],
    [255, 206, 86],
    [153, 102, 255],
    [255, 159, 64],
  ];
  const [r, g, b] = colors[index % colors.length];
  return `rgba(${r},${g},${b},${alpha})`;
}
