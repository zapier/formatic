export function capitalize(string = '') {
  const [firstLetter] = string;
  return firstLetter.toUpperCase() + string.slice(1);
}

export function words(string = '') {
  return string.split(/(?=[A-Z])|_|-/);
}

export function startCase(string = '') {
  return words(string)
    .map(capitalize)
    .join(' ');
}
