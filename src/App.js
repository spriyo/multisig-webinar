import { useEffect, useState } from "react";
import "./App.css";
import { connectWalletToSite } from "./utils/walletConnect";
const Web3 = require("web3");
const web3 = new Web3("https://matic-mumbai.chainstacklabs.com");
const MultisigContract = require("./contracts/Multisig.json");
const contractAddress = "0x7197C8ff40375232EceaDAF740e1947F3D7A0C5F";

function App() {
	const [transfer, setTransfer] = useState(null);
	const [transferId, setTransferId] = useState("");
	const [signId, setSignId] = useState("");
	const [currentAddress, setCurrentAddress] = useState("");
	const [createAmount, setCreateAmount] = useState(0);
	const [createTo, setCreateTo] = useState("");

	async function getCurrentAddress() {
		await connectWalletToSite();
		let address = await window.ethereum.selectedAddress;
		setCurrentAddress(address);
	}

	async function getTransfer(transferId) {
		if (!transferId) return;
		const contract = new window.web3.eth.Contract(
			MultisigContract.abi,
			contractAddress
		);
		const transfer = await contract.methods.transfers(transferId).call();
		setTransfer(transfer);
		console.log(transfer);
	}

	async function signTransaction(singId) {
		if (!singId) return;
		const contract = new window.web3.eth.Contract(
			MultisigContract.abi,
			contractAddress
		);

		const sign = await contract.methods
			.sendTransfer(signId)
			.send({ from: currentAddress });
		console.log(sign);
		setSignId("");
	}

	async function createTransfer(amount, to) {
		const contract = new window.web3.eth.Contract(
			MultisigContract.abi,
			contractAddress
		);
		const weiAmount = web3.utils.toWei(amount);
		const createdTransfer = await contract.methods
			.createTransfer(weiAmount, to)
			.send({ from: currentAddress });
		console.log(createdTransfer);
	}

	async function listener() {
		// Listeners
		window.ethereum.on("accountsChanged", async function (accounts) {
			setCurrentAddress(accounts[0]);
		});
	}

	useEffect(() => {
		getCurrentAddress();
		listener();
	}, []);

	return (
		<div className="App">
			{/* Current Address */}
			<h4>{`Connected Wallet: ${currentAddress}`}</h4>
			<div style={{ display: "flex" }}>
				{/* Transactions */}
				<div className="data-container">
					<h2>Transfer</h2>
					{transfer && (
						<div>
							<h4>{`Transfer ID: ${transfer.id}`}</h4>
							<h4>{`Pending Approvals: ${transfer.approvals}`}</h4>
							<h4>{`Amount: ${web3.utils.fromWei(transfer.amount)} SHM`}</h4>
							<h4>{`To: ${transfer.to.substring(0, 4)}...${transfer.to.slice(
								-4
							)}`}</h4>
							<h4>{`Status: ${
								transfer.sent ? "Completed" : "Pending Approvals"
							}`}</h4>
						</div>
					)}
					<form>
						<label>
							<input
								type="number"
								name="Transfer ID"
								onChange={(e) => setTransferId(e.target.value)}
								value={transferId}
							/>
							<br />
							<button
								onClick={(e) => {
									e.preventDefault();
									getTransfer(transferId);
								}}
							>
								Get Transfer
							</button>
						</label>
					</form>
				</div>
				{/* Sign Transaction */}
				<div className="data-container">
					<h2>Sign</h2>
					<form>
						<label>
							<input
								type="number"
								name="Transfer ID"
								onChange={(e) => setSignId(e.target.value)}
								value={signId}
							/>
							<br />
							<button
								onClick={(e) => {
									e.preventDefault();
									signTransaction(signId);
								}}
							>
								Sign Transaction
							</button>
						</label>
					</form>
				</div>
				{/* Create Transfer */}
				<div className="data-container">
					<h2>Create Transfer</h2>
					<form>
						<label>
							<input
								type="number"
								name="Amount"
								onChange={(e) => setCreateAmount(e.target.value)}
								value={createAmount}
							/>
							<input
								type="string"
								name="To address"
								onChange={(e) => setCreateTo(e.target.value)}
								value={createTo}
							/>
							<br />
							<button
								onClick={(e) => {
									e.preventDefault();
									createTransfer(createAmount, createTo);
								}}
							>
								Sign Transaction
							</button>
						</label>
					</form>
				</div>
			</div>
		</div>
	);
}

export default App;
