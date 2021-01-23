/* eslint-disable prefer-const */
// import { log } from '@graphprotocol/graph-ts'
import { Geyser, UserReferrer, UserStaking, UserReferralStaking, UserStakingScore } from './types/schema'
import { Staked, Unstaked } from './types/Geyser/Geyser'
import { ReferrerUpdated } from './types/ReferrerBook/ReferrerBook'
import {
    GEYSER_ADDRESS,
    ZERO_BD,
    ZERO_BI,
    ONE_BI,
    ONE_18_BD,
    ADDRESS_ZERO,
    REFERRAL_SCORE_DIVIDER,
} from './helpers'
import { Address, BigDecimal, Bytes } from '@graphprotocol/graph-ts';

export function handleReferrerUpdated(event: ReferrerUpdated): void {
    let id = event.params.user.toHexString();
    let userRef = UserReferrer.load(id);
    if(userRef == null) {
        userRef = new UserReferrer(id);
        userRef.referrer = event.params.referrer;
        userRef.timestamp = event.params.timestampSec;
    }
    userRef.save()
}

const getUserStakingInst = (user: Address): UserStaking | null  => {
    let userStaking = UserStaking.load(user.toHexString())
    if(userStaking == null) {
        userStaking = new UserStaking(user.toHexString())
        userStaking.amount = ZERO_BD;
    }
    return userStaking;
}
const getUserStakingScoreInst = (user: Address): UserStakingScore | null  => {
    let userStakingScore = UserStakingScore.load(user.toHexString())
    if(userStakingScore == null) {
        userStakingScore = new UserStakingScore(user.toHexString())
        userStakingScore.amount = ZERO_BD;
        userStakingScore.staking = ZERO_BD;
        userStakingScore.refStaking = ZERO_BD;
    }
    return userStakingScore;
}
const getUserReferralStakingInst = (user: Address) : UserReferralStaking | null => {
    let userRefStaking = UserReferralStaking.load(user.toHexString())
    if(userRefStaking == null) {
        userRefStaking = new UserReferralStaking(user.toHexString())
        userRefStaking.amount = ZERO_BD;
    }
    return userRefStaking;
}

export function handleStaked(event: Staked): void {
    let geyser = Geyser.load(GEYSER_ADDRESS)
    if (geyser === null) {
        geyser = new Geyser(GEYSER_ADDRESS)
        geyser.totalLiquidity = ZERO_BD
        geyser.totalValidUsers = ZERO_BI
    }
    geyser.totalLiquidity = geyser.totalLiquidity.plus(event.params.amount.toBigDecimal().div(ONE_18_BD));
    geyser.save()

    let userStaking = getUserStakingInst(event.params.user);

    if(userStaking.amount.equals(ZERO_BD)) {
        geyser.totalValidUsers = geyser.totalValidUsers.plus(ONE_BI)
        geyser.save()
    }

    let amountBD = event.params.amount.toBigDecimal();
    userStaking.amount = userStaking.amount.plus(amountBD.div(ONE_18_BD))
    userStaking.save()

    let userStakingScore = getUserStakingScoreInst(event.params.user)
    userStakingScore.staking = userStaking.amount;
    userStakingScore.amount = userStakingScore.amount.plus(amountBD.div(ONE_18_BD))
    userStakingScore.save()
    
    let referrer: Address
    let ref = UserReferrer.load(event.params.user.toHexString())
    if(ref != null) {
        referrer = ref.referrer as Address
    } else {
        referrer =  event.params.referrer
    }
    
    if(referrer.toHexString() != ADDRESS_ZERO) {
        let userRefStaking = getUserReferralStakingInst(referrer)
        userRefStaking.amount = userRefStaking.amount.plus(amountBD.div(ONE_18_BD))
        userRefStaking.save()

        let referrerScore = getUserStakingScoreInst(referrer)
        referrerScore.amount = referrerScore.amount.plus(amountBD.div(REFERRAL_SCORE_DIVIDER).div(ONE_18_BD))
        referrerScore.refStaking = userRefStaking.amount;
        referrerScore.save()
    }
}

export function handleUnstaked(event: Unstaked): void {
    let geyser = Geyser.load(GEYSER_ADDRESS)
    geyser.totalLiquidity = geyser.totalLiquidity.minus(event.params.amount.toBigDecimal().div(ONE_18_BD));
    geyser.save()

    let userStaking = getUserStakingInst(event.params.user);
    let amountBD = event.params.amount.toBigDecimal();
    userStaking.amount = userStaking.amount.minus(amountBD.div(ONE_18_BD))
    userStaking.save()

    let userStakingScore = getUserStakingScoreInst(event.params.user)
    userStakingScore.staking = userStaking.amount;
    userStakingScore.amount = userStakingScore.amount.minus(amountBD.div(ONE_18_BD))
    userStakingScore.save()

    if(userStaking.amount.equals(ZERO_BD)) {
        geyser.totalValidUsers = geyser.totalValidUsers.minus(ONE_BI)
        geyser.save()
    }

    let ref = UserReferrer.load(event.params.user.toHexString())
    if(ref != null) {
        let referrer = ref.referrer as Address;
        let userRefStaking = getUserReferralStakingInst(referrer)
        userRefStaking.amount = userRefStaking.amount.minus(amountBD.div(ONE_18_BD))
        userRefStaking.save()

        let referrerScore = getUserStakingScoreInst(referrer)
        referrerScore.amount = referrerScore.amount.minus(amountBD.div(REFERRAL_SCORE_DIVIDER).div(ONE_18_BD))
        referrerScore.refStaking = userRefStaking.amount;
        referrerScore.save()
    }

    
}
