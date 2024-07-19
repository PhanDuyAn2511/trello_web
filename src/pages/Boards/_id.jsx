
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
// import { mockData } from '~/apis/MockData'
import { useEffect, useState } from 'react'
import {
  fetchBoardDetailsAPI,
  createNewColumnAPI, createNewCardAPI,
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import { mapOrder } from '~/utils/soft'
import { isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'
import { Box, CircularProgress, Typography } from '@mui/material'
function Board() {
  const [board, setBoard] = useState(null)
  //https://stackoverflow.com/questions/57444203/get-id-from-url-in-react-js#:~:text=In%20React%20Hooks%2C%20You%20should,%3A8000%2Fpersonal%2F1%20.&text=now%2C%20if%20you%20do%20console,exact%20id%20of%20the%20url.
  //https://stackoverflow.com/questions/58924415/react-router-dom-get-id-from-route-with-custom-components-and-extra-path
  useEffect(() => {
    const boardId = '6694dd31c6c153c4d2e17e77'

    fetchBoardDetailsAPI(boardId).then(board => {

      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')
      board.columns.forEach(column => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          /*
            Sắp xếp thứ tự các card luôn ở đây trươc khi đưa dữ liệu xuống dưới
            các component con
           */
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })
      console.log('🚀 ~ fetchBoardDetailsAPI ~ board:', board)

      setBoard(board)
    })
  }, [])

  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })
    // Khi tạo column mới thì chưa có card, cần cho một cai card ẩn để xử lý kéo thả
    createdColumn.cards = [generatePlaceholderCard(createdColumn)]
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id]
    // Cập nhật phía state board
    // Phía Front-end tự làm đúng lại state data board(thay vì phỉa gọi lại api fetchBoardDetailsAPI)
    // Lưu ý: tùy đặc thù dự án, BE có thể hộ trợ trả về luôn toàn bộ Board dù có là api
    // tạo column hay card đi chăng nữa.
    const newBoard = { ...board }
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)
    setBoard(newBoard)
  }
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId)
    if (columnToUpdate) {
      // Nếu column rỗng: đang chứa một cái Placeholder card
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard]
        columnToUpdate.cardOrderIds = []
      } else {
        columnToUpdate.cards.push(createdCard)
        columnToUpdate.cardOrderIds.push(createdCard._id)
      }

    }
    setBoard(newBoard)
  }
  // Func này có nhiệm vụ gọi API và xử lý khi kéo thả Column xong xuôi
  // Chỉ cần gọi API để cập nhật mảng columnOrderIds của Board chứa nó( thay đổi vị trí trong mảng )
  const moveColumns = async (dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    setBoard(newBoard)

    // Goi API update Board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds })
  }
  /*
    Khi di chuyển card trong cùng column
    Chỉ cần gọi API để cập nhật mảng cardOrderIds của Column chứa nó( thay đổi vị trí trong mảng )
  */
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    // Update cho chuẩn dữ liệu state Board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    setBoard(newBoard)
    // Gọi API update column
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }
  /*
    Khi di chuyển card áng column khác:
    B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất
    là xóa cái _id của Card ra khỏi mảng)
    B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu theo bản chất là
    thêm _id của Card vào mảng)
    B3: Cập nhật lại trường columnId mới của cái Card đã kéo
    => Làm mới API support riêng
   */
  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
  console.log('🚀 ~ moveCardToDifferentColumn ~ prevColumnId:', prevColumnId)
  console.log('🚀 ~ moveCardToDifferentColumn ~ currentCardId:', currentCardId)

    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    setBoard(newBoard)

    let prevCardOrderIds = dndOrderedColumns.find(column => column._id === prevColumnId)?.cardOrderIds

    // Xử lý vấn đề khi kéo card cuối cùng ra khỏi column, vì column rỗng
    // sẽ có placeholder-card, cần xóa nó trước khi gửi lên BE để kh bị lỗi Object Id rule
    if (prevCardOrderIds[0].includes('placeholder-card')) {
      prevCardOrderIds = []
    }
    console.log('prevcolumnOrderIds:', dndOrderedColumns.find(c => c._id === prevColumnId))

    console.log('nextcolumnOrderIds:', dndOrderedColumns.find(c => c._id === nextColumnId))
    // Gọi API xử lý phía BE
    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds

    }
    )
  }
  if (!board) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh'
      }}>
        <CircularProgress />
        <Typography>Loading Board...</Typography>
      </Box>
    )
  }

  return (
    <>
      <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
        <AppBar />
        <BoardBar board={board} />
        <BoardContent
          board={board}
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}
          moveColumns={moveColumns}
          moveCardInTheSameColumn={moveCardInTheSameColumn}
          moveCardToDifferentColumn={moveCardToDifferentColumn}
        />
      </Container>
    </>
  )
}

export default Board