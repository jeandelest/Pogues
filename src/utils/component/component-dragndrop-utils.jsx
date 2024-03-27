import {
  couldInsertToSibling,
  couldInsertAsChild,
  isQuestion,
  isSequence,
  isSubSequence,
} from './component-utils';
import { COMPONENT_TYPE } from '../../constants/pogues-constants';

const { SEQUENCE } = COMPONENT_TYPE;

/**
 *
 * This method is used to to determine at which level we should insert a component. The dragged
 * component can become :
 * - a sibling of the dropped component -> level = 0
 * - a child of the dropped component -> level = 1
 * - a parent of the drocpped component -> level = -1
 * - a grand parent of the dropped component -> level = -2
 * @param {object} droppedComponent The component we are currently dropping something in
 * @param {object} draggedComponent The component we are currently dragging
 */
export function getDragnDropLevel(droppedComponent, draggedComponent) {
  if (draggedComponent && droppedComponent) {
    if (couldInsertToSibling(droppedComponent.component, draggedComponent)) {
      return 0;
    } else if (
      couldInsertAsChild(droppedComponent.component, draggedComponent)
    ) {
      return 1;
    }
    return (isSequence(draggedComponent) &&
      isSubSequence(droppedComponent.component)) ||
      (isSubSequence(draggedComponent) &&
        isQuestion(droppedComponent.component))
      ? -1
      : -2;
  }
  return 0;
}

/**
 * This method is used to calcul the margin we should add to an element.
 * Based on the result of the getDragnDropLevel method, we should add/remove a
 * 20px margin.
 *
 * If getDragnDropLevel return 1, we do not add any margin, because the dragged
 * component will become a child, and based of the HTML, a margin is automatically added.
 *
 * @param {object} droppedComponent The component we are currently dropping something in
 * @param {object} draggedComponent The component we are currently dragging
 * @param {number} dragndropLevel The result of the getDragnDropLevel method
 * @param {string} parentType The type of the droppedComponent's parent
 */
export function calculateMargin(
  droppedComponent,
  draggedComponent,
  dragndropLevel,
  parentType,
) {
  if (dragndropLevel < 0) {
    if (parentType === SEQUENCE && isQuestion(droppedComponent.component)) {
      return dragndropLevel * 20;
    }
    return (dragndropLevel - 1) * 20;
  }
  if (dragndropLevel === 0) {
    return -20;
  }
  return 0;
}
