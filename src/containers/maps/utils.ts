/**
 * Returns the size of the map in width x height string
 * @param size
 */
const mapSizeToString = (size: number) => {
  switch (size) {
    case 0: {
      return '5x5';
    }
    case 1: {
      return '10x10';
    }
    case 2: {
      return '20x20';
    }
    case 3: {
      return '40x40';
    }
    case 4: {
      return '80x80';
    }
    default:
      return 'unknown';
  }
};

export { mapSizeToString };
