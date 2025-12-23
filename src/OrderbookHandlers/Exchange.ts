import { BigDecimal, Exchange, Orderbook, OrderFilledEvent } from "generated";

Exchange.OrderFilled.handler(async ({ event, context }) => {
  const {
    fee,
    maker,
    makerAmountFilled,
    makerAssetId,
    orderHash,
    taker,
    takerAmountFilled,
    takerAssetId,
  } = event.params;

  const timestamp = event.block.timestamp;
  const txHash = event.transaction.hash;

  let side = getOrderSide(makerAssetId);
  let size = getOrderSize(makerAmountFilled, takerAmountFilled, side);

  let collateralScaleDec = new BigDecimal(10).pow(6);

  let tokenId = "";
  if (side === "Buy") {
    tokenId = takerAssetId.toString();
  } else {
    tokenId = makerAssetId.toString();
  }

  // store order filled event

  const orderFilled: OrderFilledEvent = {
    id: `${txHash}_${orderHash}`,
    transactionHash: txHash,
    timestamp: timestamp,
    orderHash: orderHash,
    maker: maker,
    taker: taker,
    makerAssetId: makerAssetId.toString(),
    takerAssetId: takerAssetId.toString(),
    makerAmountFilled: makerAmountFilled,
    takerAmountFilled: takerAmountFilled,
    fee: fee,
  };

  context.OrderFilledEvent.set(orderFilled);

  // updating orderbook
  let orderBook: Orderbook = {
    id: tokenId,
    tradesQuantity: 0n,
    buysQuantity: 0n,
    sellsQuantity: 0n,

    collateralVolume: 0n,
    scaledCollateralVolume: BigDecimal(0),
    collateralBuyVolume: 0n,
    scaledCollateralBuyVolume: BigDecimal(0),
    collateralSellVolume: 0n,
    scaledCollateralSellVolume: BigDecimal(0),
  };

  const existingOrderBook = await context.Orderbook.getOrCreate(orderBook);

  // TODO: update voumes and trade quantities
});

const bigZero = BigInt(0);

function getOrderSide(makerAssetId: BigInt): string {
  return makerAssetId == bigZero ? "Buy" : "Sell";
}

function getOrderSize(
  makerAmountFilled: BigInt,
  takerAmountFilled: BigInt,
  side: string
): BigInt {
  return side === "Buy" ? makerAmountFilled : takerAmountFilled;
}
