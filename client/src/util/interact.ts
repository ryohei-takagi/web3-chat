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
          status: "ππ½ γγγγ‘γγ»γΌγΈγιγγΎγγγγ",
          isError: false,
        }
      } else {
        return {
          address: "",
          status: "γ’γγ¬γΉγεεΎγ§γγΎγγγ§γγγ",
          isError: true,
        }
      }

    } catch (err: unknown) {
      return {
        address: "",
        status: "β " + (err instanceof Error ? err.message : "Internal Server Error."),
        isError: true,
      }
    }
  } else {
    return {
      address: "",
      status: "π¦ MetaMaskγγ€γ³γΉγγΌγ«γγ¦γγ γγγ",
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
          status: "ππ½ γγγγ‘γγ»γΌγΈγιγγΎγγγγ",
          isError: false,
        }
      } else {
        return {
          address: "",
          status: "π¦ MetaMaskγ?ζ₯ηΆθ¨­ε?γγγγͺγ£γ¦γγ γγγ",
          isError: true,
        }
      }
    } catch (err: unknown) {
      return {
        address: "",
        status: "β " + (err instanceof Error ? err.message : "Internal Server Error."),
        isError: true,
      }
    }
  } else {
    return {
      address: "",
      status: "π¦ MetaMaskγγ€γ³γΉγγΌγ«γγ¦γγ γγγ",
      isError: true,
    }
  }
}

export const addComment: (address: string, creator: string, message: string) => Promise<{ status: string, isError: boolean }> = async (address: string, creator: string, message: string) => {
  if (!window.ethereum) {
    return {
      status: "π¦ MetaMaskγγ€γ³γΉγγΌγ«γγ¦γγ γγγ",
      isError: true,
    }
  }

  if (!address) {
    return {
      status: "π¦ MetaMaskγ?ζ₯ηΆθ¨­ε?γγγγͺγ£γ¦γγ γγγ",
      isError: true,
    }
  }

  if (creator.trim() === "") {
    return {
      status: "εεγε₯εγγ¦γγ γγγ",
      isError: true,
    }
  }

  if (message.trim() === "") {
    return {
      status: "γ‘γγ»γΌγΈγε₯εγγ¦γγ γγγ",
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
      status: `γ‘γγ»γΌγΈγ?ηΊθ‘γͺγ―γ¨γΉγγιδΏ‘γγΎγγγ TxHash=[${txHash}]`,
      isError: false,
    }
  } catch (err: unknown) {
    return {
      status: "β " + (err instanceof Error ? err.message : "Internal Server Error."),
      isError: true,
    }
  }
}
