export interface Param {
  name: string;
  type: string;
}

export interface FunctionDef {
  name: string;
  params: Param[];
  interface: string;
}

export interface AppState {
  selectedFunction: FunctionDef;
  inputValues: Record<string, string>;
  encodedData: string;
  error: string | null;
  isLoading: boolean;
}

export const functions: FunctionDef[] = [
  {
    name: "_setVotingDelay",
    params: [{ name: "newVotingDelay", type: "uint256" }],
    interface: "function _setVotingDelay(uint256 newVotingDelay)",
  },
  {
    name: "_setVotingPeriod",
    params: [{ name: "newVotingPeriod", type: "uint256" }],
    interface: "function _setVotingPeriod(uint256 newVotingPeriod)",
  },
  {
    name: "_setProposalThresholdBPS",
    params: [{ name: "newProposalThresholdBPS", type: "uint256" }],
    interface:
      "function _setProposalThresholdBPS(uint256 newProposalThresholdBPS)",
  },
  {
    name: "_setObjectionPeriodDurationInBlocks",
    params: [{ name: "newObjectionPeriodDurationInBlocks", type: "uint32" }],
    interface:
      "function _setObjectionPeriodDurationInBlocks(uint32 newObjectionPeriodDurationInBlocks)",
  },
  {
    name: "_setLastMinuteWindowInBlocks",
    params: [{ name: "newLastMinuteWindowInBlocks", type: "uint32" }],
    interface:
      "function _setLastMinuteWindowInBlocks(uint32 newLastMinuteWindowInBlocks)",
  },
  {
    name: "_setProposalUpdatablePeriodInBlocks",
    params: [{ name: "newProposalUpdatablePeriodInBlocks", type: "uint32" }],
    interface:
      "function _setProposalUpdatablePeriodInBlocks(uint32 newProposalUpdatablePeriodInBlocks)",
  },
  {
    name: "_setForkParams",
    params: [
      { name: "forkEscrow", type: "address" },
      { name: "forkDAODeployer", type: "address" },
      { name: "erc20TokensToIncludeInFork", type: "address[]" },
      { name: "forkPeriod", type: "uint256" },
      { name: "forkThresholdBPS", type: "uint256" },
    ],
    interface:
      "function _setForkParams(address forkEscrow, address forkDAODeployer, address[] calldata erc20TokensToIncludeInFork, uint256 forkPeriod, uint256 forkThresholdBPS)",
  },
  {
    name: "_setForkThresholdBPS",
    params: [{ name: "newForkThresholdBPS", type: "uint256" }],
    interface: "function _setForkThresholdBPS(uint256 newForkThresholdBPS)",
  },
  {
    name: "_setForkPeriod",
    params: [{ name: "newForkPeriod", type: "uint256" }],
    interface: "function _setForkPeriod(uint256 newForkPeriod)",
  },
  {
    name: "_setForkEscrow",
    params: [{ name: "newForkEscrow", type: "address" }],
    interface: "function _setForkEscrow(address newForkEscrow)",
  },
  {
    name: "_setErc20TokensToIncludeInFork",
    params: [{ name: "erc20tokens", type: "address[]" }],
    interface:
      "function _setErc20TokensToIncludeInFork(address[] calldata erc20tokens)",
  },
  {
    name: "_setMinQuorumVotesBPS",
    params: [{ name: "newMinQuorumVotesBPS", type: "uint16" }],
    interface: "function _setMinQuorumVotesBPS(uint16 newMinQuorumVotesBPS)",
  },
  {
    name: "_setMaxQuorumVotesBPS",
    params: [{ name: "newMaxQuorumVotesBPS", type: "uint16" }],
    interface: "function _setMaxQuorumVotesBPS(uint16 newMaxQuorumVotesBPS)",
  },
  {
    name: "_setQuorumCoefficient",
    params: [{ name: "newQuorumCoefficient", type: "uint32" }],
    interface: "function _setQuorumCoefficient(uint32 newQuorumCoefficient)",
  },
  {
    name: "_setDynamicQuorumParams",
    params: [
      { name: "newMinQuorumVotesBPS", type: "uint16" },
      { name: "newMaxQuorumVotesBPS", type: "uint16" },
      { name: "newQuorumCoefficient", type: "uint32" },
    ],
    interface:
      "function setDynamicQuorumParams(uint16 newMinQuorumVotesBPS, uint16 newMaxQuorumVotesBPS, uint32 newQuorumCoefficient)",
  },
];
