gatorEnvironment.beginEnvironment()
basic.forever(function () {
    serial.writeLine("Temp: ");
    serial.writeNumber(gatorEnvironment.getMeasurement(measurementType.degreesC));
    serial.writeLine("")

    serial.writeLine("Humidity: ");
    serial.writeNumber(gatorEnvironment.getMeasurement(measurementType.humidity));
    serial.writeLine("")

    serial.writeLine("Pressure: ");
    serial.writeNumber(gatorEnvironment.getMeasurement(measurementType.pressure));
    serial.writeLine("")

    serial.writeLine("eCO2: ");
    serial.writeNumber(gatorEnvironment.getMeasurement(measurementType.eCO2));
    serial.writeLine("")

    serial.writeLine("TVOC: ");
    serial.writeNumber(gatorEnvironment.getMeasurement(measurementType.TVOC));
    serial.writeLine("")
	
})
