const BME280_ADDRESS = 0x77;
const BME280_DIG_T1_LSB_REG = 0x88;
const BME280_DIG_T1_MSB_REG = 0x89;
const BME280_DIG_T2_LSB_REG = 0x8A;
const BME280_DIG_T2_MSB_REG = 0x8B;
const BME280_DIG_T3_LSB_REG = 0x8C;
const BME280_DIG_T3_MSB_REG = 0x8D;
const BME280_DIG_P1_LSB_REG = 0x8E;
const BME280_DIG_P1_MSB_REG = 0x8F;
const BME280_DIG_P2_LSB_REG = 0x90;
const BME280_DIG_P2_MSB_REG = 0x91;
const BME280_DIG_P3_LSB_REG = 0x92;
const BME280_DIG_P3_MSB_REG = 0x93;
const BME280_DIG_P4_LSB_REG = 0x94;
const BME280_DIG_P4_MSB_REG = 0x95;
const BME280_DIG_P5_LSB_REG = 0x96;
const BME280_DIG_P5_MSB_REG = 0x97;
const BME280_DIG_P6_LSB_REG = 0x98;
const BME280_DIG_P6_MSB_REG = 0x99;
const BME280_DIG_P7_LSB_REG = 0x9A;
const BME280_DIG_P7_MSB_REG = 0x9B;
const BME280_DIG_P8_LSB_REG = 0x9C;
const BME280_DIG_P8_MSB_REG = 0x9D;
const BME280_DIG_P9_LSB_REG = 0x9E;
const BME280_DIG_P9_MSB_REG = 0x9F;
const BME280_DIG_H1_REG = 0xA1;
const BME280_CHIP_ID_REG = 0xD0; //Chip ID
const BME280_RST_REG = 0xE0; //Softreset Reg
const BME280_DIG_H2_LSB_REG = 0xE1;
const BME280_DIG_H2_MSB_REG = 0xE2;
const BME280_DIG_H3_REG = 0xE3;
const BME280_DIG_H4_MSB_REG = 0xE4;
const BME280_DIG_H4_LSB_REG = 0xE5;
const BME280_DIG_H5_MSB_REG = 0xE6;
const BME280_DIG_H6_REG = 0xE7;
const BME280_CTRL_HUMIDITY_REG = 0xF2; //Ctrl Humidity Reg
const BME280_STAT_REG = 0xF3; //Status Reg
const BME280_CTRL_MEAS_REG = 0xF4; //Ctrl Measure Reg
const BME280_CONFIG_REG = 0xF5; //Configuration Reg
const BME280_PRESSURE_MSB_REG = 0xF7; //Pressure MSB
const BME280_PRESSURE_LSB_REG = 0xF8; //Pressure LSB
const BME280_PRESSURE_XLSB_REG = 0xF9; //Pressure XLSB
const BME280_TEMPERATURE_MSB_REG = 0xFA; //Temperature MSB
const BME280_TEMPERATURE_LSB_REG = 0xFB; //Temperature LSB
const BME280_TEMPERATURE_XLSB_REG = 0xFC; //Temperature XLSB
const BME280_HUMIDITY_MSB_REG = 0xFD; //Humidity MSB
const BME280_HUMIDITY_LSB_REG = 0xFE; //Humidity LSB

const CCS811_ADDRESS = 0x5B;
const CCS811_STATUS = 0x00;
const CCS811_MEAS_MODE = 0x01;
const CCS811_ALG_RESULT_DATA = 0x02;
const CCS811_RAW_DATA = 0x03;
const CCS811_ENV_DATA = 0x05;
const CCS811_NTC = 0x06;
const CCS811_THRESHOLDS = 0x10;
const CCS811_BASELINE = 0x11;
const CCS811_HW_ID = 0x20;
const CCS811_HW_VERSION = 0x21;
const CCS811_FW_BOOT_VERSION = 0x23;
const CCS811_FW_APP_VERSION = 0x24;
const CCS811_ERROR_ID = 0xE0;
const CCS811_APP_START = 0xF4;
const CCS811_SW_RESET = 0xFF;


const MODE_SLEEP = 0b00;
const MODE_FORCED = 0b01;
const MODE_NORMAL = 0b11;


class Environment {

    tVOC: number = 0;
    CO2: number = 0;
    temperature: number = 0;
    pressure: number = 0;
    humidity: number = 0;

    t_fine: number;

    calibration = new SensorCalibration();
    BMErunMode: number;
    BMEtStandby: number;
    BMEfilter: number;
    BMEtempOverSample: number;
    BMEpressOverSample: number;
    BMEhumidOverSample: number;
    BMEtempCorrection: number;

