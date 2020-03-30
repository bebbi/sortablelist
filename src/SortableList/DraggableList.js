import React, { useState, useMemo, useCallback } from 'react'
import { animated, interpolate } from 'react-spring'
import useSprings from './useSpringsFixed'
import { useGesture } from 'react-use-gesture'
import clamp from 'lodash/clamp'
import swap from 'lodash-move'
import styled from 'styled-components'
import DefineWidthContainer from './DefineWidthContainer'

const DraggableContainer = styled(DefineWidthContainer)`
  cursor: ${props => (props.isGrabbing ? 'grabbing' : 'pointer')};
  user-select: none;
  position: absolute;
  top: 0;
  display: inline-block;
`

const DraggableItemWrapper = styled(animated.div)`
  position: absolute;
  width: 100%;
  pointer-events: auto;
  tranform-origin: 50% 50% 50%;
`

const preventClickOnDrag = hasMoved => e => {
  if (hasMoved) {
    e.stopPropagation()
  }
}

const sum = arr => arr.reduce((a, b) => a + b, 0)

/*
 *heights need to be ordered per current temporary order.
 */
const getHeightsUpTo = (orderedHeights, index, debug) => {
  return sum(orderedHeights.slice(0, index))
}

/*
 * Returns spring styles for dragged/idle items
 * Note: heights are in the original item order.
 */
const getSpringParams = (
  order,
  heights,
  down,
  originalIndex,
  curIndex,
  y,
  // The starting top position of the selected element shouldn't change during
  // one gesture.
  curTop
) => index => {
  return Object.assign(
    { reset: false },
    down && index === originalIndex
      ? // This is the one we're moving.
        {
          y: curTop + y,
          // The condition is for a slight visual hint that we're dragging, not
          // (long) clicking.
          scale: y ? 1.1 : 1,
          zIndex: '1',
          shadow: 15,
          immediate: attr => attr === 'y' || attr === 'zIndex'
        }
      : // These are the others that get animated.
        {
          // orig
          // y: order.indexOf(index) * height,
          y: getHeightsUpTo(heights, order.indexOf(index), true),
          scale: 1,
          zIndex: '0',
          shadow: 1,
          immediate: false
        }
  )
}

// Avoid a strange animation given our work-around.
const resetSpringParams = (...args) => index => {
  const params = getSpringParams(...args)(index)
  return {
    ...params,
    immediate: true,
    reset: true
  }
}

const findItemIndex = (items, prop) => {
  const found = items.findIndex(item => item[prop] === true)
  return found !== -1 ? found : items.length - 1
}

