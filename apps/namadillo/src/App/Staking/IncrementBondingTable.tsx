import { TableRow } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import { NamCurrency } from "App/Common/NamCurrency";
import { NamInput } from "App/Common/NamInput";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useValidatorTableSorting } from "hooks/useValidatorTableSorting";
import { twMerge } from "tailwind-merge";
import { Validator } from "types";
import { ValidatorCard } from "./ValidatorCard";
import { ValidatorsTable } from "./ValidatorsTable";

type IncrementBondingTableProps = {
  validators: Validator[];
  updatedAmountByAddress: Record<string, BigNumber>;
  stakedAmountByAddress: Record<string, BigNumber>;
  onChangeValidatorAmount: (validator: Validator, amount?: BigNumber) => void;
  resultsPerPage?: number;
};

export const IncrementBondingTable = ({
  validators,
  updatedAmountByAddress,
  stakedAmountByAddress,
  onChangeValidatorAmount,
  resultsPerPage = 100,
}: IncrementBondingTableProps): JSX.Element => {
  const { sortableColumns, sortedValidators } = useValidatorTableSorting({
    validators,
    stakedAmountByAddress,
  });

  const headers = [
    { children: "Validator" },
    "Amount to Stake",
    {
      children: (
        <div className="leading-tight">
          Stake{" "}
          <small className="block text-xs text-neutral-500">New Stake</small>
        </div>
      ),
      className: "text-right",
      ...sortableColumns["stakedAmount"],
    },
    {
      children: <div className="w-full text-right">Voting Power</div>,
      ...sortableColumns["votingPowerInNAM"],
    },
    {
      children: <div className="w-full text-right">Commission</div>,
      ...sortableColumns["commission"],
    },
  ];

  const renderRow = (validator: Validator): TableRow => {
    const stakedAmount =
      stakedAmountByAddress[validator.address] ?? new BigNumber(0);
    const amountToStake =
      updatedAmountByAddress[validator.address] ?? new BigNumber(0);
    const hasStakedAmount = stakedAmount.gt(0);
    const hasNewAmounts = amountToStake.gt(0);

    const newRow = {
      className: "",
      cells: [
        // Validator Alias + Avatar
        <ValidatorCard
          key={`increment-bonding-alias-${validator.address}`}
          validator={validator}
          hasStake={hasStakedAmount}
        />,

        // Amount Text input
        <div
          key={`increment-bonding-new-amounts-${validator.address}`}
          className="relative min-w-[24ch]"
        >
          <NamInput
            placeholder="Select to increase stake"
            className={twMerge(
              clsx("[&_input]:border-neutral-500 [&_input]:py-2 [&>div]:my-0", {
                "[&_input]:border-yellow": hasNewAmounts,
              })
            )}
            value={updatedAmountByAddress[validator.address]}
            onChange={(e) => onChangeValidatorAmount(validator, e.target.value)}
            data-validator-input={validator.address}
          />
          <span
            className={clsx(
              "absolute flex items-center right-2 top-[0.6em]",
              "text-neutral-500 text-sm"
            )}
          >
            NAM
          </span>
        </div>,

        // Current Stake / New Stake
        <div
          key={`increment-bonding-current-stake`}
          className="text-right leading-tight min-w-[12ch]"
        >
          <span className="block">
            <NamCurrency amount={stakedAmount ?? 0} />
          </span>
          {hasNewAmounts && (
            <span
              className={clsx("text-neutral-500 text-sm", {
                "text-yellow": hasNewAmounts,
              })}
            >
              <NamCurrency amount={amountToStake.plus(stakedAmount)} />
            </span>
          )}
        </div>,

        // Voting Power
        <div
          className="flex flex-col text-right leading-tight"
          key={`validator-voting-power-${validator.address}`}
        >
          {validator.votingPowerInNAM && (
            <NamCurrency
              amount={validator.votingPowerInNAM}
              forceBalanceDisplay
            />
          )}
          <span className="text-neutral-600 text-sm">
            {formatPercentage(BigNumber(validator.votingPowerPercentage || 0))}
          </span>
        </div>,

        // Commission
        <div
          key={`commission-${validator.uuid}`}
          className="text-right leading-tight"
        >
          {formatPercentage(validator.commission)}
        </div>,
      ],
    };

    return newRow;
  };

  return (
    <ValidatorsTable
      id="increment-bonding-table"
      tableClassName="flex-1 overflow-auto mt-2"
      validatorList={sortedValidators}
      updatedAmountByAddress={updatedAmountByAddress}
      headers={headers}
      renderRow={renderRow}
      resultsPerPage={resultsPerPage}
    />
  );
};