    _referencePressure = 101325.0; //Default but is changeable

    constructor(){
        return;
    }

    begin(){

        pins.i2cWriteNumber(0x5B, 0xFF, NumberFormat.UInt8LE, false)
        pause(50)
        pins.i2cWriteNumber(0x5B, 0x11, NumberFormat.UInt8LE, false)
        pause(50)
        pins.i2cWriteNumber(0x5B, 0xE5, NumberFormat.UInt8LE, false)
        pause(50)
        pins.i2cWriteNumber(0x5B, 0x72, NumberFormat.UInt8LE, false)
        pause(50)
        pins.i2cWriteNumber(0x5B, 0x8A, NumberFormat.UInt8LE, false)
        pause(100)

        let temp: number = 0;

        for (let i = 0; i < 200000; i++) //Spin for a good while
        {
            temp++;
        }

        // Check Status
        pins.i2cWriteNumber(0x5B, 0x00, NumberFormat.UInt8LE, false)
        let status = pins.i2cReadNumber(0x5B, NumberFormat.UInt8LE, false)

        serial.writeLine("Status")
        serial.writeNumber(status)
        serial.writeLine("")

        //App Start
        pins.i2cWriteNumber(0x5B, 0xF4, NumberFormat.UInt8LE, false)
        serial.writeLine("CCS811 Started")

        //Set Drive Mode - modified from sparkfun
        pins.i2cWriteNumber(0x5B, 0x01, NumberFormat.UInt8LE, false)
        let current_mode = pins.i2cReadNumber(0x5B, NumberFormat.UInt8LE, false)
        current_mode &= ~(0b00000111 << 4);
        current_mode |= (4 << 4);
        let message = (0x01 << 8) | current_mode;
        pins.i2cWriteNumber(0x5B, message, NumberFormat.UInt16BE, false);

        serial.writeLine("Drive Mode")
        serial.writeNumber(current_mode)
        serial.writeLine("")

        // CCS needs 4 seconds before data is available, add pause as needed 
        // after BME init

        //BME init
        this.calibration.dig_T1 = this.getUInt16LE(0x88)
        this.calibration.dig_T2 = this.getInt16LE(0x8A)
        this.calibration.dig_T3 = this.getInt16LE(0x8C)
        this.calibration.dig_P1 = this.getUInt16LE(0x8E)
        this.calibration.dig_P2 = this.getInt16LE(0x90)
        this.calibration.dig_P3 = this.getInt16LE(0x92)
        this.calibration.dig_P4 = this.getInt16LE(0x94)
        this.calibration.dig_P5 = this.getInt16LE(0x96)
        this.calibration.dig_P6 = this.getInt16LE(0x98)
        this.calibration.dig_P7 = this.getInt16LE(0x9A)
        this.calibration.dig_P8 = this.getInt16LE(0x9C)
        this.calibration.dig_P9 = this.getInt16LE(0x9E)
        this.calibration.dig_H1 = this.getreg(0xA1)
        this.calibration.dig_H2 = this.getInt16LE(0xE1)
        this.calibration.dig_H3 = this.getreg(0xE3)
        let a = this.getreg(0xE5)
        this.calibration.dig_H4 = (this.getreg(0xE4) << 4) + (a % 16)
        this.calibration.dig_H5 = (this.getreg(0xE6) << 4) + (a >> 4)
        this.calibration.dig_H6 = this.getInt8LE(0xE7)
        this.setreg(0xF2, 0x04)
        this.setreg(0xF4, 0x2F)
        this.setreg(0xF5, 0x0C)

    }

    setreg(reg: number, dat: number): void {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = dat;
        pins.i2cWriteBuffer(BME280_ADDRESS, buf);
    }

    getreg(reg: number): number {
        pins.i2cWriteNumber(BME280_ADDRESS, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_ADDRESS, NumberFormat.UInt8BE);
    }

    getInt8LE(reg: number): number {
        pins.i2cWriteNumber(BME280_ADDRESS, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_ADDRESS, NumberFormat.Int8LE);
    }

    getUInt16LE(reg: number): number {
        pins.i2cWriteNumber(BME280_ADDRESS, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_ADDRESS, NumberFormat.UInt16LE);
    }

    getInt16LE(reg: number): number {
        pins.i2cWriteNumber(BME280_ADDRESS, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_ADDRESS, NumberFormat.Int16LE);
    }

