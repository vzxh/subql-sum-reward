import { SubstrateEvent } from "@subql/types";
import { StakingReward, StakingSlash } from "../types";
import { Balance } from "@polkadot/types/interfaces";

export async function handleStakingRecorded(
  event: SubstrateEvent
): Promise<void> {
  handleStakingRecord(event);
}

export async function handleStakingRecord(
  event: SubstrateEvent
): Promise<void> {
  const {
    event: {
      data: [account, newReward],
    },
  } = event;
  const entity = new StakingReward(
    event.block.block.header.number + "-" + event.idx
  );
  entity.accountId = account.toString();
  entity.balance = (newReward as Balance).toBigInt();
  entity.date = event.block.timestamp;

  await entity.save();
}

export async function handleStakingSlash(event: SubstrateEvent): Promise<void> {
  const {
    event: {
      data: [account, newSlash],
    },
  } = event;

  const entity = new StakingSlash(
    event.block.block.header.number + "-" + event.idx
  );
  entity.accountId = account.toString();
  entity.balance = (newSlash as Balance).toBigInt();
  entity.date = event.block.timestamp;

  await entity.save();
}
