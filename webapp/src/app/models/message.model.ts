export const base_url = "http://localhost:8787/";
export const SERVER_URL = "ws://localhost:8787/api/ss";


export enum ExperimentStatus {
    invalid = 0, valid = 1, started = 2, completed = 3
}
export class CalibrationCurve {
    x: number[] = [];
    y: number[] = [];
}

export class trState {
    public status: number = 0;
    public VFD_on: boolean = false;
    public load_on: boolean = false;
    public stopTime: boolean = false;
    public stopTlim: boolean = false;
    public stopFlim: boolean = false;
    public rpmReg: boolean = false;
    public loadReg: boolean = false;
    public rpmRegTimedOut: boolean = false;
    public loadRegTimedOut: boolean = false;
    public rpmRegAuto: boolean = false;
    public loadRegAuto: boolean = false;
    constructor( stStr:string) {
        this.status = +stStr.charAt(0);
        this.VFD_on=stStr.charAt(1) !== "0";
        this.load_on=stStr.charAt(2) !== "0";
        this.stopTime=stStr.charAt(3) !== "0";
        this.stopTlim=stStr.charAt(4) !== "0";
        this.stopFlim=stStr.charAt(5) !== "0";
        this.rpmReg=stStr.charAt(6) !== "0";
        this.loadReg=stStr.charAt(7) !== "0";
        this.rpmRegTimedOut=stStr.charAt(8) !== "0";
        this.loadRegTimedOut = stStr.charAt(9) !== "0";
        this.rpmRegAuto = stStr.charAt(10) !== "0";
        this.loadRegAuto = stStr.charAt(11) !== "0";
    }
    toStateString() {
        return "" + this.status +
            (this.VFD_on ? "1" : "0") + (this.load_on ? "1" : "0")+
            (this.stopTime ? "1" : "0") + (this.stopTlim ? "1" : "0")+
            (this.stopFlim ? "1" : "0") + (this.rpmReg ? "1" : "0") +
            (this.loadReg ? "1" : "0") + (this.rpmRegTimedOut ? "1" : "0") + (this.loadRegTimedOut ? "1" : "0") +
            (this.rpmRegAuto ? "1" : "0") + (this.loadRegAuto ? "1" : "0");
        
    }
    copy() {
        return new trState( this.toStateString() );
    }
}

export class trProgram {
    constructor(
        public duration: number,
        public load: number,
        public RPM: number,
        public Tmax: number,
        public Fmax: number,
        public Vibrmax: number) {

    }
    copy() {
        return new trProgram(
            this.duration, this.load, this.RPM,
            this.Tmax, this.Fmax, this.Vibrmax);
    }
} 
export class trSettings {
    constructor(
        public working_directory: string,
        public user: string,
        public bearing: string,
        public output_file: string,
        public friction_force_calibration_curve_file: string,
        public load_calibration_curve_file: string,
        public rpm_calibration_curve_file: string,
        // miliseconds
        public listening_interval: number,
        // listening intervals count
        public recording_cycle: number,
        // listening intervals count
        public visualisation_cycle: number,
        // hours (manual mode)
        public total_duration: number,
        //public rpm: number,
        //public load: number,
        public export_result_to_csv: boolean,
        public manual_mode: boolean,
        public program: trProgram[],
        //=================================================================
        // optional field
        public readme: string) {
    }

    copy() {
        let pr: trProgram[] = [];
        this.program.forEach(it => { pr.push(it.copy()); })
        return new trSettings(
            this.working_directory,
            this.user,
            this.bearing,
            this.output_file,
            this.friction_force_calibration_curve_file,
            this.load_calibration_curve_file,
            this.rpm_calibration_curve_file,
            // miliseconds
            this.listening_interval,
            // listening intervals count
            this.recording_cycle,
            // listening intervals count
            this.visualisation_cycle,
            // hours (manual mode)
            this.total_duration,
            //this.rpm,this.load,
            this.export_result_to_csv,
            this.manual_mode, pr,
            //this.friction_force_threshold, this.temperature_threshold,
            this.readme
        );
    }
}

export class trTotalState {
    constructor(public settings: trSettings, public state: trState) {
    }
    copy() {
        return new trTotalState(this.settings ? this.settings.copy() : null, this.state ? this.state.copy() : null);
    }
}

export class trResultBase64FileData {
    constructor(
        public time: string,
        public load: string,
        public RPM: string,
        public temperature: string,
        public friction: string) {
    }
}

