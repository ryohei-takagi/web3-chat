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

export const connectWallet: () => Promise<{ address: string, status: string, isError: boolean }> = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request<string[]>({
        method: "eth_requestAccounts",
      })

      if (addressArray && addressArray.length > 0) {
        return {
          address: addressArray[0] ?? "",
          status: "👆🏽 さぁ、メッセージを送りましょう。",
          isError: false,
        }
      } else {
        return {
          address: "",
          status: "アドレスが取得できませんでした。",
          isError: true,
        }
      }

    } catch (err: unknown) {
      return {
        address: "",
        status: "❌ " + (err instanceof Error ? err.message : "Internal Server Error."),
        isError: true,
      }
    }
  } else {
    return {
      address: "",
      status: "🦊 MetaMaskをインストールしてください。",
      isError: true,
    }
  }
}

export const getCurrentWalletConnected: () => Promise<{ address: string, status: string, isError: boolean }> = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request<string[]>({
        method: "eth_accounts",
      })

      if (addressArray && addressArray.length > 0) {
        return {
          address: addressArray[0] ?? "",
          status: "👆🏽 さぁ、メッセージを送りましょう。",
          isError: false,
        }
      } else {
        return {
          address: "",
          status: "🦊 MetaMaskの接続設定をおこなってください。",
          isError: true,
        }
      }
    } catch (err: unknown) {
      return {
        address: "",
        status: "❌ " + (err instanceof Error ? err.message : "Internal Server Error."),
        isError: true,
      }
    }
  } else {
    return {
      address: "",
      status: "🦊 MetaMaskをインストールしてください。",
      isError: true,
    }
  }
}

export const addComment: (address: string, creator: string, message: string) => Promise<{ status: string, isError: boolean }> = async (address: string, creator: string, message: string) => {
  if (!window.ethereum) {
    return {
      status: "🦊 MetaMaskをインストールしてください。",
      isError: true,
    }
  }

  if (!address) {
    return {
      status: "🦊 MetaMaskの接続設定をおこなってください。",
      isError: true,
    }
  }

  if (creator.trim() === "") {
    return {
      status: "名前を入力してください。",
      isError: true,
    }
  }

  if (message.trim() === "") {
    return {
      status: "メッセージを入力してください。",
      isError: true,
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
      isError: false,
    }
  } catch (err: unknown) {
    return {
      status: "❌ " + (err instanceof Error ? err.message : "Internal Server Error."),
      isError: true,
    }
  }
}
