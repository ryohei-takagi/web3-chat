import {Comment} from '../types/comment'

const alchemyWssUrl = process.env.REACT_APP_ALCHEMY_WSS_URL
const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(alchemyWssUrl)

const contractABI = require('../contract-abi.json')
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS

export const commentsContract = new web3.eth.Contract(
  contractABI,
  contractAddress
)

export const loadCurrentComments: () => Promise<Comment[]> = async () => {
  const comments: Promise<Comment[]> = await commentsContract.methods.getComments().call()
  return comments
}

export const connectWallet: () => Promise<{ address: string, status: string }> = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request<string[]>({
        method: "eth_requestAccounts",
      })

      if (addressArray && addressArray.length > 0) {
        return {
          address: addressArray[0] ?? "",
          status: "👆🏽 さぁ、メッセージを送りましょう。",
        }
      } else {
        return {
          address: "",
          status: "アドレスが取得できませんでした。",
        }
      }

    } catch (err: unknown) {
      return {
        address: "",
        status: "❌ " + (err instanceof Error ? err.message : "Internal Server Error."),
      }
    }
  } else {
    return {
      address: "",
      status: "🦊 MetaMaskをインストールしてください。",
    }
  }
}

export const getCurrentWalletConnected: () => Promise<{ address: string, status: string }> = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request<string[]>({
        method: "eth_accounts",
      })

      if (addressArray && addressArray.length > 0) {
        return {
          address: addressArray[0] ?? "",
          status: "👆🏽 さぁ、メッセージを送りましょう。",
        }
      } else {
        return {
          address: "",
          status: "🦊 MetaMaskの接続設定をおこなってください。",
        }
      }
    } catch (err: unknown) {
      return {
        address: "",
        status: "❌ " + (err instanceof Error ? err.message : "Internal Server Error."),
      }
    }
  } else {
    return {
      address: "",
      status: "🦊 MetaMaskをインストールしてください。",
    }
  }
}

export const addComment: (address: string, creator: string, message: string) => Promise<{ status: string }> = async (address: string, creator: string, message: string) => {
  if (!window.ethereum) {
    return {
      status:
        "🦊 MetaMaskをインストールしてください。",
    }
  }

  if (message.trim() === "") {
    return {
      status: "メッセージが空です。",
    }
  }

  const transactionParameters = {
    to: contractAddress,
    from: address,
    data: commentsContract.methods.addComment(creator, message).encodeABI(),
  }

  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    })

    return {
      status: `メッセージの発行リクエストを送信しました。 TxHash=[${txHash}]`,
    }
  } catch (err: unknown) {
    return {
      status: "❌ " + (err instanceof Error ? err.message : "Internal Server Error."),
    }
  }
}