export class trResultFileData {
    time: number[] = [];
    load: number[] = [];
    RPM: number[] = [];
    temperature: number[] = [];
    friction: number[] = [];
    constructor(res:trResultBase64FileData
    ) {
        if (res) {
            this.time = this.Base64_2_float32(res.time);
            this.load = this.Base64_2_float32(res.load);
            this.RPM = this.Base64_2_float32(res.RPM);
            this.temperature = this.Base64_2_float32(res.temperature);
            this.friction = this.Base64_2_float32(res.friction);
        }
    }
    Base64_2_float32(b64str: string) {
        let bs = atob(b64str);
        let rawLength = bs.length;
        //let ab = new ArrayBuffer(rawLength);
        let ab = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; i++) {
            ab[i] = bs.charCodeAt(i);
        }
        //let fa = new Float64Array(ab.buffer,0,5);
        let fa = new Float32Array(ab.buffer);
        let res: number[] = [];
        fa.forEach(x => res.push(x));
        return res;
    }
}

//export class SensorsData {
//    constructor(
//        public time: number,
//        public temperature?: number,
//        public rotationrate?: number,
//        public load?: number,
//        public frictionforce?: number) { }
//}

export class SensorsDataBase64 {
    constructor(
        public db?: string,
        public vb?: string,
        public adb?: string,
        public avb?: string,
        public tb?: string) { }
}

export class SensorsData{
    constructor(
        public db?: Float64Array,
        public vb?: Float64Array,
        public adb?: Float64Array,
        public avb?: Float64Array,
        public tb?: Float64Array) { }
}

export class SocketMessageDataBase64 {
    constructor(
        public sensorData?: SensorsDataBase64,
        public state?: string) { }
}

export class SocketMessageData {
    sensorData: SensorsData = null;
    state: trState = null;
    constructor(
        sm:SocketMessageDataBase64
    ) {
        this.state = sm.state? new trState(sm.state):null;
        if (sm.sensorData) {
            this.sensorData = new SensorsData(
                this.Base64_2_float64(sm.sensorData.db),
                this.Base64_2_float64(sm.sensorData.vb),
                this.Base64_2_float64(sm.sensorData.adb),
                this.Base64_2_float64(sm.sensorData.avb),
                this.Base64_2_float64(sm.sensorData.tb)
            );
        } else {
            this.sensorData = null;
        }
        
    }

    Base64_2_float64(b64str: string) {
        let bs = atob(b64str);
        let rawLength = bs.length;
        //let ab = new ArrayBuffer(rawLength);
        let ab = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; i++) {
            ab[i] = bs.charCodeAt(i);
        }
        //let fa = new Float64Array(ab.buffer,0,5);
        return new Float64Array(ab.buffer);
    }
}

export class ObjHelper {
    static DeepCopyOfState(stateObj: trTotalState | trSettings | trState | trProgram) {
        if (!stateObj) {
            return null;
        } else if (stateObj instanceof trTotalState) {
            return new trTotalState(ObjHelper.DeepCopyOfState(stateObj.settings), ObjHelper.DeepCopyOfState(stateObj.state));
        } else if (stateObj instanceof trSettings) {
            let pr: trProgram[] = [];
            stateObj.program.forEach(it => { pr.push(ObjHelper.DeepCopyOfState(it)); })
            return new trSettings(
                stateObj.working_directory,
                stateObj.user,
                stateObj.bearing,
                stateObj.output_file,
                stateObj.friction_force_calibration_curve_file,
                stateObj.load_calibration_curve_file,
                stateObj.rpm_calibration_curve_file,
                // miliseconds
                stateObj.listening_interval,
                // listening intervals count
                stateObj.recording_cycle,
                // listening intervals count
                stateObj.visualisation_cycle,
                // hours (manual mode)
                stateObj.total_duration,
                //stateObj.rpm,  stateObj.load,
                stateObj.export_result_to_csv,
                stateObj.manual_mode, pr,
                stateObj.readme
            );
        } else if (stateObj instanceof trState) {
            return new trState(stateObj.toStateString());
        } else if (stateObj instanceof trProgram) {
            return new trProgram(
                stateObj.duration, stateObj.load, stateObj.RPM,
                stateObj.Tmax, stateObj.Fmax, stateObj.Vibrmax);

        } else {
            return JSON.parse(JSON.stringify(stateObj));
        }
    }
    static printNumVal(v: any) {
        let vv = +v
        if (vv) { return isNaN(v) ? "-" : v.toFixed(3) } else { return "" + v; }
    }
}

