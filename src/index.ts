function strictText(value: string, max = 16384): void {
  if (typeof value !== 'string') throw new TypeError('Expected string');
  if (value.length > max) throw new RangeError('Text length budget exceeded');
}
function bytes(v: Uint8Array, max = 1048576): void {
  if (!(v instanceof Uint8Array)) throw new TypeError('Expected Uint8Array');
  if (v.length > max) throw new RangeError('Byte budget exceeded');
}
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export function encode(input: Uint8Array): string {
  bytes(input, 4096);
  if (!input.length) return '';
  let zeros = 0;
  while (zeros < input.length && input[zeros] === 0) zeros++;
  const digits: number[] = [];
  for (let i = zeros; i < input.length; i++) {
    let carry = input[i]!;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j]! * 256;
      digits[j] = carry % alphabet.length;
      carry = Math.floor(carry / alphabet.length);
    }
    while (carry) {
      digits.push(carry % alphabet.length);
      carry = Math.floor(carry / alphabet.length);
    }
  }
  return (
    alphabet[0]!.repeat(zeros) +
    digits
      .reverse()
      .map((d) => alphabet[d])
      .join('')
  );
}
export function decode(text: string): Uint8Array {
  strictText(text, 8192);
  if (!text) return new Uint8Array();
  let zeros = 0;
  while (zeros < text.length && text[zeros] === alphabet[0]) zeros++;
  const out: number[] = [];
  for (let i = zeros; i < text.length; i++) {
    let carry = alphabet.indexOf(text[i]!);
    if (carry < 0) throw new RangeError('Invalid alphabet character');
    for (let j = 0; j < out.length; j++) {
      carry += out[j]! * alphabet.length;
      out[j] = carry % 256;
      carry = Math.floor(carry / 256);
    }
    while (carry) {
      out.push(carry % 256);
      carry = Math.floor(carry / 256);
    }
    if (out.length + zeros > 4096) throw new RangeError('Decoded byte budget');
  }
  if (zeros > 4096) throw new RangeError('Decoded byte budget');
  const result = new Uint8Array(zeros + out.length);
  result.set(out.reverse(), zeros);
  return result;
}
