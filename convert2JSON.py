
import base64
import numpy as np
import json

#np.array2string(
#           np.array([0.59,5.0, 1.42,1.93,3.42,4.30,5.16]),
#  precision=4, separator=',',max_line_width=23*1024,suppress_small=True,floatmode="unique")

#base64.b64encode(np.array([0.59,5.0, 1.42,1.93,3.42,4.30,5.16]))

#class Convert2JSON:
#    def __init__(self):
#        pass

#    @classmethod
#    def numberToString(cls,x):
#        return "{0:.4f}".format(x)

#    @classmethod
#    def get_json_string(cls):
#        x="["+",".join( map(self.numberToString,self.x))+"]"
#        y=",".join( map(self.numberToString,self.y))
#        s = '{"x":['+x+'], "y":['+y+']}'
#        return s

class SocketMessageData:
    @classmethod
    def numberToString4(cls,x):
            return "{0:.4f}".format(x)

    @classmethod
    def get_list_string(cls,l:list):
        return "["+",".join( map(SocketMessageData.numberToString,l))+"]"

    #@classmethod
    #def ToJSON(cls,sensorData=None,state=None,i=0):
    #    data = None
    #    st  = None
    #    if (sensorData is not None):
    #        #sd = np.nan_to_num(sensorData)
    #        mask = np.isnan(sensorData);
    #        sd = np.array(sensorData, copy=True)
    #        sd[mask] = -1.0;
    #        data = {"time": i, "load": sd[1], "frictionforce":sd[2], "rotationrate": sd[3], "temperature": sd[4],"vibration":0.0}
    #    if (state is not None):
    #        st = dict(vars(state))
    #    return json.dumps( {"sensorData":data,"state":st} )

    @classmethod
    def ToJSON_b64(cls,experiment=None,state=None,i=0):
        data = json.dumps(None)
        st  = data
        if (experiment is not None):
            data = experiment.ConvertTob64String();
        if (state is not None):
            st = state.getJson()
        return '{"sensorData":'+data+',"state":'+st+'}'

    def __init__(self,sensorData=None,state=None):
        self.sensorData = sensorData
        self.state = state


if __name__ == '__main__':
    pass