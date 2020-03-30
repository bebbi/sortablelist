import React, { useState, useCallback, useEffect } from 'react'
import DraggableList from './DraggableList'
import ListMeasurer from './ListMeasurer'
import swap from 'lodash-move'

/*
 * Provide alternatively setItems or moveItem.
 * items need a `id` prop.
 * Renderer needs an `item` prop.
 */
export default ({ items, setItems, moveItem, Renderer }) => {
  const [heights, setHeights] = useState([])

  // Whenever we receive new items, reset the heights.
  // Note we could receive items of different length.
  useEffect(() => {
    setHeights(items.map(() => 0))
  }, [items])

  const setBounds = useCallback(
    bounds => {
      setHeights(bounds.map(({ top, bottom }) => bottom - top))
    },
    [setHeights]
  )

  const _moveItem = (id, newIndex) => {
    // This is our api call.
    if (moveItem) {
      moveItem(id, newIndex)
    }
    if (setItems) {
      const oldIndex = items.findIndex(item => item.id === id)
      if (oldIndex === -1) {
        throw new Error('Id of moved item not found.')
      }
      const newItems = swap(items, oldIndex, newIndex)
      setItems(newItems)
    }
  }

  return heights.length !== items.length ? null : (
    <div style={{ position: 'relative' }}>
      <ListMeasurer items={items} Renderer={Renderer} setBounds={setBounds} />
      <DraggableList
        items={items}
        heights={heights}
        Renderer={Renderer}
        moveItem={_moveItem}
      />
    </div>
  )
}
