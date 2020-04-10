import React from "react";
import DraggableList from "./DraggableList";
import swap from "lodash-move";

/*
 * Provide alternatively setItems or moveItem.
 * items need a `id` prop.
 * Renderer needs an `item` prop.
 */
export default ({ items, setItems, moveItem, Renderer }) => {
  // Whenever we receive new items, reset the heights.
  // Note we could receive items of different length.

  const _moveItem = (id, newIndex) => {
    // This is our api call.
    if (moveItem) {
      moveItem(id, newIndex);
    }
    if (setItems) {
      const oldIndex = items.findIndex((item) => item.id === id);
      if (oldIndex === -1) {
        throw new Error("Id of moved item not found.");
      }
      const newItems = swap(items, oldIndex, newIndex);
      setItems(newItems);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <DraggableList items={items} Renderer={Renderer} moveItem={_moveItem} />
    </div>
  );
};