    get(): void {
        let adc_T = (this.getreg(0xFA) << 12) + (this.getreg(0xFB) << 4) + (this.getreg(0xFC) >> 4)
        let var1 = (((adc_T >> 3) - (this.calibration.dig_T1 << 1)) * this.calibration.dig_T2) >> 11
        let var2 = (((((adc_T >> 4) - this.calibration.dig_T1) * ((adc_T >> 4) - this.calibration.dig_T1)) >> 12) * this.calibration.dig_T3) >> 14
        let t = var1 + var2
        this.temperature = Math.idiv((t * 5 + 128) >> 8, 100)
        var1 = (t >> 1) - 64000
        var2 = (((var1 >> 2) * (var1 >> 2)) >> 11) * this.calibration.dig_P6
        var2 = var2 + ((var1 * this.calibration.dig_P5) << 1)
        var2 = (var2 >> 2) + (this.calibration.dig_P4 << 16)
        var1 = (((this.calibration.dig_P3 * ((var1 >> 2) * (var1 >> 2)) >> 13) >> 3) + (((this.calibration.dig_P2) * var1) >> 1)) >> 18
        var1 = ((32768 + var1) * this.calibration.dig_P1) >> 15
        if (var1 == 0)
            return; // avoid exception caused by division by zero
        let adc_P = (this.getreg(0xF7) << 12) + (this.getreg(0xF8) << 4) + (this.getreg(0xF9) >> 4)
        let _p = ((1048576 - adc_P) - (var2 >> 12)) * 3125
        _p = Math.idiv(_p, var1) * 2;
        var1 = (this.calibration.dig_P9 * (((_p >> 3) * (_p >> 3)) >> 13)) >> 12
        var2 = (((_p >> 2)) * this.calibration.dig_P8) >> 13
        this.pressure = _p + ((var1 + var2 + this.calibration.dig_P7) >> 4)
        let adc_H = (this.getreg(0xFD) << 8) + this.getreg(0xFE)
        var1 = t - 76800
        var2 = (((adc_H << 14) - (this.calibration.dig_H4 << 20) - (this.calibration.dig_H5 * var1)) + 16384) >> 15
        var1 = var2 * (((((((var1 * this.calibration.dig_H6) >> 10) * (((var1 * this.calibration.dig_H3) >> 11) + 32768)) >> 10) + 2097152) * this.calibration.dig_H2 + 8192) >> 14)
        var2 = var1 - (((((var1 >> 15) * (var1 >> 15)) >> 7) * this.calibration.dig_H1) >> 4)
        if (var2 < 0) var2 = 0
        if (var2 > 419430400) var2 = 419430400
        this.humidity = (var2 >> 12) >> 10
    }


// --------

    dataAvailable() {
        //Check if Data is available
        pins.i2cWriteNumber(0x5B, 0x00, NumberFormat.UInt8LE, false)
        let status = pins.i2cReadNumber(0x5B, NumberFormat.UInt8LE, false)

        return (status & 1 << 3)
    }

    readAlgorithmResults() {
        serial.writeLine("Data Available");
        let address = 0x5B;
        let offset = 0x02;
        let data: number[] = [];
        pins.i2cWriteNumber(address, offset, NumberFormat.UInt8LE, false);
        this.CO2 = pins.i2cReadNumber(0x5B, NumberFormat.UInt16BE, true)
        this.tVOC = pins.i2cReadNumber(0x5B, NumberFormat.UInt16BE, false)

    }

    getCO2() {
        if (this.dataAvailable()){
            this.readAlgorithmResults();
            return this.CO2;
        } else {
            return 0;
        }

    }

    getTVOC() {
        if (this.dataAvailable()) {
            this.readAlgorithmResults();
            return this.tVOC;
        } else {
            return 0;
        }
    }

    readTempC(){
        this.get();
        return this.temperature;
    }

    readTempF(){
        this.get();
        return 32 + Math.idiv(this.temperature * 9, 5)
    }


    readFloatHumidity(){
        this.get();
        return this.humidity;
    }

    readFloatPressure(){
        this.get();
        return Math.idiv(this.pressure, 100);
    }

}



class SensorCalibration {

    dig_T1: number;
    dig_T2: number;
    dig_T3: number;

    dig_P1: number;
    dig_P2: number;
    dig_P3: number;
    dig_P4: number;
    dig_P5: number;
    dig_P6: number;
    dig_P7: number;
    dig_P8: number;
    dig_P9: number;

    dig_H1: number;
    dig_H2: number;
    dig_H3: number;
    dig_H4: number;
    dig_H5: number;
    dig_H6: number;

    constructor() {
        return;
    }
}