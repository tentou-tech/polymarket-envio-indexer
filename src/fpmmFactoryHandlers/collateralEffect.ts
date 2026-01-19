import { createEffect, S } from "envio";
import { createPublicClient, erc20Abi, http } from "viem";
import { polygon } from "viem/chains";

export const getCollateralDetails = createEffect(
  {
    name: "getCollateralDetails",
    input: S.string,
    output: {
      name: S.string,
      symbol: S.string,
      decimal: S.number,
    },
    rateLimit: false,
    cache: true,
  },
  async ({ input, context }) => {
    const collateralDetails = {
      name: "",
      symbol: "",
      decimal: 0,
    };

    const client = createPublicClient({
      chain: polygon,
      transport: http(),
    });

    try {
      const results = await client.multicall({
        contracts: [
          {
            address: input as `0x${string}`,
            abi: erc20Abi,
            functionName: "name",
          },
          {
            address: input as `0x${string}`,
            abi: erc20Abi,
            functionName: "symbol",
          },
          {
            address: input as `0x${string}`,
            abi: erc20Abi,
            functionName: "decimals",
          },
        ],
      });

      const [nameRes, symbolRes, decimalsRes] = results;

      // check that ALL calls succeeded
      if (
        nameRes.status === "success" &&
        symbolRes.status === "success" &&
        decimalsRes.status === "success"
      ) {
        collateralDetails.name = nameRes.result ?? "";
        collateralDetails.symbol = symbolRes.result ?? "";
        collateralDetails.decimal = Number(decimalsRes.result ?? 0);
      }
    } catch (error) {
      context.log.error(
        `failed to fetch collateral token data for address ${input}: ${error}`,
      );
      return collateralDetails;
    }

    return collateralDetails;
  },
);
