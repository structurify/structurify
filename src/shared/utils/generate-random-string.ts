export type GenerateRandomStringParams = {
  lowercase?: boolean;
  uppercase?: boolean;
  number?: boolean;
  special?: boolean;
};

export const generateRandomString = (
  length = 32,
  {
    lowercase = true,
    uppercase = false,
    number = true,
    special = false,
  }: GenerateRandomStringParams = {},
) => {
  const charSets = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    num: '0123456789',
    spec: '!"#$%&\'()*+,-./:;<=>?@[]^_`{|}~',
  };

  const allChars =
    `${lowercase ? charSets.lower : ''}` +
    `${uppercase ? charSets.upper : ''}` +
    `${number ? charSets.num : ''}` +
    `${special ? charSets.spec : ''}`;

  if (!allChars.length) {
    throw new Error('DEV ERROR - provide at least one true param');
  }

  const pickRandom = () =>
    allChars[Math.floor(Math.random() * allChars.length)];

  return Array.from({ length }, pickRandom).join('');
};
