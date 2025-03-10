import { ChainId, Token } from '@clonedex/core-sdk'
import { getAddress } from '@ethersproject/address'
import { CurrencyLogo } from 'app/components/CurrencyLogo'
import DoubleCurrencyLogo from 'app/components/DoubleLogo'
import Typography from 'app/components/Typography'
import UserTable from 'app/features/analytics/farms/user/UserTable'
import FormattedChartCard from 'app/features/analytics/FormattedChartCard'
import useFarmRewardHistories from 'app/features/analytics/hooks/useFarmRewardHistories'
import useFarmRewardsWithUsers from 'app/features/analytics/hooks/useFarmRewardsWithUsers'
import { formatNumber, formatPercent } from 'app/functions'
import { TridentBody, TridentHeader } from 'app/layouts/Trident'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import React, { useMemo } from 'react'

const chartTimespans = [
  {
    text: '1W',
    length: 604800,
  },
  {
    text: '1M',
    length: 2629746,
  },
  {
    text: '1Y',
    length: 31556952,
  },
  {
    text: 'ALL',
    length: Infinity,
  },
]

export default function Pool() {
  const router = useRouter()
  const id = (router.query.id as string).toLowerCase()
  const chainId = Number(router.query.chainId)

  const farms = useFarmRewardsWithUsers({ chainId, variables: { where: { pair: id } } })

  const farm = farms.find((farm) => farm.pair.id === id)
  const farmHistories = useFarmRewardHistories({ chainId, variables: { where: { pool: farm?.id } } })

  // For the charts
  const chartData = useMemo(
    () => ({
      rewardAprPerYear: farm?.rewardAprPerYear,
      rewardAprPerYearChange:
        farmHistories.length > 1
          ? farmHistories[farmHistories.length - 1].rewardAprPerYear -
            farmHistories[farmHistories.length - 2].rewardAprPerYear
          : 0,
      rewardAprPerYearChart: farmHistories
        // @ts-ignore TYPE NEEDS FIXING
        .map((day) => ({ x: new Date(day.timestamp * 1000), y: Number(day.rewardAprPerYear) })),

      userCount: farm?.userCount,
      userCountChange:
        farmHistories.length > 1 && farmHistories[farmHistories.length - 1].userCount > 0
          ? ((farmHistories[farmHistories.length - 1].userCount - farmHistories[farmHistories.length - 2].userCount) /
              farmHistories[farmHistories.length - 2].userCount) *
            100
          : 0,
      userCountChart: farmHistories
        // @ts-ignore TYPE NEEDS FIXING
        .map((day) => ({ x: new Date(day.timestamp * 1000), y: Number(day.userCount) })),
    }),
    [farmHistories, farm]
  )

  if (!farm) return <></>

  const token0 = new Token(
    chainId,
    getAddress(farm?.pair?.token0?.id),
    Number(farm?.pair?.token0?.decimals) || 18,
    farm?.pair?.token0?.symbol,
    farm?.pair?.token0?.name
  )

  const token1 = new Token(
    chainId,
    getAddress(farm?.pair?.token1?.id),
    Number(farm?.pair?.token1?.decimals) || 18,
    farm?.pair?.token1?.symbol,
    farm?.pair?.token0?.name
  )

  return (
    <>
      <NextSeo title={`${token0?.symbol}/${token1?.symbol} Analytics`} />
      <TridentHeader className="sm:!flex-row justify-between items-center" pattern="bg-bubble">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <DoubleCurrencyLogo className="rounded-full" currency0={token0} currency1={token1} size={60} />
            <Typography variant="h2" className="text-high-emphesis" weight={700}>
              {token0 && token1 && (
                <>
                  <Link
                    href={{
                      pathname: `/analytics/tokens/${token0?.address}`,
                      query: {
                        chainId,
                      },
                    }}
                  >
                    {token0?.symbol}
                  </Link>
                  /
                  <Link
                    href={{
                      pathname: `/analytics/tokens/${token1?.address}`,
                      query: {
                        chainId,
                      },
                    }}
                  >
                    {token1?.symbol}
                  </Link>
                </>
              )}
            </Typography>
          </div>
          <Typography variant="sm" weight={400}>
            {token0 && token1 && (
              <>
                Dive deeper in the analytics of {token0?.symbol}/{token1?.symbol}.
              </>
            )}
          </Typography>
        </div>
        <div className="flex flex-row space-x-8">
          <div className="flex flex-col">
            <div className="text-secondary">TVL</div>
            <div className="flex items-center space-x-2">
              <div className="text-xl font-medium text-high-emphesis">{formatNumber(farm?.tvl ?? 0, true)}</div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-secondary">Value</div>
            <div className="flex items-center space-x-2">
              <div className="text-xl font-medium text-high-emphesis">
                {formatNumber(farm?.pair.reserveUSD / farm?.pair.totalSupply, true)}
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-secondary">Rewards</div>
            <div className="flex items-center space-x-2">
              {farm?.rewards?.map((reward: any, i: number) => (
                <div className="flex items-center gap-1 text-xl font-medium text-high-emphesis" key={i}>
                  <span>{formatNumber(reward.rewardPerDay)}</span>
                  <CurrencyLogo currency={reward.currency} size={20} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-secondary">Reward APR</div>
            <div className="flex items-center space-x-2">
              <div className="text-xl font-medium text-high-emphesis">
                {farm?.tvl !== 0
                  ? farm?.rewardAprPerYear > 100
                    ? '>10,000%'
                    : formatPercent(farm?.rewardAprPerYear * 100)
                  : 'Infinite'}
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-secondary">Fee APY</div>
            <div className="flex items-center space-x-2">
              <div className="text-xl font-medium text-high-emphesis">
                {farm?.tvl !== 0
                  ? farm?.feeApyPerYear > 100
                    ? '>10,000%'
                    : formatPercent(farm?.feeApyPerYear * 100)
                  : 'Infinite'}
              </div>
            </div>
          </div>
        </div>
      </TridentHeader>
      <TridentBody>
        <div className="grid grid-cols-1 gap-4">
          <FormattedChartCard
            header="Users"
            subheader={`${token0?.symbol}/${token1?.symbol}`}
            figure={chartData.userCount}
            change={chartData.userCountChange}
            chart={chartData.userCountChart}
            defaultTimespan="1M"
            timespans={chartTimespans}
          />
        </div>
        <Typography variant="h3" weight={700}>
          Liquidity Providers
        </Typography>
        <UserTable chainId={chainId || ChainId.ETHEREUM} users={farm ? farm.users : []} />
      </TridentBody>
    </>
  )
}
