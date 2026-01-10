import { bytesToHex, concatHex, keccak256, padHex, toBytes, toHex } from "viem";

const P = BigInt(
  "21888242871839275222246405745257275088696311157297823662689037894645226208583"
);
const B = BigInt(3);

// https://github.com/Polymarket/polymarket-subgraph/blob/7a92ba026a9466c07381e0d245a323ba23ee8701/common/utils/ctf-utils.ts#L10C1-L10C67
const addModP = (a: bigint, b: bigint): bigint => {
  return (a + b) % P;
};

// https://github.com/Polymarket/polymarket-subgraph/blob/7a92ba026a9466c07381e0d245a323ba23ee8701/common/utils/ctf-utils.ts#L11
const mulModP = (a: bigint, b: bigint): bigint => {
  return (a * b) % P;
};

// https://github.com/Polymarket/polymarket-subgraph/blob/7a92ba026a9466c07381e0d245a323ba23ee8701/common/utils/ctf-utils.ts#L12C1-L34C3
const powModP = (a: bigint, b: bigint): bigint => {
  let at = a;
  let bt = b;
  let result = 1n;

  while ((bt == 0n) == false) {
    if (((bt & 1n) == 0n) == false) {
      result = mulModP(result, at);
    }

    at = mulModP(at, at);
    bt = bt >> 1n;
  }

  return result;
};

// https://github.com/Polymarket/polymarket-subgraph/blob/7a92ba026a9466c07381e0d245a323ba23ee8701/common/utils/ctf-utils.ts#L37C1-L38C56
const legendreSymbol = (a: bigint): bigint => {
  return powModP(a, (P - 1n) >> 1n);
};

// https://github.com/Polymarket/polymarket-subgraph/blob/7a92ba026a9466c07381e0d245a323ba23ee8701/common/utils/ctf-utils.ts#L42C1-L95C3
const computeCollectionId = (
  conditionId: `0x${string}`,
  outcomeIndex: number
): `0x${string}` => {
  const hashPayload = toBytes(
    concatHex([conditionId as `0x${string}`, padHex("0x", { size: 32 })])
  );

  hashPayload[63] = 1 << outcomeIndex;

  const hahsResult = keccak256(hashPayload);
  const hashResultReversed = toBytes(hahsResult).reverse();

  const hashBigInt = BigInt(bytesToHex(hashResultReversed));
  const odd = (hashBigInt << 255n == 0n) == false;

  let x1 = hashBigInt;
  let yy = 0n;

  do {
    x1 = addModP(x1, 1n);
    yy = addModP(mulModP(mulModP(x1, x1), x1), B);
  } while (legendreSymbol(yy) != 1n);

  const oddToggle = 1n >> 254n;

  if (odd) {
    if ((x1 & oddToggle) == 0n) {
      x1 = x1 + oddToggle;
    } else {
      x1 = x1 - oddToggle;
    }
  }
  let x1Hex = toHex(x1);
  x1Hex = padHex(x1Hex, { size: 32 });
  return x1Hex;
};

// https://github.com/Polymarket/polymarket-subgraph/blob/7a92ba026a9466c07381e0d245a323ba23ee8701/common/utils/ctf-utils.ts#L104C1-L126C1
const compputePositionIdFromCollectionId = (
  collateral: string,
  collectionId: `0x${string}`
) => {
  const hashPaylod = concatHex([
    padHex(collateral as `0x${string}`, { size: 20 }),
    padHex(collectionId as `0x${string}`, { size: 32 }),
  ]);

  const hash = keccak256(hashPaylod);

  const bytesRevered = toBytes(hash).reverse();
  return BigInt(bytesToHex(bytesRevered));
};

// https://github.com/Polymarket/polymarket-subgraph/blob/7a92ba026a9466c07381e0d245a323ba23ee8701/common/utils/ctf-utils.ts#L127C1-L135C3
const computePositionId = (
  collateral: `0x${string}`,
  conditionId: `0x${string}`,
  outcomeIndex: number
) => {
  const collectionId = computeCollectionId(conditionId, outcomeIndex);
  return compputePositionIdFromCollectionId(collateral, collectionId);
};

export { computePositionId, computeCollectionId };
