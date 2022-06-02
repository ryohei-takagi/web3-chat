import React, {useEffect, useState} from 'react'
import './App.css'
import {
  addComment,
  commentsContract,
  connectWallet,
  getCurrentWalletConnected,
  loadCurrentComments
} from './util/interact'
import {Comment} from './types/comment'

function App() {
  const [address, setAddress] = useState<string>("")
  const [creator, setCreator] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [status, setStatus] = useState<string>("")

  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    const fetchMessage = async() => {
      const comments = await loadCurrentComments()
      setComments(comments)
    }
    fetchMessage()
    addSmartContractListener()

    const fetchWallet = async() => {
      const {address, status} = await getCurrentWalletConnected()
      setAddress(address)
      setStatus(status)
    }
    fetchWallet()
    addWalletListener()
  }, [])

  const addSmartContractListener = () => {
    commentsContract.events.CommentAdded({}, (err: unknown, data: unknown) => {
      if (err) {
        setStatus("❌ " + (err instanceof Error ? err.message : "Internal Server Error."),)
      } else {
        setStatus("🎉 おめでとうございます！あなたのメッセージは正常に発行されました。")
        setMessage("")

        const fetchMessage = async() => {
          const comments = await loadCurrentComments()
          setComments(comments)
        }
        fetchMessage()
      }
    })
  }

  const addWalletListener = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (args: unknown) => {
        const accounts = args as string[]
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0])
          setStatus("👆🏽 さぁ、メッセージを送りましょう。")
        } else {
          setAddress("")
          setStatus("🦊 MetaMaskの接続設定をおこなってください。")
        }
      })
    } else {
      setStatus("🦊 MetaMaskをインストールしてください。")
    }
  }

  const connectWalletPressed = async() => {
    const walletResponse = await connectWallet()
    setAddress(walletResponse.address)
    setStatus(walletResponse.status)
  }

  const onSubmit = async() => {
    const { status } = await addComment(address, creator, message);
    setStatus(status)
  }

  return (
    <div className="App">
      {address.length > 0 ? <p>サインイン中</p> : <button onClick={connectWalletPressed}>サインイン</button>}
      <p>{address.length > 0 && `あなたのアドレス：${address}`}</p>
      <input placeholder="名前" type="text" value={creator} onChange={(e) => setCreator(e.target.value)}/>
      <input placeholder="メッセージ本文" type="text" value={message} onChange={(e) => setMessage(e.target.value)}/>
      <button onClick={onSubmit}>送信</button>
      <p>{status}</p>
      <ul>
        {comments.map(comment => {
          return <li key={comment.id}>{comment.creator} {comment.message}</li>
        })}
      </ul>
    </div>
  );
}

export default App
