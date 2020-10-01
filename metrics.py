from math import floor
import numpy as np

"""
In the literature there are two definitions of ENL
"""


def enl(patch):
    """ equivalent number of looks (ENL) """
    mu = np.mean(patch)
    var = np.var(patch)
    return mu * mu / var


def dei(img, n, m, stride=1):
    """Despeckling evaluation index

    Args:
        img: despeckled image as numpy array
        n: window size of large window (odd)
        m: window size of small window (odd, m < n)
        stride: px between window centers (default=1)

    Returns:
        The DEI value
    """
    N = img.size / (stride * stride)

    small_stds = dei_std(img, m, stride)
    big_stds = dei_std(img, n, stride)

    dei_sum = 0.0
    small_in_big = floor((n - m + 1) / stride)  # how many m windows fit in n (per axis)
    pad = max(0, floor((floor(n / 2) - m) / stride))  # The small window must contain center pixel of large window
    for r, big_row in enumerate(big_stds):
        r0 = r + pad
        r1 = r + small_in_big - pad
        for c, big_std in enumerate(big_row):
            c0 = c + pad
            c1 = c + small_in_big - pad
            small_std = np.min(small_stds[r0:r1, c0:c1])
            dei_sum += small_std / big_std

    return dei_sum / N


def dei_std(img, u, stride=1):
    """Standard deviation values for a sliding window

    Args:
        img: image as numpy array
        u: window size (odd)
        stride: px between window centers (default=1)

    Returns:
        Numpy array of windowed standard deviation values
    """
    trim = u - 1
    rows = floor((img.shape[0] - trim) / stride)
    cols = floor((img.shape[1] - trim) / stride)
    windowed_std = np.zeros((rows, cols), dtype=np.float32)
    for r in range(windowed_std.shape[0]):
        ir = r * stride
        for c in range(windowed_std.shape[1]):
            ic = c * stride
            window = img[ir : ir + u, ic : ic + u]
            windowed_std[r, c] = np.std(window)
    return windowed_std
