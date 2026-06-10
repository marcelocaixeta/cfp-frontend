const BECH32_ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const BECH32_GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
const BECH32_CHECKSUM = 1;
const BECH32M_CHECKSUM = 0x2bc830a3;
const LEGACY_ADDRESS_PATTERN = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;

function polymod(values: number[]) {
  let checksum = 1;

  values.forEach((value) => {
    const top = checksum >>> 25;
    checksum = ((checksum & 0x1ffffff) << 5) ^ value;

    BECH32_GENERATORS.forEach((generator, index) => {
      if ((top >>> index) & 1) {
        checksum ^= generator;
      }
    });
  });

  return checksum >>> 0;
}

function expandHrp(hrp: string) {
  return [
    ...Array.from(hrp, (character) => character.charCodeAt(0) >>> 5),
    0,
    ...Array.from(hrp, (character) => character.charCodeAt(0) & 31),
  ];
}

function isValidBech32Address(address: string) {
  if (address !== address.toLowerCase() && address !== address.toUpperCase()) {
    return false;
  }

  const normalizedAddress = address.toLowerCase();
  const separatorIndex = normalizedAddress.lastIndexOf('1');

  if (separatorIndex < 1 || separatorIndex + 7 > normalizedAddress.length) {
    return false;
  }

  const hrp = normalizedAddress.slice(0, separatorIndex);

  if (hrp !== 'bc') {
    return false;
  }

  const data = normalizedAddress
    .slice(separatorIndex + 1)
    .split('')
    .map((character) => BECH32_ALPHABET.indexOf(character));

  if (data.some((value) => value < 0)) {
    return false;
  }

  const checksum = polymod([...expandHrp(hrp), ...data]);

  return checksum === BECH32_CHECKSUM || checksum === BECH32M_CHECKSUM;
}

export function isValidBtcAddress(address: string) {
  const trimmedAddress = address.trim();

  if (!trimmedAddress) {
    return true;
  }

  if (trimmedAddress.length > 90) {
    return false;
  }

  if (trimmedAddress.toLowerCase().startsWith('bc1')) {
    return isValidBech32Address(trimmedAddress);
  }

  return LEGACY_ADDRESS_PATTERN.test(trimmedAddress);
}
