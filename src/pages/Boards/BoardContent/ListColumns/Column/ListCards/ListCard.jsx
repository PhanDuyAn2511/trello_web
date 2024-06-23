import { Box } from '@mui/material'
import Card from './Card/Card'

function ListCard() {
  return (
    <Box sx={{
      p: '0 5px',
      m: '0 5px',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      overflowX: 'hidden',
      overflowY: 'auto',
      maxHeight: (theme) => `calc(
          ${theme.trello.boardContentHeight} - 
          ${theme.spacing(5)} -
          ${theme.COLUMN_HEADER_HEIGHT} -
          ${theme.COLUMN_FOOTER_HEIGHT}
          )`,
      '&::-webkit-scrollbar-thumb': { background: '#ced0da' },
      '&::-webkit-scrollbar-thumb:hover': { background: 'bfc2cf' }
    }}>
      <Card />
      <Card temporaryHideMedia/>

    </Box>
  )
}

export default ListCard