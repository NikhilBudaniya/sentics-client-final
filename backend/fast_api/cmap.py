import numpy as np
from matplotlib import pyplot as plt
from matplotlib.colors import ListedColormap

def cmap_with_alpha(name, alpha):
    orig_cmap = plt.get_cmap(name)
    cmap = orig_cmap(np.arange(orig_cmap.N))
    cmap[:, -1] = alpha
    cmap = ListedColormap(cmap)
    return cmap