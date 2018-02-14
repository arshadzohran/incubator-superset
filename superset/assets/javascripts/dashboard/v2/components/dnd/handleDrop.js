export default function handleDrop(props, monitor, Component) {
  Component.setState(() => ({ dropIndicator: null }));
  const {
    components,
    component,
    parentId,
    index: componentIndex,
    onDrop,
    orientation,
    isValidChild,
    isValidSibling,
  } = Component.props;

  const draggingItem = monitor.getItem();

  // if dropped self on self, do nothing
  if (!draggingItem || draggingItem.draggableId === component.id) {
    console.log(draggingItem ? 'drop self' : 'drop no item');
    return undefined;
  }

  // append to self, or parent
  const validChild = isValidChild({
    parentType: component.type,
    childType: draggingItem.type,
  });

  const validSibling = isValidSibling({
    parentType: components[parentId] && components[parentId].type,
    siblingType: draggingItem.type,
  });

  if (!validChild && !validSibling) {
    console.log('not valid drop child or sibling')
    return undefined;
  }

  const dropResult = {
    source: draggingItem.parentId ? {
      droppableId: draggingItem.parentId,
      index: draggingItem.index,
    } : null,
    draggableId: draggingItem.draggableId,
  };

  if (validChild) { // append it to component.children
    dropResult.destination = {
      droppableId: component.id,
      index: component.children.length,
    };
  } else { // insert as sibling
    let nextIndex = componentIndex;
    const refBoundingRect = Component.ref.getBoundingClientRect();
    const clientOffset = monitor.getClientOffset();

    if (clientOffset) {
      if (orientation === 'horizontal') {
        const refMiddleY =
          refBoundingRect.top + ((refBoundingRect.bottom - refBoundingRect.top) / 2);
        nextIndex += clientOffset.y >= refMiddleY ? 1 : 0;
      } else {
        const refMiddleX =
          refBoundingRect.left + ((refBoundingRect.right - refBoundingRect.left) / 2);
        nextIndex += clientOffset.x >= refMiddleX ? 1 : 0;
      }
    }

    // if the item is in the same list with a smaller index, you must account for the
    // "missing" index upon movement within the list
    if (
      draggingItem.parentId
      && draggingItem.parentId === parentId
      && draggingItem.index < nextIndex
    ) {
      nextIndex = Math.max(0, nextIndex - 1);
    }

    dropResult.destination = {
      droppableId: parentId,
      index: nextIndex,
    };
  }

  onDrop(dropResult);

  return dropResult;
}
