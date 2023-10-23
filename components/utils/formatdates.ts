const formatDate = (date: string) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(date);

  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
};

export default formatDate;
