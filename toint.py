#!/usr/bin/env python3

import sys
import re
import numpy as np
import tifffile as tif


def main():
    args = sys.argv[1:]
    assert len(args) == 1
    filename = args[0]
    assert "_flt_" in filename
    fileout = re.sub("_flt_", "_int_", filename)
    img = tif.imread(filename)
    img = np.clip(img, 0, 255).astype(np.uint8)
    tif.imwrite(fileout, img)


if __name__ == "__main__":
    main()
