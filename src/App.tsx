import React, { useState, useCallback, useMemo } from "react";
import { encodeFunctionData, decodeFunctionData, parseAbiItem } from "viem";
import { AppState, functions } from "../utils";

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div
    className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
    role="alert"
  >
    {message}
  </div>
);

const Info = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Info</h3>

      <p className="mb-3 text-gray-600">
        As part of the{" "}
        <a
          href="https://nouns.wtf/vote/532"
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Client Incentives upgrade
        </a>
        , NounsDAOLogicV4 removed several governance paramater setting functions
        like{" "}
        <code className="bg-blue-100 px-1 rounded">
          _setProposalThresholdBPS
        </code>{" "}
        and <code className="bg-blue-100 px-1 rounded">_setVotingPeriod</code>{" "}
        from direct accessibility. These functions were simply made for
        convenience and pointed to a NounsDAOAdmin library which held the actual
        functions. To call these functions now, you need to pass encoded data
        representing them. A "fallback" function catches all calls that do not
        correspond to any functions in NounsDAOLogicV4 and sends them to the
        NounsDAOAdmin library for execution.
      </p>
      <h4 className="text-md font-medium mb-2 text-gray-700">
        Example: setProposalThresholdBPS to 10BPS
      </h4>
      <ul className="list-disc pl-5 space-y-4">
        <li className="text-gray-700">
          Obtain encoded calldata by selecting{""}{" "}
          <code className="bg-blue-100 px-1 rounded">
            _setProposalThresholdBPS
          </code>{" "}
          from the function dropdown, setting thresholdBPS to 10 and generating.
          <div className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded-md overflow-x-auto">
            <code className="text-sm text-gray-800">
              0x97d048e5000000000000000000000000000000000000000000000000000000000000000a
            </code>
          </div>
        </li>
        <li className="text-gray-700">
          Propose a 0 ETH txn to NounsDAOProxy, paste generated encoded data
          into calldatas. This is currently only possible via etherscan.
          <div className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded-md overflow-x-auto">
            <code className="text-sm text-gray-800">
              targets: ["0x6f3E6272A167e8AcCb32072d08E0957F9c79223d"]
              <br />
              signatures: ["_setProposalThresholdBPS(uint256)"]
              <br />
              calldatas:
              ["0x97d048e5000000000000000000000000000000000000000000000000000000000000000a"]
              <br />
              description: "Let's set the proposal threshold to 10 BPS"
            </code>
          </div>
        </li>
        <li className="text-gray-700">
          On proposal execution, the contract will decode and determine that the
          calldata doesn't correspond to any functions in NounsDAOLogicV4, relay
          it to nounsDAOAdmin via fallback, find the _setProposalThresholdBPS
          function and execute a threshold change.
        </li>
      </ul>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    selectedFunction: functions[0],
    inputValues: {},
    encodedData: "",
    error: null,
    isLoading: false,
    decodedFunction: null,
    decodedParams: null,
  });

  const [decodeInput, setDecodeInput] = useState("");

  const handleFunctionChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selected = functions.find((f) => f.name === event.target.value);
      if (selected) {
        setState((prev) => ({
          ...prev,
          selectedFunction: selected,
          inputValues: {},
          encodedData: "",
          error: null,
        }));
      }
    },
    [],
  );

  const handleInputChange = useCallback((paramName: string, value: string) => {
    setState((prev) => ({
      ...prev,
      inputValues: { ...prev.inputValues, [paramName]: value },
      error: null,
    }));
  }, []);

  const encodeFunction = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const abiItem = parseAbiItem(state.selectedFunction.interface);

      const params = state.selectedFunction.params.map((p) => {
        const value = state.inputValues[p.name];
        if (!value && value !== "0") {
          throw new Error(`Missing value for parameter: ${p.name}`);
        }
        if (p.type.endsWith("[]")) {
          return value.split(",").map((v) => v.trim());
        }
        if (p.type.startsWith("uint")) {
          if (!/^\d+$/.test(value)) {
            throw new Error(
              `Invalid value for ${p.name}. Expected a non-negative integer.`,
            );
          }
          return BigInt(value);
        }
        return value;
      });

      const encoded = encodeFunctionData({
        abi: [abiItem],
        functionName: state.selectedFunction.name,
        args: params,
      });

      setState((prev) => ({
        ...prev,
        encodedData: encoded as `0x${string}`,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Encoding error:", error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        encodedData: "",
        isLoading: false,
      }));
    }
  }, [state.selectedFunction, state.inputValues]);

  const decodeFunction = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const abi = functions.map((f) => parseAbiItem(f.interface));
      const decoded = decodeFunctionData({
        abi,
        data: decodeInput as `0x${string}`,
      });

      const decodedFunction = functions.find(
        (f) => f.name === decoded.functionName,
      );
      if (!decodedFunction) {
        throw new Error("Unknown function");
      }

      const decodedParams = decodedFunction.params.reduce<
        Record<string, string>
      >((acc, param, index) => {
        acc[param.name] = decoded.args[index]?.toString() || "";
        return acc;
      }, {});

      setState((prev) => ({
        ...prev,
        decodedFunction: decoded.functionName,
        decodedParams,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Decoding error:", error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        decodedFunction: null,
        decodedParams: null,
        isLoading: false,
      }));
    }
  }, [decodeInput]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(state.encodedData);
  }, [state.encodedData]);

  const memoizedFunctions = useMemo(() => functions, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="max-w-7xl mx-auto px-[0.5%] py-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Governance Function Encoder and Decoder
        </h2>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/3">
            <Info />
          </div>

          <div className="md:w-2/3 space-y-6">
            {/* Encoder Section */}
            <div>
              <h4 className="text-lg font-semibold mb-2">Encoder</h4>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="function-select"
                    className="block mb-2 font-medium"
                  >
                    Select Function
                  </label>
                  <select
                    id="function-select"
                    value={state.selectedFunction.name}
                    onChange={handleFunctionChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {memoizedFunctions.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                {state.selectedFunction.params.map((param) => (
                  <div key={param.name}>
                    <label
                      htmlFor={`param-${param.name}`}
                      className="block mb-2 font-medium"
                    >
                      {param.name} ({param.type})
                    </label>
                    <input
                      id={`param-${param.name}`}
                      type="text"
                      value={state.inputValues[param.name] || ""}
                      onChange={(e) =>
                        handleInputChange(param.name, e.target.value)
                      }
                      placeholder={`Enter ${param.name}`}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
                <button
                  onClick={encodeFunction}
                  disabled={state.isLoading}
                  className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  {state.isLoading
                    ? "Encoding..."
                    : "Generate Encoded Function Call"}
                </button>
              </div>
              {state.encodedData && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Encoded Function Call:</h3>
                  <div className="bg-gray-100 p-3 rounded break-all relative">
                    {state.encodedData}
                    <button
                      onClick={copyToClipboard}
                      className="absolute top-2 right-2 text-blue-500 hover:text-blue-600 focus:outline-none"
                      aria-label="Copy to clipboard"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Decoder Section */}
            <div>
              <h4 className="text-lg font-semibold mb-2">Decoder</h4>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="decode-input"
                    className="block mb-2 font-medium"
                  >
                    Encoded Function Call
                  </label>
                  <textarea
                    id="decode-input"
                    value={decodeInput}
                    onChange={(e) => setDecodeInput(e.target.value)}
                    placeholder="Enter encoded function call"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <button
                  onClick={decodeFunction}
                  disabled={state.isLoading}
                  className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  {state.isLoading ? "Decoding..." : "Decode Function Call"}
                </button>
              </div>
              {state.decodedFunction && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Decoded Function:</h4>
                  <div className="bg-gray-100 p-3 rounded">
                    {state.decodedFunction}
                  </div>
                  <h4 className="font-medium mt-4 mb-2">Decoded Parameters:</h4>
                  <div className="bg-gray-100 p-3 rounded">
                    {Object.entries(state.decodedParams || {}).map(
                      ([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {value}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Shared Error Message */}
          {state.error && <ErrorMessage message={state.error} />}
        </div>
      </div>
    </div>
  );
};

export default App;
