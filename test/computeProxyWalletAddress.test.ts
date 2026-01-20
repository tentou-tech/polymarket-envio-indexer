import { describe, it, expect } from "vitest";
import { computeProxyWalletAddressFromInputs } from "../src/common/utils/computeProxyWalletAddress";
import { keccak256 } from "viem";

describe("computeProxyWalletAddress", () => {
  it("should compute the correct proxy wallet address", () => {
    const factory: `0x${string}` = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";

    const salt: `0x${string}` =
      "0x7c5ea36004851c764c44143b1dcb59679b11c9a68e5f41497f6cf3d480715331";

    const initCodeHash: `0x${string}` = keccak256(
      "0x6394198df16000526103ff60206004601c335afa6040516060f3",
    );
    const computedAddress = computeProxyWalletAddressFromInputs(
      factory,
      salt,
      initCodeHash,
    );

    console.log("Computed Address:", computedAddress);

    expect(computedAddress).toBe(
      "0x533ae9d683B10C02EbDb05471642F85230071FC3".toLowerCase(),
    );
  });
});
