const BME280_ADDRESS = 0xEE;
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

        pause(100)

        //Set Drive Mode - modified from sparkfun
        pins.i2cWriteNumber(0x5B, 0x01, NumberFormat.UInt8LE, false)
        let current_mode = pins.i2cReadNumber(0x5B, NumberFormat.UInt8LE, false)
        current_mode &= ~(0b00000111 << 4);
        current_mode |= (4 << 4);
        let message = (0x0100 << 8) | current_mode;
        pins.i2cWriteNumber(0x5B, message, NumberFormat.UInt16BE, false);

        serial.writeLine("Drive Mode")
        serial.writeNumber(current_mode)
        serial.writeLine("")

    }

    readTempC(){
        return this.temperature;
    }

    readTempF(){
        return 0;
    }


    readFloatHumidity(){
        return this.humidity;
    }

    readFloatPressure(){
        return this.pressure;
    }

    dataAvailable(){
        return false;

    }

    readAlgorithmResults(){
        return 0;

    }

    getCO2(){
        return this.CO2;

    }

    getTVOC(){
        return this.tVOC;

    }


}