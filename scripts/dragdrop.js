window.DragDrop = {
  makePieceDraggable(element, pieceId, onDragStart) {
    element.draggable = true;
    element.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', pieceId);
      if (onDragStart) onDragStart(pieceId);
    });
  },

  makeDropTarget(element, onDrop) {
    element.addEventListener('dragover', e => {
      e.preventDefault();
      element.classList.add('drag-over');
    });
    element.addEventListener('dragleave', () => element.classList.remove('drag-over'));
    element.addEventListener('drop', e => {
      e.preventDefault();
      element.classList.remove('drag-over');
      const pieceId = e.dataTransfer.getData('text/plain');
      onDrop(pieceId);
    });
  },
};
