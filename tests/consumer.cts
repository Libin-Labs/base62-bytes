import { encode, decode } from '@lp-labs/base62-bytes';
const bytes = new Uint8Array([62]);
if (decode(encode(bytes))[0] !== bytes[0]) throw new Error('Codec');
// @ts-expect-error invalid argument must be rejected by declarations
encode([1]);
