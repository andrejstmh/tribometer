import json
import os
import threading
import time
import http.client
import platform
import tornado.ioloop

import tornado.web
import tornado.websocket
from tornado.platform.asyncio import AsyncIOMainLoop
from tornado.ioloop import IOLoop

from rx import config,Observable
from rx.subjects import Subject
import webbrowser

import numpy as np
from exp_settings import ExpStatus
import convert2JSON

def checkServer():
    #conn = http.client.HTTPConnection('http://localhost', 8787, timeout=100)
    #conn.request("HEAD", "/")
    #r1 = conn.getresponse()
    #print(r1)
    #conn.close()
    #return r1.status==200
    import tornado.httpclient
    res = False
    http_client = tornado.httpclient.HTTPClient()
    try:
        response = http_client.fetch("http://localhost:8787/api/sett?case=state",method="GET")
        res = True
    except tornado.httpclient.HTTPError as e:
        # HTTPError is raised for non-200 responses; the response
        # can be found in e.response.
        #print("Error: " + str(e))
        res = False
    except Exception as e:
        # Other errors are possible, such as IOError.
        print("Error: " + str(e))
        res = False
    http_client.close()
    return res

class DataSocketHandler(tornado.websocket.WebSocketHandler):
    waiters = set()
    def check_origin(self, param):
        return True

    def get_compression_options(self):
        # Non-None enables compression with default options.
        return {}
    def open(self):
        DataSocketHandler.waiters.add(self)
    def on_close(self):
        DataSocketHandler.waiters.remove(self)

    @classmethod
    def send_updates(cls, data):
        #if len(cls.waiters)>0:
        #    print("sending message to {0} waiters".format(len(cls.waiters)))
        for waiter in cls.waiters:
            try:
                waiter.write_message(data)
            except:
                print("Error sending message", exc_info=True)

    @classmethod
    def send_message_to_client(cls,i):
        #sd = Tibometer.Experiment.currentRecordData
        #sd = np.nan_to_num(sd)
        #data = {"time": i, "load": sd[1], "frictionforce":sd[2], "rotationrate": sd[3], "temperature": sd[4],"vibration":sd[5]}
        #cls.send_updates(convert2JSON.SocketMessageData.ToJSON(sd,None,i))#json.dumps(data))
        s = convert2JSON.SocketMessageData.ToJSON_b64(Tibometer.Experiment,None,i)
        cls.send_updates(s);
        return None

    @classmethod
    def send_state_message_to_client(cls, expState):
        cls.send_updates(json.dumps(SocketMessageData(None,expState)))
        return expState

    def on_message(self, msg):
        if msg.kind == 'message':
            self.write_message(msg.body)
        if msg.kind == 'disconnect':
            # Do not try to reconnect, just send a message back
            # to the client and close the client connection
            self.write_message('The connection terminated due to a Redis server error.')
            #self.close()
            print("got message {0}".format(msg.body))
        #parsed = tornado.escape.json_decode(message)
        #chat = {"id": str(uuid.uuid4()), "body": parsed["body"]}
        #chat["html"] = tornado.escape.to_basestring(
        #    self.render_string("message.html", message=chat)
        #)
        #ChatSocketHandler.update_cache(chat)
        #ChatSocketHandler.send_updates(chat)

class ClientApplication(tornado.web.RequestHandler):
    def get(self):
        self.write('<html><body>'
                    '<h1>Clien application</h1>'
                    '<a href="/myform">start listening sensors</a>'
                    '</body></html>')

class MyFormHandler(tornado.web.RequestHandler):
    def get(self):
        self.write('<html><body><form action="/myform" method="POST">'
                    '<input type="text" name="message">'
                    '<input type="submit" value="Submit">'
                    '</form></body></html>')

    def post(self):
        self.set_header("Content-Type", "text/plain")
        self.write("You wrote " + self.get_body_argument("message"))

class SettingsHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    
    def numberToString(self,x):
        return "{0:.4f}".format(x)
    def get(self):
        #sett?case=base
        st_case = self.get_argument("case", None, True)
        if st_case == "st":
            self.write(Tibometer.Experiment.status.getJson())
        elif st_case == "base":
            s = json.dumps(Tibometer.Experiment.Settings.settings)
            self.write(s)
        elif st_case == "rpm":
            rpm = self.get_argument("val")
            #rpm = self.get_body_argument("val")
            rpm = float(rpm)
            print("rpm:{0}".format(rpm))
            if rpm > 0:
                freq = float(rpm) / 60.0
                print("Set rotation:{0}".format(rpm))
                controls.set_speed(freq)
                controls.start()
                Tibometer.Experiment.RPM = rpm
            else:
                print("Stop rotation:{0}".format(rpm))
                controls.stop()
                Tibometer.Experiment.RPM = 0
            self.write("{0}".format(rpm))
        elif st_case == "load":
            load = self.get_argument("val")
            #load = self.get_body_argument("val")
            load = float(load)
            print("load:{0}".format(load))
            if load > 0:
                print("Laod:{0}".format(load))
                controls.P_motor(90 / 1.8,1)
                controls.P_motor(5 / 1.8,0)
            else:
                print("Laod:{0}".format(load))
                controls.P_motor(90 / 1.8,0)
                controls.P_motor(5 / 1.8,1)
            self.write("{0}".format(load))
        elif st_case == "resultfile":
            hdf = Tibometer.Experiment.DataFile.OpenRead()
            dt = hdf["data"]
            rc = sh = dt.shape[0]
            if (Tibometer.Experiment.DataFile.CurrentRecord > 0) and (rc > Tibometer.Experiment.DataFile.CurrentRecord):
                rc = Tibometer.Experiment.DataFile.CurrentRecord
            step = 1
            maxCount = 1000
            if rc > maxCount:
                step = rc // maxCount + 1
            print("rc:{0},step:{1},sh:{2}".format(rc,step,sh))
            dt = np.array(dt[:rc:step],copy=True)
            mask = np.isnan(dt)
            dt[mask] = -1;
            #"time[s], Load[Pa], FrictionForce[N], RPM[rotation per minute],
            #temperature[C], Acoustic[??]"
            time=",".join( map(self.numberToString,dt[:,0]))
            load=",".join( map(self.numberToString,dt[:,1]))
            RPM=",".join( map(self.numberToString,dt[:,3]))
            te=",".join( map(self.numberToString,dt[:,4]))
            fr=",".join( map(self.numberToString,dt[:,2]))
            s = '{"time":['+time+'], "load":['+load+'], "RPM":['+RPM+'], "temperature":['+te+'], "friction":['+fr+']}'
            self.write(s)
            #self.write(json.dumps({"time": dt[:,0].tolist(),"load": list(dt[:,1].tolist()), "RPM": list(dt[:,3].tolist()), 
            #            "temperature": list(dt[:,4].tolist()), "friction":list(dt[:,2].tolist())}))
            Tibometer.Experiment.DataFile.CloseReader(hdf)
        elif st_case == "clbr_fr":
            self.write(Tibometer.Experiment.Settings.calibrationData.friction.get_json_string())
        elif st_case == "clbr_load":
            self.write(Tibometer.Experiment.Settings.calibrationData.load.get_json_string())
        #elif st_case=="clbr_rpm":
        #    self.write(Tibometer.Experiment.Settings.calibrationData.RPM.get_json_string())
        else :
            self.write("{}")

        #self.write('<html><body><form action="/myform" method="POST">'
        #            '<input type="text" name="message">'
        #            '<input type="submit" value="Submit">'
        #            '</form></body></html>')

    def post(self):
        st_case = self.get_argument("case", None, True)
        self.set_default_headers()
        #self.set_header("Content-Type", "text/plain")
        self.set_header("Content-Type", "application/json")
        #sett?case=base
        if st_case == "base":
            #self.get_body_argument("message")
            Tibometer.Experiment.Settings.settings.update( json.loads(self.request.body))
            if Tibometer.Experiment.Settings.otputFileExists():
                Tibometer.Experiment.Settings.outputFileName=""
                Tibometer.Experiment.status.status = ExpStatus.invalid
            else:
                Tibometer.Experiment.status.status = ExpStatus.valid
            s = json.dumps(Tibometer.Experiment.Settings.settings)
            self.write(s)
            #DataSocketHandler.send_state_message_to_client(Tibometer.Experiment.status);
        elif st_case == "st":
            self.write(Tibometer.Experiment.status.getJson())
        elif st_case == "num":
            self.write(json.dumps(Tibometer.Experiment.Settings.settings))
        elif st_case == "clbr_fr":
            #xy = json.loads(self.get_body_argument("message"))
            Tibometer.Experiment.Settings.calibrationData.friction.initJSON(self.request.body)
            self.write(Tibometer.Experiment.Settings.calibrationData.friction.get_json_string())
        elif st_case == "clbr_load":
            Tibometer.Experiment.Settings.calibrationData.load.initJSON(self.request.body)
            self.write(Tibometer.Experiment.Settings.calibrationData.load.get_json_string())
        #elif st_case=="clbr_rpm":
        #    Tibometer.Experiment.Settings.calibrationData.RPM.initJSON(self.request.body)
        #    self.write(Tibometer.Experiment.Settings.calibrationData.RPM.get_json_string());
        elif st_case == "freq":
            if Tibometer.Experiment.Settings.settings.get("manual_mode"):
                freq = self.get_body_argument("val")
                Tibometer.Experiment.SetRotationFrequency(float(freq))
                self.write(json.dumps(Tibometer.Experiment.Settings.settings))
        elif st_case == "load":
            load = self.get_body_argument("load")
            Tibometer.Experiment.SetLoad(float(freq))
            self.write(json.dumps(Tibometer.Experiment.Settings.settings))
        elif st_case == "stop":
            #
            self.write("details")
        else :
            self.write("")
        #self.write("You wrote " + self.get_body_argument("message"))
