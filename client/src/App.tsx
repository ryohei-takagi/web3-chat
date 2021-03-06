import React, {useEffect, useState} from 'react'
import './App.css'
import {Comment} from './types/comment'
import {
  addComment,
  commentsContract,
  connectWallet,
  getCurrentWalletConnected,
  loadCurrentComments
} from './util/interact'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  InputAdornment,
  TextField,
  Typography
} from '@material-ui/core'
import {AccountCircle} from '@material-ui/icons'
import moment from 'moment'
import Loading from './Loading'

function App() {
  const [address, setAddress] = useState<string>("")
  const [creator, setCreator] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [isError, setIsError] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    const fetchMessage = async() => {
      setIsLoading(true)
      const comments = await loadCurrentComments()
      setComments(comments)
      setIsLoading(false)
    }
    fetchMessage()
    addSmartContractListener()

    const fetchWallet = async() => {
      const { address, status, isError } = await getCurrentWalletConnected()
      setAddress(address)
      setStatus(status)
      setIsError(isError)
    }
    fetchWallet()
    addWalletListener()
  }, [])

  const addSmartContractListener = () => {
    commentsContract.events.CommentAdded({}, (err: unknown, data: unknown) => {
      if (err) {
        setStatus("â " + (err instanceof Error ? err.message : "Internal Server Error."),)
      } else {
        setStatus("đ ăăă§ăšăăăăăŸăïŒăăȘăăźăĄăă»ăŒăžăŻæ­Łćžžă«çșèĄăăăŸăăă")
        setMessage("")

        const fetchMessage = async() => {
          setIsLoading(true)
          const comments = await loadCurrentComments()
          setComments(comments)
          setIsLoading(false)
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
          setStatus("đđœ ăăăăĄăă»ăŒăžăéăăŸăăăă")
          setIsError(false)
        } else {
          setAddress("")
          setStatus("đŠ MetaMaskăźæ„ç¶èš­ćźăăăăȘăŁăŠăă ăăă")
          setIsError(true)
        }
      })
    } else {
      setStatus("đŠ MetaMaskăă€ăłăčăăŒă«ăăŠăă ăăă")
      setIsError(true)
    }
  }

  const connectWalletPressed = async() => {
    const { address, status, isError } = await connectWallet()
    setAddress(address)
    setStatus(status)
    setIsError(isError)
  }

  const onSubmit = async() => {
    setIsLoading(true)
    const { status, isError } = await addComment(address, creator, message)
    setIsLoading(false)
    setStatus(status)
    setIsError(isError)
  }

  return (
    <div className="App">
      <div className="App-connectButton">
        {address.length > 0 ?
          <p>ă”ă€ăłă€ăłäž­</p> :
          <Button
            variant="outlined"
            color="secondary"
            onClick={connectWalletPressed}
          >
            ă”ă€ăłă€ăł
          </Button>
        }
        <div className="App-address">
          <p>{address.length > 0 && `ăăȘăăźăąăăŹăčïŒ${address}`}</p>
        </div>
      </div>

      <Box className="App-inputForm">
        <TextField
          variant="outlined"
          placeholder="ćć"
          size="small"
          type="text"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          className="App-nameField"
        />

        <TextField
          variant="outlined"
          placeholder="ăĄăă»ăŒăžæŹæ"
          size="small"
          type="text"
          value={message} onChange={(e) => setMessage(e.target.value)}
          className="App-textField"
        />

        <Button
          variant="outlined"
          color="primary"
          onClick={onSubmit}
          className="App-submitButton"
        >
          éäżĄ
        </Button>
      </Box>

      <p className="App-status" style={{backgroundColor: isError ? '#ffe0e0' : '#e0ffe0'}}>{status}</p>

      <div className="App-cardBox">
        {isLoading && <Loading/>}
        {comments.map(comment => {
          const isMyComment = comment.creator_address.toLowerCase() === address.toLowerCase()
          const margin = isMyComment ? { marginLeft: 'auto', marginRight: '10px' } : undefined
          return (
            <Card className="App-card" style={margin}>
              <CardHeader
                avatar={
                  <AccountCircle />
                }
                title={
                  <>
                    <p className="App-cardTitle">{comment.creator}</p>
                  </>
                }
                subheader={moment(comment.created_at * 1000).format("Y-MM-DD HH:mm:ss")}
              />
              <CardContent>
                <Typography variant="body2" component="p">
                  {comment.message}
                </Typography>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default App
