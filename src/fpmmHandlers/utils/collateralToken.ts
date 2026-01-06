import type { HandlerContext } from "generated";

export function getCollateralScale(
  collateralTokenId: string,
  context: HandlerContext
): BigInt {
  // TODO: fetch collateral token decimals from CollateralToken entity
  return BigInt(10 ** 18);
}