class SensorDataHandler(tornado.web.RequestHandler):
    def get(self):
        self.write('<html><body>'
                    '<p>time:{0}</p>'
                    '<p>FrictionForce:{1}</p>'
                    '<p>Load:{2}</p>'
                    '<p>RPM:{3}</p>'                   
                    '</form></body></html>'.format(1,2,3,4))

    def post(self):
        self.set_header("Content-Type", "text/plain")
        #time.DateTime()
        #self.write("You wrote " + self.get_body_argument("message"))


class EndReadingHandler(tornado.web.RequestHandler):
    def get(self):
        Tibometer.EndReading()



class BeginReadingHandler(tornado.web.RequestHandler):
    #tribometer = Tibometer();
    
    def get(self):
        Tibometer.BeginReading(DataSocketHandler.send_message_to_client)

class EndWriteingHandler(tornado.web.RequestHandler):
    def get(self):
        Tibometer.EndWriteing()
        #DataSocketHandler.send_state_message_to_client(Tibometer.Experiment.status);

class BeginWritingHandler(tornado.web.RequestHandler):
    #tribometer = Tibometer();
    def get(self):
        Tibometer.BeginWriteing()
        #DataSocketHandler.send_state_message_to_client(Tibometer.Experiment.status);

class EndProgramHandler(tornado.web.RequestHandler):
    def get(self):
        Tibometer.EndProgram()

class BeginProgramHandler(tornado.web.RequestHandler):
    #tribometer = Tibometer();
    def get(self):
        Tibometer.BeginProgram()


def make_app():
    #pagePath = "c:/Calculations/Tribometer_SVN/Tribometrs/webapp/dist/"
    #import inspect
    #pagePath = os.path.join( os.path.dirname(inspect.getfile(http_server)),
    #"/webapp/dist/")
    pagePath = "c:/Calculations/Tribometer_SVN/tribometr/webapp/dist/"
    if not os.path.exists(pagePath):
        pagePath = "/home/pi/tribometer/webapp/dist/"
    res = tornado.web.Application([#(r"/a",ClientApplication),
        #(r"/myform", MyFormHandler),
        (r"/api/sett", SettingsHandler),
        (r"/api/beginr", BeginReadingHandler),
        (r"/api/endr", EndReadingHandler),
        (r"/api/beginw", BeginWritingHandler),
        (r"/api/endw", EndWriteingHandler),
        (r"/api/beginp", BeginProgramHandler),
        (r"/api/endp", EndProgramHandler),
        (r"/api/ss", DataSocketHandler),
        (r"/(.*)", tornado.web.StaticFileHandler, 
            {'default_filename': 'index.html',"path": pagePath}),])
    return res
    
def openInBrowser():
    print("start client")
    url = "http://localhost:8787"
    chrome_path = '/usr/lib/chromium-browser/chromium-browser'
    if os.path.isfile(chrome_path):
        webbrowser.get(chrome_path).open(url)
    else:
        webbrowser.open_new(url)

def main():
    asyncio = config['asyncio']
    AsyncIOMainLoop().install()
    if platform.system() != 'Windows':
        asyncio.set_event_loop_policy(tornado.platform.asyncio.AnyThreadEventLoopPolicy())
    port = os.environ.get("PORT", 8787)
    app = make_app()
    print("Starting server at port: {0}".format(port))
    app.listen(port)
    Observable.interval(2000).take(1).subscribe(lambda x:openInBrowser())
    asyncio.get_event_loop().run_forever()
    asyncio.set_event_loop(asyncio.new_event_loop())

if __name__ == '__main__':
    if checkServer():
        openInBrowser()
    else:
        print("start server")
        from tribometer import Tibometer
        import controls
        main()

#=====================
#Stop server
#=====================
#>netstat -ano|findstr 8787
##  TCP    0.0.0.0:8787           0.0.0.0:0              LISTENING       28496
##  TCP    [::]:8787              [::]:0                 LISTENING       28496
#>tskill 28496