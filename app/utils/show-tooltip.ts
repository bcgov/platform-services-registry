export function showTooltip(setTooltipVisible: (value: boolean) => void): void {
  setTooltipVisible(true);
  setTimeout(() => {
    setTooltipVisible(false);
  }, 1000);
}
