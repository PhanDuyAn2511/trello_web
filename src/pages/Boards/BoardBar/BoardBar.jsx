import { Box, Button, Tooltip } from '@mui/material'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import PersonAddIcon from '@mui/icons-material/PersonAdd';


const MENU_STYLE = {
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  padding: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }

}
function BoardBar() {
  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      padding: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
      borderBottom: '1px solid white'
    }}>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          sx={MENU_STYLE}
          icon={<DashboardIcon />}
          label="Duy An"
          clickable />

        <Chip
          sx={MENU_STYLE}
          icon={<VpnLockIcon />}
          label="Puplic/private Workspace"
          clickable
        />

        <Chip
          sx={MENU_STYLE}
          icon={<AddToDriveIcon />}
          label="Add Do Google Drive"
          clickable
        />

        <Chip
          sx={MENU_STYLE}
          icon={<BoltIcon />}
          label="Autumation"
          clickable
        />

        <Chip
          sx={MENU_STYLE}
          icon={<FilterListIcon />}
          label="Filter"
          clickable
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': { borderColor: 'white' }
          }}
        >
          Invite
        </Button>
        <AvatarGroup
          max={7}
          sx={{
            gap: '10px',
            '& .MuiAvatar-root': {
              width: 34,
              height: 34,
              fontSize: 16,
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              '&: first-of-type': { bgcolor: '#a4b0be' }
            }
          }}
        >
          <Tooltip title="DuyAn">
            <Avatar
              alt="Duy An"
              src="https://scontent.fdad3-1.fna.fbcdn.net/v/t39.30808-1/331478501_728162635423821_1967223198635575044_n.jpg?stp=dst-jpg_p200x200&_nc_cat=108&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeFrsBHk8I0A2oomAidzM3Wv25ej32UnMELbl6PfZScwQkREX9zNP2rDybA3WXTuQzWFFbShoeKM872ou0e0Fl9A&_nc_ohc=yD9FmHVENLIQ7kNvgFFh39l&_nc_ht=scontent.fdad3-1.fna&oh=00_AYBRfg4Esmlatn50Jxot2IqGMApv_syRnq7uIbfyOmaLQQ&oe=667DB01C"
            />
          </Tooltip>
          <Tooltip title="DuyAn">
            <Avatar
              alt="Duy An"
              src="https://scontent.fdad3-1.fna.fbcdn.net/v/t39.30808-1/331478501_728162635423821_1967223198635575044_n.jpg?stp=dst-jpg_p200x200&_nc_cat=108&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeFrsBHk8I0A2oomAidzM3Wv25ej32UnMELbl6PfZScwQkREX9zNP2rDybA3WXTuQzWFFbShoeKM872ou0e0Fl9A&_nc_ohc=yD9FmHVENLIQ7kNvgFFh39l&_nc_ht=scontent.fdad3-1.fna&oh=00_AYBRfg4Esmlatn50Jxot2IqGMApv_syRnq7uIbfyOmaLQQ&oe=667DB01C"
            />
          </Tooltip>
          <Tooltip title="DuyAn">
            <Avatar
              alt="Duy An"
              src="https://scontent.fdad3-1.fna.fbcdn.net/v/t39.30808-1/331478501_728162635423821_1967223198635575044_n.jpg?stp=dst-jpg_p200x200&_nc_cat=108&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeFrsBHk8I0A2oomAidzM3Wv25ej32UnMELbl6PfZScwQkREX9zNP2rDybA3WXTuQzWFFbShoeKM872ou0e0Fl9A&_nc_ohc=yD9FmHVENLIQ7kNvgFFh39l&_nc_ht=scontent.fdad3-1.fna&oh=00_AYBRfg4Esmlatn50Jxot2IqGMApv_syRnq7uIbfyOmaLQQ&oe=667DB01C"
            />
          </Tooltip>
          <Tooltip title="DuyAn">
            <Avatar
              alt="Duy An"
              src="https://scontent.fdad3-1.fna.fbcdn.net/v/t39.30808-1/331478501_728162635423821_1967223198635575044_n.jpg?stp=dst-jpg_p200x200&_nc_cat=108&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeFrsBHk8I0A2oomAidzM3Wv25ej32UnMELbl6PfZScwQkREX9zNP2rDybA3WXTuQzWFFbShoeKM872ou0e0Fl9A&_nc_ohc=yD9FmHVENLIQ7kNvgFFh39l&_nc_ht=scontent.fdad3-1.fna&oh=00_AYBRfg4Esmlatn50Jxot2IqGMApv_syRnq7uIbfyOmaLQQ&oe=667DB01C"
            />
          </Tooltip>
          <Tooltip title="DuyAn">
            <Avatar
              alt="Duy An"
              src="https://scontent.fdad3-1.fna.fbcdn.net/v/t39.30808-1/331478501_728162635423821_1967223198635575044_n.jpg?stp=dst-jpg_p200x200&_nc_cat=108&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeFrsBHk8I0A2oomAidzM3Wv25ej32UnMELbl6PfZScwQkREX9zNP2rDybA3WXTuQzWFFbShoeKM872ou0e0Fl9A&_nc_ohc=yD9FmHVENLIQ7kNvgFFh39l&_nc_ht=scontent.fdad3-1.fna&oh=00_AYBRfg4Esmlatn50Jxot2IqGMApv_syRnq7uIbfyOmaLQQ&oe=667DB01C"
            />
          </Tooltip>
          <Tooltip title="DuyAn">
            <Avatar
              alt="Duy An"
              src="https://scontent.fdad3-1.fna.fbcdn.net/v/t39.30808-1/331478501_728162635423821_1967223198635575044_n.jpg?stp=dst-jpg_p200x200&_nc_cat=108&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeFrsBHk8I0A2oomAidzM3Wv25ej32UnMELbl6PfZScwQkREX9zNP2rDybA3WXTuQzWFFbShoeKM872ou0e0Fl9A&_nc_ohc=yD9FmHVENLIQ7kNvgFFh39l&_nc_ht=scontent.fdad3-1.fna&oh=00_AYBRfg4Esmlatn50Jxot2IqGMApv_syRnq7uIbfyOmaLQQ&oe=667DB01C"
            />
          </Tooltip>
          <Tooltip title="DuyAn">
            <Avatar
              alt="Duy An"
              src="https://scontent.fdad3-1.fna.fbcdn.net/v/t39.30808-1/331478501_728162635423821_1967223198635575044_n.jpg?stp=dst-jpg_p200x200&_nc_cat=108&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeFrsBHk8I0A2oomAidzM3Wv25ej32UnMELbl6PfZScwQkREX9zNP2rDybA3WXTuQzWFFbShoeKM872ou0e0Fl9A&_nc_ohc=yD9FmHVENLIQ7kNvgFFh39l&_nc_ht=scontent.fdad3-1.fna&oh=00_AYBRfg4Esmlatn50Jxot2IqGMApv_syRnq7uIbfyOmaLQQ&oe=667DB01C"
            />
          </Tooltip>
          <Tooltip title="DuyAn">
            <Avatar
              alt="Duy An"
              src="https://scontent.fdad3-1.fna.fbcdn.net/v/t39.30808-1/331478501_728162635423821_1967223198635575044_n.jpg?stp=dst-jpg_p200x200&_nc_cat=108&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeFrsBHk8I0A2oomAidzM3Wv25ej32UnMELbl6PfZScwQkREX9zNP2rDybA3WXTuQzWFFbShoeKM872ou0e0Fl9A&_nc_ohc=yD9FmHVENLIQ7kNvgFFh39l&_nc_ht=scontent.fdad3-1.fna&oh=00_AYBRfg4Esmlatn50Jxot2IqGMApv_syRnq7uIbfyOmaLQQ&oe=667DB01C"
            />
          </Tooltip>

        </AvatarGroup>
      </Box>

    </Box>
  )
}

export default BoardBar