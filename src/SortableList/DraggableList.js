import React, { useState, useEffect } from "react";
import { animated, useSprings } from "react-spring";
import { useGesture } from "react-use-gesture";
import styled from "styled-components";
import DefineWidthContainer from "./DefineWidthContainer";

const DraggableContainer = styled(DefineWidthContainer)`
  cursor: ${(props) => (props.isGrabbing ? "grabbing" : "pointer")};
  user-select: none;
  position: absolute;
  top: 0;
  display: inline-block;
`;

const DraggableItemWrapper = styled(animated.div)`
  width: 100%;
  pointer-events: auto;
  box-sizing: border-box;
`;

const Place = styled(animated.div)``;

export default ({ items, Renderer, moveItem }) => {
  const [isGrabbing, setIsGrabbing] = useState(false);

  const containerRef = React.useRef(null);
  const [placeData, setPlaceData] = useState({});

  useEffect(() => {
    if (containerRef.current) {
      const placeDataTmp = {};
      const elements = containerRef.current.querySelectorAll("[data-id]");
      for (let i = 0; i < elements.length; i++) {
        const itemId = elements[i].getAttribute("data-id");
        placeDataTmp[itemId] = {
          top: elements[i].getBoundingClientRect().top,
        };
      }
      setPlaceData(placeDataTmp);
    }
  }, []);

  // AVAILABLE PLACES FOR DROP
  // for every item we create place that we render after it, where it is possible to drop element
  //  besides items after Separatator firstUnsortable:true
  const placeIndex = {};

  let index = 0;
  for (let item of items) {
    if (item.firstUnsortable) {
      break;
    }
    placeIndex[item.id] = index;
    index++;
  }
  // add last place in the end of list
  placeIndex[items[items.length - 1].id] = index;

  // animated props for PLACES
  const [placeProps, setPlaceProps] = useSprings(
    Object.keys(placeIndex).length,
    (i) => ({
      height: 0,
    })
  );
  const stylesPlace = {};
  for (let itemId in placeIndex) {
    stylesPlace[itemId] = placeProps[placeIndex[itemId]];
  }

  // animated props from ITEMS
  const [itemProps, setItemProps] = useSprings(items.length, (i) => ({
    zIndex: 0,
    position: "relative",
    top: 0,
  }));

  const styles = {};
  let i = 0;
  const itemIndex = {};

  for (let item of items) {
    const props = itemProps[i];
    styles[item.id] = {
      zIndex: props.zIndex,
      position: props.position,
      top: props.top,
    };
    itemIndex[item.id] = i;
    i++;
  }

  let currentItemHeight = 0;
  let currentItemId = 0;
  let diff = 0;

  const bind = useGesture({
    onDrag: ({ args: [id], down, xy: [, y], event, distance, memo = {} }) => {
      if (down) {
        if (distance < 1) return;

        if (!currentItemId) {
          currentItemId = id;
          const props = event.target.getBoundingClientRect();
          currentItemHeight = props.height;
          diff = y - props.top;
          setIsGrabbing(true);
        }

        let shortDistance = null;
        let nearestItemId = null;

        for (let itemId in placeData) {
          if (itemId === nearestItemId) continue;
          const data = placeData[itemId];
          let distance = Math.abs(data.top - (y - diff));
          if (distance < shortDistance || shortDistance === null) {
            shortDistance = distance;
            nearestItemId = +itemId;
          }
        }

        setItemProps((i) => {
          if (i !== itemIndex[currentItemId]) return { zIndex: 0 };
          return {
            zIndex: 1,
            position: "fixed",
            immediate: true,
            top: y - diff,
          };
        });

        setPlaceProps((i) => {
          return {
            height: i === placeIndex[nearestItemId] ? currentItemHeight : 0,
            immediate: i === placeIndex[nearestItemId] ? !memo.wasStart : false,
          };
        });

        return { wasStart: true, nearestItemId };
      } else {
        setIsGrabbing(false);
        setPlaceProps((i) => ({
          height: i === placeIndex[memo.nearestItemId] ? currentItemHeight : 0,
          immediate: true,
        }));

        setItemProps((i) => {
          if (i !== currentItemId) return;
          else
            return {
              immediate: true,
              top:
                placeData[memo.nearestItemId].top -
                (placeIndex[currentItemId] <= placeIndex[memo.nearestItemId]
                  ? currentItemHeight
                  : 0),
               onRest: () => { 

                //moveItem(currentItemId, itemIndex[memo.nearestItemId] + 1)
               }   
            };
        });
        
        
        return false;
      }
    },
  });

  return (
    <DraggableContainer isGrabbing={isGrabbing} ref={containerRef}>
      {items.map((item) => {
        const animateProps = item.isStatic ? {} : bind(item.id);

        return (
          <React.Fragment key={item.id}>
            <DraggableItemWrapper {...animateProps} style={styles[item.id]}>
              <Renderer item={item} />
            </DraggableItemWrapper>

            {placeIndex[item.id] !== undefined && (
              <Place style={stylesPlace[item.id]} data-id={item.id} />
            )}
          </React.Fragment>
        );
      })}
    </DraggableContainer>
  );
};
