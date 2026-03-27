import React from 'react'

const AccountTest = () => {
  console.log('🧪 AccountTest component rendering at:', new Date().toISOString())
  
  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: '#f0f0f0', 
      border: '3px solid red',
      margin: '20px'
    }}>
      <h1 style={{ color: 'red', fontSize: '48px' }}>🧪 ACCOUNT TEST PAGE</h1>
      <p style={{ fontSize: '24px' }}>If you can see this, the routing works!</p>
      <p style={{ fontSize: '18px' }}>Time: {new Date().toLocaleString()}</p>
      <div style={{ 
        backgroundColor: 'yellow', 
        padding: '20px', 
        marginTop: '20px',
        border: '2px solid orange'
      }}>
        <h2>Debug Info:</h2>
        <p>Component: AccountTest</p>
        <p>Path: /account</p>
        <p>Status: WORKING</p>
      </div>
    </div>
  )
}

export default AccountTest
