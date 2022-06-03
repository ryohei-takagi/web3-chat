import React from 'react'
import './Loading.css'
import ReactLoading from 'react-loading'

const Loading = () => {
  return (
    <div className="Loading-root">
      <ReactLoading className="Loading-container" type="spin" color="gray" />
    </div>
  )
}

export default Loading
