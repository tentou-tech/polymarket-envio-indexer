import { describe, it, expect } from "vitest";
import { computeNegRiskYesPrice } from "../src/conditionalTokensHandlers/utils";

describe("computeNegRiskYesPrice", () => {
  it("should compute the negRisk yes price 1", () => {
    const noPrice = BigInt(75_0000);
    const questionCount = 5;
    const noCount = 3;

    const yesPrice = computeNegRiskYesPrice(noPrice, noCount, questionCount);
    expect(yesPrice).toBe(BigInt(12_5000));
  });

  it("should compute the negRisk yes price 2", () => {
    const noPrice = BigInt(73_0000);
    const questionCount = 6;
    const noCount = 1;

    const yesPrice = computeNegRiskYesPrice(noPrice, noCount, questionCount);
    expect(yesPrice).toBe(BigInt(14_6000));
  });
});
