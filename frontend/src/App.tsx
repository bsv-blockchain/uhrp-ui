import React, { useState } from 'react'
import { Container, Typography, Tabs, Tab, Grid } from '@mui/material'
import { ToastContainer } from 'react-toastify'
import useAsyncEffect from 'use-async-effect'
import checkForMetaNetClient from './utils/checkForMetaNetClient.js'
import NoMncModal from './components/NoMncModal/NoMncModal.js'
import DownloadForm from './components/DownloadForm.js'
import UploadForm from './components/UploadForm.js'
import Footer from './components/Footer.js'

import './App.scss'

const App: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0)
  const [isMncMissing, setIsMncMissing] = useState<boolean>(false)

  // Run a 1s interval for checking if MNC is running
  useAsyncEffect(async () => {
    const intervalId = setInterval(async () => {
      const hasMNC = await checkForMetaNetClient()
      if (hasMNC === 0) {
        setIsMncMissing(true) // Open modal if MNC is not found
      } else {
        clearInterval(intervalId)
        setIsMncMissing(false) // Ensure modal is closed if MNC is found
      }
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue)
  }

  return (
    <Container maxWidth='sm' sx={{ paddingTop: '2em' }}>
      <NoMncModal open={isMncMissing} onClose={() => setIsMncMissing(false)} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant='h4' align='center'>
            UHRP Storage UI
          </Typography>
          <Typography color='textSecondary' paragraph align='center'>
            Upload and Download Content
          </Typography>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            indicatorColor='primary'
            textColor='primary'
            variant='fullWidth'
          >
            <Tab label='Download' />
            <Tab label='Upload' />
            <Tab label='Renew (coming soon)' disabled />
          </Tabs>
        </Grid>
        <Grid item xs={12}>
          {tabIndex === 0 && <DownloadForm />}
          {tabIndex === 1 && <UploadForm />}
        </Grid>
        <Grid item xs={12}>
          <Footer />
        </Grid>
      </Grid>
    </Container>
  )
}

export default App
