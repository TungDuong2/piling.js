import createPilingJs from '../src/library';
import { createImageRenderer } from '../src/renderer';

const createPhotoPiles = async element => {
  const imageRenderer = createImageRenderer();

  const response = await fetch('data/photos.json');
  const data = await response.json();

  const piling = createPilingJs(element);

  piling.set('itemSize', 300);
  piling.set('renderer', imageRenderer);
  piling.set('items', data);
  piling.set('itemPadding', 10);

  piling.set('pileCellAlign', 'center');

  return piling;
};

export default createPhotoPiles;
