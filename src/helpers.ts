/* eslint-disable prefer-const */
import { log, BigInt, BigDecimal } from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const GEYSER_ADDRESS = '0xFa7461f07Be51F50c1A5c928b16E868E7b17Ed73'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let ONE_18_BD = BigDecimal.fromString('1000000000000000000')
export let BI_18 = BigInt.fromI32(18)

export let REFERRAL_SCORE_DIVIDER = BigDecimal.fromString('10')
