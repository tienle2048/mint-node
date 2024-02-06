const readlineLib = require('readline')
const config = require('./config')
const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm-stargate")
const { DirectSecp256k1Wallet } = require('@cosmjs/proto-signing')

const FEE = {
    transfer: {
        "amount": [
            {
                "amount": "10000",
                "denom": "usei"
            }
        ],
        "gas": "100000"
    },
    mint: {
        "amount": [
            {
                "amount": "100000",
                "denom": "usei"
            }
        ],
        "gas": "386204"
    },
    transferNft: {
        "amount": [
            {
                "amount": "20000",
                "denom": "usei"
            }
        ],
        "gas": "200000"
    },
    mintV2: {
        "amount": [
            {
                "amount": "1000000",
                "denom": "usei"
            }
        ],
        "gas": "6000000"
    },
    sendV2: {
        "amount": [
            {
                "amount": "60000",
                "denom": "usei"
            }
        ],
        "gas": "600000"
    },
    okla: {
        "amount": [
            {
                "amount": "70000",
                "denom": "usei"
            }
        ],
        "gas": "500000"
    },
    listing: {
        "amount": [
            {
                "amount": "650000",
                "denom": "usei"
            }
        ],
        "gas": "6500000"
    },
    approveAll: {
        "amount": [
            {
                "amount": "15000",
                "denom": "usei"
            }
        ],
        "gas": "150000"
    },
}

const pass = (pass) => {
    config.setPass(pass)
}

const contract = (contract) => {
    config.setContract(contract)
    // console.log(config.getConfig)
}

const retry = async (func, num) => {
    try {
        await func()
    }
    catch (err) {
        console.log("🦅 ~ err:")
        if (num === 0) return
        await retry(func, num - 1)
    }
}

const randomRpc = () => {
    const { rpcs } = config.getConfig
    return rpcs[Math.floor(Math.random() * rpcs.length)]
}

const numberWallet = () => { }

const sendFund = async () => { }


const mintPerWallet = (name, contract) => async (signer) => {
    console.log("🦅 ~ signer:", signer.address)
    const instruction = {
        contractAddress: 'sei1hjsqrfdg2hvwl3gacg4fkznurf36usrv7rkzkyh29wz3guuzeh0snslz7d',
        msg: {
            mint_native: {
                collection: contract,
                group: name,
                recipient: signer.address,
                merkle_proof: null,
                hashed_address: null
            }
        }
    }

    const signerOkla = await DirectSecp256k1Wallet.fromKey(
        Uint8Array.from(Buffer.from(signer.privateKey, 'hex')),
        'sei'
    );

    const rpc = randomRpc()

    const client = await SigningCosmWasmClient.connectWithSigner(rpc, signerOkla)

    const mintReceipt = await client.executeMultiple(signer.address, [instruction], FEE.mint)
    console.log('mint done', mintReceipt.transactionHash)
}


const mint = async (pass) => {
    const { listWallet, contract } = config.getConfig

    if (pass) {
        const rpc = randomRpc()
        const client = await SigningCosmWasmClient.connect(rpc)
        const data = await client.queryContractSmart("sei1hjsqrfdg2hvwl3gacg4fkznurf36usrv7rkzkyh29wz3guuzeh0snslz7d", { get_collection: { collection: contract } })
        const { mint_groups } = data

        const { start_time, name } = mint_groups[mint_groups.length - 1]

        for (const aa of listWallet) {
            try {
                retry(() => mintPerWallet(name, contract)(aa), 4)
            }
            catch (err) {
                console.error(aa.address)
            }
        }
    } else {
        const rpc = randomRpc()
        const client = await SigningCosmWasmClient.connect(rpc)
        const data = await client.queryContractSmart("sei1hjsqrfdg2hvwl3gacg4fkznurf36usrv7rkzkyh29wz3guuzeh0snslz7d", { get_collection: { collection: contract } })
        const { mint_groups } = data
        const { start_time, name } = mint_groups[mint_groups.length - 1]
        const now = Date.now()
        const timeStart = start_time * 1000
        console.log("🦅 ~ timeStart:", timeStart)
        setTimeout(() => {
            for (const aa of listWallet) {
                try {
                    retry(() => mintPerWallet(name, contract)(aa), 4)
                }
                catch (err) {
                    console.error(aa.address)
                }
            }
        }, timeStart - now)
    }

}

const gomNft = async () => { }

const gomFund = async () => { }

const allFunc = {
    pass,
    contract,
    // numberWallet,
    // sendFund,
    mint,
    // gomNft,
    // gomFund
}

const getInputFromTerminal = async (nameFunc = 'ko biet') => {
    const readline = readlineLib.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        readline.question(`${nameFunc}  :`, (params) => {
            resolve(params)
            readline.close();
        });
    })
}


const okla = async () => {
    let i = 0
    const STEP = Object.keys(allFunc)
    while (true) {
        const params = await getInputFromTerminal(STEP[i])
        if (i >= STEP.length) break
        await allFunc[STEP[i]](params)
        i++
    }
}

okla()