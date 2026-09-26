import React, { useState } from 'react'
import { Container, Typography, Tabs, Tab, Grid } from '@mui/material'
import DownloadForm from './components/DownloadForm.js'
import UploadForm from './components/UploadForm.js'
import FilesForm from './components/FilesForm.js'
import Footer from './components/Footer.js'
import './App.scss'

const App: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0)

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue)
  }

  return (
    <Container maxWidth='md' sx={{ paddingTop: '2em', paddingBottom: '2em' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sx={{ mb: 2 }}>
          <Typography variant='h4' align='center' sx={{ fontWeight: 'bold', mb: 1 }}>
            UHRP Storage UI
          </Typography>
          <Typography color='textSecondary' paragraph align='center' sx={{ mb: 3 }}>
            Upload and Download Content
          </Typography>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            indicatorColor='primary'
            textColor='primary'
            variant='fullWidth'
            sx={{
              '& .MuiTab-root': {
                borderRadius: '4px 4px 0 0',
                fontWeight: 'medium',
                py: 1.5
              }
            }}
          >
            <Tab label='Download' />
            <Tab label='Upload' />
            <Tab label='Files' />
          </Tabs>
        </Grid>
        <Grid item xs={12}>
          <div style={{ minHeight: '400px' }}>
            {tabIndex === 0 && <DownloadForm />}
            {tabIndex === 1 && <UploadForm />}
            {tabIndex === 2 && <FilesForm />}
          </div>
        </Grid>
        <Grid item xs={12}>
          <Footer />
        </Grid>
      </Grid>
    </Container>
  )
}

export default App
