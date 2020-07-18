/**
 * Returns the size of the map in width x height string
 * @param size
 */
const mapSizeToString = (size: number, short = false) => {
  switch (size) {
    case 0: {
      return short ? '5' : '5x5';
    }
    case 1: {
      return short ? '10' : '10x10';
    }
    case 2: {
      return short ? '20' : '20x20';
    }
    case 3: {
      return short ? '40' : '40x40';
    }
    case 4: {
      return short ? '80' : '80x80';
    }
    default:
      return 'n/a';
  }
};

export { mapSizeToString };
