import numpy as np


def removeOutliers(data, minDelta=0,windowHalfSize=5):#Window len=windowHalfSize*2+1
    def strided_app(a, L, S ):  # Window len = L, Stride len/stepsize = S
        nrows = ((a.size-L)//S)+1
        n = a.strides[0]
        return np.lib.stride_tricks.as_strided(a, shape=(nrows,L), strides=(S*n,n))
    res = np.array(data)
    WindowLen = 2*windowHalfSize +1
    if res.shape[0]>WindowLen:
        pp = np.nanpercentile( strided_app(res,WindowLen,1), [25,75], axis=-1)
        vals= res[windowHalfSize:-windowHalfSize]
        nanmask = np.logical_or(np.isnan(vals),np.isnan(pp[0]))
        nanmask = ~np.logical_or(nanmask,np.isnan(pp[0]))
    
        IRQ = 1.5*(pp[1] - pp[0])
        IRQ=np.clip(IRQ, minDelta, None)
        pp[0] -= IRQ;
        pp[1] += IRQ;
        mask = np.zeros_like(vals,dtype=np.bool)
        vals = vals[nanmask]
        pp=pp[:,nanmask]
        mask[nanmask]=np.logical_or(vals<pp[0],vals>pp[1])
        (res[windowHalfSize:-windowHalfSize])[mask] = np.nan
    return res

def FillNan_LinInterp(data):
    res = np.array(data);
    NanMask = np.isnan(data)
    notNan = ~NanMask
    x = np.arange(data.shape[0])
    res[NanMask] = np.interp(x[NanMask],x[notNan],data[notNan])
    return res

def PrepareBeautifulData(data):
    return FillNan_LinInterp(removeOutliers(data))
