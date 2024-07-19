
import { Box } from '@mui/material'
import ListColumn from './ListColumns/ListColumn'
import {
  DndContext,
  useSensor,
  useSensors,
  // MouseSensor,
  // TouchSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  // closestCenter,
  pointerWithin,
  // rectIntersection,
  getFirstCollision
} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibraries/DndKitSensors'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cloneDeep, isEmpty } from 'lodash'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { generatePlaceholderCard } from '~/utils/formatters'


const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({
  board,
  createNewColumn,
  createNewCard,
  moveColumns,
  moveCardInTheSameColumn,
  moveCardToDifferentColumn
}) {

  //const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  // Yeu cầu chuột di chuyển 10px thì mới kích hoạt event, fix trường họp click bị gọi evnt
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })
  // Nhấn giữ 250ms và dung sai của cảm ứng 500px thì mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  // Ưu tiên sử dụng kết hợp 2 loại sensors là mouse và touch để có trải nghiệm tốt nhất,
  // không bị bug
  //const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumnsState, setOrderedColumnsState] = useState([])

  // Cùng một thời điểm chỉ có một phần tử đang được kéo (column hoặc card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  // Điểm va chạm cuối cùng trước đó(Thuật toán va chạm)
  const lastOverId = useRef(null)

  useEffect(() => {
    // Column đẫ được sắp xếp ở component cha cao nhất
    setOrderedColumnsState(board?.columns)

  }, [board])

  const findColumnByCardId = (cardId) => {
    // Đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOderIds bởi vì
    // ở bước handleDragOver chúng ta sẽ làm dữ liệu cho cards hoàn chỉnh
    // trước rồi mới tạo ra cardOderIds mới
    return orderedColumnsState.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setOrderedColumnsState(prevColumns => {
      //Tìm vị trí (index) của cái overCard trong column đích (nơi mà activeCard sắp được thả)
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)


      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

      //Clone mảng OderedColumnsState cũ ra một cái mơi để xử lý data rồi return
      // cập nhật lại OrderedColumnsState mới
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

      if (nextActiveColumn) {
        // Xóa card ở cái column active ( cũng có thể hiểu là column cũ, cái lúc mà kéo card
        // ra khỏi nó để sang column khác)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }
        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }
      if (nextOverColumn) {
        // Kiểm tra xem card đang kéo nó có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Đối với trường hợp dragEnd thì phải cập nhật lại chuẩn dữ liệu columId trong card sau khi kéo card
        // giữa 2 column khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        // Tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)
        // Xóa cái Placeholder Card đi nếu nó đang tồn tại
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)
        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }

      if (triggerFrom === 'handleDragEnd') {
        /**
         * Phải dùng tới activeDragData.columnId hoặc tốt nhất là oldColumnWhenDraggingCard._id
         * (set từ bước onDragStart) chức không phải activeData trong scope hanhleDragEnd này
         * vì sau khi đi qua onDragOver và tới đây là state của card đã bị cập nhật một lần rồi
         */
        moveCardToDifferentColumn(
          activeDraggingCardId,
          oldColumnWhenDraggingCard._id,
          nextOverColumn._id,
          nextColumns
        )
      }
      return nextColumns
    })
  }
  const handleDragStart = (event) => {
    // console.log('handleDragEnd: ', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    // console.log(event?.active?.data?.current?.columnId)
    setActiveDragItemData(event?.active?.data?.current)

    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  // Trigger trong quá trình kéo (drag) over
  const handleDragOver = (event) => {
    // Không làm gì thêm nếu đang kéo Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return
    }
    // Còn nếu kéo thả card thì xử lý thêm để có thể kéo card qua lại giữa các columns
    // console.log('handleDragOver: ', event)
    const { active, over } = event

    //  Cần đảm bảo nếu không tồn tại active hoặc over ( khi kéo thả ra khỏi phạm vi container ) thì không làm gì
    // (tránh crash trang)
    if (!active || !over) return
    // activeDragingCard là card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // overCard là card đang tương tác trên hoặc dưới so với card được kéo ở trên
    const { id: overCardId } = over

    // Tìm 2 cái column theo cardId
    const activeColumn = findColumnByCardId(activeDragItemId)
    const overColumn = findColumnByCardId(overCardId)

    //  Nếu không tồn tại 1 trong 2 column thì không làm gì hết, tránh crash trang web
    if (!activeColumn || !overColumn) return

    //  Xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau. còn nếu kéo card trong chính
    // column ban đầu của nó thì không lam gì
    // Vì đây đang là đoạn xử lý trước lúc kéo (handleDragOver), còn khi xử lý lúc kéo xong xuôi thì
    // nó lại  là vấn đề khác ở(handleDragEnd)
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        'handleDragOver'
      )
    }
  }

  const handleDragEnd = (event) => {
    //console.log('handleDragEnd: ', event)
    const { active, over } = event

    if (!active || !over) return
    //Xử lý kéo thả Cards
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // activeDragingCard là card đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      // overCard là card đang tương tác trên hoặc dưới so với card được kéo ở trên
      const { id: overCardId } = over

      // Tìm 2 cái column theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      //  Nếu không tồn tại 1 trong 2 column thì không làm gì hết, tránh crash trang web
      if (!activeColumn || !overColumn) return

      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          'handleDragEnd'
        )
      } else {
        // Hành động kéo thả card trong cùng một column

        // Lấy vị trí cũ từ (từ thằng oldColumnWhenDraggingCard)
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        // Lấy vị trí cũ từ (từ thằng over)
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)

        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
        const dndOrderedCardIds = dndOrderedCards.map(card => card._id)

        setOrderedColumnsState(prevColumns => {
          //Clone mảng OderedColumnsState cũ ra một cái mơi để xử lý dât rồi return
          // cập nhật lại OrderedColumnsState mới
          const nextColumns = cloneDeep(prevColumns)

          // Tìm tới column chúng ta đang thả
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)

          // Cập nhật lại 2 giá trị mới là card và cardOrderIds trong cai targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCardIds

          return nextColumns

        })
        /*
          Gọi lên props function moveColuans nằm ở component cha cao nhất(boards/_id.jsx)
          Lưu ý: nên đưa dữ liệu board ra ngoài Redux Global Store, và lúc này chúng ta có thé goi luón API
          ở đây là xong thay vì phải lần lượt gọi ngược lên những
          component cha phia bên trên
        */
        moveCardInTheSameColumn(dndOrderedCards, dndOrderedCardIds, oldColumnWhenDraggingCard._id)
      }

    }
    // Xử lý kéo thả columns
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // Nếu vị trí sau khi kéo thả khác với vị trí ban đầu
      if (active.id !== over.id) {
        // Lấy vị trí cũ từ (từ thằng active)
        const oldColumnIndex = orderedColumnsState.findIndex(c => c._id === active.id)
        // Lấy vị trí cũ từ (từ thằng over)
        const newColumnIndex = orderedColumnsState.findIndex(c => c._id === over.id)

        // Dùng arrayMove của thằng dnd-kit đê xắp xếp lại mảng Column ban đầu
        //https://github.com/clauderic/dnd-kit/blob/master/packages/sortable/src/utilities/arrayMove.ts
        const dndOrderedColumns = arrayMove(orderedColumnsState, oldColumnIndex, newColumnIndex)


        /*
          Gọi lên props function moveColuans nằm ở component cha cao nhất(boards/_id.jsx)
          Lưu ý: nên đưa dữ liệu board ra ngoài Redux Global Store, và lúc này chúng ta có thé goi luón API
          ở đây là xong thay vì phải lần lượt gọi ngược lên những
          component cha phia bên trên
        */
        moveColumns(dndOrderedColumns)


        // vẫn gọi update state ở đây để tránh delay hoặc Flickering giao diện lúc kéo thả
        // cần phải chở gọi API
        setOrderedColumnsState(dndOrderedColumns)

      }
    }

    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }


  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  // Chúng ta sẽ custom lại chiến lược / thuật toán phát hiện va chạm tối ưu cho việc kéo thả
  // card giữ nhiều columns
  // args = arguments = các đối số, tham số
  const collisionDetectionStrategy = useCallback((args) => {
    // Trường hợp kéo column thì dùng thuật toán closestCorners
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }
    // Tìm các điểm giao nhau, va chạm = intersections với con trỏ
    const pointerIntersections = pointerWithin(args)

    // Nếu pointerIntersections là mảng rỗng thì return luôn không làm gì ca.
    // ** Kéo thả card có image cover lớn và kéo lên phía trên cùng ra khỏi khu vực kéo thả
    if (!pointerIntersections?.length) return

    // Thuật toán phát hiện va chạm sẽ trả về một mảng các va chạm ở đây
    // const intersections = pointerIntersections?.length > 0
    //   ? pointerIntersections
    //   : rectIntersection(args)

    let overId = getFirstCollision(pointerIntersections, 'id')

    if (overId) {
      // Nếu cái over nó là column thì sẽ tìm tới cái cardId gần nhất bên trong khu vực
      //va chạm đó dựa vào thuật toán phát hiện va chạm closestCenter hoặc closestCorners đều được
      //Tuy nhiên ở đây dùng closestCorners thấy mượt hơn

      const checkColumn = orderedColumnsState.find(column => column._id === overId)
      if (checkColumn) {
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return container.id !== overId && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }

    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType, orderedColumnsState])


  return (
    <DndContext
      // cảm biến(chuột, ngón tay, bút cảm ứng)
      sensors={sensors}
      // Thuật toán phát hiện va chạm (nếu không có nó thì card với cover lớ
      // sẽ không kéo qua kéo qua Column được vì lúc này nó đang bị conflict (xung dột)
      // giữa card va column), chúng ta sẽ dùng closesCorners thay vì closesCenter

      // Nếu chỉ dùng closestCorners sẽ có bug flickering + sai lệch giữ liệu
      //collisionDetection={closestCorners}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        {/*BOX COLUMN*/}
        <ListColumn
          columns={orderedColumnsState}
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}
        />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData} />}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext>

  )
}

export default BoardContent