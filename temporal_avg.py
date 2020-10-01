#!/usr/bin/env python3

import argparse
import os
import tifffile as tif
import numpy as np
from model.util import PolarityType


def main():
    parser = argparse.ArgumentParser(
        description="Get temporal average of all tif intensity images in a directory",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "-s",
        "--single_channel_output",
        action="store_true",
        default=True,
        help="create a separate file for each channel (polarity)",
    )
    parser.add_argument("input", type=str, help="directory of tif images")
    parser.add_argument("output", type=str, help="output file")
    args = parser.parse_args()

    dirin = args.input
    fileout = args.output

    imgout = None
    files = os.listdir(dirin)
    rows = np.Inf
    cols = np.Inf
    n = 0
    for f in files:
        file = os.path.join(dirin, f)
        if not os.path.isfile(file) or f[-4:] != ".tif":
            print(f"Undexpected file {f}")
            continue
        imgin = tif.imread(file)
        if imgout is None:
            imgout = np.zeros(imgin.shape, dtype=np.float32)

        # because images are sometimes of different size, find min rows, cols
        rows = min(imgin.shape[0], rows)
        cols = min(imgin.shape[1], cols)
        imgout[:rows, :cols] += imgin[:rows, :cols]
        n += 1

    if n == 0:
        print("No matching files found")
        return 0

    # trim output to pixels where all input images had values
    imgout = imgout[:rows, :cols] / n

    # Save
    if args.single_channel_output:
        for polarity in PolarityType:
            tif.imwrite(fileout[:-4] + "_" + polarity.name + ".tif", imgout[:, :, polarity.value])
    else:
        tif.imwrite(fileout, imgout)


if __name__ == "__main__":
    main()
