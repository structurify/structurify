type GenerateRandomStringParams = {
  lowercase?: boolean;
  uppercase?: boolean;
  number?: boolean;
  special?: boolean;
};

export const generateRandomString = (
  length = 32,
  params: GenerateRandomStringParams = {
    lowercase: true,
    uppercase: false,
    number: true,
    special: false,
  },
) => {
  const { lowercase, uppercase, number, special } = params;
  if (!lowercase && !uppercase && !number && !special) {
    throw new Error('DEV ERROR - provide at least one true param');
  }

  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const num = '0123456789';
  const spec = '!"#$%&\'()*+,-./:;<=>?@[]^_`{|}~';

  const s = [
    lowercase ? lower : '',
    uppercase ? upper : '',
    number ? num : '',
    special ? spec : '',
  ].join('');

  const pickRandom = () => s[Math.floor(Math.random() * s.length)];

  return Array.from({ length }, pickRandom).join('');
};
