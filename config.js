
const fs = require('fs')
const path = require('path')
const CryptoJS = require('crypto-js')

const configEncode = fs.readFileSync(path.resolve(__dirname, 'confignhap.txt'), 'utf8')

const allConfig = () => {
    const config = {
        rpcs: [
            "https://sei-rpc.brocha.in",
            "https://rpc.sei-apis.com",
            "https://sei-rpc.publicnode.com:443",
            "https://rpc.wallet.pacific-1.sei.io",
            "https://sei.rpc.kjnodes.com",
            "https://rpc-sei.whispernode.com:443",
            "https://rpc-sei.stingray.plus"
        ],
        listWallet: [],
        contract: ''
    }

    const setPass = (pass) => {
        config.listWallet = JSON.parse(CryptoJS.AES.decrypt(configEncode, pass).toString(CryptoJS.enc.Utf8))
    }

    const setContract = (contract) => {
        config.contract = contract
    }

    return {
        getConfig: config,
        setPass,
        setContract
    }
}


module.exports = allConfig()