export default function DraggableList({
  items,
  heights: startHeights,
  Renderer,
  moveItem
}) {
  const [update, updateState] = useState()
  const forceUpdate = useCallback(
    // Reason for the timeout is that without, it works in dev but not on a
    // minified file.
    // It's possible that there's a race condition; that e.g. startHeights is
    // delivered after our call to force update.
    // As an alternative to this separate state, we could make items a state and
    // set it to [...items].
    () =>
      setTimeout(() => {
        updateState({})
      }, 100),
    []
  )

  const [isGrabbing, _setGrabbing] = useState(false)

  const setGrabbing = enable => {
    if (enable) {
      _setGrabbing(true)
      return
    }

    setTimeout(() => {
      _setGrabbing(false)
    }, 10)
  }

  const order = useMemo(() => {
    return items.map((_, i) => i)
  }, [items])

  const heights = useMemo(() => {
    return order.map(idx => startHeights[idx])
  }, [order, startHeights])

  /*
   * element heights and total content height.
   */
  const contentHeight = useMemo(() => {
    return sum(heights)
  }, [heights])

  const firstUnsortableIndex = useMemo(() => {
    return findItemIndex(items, 'firstUnsortable')
  }, [items])

  const droppableIndex = useMemo(() => {
    return findItemIndex(items, 'droppable') + 1
  }, [items])

  const [springs, setSprings] = useSprings(
    items.length,
    getSpringParams(order, heights),
    [items, order, heights, update]
  )

  const bind = useGesture({
    onDrag: ({ args: [originalIndex], down, delta: [, y] }) => {
      // Once we move the card (and haven't set already), set isGrabbing.
      if (!isGrabbing && y !== 0) {
        // TODO: could be called multiple times (async)
        setGrabbing(true)
      }
      const curIndex = order.indexOf(originalIndex)

      const searchUp = y < 0
      const unit = searchUp ? -1 : 1

      let candidateIdx = curIndex
      let heightCheckIdx = curIndex + unit //(searchUp ? -1 : 0)
      let remainder = Math.abs(y)
      // Direction down!

      while (remainder > heights[order[heightCheckIdx]]) {
        remainder -= heights[order[heightCheckIdx]]
        heightCheckIdx += unit
        candidateIdx += unit
      }

      // Infinity is for the clamping to work when out of array bounds.
      // const nextHeight = heights[order[candidateIdx + unit]] || Infinity
      const nextHeight = heights[order[heightCheckIdx]] || Infinity

      // Now we know the index it's hovering over. But is it over 50%?
      const selectedIndex = Math.round(
        candidateIdx + (unit * remainder) / nextHeight
      )

      const maxIndex =
        firstUnsortableIndex - (firstUnsortableIndex > curIndex ? 1 : 0)
      const dropIndex = droppableIndex - (droppableIndex > curIndex ? 1 : 0)

      const curRow =
        selectedIndex === curIndex
          ? // Can always return to existing index
            curIndex
          : // If selected row below the index to drop stuff
          selectedIndex >= dropIndex
          ? // ..then if we come from above (a sortable item)
            curIndex < firstUnsortableIndex
            ? // ..put it at the drop location
              dropIndex
            : // else (from an unsortable location) don't allow to move anywhere
              // inside the unsortable items - can only stay or move up above
              // firstUnsortableIndex.
              curIndex
          : clamp(selectedIndex, 1, maxIndex)

      const newOrder = swap(order, curIndex, curRow)
      const swappedHeights = swap(heights, curIndex, curRow)
      // Feed springs new style data, they'll animate the view without causing a single render

      // We calculate this on the original order and heights so the grabbed element's y position
      // stays predictable despite different element heights.
      const curTop = getHeightsUpTo(heights, originalIndex)

      setSprings(
        getSpringParams(
          newOrder,
          swappedHeights,
          down,
          originalIndex,
          curIndex,
          y,
          curTop
        )
      )

      if (!down) {
        setGrabbing(false)
        // Need to reset the order here. Outside of this bind function, won't
        // display the update.
        // This works because immediately afterwards we should receive the newly
        // sorted items from the caller.
        // It would be cleaner to keep a separate order ref and update that and
        // only reset it when new items come from the client, but that doesn't seem
        // to work because I can't get the springs to update the view outside the
        // bind loop.
        // To respect different item sizes, the order should be provided per the reset
        // status, but the heights per the changed order that we'll expect
        // the updated items in (swappedHeights).
        setSprings(
          resetSpringParams(
            order,
            swappedHeights,
            down,
            originalIndex,
            curIndex,
            y,
            curTop
          )
        )

        // This, plus its dependency in useSprings, is only required because
        // we abort some moves in the preliminary UI.
        // This leads to the situation where the spring params are reset per
        // the swapped heights, but then items stay the same, leading to not
        // refreshing the list and thus bad item offsets.
        forceUpdate()

        if (curIndex !== curRow) {
          // setItems(swap(items, curIndex, curRow))
          moveItem(items[originalIndex].id, curRow)
        }
      }
    }
  })

  return (
    <DraggableContainer
      isGrabbing={isGrabbing}
      style={{ height: contentHeight }}
    >
      {springs.map(({ zIndex, shadow, y, scale }, i) => {
        const item = items[i]

        const animateProps = item.isStatic ? {} : bind(i)

        return (
          <DraggableItemWrapper
            {...animateProps}
            key={item.id}
            onClickCapture={preventClickOnDrag(isGrabbing)}
            style={{
              zIndex,
              boxShadow: shadow.interpolate(
                s => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`
              ),
              transform: interpolate(
                [y, scale],
                (y, s) => `translate3d(0,${y}px,0) scale(${s})`
              )
            }}
          >
            <Renderer item={item} />
          </DraggableItemWrapper>
        )
      })}
    </DraggableContainer>
  )
}
