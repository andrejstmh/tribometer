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
    constructor(
        public status: number,
        //public description: boolean,
        public VFD_on: boolean,
        public load_on: boolean,
        public stopTime: boolean,
        public stopTlim: boolean,
        public stopFlim: boolean,
        //public listening: boolean,
        //public writing: boolean,
        //public autoMode: boolean,
        //public manualMode: boolean,
       // public manualFictionForceThreshold: boolean
    ) {
    }
    copy() {
        return new trState(
            this.status,
            //this.description,
            this.VFD_on, this.load_on,
            this.stopTime, this.stopTlim, this.stopFlim,
            //this.listening, this.writing,
            //this.autoMode, this.manualMode, this.manualFictionForceTreshold
        );
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
        public log_file: string,
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
        public rpm: number,
        public load: number,
        public manual_mode: boolean,
        public program: trProgram[],
        //=================================================================
        //control parameters
        // [N]
        public friction_force_threshold: number,
        // C
        public temperature_threshold: number,
        // ?
        public vibration_threshold: number,
        // [N]
        public loadRegualtionAccuracy: number,
        // rotation per minute
        public RPMRegualtionAccuracy: number,
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
            this.log_file,
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
            this.rpm,
            this.load,
            this.manual_mode, pr,
            this.friction_force_threshold,
            this.temperature_threshold,
            this.vibration_threshold,
            this.loadRegualtionAccuracy,
            this.RPMRegualtionAccuracy,
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
        public state?: trState) { }
}

export class SocketMessageData {
    sensorData: SensorsData = null;
    state: trState = null;
    constructor(
        sm:SocketMessageDataBase64
    ) {
        this.state = sm.state;
        if (sm.sensorData) {
            this.sensorData = new SensorsData(
                this.Base64_2_float64(sm.sensorData.db),
                this.Base64_2_float64(sm.sensorData.vb),
                this.Base64_2_float64(sm.sensorData.adb),
                this.Base64_2_float64(sm.sensorData.avb),
                this.Base64_2_float64(sm.sensorData.tb)
            );
            
            //let fa = this.Base64_2_float64(sm.sensorData.db);
            //this.sensorData = new SensorsData(fa[0], fa[1], fa[2], fa[3], fa[4]);
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
                stateObj.log_file,
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
                stateObj.rpm,
                stateObj.load,
                stateObj.manual_mode, pr,
                stateObj.friction_force_threshold,
                stateObj.temperature_threshold,
                stateObj.vibration_threshold,
                stateObj.loadRegualtionAccuracy,
                stateObj.RPMRegualtionAccuracy,
                stateObj.readme
            );
        } else if (stateObj instanceof trState) {
            return new trState(
                stateObj.status,
                stateObj.VFD_on, stateObj.load_on,
                stateObj.stopTime, stateObj.stopTlim, stateObj.stopFlim);
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

