import { BigDecimal, FixedProductMarketMakerFactory } from "generated";
import type { FixedProductMarketMaker_t } from "generated/src/db/Entities.gen";

FixedProductMarketMakerFactory.FixedProductMarketMakerCreation.handler(
  async ({ event, context }) => {
    const {
      fixedProductMarketMaker,
      conditionalTokens,
      creator,
      collateralToken,
      fee,
      conditionIds,
    } = event.params;

    if (
      conditionalTokens !=
      "0x8c8BdBE59c1b3eB0DeC4E634F2C6bBaCa2Cd26B6".toLowerCase()
    ) {
      context.log.info(
        `cannot index market maker ${fixedProductMarketMaker}: using conditional tokens ${conditionalTokens}`
      );

      return;
    }

    let entity: FixedProductMarketMaker_t = {
      id: "",
      creator: "",
      creationTimestamp: 0,
      creationTransactionHash: "",
      collateralToken_id: "",
      conditionalTokenAddress: "",
      conditions: [],
      fee: BigInt(0),
      tradesQuantity: BigInt(0),
      buysQuantity: BigInt(0),
      sellsQuantity: BigInt(0),
      liquidityAddQuantity: BigInt(0),
      liquidityRemoveQuantity: BigInt(0),
      collateralVolume: BigInt(0),
      scaledCollateralVolume: BigDecimal(0),
      collateralBuyVolume: BigInt(0),
      scaledCollateralBuyVolume: BigDecimal(0),
      collateralSellVolume: BigInt(0),
      scaledCollateralSellVolume: BigDecimal(0),
      feeVolume: BigInt(0),
      scaledFeeVolume: BigDecimal(0),
      liquidityParameter: BigInt(0),
      scaledLiquidityParameter: BigDecimal(0),
      outcomeTokenAmounts: [],
      outcomeTokenPrices: [],
      outcomeSlotCount: undefined,
      lastActiveDay: 0,
      totalSupply: BigInt(0),
    };

    entity = {
      ...entity,
      id: fixedProductMarketMaker,
      creator: creator,
      creationTimestamp: event.block.timestamp,
      creationTransactionHash: event.transaction.hash,
      conditionalTokenAddress: conditionalTokens,
      collateralToken_id: collateralToken,
      fee: fee,
    };

    // check if collateral token exists if not do an external call to fetch its data
    const collateralTokenEntity = await context.Collateral.get(collateralToken);
    if (!collateralTokenEntity) {
      context.log.info(
        `collateral token ${collateralToken} not found for market maker ${fixedProductMarketMaker}, fetching data...`
      );
      // TODO: implement external call to fetch collateral token data
    }

    for (const conditionId of conditionIds) {
      const conditionEntity = await context.Condition.get(conditionId);
      if (!conditionEntity) {
        context.log.error(`
          failed to create market maker ${fixedProductMarketMaker}: condition ${conditionId} not found
        `);
        return;
      }
    }

    entity = {
      ...entity,
      conditions: conditionIds,
      outcomeSlotCount: conditionIds.length,
    };

    let outcomeTokenAmounts: bigint[] = new Array<bigint>(conditionIds.length);
    outcomeTokenAmounts = outcomeTokenAmounts.fill(0n);

    let outcomeTokenPrices: BigDecimal[] = new Array<BigDecimal>(
      conditionIds.length
    );
    outcomeTokenPrices = outcomeTokenPrices.fill(BigDecimal(0));

    entity = {
      ...entity,
      outcomeTokenAmounts: outcomeTokenAmounts,
      outcomeTokenPrices: outcomeTokenPrices,
      lastActiveDay: event.block.timestamp / 86400,
    };

    context.FixedProductMarketMaker.set(entity);
  }
);

FixedProductMarketMakerFactory.FixedProductMarketMakerCreation.contractRegister(
  ({ event, context }) => {
    context.addFixedProductMarketMaker(event.params.fixedProductMarketMaker);
  }
);
