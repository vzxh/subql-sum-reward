import { SubstrateEvent } from "@subql/types";
import { NoBondRecordAccount, SumReward } from "../types";
import { Balance } from "@polkadot/types/interfaces";

function createSumReward(accountId: string): SumReward {
  const sumReward = new SumReward(accountId);
  sumReward.accountReward = BigInt(0);
  sumReward.accountSlash = BigInt(0);
  sumReward.accountTotal = BigInt(0);
  return sumReward;
}

export async function handleBond(event: SubstrateEvent): Promise<void> {
  const {
    event: {
      data: [account, balance],
    },
  } = event;

  const entity = await SumReward.get(account.toString());
  if (entity === undefined) {
    await createSumReward(account.toString()).save();
  }
}

export async function handleRewarded(event: SubstrateEvent): Promise<void> {
  handleReward(event);
}

export async function handleReward(event: SubstrateEvent): Promise<void> {
  const {
    event: {
      data: [account, newReward],
    },
  } = event;

  let entity = await SumReward.get(account.toString());
  if (entity === undefined) {
    const noBondRecordAccount = new NoBondRecordAccount(account.toString());
    noBondRecordAccount.firstRewardAt =
      event.block.block.header.number.toNumber();
    await noBondRecordAccount.save();

    entity = createSumReward(account.toString());
  }

  entity.accountReward =
    entity.accountReward + (newReward as Balance).toBigInt();
  entity.accountTotal = entity.accountReward - entity.accountSlash;

  await entity.save();
}

export async function handleSlashed(event: SubstrateEvent): Promise<void> {
  handleSlash(event);
}

export async function handleSlash(event: SubstrateEvent): Promise<void> {
  const {
    event: {
      data: [account, newSlash],
    },
  } = event;

  let entity = await SumReward.get(account.toString());
  if (entity === undefined) {
    const noBondRecordAccount = new NoBondRecordAccount(account.toString());
    noBondRecordAccount.firstRewardAt =
      event.block.block.header.number.toNumber();
    await noBondRecordAccount.save();

    entity = createSumReward(account.toString());
  }

  entity.accountSlash = entity.accountSlash + (newSlash as Balance).toBigInt();
  entity.accountTotal = entity.accountReward - entity.accountSlash;

  await entity.save();
}
